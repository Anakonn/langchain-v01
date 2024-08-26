---
sidebar_position: 7
translated: true
---

# 高基数カテゴリカルを扱う

カテゴリカルな列でクエリ分析を行い、フィルターを作成したい場合があります。ここでの難しさは、通常、正確なカテゴリカル値を指定する必要があることです。問題は、LLMがそのカテゴリカル値を正確に生成することを確認する必要があることです。これは、有効な値が少数の場合、プロンプティングで比較的簡単に行うことができます。有効な値が多数ある場合は、それらの値がLLMのコンテキストに収まらない可能性があるため、より困難になります。また、収まる場合でも、LLMが適切に注意を払えない可能性があります。

このノートブックでは、この問題にどのように取り組むかを見ていきます。

## セットアップ

#### 依存関係のインストール

```python
# %pip install -qU langchain langchain-community langchain-openai faker langchain-chroma
```

#### 環境変数の設定

この例では OpenAI を使用します:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

#### データのセットアップ

たくさんの架空の名前を生成します

```python
from faker import Faker

fake = Faker()

names = [fake.name() for _ in range(10000)]
```

いくつかの名前を見てみましょう

```python
names[0]
```

```output
'Hayley Gonzalez'
```

```python
names[567]
```

```output
'Jesse Knight'
```

## クエリ分析

ベースラインのクエリ分析を設定できます

```python
from langchain_core.pydantic_v1 import BaseModel, Field
```

```python
class Search(BaseModel):
    query: str
    author: str
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """Generate a relevant search query for a library system"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

名前を完全に正しく綴れば、それを適切に処理できることがわかります

```python
query_analyzer.invoke("what are books about aliens by Jesse Knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

問題は、フィルターしたい値が正確に綴られていない可能性があることです

```python
query_analyzer.invoke("what are books about aliens by jess knight")
```

```output
Search(query='books about aliens', author='Jess Knight')
```

### すべての値を追加する

これを回避する1つの方法は、すべての可能な値をプロンプトに追加することです。これにより、クエリの方向性が概ね正しくなります

```python
system = """Generate a relevant search query for a library system.

`author` attribute MUST be one of:

{authors}

Do NOT hallucinate author name!"""
base_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
prompt = base_prompt.partial(authors=", ".join(names))
```

```python
query_analyzer_all = {"question": RunnablePassthrough()} | prompt | structured_llm
```

ただし...カテゴリカルの一覧が長すぎると、エラーが発生する可能性があります

```python
try:
    res = query_analyzer_all.invoke("what are books about aliens by jess knight")
except Exception as e:
    print(e)
```

```output
Error code: 400 - {'error': {'message': "This model's maximum context length is 16385 tokens. However, your messages resulted in 33885 tokens (33855 in the messages, 30 in the functions). Please reduce the length of the messages or functions.", 'type': 'invalid_request_error', 'param': 'messages', 'code': 'context_length_exceeded'}}
```

コンテキストウィンドウを長くすることを試みることができますが、そこに多くの情報が含まれているため、確実に拾えるとは限りません

```python
llm_long = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)
structured_llm_long = llm_long.with_structured_output(Search)
query_analyzer_all = {"question": RunnablePassthrough()} | prompt | structured_llm_long
```

```python
query_analyzer_all.invoke("what are books about aliens by jess knight")
```

```output
Search(query='aliens', author='Kevin Knight')
```

### 関連するすべての値を見つける

代わりに、関連する値にインデックスを作成し、それを照会して最も関連性の高いN個の値を取得することができます。

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(names, embeddings, collection_name="author_names")
```

```python
def select_names(question):
    _docs = vectorstore.similarity_search(question, k=10)
    _names = [d.page_content for d in _docs]
    return ", ".join(_names)
```

```python
create_prompt = {
    "question": RunnablePassthrough(),
    "authors": select_names,
} | base_prompt
```

```python
query_analyzer_select = create_prompt | structured_llm
```

```python
create_prompt.invoke("what are books by jess knight")
```

```output
ChatPromptValue(messages=[SystemMessage(content='Generate a relevant search query for a library system.\n\n`author` attribute MUST be one of:\n\nJesse Knight, Kelly Knight, Scott Knight, Richard Knight, Andrew Knight, Katherine Knight, Erica Knight, Ashley Knight, Becky Knight, Kevin Knight\n\nDo NOT hallucinate author name!'), HumanMessage(content='what are books by jess knight')])
```

```python
query_analyzer_select.invoke("what are books about aliens by jess knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

### 選択後に置換する

別の方法は、LLMに任意の値を入力させ、その値を有効な値に変換することです。
これは、Pydanticクラス自体で行うことができます!

```python
from langchain_core.pydantic_v1 import validator


class Search(BaseModel):
    query: str
    author: str

    @validator("author")
    def double(cls, v: str) -> str:
        return vectorstore.similarity_search(v, k=1)[0].page_content
```

```python
system = """Generate a relevant search query for a library system"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
corrective_structure_llm = llm.with_structured_output(Search)
corrective_query_analyzer = (
    {"question": RunnablePassthrough()} | prompt | corrective_structure_llm
)
```

```python
corrective_query_analyzer.invoke("what are books about aliens by jes knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

```python
# TODO: show trigram similarity
```
