---
sidebar_position: 2
translated: true
---

# 仮想文書エンベディング

類似検索ベースのインデックス、たとえばベクトルストアで作業している場合、生の質問を検索しても上手くいかない可能性があります。なぜなら、それらのエンベディングは関連文書のエンベディングとあまり似ていないかもしれないからです。代わりに、関連性の高い仮想文書を生成し、それを使って類似検索を行うと良いかもしれません。これが[仮想文書エンベディング (HyDE)](https://arxiv.org/pdf/2212.10496.pdf)の中心的なアイデアです。

LangChain YouTubeビデオに対するQ&Aボットのために、仮想文書を使った検索を行う方法を見ていきましょう。

## セットアップ

#### 依存関係のインストール

```python
# %pip install -qU langchain langchain-openai
```

#### 環境変数の設定

この例ではOpenAIを使用します:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 仮想文書の生成

結局のところ、関連性の高い仮想文書を生成するのは、ユーザーの質問に答えようとすることに帰着します。LangChainのYouTubeビデオに対するQ&Aボットを設計しているので、LangChainについての基本的なコンテキストを提供し、より堅苦しいスタイルでモデルにプロンプトを与えて、より現実的な仮想文書を得るようにします:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert about a set of software for building LLM-powered applications called LangChain, LangGraph, LangServe, and LangSmith.

LangChain is a Python framework that provides a large set of integrations that can easily be composed to build LLM applications.
LangGraph is a Python package built on top of LangChain that makes it easy to build stateful, multi-actor LLM applications.
LangServe is a Python package built on top of LangChain that makes it easy to deploy a LangChain application as a REST API.
LangSmith is a platform that makes it easy to trace and test LLM applications.

Answer the user question as best you can. Answer as though you were writing a tutorial that addressed the user question."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
qa_no_context = prompt | llm | StrOutputParser()
```

```python
answer = qa_no_context.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
print(answer)
```

```output
To use multi-modal models in a chain and turn the chain into a REST API, you can leverage the capabilities of LangChain, LangGraph, and LangServe. Here's a step-by-step guide on how to achieve this:

1. **Building a Multi-Modal Model with LangChain**:
   - Start by defining your multi-modal model using LangChain. LangChain provides integrations with various deep learning frameworks like TensorFlow, PyTorch, and Hugging Face Transformers, making it easy to incorporate different modalities such as text, images, and audio.
   - You can create separate components for each modality and then combine them in a chain to build a multi-modal model.

2. **Building a Stateful, Multi-Actor Application with LangGraph**:
   - Once you have your multi-modal model defined in LangChain, you can use LangGraph to build a stateful, multi-actor application around it.
   - LangGraph allows you to define actors that interact with each other and maintain state, which is useful for handling multi-modal inputs and outputs in a chain.

3. **Deploying the Chain as a REST API with LangServe**:
   - After building your multi-modal model and application using LangChain and LangGraph, you can deploy the chain as a REST API using LangServe.
   - LangServe simplifies the process of exposing your LangChain application as a REST API, allowing you to easily interact with your multi-modal model through HTTP requests.

4. **Testing and Tracing with LangSmith**:
   - To ensure the reliability and performance of your multi-modal model and REST API, you can use LangSmith for testing and tracing.
   - LangSmith provides tools for tracing the execution of your LLM applications and running tests to validate their functionality.

By following these steps and leveraging the capabilities of LangChain, LangGraph, LangServe, and LangSmith, you can effectively use multi-modal models in a chain and turn the chain into a REST API.
```

## 仮想文書と元の質問の返却

再現率を高めるために、仮想文書と元の質問の両方に基づいて文書を検索したい場合があります。以下のように簡単に両方を返すことができます:

```python
from langchain_core.runnables import RunnablePassthrough

hyde_chain = RunnablePassthrough.assign(hypothetical_document=qa_no_context)

hyde_chain.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
{'question': 'how to use multi-modal models in a chain and turn chain into a rest api',
 'hypothetical_document': "To use multi-modal models in a chain and turn the chain into a REST API, you can leverage the capabilities of LangChain, LangGraph, and LangServe. Here's a step-by-step guide on how to achieve this:\n\n1. **Set up your multi-modal models**: First, you need to create or import your multi-modal models. These models can include text, image, audio, or any other type of data that you want to process in your LLM application.\n\n2. **Build your LangGraph application**: Use LangGraph to build a stateful, multi-actor LLM application that incorporates your multi-modal models. LangGraph allows you to define the flow of data and interactions between different components of your application.\n\n3. **Integrate your models in LangChain**: LangChain provides integrations for various types of models and data sources. You can easily integrate your multi-modal models into your LangGraph application using LangChain's capabilities.\n\n4. **Deploy your LangChain application as a REST API using LangServe**: Once you have built your multi-modal LLM application using LangGraph and LangChain, you can deploy it as a REST API using LangServe. LangServe simplifies the process of exposing your LangChain application as a web service, making it accessible to other applications and users.\n\n5. **Test and trace your application using LangSmith**: Finally, you can use LangSmith to trace and test your multi-modal LLM application. LangSmith provides tools for monitoring the performance of your application, debugging any issues, and ensuring that it functions as expected.\n\nBy following these steps and leveraging the capabilities of LangChain, LangGraph, LangServe, and LangSmith, you can effectively use multi-modal models in a chain and turn the chain into a REST API."}
```

## 関数呼び出しを使った構造化された出力の取得

この手法を他のクエリ分析手法と組み合わせる場合、関数呼び出しを使って構造化されたクエリオブジェクトを取得するのが良いでしょう。HyDEでも関数呼び出しを使うことができます:

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.pydantic_v1 import BaseModel, Field


class Query(BaseModel):
    answer: str = Field(
        ...,
        description="Answer the user question as best you can. Answer as though you were writing a tutorial that addressed the user question.",
    )


system = """You are an expert about a set of software for building LLM-powered applications called LangChain, LangGraph, LangServe, and LangSmith.

LangChain is a Python framework that provides a large set of integrations that can easily be composed to build LLM applications.
LangGraph is a Python package built on top of LangChain that makes it easy to build stateful, multi-actor LLM applications.
LangServe is a Python package built on top of LangChain that makes it easy to deploy a LangChain application as a REST API.
LangSmith is a platform that makes it easy to trace and test LLM applications."""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm_with_tools = llm.bind_tools([Query])
hyde_chain = prompt | llm_with_tools | PydanticToolsParser(tools=[Query])
hyde_chain.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[Query(answer='To use multi-modal models in a chain and turn the chain into a REST API, you can follow these steps:\n\n1. Use LangChain to build your multi-modal model by integrating different modalities such as text, image, and audio.\n2. Utilize LangGraph, a Python package built on top of LangChain, to create a stateful, multi-actor LLM application that can handle interactions between different modalities.\n3. Once your multi-modal model is built using LangChain and LangGraph, you can deploy it as a REST API using LangServe, another Python package that simplifies the process of creating REST APIs from LangChain applications.\n4. Use LangSmith to trace and test your multi-modal model to ensure its functionality and performance.\n\nBy following these steps, you can effectively use multi-modal models in a chain and turn the chain into a REST API.')]
```
