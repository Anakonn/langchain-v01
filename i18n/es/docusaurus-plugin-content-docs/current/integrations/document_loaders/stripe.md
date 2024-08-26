---
translated: true
---

# Stripe

>[Stripe](https://stripe.com/en-ca) es una empresa de servicios financieros y software como servicio (SaaS) irlando-estadounidense. Ofrece software de procesamiento de pagos y APIs de programación de aplicaciones para sitios web de comercio electrónico y aplicaciones móviles.

Este cuaderno cubre cómo cargar datos de la `API REST de Stripe` en un formato que se pueda ingerir en LangChain, junto con un ejemplo de uso para la vectorización.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import StripeLoader
```

La API de Stripe requiere un token de acceso, que se puede encontrar dentro del panel de Stripe.

Este cargador de documentos también requiere una opción `resource` que define qué datos desea cargar.

Los siguientes recursos están disponibles:

`balance_transations` [Documentación](https://stripe.com/docs/api/balance_transactions/list)

`charges` [Documentación](https://stripe.com/docs/api/charges/list)

`customers` [Documentación](https://stripe.com/docs/api/customers/list)

`events` [Documentación](https://stripe.com/docs/api/events/list)

`refunds` [Documentación](https://stripe.com/docs/api/refunds/list)

`disputes` [Documentación](https://stripe.com/docs/api/disputes/list)

```python
stripe_loader = StripeLoader("charges")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([stripe_loader])
stripe_doc_retriever = index.vectorstore.as_retriever()
```
