---
translated: true
---

# Inférence Xorbits (Xinference)

Ce cahier de notes explique comment utiliser les embeddings Xinference dans LangChain.

## Installation

Installez `Xinference` via PyPI :

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## Déployer Xinference localement ou dans un cluster distribué.

Pour un déploiement local, exécutez `xinference`.

Pour déployer Xinference dans un cluster, démarrez d'abord un superviseur Xinference à l'aide de `xinference-supervisor`. Vous pouvez également utiliser l'option -p pour spécifier le port et -H pour spécifier l'hôte. Le port par défaut est 9997.

Ensuite, démarrez les workers Xinference à l'aide de `xinference-worker` sur chaque serveur où vous voulez les exécuter.

Vous pouvez consulter le fichier README de [Xinference](https://github.com/xorbitsai/inference) pour plus d'informations.

## Wrapper

Pour utiliser Xinference avec LangChain, vous devez d'abord lancer un modèle. Vous pouvez utiliser l'interface en ligne de commande (CLI) pour le faire :

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 915845ee-2a04-11ee-8ed4-d29396a3f064
```

Un ID de modèle vous est retourné pour que vous puissiez l'utiliser. Maintenant, vous pouvez utiliser les embeddings Xinference avec LangChain :

```python
from langchain_community.embeddings import XinferenceEmbeddings

xinference = XinferenceEmbeddings(
    server_url="http://0.0.0.0:9997", model_uid="915845ee-2a04-11ee-8ed4-d29396a3f064"
)
```

```python
query_result = xinference.embed_query("This is a test query")
```

```python
doc_result = xinference.embed_documents(["text A", "text B"])
```

Enfin, terminez le modèle lorsque vous n'en avez plus besoin :

```python
!xinference terminate --model-uid "915845ee-2a04-11ee-8ed4-d29396a3f064"
```
