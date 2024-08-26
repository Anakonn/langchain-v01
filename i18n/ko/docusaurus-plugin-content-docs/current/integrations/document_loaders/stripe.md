---
translated: true
---

# Stripe

>[Stripe](https://stripe.com/en-ca)는 아일랜드-미국 금융 서비스 및 소프트웨어 서비스(SaaS) 회사입니다. 전자 상거래 웹사이트와 모바일 애플리케이션을 위한 결제 처리 소프트웨어와 애플리케이션 프로그래밍 인터페이스를 제공합니다.

이 노트북은 `Stripe REST API`에서 데이터를 로드하여 LangChain에 수집할 수 있는 형식으로 만드는 방법과 벡터화를 위한 예제 사용법을 다룹니다.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import StripeLoader
```

Stripe API에는 액세스 토큰이 필요하며, 이는 Stripe 대시보드 내에서 찾을 수 있습니다.

이 문서 로더에는 `resource` 옵션도 필요한데, 이는 로드할 데이터를 정의합니다.

다음과 같은 리소스를 사용할 수 있습니다:

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
