---
translated: true
---

# 現代の財務

>[現代の財務](https://www.moderntreasury.com/)は複雑な支払い業務を簡素化します。これは、お金を動かす製品やプロセスを駆動するための統一されたプラットフォームです。
>- 銀行や支払いシステムに接続する
>- 取引と残高をリアルタイムで追跡する
>- 規模に合わせて支払い業務を自動化する

このノートブックでは、`Modern Treasury REST API`からデータをロードし、LangChainに取り込めるフォーマットにする方法と、ベクトル化の使用例について説明します。

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import ModernTreasuryLoader
```

Modern Treasury APIには、組織IDとAPIキーが必要で、これはModern Treasuryダッシュボードの開発者設定で見つけることができます。

このドキュメントローダーには、ロードするデータを定義する`resource`オプションも必要です。

利用可能なリソースは以下の通りです:

`payment_orders` [ドキュメント](https://docs.moderntreasury.com/reference/payment-order-object)

`expected_payments` [ドキュメント](https://docs.moderntreasury.com/reference/expected-payment-object)

`returns` [ドキュメント](https://docs.moderntreasury.com/reference/return-object)

`incoming_payment_details` [ドキュメント](https://docs.moderntreasury.com/reference/incoming-payment-detail-object)

`counterparties` [ドキュメント](https://docs.moderntreasury.com/reference/counterparty-object)

`internal_accounts` [ドキュメント](https://docs.moderntreasury.com/reference/internal-account-object)

`external_accounts` [ドキュメント](https://docs.moderntreasury.com/reference/external-account-object)

`transactions` [ドキュメント](https://docs.moderntreasury.com/reference/transaction-object)

`ledgers` [ドキュメント](https://docs.moderntreasury.com/reference/ledger-object)

`ledger_accounts` [ドキュメント](https://docs.moderntreasury.com/reference/ledger-account-object)

`ledger_transactions` [ドキュメント](https://docs.moderntreasury.com/reference/ledger-transaction-object)

`events` [ドキュメント](https://docs.moderntreasury.com/reference/events)

`invoices` [ドキュメント](https://docs.moderntreasury.com/reference/invoices)

```python
modern_treasury_loader = ModernTreasuryLoader("payment_orders")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([modern_treasury_loader])
modern_treasury_doc_retriever = index.vectorstore.as_retriever()
```
