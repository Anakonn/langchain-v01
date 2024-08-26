---
translated: true
---

# Xata

>[Xata](https://xata.io)는 `PostgreSQL`과 `Elasticsearch`를 기반으로 하는 서버리스 데이터 플랫폼입니다. Python SDK를 제공하여 데이터베이스와 상호 작용할 수 있으며, 데이터 관리를 위한 UI를 제공합니다. `XataChatMessageHistory` 클래스를 사용하면 Xata 데이터베이스에 채팅 세션의 장기 지속성을 사용할 수 있습니다.

이 노트북에서는 다음을 다룹니다:

* `XataChatMessageHistory`의 기능을 보여주는 간단한 예제.
* 지식 기반 또는 문서(Xata의 벡터 스토어에 저장)를 기반으로 질문에 답변하고 과거 메시지의 장기 검색 가능한 기록(Xata의 메모리 스토어에 저장)을 가진 REACT 에이전트를 사용하는 더 복잡한 예제.

## 설정

### 데이터베이스 생성

[Xata UI](https://app.xata.io)에서 새 데이터베이스를 생성하세요. 원하는 이름으로 지정할 수 있으며, 이 노트패드에서는 `langchain`을 사용합니다. Langchain 통합은 메모리 저장에 사용되는 테이블을 자동으로 생성할 수 있으며, 이것이 이 예제에서 사용할 것입니다. 테이블을 미리 생성하려면 올바른 스키마를 가지고 있는지 확인하고 클래스 생성 시 `create_table`을 `False`로 설정하세요. 테이블을 미리 생성하면 각 세션 초기화 시 데이터베이스에 대한 왕복 요청이 줄어듭니다.

먼저 종속성을 설치해 보겠습니다:

```python
%pip install --upgrade --quiet  xata langchain-openai langchain
```

다음으로 Xata에 대한 환경 변수를 가져와야 합니다. [계정 설정](https://app.xata.io/settings)에서 새 API 키를 생성할 수 있습니다. 데이터베이스 URL을 찾으려면 생성한 데이터베이스의 설정 페이지로 이동하세요. 데이터베이스 URL은 다음과 같은 형식일 것입니다: `https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`.

```python
import getpass

api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

## 간단한 메모리 스토어 생성

메모리 스토어 기능을 독립적으로 테스트하려면 다음 코드 스니펫을 사용하세요:

```python
from langchain_community.chat_message_histories import XataChatMessageHistory

history = XataChatMessageHistory(
    session_id="session-1", api_key=api_key, db_url=db_url, table_name="memory"
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

위의 코드는 `session-1` ID로 세션을 생성하고 두 개의 메시지를 저장합니다. 위의 코드를 실행한 후 Xata UI를 방문하면 `memory` 테이블과 두 개의 추가된 메시지를 볼 수 있습니다.

특정 세션에 대한 메시지 기록을 검색할 수 있습니다:

```python
history.messages
```

## 메모리를 사용한 데이터 기반 대화형 Q&A 체인

이제 OpenAI, Xata Vector Store 통합 및 Xata 메모리 스토어 통합을 결합하여 데이터에 대한 Q&A 채팅 봇을 만드는 더 복잡한 예제를 살펴보겠습니다. 이 봇은 후속 질문과 기록을 지원합니다.

OpenAI API에 액세스해야 하므로 API 키를 구성해 보겠습니다:

```python
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

채팅 봇이 답변을 검색할 문서를 저장하려면 Xata UI를 사용하여 `langchain` 데이터베이스에 `docs` 테이블을 추가하고 다음 열을 추가하세요:

* `content` 유형 "Text". 이는 `Document.pageContent` 값을 저장하는 데 사용됩니다.
* `embedding` 유형 "Vector". 사용할 모델의 차원을 사용하세요. 이 노트북에서는 OpenAI 임베딩을 사용하며, 이는 1536 차원입니다.

벡터 스토어를 만들고 샘플 문서를 추가해 보겠습니다:

```python
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

texts = [
    "Xata is a Serverless Data platform based on PostgreSQL",
    "Xata offers a built-in vector type that can be used to store and query vectors",
    "Xata includes similarity search",
]

vector_store = XataVectorStore.from_texts(
    texts, embeddings, api_key=api_key, db_url=db_url, table_name="docs"
)
```

위의 명령을 실행한 후 Xata UI로 이동하면 `docs` 테이블에 문서와 해당 임베딩이 로드된 것을 볼 수 있습니다.

이제 사용자와 AI의 채팅 메시지를 저장할 ConversationBufferMemory를 만들어 보겠습니다.

```python
from uuid import uuid4

from langchain.memory import ConversationBufferMemory

chat_memory = XataChatMessageHistory(
    session_id=str(uuid4()),  # needs to be unique per user session
    api_key=api_key,
    db_url=db_url,
    table_name="memory",
)
memory = ConversationBufferMemory(
    memory_key="chat_history", chat_memory=chat_memory, return_messages=True
)
```

이제 벡터 스토어와 채팅 메모리를 모두 사용하는 에이전트를 만들 때입니다.

```python
from langchain.agents import AgentType, initialize_agent
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain_openai import ChatOpenAI

tool = create_retriever_tool(
    vector_store.as_retriever(),
    "search_docs",
    "Searches and returns documents from the Xata manual. Useful when you need to answer questions about Xata.",
)
tools = [tool]

llm = ChatOpenAI(temperature=0)

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)
```

테스트해 보겠습니다. 에이전트에게 이름을 알려줍시다:

```python
agent.run(input="My name is bob")
```

이제 Xata에 대한 질문을 해 보겠습니다:

```python
agent.run(input="What is xata?")
```

문서 저장소에 저장된 데이터를 기반으로 답변한 것을 확인할 수 있습니다. 이제 후속 질문을 해 보겠습니다:

```python
agent.run(input="Does it support similarity search?")
```

마지막으로 메모리를 테스트해 보겠습니다:

```python
agent.run(input="Did I tell you my name? What is it?")
```
