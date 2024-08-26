---
translated: true
---

# Metal

>[Metal](https://github.com/getmetal/metal-python) es un servicio administrado para incrustaciones de ML.

Este cuaderno muestra cómo usar el buscador de [Metal](https://docs.getmetal.io/introduction).

Primero, deberás registrarte en Metal y obtener una clave API. Puedes hacerlo [aquí](https://docs.getmetal.io/misc-create-app)

```python
%pip install --upgrade --quiet  metal_sdk
```

```python
from metal_sdk.metal import Metal

API_KEY = ""
CLIENT_ID = ""
INDEX_ID = ""

metal = Metal(API_KEY, CLIENT_ID, INDEX_ID)
```

## Ingerir documentos

Solo necesitas hacer esto si aún no has configurado un índice

```python
metal.index({"text": "foo1"})
metal.index({"text": "foo"})
```

```output
{'data': {'id': '642739aa7559b026b4430e42',
  'text': 'foo',
  'createdAt': '2023-03-31T19:51:06.748Z'}}
```

## Consulta

Ahora que nuestro índice está configurado, podemos configurar un buscador y comenzar a consultarlo.

```python
from langchain_community.retrievers import MetalRetriever
```

```python
retriever = MetalRetriever(metal, params={"limit": 2})
```

```python
retriever.invoke("foo1")
```

```output
[Document(page_content='foo1', metadata={'dist': '1.19209289551e-07', 'id': '642739a17559b026b4430e40', 'createdAt': '2023-03-31T19:50:57.853Z'}),
 Document(page_content='foo1', metadata={'dist': '4.05311584473e-06', 'id': '642738f67559b026b4430e3c', 'createdAt': '2023-03-31T19:48:06.769Z'})]
```
