---
sidebar_position: 0
translated: true
---

# Recuperador respaldado por el almacén de vectores

Un recuperador de almacén de vectores es un recuperador que utiliza un almacén de vectores para recuperar documentos. Es un envoltorio ligero alrededor de la clase de almacén de vectores para hacerla cumplir con la interfaz de recuperador.
Utiliza los métodos de búsqueda implementados por un almacén de vectores, como la búsqueda de similitud y MMR, para consultar los textos en el almacén de vectores.

Una vez que construyes un almacén de vectores, es muy fácil construir un recuperador. Vamos a recorrer un ejemplo.

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../state_of_the_union.txt")
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
```

```python
retriever = db.as_retriever()
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## Recuperación de relevancia marginal máxima

De forma predeterminada, el recuperador de almacén de vectores utiliza la búsqueda de similitud. Si el almacén de vectores subyacente admite la búsqueda de relevancia marginal máxima, puede especificar ese tipo de búsqueda.

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## Recuperación con umbral de puntuación de similitud

También puede establecer un método de recuperación que establezca un umbral de puntuación de similitud y solo devuelva documentos con una puntuación por encima de ese umbral.

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.5}
)
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## Especificar el mejor k

También puede especificar los parámetros de búsqueda como `k` para usar al realizar la recuperación.

```python
retriever = db.as_retriever(search_kwargs={"k": 1})
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
len(docs)
```

```output
1
```
