---
translated: true
---

## Oracle Cloud Infrastructure Générateur d'IA

Oracle Cloud Infrastructure (OCI) Générateur d'IA est un service entièrement géré qui fournit un ensemble de modèles de langage de grande taille (LLM) à la pointe de la technologie et personnalisables, couvrant un large éventail d'cas d'utilisation, et disponibles via une seule API.
En utilisant le service OCI Générateur d'IA, vous pouvez accéder à des modèles pré-entraînés prêts à l'emploi, ou créer et héberger vos propres modèles personnalisés affinés en fonction de vos propres données sur des grappes IA dédiées. Une documentation détaillée du service et de l'API est disponible __[ici](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ et __[ici](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__.

Ce notebook explique comment utiliser les modèles OCI Générateur d'IA avec LangChain.

### Prérequis

Nous devrons installer le SDK oci

```python
!pip install -U oci
```

### Point de terminaison de l'API OCI Générateur d'IA

https://inference.generativeai.us-chicago-1.oci.oraclecloud.com

## Authentification

Les méthodes d'authentification prises en charge pour cette intégration langchain sont :

1. Clé API
2. Jeton de session
3. Instance principale
4. Ressource principale

Ceux-ci suivent les méthodes d'authentification standard du SDK détaillées __[ici](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__.

## Utilisation

```python
from langchain_community.embeddings import OCIGenAIEmbeddings

# use default authN method API-key
embeddings = OCIGenAIEmbeddings(
    model_id="MY_EMBEDDING_MODEL",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
)


query = "This is a query in English."
response = embeddings.embed_query(query)
print(response)

documents = ["This is a sample document", "and here is another one"]
response = embeddings.embed_documents(documents)
print(response)
```

```python
# Use Session Token to authN
embeddings = OCIGenAIEmbeddings(
    model_id="MY_EMBEDDING_MODEL",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
    auth_type="SECURITY_TOKEN",
    auth_profile="MY_PROFILE",  # replace with your profile name
)


query = "This is a sample query"
response = embeddings.embed_query(query)
print(response)

documents = ["This is a sample document", "and here is another one"]
response = embeddings.embed_documents(documents)
print(response)
```
