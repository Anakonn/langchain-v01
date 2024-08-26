---
sidebar_position: 0
translated: true
---

# 빠른 시작

[![](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/chatbots.ipynb)

## 개요

LLM 기반 챗봇을 설계하고 구현하는 방법에 대한 예제를 살펴보겠습니다. 여기에서 다룰 주요 구성 요소는 다음과 같습니다:

- `채팅 모델(Chat Models)`: 챗봇 인터페이스는 원시 텍스트보다는 메시지 기반이기 때문에 텍스트 LLM보다는 채팅 모델에 더 적합합니다. [여기](https://docs.langchain.com/docs/integrations/chat)에서 채팅 모델 통합 목록을 확인하고, LangChain의 채팅 모델 인터페이스에 대한 문서는 [여기](https://docs.langchain.com/docs/modules/model_io/chat)에서 확인할 수 있습니다. `LLMs`(자세한 내용은 [여기](https://docs.langchain.com/docs/modules/model_io/llms) 참조)를 챗봇에 사용할 수도 있지만, 채팅 모델은 더 대화형 톤을 가지고 있으며 메시지 인터페이스를 네이티브로 지원합니다.
- `프롬프트 템플릿(Prompt Templates)`: 기본 메시지, 사용자 입력, 채팅 기록 및 (선택적으로) 추가 검색된 컨텍스트를 결합하는 프롬프트를 구성하는 프로세스를 간소화합니다.
- `채팅 기록(Chat History)`: 챗봇이 과거 상호작용을 "기억"하고 후속 질문에 응답할 때 이를 고려할 수 있도록 합니다. 자세한 내용은 [여기](https://docs.langchain.com/docs/modules/memory/chat_messages/)를 참조하세요.
- `검색기(Retrievers)`(선택 사항): 도메인 특화, 최신 지식을 컨텍스트로 사용하여 응답을 강화할 수 있는 챗봇을 구축하려는 경우 유용합니다. 검색 시스템에 대한 자세한 문서는 [여기](https://docs.langchain.com/docs/modules/data_connection/retrievers)에서 확인할 수 있습니다.

위의 구성 요소를 결합하여 강력한 대화형 챗봇을 만드는 방법을 다루겠습니다.

## 빠른 시작

먼저, 몇 가지 종속성을 설치하고 필요한 자격 증명을 설정해 보겠습니다:

```python
%pip install --upgrade --quiet langchain langchain-openai langchain-chroma

# 환경 변수 OPENAI_API_KEY 설정 또는 .env 파일에서 로드:

import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

챗봇의 두뇌 역할을 할 채팅 모델을 초기화해 보겠습니다:

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0.2)
```

챗봇 모델을 호출하면 출력은 `AIMessage`가 됩니다:

```python
from langchain_core.messages import HumanMessage

chat.invoke(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'adore programmer.")
```

모델 자체는 상태의 개념이 없습니다. 예를 들어, 후속 질문을 하면:

```python
chat.invoke([HumanMessage(content="What did you just say?")])
```

```output
AIMessage(content='I said, "What did you just say?"')
```

이전 대화 턴을 컨텍스트로 사용하지 않기 때문에 질문에 제대로 답할 수 없습니다.

이를 해결하기 위해 전체 대화 기록을 모델에 전달해야 합니다. 다음과 같이 해보겠습니다:

```python
from langchain_core.messages import AIMessage

chat.invoke(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        ),
        AIMessage(content="J'adore la programmation."),
        HumanMessage(content="What did you just say?"),
    ]
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

이제 좋은 응답을 얻을 수 있음을 알 수 있습니다!

이것이 챗봇의 대화형 상호작용 능력을 뒷받침하는 기본 아이디어입니다.

## 프롬프트 템플릿

프롬프트 템플릿을 정의하여 포맷팅을 좀 더 쉽게 만들 수 있습니다. 모델에 파이핑하여 체인을 만들 수 있습니다:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat
```

위의 `MessagesPlaceholder`는 체인의 입력으로 전달된 채팅 메시지를 `chat_history`로 프롬프트에 직접 삽입합니다. 그런 다음 다음과 같이 체인을 호출할 수 있습니다:

```python
chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

## 메시지 기록

채팅 기록을 관리하기 위한 지름길로 [`MessageHistory`](/docs/modules/memory/chat_messages/) 클래스를 사용할 수 있습니다. 이 클래스는 채팅 메시지를 저장하고 로드하는 역할을 합니다. 다양한 데이터베이스에 메시지를 지속시키는 많은 내장 메시지 기록 통합이 있지만, 이 빠른 시작에서는 `ChatMessageHistory`라는 메모리 내 데모 메시지 기록을 사용할 것입니다.

직접 사용하는 예제입니다:

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("hi!")

demo_ephemeral_chat_history.add_ai_message("whats up?")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

저장된 메시지를 체인의 매개변수로 직접 전달할 수 있습니다:

```python
demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

response = chain.invoke({"messages": demo_ephemeral_chat_history.messages})

response
```

```output
AIMessage(content='The translation of "I love programming" in French is "J\'adore la programmation."')
```

```python
demo_ephemeral_chat_history.add_ai_message(response)

demo_ephemeral_chat_history.add_user_message("What did you just say?")

chain.invoke({"messages": demo_ephemeral_chat_history.messages})
```

```output
AIMessage(content='I said "J\'adore la programmation," which is the French translation for "I love programming."')
```

이제 기본 챗봇을 갖추게 되었습니다!

이 체인은 모델의 내부 지식만으로도 유용한 챗봇으로 기능할 수 있지만, 도메인 특화 지식을 바탕으로 `검색 증강 생성`(retrieval-augmented generation, RAG) 형태를 도입하면 챗봇을 더욱 집중적으로 만들 수 있습니다. 다음으로 이를 다루겠습니다.

## Retrievers

챗봇에 도메인 특화 지식을 제공하기 위해 [`검색기`](/docs/modules/data_connection/retrievers/)를 설정하고 사용할 수 있습니다. 이를 보여주기 위해 위에서 만든 간단한 챗봇을 확장하여 LangSmith에 관한 질문에 답할 수 있도록 해보겠습니다.

[LangSmith 문서](https://docs.smith.langchain.com/overview)를 소스 자료로 사용하고, 나중에 검색할 수 있도록 벡터스토어에 저장하겠습니다. 이 예제에서는 데이터 소스를 파싱하고 저장하는 특정 세부 사항을 생략할 것입니다. 검색 시스템을 만드는 방법에 대한 자세한 문서는 [여기](https://docs.langchain.com/docs/use_cases/question_answering/)에서 확인할 수 있습니다.

검색기를 설정해 보겠습니다. 먼저 필요한 종속성을 설치합니다:

```python
%pip install --upgrade --quiet langchain-chroma beautifulsoup4
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

다음으로, 문서 로더를 사용하여 웹페이지에서 데이터를 가져옵니다:

```python
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://docs.smith.langchain.com/overview")
data = loader.load()
```

그런 다음 데이터를 LLM의 컨텍스트 윈도우에서 처리할 수 있는 작은 청크로 분할하고 벡터 데이터베이스에 저장합니다:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

그런 다음 이러한 청크를 임베딩하고 벡터 데이터베이스에 저장합니다:

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
```

마지막으로, 초기화된 벡터스토어에서 검색기를 생성합니다:

```python
# k는 검색할 청크의 수입니다.

retriever = vectorstore.as_retriever(k=4)

docs = retriever.invoke("how can langsmith help with testing?")

docs
```

```output
[Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

위에서 검색기를 호출하면 LangSmith 문서 중에서 테스트와 관련된 정보를 포함하는 부분을 검색하여 챗봇이 질문에 답할 때 컨텍스트로 사용할 수 있음을 알 수 있습니다.

### 문서 처리

이전 프롬프트를 수정하여 컨텍스트로 문서를 받아들이도록 해보겠습니다. 모든 입력 문서를 프롬프트에 "채워넣는" [`create_stuff_documents_chain`](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html#langchain.chains.combine_documents.stuff.create_stuff_documents_chain) 헬퍼 함수를 사용하겠습니다. 또한, [`ChatPromptTemplate.from_messages`](/docs/modules/model_io/prompts/quick_start#chatprompttemplate) 메서드를 사용하여 모델에 전달할 메시지 입력을 포맷하고, 채팅 기록 메시지가 직접 삽입될 [`MessagesPlaceholder`](/docs/modules/model_io/prompts/quick_start#messagesplaceholder)를 포함하겠습니다:

```python
from langchain.chains.combine_documents import create_stuff_documents_chain

chat = ChatOpenAI(model="gpt-3.5-turbo-1106")

question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user's questions based on the below context:\n\n{context}",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

document_chain = create_stuff_documents_chain(chat, question_answering_prompt)
```

이제 위에서 검색한 원시 문서와 함께 `document_chain`을 호출할 수 있습니다:

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("how can langsmith help with testing?")

document_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
        "context": docs,
    }
)
```

```output
'LangSmith can assist with testing by providing the capability to quickly edit examples and add them to datasets. This allows for the expansion of evaluation sets or fine-tuning of a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in the application.'
```

멋집니다! 입력 문서의 정보를 바탕으로 응답이 생성되었습니다.

### retrieval chain 만들기

이제 검색기를 체인에 통합해 보겠습니다. 검색기는 사용자가 마지막으로 보낸 메시지와 관련된 정보를 검색해야 하므로 이를 추출하여 관련 문서를 가져오는 입력으로 사용합니다. 검색한 문서를 현재 체인에 `context`로 추가하고, `context`와 이전 `messages`를 문서 체인에 전달하여 최종 답변을 생성합니다.

각 호출에서 중간 단계를 전달하기 위해 [`RunnablePassthrough.assign()`](/docs/expression_language/primitives/assign) 메서드를 사용합니다. 다음은 그 예제입니다:

```python
from typing import Dict

from langchain_core.runnables import RunnablePassthrough


def parse_retriever_input(params: Dict):
    return params["messages"][-1].content


retrieval_chain = RunnablePassthrough.assign(
    context=parse_retriever_input | retriever,
).assign(
    answer=document_chain,
)
```

이제 이 `retrieval_chain`을 호출하여 응답을 생성할 수 있습니다:

```python
response = retrieval_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

response
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?')],
 'context': [Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'LangSmith can help with testing in several ways:\n\n1. Dataset Expansion: LangSmith enables quick editing of examples and adding them to datasets, which expands the surface area of evaluation sets. This allows for more comprehensive testing of models and applications.\n\n2. Fine-Tuning Models: LangSmith facilitates the fine-tuning of models for improved quality or reduced costs. This is beneficial for optimizing the performance of models during testing.\n\n3. Monitoring: LangSmith can be used to monitor applications, log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise during testing. This monitoring helps in ensuring the reliability and performance of the application during testing phases.\n\nOverall, LangSmith helps in making testing more rigorous and comprehensive, whether by expanding datasets, fine-tuning models, or monitoring application performance.'}
```

다음 메시지를 추가하여 챗봇이 대화를 기억하고 계속할 수 있도록 해보겠습니다:

```python
demo_ephemeral_chat_history.add_ai_message(response["answer"])

demo_ephemeral_chat_history.add_user_message("tell me more about that!")

retrieval_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    },
)
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith can help with testing in several ways:\n\n1. Dataset Expansion: LangSmith enables quick editing of examples and adding them to datasets, which expands the surface area of evaluation sets. This allows for more comprehensive testing of models and applications.\n\n2. Fine-Tuning Models: LangSmith facilitates the fine-tuning of models for improved quality or reduced costs. This is beneficial for optimizing the performance of models during testing.\n\n3. Monitoring: LangSmith can be used to monitor applications, log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise during testing. This monitoring helps in ensuring the reliability and performance of the application during testing phases.\n\nOverall, LangSmith helps in making testing more rigorous and comprehensive, whether by expanding datasets, fine-tuning models, or monitoring application performance.'),
  HumanMessage(content='tell me more about that!')],
 'context': [Document(page_content='however, there is still no complete substitute for human review to get the utmost quality and reliability from your application.', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content="against these known issues.Why is this so impactful? When building LLM applications, it’s often common to start without a dataset of any kind. This is part of the power of LLMs! They are amazing zero-shot learners, making it possible to get started as easily as possible. But this can also be a curse -- as you adjust the prompt, you're wandering blind. You don’t have any examples to benchmark your changes against.LangSmith addresses this problem by including an “Add to Dataset” button for each", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='playground. Here, you can modify the prompt and re-run it to observe the resulting changes to the output - as many times as needed!Currently, this feature supports only OpenAI and Anthropic models and works for LLM and Chat Model calls. We plan to extend its functionality to more LLM types, chains, agents, and retrievers in the future.What is the exact sequence of events?\u200bIn complicated chains and agents, it can often be hard to understand what is going on under the hood. What calls are being', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Certainly! LangSmith offers the following capabilities to aid in testing:\n\n1. Dataset Expansion: By allowing quick editing of examples and adding them to datasets, LangSmith enables the expansion of evaluation sets. This is crucial for thorough testing of models and applications, as it broadens the range of scenarios and inputs that can be used to assess performance.\n\n2. Fine-Tuning Models: LangSmith supports the fine-tuning of models to enhance their quality and reduce operational costs. This capability is valuable during testing as it enables the optimization of model performance based on specific testing requirements and objectives.\n\n3. Monitoring: LangSmith provides monitoring features that allow for the logging of traces, visualization of latency and token usage statistics, and troubleshooting of issues as they occur during testing. This real-time monitoring helps in identifying and addressing any issues that may impact the reliability and performance of the application during testing.\n\nBy leveraging these features, LangSmith enhances the testing process by enabling comprehensive dataset expansion, model fine-tuning, and real-time monitoring to ensure the quality and reliability of applications and models.'}
```

좋습니다! 이제 챗봇이 대화 방식으로 도메인 특화 질문에 답변할 수 있습니다.

참고로, 모든 중간 단계를 반환하지 않으려면, 최종 `.assign()` 호출 대신 직접 문서 체인에 파이프하는 방식으로 검색 체인을 정의할 수 있습니다:

```python
retrieval_chain_with_only_answer = (
    RunnablePassthrough.assign(
        context=parse_retriever_input | retriever,
    )
    | document_chain
)

retrieval_chain_with_only_answer.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    },
)
```

```output
"LangSmith offers the capability to quickly edit examples and add them to datasets, thereby enhancing the scope of evaluation sets. This feature is particularly valuable for testing as it allows for a more thorough assessment of model performance and application behavior.\n\nFurthermore, LangSmith enables the fine-tuning of models to enhance quality and reduce costs, which can significantly impact testing outcomes. By adjusting and refining models, developers can ensure that they are thoroughly tested and optimized for various scenarios and use cases.\n\nAdditionally, LangSmith provides monitoring functionality, allowing users to log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they encounter them during testing. This real-time monitoring and troubleshooting capability contribute to the overall effectiveness and reliability of the testing process.\n\nIn essence, LangSmith's features are designed to improve the quality and reliability of testing by expanding evaluation sets, fine-tuning models, and providing comprehensive monitoring capabilities. These aspects collectively contribute to a more robust and thorough testing process for applications and models."
```

## 쿼리 변환

여기서 다룰 또 다른 최적화가 있습니다 - 위의 예에서 후속 질문인 `그것에 대해 더 말해줘!`를 했을 때, 검색된 문서에는 테스트에 대한 정보가 직접적으로 포함되지 않았음을 알 수 있습니다. 이는 `그것에 대해 더 말해줘!`를 검색어로 그대로 전달하기 때문입니다. 검색 체인의 출력은 여전히 괜찮지만, 문서 체인 검색 체인이 대화 기록을 바탕으로 답변을 생성할 수 있기 때문입니다. 그러나 더 풍부하고 유익한 문서를 검색할 수 있었습니다:

```python
retriever.invoke("how can langsmith help with testing?")
```

```output
[Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

```python
retriever.invoke("tell me more about that!")
```

```output
[Document(page_content='however, there is still no complete substitute for human review to get the utmost quality and reliability from your application.', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content="against these known issues.Why is this so impactful? When building LLM applications, it’s often common to start without a dataset of any kind. This is part of the power of LLMs! They are amazing zero-shot learners, making it possible to get started as easily as possible. But this can also be a curse -- as you adjust the prompt, you're wandering blind. You don’t have any examples to benchmark your changes against.LangSmith addresses this problem by including an “Add to Dataset” button for each", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='playground. Here, you can modify the prompt and re-run it to observe the resulting changes to the output - as many times as needed!Currently, this feature supports only OpenAI and Anthropic models and works for LLM and Chat Model calls. We plan to extend its functionality to more LLM types, chains, agents, and retrievers in the future.What is the exact sequence of events?\u200bIn complicated chains and agents, it can often be hard to understand what is going on under the hood. What calls are being', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

이 일반적인 문제를 해결하기 위해, 입력에서 참조를 제거하는 `쿼리 변환` 단계를 추가해 보겠습니다. 기존 검색기를 다음과 같이 감싸겠습니다:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableBranch

# 변환된 검색 쿼리를 생성하기 위해 LLM에 전달할 프롬프트가 필요합니다.

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0.2)

query_transform_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="messages"),
        (
            "user",
            "위의 대화를 바탕으로, 대화와 관련된 정보를 얻기 위해 검색할 쿼리를 생성하세요. 쿼리만 응답하고, 다른 것은 하지 마세요.",
        ),
    ]
)

query_transforming_retriever_chain = RunnableBranch(
    (
        lambda x: len(x.get("messages", [])) == 1,
        # 메시지가 하나만 있으면 그 메시지 내용을 검색기에 전달합니다
        (lambda x: x["messages"][-1].content) | retriever,
    ),
    # 메시지가 있으면 LLM 체인에 입력을 전달해 쿼리를 변환한 다음, 검색기에 전달합니다
    query_transform_prompt | chat | StrOutputParser() | retriever,
).with_config(run_name="chat_retriever_chain")
```

이제 이 새로운 `query_transforming_retriever_chain`을 사용하여 이전 체인을 재구성해 보겠습니다. 이 새로운 체인은 입력으로 dict를 받아들이고 문자열을 분석하여 검색기에 전달하므로 최상위 수준에서 추가 분석이 필요하지 않습니다:

```python
document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

conversational_retrieval_chain = RunnablePassthrough.assign(
    context=query_transforming_retriever_chain,
).assign(
    answer=document_chain,
)

demo_ephemeral_chat_history = ChatMessageHistory()
```

마지막으로, 이를 호출해 보겠습니다!

```python
demo_ephemeral_chat_history.add_user_message("how can langsmith help with testing?")

response = conversational_retrieval_chain.invoke(
    {"messages": demo_ephemeral_chat_history.messages},
)

demo_ephemeral_chat_history.add_ai_message(response["answer"])

response
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith는 여러 가지 방법으로 테스트를 도울 수 있습니다. 예제를 빠르게 편집하고 데이터셋에 추가하여 평가 세트의 범위를 확장할 수 있습니다. 이는 모델의 품질을 향상시키거나 비용을 절감하는 데 도움이 됩니다. 또한, LangSmith는 작은 데이터셋을 손쉽게 구성할 수 있도록 하여 애플리케이션의 변경 사항을 엄격하게 테스트하는 편리한 방법을 제공합니다. 더 나아가, LangSmith는 애플리케이션을 모니터링하여 모든 추적을 기록하고, 대기 시간 및 토큰 사용 통계를 시각화하며, 발생하는 특정 문제를 해결할 수 있게 해줍니다.')],
 'context': [Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'LangSmith는 여러 가지 방법으로 테스트를 도울 수 있습니다. 예제를 빠르게 편집하고 데이터셋에 추가하여 평가 세트의 범위를 확장할 수 있습니다. 이는 모델의 품질을 향상시키거나 비용을 절감하는 데 도움이 됩니다. 또한, LangSmith는 작은 데이터셋을 손쉽게 구성할 수 있도록 하여 애플리케이션의 변경 사항을 엄격하게 테스트하는 편리한 방법을 제공합니다. 더 나아가, LangSmith는 애플리케이션을 모니터링하여 모든 추적을 기록하고, 대기 시간 및 토큰 사용 통계를 시각화하며, 발생하는 특정 문제를 해결할 수 있게 해줍니다.'}
```

```python
demo_ephemeral_chat_history.add_user_message("tell me more about that!")

conversational_retrieval_chain.invoke(
    {"messages": demo_ephemeral_chat_history.messages}
)
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith는 여러 가지 방법으로 테스트를 도울 수 있습니다. 예제를 빠르게 편집하고 데이터셋에 추가하여 평가 세트의 범위를 확장할 수 있습니다. 이는 모델의 품질을 향상시키거나 비용을 절감하는 데 도움이 됩니다. 또한, LangSmith는 작은 데이터셋을 손쉽게 구성할 수 있도록 하여 애플리케이션의 변경 사항을 엄격하게 테스트하는 편리한 방법을 제공합니다. 더 나아가, LangSmith는 애플리케이션을 모니터링하여 모든 추적을 기록하고, 대기 시간 및 토큰 사용 통계를 시각화하며, 발생하는 특정 문제를 해결할 수 있게 해줍니다.'),
  HumanMessage(content='tell me more about that!')],
 'context': [Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': '물론입니다! LangSmith는 데이터셋 구성 및 편집 과정을 간소화하여 테스트와 모델의 미세 조정을 돕습니다. 예제를 빠르게 편집하고 데이터셋에 추가함으로써 평가 세트의 범위를 확장할 수 있으며, 이는 모델 품질 향상 및 비용 절감에 도움이 됩니다. 또한, LangSmith는 애플리케이션의 모든 추적을 기록하고, 대기 시간 및 토큰 사용 통계를 시각화하며, 발생하는 특정 문제를 해결할 수 있게 해주는 모니터링 기능을 제공합니다. 이러한 종합적인 모니터링 기능은 애플리케이션의 신뢰성과 성능을 보장하는 데 도움이 됩니다.'}
```

내부적으로 무슨 일이 일어나고 있는지 이해를 돕기 위해, [이 LangSmith 추적](https://smith.langchain.com/public/42f8993b-7d19-42d3-990a-6608a73c5824/r)은 첫 번째 호출을 보여줍니다. 사용자의 초기 쿼리가 검색기에 직접 전달되어 적절한 문서가 반환되는 것을 볼 수 있습니다.

후속 질문을 위한 호출, [이 LangSmith 추적](https://smith.langchain.com/public/7b463791-868b-42bd-8035-17b471e9c7cd/r)은 사용자의 초기 질문을 LangSmith와의 테스트에 더 관련된 내용으로 다시 표현하여 더 높은 품질의 문서를 반환합니다.

이제 우리는 대화형 검색이 가능한 챗봇을 갖추게 되었습니다!

## 다음 단계

이제 과거 메시지와 도메인별 지식을 통합하여 생성할 수 있는 대화형 챗봇을 만드는 방법을 알게 되었습니다. 이와 관련하여 할 수 있는 많은 최적화가 있습니다 - 자세한 내용은 다음 페이지를 참조하세요:

- [메모리 관리](/docs/use_cases/chatbots/memory_management): 채팅 기록을 자동으로 업데이트하고, 긴 대화를 정리, 요약 또는 수정하여 봇을 집중시키는 가이드가 포함되어 있습니다.
- [검색](/docs/use_cases/chatbots/retrieval): 챗봇에서 다양한 유형의 검색을 사용하는 방법에 대한 심층 분석.
- [도구 사용](/docs/use_cases/chatbots/tool_usage): 다른 API 및 시스템과 상호작용하는 도구를 챗봇이 사용하는 방법.