---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)の** [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform)は、独自のオープンソースモデルを実行するためのプラットフォームです。

この例では、LangChainを使ってSambaNova埋め込みモデルと対話する方法を説明します。

## SambaStudio

**SambaStudio**では、自分でファインチューニングしたオープンソースモデルの学習、バッチ推論ジョブの実行、オンライン推論エンドポイントのデプロイを行うことができます。

SambaStudio環境のデプロイが必要です。詳細は[sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)をご覧ください。

環境変数を登録します:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_EMBEDDINGS_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_EMBEDDINGS_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_EMBEDDINGS_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_EMBEDDINGS_API_KEY"] = sambastudio_api_key
```

LangChainから直接SambaStudio提供の埋め込みを呼び出しましょう!

```python
from langchain_community.embeddings.sambanova import SambaStudioEmbeddings

embeddings = SambaStudioEmbeddings()

text = "Hello, this is a test"
result = embeddings.embed_query(text)
print(result)

texts = ["Hello, this is a test", "Hello, this is another test"]
results = embeddings.embed_documents(texts)
print(results)
```
