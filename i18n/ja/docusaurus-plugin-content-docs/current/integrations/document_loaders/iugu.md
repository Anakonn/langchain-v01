---
translated: true
---

# Iugu

>[Iugu](https://www.iugu.com/)は、ブラジルのサービスおよびソフトウェアサービス(SaaS)企業です。eコマースウェブサイトやモバイルアプリケーションのための決済処理ソフトウェアとアプリケーションプログラミングインターフェイスを提供しています。

このノートブックでは、LangChainに取り込むことができる形式でIugu REST APIからデータをロードする方法と、ベクトル化の使用例について説明します。

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import IuguLoader
```

Iugu APIにはアクセストークンが必要で、これはIuguダッシュボード内で見つけることができます。

このドキュメントローダーには、ロードするデータを定義する`resource`オプションも必要です。

利用可能なリソースは以下の通りです:

`Documentation` [Documentation](https://dev.iugu.com/reference/metadados)

```python
iugu_loader = IuguLoader("charges")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([iugu_loader])
iugu_doc_retriever = index.vectorstore.as_retriever()
```
