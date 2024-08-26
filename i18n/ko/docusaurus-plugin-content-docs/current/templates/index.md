---
sidebar_class_name: hidden
translated: true
---

# 템플릿

다양한 범주의 템플릿을 강조합니다.

## ⭐ 인기 있는 것들

이러한 템플릿은 시작하기에 좋습니다.

- [Retrieval Augmented Generation Chatbot](/docs/templates/rag-conversation): OpenAI와 PineconeVectorStore를 기본으로 하는 데이터 기반 채팅봇을 만듭니다.
- [Extraction with OpenAI Functions](/docs/templates/extraction-openai-functions): OpenAI 함수 호출을 사용하여 비정형 데이터에서 구조화된 데이터를 추출합니다.
- [Local Retrieval Augmented Generation](/docs/templates/rag-chroma-private): Ollama, GPT4all, Chroma와 같은 로컬 도구만 사용하여 데이터 기반 채팅봇을 만듭니다.
- [OpenAI Functions Agent](/docs/templates/openai-functions-agent): OpenAI 함수 호출과 Tavily를 사용하여 작업을 수행할 수 있는 채팅봇을 만듭니다.
- [XML Agent](/docs/templates/xml-agent): Anthropic와 You.com을 사용하여 작업을 수행할 수 있는 채팅봇을 만듭니다.

## 📥 고급 검색

이러한 템플릿은 데이터베이스 또는 문서에 대한 채팅과 질문 답변을 위한 고급 검색 기술을 다룹니다.

- [Reranking](/docs/templates/rag-pinecone-rerank): Cohere의 재순위화 엔드포인트를 사용하여 초기 검색 단계에서 검색된 문서를 재순위화합니다.
- [Anthropic Iterative Search](/docs/templates/anthropic-iterative-search): 반복적인 프롬프팅을 사용하여 무엇을 검색할지 결정하고 검색된 문서가 충분한지 확인합니다.
- **Parent Document Retrieval** using [Neo4j](/docs/templates/neo4j-parent) or [MongoDB](/docs/templates/mongo-parent-document-retrieval): 작은 청크에 대한 임베딩을 저장하지만 생성을 위해 모델에 전달할 더 큰 청크를 반환합니다.
- [Semi-Structured RAG](/docs/templates/rag-semi-structured): 텍스트와 테이블이 모두 포함된 반구조화된 데이터에 대한 검색을 보여줍니다.
- [Temporal RAG](/docs/templates/rag-timescale-hybrid-search-time): [Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)를 사용하여 시간 기반 구성 요소가 있는 데이터에 대한 하이브리드 검색을 보여줍니다.

## 🔍쿼리 변환을 통한 고급 검색

원래 사용자 쿼리를 변환하여 검색 품질을 향상시킬 수 있는 고급 검색 방법의 선택.

- [Hypothetical Document Embeddings](/docs/templates/hyde): 주어진 쿼리에 대한 가설 문서를 생성하고 해당 문서의 임베딩을 사용하여 의미 검색을 수행하는 검색 기술. [논문](https://arxiv.org/abs/2212.10496).
- [Rewrite-Retrieve-Read](/docs/templates/rewrite-retrieve-read): 주어진 쿼리를 재작성한 다음 검색 엔진에 전달하는 검색 기술. [논문](https://arxiv.org/abs/2305.14283).
- [Step-back QA Prompting](/docs/templates/stepback-qa-prompting): "step-back" 질문을 생성하고 원래 질문과 해당 질문 모두와 관련된 문서를 검색하는 검색 기술. [논문](https://arxiv.org/abs//2310.06117).
- [RAG-Fusion](/docs/templates/rag-fusion): 여러 쿼리를 생성하고 reciprocal rank fusion을 사용하여 검색된 문서를 재순위화하는 검색 기술. [기사](https://towardsdatascience.com/forget-rag-the-future-is-rag-fusion-1147298d8ad1).
- [Multi-Query Retriever](/docs/templates/rag-pinecone-multi-query): LLM을 사용하여 여러 쿼리를 생성하고 모든 쿼리에 대한 문서를 가져오는 검색 기술.

## 🧠쿼리 구성을 통한 고급 검색

자연어 채팅을 통해 다양한 구조화된 데이터베이스를 활용할 수 있도록 하는 별도의 DSL에서 쿼리를 구성하는 고급 검색 방법의 선택.

- [Elastic Query Generator](/docs/templates/elastic-query-generator): 자연어에서 Elastic Search 쿼리를 생성합니다.
- [Neo4j Cypher Generation](/docs/templates/neo4j-cypher): 자연어에서 Cypher 문을 생성합니다. ["full text" 옵션](/docs/templates/neo4j-cypher-ft)도 제공됩니다.
- [Supabase Self Query](/docs/templates/self-query-supabase): 자연어 쿼리를 의미 쿼리와 Supabase에 대한 메타데이터 필터로 구문 분석합니다.

## 🦙 OSS 모델

이러한 템플릿은 민감한 데이터에 대한 프라이버시를 가능하게 하는 OSS 모델을 사용합니다.

- [Local Retrieval Augmented Generation](/docs/templates/rag-chroma-private): Ollama, GPT4all, Chroma와 같은 로컬 도구만 사용하여 데이터 기반 채팅봇을 만듭니다.
- [SQL Question Answering (Replicate)](/docs/templates/sql-llama2): [Replicate](https://replicate.com/)에서 호스팅되는 Llama2를 사용하여 SQL 데이터베이스에 대한 질문 답변.
- [SQL Question Answering (LlamaCpp)](/docs/templates/sql-llamacpp): [LlamaCpp](https://github.com/ggerganov/llama.cpp)를 통해 Llama2를 사용하여 SQL 데이터베이스에 대한 질문 답변.
- [SQL Question Answering (Ollama)](/docs/templates/sql-ollama): [Ollama](https://github.com/jmorganca/ollama)를 통해 Llama2를 사용하여 SQL 데이터베이스에 대한 질문 답변.

## ⛏️ 추출

이러한 템플릿은 사용자가 지정한 스키마에 따라 구조화된 형식으로 데이터를 추출합니다.

- [OpenAI 함수를 사용한 추출](/docs/templates/extraction-openai-functions): OpenAI 함수 호출을 사용하여 텍스트에서 정보를 추출합니다.
- [Anthropic 함수를 사용한 추출](/docs/templates/extraction-anthropic-functions): Anthropic 엔드포인트에 대한 LangChain 래퍼를 사용하여 텍스트에서 정보를 추출합니다.
- [바이오 테크 플레이트 데이터 추출](/docs/templates/plate-chain): 지저분한 Excel 스프레드시트에서 더 정규화된 형식으로 마이크로플레이트 데이터를 추출합니다.

## ⛏️요약 및 태깅

이러한 템플릿은 문서와 텍스트를 요약하거나 분류합니다.

- [Anthropic을 사용한 요약](/docs/templates/summarize-anthropic): Claude2를 사용하여 긴 문서를 요약합니다.

## 🤖 에이전트

이러한 템플릿은 작업을 자동화하는 데 도움이 되는 조치를 취할 수 있는 채팅봇을 구축합니다.

- [OpenAI 함수 에이전트](/docs/templates/openai-functions-agent): OpenAI 함수 호출과 Tavily를 사용하여 작업을 수행할 수 있는 채팅봇을 구축합니다.
- [XML 에이전트](/docs/templates/xml-agent): Anthropic과 You.com을 사용하여 작업을 수행할 수 있는 채팅봇을 구축합니다.

## :rotating_light: 안전성 및 평가

이러한 템플릿을 사용하면 LLM 출력을 조절하거나 평가할 수 있습니다.

- [Guardrails 출력 파서](/docs/templates/guardrails-output-parser): guardrails-ai를 사용하여 LLM 출력을 검증합니다.
- [채팅봇 피드백](/docs/templates/chat-bot-feedback): LangSmith를 사용하여 채팅봇 응답을 평가합니다.
