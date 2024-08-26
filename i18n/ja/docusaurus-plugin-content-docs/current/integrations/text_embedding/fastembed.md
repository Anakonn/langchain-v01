---
translated: true
---

# Qdrantの FastEmbed

>[FastEmbed](https://qdrant.github.io/fastembed/)は[Qdrant](https://qdrant.tech)が提供する軽量で高速なPythonライブラリで、エンベディング生成に特化しています。

>- 量子化されたモデルウェイト
>- ONNX Runtime、PyTorchの依存なし
>- CPUファースト設計
>- 大規模データセットのエンコーディングにデータ並列処理を使用

## 依存関係

LangChainで FastEmbedを使用するには、`fastembed`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  fastembed
```

## インポート

```python
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
```

## FastEmbedのインスタンス化

### パラメータ

- `model_name: str` (デフォルト: "BAAI/bge-small-en-v1.5")
    > 使用するFastEmbeddingモデルの名前。サポートされているモデルのリストは[こちら](https://qdrant.github.io/fastembed/examples/Supported_Models/)にあります。

- `max_length: int` (デフォルト: 512)
    > トークンの最大数。512を超える値では動作が保証されません。

- `cache_dir: Optional[str]`
    > キャッシュディレクトリのパス。デフォルトは親ディレクトリの`local_cache`です。

- `threads: Optional[int]`
    > 単一のonnxruntimeセッションが使用するスレッド数。デフォルトはNoneです。

- `doc_embed_type: Literal["default", "passage"]` (デフォルト: "default")
    > "default": FastEmbedのデフォルトのエンベディング方法を使用します。
    > "passage": テキストの前に"passage"を付加してエンベディングします。

```python
embeddings = FastEmbedEmbeddings()
```

## 使用方法

### ドキュメントエンベディングの生成

```python
document_embeddings = embeddings.embed_documents(
    ["This is a document", "This is some other document"]
)
```

### クエリエンベディングの生成

```python
query_embeddings = embeddings.embed_query("This is a query")
```
