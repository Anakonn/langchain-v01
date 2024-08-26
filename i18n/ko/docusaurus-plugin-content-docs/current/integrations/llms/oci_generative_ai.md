---
translated: true
---

## Oracle Cloud Infrastructure 생성형 AI

Oracle Cloud Infrastructure (OCI) 생성형 AI는 다양한 사용 사례를 다루는 최신 맞춤형 대규모 언어 모델(LLM)을 제공하는 완전 관리형 서비스이며, 단일 API를 통해 사용할 수 있습니다.
OCI 생성형 AI 서비스를 사용하면 사전 학습된 모델을 바로 사용하거나 자체 데이터를 기반으로 전용 AI 클러스터에서 사용자 정의 모델을 생성하고 호스팅할 수 있습니다. 이 서비스와 API에 대한 자세한 설명은 __[여기](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ 와 __[여기](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__ 에서 확인할 수 있습니다.

이 노트북에서는 LangChain을 사용하여 OCI의 생성형 AI 모델을 사용하는 방법을 설명합니다.

### 필수 조건

oci sdk를 설치해야 합니다.

```python
!pip install -U oci
```

### OCI 생성형 AI API 엔드포인트

https://inference.generativeai.us-chicago-1.oci.oraclecloud.com

## 인증

이 langchain 통합에 지원되는 인증 방법은 다음과 같습니다:

1. API 키
2. 세션 토큰
3. 인스턴스 프린시펄
4. 리소스 프린시펄

이는 __[여기](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__ 에 자세히 설명된 표준 SDK 인증 방법을 따릅니다.

## 사용법

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
