---
translated: true
---

# Agregar historial de chat

En muchas aplicaciones de preguntas y respuestas (Q&A) queremos permitir que el usuario tenga una conversación de ida y vuelta, lo que significa que la aplicación necesita cierta "memoria" de las preguntas y respuestas anteriores, y una lógica para incorporarlas a su pensamiento actual.

En esta guía nos enfocamos en **agregar lógica para incorporar mensajes históricos.** Los detalles adicionales sobre la gestión del historial de chat se [cubren aquí](/docs/expression_language/how_to/message_history).

Trabajaremos a partir de la aplicación de Q&A que construimos en el [blog post de Agentes Autónomos Impulsados por LLM](https://lilianweng.github.io/posts/2023-06-23-agent/) de Lilian Weng en el [Inicio Rápido](/docs/use_cases/question_answering/quickstart). Tendremos que actualizar dos cosas sobre nuestra aplicación existente:

1. **Prompt**: Actualizar nuestro prompt para admitir mensajes históricos como entrada.
2. **Contextualizar preguntas**: Agregar una sub-cadena que tome la última pregunta del usuario y la reformule en el contexto del historial de chat. Esto es necesario en caso de que la última pregunta haga referencia a algún contexto de mensajes anteriores. Por ejemplo, si un usuario hace una pregunta de seguimiento como "¿Puedes elaborar sobre el segundo punto?", esto no se puede entender sin el contexto del mensaje anterior. Por lo tanto, no podemos realizar una recuperación efectiva con una pregunta como esta.

## Configuración

### Dependencias

Utilizaremos un modelo de chat de OpenAI y incrustaciones, y un almacén de vectores Chroma en este tutorial, pero todo lo que se muestra aquí funciona con cualquier [ChatModel](/docs/modules/model_io/chat/) o [LLM](/docs/modules/model_io/llms/), [Embeddings](/docs/modules/data_connection/text_embedding/), y [VectorStore](/docs/modules/data_connection/vectorstores/) o [Retriever](/docs/modules/data_connection/retrievers/).

Utilizaremos los siguientes paquetes:

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai langchain-chroma bs4
```

Necesitamos establecer la variable de entorno `OPENAI_API_KEY`, lo cual se puede hacer directamente o cargar desde un archivo `.env` de la siguiente manera:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# import dotenv

# dotenv.load_dotenv()
```

### LangSmith

Muchas de las aplicaciones que construyas con LangChain contendrán múltiples pasos con múltiples invocaciones de llamadas a LLM. A medida que estas aplicaciones se vuelven más y más complejas, se vuelve crucial poder inspeccionar exactamente lo que está sucediendo dentro de tu cadena o agente. La mejor manera de hacer esto es con [LangSmith](https://smith.langchain.com).

Tenga en cuenta que LangSmith no es necesario, pero es útil. Si desea usar LangSmith, después de registrarse en el enlace anterior, asegúrese de establecer sus variables de entorno para comenzar a registrar rastros:

```python
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Cadena sin historial de chat

Aquí está la aplicación de Q&A que construimos en el [blog post de Agentes Autónomos Impulsados por LLM](https://lilianweng.github.io/posts/2023-06-23-agent/) de Lilian Weng en el [Inicio Rápido](/docs/use_cases/question_answering/quickstart):

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

## Contextualizar la pregunta

Primero necesitaremos definir una sub-cadena que tome los mensajes históricos y la última pregunta del usuario, y reformule la pregunta si hace referencia a cualquier información en la información histórica.

Utilizaremos un prompt que incluye una variable `MessagesPlaceholder` con el nombre "chat_history". Esto nos permite pasar una lista de Mensajes al prompt usando la clave de entrada "chat_history", y estos mensajes se insertarán después del mensaje del sistema y antes del mensaje humano que contiene la última pregunta.

Tenga en cuenta que aprovechamos una función auxiliar [create_history_aware_retriever](https://api.python.langchain.com/en/latest/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html) para este paso, que maneja el caso en el que `chat_history` está vacío, y de lo contrario aplica `prompt | llm | StrOutputParser() | retriever` en secuencia.

`create_history_aware_retriever` construye una cadena que acepta las claves `input` y `chat_history` como entrada, y tiene el mismo esquema de salida que un recuperador.

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

Esta cadena antepone una reformulación de la consulta de entrada a nuestro recuperador, de modo que la recuperación incorpore el contexto de la conversación.

## Cadena con historial de chat

Y ahora podemos construir nuestra cadena de QA completa.

Aquí usamos [create_stuff_documents_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html) para generar una `question_answer_chain`, con claves de entrada `context`, `chat_history` y `input`: acepta el contexto recuperado junto con el historial de la conversación y la consulta para generar una respuesta.

Construimos nuestra cadena final `rag_chain` con [create_retrieval_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.retrieval.create_retrieval_chain.html). Esta cadena aplica el `history_aware_retriever` y `question_answer_chain` en secuencia, reteniendo las salidas intermedias como el contexto recuperado por conveniencia. Tiene claves de entrada `input` y `chat_history`, e incluye `input`, `chat_history`, `context` y `answer` en su salida.

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

Echa un vistazo al [rastro de LangSmith](https://smith.langchain.com/public/243301e4-4cc5-4e52-a6e7-8cfe9208398d/r)

:::

### Devolver fuentes

A menudo, en las aplicaciones de Q&A, es importante mostrar a los usuarios las fuentes que se utilizaron para generar la respuesta. La `create_retrieval_chain` incorporada de LangChain propagará los documentos de origen recuperados a través de la salida en la clave `"context"`:

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

## Uniendo todo

![](../../../../../../static/img/conversational_retrieval_chain.png)

Aquí hemos visto cómo agregar lógica de aplicación para incorporar salidas históricas, pero aún estamos actualizando manualmente el historial de chat e insertándolo en cada entrada. En una aplicación de preguntas y respuestas real, querremos alguna forma de persistir el historial de chat y alguna forma de insertarlo y actualizarlo automáticamente.

Para esto podemos usar:

- [BaseChatMessageHistory](/docs/modules/memory/chat_messages/): Almacenar el historial de chat.
- [RunnableWithMessageHistory](/docs/expression_language/how_to/message_history): Contenedor para una cadena LCEL y un `BaseChatMessageHistory` que maneja la inyección del historial de chat en las entradas y su actualización después de cada invocación.

Para obtener un recorrido detallado sobre cómo usar estas clases juntas para crear una cadena conversacional con estado, dirígete a la página LCEL [Cómo agregar historial de mensajes (memoria)](/docs/expression_language/how_to/message_history).

A continuación, implementamos un ejemplo sencillo de la segunda opción, en la que los historiales de chat se almacenan en un diccionario simple.

Por conveniencia, unimos todos los pasos necesarios en una sola celda de código:

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
