---
translated: true
---

# Utilisation des agents

Ceci est un agent spécifiquement optimisé pour effectuer une recherche si nécessaire et également tenir une conversation.

Pour commencer, nous allons configurer le récupérateur que nous voulons utiliser, puis le transformer en un outil de récupération. Ensuite, nous utiliserons le constructeur de haut niveau pour ce type d'agent. Enfin, nous verrons comment construire un agent de récupération conversationnel à partir de composants.

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai faiss-cpu
```

## Le récupérateur

Pour commencer, nous avons besoin d'un récupérateur à utiliser ! Le code ici n'est qu'un exemple. N'hésitez pas à utiliser votre propre récupérateur et passez à la section sur la création d'un outil de récupération.

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

## Outil de récupération

Maintenant, nous devons créer un outil pour notre récupérateur. Les principales choses que nous devons transmettre sont un nom pour le récupérateur ainsi qu'une description. Ceux-ci seront tous deux utilisés par le modèle de langage, donc ils doivent être informatifs.

```python
from langchain.tools.retriever import create_retriever_tool

tool = create_retriever_tool(
    retriever,
    "search_state_of_union",
    "Searches and returns excerpts from the 2022 State of the Union.",
)
tools = [tool]
```

## Constructeur d'agent

Ici, nous utiliserons l'API de haut niveau `create_openai_tools_agent` pour construire l'agent.

Notez qu'à part la liste des outils, la seule chose que nous devons transmettre est un modèle de langage à utiliser.
En interne, cet agent utilise les capacités d'appel d'outil d'OpenAI, donc nous devons utiliser un modèle ChatOpenAI.

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

Nous pouvons maintenant l'essayer !

```python
result = agent_executor.invoke({"input": "hi, im bob"})
```

```python
result["output"]
```

```output
'Hello Bob! How can I assist you today?'
```

Notez qu'il effectue maintenant une récupération

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

Notez que la question de suivi demande des informations précédemment récupérées, donc pas besoin de faire une autre récupération

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

Pour plus d'informations sur l'utilisation des agents avec des récupérateurs et d'autres outils, rendez-vous dans la section [Agents](/docs/modules/agents).
