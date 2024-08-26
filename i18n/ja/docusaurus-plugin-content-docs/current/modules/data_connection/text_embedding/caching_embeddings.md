---
translated: true
---

# キャッシング

エンベディングは、再計算を避けるために保存または一時的にキャッシュできます。

エンベディングのキャッシングは、`CacheBackedEmbeddings`を使って行うことができます。キャッシュバックエンベダーは、エンベディングをキーバリューストアにキャッシュするラッパーです。テキストはハッシュ化され、そのハッシュがキャッシュのキーとして使用されます。

`CacheBackedEmbeddings`を初期化する主要な方法は`from_bytes_store`です。以下のパラメーターを受け取ります:

- underlying_embedder: 使用するエンベダー。
- document_embedding_cache: ドキュメントエンベディングをキャッシュするための任意の[`ByteStore`](/docs/integrations/stores/)。
- batch_size: (オプション、デフォルトは`None`)ストアの更新間に埋め込むドキュメントの数。
- namespace: (オプション、デフォルトは`""`)ドキュメントキャッシュに使用する名前空間。この名前空間は、他のキャッシュとの衝突を避けるために使用されます。例えば、使用する埋め込みモデルの名前に設定します。

**注意**:

- 同じテキストを異なるエンベディングモデルで埋め込む場合の衝突を避けるため、`namespace`パラメーターを必ず設定してください。
- 現在、`CacheBackedEmbeddings`は`embed_query()`や`aembed_query()`メソッドで作成されたエンベディングをキャッシュしません。

```python
from langchain.embeddings import CacheBackedEmbeddings
```

## ベクトルストアとの連携

まず、ローカルファイルシステムでエンベディングを保存し、FAISSベクトルストアを使って検索する例を見てみましょう。

```python
%pip install --upgrade --quiet  langchain-openai faiss-cpu
```

```python
from langchain.storage import LocalFileStore
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

underlying_embeddings = OpenAIEmbeddings()

store = LocalFileStore("./cache/")

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```

キャッシュは、エンベディングを行う前は空です:

```python
list(store.yield_keys())
```

```output
[]
```

ドキュメントを読み込み、チャンクに分割し、各チャンクを埋め込んでベクトルストアにロードします。

```python
raw_documents = TextLoader("../../state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
```

ベクトルストアを作成します:

```python
%%time
db = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 218 ms, sys: 29.7 ms, total: 248 ms
Wall time: 1.02 s
```

ベクトルストアを再度作成しようとすると、エンベディングを再計算する必要がないため、はるかに高速になります。

```python
%%time
db2 = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 15.7 ms, sys: 2.22 ms, total: 18 ms
Wall time: 17.2 ms
```

作成されたエンベディングの一部を表示します:

```python
list(store.yield_keys())[:5]
```

```output
['text-embedding-ada-00217a6727d-8916-54eb-b196-ec9c9d6ca472',
 'text-embedding-ada-0025fc0d904-bd80-52da-95c9-441015bfb438',
 'text-embedding-ada-002e4ad20ef-dfaa-5916-9459-f90c6d8e8159',
 'text-embedding-ada-002ed199159-c1cd-5597-9757-f80498e8f17b',
 'text-embedding-ada-0021297d37a-2bc1-5e19-bf13-6c950f075062']
```

# 別の`ByteStore`への切り替え

別の`ByteStore`を使用するには、`CacheBackedEmbeddings`を作成する際にそれを使用するだけです。以下では、永続的ではない`InMemoryByteStore`を使用する同等のキャッシュ付きエンベディングオブジェクトを作成しています:

```python
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```
