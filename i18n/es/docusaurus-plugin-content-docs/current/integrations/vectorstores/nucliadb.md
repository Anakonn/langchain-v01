---
translated: true
---

# NucliaDB

Puede usar una instancia local de NucliaDB o usar [Nuclia Cloud](https://nuclia.cloud).

Cuando use una instancia local, necesita una clave de la API de Nuclia Understanding, para que sus textos se vectoricen e indexen correctamente. Puede obtener una clave creando una cuenta gratuita en [https://nuclia.cloud](https://nuclia.cloud) y luego [crear una clave NUA](https://docs.nuclia.dev/docs/docs/using/understanding/intro).

```python
%pip install --upgrade --quiet  langchain nuclia
```

## Uso con nuclia.cloud

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

API_KEY = "YOUR_API_KEY"

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=False, api_key=API_KEY)
```

## Uso con una instancia local

Nota: de forma predeterminada, `backend` se establece en `http://localhost:8080`.

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=True, backend="http://my-local-server")
```

## Agregar y eliminar textos de su Knowledge Box

```python
ids = ndb.add_texts(["This is a new test", "This is a second test"])
```

```python
ndb.delete(ids=ids)
```

## Buscar en su Knowledge Box

```python
results = ndb.similarity_search("Who was inspired by Ada Lovelace?")
print(results[0].page_content)
```
