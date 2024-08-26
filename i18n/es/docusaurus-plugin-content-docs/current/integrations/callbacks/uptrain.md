---
translated: true
---

<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/uptrain.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Abrir en Colab"/>
</a>

# UpTrain

> UpTrain [[github](https://github.com/uptrain-ai/uptrain) || [sitio web](https://uptrain.ai/) || [documentación](https://docs.uptrain.ai/getting-started/introduction)] es una plataforma de código abierto para evaluar y mejorar las aplicaciones de LLM. Proporciona calificaciones para más de 20 comprobaciones preconfiguradas (que cubren casos de uso de lenguaje, código y embedding), realiza análisis de las causas raíz de los casos de fallo y proporciona orientación para resolverlos.

## Controlador de devolución de llamada de UpTrain

Este cuaderno muestra el controlador de devolución de llamada de UpTrain integrándose sin problemas en tu pipeline, facilitando diversas evaluaciones. Hemos elegido algunas evaluaciones que consideramos apropiadas para evaluar las cadenas. Estas evaluaciones se ejecutan automáticamente, con los resultados que se muestran en la salida. Más detalles sobre las evaluaciones de UpTrain se pueden encontrar [aquí](https://github.com/uptrain-ai/uptrain?tab=readme-ov-file#pre-built-evaluations-we-offer-).

Se destacan los retievers seleccionados de Langchain para su demostración:

### 1. **RAG Vanilla**:

RAG juega un papel crucial en la recuperación de contexto y la generación de respuestas. Para garantizar su rendimiento y la calidad de la respuesta, realizamos las siguientes evaluaciones:

- **[Relevancia del contexto](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**: Determina si el contexto extraído de la consulta es relevante para la respuesta.
- **[Precisión fáctica](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**: Evalúa si el LLM está alucinando o proporcionando información incorrecta.
- **[Integridad de la respuesta](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**: Comprueba si la respuesta contiene toda la información solicitada por la consulta.

### 2. **Generación de consultas múltiples**:

MultiQueryRetriever crea múltiples variantes de una pregunta con un significado similar a la pregunta original. Dada la complejidad, incluimos las evaluaciones anteriores y agregamos:

- **[Precisión de consultas múltiples](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: Asegura que las consultas múltiples generadas tienen el mismo significado que la consulta original.

### 3. **Compresión de contexto y reordenación**:

La reordenación implica reordenar los nodos en función de su relevancia para la consulta y elegir los n nodos principales. Dado que el número de nodos puede reducirse una vez que se complete la reordenación, realizamos las siguientes evaluaciones:

- **[Reordenación de contexto](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: Comprueba si el orden de los nodos reordenados es más relevante para la consulta que el orden original.
- **[Concisión del contexto](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: Examina si el número reducido de nodos sigue proporcionando toda la información necesaria.

Estas evaluaciones en conjunto garantizan la solidez y eficacia de RAG, MultiQueryRetriever y el proceso de Reordenación en la cadena.

## Instalar dependencias

```python
%pip install -qU langchain langchain_openai uptrain faiss-cpu flashrank
```

```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)

[33mWARNING: There was an error checking the latest version of pip.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

NOTA: también puedes instalar `faiss-gpu` en lugar de `faiss-cpu` si quieres usar la versión habilitada para GPU de la biblioteca.

## Importar bibliotecas

```python
from getpass import getpass

from langchain.chains import RetrievalQA
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import FlashrankRerank
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.runnables.passthrough import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)
```

## Cargar los documentos

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

## Dividir el documento en fragmentos

```python
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
chunks = text_splitter.split_documents(documents)
```

## Crear el recuperador

```python
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(chunks, embeddings)
retriever = db.as_retriever()
```

## Definir el LLM

```python
llm = ChatOpenAI(temperature=0, model="gpt-4")
```

## Establecer la clave de la API de openai

Esta clave es necesaria para realizar las evaluaciones. UpTrain utiliza los modelos GPT para evaluar las respuestas generadas por el LLM.

```python
OPENAI_API_KEY = getpass()
```

## Configuración

Para cada uno de los recuperadores a continuación, es mejor definir el controlador de devolución de llamada de nuevo para evitar interferencias. Puedes elegir entre las siguientes opciones para evaluar utilizando UpTrain:

### 1. **Software de código abierto (OSS) de UpTrain**:

Puedes utilizar el servicio de evaluación de código abierto para evaluar tu modelo.
En este caso, deberás proporcionar una clave de API de OpenAI. Puedes obtener la tuya [aquí](https://platform.openai.com/account/api-keys).

Parámetros:
- key_type="openai"
- api_key="OPENAI_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

### 2. **Servicio gestionado y paneles de UpTrain**:

Puedes crear una cuenta gratuita de UpTrain [aquí](https://uptrain.ai/) y obtener créditos de prueba gratuitos. Si necesitas más créditos de prueba, [reserva una llamada con los responsables de UpTrain aquí](https://calendly.com/uptrain-sourabh/30min).

El servicio gestionado de UpTrain proporciona:
1. Paneles con opciones avanzadas de desglose y filtrado
1. Información y temas comunes entre los casos de fallo
1. Observabilidad y monitorización en tiempo real de los datos de producción
1. Pruebas de regresión a través de una integración fluida con tus tuberías de CI/CD

El cuaderno contiene algunas capturas de pantalla de los paneles y la información que puedes obtener del servicio gestionado de UpTrain.

Parámetros:
- key_type="uptrain"
- api_key="UPTRAIN_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

**Nota:** El `project_name_prefix` se utilizará como prefijo para los nombres de los proyectos en el panel de UpTrain. Estos serán diferentes para los diferentes tipos de evaluaciones. Por ejemplo, si estableces project_name_prefix="langchain" y realizas la evaluación multi_query, el nombre del proyecto será "langchain_multi_query".

# 1. Vanilla RAG

El controlador de devolución de llamada UpTrain capturará automáticamente la consulta, el contexto y la respuesta una vez generados y ejecutará las siguientes tres evaluaciones *(Calificadas de 0 a 1)* en la respuesta:
- **[Relevancia del contexto](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**: Comprueba si el contexto extraído de la consulta es relevante para la respuesta.
- **[Precisión fáctica](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**: Comprueba qué tan precisa es la respuesta en términos fácticos.
- **[Integridad de la respuesta](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**: Comprueba si la respuesta contiene toda la información que solicita la consulta.

```python
# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

# Create the chain
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Create the uptrain callback handler
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:03:44.969[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:05.809[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that she is a former top litigator in private practice, a former federal public defender, and comes from a family of public school educators and police officers. He described her as a consensus builder and noted that since her nomination, she has received a broad range of support from various groups, including the Fraternal Order of Police and former judges appointed by both Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 2. Generación de consultas múltiples

El **MultiQueryRetriever** se utiliza para abordar el problema de que la canalización RAG puede no devolver el mejor conjunto de documentos en función de la consulta. Genera múltiples consultas que significan lo mismo que la consulta original y luego recupera documentos para cada una.

Para evaluar este recuperador, UpTrain ejecutará la siguiente evaluación:
- **[Precisión de consultas múltiples](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: Comprueba si las consultas múltiples generadas significan lo mismo que la consulta original.

```python
# Create the retriever
multi_query_retriever = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

chain = (
    {"context": multi_query_retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Invoke the chain with a query
question = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(question, config=config)
```

```output
[32m2024-04-17 17:04:10.675[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:16.804[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Multi Queries:
  - How did the president comment on Ketanji Brown Jackson?
  - What were the president's remarks regarding Ketanji Brown Jackson?
  - What statements has the president made about Ketanji Brown Jackson?

Multi Query Accuracy Score: 0.5

[32m2024-04-17 17:04:22.027[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:44.033[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that since her nomination, she has received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 3. Compresión de contexto y reordenación

El proceso de reordenación implica reordenar los nodos en función de la relevancia para la consulta y elegir los n nodos principales. Dado que el número de nodos puede reducirse una vez que se complete la reordenación, realizamos las siguientes evaluaciones:
- **[Reordenación de contexto](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: Comprueba si el orden de los nodos reordenados es más relevante para la consulta que el orden original.
- **[Concisión del contexto](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: Comprueba si el número reducido de nodos sigue proporcionando toda la información necesaria.

```python
# Create the retriever
compressor = FlashrankRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

# Create the chain
chain = RetrievalQA.from_chain_type(llm=llm, retriever=compression_retriever)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
result = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:04:46.462[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:53.561[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson

Context Conciseness Score: 0.0
Context Reranking Score: 1.0

[32m2024-04-17 17:04:56.947[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:05:16.551[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The President mentioned that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 0.5
```
