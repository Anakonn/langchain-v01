---
translated: true
---

# Javelin AI Gateway 튜토리얼

이 Jupyter Notebook은 Python SDK를 사용하여 Javelin AI Gateway와 상호 작용하는 방법을 탐색합니다.
Javelin AI Gateway는 OpenAI, Cohere, Anthropic 등과 같은 대규모 언어 모델(LLM)을 활용할 수 있도록 안전하고 통합된 엔드포인트를 제공합니다.
게이트웨이 자체는 체계적으로 모델을 배포하고, 액세스 보안, 정책 및 비용 가이드라인을 제공하는 중앙 집중식 메커니즘을 제공합니다.

Javelin의 모든 기능과 이점에 대한 전체 목록은 www.getjavelin.io를 방문하십시오.

## 1단계: 소개

[Javelin AI Gateway](https://www.getjavelin.io)는 AI 애플리케이션을 위한 엔터프라이즈 수준의 API 게이트웨이입니다. 강력한 액세스 보안을 통합하여 대규모 언어 모델과의 안전한 상호 작용을 보장합니다. [공식 문서](https://docs.getjavelin.io)에서 자세히 알아보세요.

## 2단계: 설치

시작하기 전에 `javelin_sdk`를 설치하고 Javelin API 키를 환경 변수로 설정해야 합니다.

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

## 3단계: 완성 예제

이 섹션에서는 Javelin AI Gateway와 상호 작용하여 대규모 언어 모델에서 완성을 얻는 방법을 보여줍니다. 다음은 이를 보여주는 Python 스크립트입니다:
(참고) 게이트웨이에 'eng_dept03'이라는 경로를 설정했다고 가정합니다.

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

# 4단계: 임베딩 예제

이 섹션에서는 Javelin AI Gateway를 사용하여 텍스트 쿼리와 문서에 대한 임베딩을 얻는 방법을 보여줍니다. 다음은 이를 보여주는 Python 스크립트입니다:
(참고) 게이트웨이에 'embeddings'라는 경로를 설정했다고 가정합니다.

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

# 5단계: 채팅 예제

이 섹션에서는 Javelin AI Gateway와 상호 작용하여 대규모 언어 모델과 채팅하는 방법을 보여줍니다. 다음은 이를 보여주는 Python 스크립트입니다:
(참고) 게이트웨이에 'mychatbot_route'라는 경로를 설정했다고 가정합니다.

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

6단계: 결론
이 튜토리얼에서는 Javelin AI Gateway를 소개하고 Python SDK를 사용하여 상호 작용하는 방법을 보여주었습니다.
Javelin [Python SDK](https://www.github.com/getjavelin.io/javelin-python)에서 더 많은 예제를 확인하고 공식 문서를 탐색하여 추가 정보를 확인하세요.

행복한 코딩!
