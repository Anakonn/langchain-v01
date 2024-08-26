---
translated: true
---

# Stripe

>[Stripe](https://stripe.com/en-ca)はアイルランド系アメリカ人の金融サービスおよびソフトウェアサービス(SaaS)企業です。eコマースウェブサイトやモバイルアプリケーションのための決済処理ソフトウェアとアプリケーションプログラミングインターフェイスを提供しています。

このノートブックでは、LangChainに取り込めるフォーマットでデータを`Stripe REST API`からロードする方法と、ベクトル化の使用例について説明します。

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import StripeLoader
```

Stripe APIにはアクセストークンが必要で、これはStripeダッシュボード内で見つけることができます。

このドキュメントローダーには、ロードするデータを定義する`resource`オプションも必要です。

利用可能なリソースは以下の通りです:

`balance_transations` [Documentation](https://stripe.com/docs/api/balance_transactions/list)

`charges` [Documentation](https://stripe.com/docs/api/charges/list)

`customers` [Documentation](https://stripe.com/docs/api/customers/list)

`events` [Documentation](https://stripe.com/docs/api/events/list)

`refunds` [Documentation](https://stripe.com/docs/api/refunds/list)

`disputes` [Documentation](https://stripe.com/docs/api/disputes/list)

```python
stripe_loader = StripeLoader("charges")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([stripe_loader])
stripe_doc_retriever = index.vectorstore.as_retriever()
```
