---
translated: true
---

# ERNIE

[ERNIE Embedding-V1](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/alj562vvu) est un modèle de représentation de texte basé sur la technologie de modèle à grande échelle `Baidu Wenxin`, qui convertit le texte en une forme vectorielle représentée par des valeurs numériques, et est utilisé dans la recherche de texte, les recommandations d'informations, l'exploration de connaissances et d'autres scénarios.

**Avertissement de dépréciation**

Nous recommandons aux utilisateurs utilisant `langchain_community.embeddings.ErnieEmbeddings` d'utiliser `langchain_community.embeddings.QianfanEmbeddingsEndpoint` à la place.

la documentation pour `QianfanEmbeddingsEndpoint` se trouve [ici](/docs/integrations/text_embedding/baidu_qianfan_endpoint/).

Voici les 2 raisons pour lesquelles nous recommandons aux utilisateurs d'utiliser `QianfanEmbeddingsEndpoint` :

1. `QianfanEmbeddingsEndpoint` prend en charge plus de modèles d'intégration sur la plateforme Qianfan.
2. `ErnieEmbeddings` manque de maintenance et est déprécié.

Quelques conseils pour la migration :

```python
from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## Utilisation

```python
from langchain_community.embeddings import ErnieEmbeddings
```

```python
embeddings = ErnieEmbeddings()
```

```python
query_result = embeddings.embed_query("foo")
```

```python
doc_results = embeddings.embed_documents(["foo"])
```
