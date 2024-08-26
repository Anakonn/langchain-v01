---
translated: true
---

# Voyage AI

>[Voyage AI](https://www.voyageai.com/)は最先端のエンベディング/ベクトル化モデルを提供しています。

Voyage AIエンベディングクラスをロードしましょう。 (LangChainパートナーパッケージを`pip install langchain-voyageai`でインストールしてください)

```python
from langchain_voyageai import VoyageAIEmbeddings
```

Voyage AIはAPIキーを使ってユーザーの使用状況を監視し、権限を管理しています。キーを取得するには、[ホームページ](https://www.voyageai.com)でアカウントを作成してください。次に、APIキーを使ってVoyageEmbeddingsモデルを作成します。以下のモデルから任意のものを使用できます: ([source](https://docs.voyageai.com/docs/embeddings)):

- `voyage-large-2` (デフォルト)
- `voyage-code-2`
- `voyage-2`
- `voyage-law-2`
- `voyage-lite-02-instruct`

```python
embeddings = VoyageAIEmbeddings(
    voyage_api_key="[ Your Voyage API key ]", model="voyage-law-2"
)
```

ドキュメントを準備し、`embed_documents`を使ってエンベディングを取得します。

```python
documents = [
    "Caching embeddings enables the storage or temporary caching of embeddings, eliminating the necessity to recompute them each time.",
    "An LLMChain is a chain that composes basic LLM functionality. It consists of a PromptTemplate and a language model (either an LLM or chat model). It formats the prompt template using the input key values provided (and also memory key values, if available), passes the formatted string to LLM and returns the LLM output.",
    "A Runnable represents a generic unit of work that can be invoked, batched, streamed, and/or transformed.",
]
```

```python
documents_embds = embeddings.embed_documents(documents)
```

```python
documents_embds[0][:5]
```

```output
[0.0562174916267395,
 0.018221192061901093,
 0.0025736060924828053,
 -0.009720131754875183,
 0.04108370840549469]
```

同様に、`embed_query`を使ってクエリをエンベディングします。

```python
query = "What's an LLMChain?"
```

```python
query_embd = embeddings.embed_query(query)
```

```python
query_embd[:5]
```

```output
[-0.0052348352037370205,
 -0.040072452276945114,
 0.0033957737032324076,
 0.01763271726667881,
 -0.019235141575336456]
```

## 最小限の検索システム

エンベディングの主な特徴は、2つのエンベディング間のコサイン類似度が、対応する元のパッセージの意味的関連性を捉えていることです。これにより、エンベディングを使ってセマンティック検索を行うことができます。

ドキュメントエンベディングの中から、コサイン類似度に基づいて最も近いエンベディングを数個見つけ、LangChainの`KNNRetriever`クラスを使ってその対応するドキュメントを取得することができます。

```python
from langchain.retrievers import KNNRetriever

retriever = KNNRetriever.from_texts(documents, embeddings)

# retrieve the most relevant documents
result = retriever.invoke(query)
top1_retrieved_doc = result[0].page_content  # return the top1 retrieved result

print(top1_retrieved_doc)
```

```output
An LLMChain is a chain that composes basic LLM functionality. It consists of a PromptTemplate and a language model (either an LLM or chat model). It formats the prompt template using the input key values provided (and also memory key values, if available), passes the formatted string to LLM and returns the LLM output.
```
