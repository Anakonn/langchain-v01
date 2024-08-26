---
translated: true
---

# Tesorería Moderna

>[Tesorería Moderna](https://www.moderntreasury.com/) simplifica las complejas operaciones de pago. Es una plataforma unificada para impulsar productos y procesos que mueven dinero.
>- Conéctese a bancos y sistemas de pago
>- Realice un seguimiento de las transacciones y los saldos en tiempo real
>- Automatice las operaciones de pago para escalar

Este cuaderno abarca cómo cargar datos desde la `API REST de Tesorería Moderna` en un formato que se pueda ingerir en LangChain, junto con un ejemplo de uso para la vectorización.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import ModernTreasuryLoader
```

La API de Tesorería Moderna requiere un ID de organización y una clave API, que se pueden encontrar en el panel de control de Tesorería Moderna dentro de la configuración del desarrollador.

Este cargador de documentos también requiere una opción `resource` que define qué datos desea cargar.

Los siguientes recursos están disponibles:

`payment_orders` [Documentación](https://docs.moderntreasury.com/reference/payment-order-object)

`expected_payments` [Documentación](https://docs.moderntreasury.com/reference/expected-payment-object)

`returns` [Documentación](https://docs.moderntreasury.com/reference/return-object)

`incoming_payment_details` [Documentación](https://docs.moderntreasury.com/reference/incoming-payment-detail-object)

`counterparties` [Documentación](https://docs.moderntreasury.com/reference/counterparty-object)

`internal_accounts` [Documentación](https://docs.moderntreasury.com/reference/internal-account-object)

`external_accounts` [Documentación](https://docs.moderntreasury.com/reference/external-account-object)

`transactions` [Documentación](https://docs.moderntreasury.com/reference/transaction-object)

`ledgers` [Documentación](https://docs.moderntreasury.com/reference/ledger-object)

`ledger_accounts` [Documentación](https://docs.moderntreasury.com/reference/ledger-account-object)

`ledger_transactions` [Documentación](https://docs.moderntreasury.com/reference/ledger-transaction-object)

`events` [Documentación](https://docs.moderntreasury.com/reference/events)

`invoices` [Documentación](https://docs.moderntreasury.com/reference/invoices)

```python
modern_treasury_loader = ModernTreasuryLoader("payment_orders")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([modern_treasury_loader])
modern_treasury_doc_retriever = index.vectorstore.as_retriever()
```
