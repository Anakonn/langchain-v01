---
translated: true
---

# DingoDB

>[DingoDB](https://dingodb.readthedocs.io/en/latest/) es una base de datos de vectores distribuida y multimodal, que combina las características de los lagos de datos y las bases de datos de vectores, y puede almacenar datos de cualquier tipo y tamaño (Key-Value, PDF, audio, video, etc.). Tiene capacidades de procesamiento en tiempo real de baja latencia para lograr una rápida comprensión y respuesta, y puede realizar análisis instantáneos y procesar datos multimodales de manera eficiente.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores DingoDB.

Para ejecutar, debe tener una [instancia de DingoDB en ejecución](https://github.com/dingodb/dingo-deploy/blob/main/README.md).

```python
%pip install --upgrade --quiet  dingodb
# or install latest:
%pip install --upgrade --quiet  git+https://git@github.com/dingodb/pydingo.git
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
from dingodb import DingoDB

index_name = "langchain_demo"

dingo_client = DingoDB(user="", password="", host=["127.0.0.1:13000"])
# First, check if our index already exists. If it doesn't, we create it
if (
    index_name not in dingo_client.get_index()
    and index_name.upper() not in dingo_client.get_index()
):
    # we create a new index, modify to your own
    dingo_client.create_index(
        index_name=index_name, dimension=1536, metric_type="cosine", auto_id=False
    )

# The OpenAI embedding model `text-embedding-ada-002 uses 1536 dimensions`
docsearch = Dingo.from_documents(
    docs, embeddings, client=dingo_client, index_name=index_name
)
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```

### Agregar más texto a un índice existente

Se puede incrustar y actualizar más texto en un índice Dingo existente usando la función `add_texts`

```python
vectorstore = Dingo(embeddings, "text", client=dingo_client, index_name=index_name)

vectorstore.add_texts(["More text!"])
```

### Búsquedas de relevancia marginal máxima

Además de usar la búsqueda de similitud en el objeto del recuperador, también puedes usar `mmr` como recuperador.

```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

O usar `max_marginal_relevance_search` directamente:

```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```
