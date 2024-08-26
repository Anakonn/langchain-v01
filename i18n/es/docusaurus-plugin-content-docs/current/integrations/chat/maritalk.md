---
translated: true
---

<a href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/chat/maritalk.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

# Maritalk

## Introducción

MariTalk es un asistente desarrollado por la empresa brasileña [Maritaca AI](https://www.maritaca.ai).
MariTalk se basa en modelos de lenguaje que han sido entrenados especialmente para entender bien el portugués.

Este cuaderno demuestra cómo usar MariTalk con LangChain a través de dos ejemplos:

1. Un ejemplo simple de cómo usar MariTalk para realizar una tarea.
2. LLM + RAG: El segundo ejemplo muestra cómo responder a una pregunta cuya respuesta se encuentra en un documento largo que no cabe dentro del límite de tokens de MariTalk. Para esto, usaremos un buscador simple (BM25) para primero buscar las secciones más relevantes del documento y luego alimentarlas a MariTalk para responder.

## Instalación

Primero, instala la biblioteca LangChain (y todas sus dependencias) usando el siguiente comando:

```python
!pip install langchain langchain-core langchain-community httpx
```

## Clave API

Necesitarás una clave API que se puede obtener de chat.maritaca.ai (sección "Chaves da API").

### Ejemplo 1 - Sugerencias de nombres de mascotas

Definamos nuestro modelo de lenguaje, ChatMaritalk, y configurémoslo con tu clave API.

```python
from langchain_community.chat_models import ChatMaritalk
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate

llm = ChatMaritalk(
    model="sabia-2-medium",  # Available models: sabia-2-small and sabia-2-medium
    api_key="",  # Insert your API key here
    temperature=0.7,
    max_tokens=100,
)

output_parser = StrOutputParser()

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an assistant specialized in suggesting pet names. Given the animal, you must suggest 4 names.",
        ),
        ("human", "I have a {animal}"),
    ]
)

chain = chat_prompt | llm | output_parser

response = chain.invoke({"animal": "dog"})
print(response)  # should answer something like "1. Max\n2. Bella\n3. Charlie\n4. Rocky"
```

### Generación de secuencias

Para tareas que implican la generación de texto largo, como crear un artículo extenso o traducir un documento grande, puede ser ventajoso recibir la respuesta en partes, a medida que se genera el texto, en lugar de esperar el texto completo. Esto hace que la aplicación sea más receptiva y eficiente, especialmente cuando el texto generado es extenso. Ofrecemos dos enfoques para satisfacer esta necesidad: uno síncrono y otro asíncrono.

#### Síncrono:

```python
from langchain_core.messages import HumanMessage

messages = [HumanMessage(content="Suggest 3 names for my dog")]

for chunk in llm.stream(messages):
    print(chunk.content, end="", flush=True)
```

#### Asíncrono:

```python
from langchain_core.messages import HumanMessage


async def async_invoke_chain(animal: str):
    messages = [HumanMessage(content=f"Suggest 3 names for my {animal}")]
    async for chunk in llm._astream(messages):
        print(chunk.message.content, end="", flush=True)


await async_invoke_chain("dog")
```

### Ejemplo 2 - RAG + LLM: Sistema de respuesta a preguntas del examen de ingreso a UNICAMP 2024

Para este ejemplo, necesitamos instalar algunas bibliotecas adicionales:

```python
!pip install unstructured rank_bm25 pdf2image pdfminer-six pikepdf pypdf unstructured_inference fastapi kaleido uvicorn "pillow<10.1.0" pillow_heif -q
```

#### Cargando la base de datos

El primer paso es crear una base de datos con la información del aviso. Para esto, descargaremos el aviso del sitio web de COMVEST y segmentaremos el texto extraído en ventanas de 500 caracteres.

```python
from langchain.document_loaders import OnlinePDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Loading the COMVEST 2024 notice
loader = OnlinePDFLoader(
    "https://www.comvest.unicamp.br/wp-content/uploads/2023/10/31-2023-Dispoe-sobre-o-Vestibular-Unicamp-2024_com-retificacao.pdf"
)
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=100, separators=["\n", " ", ""]
)
texts = text_splitter.split_documents(data)
```

#### Creando un buscador

Ahora que tenemos nuestra base de datos, necesitamos un buscador. Para este ejemplo, usaremos un BM25 simple como sistema de búsqueda, pero esto podría reemplazarse por cualquier otro buscador (como la búsqueda a través de incrustaciones).

```python
from langchain.retrievers import BM25Retriever

retriever = BM25Retriever.from_documents(texts)
```

#### Combinando el sistema de búsqueda + LLM

Ahora que tenemos nuestro buscador, solo necesitamos implementar un prompt que especifique la tarea e invocar la cadena.

```python
from langchain.chains.question_answering import load_qa_chain

prompt = """Baseado nos seguintes documentos, responda a pergunta abaixo.

{context}

Pergunta: {query}
"""

qa_prompt = ChatPromptTemplate.from_messages([("human", prompt)])

chain = load_qa_chain(llm, chain_type="stuff", verbose=True, prompt=qa_prompt)

query = "Qual o tempo máximo para realização da prova?"

docs = retriever.invoke(query)

chain.invoke(
    {"input_documents": docs, "query": query}
)  # Should output something like: "O tempo máximo para realização da prova é de 5 horas."
```
