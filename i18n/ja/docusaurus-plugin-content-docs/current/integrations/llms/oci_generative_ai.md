---
translated: true
---

## Oracle Cloud Infrastructure Generative AI

Oracle Cloud Infrastructure (OCI) Generative AI は、幅広い用途をカバーする最先端のカスタマイズ可能な大規模言語モデル (LLM) のフルマネージドサービスで、単一の API を通して利用できます。
OCI Generative AI サービスを使用すると、事前に学習済みのモデルにアクセスしたり、専用の AI クラスターでお客様のデータに基づいてカスタムモデルを作成およびホストすることができます。このサービスと API の詳細なドキュメントは __[こちら](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ と __[こちら](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__ で確認できます。

このノートブックでは、LangChain を使用して OCI の Genrative AI モデルを使用する方法を説明します。

### 前提条件

oci sdk をインストールする必要があります

```python
!pip install -U oci
```

### OCI Generative AI API エンドポイント

https://inference.generativeai.us-chicago-1.oci.oraclecloud.com

## 認証

このLangChain統合でサポートされる認証方法は以下の通りです:

1. API Key
2. Session token
3. Instance principal
4. Resource principal

これらは、__[こちら](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__ に詳述されている標準の SDK 認証方法に従います。

## 使用方法

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
