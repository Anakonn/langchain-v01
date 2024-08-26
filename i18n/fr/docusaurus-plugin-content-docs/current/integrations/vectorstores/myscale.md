---
translated: true
---

# MyScale

>[MyScale](https://docs.myscale.com/en/overview/) est une base de données cloud optimisée pour les applications et solutions d'IA, construite sur l'open-source [ClickHouse](https://github.com/ClickHouse/ClickHouse).

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `MyScale`.

## Configuration des environnements

```python
%pip install --upgrade --quiet  clickhouse-connect
```

Nous voulons utiliser OpenAIEmbeddings, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["OPENAI_API_BASE"] = getpass.getpass("OpenAI Base:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale Host:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

Il existe deux façons de configurer les paramètres pour l'index `myscale`.

1. Variables d'environnement

    Avant d'exécuter l'application, veuillez définir la variable d'environnement avec `export` :
    `export MYSCALE_HOST='<your-endpoints-url>' MYSCALE_PORT=<your-endpoints-port> MYSCALE_USERNAME=<your-username> MYSCALE_PASSWORD=<your-password> ...`

    Vous pouvez facilement trouver votre compte, votre mot de passe et d'autres informations sur notre SaaS. Pour plus de détails, veuillez vous référer [à ce document](https://docs.myscale.com/en/cluster-management/).

    Chaque attribut sous `MyScaleSettings` peut être défini avec le préfixe `MYSCALE_` et n'est pas sensible à la casse.

2. Créer un objet `MyScaleSettings` avec les paramètres

    ```python
    from langchain_community.vectorstores import MyScale, MyScaleSettings
    config = MyScaleSetting(host="<your-backend-url>", port=8443, ...)
    index = MyScale(embedding_function, config)
    index.add_documents(...)
    ```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale
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
for d in docs:
    d.metadata = {"some": "metadata"}
docsearch = MyScale.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.66it/s]
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Obtenir les informations de connexion et le schéma de données

```python
print(str(docsearch))
```

## Filtrage

Vous pouvez avoir un accès direct à l'instruction SQL `WHERE` de `myscale`. Vous pouvez écrire une clause `WHERE` en suivant la syntaxe SQL standard.

**REMARQUE** : Soyez conscient des injections SQL, cette interface ne doit pas être appelée directement par l'utilisateur final.

Si vous avez personnalisé votre `column_map` dans vos paramètres, vous pouvez effectuer des recherches avec un filtre comme celui-ci :

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = MyScale.from_documents(docs, embeddings)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.68it/s]
```

### Recherche de similarité avec score

Le score de distance renvoyé est la distance cosinus. Par conséquent, un score plus faible est meilleur.

```python
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.229655921459198 {'doc_id': 0} Madam Speaker, Madam...
0.24506962299346924 {'doc_id': 8} And so many families...
0.24786919355392456 {'doc_id': 1} Groups of citizens b...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
```

## Supprimer vos données

Vous pouvez soit supprimer la table avec la méthode `.drop()`, soit supprimer partiellement vos données avec la méthode `.delete()`.

```python
# use directly a `where_str` to delete
docsearch.delete(where_str=f"{docsearch.metadata_column}.doc_id < 5")
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.24506962299346924 {'doc_id': 8} And so many families...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
0.26027143001556396 {'doc_id': 7} We see the unity amo...
0.26390212774276733 {'doc_id': 9} And unlike the $2 Tr...
```

```python
docsearch.drop()
```
