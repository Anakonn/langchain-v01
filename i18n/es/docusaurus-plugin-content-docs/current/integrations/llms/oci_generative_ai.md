---
translated: true
---

## Oracle Cloud Infrastructure Generative AI

Oracle Cloud Infrastructure (OCI) Generative AI es un servicio totalmente administrado que proporciona un conjunto de modelos de lenguaje grandes y personalizables (LLM) de última generación que cubren una amplia gama de casos de uso, y que está disponible a través de una sola API.
Usando el servicio OCI Generative AI, puede acceder a modelos preentrenados listos para usar, o crear y alojar sus propios modelos personalizados y ajustados en función de sus propios datos en clústeres de IA dedicados. La documentación detallada del servicio y la API está disponible __[aquí](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ y __[aquí](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__.

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

1. Clave API
2. Token de sesión
3. Instancia principal
4. Recurso principal

Estos siguen los métodos de autenticación estándar del SDK detallados __[aquí](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__.

## Uso

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
