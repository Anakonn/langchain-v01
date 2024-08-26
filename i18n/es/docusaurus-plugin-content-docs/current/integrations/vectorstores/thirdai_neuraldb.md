---
translated: true
---

# ThirdAI NeuralDB

>[NeuralDB](https://www.thirdai.com/neuraldb-enterprise/) es un almacén de vectores optimizado para CPU y ajustable desarrollado por [ThirdAI](https://www.thirdai.com/).

## Inicialización

Hay dos métodos de inicialización:
- Desde cero: modelo básico
- Desde punto de control: cargar un modelo que se guardó anteriormente

Para todos los siguientes métodos de inicialización, se puede omitir el parámetro `thirdai_key` si se establece la variable de entorno `THIRDAI_KEY`.

Las claves de la API de ThirdAI se pueden obtener en https://www.thirdai.com/try-bolt/

```python
from langchain.vectorstores import NeuralDBVectorStore

# From scratch
vectorstore = NeuralDBVectorStore.from_scratch(thirdai_key="your-thirdai-key")

# From checkpoint
vectorstore = NeuralDBVectorStore.from_checkpoint(
    # Path to a NeuralDB checkpoint. For example, if you call
    # vectorstore.save("/path/to/checkpoint.ndb") in one script, then you can
    # call NeuralDBVectorStore.from_checkpoint("/path/to/checkpoint.ndb") in
    # another script to load the saved model.
    checkpoint="/path/to/checkpoint.ndb",
    thirdai_key="your-thirdai-key",
)
```

## Insertar fuentes de documentos

```python
vectorstore.insert(
    # If you have PDF, DOCX, or CSV files, you can directly pass the paths to the documents
    sources=["/path/to/doc.pdf", "/path/to/doc.docx", "/path/to/doc.csv"],
    # When True this means that the underlying model in the NeuralDB will
    # undergo unsupervised pretraining on the inserted files. Defaults to True.
    train=True,
    # Much faster insertion with a slight drop in performance. Defaults to True.
    fast_mode=True,
)

from thirdai import neural_db as ndb

vectorstore.insert(
    # If you have files in other formats, or prefer to configure how
    # your files are parsed, then you can pass in NeuralDB document objects
    # like this.
    sources=[
        ndb.PDF(
            "/path/to/doc.pdf",
            version="v2",
            chunk_size=100,
            metadata={"published": 2022},
        ),
        ndb.Unstructured("/path/to/deck.pptx"),
    ]
)
```

## Búsqueda de similitud

Para consultar el almacén de vectores, puede usar el método estándar de LangChain `similarity_search`, que devuelve una lista de objetos de documento de LangChain. Cada objeto de documento representa un fragmento de texto de los archivos indexados. Por ejemplo, puede contener un párrafo de uno de los archivos PDF indexados. Además del texto, el campo de metadatos del documento contiene información como el ID del documento, la fuente de este documento (de qué archivo proviene) y la puntuación del documento.

```python
# This returns a list of LangChain Document objects
documents = vectorstore.similarity_search("query", k=10)
```

## Ajuste fino

NeuralDBVectorStore se puede ajustar finamente al comportamiento del usuario y al conocimiento específico del dominio. Se puede ajustar finamente de dos formas:
1. Asociación: el almacén de vectores asocia una frase de origen con una frase de destino. Cuando el almacén de vectores ve la frase de origen, también considerará los resultados relevantes para la frase de destino.
2. Votación positiva: el almacén de vectores aumenta el puntaje de un documento para una consulta específica. Esto es útil cuando desea ajustar finamente el almacén de vectores al comportamiento del usuario. Por ejemplo, si un usuario busca "cómo se fabrica un automóvil" y le gusta el documento devuelto con el id 52, entonces podemos votar positivamente el documento con el id 52 para la consulta "cómo se fabrica un automóvil".

```python
vectorstore.associate(source="source phrase", target="target phrase")
vectorstore.associate_batch(
    [
        ("source phrase 1", "target phrase 1"),
        ("source phrase 2", "target phrase 2"),
    ]
)

vectorstore.upvote(query="how is a car manufactured", document_id=52)
vectorstore.upvote_batch(
    [
        ("query 1", 52),
        ("query 2", 20),
    ]
)
```
