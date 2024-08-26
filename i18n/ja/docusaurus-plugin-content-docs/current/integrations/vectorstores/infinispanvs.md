---
translated: true
---

# Infinispan

Infinispanは、オープンソースのキーバリューデータグリッドで、シングルノードとして動作したり、分散して動作したりすることができます。

ベクトル検索は、リリース15.xから対応しています。
詳細は: [Infinispan Home](https://infinispan.org)

```python
# Ensure that all we need is installed
# You may want to skip this
%pip install sentence-transformers
%pip install langchain
%pip install langchain_core
%pip install langchain_community
```

# セットアップ

このデモを実行するには、認証なしで動作するInfinispanインスタンスと、データファイルが必要です。
次の3つのセルで行うことは:
- データファイルをダウンロードする
- 設定を作成する
- Dockerでインフィニスパンを実行する

```bash
%%bash
#get an archive of news
wget https://raw.githubusercontent.com/rigazilla/infinispan-vector/main/bbc_news.csv.gz
```

```bash
%%bash
#create infinispan configuration file
echo 'infinispan:
  cache-container:
    name: default
    transport:
      cluster: cluster
      stack: tcp
  server:
    interfaces:
      interface:
        name: public
        inet-address:
          value: 0.0.0.0
    socket-bindings:
      default-interface: public
      port-offset: 0
      socket-binding:
        name: default
        port: 11222
    endpoints:
      endpoint:
        socket-binding: default
        rest-connector:
' > infinispan-noauth.yaml
```

```python
!docker rm --force infinispanvs-demo
!docker run -d --name infinispanvs-demo -v $(pwd):/user-config  -p 11222:11222 infinispan/server:15.0 -c /user-config/infinispan-noauth.yaml
```

# コード

## 埋め込みモデルを選択する

このデモでは、
HuggingFaceの埋め込みモデルを使用しています。

```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings

model_name = "sentence-transformers/all-MiniLM-L12-v2"
hf = HuggingFaceEmbeddings(model_name=model_name)
```

## Infinispanキャッシュのセットアップ

Infinispanは非常に柔軟なキーバリューストアで、生のビットデータや複雑なデータ型を保存できます。
ユーザーはデータグリッドの設定に完全な自由を持っていますが、シンプルなデータ型の場合は、Pythonレイヤーによって自動的に設定されます。
この機能を活用して、アプリケーションに集中することができます。

## データの準備

このデモでは、デフォルトの設定を利用しているため、テキスト、メタデータ、ベクトルが同じキャッシュに保存されますが、他のオプションも可能です。
つまり、コンテンツは別の場所に保存され、ベクトルストアには実際のコンテンツへの参照のみが含まれるなどです。

```python
import csv
import gzip
import time

# Open the news file and process it as a csv
with gzip.open("bbc_news.csv.gz", "rt", newline="") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",", quotechar='"')
    i = 0
    texts = []
    metas = []
    embeds = []
    for row in spamreader:
        # first and fifth values are joined to form the content
        # to be processed
        text = row[0] + "." + row[4]
        texts.append(text)
        # Store text and title as metadata
        meta = {"text": row[4], "title": row[0]}
        metas.append(meta)
        i = i + 1
        # Change this to change the number of news you want to load
        if i >= 5000:
            break
```

# ベクトルストアに入力する

```python
# add texts and fill vector db

from langchain_community.vectorstores import InfinispanVS

ispnvs = InfinispanVS.from_texts(texts, hf, metas)
```

# 結果のドキュメントを表示するヘルパー関数

デフォルトでは、InfinispanVSは、`Document.page_content`にprotobuf `ŧext`フィールドを、`metadata`にprotobufの他のすべてのフィールド(ベクトルを除く)を返します。
この動作は、セットアップ時のラムダ関数で設定できます。

```python
def print_docs(docs):
    for res, i in zip(docs, range(len(docs))):
        print("----" + str(i + 1) + "----")
        print("TITLE: " + res.metadata["title"])
        print(res.page_content)
```

# 試してみよう!

以下にいくつかのサンプルクエリを示します。

```python
docs = ispnvs.similarity_search("European nations", 5)
print_docs(docs)
```

```python
print_docs(ispnvs.similarity_search("Milan fashion week begins", 2))
```

```python
print_docs(ispnvs.similarity_search("Stock market is rising today", 4))
```

```python
print_docs(ispnvs.similarity_search("Why cats are so viral?", 2))
```

```python
print_docs(ispnvs.similarity_search("How to stay young", 5))
```

```python
!docker rm --force infinispanvs-demo
```
