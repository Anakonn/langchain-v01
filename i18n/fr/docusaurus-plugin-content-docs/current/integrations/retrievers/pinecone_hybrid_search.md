---
translated: true
---

# Recherche hybride Pinecone

>[Pinecone](https://docs.pinecone.io/docs/overview) est une base de données vectorielle avec de larges fonctionnalités.

Ce notebook explique comment utiliser un récupérateur qui utilise Pinecone et la recherche hybride sous le capot.

La logique de ce récupérateur est tirée [de cette documentation](https://docs.pinecone.io/docs/hybrid-search)

Pour utiliser Pinecone, vous devez avoir une clé API et un environnement.
Voici les [instructions d'installation](https://docs.pinecone.io/docs/quickstart).

```python
%pip install --upgrade --quiet  pinecone-client pinecone-text
```

```python
import getpass
import os

os.environ["PINECONE_API_KEY"] = getpass.getpass("Pinecone API Key:")
```

```python
from langchain_community.retrievers import (
    PineconeHybridSearchRetriever,
)
```

```python
os.environ["PINECONE_ENVIRONMENT"] = getpass.getpass("Pinecone Environment:")
```

Nous voulons utiliser `OpenAIEmbeddings`, donc nous devons obtenir la clé API OpenAI.

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Configuration de Pinecone

Vous ne devriez avoir à faire cette partie qu'une seule fois.

Remarque : il est important de s'assurer que le champ "context" qui contient le texte du document dans les métadonnées n'est pas indexé. Actuellement, vous devez spécifier explicitement les champs que vous voulez indexer. Pour plus d'informations, consultez la [documentation](https://docs.pinecone.io/docs/manage-indexes#selective-metadata-indexing) de Pinecone.

```python
import os

import pinecone

api_key = os.getenv("PINECONE_API_KEY") or "PINECONE_API_KEY"

index_name = "langchain-pinecone-hybrid-search"
```

```output
WhoAmIResponse(username='load', user_label='label', projectname='load-test')
```

```python
# create the index
pinecone.create_index(
    name=index_name,
    dimension=1536,  # dimensionality of dense model
    metric="dotproduct",  # sparse values supported only for dotproduct
    pod_type="s1",
    metadata_config={"indexed": []},  # see explanation above
)
```

Maintenant qu'il est créé, nous pouvons l'utiliser.

```python
index = pinecone.Index(index_name)
```

## Obtenir les embeddings et les encodeurs épars

Les embeddings sont utilisés pour les vecteurs denses, le tokenizer est utilisé pour le vecteur épars.

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

Pour encoder le texte en valeurs éparses, vous pouvez choisir SPLADE ou BM25. Pour les tâches hors domaine, nous vous recommandons d'utiliser BM25.

Pour plus d'informations sur les encodeurs épars, vous pouvez consulter la [documentation](https://pinecone-io.github.io/pinecone-text/pinecone_text.html) de la bibliothèque pinecone-text.

```python
from pinecone_text.sparse import BM25Encoder

# or from pinecone_text.sparse import SpladeEncoder if you wish to work with SPLADE

# use default tf-idf values
bm25_encoder = BM25Encoder().default()
```

Le code ci-dessus utilise les valeurs tfids par défaut. Il est fortement recommandé d'ajuster les valeurs tf-idf à votre propre corpus. Vous pouvez le faire comme suit :

```python
corpus = ["foo", "bar", "world", "hello"]

# fit tf-idf values on your corpus
bm25_encoder.fit(corpus)

# store the values to a json file
bm25_encoder.dump("bm25_values.json")

# load to your BM25Encoder object
bm25_encoder = BM25Encoder().load("bm25_values.json")
```

## Charger le récupérateur

Nous pouvons maintenant construire le récupérateur !

```python
retriever = PineconeHybridSearchRetriever(
    embeddings=embeddings, sparse_encoder=bm25_encoder, index=index
)
```

## Ajouter des textes (si nécessaire)

Nous pouvons éventuellement ajouter des textes au récupérateur (s'ils n'y sont pas déjà)

```python
retriever.add_texts(["foo", "bar", "world", "hello"])
```

```output
100%|██████████| 1/1 [00:02<00:00,  2.27s/it]
```

## Utiliser le récupérateur

Nous pouvons maintenant utiliser le récupérateur !

```python
result = retriever.invoke("foo")
```

```python
result[0]
```

```output
Document(page_content='foo', metadata={})
```
