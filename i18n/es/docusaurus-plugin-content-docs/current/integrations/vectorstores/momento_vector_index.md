---
translated: true
---

# Índice de Vector de Momento (MVI)

>[MVI](https://gomomento.com): el índice de vector más productivo y fácil de usar, sin servidor, para tus datos. Para comenzar con MVI, simplemente regístrate en una cuenta. No hay necesidad de manejar la infraestructura, administrar servidores o preocuparte por el escalado. MVI es un servicio que se escala automáticamente para satisfacer tus necesidades.

Para registrarte y acceder a MVI, visita la [Consola de Momento](https://console.gomomento.com).

# Configuración

## Instalar requisitos previos

Necesitarás:
- el paquete [`momento`](https://pypi.org/project/momento/) para interactuar con MVI, y
- el paquete openai para interactuar con la API de OpenAI.
- el paquete tiktoken para tokenizar texto.

```python
%pip install --upgrade --quiet  momento langchain-openai tiktoken
```

## Ingresar claves API

```python
import getpass
import os
```

### Momento: para indexar datos

Visita la [Consola de Momento](https://console.gomomento.com) para obtener tu clave API.

```python
os.environ["MOMENTO_API_KEY"] = getpass.getpass("Momento API Key:")
```

### OpenAI: para incrustaciones de texto

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

# Carga tus datos

Aquí usamos el conjunto de datos de ejemplo de Langchain, el discurso del estado de la unión.

Primero cargamos los módulos relevantes:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MomentoVectorIndex
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Luego cargamos los datos:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
len(documents)
```

```output
1
```

Tenga en cuenta que los datos son un archivo grande, por lo que solo hay un documento:

```python
len(documents[0].page_content)
```

```output
38539
```

Dado que este es un archivo de texto grande, lo dividimos en fragmentos para la respuesta a preguntas. De esta manera, las preguntas de los usuarios se responderán desde el fragmento más relevante.

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
len(docs)
```

```output
42
```

# Indexa tus datos

Indexar tus datos es tan simple como instanciar el objeto `MomentoVectorIndex`. Aquí usamos el asistente `from_documents` para instanciar e indexar los datos:

```python
vector_db = MomentoVectorIndex.from_documents(
    docs, OpenAIEmbeddings(), index_name="sotu"
)
```

Esto se conecta al servicio Momento Vector Index usando tu clave API e indexa los datos. Si el índice no existía antes, este proceso lo crea para ti. Los datos ahora son buscables.

# Consulta tus datos

## Hacer una pregunta directamente contra el índice

La forma más directa de consultar los datos es buscar en el índice. Podemos hacer eso de la siguiente manera usando la API `VectorStore`:

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

Si bien esto contiene información relevante sobre Ketanji Brown Jackson, no tenemos una respuesta concisa y legible por humanos. Abordaremos eso en la siguiente sección.

## Usar un LLM para generar respuestas fluidas

Con los datos indexados en MVI, podemos integrarnos con cualquier cadena que aproveche la búsqueda de similitud vectorial. Aquí usamos la cadena `RetrievalQA` para demostrar cómo responder preguntas a partir de los datos indexados.

Primero cargamos los módulos relevantes:

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
```

Luego instanciamos la cadena de recuperación de preguntas:

```python
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
qa_chain = RetrievalQA.from_chain_type(llm, retriever=vector_db.as_retriever())
```

```python
qa_chain({"query": "What did the president say about Ketanji Brown Jackson?"})
```

```output
{'query': 'What did the president say about Ketanji Brown Jackson?',
 'result': "The President said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court. He described her as one of the nation's top legal minds and mentioned that she has received broad support from various groups, including the Fraternal Order of Police and former judges appointed by Democrats and Republicans."}
```

# Próximos pasos

¡Eso es todo! Ahora has indexado tus datos y puedes consultarlos usando el Índice de Vector de Momento. Puedes usar el mismo índice para consultar tus datos desde cualquier cadena que admita la búsqueda de similitud vectorial.

Con Momento, no solo puedes indexar tus datos vectoriales, sino también almacenar en caché tus llamadas a la API y almacenar el historial de tus mensajes de chat. Consulta las otras integraciones de Momento con Langchain para aprender más.

Para obtener más información sobre el Índice de Vector de Momento, visita la [Documentación de Momento](https://docs.gomomento.com).
