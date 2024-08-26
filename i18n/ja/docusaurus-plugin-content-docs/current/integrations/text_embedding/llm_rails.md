---
translated: true
---

# LLMRails

LLMRailsエンベディングクラスをロードしましょう。

LLMRailsエンベディングを使用するには、引数でAPIキーを渡すか、`LLM_RAILS_API_KEY`キーで環境に設定する必要があります。
APIキーを取得するには、https://console.llmrails.com/signupにサインアップし、https://console.llmrails.com/api-keysに移動して、プラットフォームで1つのキーを作成した後、そこからキーをコピーする必要があります。

```python
from langchain_community.embeddings import LLMRailsEmbeddings
```

```python
embeddings = LLMRailsEmbeddings(model="embedding-english-v1")  # or embedding-multi-v1
```

```python
text = "This is a test document."
```

エンベディングを生成するには、個別のテキストを照会するか、テキストのリストを照会することができます。

```python
query_result = embeddings.embed_query(text)
query_result[:5]
```

```output
[-0.09996652603149414,
 0.015568195842206478,
 0.17670190334320068,
 0.16521021723747253,
 0.21193109452724457]
```

```python
doc_result = embeddings.embed_documents([text])
doc_result[0][:5]
```

```output
[-0.04242777079343796,
 0.016536075621843338,
 0.10052520781755447,
 0.18272875249385834,
 0.2079043835401535]
```
