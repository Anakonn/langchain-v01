---
translated: true
---

# 心理学

このノートブックでは、`Psychic`からドキュメントをロードする方法について説明します。詳細は[こちら](/docs/integrations/providers/psychic)をご覧ください。

## 前提条件

1. [このドキュメント](/docs/integrations/providers/psychic)のクイックスタートセクションに従ってください
2. [Psychicダッシュボード](https://dashboard.psychic.dev/)にログインし、シークレットキーを取得してください
3. フロントエンドのreactライブラリをウェブアプリにインストールし、ユーザー認証を行ってください。接続は、指定した接続IDを使用して作成されます。

## ドキュメントのロード

`PsychicLoader`クラスを使用して、接続からドキュメントをロードします。各接続には、コネクタID(接続されたSaaSアプリに対応)と接続ID(フロントエンドライブラリに渡した)があります。

```python
# Uncomment this to install psychicapi if you don't already have it installed
!poetry run pip -q install psychicapi langchain-chroma
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.1.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from langchain_community.document_loaders import PsychicLoader
from psychicapi import ConnectorId

# Create a document loader for google drive. We can also load from other connectors by setting the connector_id to the appropriate value e.g. ConnectorId.notion.value
# This loader uses our test credentials
google_drive_loader = PsychicLoader(
    api_key="7ddb61c1-8b6a-4d31-a58e-30d1c9ea480e",
    connector_id=ConnectorId.gdrive.value,
    connection_id="google-test",
)

documents = google_drive_loader.load()
```

## ドキュメントをエンベディングに変換する

これらのドキュメントをエンベディングに変換し、Chromaなどのベクトルデータベースに保存することができます。

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_chroma import Chroma
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
docsearch = Chroma.from_documents(texts, embeddings)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
chain({"question": "what is psychic?"}, return_only_outputs=True)
```
