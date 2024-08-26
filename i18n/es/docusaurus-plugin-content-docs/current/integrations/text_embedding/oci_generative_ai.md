---
translated: true
---

## Oracle Cloud Infrastructure Generative AI

Oracle Cloud Infrastructure (OCI) Generative AI es un servicio totalmente administrado que proporciona un conjunto de modelos de lenguaje grandes y personalizables (LLM, por sus siglas en inglés), de última generación, que cubren una amplia gama de casos de uso y que están disponibles a través de una sola API.
Usando el servicio OCI Generative AI, puede acceder a modelos preentrenados listos para usar o crear y alojar sus propios modelos personalizados y ajustados en función de sus propios datos en clústeres de IA dedicados. La documentación detallada del servicio y la API está disponible __[aquí](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ y __[aquí](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__.

Este cuaderno explica cómo usar los modelos OCI Generative AI con LangChain.

### Requisito previo

Necesitaremos instalar el SDK de oci

```python
!pip install -U oci
```

### Punto final de la API OCI Generative AI

https://inference.generativeai.us-chicago-1.oci.oraclecloud.com

## Autenticación

Los métodos de autenticación compatibles para esta integración de langchain son:

1. API Key
2. Session token
3. Instance principal
4. Resource principal

Estos siguen los métodos de autenticación estándar del SDK detallados __[aquí](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__.

## Uso

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
