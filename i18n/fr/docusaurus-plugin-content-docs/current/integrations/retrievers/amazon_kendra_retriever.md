---
translated: true
---

# Amazon Kendra

> [Amazon Kendra](https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html) est un service de recherche intelligent fourni par `Amazon Web Services` (`AWS`). Il utilise des algorithmes avancés de traitement du langage naturel (NLP) et d'apprentissage automatique pour permettre des capacités de recherche puissantes dans diverses sources de données au sein d'une organisation. `Kendra` est conçu pour aider les utilisateurs à trouver rapidement et avec précision les informations dont ils ont besoin, améliorant ainsi la productivité et la prise de décision.

> Avec `Kendra`, les utilisateurs peuvent effectuer des recherches dans une large gamme de types de contenu, notamment des documents, des FAQ, des bases de connaissances, des manuels et des sites Web. Il prend en charge plusieurs langues et peut comprendre des requêtes complexes, des synonymes et des significations contextuelles pour fournir des résultats de recherche très pertinents.

## Utilisation du récupérateur d'index Amazon Kendra

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.retrievers import AmazonKendraRetriever
```

Créer un nouveau récupérateur

```python
retriever = AmazonKendraRetriever(index_id="c0806df7-e76b-4bce-9b5c-d5582f6b1a03")
```

Vous pouvez maintenant utiliser les documents récupérés à partir de l'index Kendra

```python
retriever.invoke("what is langchain")
```
