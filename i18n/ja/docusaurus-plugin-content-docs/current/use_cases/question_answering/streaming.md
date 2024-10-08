---
sidebar_position: 3
translated: true
---

# ストリーミング

Q&Aアプリケーションでは、回答の生成に使用されたソースを ユーザーに表示することが重要な場合があります。これを最も簡単に行う方法は、チェーンが各生成時に取得したドキュメントを返すことです。

[LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)の記事で構築したQ&Aアプリと ソースを使って作業を行います。[Returning sources](/docs/use_cases/question_answering/sources)ガイドを参照してください。

## セットアップ

### 依存関係

このチュートリアルでは、OpenAIのチャットモデルと埋め込み、Chromaのベクトルストアを使用しますが、ここで示すすべてのことは、任意の[ChatModel](/docs/modules/model_io/chat/)または[LLM](/docs/modules/model_io/llms/)、[Embeddings](/docs/modules/data_connection/text_embedding/)、[VectorStore](/docs/modules/data_connection/vectorstores/)または[Retriever](/docs/modules/data_connection/retrievers/)で動作します。

以下のパッケージを使用します:

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai langchain-chroma bs4
```

`OPENAI_API_KEY`の環境変数を設定する必要があります。これは直接行うか、`.env`ファイルからロードできます:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# import dotenv

# dotenv.load_dotenv()
```

### LangSmith

LangChainで構築するアプリケーションの多くには、複数のステップと複数のLLMコールが含まれます。アプリケーションが複雑になるにつれ、チェーンやエージェントの内部を検査できることが重要になります。これを行う最良の方法は[LangSmith](https://smith.langchain.com)を使うことです。

LangSmithは必須ではありませんが、便利です。LangSmithを使用する場合は、上記のリンクでサインアップした後、トレースのログ記録を開始するために環境変数を設定してください:

```python
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## ソース付きのチェーン

[LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)の記事で構築したQ&Aアプリと ソースは、[Returning sources](/docs/use_cases/question_answering/sources)ガイドにあります:

```python
import bs4
from langchain import hub
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# Load, chunk and index the contents of the blog.
bs_strainer = bs4.SoupStrainer(class_=("post-content", "post-title", "post-header"))
loader = WebBaseLoader(
    web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
    bs_kwargs={"parse_only": bs_strainer},
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


rag_chain_from_docs = (
    RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain_with_source = RunnableParallel(
    {"context": retriever, "question": RunnablePassthrough()}
).assign(answer=rag_chain_from_docs)
```

## 最終出力のストリーミング

LCELを使えば、最終出力をストリーミングするのが簡単です:

```python
for chunk in rag_chain_with_source.stream("What is Task Decomposition"):
    print(chunk)
```

```output
{'question': 'What is Task Decomposition'}
{'context': [Document(page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='The AI assistant can parse user input to several tasks: [{"task": task, "id", task_id, "dep": dependency_task_ids, "args": {"text": text, "image": URL, "audio": URL, "video": URL}}]. The "dep" field denotes the id of the previous task which generates a new resource that the current task relies on. A special tag "-task_id" refers to the generated text image, audio and video in the dependency task with id as task_id. The task MUST be selected from the following options: {{ Available Task List }}. There is a logical relationship between tasks, please note their order. If the user input can\'t be parsed, you need to reply empty JSON. Here are several cases for your reference: {{ Demonstrations }}. The chat history is recorded as {{ Chat History }}. From this chat history, you can find the path of the user-mentioned resources for your task planning.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Fig. 11. Illustration of how HuggingGPT works. (Image source: Shen et al. 2023)\nThe system comprises of 4 stages:\n(1) Task planning: LLM works as the brain and parses the user requests into multiple tasks. There are four attributes associated with each task: task type, ID, dependencies, and arguments. They use few-shot examples to guide LLM to do task parsing and planning.\nInstruction:', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'})]}
{'answer': ''}
{'answer': 'Task'}
{'answer': ' decomposition'}
{'answer': ' is'}
{'answer': ' a'}
{'answer': ' technique'}
{'answer': ' used'}
{'answer': ' to'}
{'answer': ' break'}
{'answer': ' down'}
{'answer': ' complex'}
{'answer': ' tasks'}
{'answer': ' into'}
{'answer': ' smaller'}
{'answer': ' and'}
{'answer': ' simpler'}
{'answer': ' steps'}
{'answer': '.'}
{'answer': ' It'}
{'answer': ' can'}
{'answer': ' be'}
{'answer': ' done'}
{'answer': ' through'}
{'answer': ' methods'}
{'answer': ' like'}
{'answer': ' Chain'}
{'answer': ' of'}
{'answer': ' Thought'}
{'answer': ' ('}
{'answer': 'Co'}
{'answer': 'T'}
{'answer': ')'}
{'answer': ' or'}
{'answer': ' Tree'}
{'answer': ' of'}
{'answer': ' Thoughts'}
{'answer': ','}
{'answer': ' which'}
{'answer': ' involve'}
{'answer': ' dividing'}
{'answer': ' the'}
{'answer': ' task'}
{'answer': ' into'}
{'answer': ' manageable'}
{'answer': ' sub'}
{'answer': 'tasks'}
{'answer': ' and'}
{'answer': ' exploring'}
{'answer': ' multiple'}
{'answer': ' reasoning'}
{'answer': ' possibilities'}
{'answer': ' at'}
{'answer': ' each'}
{'answer': ' step'}
{'answer': '.'}
{'answer': ' Task'}
{'answer': ' decomposition'}
{'answer': ' can'}
{'answer': ' be'}
{'answer': ' performed'}
{'answer': ' by'}
{'answer': ' using'}
{'answer': ' simple'}
{'answer': ' prompts'}
{'answer': ','}
{'answer': ' task'}
{'answer': '-specific'}
{'answer': ' instructions'}
{'answer': ','}
{'answer': ' or'}
{'answer': ' human'}
{'answer': ' inputs'}
{'answer': '.'}
{'answer': ''}
```

ストリームを返される際にコンパイルするロジックを追加することができます:

```python
output = {}
curr_key = None
for chunk in rag_chain_with_source.stream("What is Task Decomposition"):
    for key in chunk:
        if key not in output:
            output[key] = chunk[key]
        else:
            output[key] += chunk[key]
        if key != curr_key:
            print(f"\n\n{key}: {chunk[key]}", end="", flush=True)
        else:
            print(chunk[key], end="", flush=True)
        curr_key = key
output
```

```output


question: What is Task Decomposition

context: [Document(page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='The AI assistant can parse user input to several tasks: [{"task": task, "id", task_id, "dep": dependency_task_ids, "args": {"text": text, "image": URL, "audio": URL, "video": URL}}]. The "dep" field denotes the id of the previous task which generates a new resource that the current task relies on. A special tag "-task_id" refers to the generated text image, audio and video in the dependency task with id as task_id. The task MUST be selected from the following options: {{ Available Task List }}. There is a logical relationship between tasks, please note their order. If the user input can\'t be parsed, you need to reply empty JSON. Here are several cases for your reference: {{ Demonstrations }}. The chat history is recorded as {{ Chat History }}. From this chat history, you can find the path of the user-mentioned resources for your task planning.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Fig. 11. Illustration of how HuggingGPT works. (Image source: Shen et al. 2023)\nThe system comprises of 4 stages:\n(1) Task planning: LLM works as the brain and parses the user requests into multiple tasks. There are four attributes associated with each task: task type, ID, dependencies, and arguments. They use few-shot examples to guide LLM to do task parsing and planning.\nInstruction:', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'})]

answer: Task decomposition is a technique used to break down complex tasks into smaller and simpler steps. It can be done through methods like Chain of Thought (CoT) or Tree of Thoughts, which involve dividing the task into manageable subtasks and exploring multiple reasoning possibilities at each step. Task decomposition can be performed by using simple prompts, task-specific instructions, or human inputs.
```

```output
{'question': 'What is Task Decomposition',
 'context': [Document(page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}),
  Document(page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}),
  Document(page_content='The AI assistant can parse user input to several tasks: [{"task": task, "id", task_id, "dep": dependency_task_ids, "args": {"text": text, "image": URL, "audio": URL, "video": URL}}]. The "dep" field denotes the id of the previous task which generates a new resource that the current task relies on. A special tag "-task_id" refers to the generated text image, audio and video in the dependency task with id as task_id. The task MUST be selected from the following options: {{ Available Task List }}. There is a logical relationship between tasks, please note their order. If the user input can\'t be parsed, you need to reply empty JSON. Here are several cases for your reference: {{ Demonstrations }}. The chat history is recorded as {{ Chat History }}. From this chat history, you can find the path of the user-mentioned resources for your task planning.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}),
  Document(page_content='Fig. 11. Illustration of how HuggingGPT works. (Image source: Shen et al. 2023)\nThe system comprises of 4 stages:\n(1) Task planning: LLM works as the brain and parses the user requests into multiple tasks. There are four attributes associated with each task: task type, ID, dependencies, and arguments. They use few-shot examples to guide LLM to do task parsing and planning.\nInstruction:', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'})],
 'answer': 'Task decomposition is a technique used to break down complex tasks into smaller and simpler steps. It can be done through methods like Chain of Thought (CoT) or Tree of Thoughts, which involve dividing the task into manageable subtasks and exploring multiple reasoning possibilities at each step. Task decomposition can be performed by using simple prompts, task-specific instructions, or human inputs.'}
```

## 中間ステップのストリーミング

最終出力だけでなく、中間ステップもストリーミングしたい場合があります。例として、[Chat history](/docs/use_cases/question_answering/chat_history)チェーンを取り上げましょう。ここでは、ユーザーの質問を再フォーミュレーションしてから、リトリーバーに渡しています。この再フォーミュレーションされた質問は、最終出力の一部として返されません。チェーンを変更して新しい質問を返すこともできますが、デモンストレーションの目的で、そのままにしておきます。

```python
from operator import itemgetter

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tracers.log_stream import LogEntry, LogStreamCallbackHandler

contextualize_q_system_prompt = """Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone question \
which can be understood without the chat history. Do NOT answer the question, \
just reformulate it if needed and otherwise return it as is."""
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ]
)
contextualize_q_chain = (contextualize_q_prompt | llm | StrOutputParser()).with_config(
    tags=["contextualize_q_chain"]
)

qa_system_prompt = """You are an assistant for question-answering tasks. \
Use the following pieces of retrieved context to answer the question. \
If you don't know the answer, just say that you don't know. \
Use three sentences maximum and keep the answer concise.\

{context}"""
qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", qa_system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ]
)


def contextualized_question(input: dict):
    if input.get("chat_history"):
        return contextualize_q_chain
    else:
        return input["question"]


rag_chain = (
    RunnablePassthrough.assign(context=contextualize_q_chain | retriever | format_docs)
    | qa_prompt
    | llm
)
```

中間ステップをストリーミングするには、`astream_log`メソッドを使用します。これは非同期メソッドで、同じ順序で適用すると、RunStateが構築されるJSONPatchオペレーションを生成します。

```python
from typing import Any, Dict, List, Optional, TypedDict

class RunState(TypedDict):
    id: str
    """ID of the run."""
    streamed_output: List[Any]
    """List of output chunks streamed by Runnable.stream()"""
    final_output: Optional[Any]
    """Final output of the run, usually the result of aggregating (`+`) streamed_output.
    Only available after the run has finished successfully."""

    logs: Dict[str, LogEntry]
    """Map of run names to sub-runs. If filters were supplied, this list will
    contain only the runs that matched the filters."""
```

ステップをすべて(デフォルト)ストリーミングするか、名前、タグ、メタデータによって含める/除外することができます。今回は、`contextualize_q_chain`の中間ステップと最終出力のみをストリーミングします。`contextualize_q_chain`を定義する際に対応するタグを付けたことに注意してください。これを今後フィルタリングできます。

可読性のため、ストリームの最初の20チャンクのみを表示します:

```python
# Needed for running async functions in Jupyter notebook:
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_core.messages import HumanMessage

chat_history = []

question = "What is Task Decomposition?"
ai_msg = rag_chain.invoke({"question": question, "chat_history": chat_history})
chat_history.extend([HumanMessage(content=question), ai_msg])

second_question = "What are common ways of doing it?"
ct = 0
async for jsonpatch_op in rag_chain.astream_log(
    {"question": second_question, "chat_history": chat_history},
    include_tags=["contextualize_q_chain"],
):
    print(jsonpatch_op)
    print("\n" + "-" * 30 + "\n")
    ct += 1
    if ct > 20:
        break
```

```output
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': 'df0938b3-3ff2-451b-a233-6c882b640e4d',
            'logs': {},
            'streamed_output': []}})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/RunnableSequence',
  'value': {'end_time': None,
            'final_output': None,
            'id': '2e2af851-9e1f-4260-b004-c30dea4affe9',
            'metadata': {},
            'name': 'RunnableSequence',
            'start_time': '2023-12-29T20:08:28.923',
            'streamed_output': [],
            'streamed_output_str': [],
            'tags': ['seq:step:1', 'contextualize_q_chain'],
            'type': 'chain'}})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatPromptTemplate',
  'value': {'end_time': None,
            'final_output': None,
            'id': '7ad34564-337c-4362-ae7a-655d79cf0ab0',
            'metadata': {},
            'name': 'ChatPromptTemplate',
            'start_time': '2023-12-29T20:08:28.926',
            'streamed_output': [],
            'streamed_output_str': [],
            'tags': ['seq:step:1', 'contextualize_q_chain'],
            'type': 'prompt'}})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatPromptTemplate/final_output',
  'value': ChatPromptValue(messages=[SystemMessage(content='Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is.'), HumanMessage(content='What is Task Decomposition?'), AIMessage(content='Task decomposition is a technique used to break down complex tasks into smaller and more manageable subtasks. It involves dividing a task into multiple steps or subgoals, allowing an agent or model to better understand and plan for the overall task. Task decomposition can be done through various methods, such as using prompting techniques like Chain of Thought or Tree of Thoughts, task-specific instructions, or human inputs.'), HumanMessage(content='What are common ways of doing it?')])},
 {'op': 'add',
  'path': '/logs/ChatPromptTemplate/end_time',
  'value': '2023-12-29T20:08:28.926'})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI',
  'value': {'end_time': None,
            'final_output': None,
            'id': '228792d6-1d76-4209-8d25-08c484b6df57',
            'metadata': {},
            'name': 'ChatOpenAI',
            'start_time': '2023-12-29T20:08:28.931',
            'streamed_output': [],
            'streamed_output_str': [],
            'tags': ['seq:step:2', 'contextualize_q_chain'],
            'type': 'llm'}})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/StrOutputParser',
  'value': {'end_time': None,
            'final_output': None,
            'id': 'f740f235-2b14-412d-9f54-53bbc4fa8fd8',
            'metadata': {},
            'name': 'StrOutputParser',
            'start_time': '2023-12-29T20:08:29.487',
            'streamed_output': [],
            'streamed_output_str': [],
            'tags': ['seq:step:3', 'contextualize_q_chain'],
            'type': 'parser'}})

------------------------------

RunLogPatch({'op': 'add', 'path': '/logs/ChatOpenAI/streamed_output_str/-', 'value': ''},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content='')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': 'What'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content='What')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' are'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' are')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' some'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' some')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' commonly'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' commonly')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' used'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' used')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' methods'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' methods')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' or'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' or')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' approaches'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' approaches')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' for'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' for')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' task'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' task')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output_str/-',
  'value': ' decomposition'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content=' decomposition')})

------------------------------

RunLogPatch({'op': 'add', 'path': '/logs/ChatOpenAI/streamed_output_str/-', 'value': '?'},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content='?')})

------------------------------

RunLogPatch({'op': 'add', 'path': '/logs/ChatOpenAI/streamed_output_str/-', 'value': ''},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/streamed_output/-',
  'value': AIMessageChunk(content='')})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/ChatOpenAI/final_output',
  'value': {'generations': [[{'generation_info': {'finish_reason': 'stop'},
                              'message': AIMessageChunk(content='What are some commonly used methods or approaches for task decomposition?'),
                              'text': 'What are some commonly used methods or '
                                      'approaches for task decomposition?',
                              'type': 'ChatGenerationChunk'}]],
            'llm_output': None,
            'run': None}},
 {'op': 'add',
  'path': '/logs/ChatOpenAI/end_time',
  'value': '2023-12-29T20:08:29.688'})

------------------------------
```

取得したドキュメントを取得したい場合は、名前"Retriever"でフィルタリングできます:

```python
ct = 0
async for jsonpatch_op in rag_chain.astream_log(
    {"question": second_question, "chat_history": chat_history},
    include_names=["Retriever"],
    with_streamed_output_list=False,
):
    print(jsonpatch_op)
    print("\n" + "-" * 30 + "\n")
    ct += 1
    if ct > 20:
        break
```

```output
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': '9d122c72-378c-41f8-96fe-3fd9a214e9bc',
            'logs': {},
            'streamed_output': []}})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/Retriever',
  'value': {'end_time': None,
            'final_output': None,
            'id': 'c83481fb-7ca3-4125-9280-96da0c14eee9',
            'metadata': {},
            'name': 'Retriever',
            'start_time': '2023-12-29T20:10:13.794',
            'streamed_output': [],
            'streamed_output_str': [],
            'tags': ['seq:step:2', 'Chroma', 'OpenAIEmbeddings'],
            'type': 'retriever'}})

------------------------------

RunLogPatch({'op': 'add',
  'path': '/logs/Retriever/final_output',
  'value': {'documents': [Document(page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}),
                          Document(page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}),
                          Document(page_content='Resources:\n1. Internet access for searches and information gathering.\n2. Long Term memory management.\n3. GPT-3.5 powered Agents for delegation of simple tasks.\n4. File output.\n\nPerformance Evaluation:\n1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.\n2. Constructively self-criticize your big-picture behavior constantly.\n3. Reflect on past decisions and strategies to refine your approach.\n4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}),
                          Document(page_content='Fig. 9. Comparison of MIPS algorithms, measured in recall@10. (Image source: Google Blog, 2020)\nCheck more MIPS algorithms and performance comparison in ann-benchmarks.com.\nComponent Three: Tool Use#\nTool use is a remarkable and distinguishing characteristic of human beings. We create, modify and utilize external objects to do things that go beyond our physical and cognitive limits. Equipping LLMs with external tools can significantly extend the model capabilities.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'})]}},
 {'op': 'add',
  'path': '/logs/Retriever/end_time',
  'value': '2023-12-29T20:10:14.234'})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1.')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1. Using')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1. Using prompting')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1. Using prompting techniques')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1. Using prompting techniques like')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1. Using prompting techniques like Chain')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1. Using prompting techniques like Chain of')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1. Using prompting techniques like Chain of Thought')})

------------------------------

RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': AIMessageChunk(content='Common ways of task decomposition include:\n1. Using prompting techniques like Chain of Thought (')})

------------------------------
```

中間ステップのストリーミングの詳細については、[LCEL Interface](/docs/expression_language/interface#async-stream-intermediate-steps)のドキュメントを確認してください。
