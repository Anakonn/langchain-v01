---
translated: true
---

# Qdrant

>[Qdrant](https://qdrant.tech/documentation/) (se lee: cuadrante) es un motor de búsqueda de similitud de vectores. Proporciona un servicio listo para producción con una API conveniente para almacenar, buscar y administrar puntos: vectores con una carga útil adicional. `Qdrant` está diseñado para un amplio soporte de filtrado. Lo que lo hace útil para todo tipo de coincidencias basadas en redes neuronales o semánticas, búsqueda facetada y otras aplicaciones.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores `Qdrant`.

Hay varios modos de ejecutar `Qdrant`, y dependiendo del elegido, habrá algunas diferencias sutiles. Las opciones incluyen:
- Modo local, sin servidor requerido
- Despliegue de servidor local
- Qdrant Cloud

Consulta las [instrucciones de instalación](https://qdrant.tech/documentation/install/).

```python
%pip install --upgrade --quiet  qdrant-client
```

Queremos usar `OpenAIEmbeddings`, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## Conectarse a Qdrant desde LangChain

### Modo local

El cliente de Python te permite ejecutar el mismo código en modo local sin ejecutar el servidor Qdrant. Eso es genial para probar cosas y depurar o si planeas almacenar solo una pequeña cantidad de vectores. Los incrustados podrían mantenerse completamente en memoria o persistirse en disco.

#### En memoria

Para algunos escenarios de prueba y experimentos rápidos, es posible que prefiera mantener todos los datos solo en memoria, por lo que se pierden cuando se destruye el cliente, generalmente al final de su script/cuaderno.

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",  # Local mode with in-memory storage only
    collection_name="my_documents",
)
```

#### Almacenamiento en disco

El modo local, sin usar el servidor Qdrant, también puede almacenar tus vectores en disco para que se persistan entre ejecuciones.

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    path="/tmp/local_qdrant",
    collection_name="my_documents",
)
```

### Despliegue de servidor local

Sin importar si eliges iniciar Qdrant localmente con [un contenedor Docker](https://qdrant.tech/documentation/install/) o seleccionar un despliegue de Kubernetes con [el gráfico oficial de Helm](https://github.com/qdrant/qdrant-helm), la forma de conectarte a dicha instancia será idéntica. Deberás proporcionar una URL que apunte al servicio.

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
)
```

### Qdrant Cloud

Si prefieres no ocuparte de administrar la infraestructura, puedes optar por configurar un clúster de Qdrant totalmente administrado en [Qdrant Cloud](https://cloud.qdrant.io/). Hay un clúster gratuito por siempre de 1 GB incluido para probar. La principal diferencia al usar una versión administrada de Qdrant es que deberás proporcionar una clave API para asegurar tu despliegue de acceso público.

```python
url = "<---qdrant cloud cluster url here --->"
api_key = "<---api key here--->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    api_key=api_key,
    collection_name="my_documents",
)
```

## Recrear la colección

Los métodos `Qdrant.from_texts` y `Qdrant.from_documents` son excelentes para comenzar a usar Qdrant con Langchain. En las versiones anteriores, la colección se recreaba cada vez que llamabas a cualquiera de ellos. Ese comportamiento ha cambiado. Actualmente, la colección se reutilizará si ya existe. Establecer `force_recreate` en `True` permite eliminar la colección antigua y comenzar de cero.

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
    force_recreate=True,
)
```

## Búsqueda de similitud

El escenario más sencillo para usar el almacén de vectores Qdrant es realizar una búsqueda de similitud. Debajo de la superficie, nuestra consulta se codificará con la `embedding_function` y se usará para encontrar documentos similares en la colección de Qdrant.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Búsqueda de similitud con puntuación

A veces es posible que queramos realizar la búsqueda, pero también obtener una puntuación de relevancia para saber qué tan bueno es un resultado en particular.
La puntuación de distancia devuelta es la distancia del coseno. Por lo tanto, una puntuación más baja es mejor.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Score: 0.8153784913324512
```

### Filtrado de metadatos

Qdrant tiene un [sistema de filtrado extenso](https://qdrant.tech/documentation/concepts/filtering/) con un rico soporte de tipos. También es posible usar los filtros en Langchain, pasando un parámetro adicional a los métodos `similarity_search_with_score` y `similarity_search`.

```python
from qdrant_client.http import models as rest

query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query, filter=rest.Filter(...))
```

## Búsqueda de relevancia marginal máxima (MMR)

Si deseas buscar algunos documentos similares, pero también deseas recibir resultados diversos, MMR es el método que debes considerar. La relevancia marginal máxima optimiza la similitud con la consulta Y la diversidad entre los documentos seleccionados.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

```python
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```

```output
1. Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

2. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```

## Qdrant como un Recuperador

Qdrant, como todos los demás almacenes de vectores, es un Recuperador de LangChain, utilizando la similitud del coseno.

```python
retriever = qdrant.as_retriever()
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='similarity', search_kwargs={})
```

También se puede especificar usar MMR como estrategia de búsqueda, en lugar de similitud.

```python
retriever = qdrant.as_retriever(search_type="mmr")
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='mmr', search_kwargs={})
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

## Personalizar Qdrant

Hay algunas opciones para usar una colección existente de Qdrant dentro de tu aplicación Langchain. En tales casos, es posible que necesites definir cómo asignar el punto de Qdrant al `Document` de Langchain.

### Vectores con nombre

Qdrant admite [múltiples vectores por punto](https://qdrant.tech/documentation/concepts/collections/#collection-with-multiple-vectors) mediante vectores con nombre. Langchain requiere solo un incrustado por documento y, de forma predeterminada, usa un solo vector. Sin embargo, si trabajas con una colección creada externamente o quieres que se use el vector con nombre, puedes configurarlo proporcionando su nombre.

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    vector_name="custom_vector",
)
```

Como usuario de Langchain, no verás ninguna diferencia si usas vectores con nombre o no. La integración de Qdrant manejará la conversión detrás de escena.

### Metadatos

Qdrant almacena tus incrustaciones vectoriales junto con la carga útil opcional tipo JSON. Las cargas útiles son opcionales, pero dado que LangChain asume que los incrustaciones se generan a partir de los documentos, mantenemos los datos de contexto, para que puedas extraer los textos originales también.

De forma predeterminada, tu documento se almacenará en la siguiente estructura de carga útil:

```json
{
    "page_content": "Lorem ipsum dolor sit amet",
    "metadata": {
        "foo": "bar"
    }
}
```

Sin embargo, puedes decidir usar diferentes claves para el contenido de la página y los metadatos. Esto es útil si ya tienes una colección que te gustaría reutilizar.

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    content_payload_key="my_page_content_key",
    metadata_payload_key="my_meta",
)
```

```output
<langchain_community.vectorstores.qdrant.Qdrant at 0x7fc4e2baa230>
```
