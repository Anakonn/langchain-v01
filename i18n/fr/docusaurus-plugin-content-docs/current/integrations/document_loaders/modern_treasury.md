---
translated: true
---

# Trésorerie moderne

>[Trésorerie moderne](https://www.moderntreasury.com/) simplifie les opérations de paiement complexes. C'est une plateforme unifiée pour alimenter les produits et les processus qui déplacent l'argent.
>- Se connecter aux banques et aux systèmes de paiement
>- Suivre les transactions et les soldes en temps réel
>- Automatiser les opérations de paiement pour l'évolutivité

Ce notebook couvre comment charger des données de l'`API REST de Trésorerie moderne` dans un format pouvant être ingéré dans LangChain, ainsi que des exemples d'utilisation pour la vectorisation.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import ModernTreasuryLoader
```

L'API Trésorerie moderne nécessite un ID d'organisation et une clé API, qui peuvent être trouvés dans le tableau de bord Trésorerie moderne dans les paramètres du développeur.

Ce chargeur de documents nécessite également une option `resource` qui définit les données que vous voulez charger.

Les ressources suivantes sont disponibles :

`payment_orders` [Documentation](https://docs.moderntreasury.com/reference/payment-order-object)

`expected_payments` [Documentation](https://docs.moderntreasury.com/reference/expected-payment-object)

`returns` [Documentation](https://docs.moderntreasury.com/reference/return-object)

`incoming_payment_details` [Documentation](https://docs.moderntreasury.com/reference/incoming-payment-detail-object)

`counterparties` [Documentation](https://docs.moderntreasury.com/reference/counterparty-object)

`internal_accounts` [Documentation](https://docs.moderntreasury.com/reference/internal-account-object)

`external_accounts` [Documentation](https://docs.moderntreasury.com/reference/external-account-object)

`transactions` [Documentation](https://docs.moderntreasury.com/reference/transaction-object)

`ledgers` [Documentation](https://docs.moderntreasury.com/reference/ledger-object)

`ledger_accounts` [Documentation](https://docs.moderntreasury.com/reference/ledger-account-object)

`ledger_transactions` [Documentation](https://docs.moderntreasury.com/reference/ledger-transaction-object)

`events` [Documentation](https://docs.moderntreasury.com/reference/events)

`invoices` [Documentation](https://docs.moderntreasury.com/reference/invoices)

```python
modern_treasury_loader = ModernTreasuryLoader("payment_orders")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([modern_treasury_loader])
modern_treasury_doc_retriever = index.vectorstore.as_retriever()
```
