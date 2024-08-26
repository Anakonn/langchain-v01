---
translated: true
---

# Rockset

>[Rockset](https://rockset.com/) es una base de datos de búsqueda y análisis en tiempo real construida para la nube. Rockset utiliza un [Converged Index™](https://rockset.com/blog/converged-indexing-the-secret-sauce-behind-rocksets-fast-queries/) con un almacenamiento eficiente para incrustaciones vectoriales para servir consultas de búsqueda de baja latencia y alta concurrencia a escala. Rockset tiene soporte completo para filtrado de metadatos y maneja la ingesta en tiempo real de datos en constante actualización y transmisión.

Este cuaderno demuestra cómo usar `Rockset` como un almacén de vectores en LangChain. Antes de comenzar, asegúrese de tener acceso a una cuenta de `Rockset` y una clave API disponible. [Comience su prueba gratuita hoy.](https://rockset.com/create/)

## Configuración de tu entorno

1. Aproveche la consola de `Rockset` para crear una [colección](https://rockset.com/docs/collections/) con la API de escritura como su fuente. En este tutorial, creamos una colección llamada `langchain_demo`.

    Configure la siguiente [transformación de ingesta](https://rockset.com/docs/ingest-transformation/) para marcar su campo de incrustaciones y aprovechar las optimizaciones de rendimiento y almacenamiento:

   (Usamos OpenAI `text-embedding-ada-002` para estos ejemplos, donde #length_of_vector_embedding = 1536)

```sql
SELECT _input.* EXCEPT(_meta),
VECTOR_ENFORCE(_input.description_embedding, #length_of_vector_embedding, 'float') as description_embedding
FROM _input
```

2. Después de crear su colección, use la consola para recuperar una [clave API](https://rockset.com/docs/iam/#users-api-keys-and-roles). Para los fines de este cuaderno, asumimos que está utilizando la región `Oregon(us-west-2)`.

3. Instale el [cliente python de rockset](https://github.com/rockset/rockset-python-client) para permitir que LangChain se comunique directamente con `Rockset`.

```python
%pip install --upgrade --quiet  rockset
```

## Tutorial de LangChain

Siga en su propio cuaderno de Python para generar y almacenar incrustaciones vectoriales en Rockset.
Comience a usar Rockset para buscar documentos similares a sus consultas de búsqueda.

### 1. Definir variables clave

```python
import os

import rockset

ROCKSET_API_KEY = os.environ.get(
    "ROCKSET_API_KEY"
)  # Verify ROCKSET_API_KEY environment variable
ROCKSET_API_SERVER = rockset.Regions.usw2a1  # Verify Rockset region
rockset_client = rockset.RocksetClient(ROCKSET_API_SERVER, ROCKSET_API_KEY)

COLLECTION_NAME = "langchain_demo"
TEXT_KEY = "description"
EMBEDDING_KEY = "description_embedding"
```

### 2. Preparar documentos

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Rockset
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 3. Insertar documentos

```python
embeddings = OpenAIEmbeddings()  # Verify OPENAI_API_KEY environment variable

docsearch = Rockset(
    client=rockset_client,
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    text_key=TEXT_KEY,
    embedding_key=EMBEDDING_KEY,
)

ids = docsearch.add_texts(
    texts=[d.page_content for d in docs],
    metadatas=[d.metadata for d in docs],
)
```

### 4. Buscar documentos similares

```python
query = "What did the president say about Ketanji Brown Jackson"
output = docsearch.similarity_search_with_relevance_scores(
    query, 4, Rockset.DistanceFunction.COSINE_SIM
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.764990692109871 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7485416901622112 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7468678973398306 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7436231261419488 {'source': '../../../state_of_the_union.txt'} Groups of citizens b...
```

### 5. Buscar documentos similares con filtrado

```python
output = docsearch.similarity_search_with_relevance_scores(
    query,
    4,
    Rockset.DistanceFunction.COSINE_SIM,
    where_str="{} NOT LIKE '%citizens%'".format(TEXT_KEY),
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.7651359650263554 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7486265516824893 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7469625542348115 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7344177777547739 {'source': '../../../state_of_the_union.txt'} We see the unity amo...
```

### 6. [Opcional] Eliminar documentos insertados

Debe tener el ID único asociado con cada documento para eliminarlos de su colección.
Defina los ID al insertar documentos con `Rockset.add_texts()`. De lo contrario, Rockset generará un ID único para cada documento. En cualquier caso, `Rockset.add_texts()` devuelve los ID de los documentos insertados.

Para eliminar estos documentos, simplemente use la función `Rockset.delete_texts()`.

```python
docsearch.delete_texts(ids)
```

## Resumen

En este tutorial, creamos con éxito una colección `Rockset`, `insertamos` documentos con incrustaciones de OpenAI y buscamos documentos similares con y sin filtros de metadatos.

Esté atento a https://rockset.com/ para futuras actualizaciones en este espacio.
