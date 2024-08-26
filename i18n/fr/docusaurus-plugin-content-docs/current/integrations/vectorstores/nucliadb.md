---
translated: true
---

# NucliaDB

Vous pouvez utiliser une instance locale de NucliaDB ou utiliser [Nuclia Cloud](https://nuclia.cloud).

Lors de l'utilisation d'une instance locale, vous avez besoin d'une clé API Nuclia Understanding afin que vos textes soient correctement vectorisés et indexés. Vous pouvez obtenir une clé en créant un compte gratuit sur [https://nuclia.cloud](https://nuclia.cloud), puis en [créant une clé NUA](https://docs.nuclia.dev/docs/docs/using/understanding/intro).

```python
%pip install --upgrade --quiet  langchain nuclia
```

## Utilisation avec nuclia.cloud

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

API_KEY = "YOUR_API_KEY"

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=False, api_key=API_KEY)
```

## Utilisation avec une instance locale

Remarque : Par défaut, `backend` est défini sur `http://localhost:8080`.

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=True, backend="http://my-local-server")
```

## Ajouter et supprimer des textes de votre Knowledge Box

```python
ids = ndb.add_texts(["This is a new test", "This is a second test"])
```

```python
ndb.delete(ids=ids)
```

## Rechercher dans votre Knowledge Box

```python
results = ndb.similarity_search("Who was inspired by Ada Lovelace?")
print(results[0].page_content)
```
