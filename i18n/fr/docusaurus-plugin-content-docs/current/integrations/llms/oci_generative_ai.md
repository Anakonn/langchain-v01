---
translated: true
---

## Oracle Cloud Infrastructure Générateur d'IA

Oracle Cloud Infrastructure (OCI) Générateur d'IA est un service entièrement géré qui fournit un ensemble de modèles de langage de pointe et personnalisables (LLM) couvrant un large éventail d'utilisations, et qui est accessible via une seule API.
En utilisant le service OCI Générateur d'IA, vous pouvez accéder à des modèles pré-entraînés prêts à l'emploi ou créer et héberger vos propres modèles personnalisés affinés en fonction de vos propres données sur des grappes IA dédiées. Une documentation détaillée du service et de l'API est disponible __[ici](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ et __[ici](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__.

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
from langchain_community.llms import OCIGenAI

# use default authN method API-key
llm = OCIGenAI(
    model_id="MY_MODEL",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
)

response = llm.invoke("Tell me one fact about earth", temperature=0.7)
print(response)
```

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

# Use Session Token to authN
llm = OCIGenAI(
    model_id="MY_MODEL",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
    auth_type="SECURITY_TOKEN",
    auth_profile="MY_PROFILE",  # replace with your profile name
    model_kwargs={"temperature": 0.7, "top_p": 0.75, "max_tokens": 200},
)

prompt = PromptTemplate(input_variables=["query"], template="{query}")

llm_chain = LLMChain(llm=llm, prompt=prompt)

response = llm_chain.invoke("what is the capital of france?")
print(response)
```

```python
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough
from langchain_community.embeddings import OCIGenAIEmbeddings
from langchain_community.vectorstores import FAISS

embeddings = OCIGenAIEmbeddings(
    model_id="MY_EMBEDDING_MODEL",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
)

vectorstore = FAISS.from_texts(
    [
        "Larry Ellison co-founded Oracle Corporation in 1977 with Bob Miner and Ed Oates.",
        "Oracle Corporation is an American multinational computer technology company headquartered in Austin, Texas, United States.",
    ],
    embedding=embeddings,
)

retriever = vectorstore.as_retriever()

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = PromptTemplate.from_template(template)

llm = OCIGenAI(
    model_id="MY_MODEL",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
)

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

print(chain.invoke("when was oracle founded?"))
print(chain.invoke("where is oracle headquartered?"))
```
