---
sidebar_position: 2
translated: true
---

# 가설 문서 임베딩

유사성 검색 기반 인덱스(벡터 저장소 등)를 사용하는 경우, 원시 질문을 검색하는 것이 관련 문서의 임베딩과 매우 유사하지 않을 수 있기 때문에 잘 작동하지 않을 수 있습니다. 대신 모델이 가설적인 관련 문서를 생성하고 이를 사용하여 유사성 검색을 수행하는 것이 도움이 될 수 있습니다. 이것이 [Hypothetical Document Embedding (HyDE)](https://arxiv.org/pdf/2212.10496.pdf)의 핵심 아이디어입니다.

LangChain YouTube 동영상에 대한 Q&A 봇을 위해 가설 문서를 통한 검색을 수행하는 방법을 살펴보겠습니다.

## 설정

#### 종속성 설치

```python
# %pip install -qU langchain langchain-openai

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

## 가설 문서 생성

결국 관련 가설 문서를 생성하는 것은 사용자 질문에 답하려는 시도로 귀결됩니다. LangChain YouTube 동영상을 위한 Q&A 봇을 설계하고 있기 때문에 LangChain에 대한 기본적인 컨텍스트를 제공하고, 모델이 더 현실적인 가설 문서를 생성할 수 있도록 보다 세밀한 스타일을 사용하도록 프롬프트를 작성할 것입니다:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """당신은 LangChain, LangGraph, LangServe 및 LangSmith라는 LLM 기반 응용 프로그램을 구축하는 소프트웨어에 대한 전문가입니다.

LangChain은 LLM 응용 프로그램을 쉽게 구축할 수 있는 다양한 통합 기능을 제공하는 Python 프레임워크입니다.
LangGraph는 상태를 유지하고 다중 행위자 LLM 응용 프로그램을 쉽게 구축할 수 있도록 LangChain 위에 구축된 Python 패키지입니다.
LangServe는 LangChain 응용 프로그램을 REST API로 쉽게 배포할 수 있도록 LangChain 위에 구축된 Python 패키지입니다.
LangSmith는 LLM 응용 프로그램을 추적하고 테스트하는 것을 쉽게 만드는 플랫폼입니다.

사용자 질문에 최대한 잘 답변하십시오. 사용자 질문을 다루는 튜토리얼을 작성하는 것처럼 답변하십시오."""
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

## 가설 문서와 원본 질문 반환

리콜을 증가시키기 위해 가설 문서와 원본 질문 모두를 기반으로 문서를 검색할 수 있습니다. 다음과 같이 쉽게 반환할 수 있습니다:

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

## 구조화된 출력을 얻기 위한 함수 호출 사용

다른 쿼리 분석 기술과 HyDE를 구성하는 경우, 구조화된 쿼리 객체를 얻기 위해 함수 호출을 사용하고 있을 것입니다. 다음과 같이 HyDE에 대해 함수 호출을 사용할 수 있습니다:

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.pydantic_v1 import BaseModel, Field


class Query(BaseModel):
    answer: str = Field(
        ...,
        description="사용자 질문에 최대한 잘 답변하십시오. 사용자 질문을 다루는 튜토리얼을 작성하는 것처럼 답변하십시오.",
    )


system = """당신은 LangChain, LangGraph, LangServe 및 LangSmith라는 LLM 기반 응용 프로그램을 구축하는 소프트웨어에 대한 전문가입니다.

LangChain은 LLM 응용 프로그램을 쉽게 구축할 수 있는 다양한 통합 기능을 제공하는 Python 프레임워크입니다.
LangGraph는 상태를 유지하고 다중 행위자 LLM 응용 프로그램을 쉽게 구축할 수 있도록 LangChain 위에 구축된 Python 패키지입니다.
LangServe는 LangChain 응용 프로그램을 REST API로 쉽게 배포할 수 있도록 LangChain 위에 구축된 Python 패키지입니다.
LangSmith는 LLM 응용 프로그램을 추적하고 테스트하는 것을 쉽게 만드는 플랫폼입니다."""

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