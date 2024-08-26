---
translated: true
---

# Xorbits inference (Xinference)

このノートブックでは、LangChainでXinference埋め込みを使用する方法について説明します。

## インストール

PyPIを通じて`Xinference`をインストールします:

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## ローカルまたは分散クラスターでXinferenceをデプロイする

ローカルデプロイメントの場合は、`xinference`を実行します。

Xinferenceをクラスターにデプロイするには、まず`xinference-supervisor`を使ってXinference監視者を起動します。ポートを指定するには-pオプション、ホストを指定するには-Hオプションを使用できます。デフォルトのポートは9997です。

次に、`xinference-worker`を使ってワーカーを各サーバーで起動します。

詳細は[Xinference](https://github.com/xorbitsai/inference)のREADMEファイルを参照してください。

## ラッパー

LangChainでXinferenceを使用するには、まずモデルを起動する必要があります。CLIを使って行うことができます:

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 915845ee-2a04-11ee-8ed4-d29396a3f064
```

モデルのUIDが返されるので、これを使ってLangChainでXinference埋め込みを使用できます:

```python
from langchain_community.embeddings import XinferenceEmbeddings

xinference = XinferenceEmbeddings(
    server_url="http://0.0.0.0:9997", model_uid="915845ee-2a04-11ee-8ed4-d29396a3f064"
)
```

```python
query_result = xinference.embed_query("This is a test query")
```

```python
doc_result = xinference.embed_documents(["text A", "text B"])
```

最後に、使用しなくなったらモデルを終了します:

```python
!xinference terminate --model-uid "915845ee-2a04-11ee-8ed4-d29396a3f064"
```
