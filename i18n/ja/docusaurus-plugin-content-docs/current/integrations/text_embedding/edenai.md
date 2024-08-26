---
translated: true
---

# EDEN AI

Eden AIは、最高のAIプロバイダーを統合することで、AIの世界を革新しています。ユーザーに無限の可能性を解き放ち、人工知能の真の可能性を活かすことができます。包括的で面倒なことのないワンストップのプラットフォームにより、ユーザーはAI機能をわずかな時間でプロダクションに展開でき、単一のAPIを通じて、AI機能の全範囲に簡単にアクセスできます。(ウェブサイト: https://edenai.co/)

このサンプルでは、LangChainを使ってEden AIの埋め込みモデルとやり取りする方法を説明します。

-----------------------------------------------------------------------------------

Eden AIのAPIにアクセスするには、APIキーが必要です。

アカウントを作成 https://app.edenai.run/user/register してこちらに進むことで、APIキーを取得できます https://app.edenai.run/admin/account/settings

キーが手に入ったら、次のように環境変数に設定しましょう:

```shell
export EDENAI_API_KEY="..."
```

環境変数を設定したくない場合は、EdenAI埋め込みクラスのインスタンス化時に、edenai_api_keyパラメーターでキーを直接渡すこともできます。

```python
from langchain_community.embeddings.edenai import EdenAiEmbeddings
```

```python
embeddings = EdenAiEmbeddings(edenai_api_key="...", provider="...")
```

## モデルの呼び出し

Eden AIのAPIは、さまざまなプロバイダーを統合しています。

特定のモデルにアクセスするには、"provider"を使って呼び出すことができます。

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
