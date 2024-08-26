---
translated: true
---

# ElasticSearch BM25

>[Elasticsearch](https://www.elastic.co/elasticsearch/) est un moteur de recherche et d'analyse distribué et RESTful. Il fournit un moteur de recherche full-text distribué et multi-locataire avec une interface web HTTP et des documents JSON sans schéma.

>Dans la recherche d'information, [Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25) (BM est une abréviation de best matching) est une fonction de classement utilisée par les moteurs de recherche pour estimer la pertinence des documents par rapport à une requête de recherche donnée. Il est basé sur le cadre de récupération probabiliste développé dans les années 1970 et 1980 par Stephen E. Robertson, Karen Spärck Jones et d'autres.

>Le nom de la fonction de classement réelle est BM25. Le nom complet, Okapi BM25, inclut le nom du premier système à l'utiliser, qui était le système de recherche d'information Okapi, mis en œuvre à l'Université de la Ville de Londres dans les années 1980 et 1990. BM25 et ses variantes plus récentes, par exemple BM25F (une version de BM25 qui peut prendre en compte la structure du document et le texte d'ancrage), représentent des fonctions de récupération de type TF-IDF utilisées dans la récupération de documents.

Ce notebook montre comment utiliser un récupérateur qui utilise `ElasticSearch` et `BM25`.

Pour plus d'informations sur les détails de BM25, consultez [cet article de blog](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables).

```python
%pip install --upgrade --quiet  elasticsearch
```

```python
from langchain_community.retrievers import (
    ElasticSearchBM25Retriever,
)
```

## Créer un nouveau récupérateur

```python
elasticsearch_url = "http://localhost:9200"
retriever = ElasticSearchBM25Retriever.create(elasticsearch_url, "langchain-index-4")
```

```python
# Alternatively, you can load an existing index
# import elasticsearch
# elasticsearch_url="http://localhost:9200"
# retriever = ElasticSearchBM25Retriever(elasticsearch.Elasticsearch(elasticsearch_url), "langchain-index")
```

## Ajouter des textes (si nécessaire)

Nous pouvons éventuellement ajouter des textes au récupérateur (s'ils n'y sont pas déjà)

```python
retriever.add_texts(["foo", "bar", "world", "hello", "foo bar"])
```

```output
['cbd4cb47-8d9f-4f34-b80e-ea871bc49856',
 'f3bd2e24-76d1-4f9b-826b-ec4c0e8c7365',
 '8631bfc8-7c12-48ee-ab56-8ad5f373676e',
 '8be8374c-3253-4d87-928d-d73550a2ecf0',
 'd79f457b-2842-4eab-ae10-77aa420b53d7']
```

## Utiliser le récupérateur

Nous pouvons maintenant utiliser le récupérateur !

```python
result = retriever.invoke("foo")
```

```python
result
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={})]
```
