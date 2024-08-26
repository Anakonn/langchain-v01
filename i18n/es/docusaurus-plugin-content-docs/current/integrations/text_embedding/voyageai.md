---
translated: true
---

# Viaje IA

>[Voyage AI](https://www.voyageai.com/) proporciona modelos de incrustación/vectorización de vanguardia.

Carguemos la clase Voyage AI Embedding. (Instala el paquete asociado LangChain con `pip install langchain-voyageai`)

```python
from langchain_voyageai import VoyageAIEmbeddings
```

Voyage AI utiliza claves API para monitorear el uso y administrar los permisos. Para obtener tu clave, crea una cuenta en nuestra [página de inicio](https://www.voyageai.com). Luego, crea un modelo VoyageEmbeddings con tu clave API. Puedes usar cualquiera de los siguientes modelos: ([source](https://docs.voyageai.com/docs/embeddings)):

- `voyage-large-2` (predeterminado)
- `voyage-code-2`
- `voyage-2`
- `voyage-law-2`
- `voyage-lite-02-instruct`

```python
embeddings = VoyageAIEmbeddings(
    voyage_api_key="[ Your Voyage API key ]", model="voyage-law-2"
)
```

Prepara los documentos y usa `embed_documents` para obtener sus incrustaciones.

```python
documents = [
    "Caching embeddings enables the storage or temporary caching of embeddings, eliminating the necessity to recompute them each time.",
    "An LLMChain is a chain that composes basic LLM functionality. It consists of a PromptTemplate and a language model (either an LLM or chat model). It formats the prompt template using the input key values provided (and also memory key values, if available), passes the formatted string to LLM and returns the LLM output.",
    "A Runnable represents a generic unit of work that can be invoked, batched, streamed, and/or transformed.",
]
```

```python
documents_embds = embeddings.embed_documents(documents)
```

```python
documents_embds[0][:5]
```

```output
[0.0562174916267395,
 0.018221192061901093,
 0.0025736060924828053,
 -0.009720131754875183,
 0.04108370840549469]
```

De manera similar, usa `embed_query` para incrustar la consulta.

```python
query = "What's an LLMChain?"
```

```python
query_embd = embeddings.embed_query(query)
```

```python
query_embd[:5]
```

```output
[-0.0052348352037370205,
 -0.040072452276945114,
 0.0033957737032324076,
 0.01763271726667881,
 -0.019235141575336456]
```

## Un sistema de recuperación minimalista

La principal característica de las incrustaciones es que la similitud del coseno entre dos incrustaciones captura la relación semántica de los pasajes originales correspondientes. Esto nos permite usar las incrustaciones para hacer una recuperación / búsqueda semántica.

 Podemos encontrar algunas incrustaciones más cercanas en las incrustaciones de los documentos en función de la similitud del coseno, y recuperar el documento correspondiente usando la clase `KNNRetriever` de LangChain.

```python
from langchain.retrievers import KNNRetriever

retriever = KNNRetriever.from_texts(documents, embeddings)

# retrieve the most relevant documents
result = retriever.invoke(query)
top1_retrieved_doc = result[0].page_content  # return the top1 retrieved result

print(top1_retrieved_doc)
```

```output
An LLMChain is a chain that composes basic LLM functionality. It consists of a PromptTemplate and a language model (either an LLM or chat model). It formats the prompt template using the input key values provided (and also memory key values, if available), passes the formatted string to LLM and returns the LLM output.
```
