---
sidebar_position: 2
translated: true
---

# 채팅 기록 추가하기

많은 Q&A 애플리케이션에서 사용자가 대화형으로 질문하고 답변을 받을 수 있도록 하기 위해서는 과거 질문과 답변의 "기억"을 포함한 논리가 필요합니다.

이 가이드에서는 **과거 메시지를 통합하는 논리를 추가하는 방법**에 중점을 둡니다. 채팅 기록 관리에 대한 자세한 내용은 [여기](https://docs/langchain/use_cases/chat_history_management)에서 확인할 수 있습니다.

[빠른 시작](/docs/use_cases/question_answering/quickstart)에서 Lilian Weng의 [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) 블로그 게시물을 기반으로 만든 Q&A 앱을 업데이트하겠습니다:

1. **프롬프트**: 프롬프트를 업데이트하여 과거 메시지를 입력으로 지원합니다.
2. **질문 맥락화**: 최신 사용자 질문을 받아 채팅 기록의 맥락에서 질문을 재구성하는 하위 체인을 추가합니다. 이는 최신 질문이 이전 메시지의 맥락을 참조하는 경우에 필요합니다. 예를 들어, 사용자가 "두 번째 포인트를 설명해 주세요."와 같은 후속 질문을 할 때, 이전 메시지의 맥락 없이는 이를 이해할 수 없으므로 이러한 질문으로는 효과적으로 검색을 수행할 수 없습니다.

## 설정

### 종속성

이 안내서에서는 OpenAI 채팅 모델 및 임베딩과 Chroma 벡터 저장소를 사용하지만, 여기에서 보여주는 모든 내용은 [ChatModel](/docs/modules/model_io/chat/) 또는 [LLM](/docs/modules/model_io/llms/), [Embeddings](/docs/modules/data_connection/text_embedding/), 및 [VectorStore](/docs/modules/data_connection/vectorstores/) 또는 [Retriever](/docs/modules/data_connection/retrievers/)와 함께 작동합니다.

다음 패키지를 사용하겠습니다:

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai langchain-chroma bs4
```

환경 변수 `OPENAI_API_KEY`를 설정해야 하며, 이를 직접 설정하거나 `.env` 파일에서 로드할 수 있습니다:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# import dotenv

# dotenv.load_dotenv()

```

### LangSmith

LangChain으로 구축하는 많은 애플리케이션에는 여러 단계와 여러 LLM 호출이 포함됩니다. 이러한 애플리케이션이 점점 복잡해짐에 따라 체인 또는 에이전트 내부에서 실제로 무슨 일이 일어나고 있는지 확인하는 것이 중요해집니다. 이를 위한 가장 좋은 방법은 [LangSmith](https://smith.langchain.com)를 사용하는 것입니다.

LangSmith는 필수는 아니지만 유용합니다. LangSmith를 사용하려면 위 링크에서 가입한 후 실행 추적을 시작하도록 환경 변수를 설정하십시오:

```python
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 채팅 기록이 없는 체인

여기 [빠른 시작](/docs/use_cases/question_answering/quickstart)에서 Lilian Weng의 [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) 블로그 게시물을 기반으로 만든 Q&A 앱이 있습니다:

```python
import bs4
from langchain import hub
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# 블로그 내용을 로드하고 청크로 나누고 인덱싱합니다.

loader = WebBaseLoader(
    web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer(
            class_=("post-content", "post-title", "post-header")
        )
    ),
)
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())

# 블로그의 관련 스니펫을 검색하고 생성합니다.

retriever = vectorstore.as_retriever()
prompt = hub.pull("rlm/rag-prompt")
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

```python
rag_chain.invoke("What is Task Decomposition?")
```

```output
'Task Decomposition is a technique used to break down complex tasks into smaller and simpler steps. This approach helps agents to plan and execute tasks more efficiently by dividing them into manageable subgoals. Task decomposition can be achieved through various methods, including using prompting techniques, task-specific instructions, or human inputs.'
```

## 질문 맥락화

먼저 과거 메시지와 최신 사용자 질문을 받아 질문이 과거 정보의 내용을 참조하는 경우 질문을 재구성하는 하위 체인을 정의해야 합니다.

프롬프트에 "chat_history"라는 이름으로 `MessagesPlaceholder` 변수를 포함하는 프롬프트를 사용하겠습니다. 이를 통해 메시지 목록을 "chat_history" 입력 키를 사용하여 프롬프트에 전달할 수 있으며, 이러한 메시지는 시스템 메시지 후에, 최신 질문이 포함된 사용자 메시지 앞에 삽입됩니다.

이 단계에서는 `chat_history`가 비어 있는 경우를 관리하고, 그렇지 않은 경우 `prompt | llm | StrOutputParser() | retriever`를 순서대로 적용하는 [create_history_aware_retriever](https://api.python.langchain.com/en/latest/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html)라는 도우미 함수를 사용합니다.

`create_history_aware_retriever`는 `input` 및 `chat_history` 키를 입력으로 받는 체인을 구성하며, 리트리버와 동일한 출력 스키마를 가집니다.

```python
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

contextualize_q_system_prompt = """Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone question \
which can be understood without the chat history. Do NOT answer the question, \
just reformulate it if needed and otherwise return it as is."""
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)
history_aware_retriever = create_history_aware_retriever(
    llm, retriever, contextualize_q_prompt
)
```

이 체인은 입력 쿼리의 재구성을 리트리버에 추가하여 대화의 맥락을 통합합니다.

## 채팅 기록이 있는 체인

이제 전체 QA 체인을 구축할 수 있습니다.

[create_stuff_documents_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html)을 사용하여 `question_answer_chain`을 생성합니다. 이 체인은 `context`, `chat_history`, `input` 키를 입력으로 받아 대화 기록과 쿼리와 함께 검색된 컨텍스트를 사용하여 답변을 생성합니다.

[create_retrieval_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.retrieval.create_retrieval_chain.html)을 사용하여 최종 `rag_chain`을 생성합니다. 이 체인은 `history_aware_retriever`와 `question_answer_chain`을 순서대로 적용하며, 검색된 컨텍스트와 같은 중간 출력을 편의를 위해 유지합니다. 이 체인은 `input` 및 `chat_history` 키를 입력으로 받아 `input`, `chat_history`, `context`, `answer`를 출력으로 포함합니다.

```python
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

qa_system_prompt = """You are an assistant for question-answering tasks. \
Use the following pieces of retrieved context to answer the question. \
If you don't know the answer, just say that you don't know. \
Use three sentences maximum and keep the answer concise.\

{context}"""
qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", qa_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)


question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
```

```python
from langchain_core.messages import HumanMessage

chat_history = []

question = "What is Task Decomposition?"
ai_msg_1 = rag_chain.invoke({"input": question, "chat_history": chat_history})
chat_history.extend([HumanMessage(content=question), ai_msg_1["answer"]])

second_question = "What are common ways of doing it?"
ai_msg_2 = rag_chain.invoke({"input": second_question, "chat_history": chat_history})

print(ai_msg_2["answer"])
```

```output
Task decomposition can be done in several common ways, including using Language Model (LLM) with simple prompting like "Steps for XYZ" or "What are the subgoals for achieving XYZ?", providing task-specific instructions tailored to the specific task at hand, or incorporating human inputs to guide the decomposition process. These methods help in breaking down complex tasks into smaller, more manageable subtasks for efficient execution.
```

:::tip

[LangSmith 추적](https://smith.langchain.com/public/243301e4-4cc5-4e52-a6e7-8cfe9208398d/r)을 확인해 보세요.

:::

### 소스 반환

Q&A 애플리케이션에서는 사용자에게 답변을 생성하는 데 사용된 소스를 보여주는 것이 중요합니다. LangChain의 내장 `create_retrieval_chain`은 검색된 소스 문서를 `"context"` 키를 통해 출력으로 전달합니다:

```python
for document in ai_msg_2["context"]:
    print(document)
    print()
```

```output
page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.' metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}

page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.' metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}

page_content='Resources:\n1. Internet access for searches and information gathering.\n2. Long Term memory management.\n3. GPT-3.5 powered Agents for delegation of simple tasks.\n4. File output.\n\nPerformance Evaluation:\n1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.\n2. Constructively self-criticize your big-picture behavior constantly.\n3. Reflect on past decisions and strategies to refine your approach.\n4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.' metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}

page_content='Fig. 11. Illustration of how HuggingGPT works. (Image source: Shen et al. 2023)\nThe system comprises of 4 stages:\n(1) Task planning: LLM works as the brain and parses the user requests into multiple tasks. There are four attributes associated with each task: task type, ID, dependencies, and arguments. They use few-shot examples to guide LLM to do task parsing and planning.\nInstruction:' metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
```

## 전체 코드

모든 단계를 하나의 코드 셀에 결합하여 편리하게 구현합니다:

```python
import bs4
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_chroma import Chroma
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


### 리트리버 구성 ###

loader = WebBaseLoader(
    web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer(
            class_=("post-content", "post-title", "post-header")
        )
    ),
)
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())
retriever = vectorstore.as_retriever()


### 질문 맥락화 ###

contextualize_q_system_prompt = """Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone question \
which can be understood without the chat history. Do NOT answer the question, \
just reformulate it if needed and otherwise return it as is."""
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)
history_aware_retriever = create_history_aware_retriever(
    llm, retriever, contextualize_q_prompt
)


### 질문에 답변 ###

qa_system_prompt = """You are an assistant for question-answering tasks. \
Use the following pieces of retrieved context to answer the question. \
If you don't know the answer, just say that you don't know. \
Use three sentences maximum and keep the answer concise.\

{context}"""
qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", qa_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)
question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)


### 채팅 기록을 상태 있게 관리 ###

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


conversational_rag_chain = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer",
)
```

```python
conversational_rag_chain.invoke(
    {"input": "What is Task Decomposition?"},
    config={
        "configurable": {"session_id": "abc123"}
    },  # `store`에 "abc123" 키를 생성합니다.
)["answer"]
```

```output
'Task decomposition is a technique used to break down complex tasks into smaller and simpler steps. This approach helps agents or models handle difficult tasks by dividing them into more manageable subtasks. It can be achieved through methods like Chain of Thought (CoT) or Tree of Thoughts, which guide the model in thinking step by step or exploring multiple reasoning possibilities at each step.'
```

```python
conversational_rag_chain.invoke(
    {"input": "What are common ways of doing it?"},
    config={"configurable": {"session_id": "abc123"}},
)["answer"]
```

```output
'Task decomposition can be done in common ways such as using Language Model (LLM) with simple prompting, task-specific instructions, or human inputs. For example, LLM can be guided with prompts like "Steps for XYZ" to break down tasks, or specific instructions like "Write a story outline" can be given for task decomposition. Additionally, human inputs can also be utilized to decompose tasks into smaller, more manageable steps.'
```