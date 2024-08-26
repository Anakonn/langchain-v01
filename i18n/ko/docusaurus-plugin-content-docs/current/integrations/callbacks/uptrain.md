---
translated: true
---

<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/uptrain.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# UpTrain

> UpTrain [[github](https://github.com/uptrain-ai/uptrain) || [website](https://uptrain.ai/) || [docs](https://docs.uptrain.ai/getting-started/introduction)]는 LLM 애플리케이션을 평가하고 개선하기 위한 오픈 소스 플랫폼입니다. 20개 이상의 사전 구성된 체크(언어, 코드, 임베딩 사용 사례 포함)에 대한 등급을 제공하고, 실패 사례의 근본 원인 분석을 수행하며, 이를 해결하기 위한 지침을 제공합니다.

## UpTrain 콜백 핸들러

이 노트북은 다양한 평가를 용이하게 하기 위해 파이프라인에 원활하게 통합되는 UpTrain 콜백 핸들러를 보여줍니다. 체인을 평가하기에 적합하다고 생각되는 몇 가지 평가를 선택했습니다. 이러한 평가는 자동으로 실행되며, 결과는 출력에 표시됩니다. UpTrain의 평가에 대한 자세한 내용은 [여기](https://github.com/uptrain-ai/uptrain?tab=readme-ov-file#pre-built-evaluations-we-offer-)에서 확인할 수 있습니다.

Langchain에서 선택한 리트리버는 시연을 위해 강조 표시되었습니다:

### 1. **Vanilla RAG**:

RAG는 문맥을 검색하고 응답을 생성하는 데 중요한 역할을 합니다. 성능과 응답 품질을 보장하기 위해 다음 평가를 수행합니다:

- **[문맥 관련성](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**: 쿼리에서 추출된 문맥이 응답과 관련이 있는지 확인합니다.
- **[사실 정확성](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**: LLM이 환각을 일으키거나 잘못된 정보를 제공하는지 평가합니다.
- **[응답 완전성](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**: 응답이 쿼리에서 요청된 모든 정보를 포함하고 있는지 확인합니다.

### 2. **다중 쿼리 생성**:

MultiQueryRetriever는 원래 질문과 유사한 의미를 가진 여러 변형 질문을 생성합니다. 복잡성을 감안하여 이전 평가를 포함하고 다음을 추가합니다:

- **[다중 쿼리 정확성](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: 생성된 다중 쿼리가 원래 쿼리와 동일한 의미인지 확인합니다.

### 3. **문맥 압축 및 재랭킹**:

재랭킹은 쿼리와 관련된 순서로 노드를 재정렬하고 상위 n개 노드를 선택하는 과정을 포함합니다. 재랭킹이 완료되면 노드 수가 줄어들 수 있으므로 다음 평가를 수행합니다:

- **[문맥 재랭킹](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: 재랭킹된 노드의 순서가 원래 순서보다 쿼리에 더 관련이 있는지 확인합니다.
- **[문맥 간결성](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: 줄어든 노드 수가 여전히 필요한 모든 정보를 제공하는지 검사합니다.

이러한 평가를 통해 체인에서 RAG, MultiQueryRetriever 및 재랭킹 프로세스의 견고성과 효과를 보장합니다.

## 종속성 설치

```python
%pip install -qU langchain langchain_openai uptrain faiss-cpu flashrank
```

```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)

[33mWARNING: There was an error checking the latest version of pip.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

NOTE: GPU를 사용한 버전을 사용하려면 `faiss-cpu` 대신 `faiss-gpu`를 설치할 수도 있습니다.

## 라이브러리 가져오기

```python
from getpass import getpass

from langchain.chains import RetrievalQA
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import FlashrankRerank
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.runnables.passthrough import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)
```

## 문서 로드

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

## 문서를 청크로 분할

```python
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
chunks = text_splitter.split_documents(documents)
```

## 리트리버 생성

```python
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(chunks, embeddings)
retriever = db.as_retriever()
```

## LLM 정의

```python
llm = ChatOpenAI(temperature=0, model="gpt-4")
```

## OpenAI API 키 설정

이 키는 평가를 수행하는 데 필요합니다. UpTrain은 응답을 평가하기 위해 GPT 모델을 사용합니다.

```python
OPENAI_API_KEY = getpass()
```

## 설정

아래의 각 리트리버에 대해 간섭을 피하기 위해 콜백 핸들러를 다시 정의하는 것이 좋습니다. UpTrain을 사용하여 평가를 수행하려면 다음 옵션 중에서 선택할 수 있습니다:

### 1. **UpTrain의 오픈 소스 소프트웨어(OSS)**:

오픈 소스 평가 서비스를 사용하여 모델을 평가할 수 있습니다.
이 경우 OpenAI API 키가 필요합니다. [여기](https://platform.openai.com/account/api-keys)에서 키를 얻을 수 있습니다.

매개변수:

- key_type="openai"
- api_key="OPENAI_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

### 2. **UpTrain 관리 서비스 및 대시보드**:

[여기](https://uptrain.ai/)에서 무료 UpTrain 계정을 만들고 무료 평가 크레딧을 받을 수 있습니다. 더 많은 평가 크레딧을 원하면, [여기](https://calendly.com/uptrain-sourabh/30min)에서 UpTrain 유지 관리 담당자와의 통화를 예약하세요.

UpTrain 관리 서비스는 다음을 제공합니다:

1. 고급 드릴 다운 및 필터링 옵션이 있는 대시보드
1. 실패 사례 간의 공통 주제 및 인사이트
1. 실시간 모니터링 및 관찰 가능성
1. CI/CD 파이프라인과의 원활한 통합을 통한 회귀 테스트

노트북에는 UpTrain 관리 서비스에서 얻을 수 있는 대시보드와 인사이트의 일부 스크린샷이 포함되어 있습니다.

매개변수:

- key_type="uptrain"
- api_key="UPTRAIN_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

**참고:** `project_name_prefix`는 UpTrain 대시보드에서 프로젝트 이름의 접두사로 사용됩니다. 이는 다른 유형의 평가에 대해 다르게 설정됩니다. 예를 들어, project_name_prefix="langchain"으로 설정하고 다중 쿼리 평가를 수행하면 프로젝트 이름은 "langchain_multi_query"가 됩니다.

# 1. Vanilla RAG

UpTrain 콜백 핸들러는 쿼리, 문맥 및 응답을 자동으로 캡처하고 응답에 대해 다음 세 가지 평가를 수행합니다 _(0에서 1까지 등급)_:

- **[문맥 관련성](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**: 쿼리에서 추출된 문맥이 응답과 관련이 있는지 확인합니다.
- **[사실 정확성](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**: 응답이 사실적으로 얼마나 정확한지 확인합니다.
- **[응답 완전성](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**: 응답이 쿼리에서 요청한 모든 정보를 포함하고 있는지 확인합니다.

```python
# RAG 프롬프트 생성

template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

# 체인 생성

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Uptrain 콜백 핸들러 생성

uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# 쿼리로 체인 호출

query = "대통령이 케탄지 브라운 잭슨에 대해 뭐라고 했나요?"
docs = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:03:44.969[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:05.809[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that she is a former top litigator in private practice, a former federal public defender, and comes from a family of public school educators and police officers. He described her as a consensus builder and noted that since her nomination, she has received a broad range of support from various groups, including the Fraternal Order of Police and former judges appointed by both Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 2. 다중 쿼리 생성

**MultiQueryRetriever**는 RAG 파이프라인이 쿼리에 따라 최적의 문서를 반환하지 못할 수 있는 문제를 해결하기 위해 사용됩니다. 원래 쿼리와 동일한 의미를 가진 여러 쿼리를 생성한 후 각 쿼리에 대한 문서를 가져옵니다.

이 리트리버를 평가하기 위해 UpTrain은 다음 평가를 수행합니다:

- **[다중 쿼리 정확성](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: 생성된 다중 쿼리가 원래 쿼리와 동일한 의미인지 확인합니다.

```python
# 리트리버 생성

multi_query_retriever = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

# Uptrain 콜백 생성

uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# RAG 프롬프트 생성

template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

chain = (
    {"context": multi_query_retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# 쿼리로 체인 호출

question = "대통령이 케탄지 브라운 잭슨에 대해 뭐라고 했나요?"
docs = chain.invoke(question, config=config)
```

```output
[32m2024-04-17 17:04:10.675[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:16.804[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Multi Queries:
  - How did the president comment on Ketanji Brown Jackson?
  - What were the president's remarks regarding Ketanji Brown Jackson?
  - What statements has the president made about Ketanji Brown Jackson?

Multi Query Accuracy Score: 0.5

[32m2024-04-17 17:04:22.027[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:44.033[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that since her nomination, she has received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 3. 문맥 압축 및 재랭킹

재랭킹 과정은 쿼리와 관련된 순서로 노드를 재정렬하고 상위 n개 노드를 선택하는 것을 포함합니다. 재랭킹이 완료되면 노드 수가 줄어들 수 있으므로 다음 평가를 수행합니다:

- **[문맥 재랭킹](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: 재랭킹된 노드의 순서가 원래 순서보다 쿼리에 더 관련이 있는지 확인합니다.
- **[문맥 간결성](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: 줄어든 노드 수가 여전히 필요한 모든 정보를 제공하는지 확인합니다.

```python
# 리트리버 생성

compressor = FlashrankRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

# 체인 생성

chain = RetrievalQA.from_chain_type(llm=llm, retriever=compression_retriever)

# Uptrain 콜백 생성

uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# 쿼리로 체인 호출

query = "대통령이 케탄지 브라운 잭슨에 대해 뭐라고 했나요?"
result = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:04:46.462[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:53.561[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson

Context Conciseness Score: 0.0
Context Reranking Score: 1.0

[32m2024-04-17 17:04:56.947[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:05:16.551[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The President mentioned that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 0.5
```