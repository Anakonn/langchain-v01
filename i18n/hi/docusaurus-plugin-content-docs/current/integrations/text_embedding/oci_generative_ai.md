---
translated: true
---

## Oracle Cloud Infrastructure जनरेटिव एआई

Oracle Cloud Infrastructure (OCI) जनरेटिव एआई एक पूरी तरह से प्रबंधित सेवा है जो विभिन्न प्रकार के उपयोग मामलों को कवर करने वाले अत्याधुनिक, अनुकूलनीय बड़े भाषा मॉडल (एलएलएम) का एक सेट प्रदान करती है, जो एक एकल एपीआई के माध्यम से उपलब्ध हैं।
OCI जनरेटिव एआई सेवा का उपयोग करके आप तैयार-इस्तेमाल के लिए पूर्व-प्रशिक्षित मॉडल का उपयोग कर सकते हैं, या अपने डेटा पर आधारित अपने खुद के अनुकूलित कस्टम मॉडल बना और होस्ट कर सकते हैं। सेवा और एपीआई का विस्तृत प्रलेखन यहां __[उपलब्ध](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ और __[यहां](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__ है।

यह नोटबुक OCI के जनरेटिव एआई मॉडल का LangChain के साथ उपयोग करने का तरीका समझाता है।

### पूर्वापेक्षा

हमें oci sdk को स्थापित करने की आवश्यकता होगी।

```python
!pip install -U oci
```

### OCI जनरेटिव एआई एपीआई एंडपॉइंट

https://inference.generativeai.us-chicago-1.oci.oraclecloud.com

## प्रमाणीकरण

इस langchain एकीकरण के लिए समर्थित प्रमाणीकरण विधियां हैं:

1. एपीआई कुंजी
2. सत्र टोकन
3. इंस्टेंस प्रिंसिपल
4. संसाधन प्रिंसिपल

ये __[यहां](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__ विस्तृत किए गए मानक एसडीके प्रमाणीकरण विधियों का पालन करते हैं।

## उपयोग

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
