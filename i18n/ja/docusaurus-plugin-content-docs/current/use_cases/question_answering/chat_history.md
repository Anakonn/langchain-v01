---
sidebar_position: 2
translated: true
---

# チャット履歴を追加

多くのQ&Aアプリケーションでは、ユーザーが対話を続けることを許可したいと考えています。これは、アプリケーションが過去の質問と回答の「記憶」を持ち、それを現在の思考に組み込むための論理が必要であることを意味します。

このガイドでは、**過去のメッセージを組み込むための論理を追加すること**に焦点を当てます。チャット履歴管理の詳細は[こちらでカバーしています](/docs/expression_language/how_to/message_history)。

[LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)のブログ記事でLilian Wengが構築したQ&Aアプリを基に作業を進めます。このアプリを更新する必要があるのは以下の2点です：

1. **プロンプト**: 履歴メッセージを入力としてサポートするようにプロンプトを更新。
2. **質問の文脈化**: 最新のユーザー質問を取り、それをチャット履歴の文脈内で再構築するサブチェーンを追加。これは、最新の質問が過去のメッセージからのコンテキストを参照している場合に必要です。例えば、ユーザーが「2番目のポイントについて詳しく教えてください」といったフォローアップ質問をする場合、前のメッセージのコンテキストなしでは理解できません。このような質問では効果的な情報検索ができません。

## セットアップ

### 依存関係

このウォークスルーではOpenAIのチャットモデルと埋め込み、およびChromaベクトルストアを使用しますが、ここで示すすべてのことは、任意の[ChatModel](/docs/modules/model_io/chat/)または[LLM](/docs/modules/model_io/llms/)、[Embeddings](/docs/modules/data_connection/text_embedding/)、および[VectorStore](/docs/modules/data_connection/vectorstores/)または[Retriever](/docs/modules/data_connection/retrievers/)で機能します。

以下のパッケージを使用します：

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai langchain-chroma bs4
```

環境変数`OPENAI_API_KEY`を設定する必要があります。これは直接設定するか、以下のように`.env`ファイルから読み込むことができます：

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# import dotenv

# dotenv.load_dotenv()
```

### LangSmith

LangChainを使用して構築する多くのアプリケーションは、複数のLLMコールの呼び出しを含む複数のステップを含みます。これらのアプリケーションがますます複雑になるにつれ、チェーンやエージェントの内部で何が正確に起こっているかを調査することが重要になります。これを行う最良の方法は[LangSmith](https://smith.langchain.com)を使用することです。

LangSmithは必須ではありませんが、役立ちます。使用したい場合は、上記のリンクでサインアップした後、トレースのログを開始するために環境変数を設定することを確認してください：

```python
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## チャット履歴なしのチェーン

こちらが、Lilian Wengの[LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)ブログ記事に基づいて構築したQ&Aアプリです：

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
# Load, chunk and index the contents of the blog.
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

# Retrieve and generate using the relevant snippets of the blog.
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

## 質問の文脈化

まず、過去のメッセージと最新のユーザー質問を取り、それが過去の情報に言及している場合に質問を再構築するサブチェーンを定義する必要があります。

プロンプトには「chat_history」という名前の`MessagesPlaceholder`変数を含めます。これにより、「chat_history」入力キーを使用してメッセージのリストをプロンプトに渡すことができ、これらのメッセージはシステムメッセージの後、人間のメッセージ（最新の質問を含む）の前に挿入されます。

このステップでは、`chat_history`が空の場合を管理し、それ以外の場合は`prompt | llm | StrOutputParser() | retriever`を順番に適用するヘルパー関数[create_history_aware_retriever](https://api.python.langchain.com/en/latest/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html)を活用します。

`create_history_aware_retriever`は、`input`および`chat_history`を入力として受け入れ、リトリーバーと同じ出力スキーマを持つチェーンを構築します。

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

このチェーンは、会話のコンテキストを取り入れるために入力クエリの再構築をリトリーバーに前置します。

## チャット履歴付きのチェーン

ここで、完全なQAチェーンを構築できます。

ここでは、[create_stuff_documents_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html)を使用して、`question_answer_chain`を生成し、入力キー`context`、`chat_history`、および`input`を持つ--取得されたコンテキストと会話履歴およびクエリを受け入れて回答を生成します。

最終的な`rag_chain`は[create_retrieval_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.retrieval.create_retrieval_chain.html)を使用して構築します。このチェーンは`history_aware_retriever`と`question_answer_chain`を順番に適用し、取得されたコンテキストなどの中間出力を保持します。入力キーは`input`および`chat_history`で、出力には`input`、`chat_history`、`context`、および`answer`が含まれます。

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

[LangSmith trace](https://smith.langchain.com/public/243301e4-4cc5-4e52-a6e7-8cfe9208398d/r)をチェックしてください

:::

### ソースの返却

Q&Aアプリケーションでは、ユーザーに回答を生成するために使用されたソースを表示することが重要な場合がよくあります。LangChainの組み込み`create_retrieval_chain`は、取得されたソースドキュメントを`"context"`キーで出力に伝播します：

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

## まとめ

![](../../../../../../static/img/conversational_retrieval_chain.png)

ここでは、過去の出力を組み込むためのアプリケーションロジックを追加する方法を説明しましたが、まだチャット履歴を手動で更新し、各入力に挿入しています。実際のQ&Aアプリケーションでは、チャット履歴を保持し、それを自動的に挿入および更新する方法を望むでしょう。

これには以下を使用できます：

- [BaseChatMessageHistory](/docs/modules/memory/chat_messages/): チャット履歴を保存。
- [RunnableWithMessageHistory](/docs/expression_language/how_to/message_history): チャット履歴を入力に注入し、各呼び出し後に更新するLCELチェーンと`BaseChatMessageHistory`のラッパー。

これらのクラスを組み合わせて状態fulな会話チェーンを作成する方法の詳細なウォークスルーについては、[How to add message history (memory)](/docs/expression_language/how_to/message_history) LCELページをご覧ください。

以下に、チャット履歴を単純なdictに保存する2番目のオプションの簡単な例を実装します。

便宜上、すべての必要なステップを単一のコードセルにまとめています：

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


### Construct retriever ###
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


### Contextualize question ###
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


### Answer question ###
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


### Statefully manage chat history ###
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
    },  # constructs a key "abc123" in `store`.
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
