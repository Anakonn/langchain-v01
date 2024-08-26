---
translated: true
---

## ओरेकल क्लाउड इंफ्रास्ट्रक्चर जनरेटिव एआई

ओरेकल क्लाउड इंफ्रास्ट्रक्चर (OCI) जनरेटिव एआई एक पूरी तरह से प्रबंधित सेवा है जो व्यापक उपयोग मामलों को कवर करने वाले स्टेट-ऑफ-द-आर्ट, अनुकूलनीय बड़े भाषा मॉडल (LLM) का एक सेट प्रदान करती है, जो एक एकल एपीआई के माध्यम से उपलब्ध है।
OCI जनरेटिव एआई सेवा का उपयोग करके आप तैयार-इस्तेमाल के लिए पूर्व-प्रशिक्षित मॉडल का उपयोग कर सकते हैं, या अपने डेटा पर आधारित अपने खुद के अनुकूलित कस्टम मॉडल बना और होस्ट कर सकते हैं। सेवा और एपीआई का विस्तृत प्रलेखन यहां __[उपलब्ध](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ और __[यहां](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__ है।

यह नोटबुक OCI के जनरेटिव एआई मॉडल का LangChain के साथ उपयोग करने की व्याख्या करता है।

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
