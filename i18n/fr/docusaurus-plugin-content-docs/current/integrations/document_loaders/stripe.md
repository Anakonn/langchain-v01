---
translated: true
---

# Stripe

>[Stripe](https://stripe.com/en-ca) est une entreprise de services financiers et de logiciels en tant que service (SaaS) irlando-américaine. Elle offre des logiciels de traitement des paiements et des interfaces de programmation d'applications pour les sites web de commerce électronique et les applications mobiles.

Ce notebook couvre comment charger des données à partir de l'`API REST Stripe` dans un format qui peut être ingéré dans LangChain, ainsi que des exemples d'utilisation pour la vectorisation.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import StripeLoader
```

L'API Stripe nécessite un jeton d'accès, qui peut être trouvé dans le tableau de bord Stripe.

Ce chargeur de documents nécessite également une option `resource` qui définit les données que vous voulez charger.

Les ressources suivantes sont disponibles :

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
