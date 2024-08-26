---
sidebar_position: 7
translated: true
---

# 고빈도 범주형 변수 처리

쿼리 분석을 통해 범주형 열에 대한 필터를 생성하고 싶을 수 있습니다. 여기서의 어려움 중 하나는 보통 정확한 범주형 값을 지정해야 한다는 점입니다. LLM이 정확히 그 범주형 값을 생성하도록 해야 합니다. 유효한 값이 몇 개만 있는 경우에는 프롬프트로 비교적 쉽게 해결할 수 있지만, 유효한 값의 수가 많은 경우에는 이러한 값들이 LLM의 컨텍스트에 맞지 않거나, 너무 많아서 LLM이 적절히 처리하기 어려울 수 있습니다.

이 노트북에서는 이 문제를 해결하는 방법을 살펴보겠습니다.

## 설정

#### 종속성 설치

```python
# %pip install -qU langchain langchain-community langchain-openai faker langchain-chroma

```

#### 환경 변수 설정

이 예제에서는 OpenAI를 사용합니다:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# 선택 사항, LangSmith로 실행 추적을 위해 주석 해제. 여기서 가입하세요: https://smith.langchain.com.

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

#### 데이터 설정

많은 가짜 이름을 생성해 보겠습니다.

```python
from faker import Faker

fake = Faker()

names = [fake.name() for _ in range(10000)]
```

이름을 몇 개 확인해보겠습니다.

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

## 쿼리 분석

기본적인 쿼리 분석을 설정할 수 있습니다.

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

이름을 정확히 맞춘 경우에는 잘 동작하는 것을 볼 수 있습니다.

```python
query_analyzer.invoke("what are books about aliens by Jesse Knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

문제는 필터링하고자 하는 값이 정확히 맞지 않을 때 발생할 수 있습니다.

```python
query_analyzer.invoke("what are books about aliens by jess knight")
```

```output
Search(query='books about aliens', author='Jess Knight')
```

### 모든 값을 추가하기

한 가지 해결 방법은 프롬프트에 모든 가능한 값을 추가하는 것입니다. 이는 일반적으로 쿼리를 올바른 방향으로 안내합니다.

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

하지만... 범주형 목록이 충분히 길면 오류가 발생할 수 있습니다!

```python
try:
    res = query_analyzer_all.invoke("what are books about aliens by jess knight")
except Exception as e:
    print(e)
```

```output
Error code: 400 - {'error': {'message': "This model's maximum context length is 16385 tokens. However, your messages resulted in 33885 tokens (33855 in the messages, 30 in the functions). Please reduce the length of the messages or functions.", 'type': 'invalid_request_error', 'param': 'messages', 'code': 'context_length_exceeded'}}
```

더 긴 컨텍스트 창을 사용하려고 시도할 수 있지만, 너무 많은 정보가 포함되어 있어 이를 적절히 처리하지 못할 가능성이 있습니다.

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

### 관련 값을 모두 찾기

대신 관련 값을 인덱스에 생성한 후, 해당 값을 N개 검색하는 방법을 사용할 수 있습니다.

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

### 선택 후 대체

또 다른 방법은 LLM이 어떤 값을 채우도록 한 다음, 해당 값을 유효한 값으로 변환하는 것입니다. 이는 실제로 Pydantic 클래스 자체로도 가능합니다!

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