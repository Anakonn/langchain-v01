---
translated: true
---

# Javelin AI Gateway チュートリアル

このJupyter Notebookでは、Python SDKを使ってJavelin AI Gatewayとやり取りする方法を探ります。
Javelin AI Gatewayは、OpenAI、Cohere、Anthropicなどの大規模言語モデル(LLM)を活用するための安全で統一されたエンドポイントを提供します。
このゲートウェイ自体は、モデルを体系的に展開し、アクセスセキュリティ、ポリシー、コストガードレールをエンタープライズ向けに提供するための集中メカニズムを提供します。

Javelinのすべての機能とメリットの完全なリストについては、www.getjavelin.ioをご覧ください。

## ステップ1: 概要

[Javelin AI Gateway](https://www.getjavelin.io)は、AI アプリケーション向けのエンタープライズグレードのAPIゲートウェイです。堅牢なアクセスセキュリティを統合し、大規模言語モデルとの安全なやり取りを保証します。[公式ドキュメンテーション](https://docs.getjavelin.io)で詳細をご確認ください。

## ステップ2: インストール

始める前に、`javelin_sdk`をインストールし、Javelin APIキーを環境変数として設定する必要があります。

```python
pip install 'javelin_sdk'
```

```output
Requirement already satisfied: javelin_sdk in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (0.1.8)
Requirement already satisfied: httpx<0.25.0,>=0.24.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (0.24.1)
Requirement already satisfied: pydantic<2.0.0,>=1.10.7 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (1.10.12)
Requirement already satisfied: certifi in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (2023.5.7)
Requirement already satisfied: httpcore<0.18.0,>=0.15.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (0.17.3)
Requirement already satisfied: idna in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (3.4)
Requirement already satisfied: sniffio in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (1.3.0)
Requirement already satisfied: typing-extensions>=4.2.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from pydantic<2.0.0,>=1.10.7->javelin_sdk) (4.7.1)
Requirement already satisfied: h11<0.15,>=0.13 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (0.14.0)
Requirement already satisfied: anyio<5.0,>=3.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (3.7.1)
Note: you may need to restart the kernel to use updated packages.
```

## ステップ3: 補完の例

このセクションでは、Javelin AI Gatewayと連携して大規模言語モデルから補完を取得する方法を示します。以下のPythonスクリプトがその例です:
(注) 'eng_dept03'というルートをゲートウェイに設定しているものとします。

```python
from langchain.chains import LLMChain
from langchain_community.llms import JavelinAIGateway
from langchain_core.prompts import PromptTemplate

route_completions = "eng_dept03"

gateway = JavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route=route_completions,
    model_name="gpt-3.5-turbo-instruct",
)

prompt = PromptTemplate("Translate the following English text to French: {text}")

llmchain = LLMChain(llm=gateway, prompt=prompt)
result = llmchain.run("podcast player")

print(result)
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[6], line 2
      1 from langchain.chains import LLMChain
----> 2 from langchain.llms import JavelinAIGateway
      3 from langchain.prompts import PromptTemplate
      5 route_completions = "eng_dept03"

ImportError: cannot import name 'JavelinAIGateway' from 'langchain.llms' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/llms/__init__.py)
```

# ステップ4: 埋め込みの例

このセクションでは、Javelin AI Gatewayを使ってテキストクエリとドキュメントの埋め込みを取得する方法を示します。以下のPythonスクリプトがその例です:
(注) 'embeddings'というルートをゲートウェイに設定しているものとします。

```python
from langchain_community.embeddings import JavelinAIGatewayEmbeddings

embeddings = JavelinAIGatewayEmbeddings(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="embeddings",
)

print(embeddings.embed_query("hello"))
print(embeddings.embed_documents(["hello"]))
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[9], line 1
----> 1 from langchain.embeddings import JavelinAIGatewayEmbeddings
      2 from langchain.embeddings.openai import OpenAIEmbeddings
      4 embeddings = JavelinAIGatewayEmbeddings(
      5     gateway_uri="http://localhost:8000", # replace with service URL or host/port of Javelin
      6     route="embeddings",
      7 )

ImportError: cannot import name 'JavelinAIGatewayEmbeddings' from 'langchain.embeddings' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/embeddings/__init__.py)
```

# ステップ5: チャットの例

このセクションでは、Javelin AI Gatewayと連携して大規模言語モデルとチャットする方法を示します。以下のPythonスクリプトがその例です:
(注) 'mychatbot_route'というルートをゲートウェイに設定しているものとします。

```python
from langchain_community.chat_models import ChatJavelinAIGateway
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Artificial Intelligence has the power to transform humanity and make the world a better place"
    ),
]

chat = ChatJavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="mychatbot_route",
    model_name="gpt-3.5-turbo",
    params={"temperature": 0.1},
)

print(chat(messages))
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[8], line 1
----> 1 from langchain.chat_models import ChatJavelinAIGateway
      2 from langchain.schema import HumanMessage, SystemMessage
      4 messages = [
      5     SystemMessage(
      6         content="You are a helpful assistant that translates English to French."
   (...)
     10     ),
     11 ]

ImportError: cannot import name 'ChatJavelinAIGateway' from 'langchain.chat_models' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/chat_models/__init__.py)
```

ステップ6: 結論
このチュートリアルでは、Javelin AI Gatewayを紹介し、Python SDKを使ってそれとやり取りする方法を示しました。
詳細な例については[Python SDK](https://www.github.com/getjavelin.io/javelin-python)を、追加情報については公式ドキュメンテーションを参照してください。

Happy coding!
