---
translated: true
---

# ギガチャット

このノートブックは、[GigaChat embeddings](https://developers.sber.ru/portal/products/gigachat)を使用してLangChainを利用する方法を示しています。
使用するには```gigachat``` pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  gigachat
```

GigaChatのクレデンシャルを取得するには、[アカウントを作成する](https://developers.sber.ru/studio/login)と[APIへのアクセスを取得する](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)必要があります。

## 例

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
