---
translated: true
---

# Uso de agentes

Este es un agente específicamente optimizado para realizar búsquedas cuando sea necesario y también mantener una conversación.

Para comenzar, configuraremos el buscador que queremos usar y luego lo convertiremos en una herramienta de búsqueda. A continuación, usaremos el constructor de alto nivel para este tipo de agente. Finalmente, recorreremos cómo construir un agente de recuperación conversacional a partir de componentes.

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai faiss-cpu
```

## El buscador

¡Para comenzar, necesitamos un buscador que usar! El código aquí es principalmente solo código de ejemplo. Siéntete libre de usar tu propio buscador y saltar a la sección sobre la creación de una herramienta de búsqueda.

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

## Herramienta de búsqueda

Ahora necesitamos crear una herramienta para nuestro buscador. Lo principal que necesitamos pasar es un nombre para el buscador, así como una descripción. Ambos serán utilizados por el modelo de lenguaje, por lo que deben ser informativos.

```python
from langchain.tools.retriever import create_retriever_tool

tool = create_retriever_tool(
    retriever,
    "search_state_of_union",
    "Searches and returns excerpts from the 2022 State of the Union.",
)
tools = [tool]
```

## Constructor de agente

Aquí, usaremos la API de alto nivel `create_openai_tools_agent` para construir el agente.

Tenga en cuenta que, además de la lista de herramientas, lo único que necesitamos pasar es un modelo de lenguaje para usar.
Debajo de la capucha, este agente está usando las capacidades de llamada a herramientas de OpenAI, por lo que necesitamos usar un modelo ChatOpenAI.

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

¡Ahora podemos probarlo!

```python
result = agent_executor.invoke({"input": "hi, im bob"})
```

```python
result["output"]
```

```output
'Hello Bob! How can I assist you today?'
```

Tenga en cuenta que ahora realiza una búsqueda

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

Tenga en cuenta que la pregunta de seguimiento pregunta por información recuperada anteriormente, por lo que no es necesario realizar otra búsqueda

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

Para obtener más información sobre cómo usar agentes con buscadores y otras herramientas, dirígete a la sección [Agentes](/docs/modules/agents).
