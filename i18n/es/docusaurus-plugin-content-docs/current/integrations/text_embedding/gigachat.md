---
translated: true
---

# GigaChat

Este cuaderno muestra cómo usar LangChain con los [incrustaciones de GigaChat](https://developers.sber.ru/portal/products/gigachat).
Para usar, necesitas instalar el paquete de Python ```gigachat```.

```python
%pip install --upgrade --quiet  gigachat
```

Para obtener las credenciales de GigaChat, necesitas [crear una cuenta](https://developers.sber.ru/studio/login) y [obtener acceso a la API](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)

## Ejemplo

```python
import os
from getpass import getpass

os.environ["GIGACHAT_CREDENTIALS"] = getpass()
```

```python
from langchain_community.embeddings import GigaChatEmbeddings

embeddings = GigaChatEmbeddings(verify_ssl_certs=False, scope="GIGACHAT_API_PERS")
```

```python
query_result = embeddings.embed_query("The quick brown fox jumps over the lazy dog")
```

```python
query_result[:5]
```

```output
[0.8398333191871643,
 -0.14180311560630798,
 -0.6161925792694092,
 -0.17103666067123413,
 1.2884578704833984]
```
