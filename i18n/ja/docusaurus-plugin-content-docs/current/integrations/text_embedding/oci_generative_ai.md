---
translated: true
---

## Oracle Cloud Infrastructure Generative AI

Oracle Cloud Infrastructure (OCI) Generative AI は、幅広い用途をカバーする最先端の大規模言語モデル (LLM) を提供する完全管理型のサービスです。単一の API を通じて利用できます。

OCI Generative AI サービスを使用すると、事前に学習済みのモデルにアクセスしたり、専用の AI クラスターでお客様のデータに基づいてカスタムモデルを作成およびホストすることができます。このサービスと API の詳細なドキュメントは __[こちら](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ と __[こちら](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__ で確認できます。

このノートブックでは、LangChain を使用して OCI の Genrative AI モデルを使用する方法を説明します。

### 前提条件

oci sdk をインストールする必要があります。

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
