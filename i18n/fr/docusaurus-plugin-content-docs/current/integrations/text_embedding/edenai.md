---
translated: true
---

# EDEN AI

Eden AI révolutionne le paysage de l'IA en réunissant les meilleurs fournisseurs d'IA, permettant aux utilisateurs de débloquer des possibilités illimitées et d'exploiter tout le potentiel de l'intelligence artificielle. Avec une plateforme tout-en-un complète et sans tracas, elle permet aux utilisateurs de déployer des fonctionnalités d'IA en production à la vitesse de l'éclair, offrant un accès sans effort à toute la gamme des capacités de l'IA via une seule API. (site web : https://edenai.co/)

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles d'intégration d'Eden AI

-----------------------------------------------------------------------------------

L'accès à l'API EDENAI nécessite une clé API,

que vous pouvez obtenir en créant un compte https://app.edenai.run/user/register et en vous rendant ici https://app.edenai.run/admin/account/settings

Une fois que nous avons une clé, nous voudrons la définir comme une variable d'environnement en exécutant :

```shell
export EDENAI_API_KEY="..."
```

Si vous préférez ne pas définir de variable d'environnement, vous pouvez transmettre la clé directement via le paramètre nommé edenai_api_key

 lors de l'initialisation de la classe EdenAI embedding :

```python
from langchain_community.embeddings.edenai import EdenAiEmbeddings
```

```python
embeddings = EdenAiEmbeddings(edenai_api_key="...", provider="...")
```

## Appeler un modèle

L'API EdenAI rassemble différents fournisseurs.

Pour accéder à un modèle spécifique, vous pouvez simplement utiliser le "fournisseur" lors de l'appel.

```python
embeddings = EdenAiEmbeddings(provider="openai")
```

```python
docs = ["It's raining right now", "cats are cute"]
document_result = embeddings.embed_documents(docs)
```

```python
query = "my umbrella is broken"
query_result = embeddings.embed_query(query)
```

```python
import numpy as np

query_numpy = np.array(query_result)
for doc_res, doc in zip(document_result, docs):
    document_numpy = np.array(doc_res)
    similarity = np.dot(query_numpy, document_numpy) / (
        np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
    )
    print(f'Cosine similarity between "{doc}" and query: {similarity}')
```

```output
Cosine similarity between "It's raining right now" and query: 0.849261496107252
Cosine similarity between "cats are cute" and query: 0.7525900655705218
```
