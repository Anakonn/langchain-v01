---
translated: true
---

# Voyage AI

>[Voyage AI](https://www.voyageai.com/) fournit des modèles d'intégration/vectorisation de pointe.

Chargeons la classe Voyage AI Embedding. (Installez le package partenaire LangChain avec `pip install langchain-voyageai`)

```python
from langchain_voyageai import VoyageAIEmbeddings
```

Voyage AI utilise des clés API pour surveiller l'utilisation et gérer les autorisations. Pour obtenir votre clé, créez un compte sur notre [page d'accueil](https://www.voyageai.com). Ensuite, créez un modèle VoyageEmbeddings avec votre clé API. Vous pouvez utiliser l'un des modèles suivants : ([source](https://docs.voyageai.com/docs/embeddings)) :

- `voyage-large-2` (par défaut)
- `voyage-code-2`
- `voyage-2`
- `voyage-law-2`
- `voyage-lite-02-instruct`

```python
embeddings = VoyageAIEmbeddings(
    voyage_api_key="[ Your Voyage API key ]", model="voyage-law-2"
)
```

Préparez les documents et utilisez `embed_documents` pour obtenir leurs intégrations.

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

De même, utilisez `embed_query` pour intégrer la requête.

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

## Un système de récupération minimaliste

La principale caractéristique des intégrations est que la similarité cosinus entre deux intégrations capture la proximité sémantique des passages d'origine correspondants. Cela nous permet d'utiliser les intégrations pour faire de la récupération/recherche sémantique.

 Nous pouvons trouver quelques intégrations les plus proches dans les intégrations de documents en fonction de la similarité cosinus, et récupérer le document correspondant à l'aide de la classe `KNNRetriever` de LangChain.

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
