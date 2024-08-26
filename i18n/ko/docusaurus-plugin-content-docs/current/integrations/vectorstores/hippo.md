---
translated: true
---

# 히포

>[Transwarp Hippo](https://www.transwarp.cn/en/subproduct/hippo)는 대규모 벡터 기반 데이터세트의 저장, 검색 및 관리를 지원하는 엔터프라이즈 수준의 클라우드 네이티브 분산 벡터 데이터베이스입니다. 벡터 유사성 검색 및 고밀도 벡터 클러스터링과 같은 문제를 효율적으로 해결합니다. `Hippo`는 높은 가용성, 높은 성능 및 쉬운 확장성을 특징으로 합니다. 다중 벡터 검색 인덱스, 데이터 파티셔닝 및 샤딩, 데이터 지속성, 증분 데이터 수집, 벡터 스칼라 필드 필터링 및 혼합 쿼리와 같은 많은 기능을 제공합니다. 대규모 벡터 데이터에 대한 기업의 높은 실시간 검색 요구 사항을 효과적으로 충족할 수 있습니다.

## 시작하기

여기의 유일한 전제 조건은 OpenAI 웹사이트에서 API 키를 받는 것입니다. Hippo 인스턴스를 이미 시작했는지 확인하세요.

## 종속성 설치

초기에 OpenAI, Langchain 및 Hippo-API와 같은 특정 종속성을 설치해야 합니다. 환경에 맞는 적절한 버전을 설치해야 합니다.

```python
%pip install --upgrade --quiet  langchain tiktoken langchain-openai
%pip install --upgrade --quiet  hippo-api==1.1.0.rc3
```

```output
Requirement already satisfied: hippo-api==1.1.0.rc3 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (1.1.0rc3)
Requirement already satisfied: pyyaml>=6.0 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (from hippo-api==1.1.0.rc3) (6.0.1)
```

참고: Python 버전은 >=3.8이어야 합니다.

## 모범 사례

### 종속성 패키지 가져오기

```python
import os

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hippo import Hippo
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### 지식 문서 로드하기

```python
os.environ["OPENAI_API_KEY"] = "YOUR OPENAI KEY"
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

### 지식 문서 분할하기

여기서는 Langchain의 CharacterTextSplitter를 사용하여 분할합니다. 구분 기호는 마침표입니다. 분할 후 텍스트 세그먼트는 1000자를 초과하지 않으며 반복 문자 수는 0입니다.

```python
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 임베딩 모델 선언하기

아래에서는 Langchain의 OpenAIEmbeddings 메서드를 사용하여 OpenAI 또는 Azure 임베딩 모델을 생성합니다.

```python
# openai
embeddings = OpenAIEmbeddings()
# azure
# embeddings = OpenAIEmbeddings(
#     openai_api_type="azure",
#     openai_api_base="x x x",
#     openai_api_version="x x x",
#     model="x x x",
#     deployment="x x x",
#     openai_api_key="x x x"
# )
```

### Hippo 클라이언트 선언하기

```python
HIPPO_CONNECTION = {"host": "IP", "port": "PORT"}
```

### 문서 저장하기

```python
print("input...")
# insert docs
vector_store = Hippo.from_documents(
    docs,
    embedding=embeddings,
    table_name="langchain_test",
    connection_args=HIPPO_CONNECTION,
)
print("success")
```

```output
input...
success
```

### 지식 기반 질문 및 답변 수행하기

#### 대규모 언어 질문 답변 모델 생성하기

아래에서는 Langchain의 AzureChatOpenAI 및 ChatOpenAI 메서드를 각각 사용하여 OpenAI 또는 Azure 대규모 언어 질문 답변 모델을 생성합니다.

```python
# llm = AzureChatOpenAI(
#     openai_api_base="x x x",
#     openai_api_version="xxx",
#     deployment_name="xxx",
#     openai_api_key="xxx",
#     openai_api_type="azure"
# )

llm = ChatOpenAI(openai_api_key="YOUR OPENAI KEY", model_name="gpt-3.5-turbo-16k")
```

### 질문에 따른 관련 지식 획득하기:

```python
query = "Please introduce COVID-19"
# query = "Please introduce Hippo Core Architecture"
# query = "What operations does the Hippo Vector Database support for vector data?"
# query = "Does Hippo use hardware acceleration technology? Briefly introduce hardware acceleration technology."


# Retrieve similar content from the knowledge base,fetch the top two most similar texts.
res = vector_store.similarity_search(query, 2)
content_list = [item.page_content for item in res]
text = "".join(content_list)
```

### 프롬프트 템플릿 구성하기

```python
prompt = f"""
Please use the content of the following [Article] to answer my question. If you don't know, please say you don't know, and the answer should be concise."
[Article]:{text}
Please answer this question in conjunction with the above article:{query}
"""
```

### 대규모 언어 모델이 답변을 생성하도록 대기하기

```python
response_with_hippo = llm.predict(prompt)
print(f"response_with_hippo:{response_with_hippo}")
response = llm.predict(query)
print("==========================================")
print(f"response_without_hippo:{response}")
```

```output
response_with_hippo:COVID-19 is a virus that has impacted every aspect of our lives for over two years. It is a highly contagious and mutates easily, requiring us to remain vigilant in combating its spread. However, due to progress made and the resilience of individuals, we are now able to move forward safely and return to more normal routines.
==========================================
response_without_hippo:COVID-19 is a contagious respiratory illness caused by the novel coronavirus SARS-CoV-2. It was first identified in December 2019 in Wuhan, China and has since spread globally, leading to a pandemic. The virus primarily spreads through respiratory droplets when an infected person coughs, sneezes, talks, or breathes, and can also spread by touching contaminated surfaces and then touching the face. COVID-19 symptoms include fever, cough, shortness of breath, fatigue, muscle or body aches, sore throat, loss of taste or smell, headache, and in severe cases, pneumonia and organ failure. While most people experience mild to moderate symptoms, it can lead to severe illness and even death, particularly among older adults and those with underlying health conditions. To combat the spread of the virus, various preventive measures have been implemented globally, including social distancing, wearing face masks, practicing good hand hygiene, and vaccination efforts.
```
