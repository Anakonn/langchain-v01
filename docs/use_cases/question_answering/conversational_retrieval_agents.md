---
canonical: https://python.langchain.com/v0.1/docs/use_cases/question_answering/conversational_retrieval_agents
translated: false
---

# Using agents

This is an agent specifically optimized for doing retrieval when necessary and also holding a conversation.

To start, we will set up the retriever we want to use, and then turn it into a retriever tool. Next, we will use the high level constructor for this type of agent. Finally, we will walk through how to construct a conversational retrieval agent from components.

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai faiss-cpu
```

## The Retriever

To start, we need a retriever to use! The code here is mostly just example code. Feel free to use your own retriever and skip to the section on creating a retriever tool.

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

## Retriever Tool

Now we need to create a tool for our retriever. The main things we need to pass in are a name for the retriever as well as a description. These will both be used by the language model, so they should be informative.

```python
from langchain.tools.retriever import create_retriever_tool

tool = create_retriever_tool(
    retriever,
    "search_state_of_union",
    "Searches and returns excerpts from the 2022 State of the Union.",
)
tools = [tool]
```

## Agent Constructor

Here, we will use the high level `create_openai_tools_agent` API to construct the agent.

Notice that beside the list of tools, the only thing we need to pass in is a language model to use.
Under the hood, this agent is using the OpenAI tool-calling capabilities, so we need to use a ChatOpenAI model.

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

We can now try it out!

```python
result = agent_executor.invoke({"input": "hi, im bob"})
```

```python
result["output"]
```

```output
'Hello Bob! How can I assist you today?'
```

Notice that it now does retrieval

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

Notice that the follow up question asks about information previously retrieved, so no need to do another retrieval

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

For more on how to use agents with retrievers and other tools, head to the [Agents](/docs/modules/agents) section.