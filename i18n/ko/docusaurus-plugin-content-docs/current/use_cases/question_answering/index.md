---
sidebar_class_name: hidden
translated: true
---

# RAG를 사용한 Q&A

## 개요

LLM(대규모 언어 모델)이 가능하게 한 가장 강력한 애플리케이션 중 하나는 정교한 질문-응답(Q&A) 챗봇입니다. 이러한 애플리케이션은 특정 출처 정보에 대한 질문에 답할 수 있습니다. 이 애플리케이션들은 Retrieval Augmented Generation, 또는 RAG로 알려진 기술을 사용합니다.

### RAG란 무엇인가요?

RAG는 LLM 지식을 추가 데이터로 증강하는 기술입니다.

LLM은 광범위한 주제에 대해 추론할 수 있지만, 그 지식은 학습 당시의 공개 데이터에 한정됩니다. 모델의 컷오프 날짜 이후에 도입된 개인 데이터나 데이터를 추론할 수 있는 AI 애플리케이션을 구축하려면 모델이 필요한 특정 정보로 지식을 증강해야 합니다. 적절한 정보를 가져와 모델 프롬프트에 삽입하는 과정을 Retrieval Augmented Generation(RAG)이라고 합니다.

LangChain에는 Q&A 애플리케이션과 일반적인 RAG 애플리케이션을 구축하는 데 도움이 되는 여러 구성 요소가 있습니다.

**참고**: 여기서는 비정형 데이터에 대한 Q&A에 중점을 둡니다. 다른 두 가지 RAG 사용 사례는 다음과 같습니다:

- [SQL 데이터에 대한 Q&A](/docs/use_cases/sql/)
- [코드에 대한 Q&A](/docs/use_cases/code_understanding) (예: Python)

## RAG 아키텍처

일반적인 RAG 애플리케이션에는 두 가지 주요 구성 요소가 있습니다:

**인덱싱**: 소스에서 데이터를 수집하고 인덱싱하는 파이프라인입니다. *이 과정은 보통 오프라인에서 이루어집니다.*

**검색 및 생성**: 사용자 쿼리를 실행 시간에 받아 인덱스에서 관련 데이터를 검색한 다음 모델에 전달하는 실제 RAG 체인입니다.

원시 데이터에서 답변까지의 가장 일반적인 전체 시퀀스는 다음과 같습니다:

#### 인덱싱

1. **로드**: 먼저 데이터를 로드해야 합니다. 이는 [DocumentLoaders](/docs/modules/data_connection/document_loaders/)로 수행됩니다.
2. **분할**: [텍스트 분할기](/docs/modules/data_connection/document_transformers/)는 큰 `문서`를 더 작은 청크로 나눕니다. 이는 데이터 인덱싱과 모델에 전달하는 데 모두 유용합니다. 큰 청크는 검색하기 어렵고 모델의 유한한 컨텍스트 창에 맞지 않기 때문입니다.
3. **저장**: 나중에 검색할 수 있도록 분할된 데이터를 저장하고 인덱싱할 곳이 필요합니다. 이는 종종 [VectorStore](/docs/modules/data_connection/vectorstores/) 및 [Embeddings](/docs/modules/data_connection/text_embedding/) 모델을 사용하여 수행됩니다.

![index_diagram](../../../../../../static/img/rag_indexing.png)

#### 검색 및 생성

4. **검색**: 사용자 입력을 받으면 [Retriever](/docs/modules/data_connection/retrievers/)를 사용하여 저장소에서 관련 청크를 검색합니다.
5. **생성**: [ChatModel](/docs/modules/model_io/chat) / [LLM](/docs/modules/model_io/llms/)이 질문과 검색된 데이터를 포함하는 프롬프트를 사용하여 답변을 생성합니다.

![retrieval_diagram](../../../../../../static/img/rag_retrieval_generation.png)

## 목차

- [빠른 시작](/docs/use_cases/question_answering/quickstart): 여기서 시작하는 것이 좋습니다. 다음 가이드 중 많은 부분이 빠른 시작에 설명된 아키텍처를 완전히 이해한다고 가정합니다.
- [출처 반환](/docs/use_cases/question_answering/sources): 특정 생성에 사용된 출처 문서를 반환하는 방법입니다.
- [스트리밍](/docs/use_cases/question_answering/streaming): 최종 답변과 중간 단계를 스트리밍하는 방법입니다.
- [채팅 기록 추가](/docs/use_cases/question_answering/chat_history): Q&A 앱에 채팅 기록을 추가하는 방법입니다.
- [하이브리드 검색](/docs/use_cases/question_answering/hybrid): 하이브리드 검색을 수행하는 방법입니다.
- [사용자별 검색](/docs/use_cases/question_answering/per_user): 각 사용자가 자신의 개인 데이터를 가지고 있을 때 검색하는 방법입니다.
- [에이전트 사용하기](/docs/use_cases/question_answering/conversational_retrieval_agents): Q&A를 위해 에이전트를 사용하는 방법입니다.
- [로컬 모델 사용하기](/docs/use_cases/question_answering/local_retrieval_qa): Q&A를 위해 로컬 모델을 사용하는 방법입니다.