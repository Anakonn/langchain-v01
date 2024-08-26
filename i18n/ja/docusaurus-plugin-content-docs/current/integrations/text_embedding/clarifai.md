---
translated: true
---

# Clarifai

>[Clarifai](https://www.clarifai.com/)は、データ探索、データラベリング、モデルトレーニング、評価、推論など、AIライフサイクル全体を提供するAIプラットフォームです。

この例では、LangChainを使って`Clarifai`[モデル](https://clarifai.com/explore/models)と対話する方法を説明します。特にテキストエンベディングモデルは[こちら](https://clarifai.com/explore/models?page=1&perPage=24&filterData=%5B%7B%22field%22%3A%22model_type_id%22%2C%22value%22%3A%5B%22text-embedder%22%5D%7D%5D)にあります。

Clarifaiを使うには、アカウントとパーソナルアクセストークン(PAT)キーが必要です。
[こちら](https://clarifai.com/settings/security)からPATを取得または作成できます。

# 依存関係

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# インポート

ここでは、パーソナルアクセストークンを設定します。PATは、Clarifaiアカウントの[設定/セキュリティ](https://clarifai.com/settings/security)から確認できます。

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```python
# Import the required modules
from langchain.chains import LLMChain
from langchain_community.embeddings import ClarifaiEmbeddings
from langchain_core.prompts import PromptTemplate
```

# 入力

LLMチェーンで使用するプロンプトテンプレートを作成します:

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

# セットアップ

ユーザーIDとアプリIDを、モデルが存在するアプリケーションに設定します。https://clarifai.com/explore/modelsで公開モデルの一覧を確認できます。

また、モデルIDとモデルバージョンIDも初期化する必要があります。一部のモデルには複数のバージョンがあるため、タスクに適したバージョンを選択してください。

```python
USER_ID = "clarifai"
APP_ID = "main"
MODEL_ID = "BAAI-bge-base-en-v15"
MODEL_URL = "https://clarifai.com/clarifai/main/models/BAAI-bge-base-en-v15"

# Further you can also provide a specific model version as the model_version_id arg.
# MODEL_VERSION_ID = "MODEL_VERSION_ID"
```

```python
# Initialize a Clarifai embedding model
embeddings = ClarifaiEmbeddings(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)

# Initialize a clarifai embedding model using model URL
embeddings = ClarifaiEmbeddings(model_url=MODEL_URL)

# Alternatively you can initialize clarifai class with pat argument.
```

```python
text = "roses are red violets are blue."
text2 = "Make hay while the sun shines."
```

embed_query関数を使って、単一のテキストを埋め込むことができます。

```python
query_result = embeddings.embed_query(text)
```

さらに、embed_documents関数を使って、複数のテキストやドキュメントを一括で埋め込むこともできます。

```python
doc_result = embeddings.embed_documents([text, text2])
```
