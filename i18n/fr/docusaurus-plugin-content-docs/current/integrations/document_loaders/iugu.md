---
translated: true
---

# Iugu

>[Iugu](https://www.iugu.com/) est une entreprise brésilienne de services et de logiciels en tant que service (SaaS). Elle offre des logiciels de traitement des paiements et des interfaces de programmation d'applications pour les sites de commerce électronique et les applications mobiles.

Ce notebook couvre comment charger des données de l'`API REST Iugu` dans un format pouvant être ingéré dans LangChain, ainsi que des exemples d'utilisation pour la vectorisation.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import IuguLoader
```

L'API Iugu nécessite un jeton d'accès, qui peut être trouvé dans le tableau de bord Iugu.

Ce chargeur de documents nécessite également une option `resource` qui définit les données que vous voulez charger.

Les ressources suivantes sont disponibles :

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
