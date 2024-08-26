---
translated: true
---

# 현대 재무부

>[현대 재무부](https://www.moderntreasury.com/)는 복잡한 지불 운영을 단순화합니다. 이는 자금을 이동시키는 제품과 프로세스를 구동하는 통합 플랫폼입니다.
>- 은행 및 지불 시스템에 연결
>- 실시간으로 거래 및 잔액 추적
>- 규모에 맞게 지불 운영 자동화

이 노트북에서는 `Modern Treasury REST API`에서 데이터를 로드하여 LangChain에 수집할 수 있는 형식으로 변환하는 방법과 벡터화를 위한 예제 사용법을 다룹니다.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import ModernTreasuryLoader
```

Modern Treasury API를 사용하려면 조직 ID와 API 키가 필요하며, 이는 개발자 설정의 Modern Treasury 대시보드에서 찾을 수 있습니다.

이 문서 로더에는 `resource` 옵션도 필요한데, 이는 로드할 데이터를 정의합니다.

다음과 같은 리소스를 사용할 수 있습니다:

`payment_orders` [문서](https://docs.moderntreasury.com/reference/payment-order-object)

`expected_payments` [문서](https://docs.moderntreasury.com/reference/expected-payment-object)

`returns` [문서](https://docs.moderntreasury.com/reference/return-object)

`incoming_payment_details` [문서](https://docs.moderntreasury.com/reference/incoming-payment-detail-object)

`counterparties` [문서](https://docs.moderntreasury.com/reference/counterparty-object)

`internal_accounts` [문서](https://docs.moderntreasury.com/reference/internal-account-object)

`external_accounts` [문서](https://docs.moderntreasury.com/reference/external-account-object)

`transactions` [문서](https://docs.moderntreasury.com/reference/transaction-object)

`ledgers` [문서](https://docs.moderntreasury.com/reference/ledger-object)

`ledger_accounts` [문서](https://docs.moderntreasury.com/reference/ledger-account-object)

`ledger_transactions` [문서](https://docs.moderntreasury.com/reference/ledger-transaction-object)

`events` [문서](https://docs.moderntreasury.com/reference/events)

`invoices` [문서](https://docs.moderntreasury.com/reference/invoices)

```python
modern_treasury_loader = ModernTreasuryLoader("payment_orders")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([modern_treasury_loader])
modern_treasury_doc_retriever = index.vectorstore.as_retriever()
```
