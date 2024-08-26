---
translated: true
---

# エージェントの使用

これは、必要に応じて検索を行い、会話を維持するように最適化されたエージェントです。

まず、使用したい検索器を設定し、それをツールに変換します。次に、このタイプのエージェントの高レベルのコンストラクターを使用します。最後に、コンポーネントから会話型の検索エージェントを構築する方法を説明します。

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai faiss-cpu
```

## 検索器

まず、使用する検索器が必要です! ここのコードはほとんどがサンプルコードです。自分の検索器を使用し、検索ツールの作成セクションに進んでください。

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
```

```python
retriever = db.as_retriever()
```

## 検索ツール

次に、検索器のツールを作成する必要があります。必要なのは、検索器の名前と説明です。これらはすべて言語モデルによって使用されるため、情報的であるべきです。

```python
from langchain.tools.retriever import create_retriever_tool

tool = create_retriever_tool(
    retriever,
    "search_state_of_union",
    "Searches and returns excerpts from the 2022 State of the Union.",
)
tools = [tool]
```

## エージェントのコンストラクター

ここでは、高レベルの `create_openai_tools_agent` API を使ってエージェントを構築します。

ツールのリストの他に、必要なのは使用する言語モデルだけです。
内部的には、このエージェントは OpenAI のツール呼び出し機能を使用しているため、ChatOpenAI モデルを使う必要があります。

```python
from langchain import hub

prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
```

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

さあ、試してみましょう!

```python
result = agent_executor.invoke({"input": "hi, im bob"})
```

```python
result["output"]
```

```output
'Hello Bob! How can I assist you today?'
```

検索が行われていることがわかります。

```python
result = agent_executor.invoke(
    {
        "input": "what did the president say about ketanji brown jackson in the most recent state of the union?"
    }
)
```

```python
result["output"]
```

```output
"In the most recent state of the union, the President mentioned Kentaji Brown Jackson. The President nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court. The President described Judge Ketanji Brown Jackson as one of our nation's top legal minds who will continue Justice Breyer's legacy of excellence."
```

前に検索した情報について質問しているので、再度検索する必要はありません。

```python
result = agent_executor.invoke(
    {"input": "how long ago did the president nominate ketanji brown jackson?"}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThe President nominated Judge Ketanji Brown Jackson four days ago.[0m

[1m> Finished chain.[0m
```

```python
result["output"]
```

```output
'The President nominated Judge Ketanji Brown Jackson four days ago.'
```

検索器やその他のツールを使ったエージェントの使用方法の詳細は、[Agents](/docs/modules/agents) セクションをご覧ください。
