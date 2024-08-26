---
translated: true
---

<a href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/chat/maritalk.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

# Maritalk

## はじめに

MariTalkは、ブラジルの企業[Maritaca AI](https://www.maritaca.ai)が開発したアシスタントです。
MariTalkは、ポルトガル語を十分に理解するように特別に訓練された言語モデルに基づいています。

このノートブックでは、2つの例を通してLangChainでMariTalkを使う方法を示します:

1. MariTalkを使ってタスクを実行する簡単な例。
2. LLM + RAG: 2番目の例では、トークン制限内に収まらない長い文書の中から答えを見つける方法を示します。これには、簡単な検索システム(BM25)を使って最も関連性の高いセクションを検索し、それをMariTalkに入力して答えを得る方法を使います。

## インストール

まず、以下のコマンドを使ってLangChainライブラリ(およびその依存関係)をインストールします:

```python
!pip install langchain langchain-core langchain-community httpx
```

## APIキー

chat.maritaca.ai("Chaves da API"セクション)から取得できるAPIキーが必要です。

### 例1 - ペット名の提案

ChatMaritalkの言語モデルを定義し、APIキーを設定しましょう。

```python
from langchain_community.chat_models import ChatMaritalk
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate

llm = ChatMaritalk(
    model="sabia-2-medium",  # Available models: sabia-2-small and sabia-2-medium
    api_key="",  # Insert your API key here
    temperature=0.7,
    max_tokens=100,
)

output_parser = StrOutputParser()

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an assistant specialized in suggesting pet names. Given the animal, you must suggest 4 names.",
        ),
        ("human", "I have a {animal}"),
    ]
)

chain = chat_prompt | llm | output_parser

response = chain.invoke({"animal": "dog"})
print(response)  # should answer something like "1. Max\n2. Bella\n3. Charlie\n4. Rocky"
```

### ストリーミング生成

長文の記事作成や大規模な文書翻訳など、長文の生成を伴うタスクでは、完全な文章を待つのではなく、生成されるテキストを部分的に受け取る方が有利です。これにより、アプリケーションがより応答的で効率的になります。これに対応するため、同期と非同期の2つのアプローチを提供しています。

#### 同期:

```python
from langchain_core.messages import HumanMessage

messages = [HumanMessage(content="Suggest 3 names for my dog")]

for chunk in llm.stream(messages):
    print(chunk.content, end="", flush=True)
```

#### 非同期:

```python
from langchain_core.messages import HumanMessage


async def async_invoke_chain(animal: str):
    messages = [HumanMessage(content=f"Suggest 3 names for my {animal}")]
    async for chunk in llm._astream(messages):
        print(chunk.message.content, end="", flush=True)


await async_invoke_chain("dog")
```

### 例2 - RAG + LLM: UNICAMP 2024入学試験問題回答システム

このサンプルでは、いくつかの追加ライブラリをインストールする必要があります:

```python
!pip install unstructured rank_bm25 pdf2image pdfminer-six pikepdf pypdf unstructured_inference fastapi kaleido uvicorn "pillow<10.1.0" pillow_heif -q
```

#### データベースの読み込み

最初のステップは、通知からの情報でデータベースを作成することです。そのために、COMVEST Webサイトから通知をダウンロードし、抽出したテキストを500文字ごとのウィンドウに分割します。

```python
from langchain.document_loaders import OnlinePDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Loading the COMVEST 2024 notice
loader = OnlinePDFLoader(
    "https://www.comvest.unicamp.br/wp-content/uploads/2023/10/31-2023-Dispoe-sobre-o-Vestibular-Unicamp-2024_com-retificacao.pdf"
)
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=100, separators=["\n", " ", ""]
)
texts = text_splitter.split_documents(data)
```

#### 検索システムの作成

データベースができたので、次は検索システムが必要です。この例では、シンプルなBM25を検索システムとして使用しますが、他の検索システム(埋め込みによる検索など)に置き換えることもできます。

```python
from langchain.retrievers import BM25Retriever

retriever = BM25Retriever.from_documents(texts)
```

#### 検索システムとLLMの組み合わせ

検索システムができたので、タスクを指定するプロンプトを実装し、チェーンを呼び出すだけです。

```python
from langchain.chains.question_answering import load_qa_chain

prompt = """Baseado nos seguintes documentos, responda a pergunta abaixo.

{context}

Pergunta: {query}
"""

qa_prompt = ChatPromptTemplate.from_messages([("human", prompt)])

chain = load_qa_chain(llm, chain_type="stuff", verbose=True, prompt=qa_prompt)

query = "Qual o tempo máximo para realização da prova?"

docs = retriever.invoke(query)

chain.invoke(
    {"input_documents": docs, "query": query}
)  # Should output something like: "O tempo máximo para realização da prova é de 5 horas."
```
