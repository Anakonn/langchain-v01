---
hide_table_of_contents: true
sidebar_class_name: hidden
sidebar_position: 3
title: 체인
translated: true
---

체인은 LLM, 도구 또는 데이터 전처리 단계에 대한 호출의 순서를 의미합니다. 이를 지원하는 주요 방법은 [LCEL](/docs/expression_language)입니다.

LCEL은 체인을 구성하는 데 매우 유용하지만, 체인을 바로 사용할 수 있는 것도 좋습니다. LangChain이 지원하는 두 가지 종류의 기성 체인이 있습니다:

- LCEL로 구축된 체인. 이 경우 LangChain은 상위 수준의 생성자 메서드를 제공합니다. 그러나 실제로는 LCEL로 체인을 구성하는 것뿐입니다.
- 레거시 `Chain` 클래스를 서브클래싱하여 구축된 [레거시] 체인. 이러한 체인은 LCEL을 사용하지 않지만 독립형 클래스입니다.

우리는 모든 체인의 LCEL 버전을 만드는 방법을 개발 중입니다. 몇 가지 이유로 이를 수행하고 있습니다.

1. 이러한 방식으로 구축된 체인은 체인의 내부를 수정하고 싶을 때 LCEL을 간단히 수정할 수 있기 때문에 유용합니다.
2. 이러한 체인은 기본적으로 스트리밍, 비동기 및 배치를 지원합니다.
3. 이러한 체인은 각 단계에서 자동으로 관찰 가능성을 얻습니다.

이 페이지에는 두 개의 목록이 포함되어 있습니다. 첫 번째는 모든 LCEL 체인 생성자의 목록입니다. 두 번째는 모든 레거시 체인의 목록입니다.

## LCEL 체인

아래는 모든 `LCEL 체인 생성자`의 표입니다.

표 열:

- **체인 생성자:** 이 체인의 생성자 함수입니다. 이들은 모두 LCEL 실행 가능 항목을 반환하는 메서드입니다. 우리는 또한 API 문서로 연결합니다.
- **함수 호출:** OpenAI 함수 호출이 필요한지 여부.
- **기타 도구:** 이 체인에서 사용되는 기타 도구(있는 경우).
- **사용 시기:** 이 체인을 사용할 시기에 대한 우리의 논평.

| 체인 생성자                  | 함수 호출               | 기타 도구      | 사용 시기                                                                 |
|------------------------------|-------------------------|--------------|-----------------------------------------------------------------------------|
| [create_stuff_documents_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html#langchain.chains.combine_documents.stuff.create_stuff_documents_chain)     |                         |              | 이 체인은 문서 목록을 받아 모두 하나의 프롬프트로 형식화한 다음, 그 프롬프트를 LLM에 전달합니다. 모든 문서를 전달하므로 사용하는 LLM의 컨텍스트 창 내에 맞도록 해야 합니다. |
| [create_openai_fn_runnable](https://api.python.langchain.com/en/latest/chains/langchain.chains.structured_output.base.create_openai_fn_runnable.html#langchain.chains.structured_output.base.create_openai_fn_runnable)     | ✅ |              | OpenAI 함수 호출을 사용하여 선택적으로 구조화된 출력 응답을 원할 경우. 여러 함수를 호출에 전달할 수 있지만 반드시 호출할 필요는 없습니다. |
| [create_structured_output_runnable](https://api.python.langchain.com/en/latest/chains/langchain.chains.structured_output.base.create_structured_output_runnable.html#langchain.chains.structured_output.base.create_structured_output_runnable)   | ✅ |              | OpenAI 함수 호출을 사용하여 LLM이 특정 함수로 응답하도록 강제하고 싶을 경우. 하나의 함수만 전달할 수 있으며, 체인은 항상 이 응답을 반환합니다. |
| [load_query_constructor_runnable](https://api.python.langchain.com/en/latest/chains/langchain.chains.query_constructor.base.load_query_constructor_runnable.html#langchain.chains.query_constructor.base.load_query_constructor_runnable)  |                         |              | 쿼리를 생성하는 데 사용할 수 있습니다. 허용된 작업 목록을 지정한 다음 자연어 쿼리를 해당 허용된 작업으로 변환하는 실행 가능 항목을 반환해야 합니다. |
| [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html#langchain.chains.sql_database.query.create_sql_query_chain)           |                         | SQL Database | 자연어로 SQL 데이터베이스 쿼리를 구성하고 싶은 경우. |
| [create_history_aware_retriever](https://api.python.langchain.com/en/latest/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html#langchain.chains.history_aware_retriever.create_history_aware_retriever)   |                         | Retriever    | 이 체인은 대화 기록을 받아 이를 사용하여 검색 쿼리를 생성하고, 그 쿼리를 기본 검색자에게 전달합니다. |
| [create_retrieval_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.retrieval.create_retrieval_chain.html#langchain.chains.retrieval.create_retrieval_chain)           |                         | Retriever    | 이 체인은 사용자 문의를 받아 이를 검색자에게 전달하여 관련 문서를 검색합니다. 그런 다음 문서(및 원래 입력)를 LLM에 전달하여 응답을 생성합니다. |

## 레거시 체인

아래는 `레거시 체인`입니다. LCEL 대안을 만들 때까지 이들을 지원할 것입니다.

표 열:

- **체인:** 체인의 이름 또는 생성자 메서드의 이름. 생성자 메서드인 경우, 이는 `Chain` 서브클래스를 반환합니다.
- **함수 호출:** 체인이 OpenAI 함수 호출을 필요로 하는지 여부.
- **기타 도구:** 체인에서 사용되는 기타 도구.
- **사용 시기:** 사용할 시기에 대한 우리의 논평.

| Chain                        |  Function Calling | Other Tools            | When to Use |
|------------------------------|--------------------|------------------------|-------------|
| [APIChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.api.base.APIChain.html#langchain.chains.api.base.APIChain)                    |                                            | Requests Wrapper               | 이 체인은 쿼리를 API 요청으로 변환한 다음, 그 요청을 실행하고 응답을 받고, 그 요청을 LLM에 전달하여 응답을 받습니다.            |
| [OpenAPIEndpointChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.api.openapi.chain.OpenAPIEndpointChain.html#langchain.chains.api.openapi.chain.OpenAPIEndpointChain)         |                                            | OpenAPI Spec           | APIChain과 유사하게, 이 체인은 API와 상호 작용하도록 설계되었습니다. 주요 차이점은 OpenAPI 엔드포인트와의 사용 편의성을 위해 최적화되어 있다는 것입니다.            |
| [ConversationalRetrievalChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.conversational_retrieval.base.ConversationalRetrievalChain.html#langchain.chains.conversational_retrieval.base.ConversationalRetrievalChain) |                                            | Retriever              |이 체인은 문서와 **대화**를 할 수 있도록 사용됩니다. 질문과 (선택적) 이전 대화 기록을 입력받습니다. 이전 대화 기록이 있는 경우, LLM을 사용하여 대화를 쿼리로 다시 작성하여 리트리버에게 전송합니다 (그렇지 않으면 최신 사용자 입력만 사용합니다). 그런 다음 문서를 가져와서 (대화와 함께) LLM에 전달하여 응답을 받습니다.             |
| [StuffDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html#langchain.chains.combine_documents.stuff.StuffDocumentsChain)           |                    |                        |이 체인은 문서 목록을 받아 모두 프롬프트로 포맷한 다음, 그 프롬프트를 LLM에 전달합니다. 모든 문서를 전달하므로 사용 중인 LLM의 컨텍스트 윈도우에 맞도록 해야 합니다.             |
| [ReduceDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.reduce.ReduceDocumentsChain.html#langchain.chains.combine_documents.reduce.ReduceDocumentsChain)         |                                            |                        |이 체인은 문서를 점진적으로 줄여서 결합합니다. 문서를 청크(일정한 컨텍스트 길이 이하)로 그룹화한 다음 LLM에 전달합니다. 그런 다음 응답을 받아 계속해서 이를 반복하여 모든 내용을 하나의 최종 LLM 호출에 맞출 수 있을 때까지 진행합니다. 문서가 많고, 모든 문서를 LLM이 처리하도록 하고 싶을 때 유용합니다.              |
| [MapReduceDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.map_reduce.MapReduceDocumentsChain.html#langchain.chains.combine_documents.map_reduce.MapReduceDocumentsChain)      |                        |                                            |이 체인은 먼저 각 문서를 LLM을 통해 전달한 다음 `ReduceDocumentsChain`을 사용하여 줄입니다. `ReduceDocumentsChain`과 동일한 상황에서 유용하지만, 문서를 줄이기 전에 초기 LLM 호출을 수행합니다.          |
| [RefineDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.refine.RefineDocumentsChain.html#langchain.chains.combine_documents.refine.RefineDocumentsChain)         |    |                                        |이 체인은 첫 번째 문서를 기반으로 초기 답변을 생성한 다음 남은 문서를 반복하여 답변을 *정제*하면서 문서를 축소합니다. 이는 순차적으로 작동하므로 병렬화할 수 없습니다. MapReduceDocuments Chain과 유사한 상황에서 유용하지만, 이전 답변을 정제하면서 답변을 구축하고자 하는 경우에 적합합니다 (호출을 병렬화하는 것보다).                        |             |
| [MapRerankDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.map_rerank.MapRerankDocumentsChain.html#langchain.chains.combine_documents.map_rerank.MapRerankDocumentsChain)      |                        |                    |                                      이 체인은 각 문서에 대해 LLM을 호출하여 답변뿐만 아니라 자신이 얼마나 확신하는지에 대한 점수도 생성하도록 요청합니다. 그런 다음 가장 높은 확신도를 가진 답변이 반환됩니다. 문서가 많지만 답변을 결합하려는 것보다 단일 문서를 기반으로 답변하고자 할 때 유용합니다 (정제 및 축소 방법과 유사).|
| [ConstitutionalChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.constitutional_ai.base.ConstitutionalChain.html#langchain.chains.constitutional_ai.base.ConstitutionalChain)          |                                            |                        |이 체인은 답변을 제공한 다음, 제공된 헌법 원칙에 따라 답변을 정제하려고 시도합니다. 체인의 답변이 일정한 원칙을 따르도록 강제하고자 할 때 사용하십시오.             |
| [LLMChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm.LLMChain.html#langchain.chains.llm.LLMChain)                                 |  |                  |                        |이 체인은 단순히 프롬프트를 LLM과 출력 파서와 결합합니다. 이를 수행하는 권장 방법은 LCEL을 사용하는 것입니다.             |
| [ElasticsearchDatabaseChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.elasticsearch_database.base.ElasticsearchDatabaseChain.html#langchain.chains.elasticsearch_database.base.ElasticsearchDatabaseChain)                           |                    | Elasticsearch Instance |이 체인은 자연어 질문을 `Elasticsearch` 쿼리로 변환한 다음 실행하고, 응답을 요약합니다. `Elasticsearch` 데이터베이스에 자연어 질문을 하고자 할 때 유용합니다.             |
| [FlareChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.flare.base.FlareChain.html#langchain.chains.flare.base.FlareChain)                   |                                            |                        |이 체인은 [FLARE](https://arxiv.org/abs/2305.06983)를 구현하며, 고급 검색 기술입니다. 주로 탐색적 고급 검색 방법으로 사용됩니다.             |
| [ArangoGraphQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.arangodb.ArangoGraphQAChain.html#langchain.chains.graph_qa.arangodb.ArangoGraphQAChain)                                   |                    |Arango Graph                        |이 체인은 자연어에서 Arango 쿼리를 구성하고, 그 쿼리를 그래프에 대해 실행한 다음 결과를 LLM에 전달하여 응답을 받습니다.             |
|[GraphCypherQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.cypher.GraphCypherQAChain.html#langchain.chains.graph_qa.cypher.GraphCypherQAChain)                                                      |                    |A graph that works with Cypher query language                        |이 체인은 자연어에서 Cypher 쿼리를 구성하고, 그 쿼리를 그래프에 대해 실행한 다음 결과를 LLM에 전달하여 응답을 받습니다.             |
|[FalkorDBGraphQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.falkordb.FalkorDBQAChain.html#langchain.chains.graph_qa.falkordb.FalkorDBQAChain)                                                      |                    |Falkor Database                        | 이 체인은 자연어에서 FalkorDB 쿼리를 구성하고, 그 쿼리를 그래프에 대해 실행한 다음 결과를 LLM에 전달하여 응답을 받습니다.             |
|[HugeGraphQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.hugegraph.HugeGraphQAChain.html#langchain.chains.graph_qa.hugegraph.HugeGraphQAChain)                                                     |                    |HugeGraph                        |이 체인은 자연어에서 HugeGraph 쿼리를 구성하고, 그 쿼리를 그래프에 대해 실행한 다음 결과를 LLM에 전달하여 응답을 받습니다.              |
|[KuzuQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.kuzu.KuzuQAChain.html#langchain.chains.graph_qa.kuzu.KuzuQAChain)                                                      |                    |Kuzu Graph                        |이 체인은 자연어에서 Kuzu Graph 쿼리를 구성하고, 그 쿼리를 그래프에 대해 실행한 다음 결과를 LLM에 전달하여 응답을 받습니다.              |
|[NebulaGraphQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.nebulagraph.NebulaGraphQAChain.html#langchain.chains.graph_qa.nebulagraph.NebulaGraphQAChain)                                                      |                    |Nebula Graph                        |이 체인은 자연어에서 Nebula Graph 쿼리를 구성하고, 그 쿼리를 그래프에 대해 실행한 다음 결과를 LLM에 전달하여 응답을 받습니다.              |
|[NeptuneOpenCypherQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.neptune_cypher.NeptuneOpenCypherQAChain.html#langchain.chains.graph_qa.neptune_cypher.NeptuneOpenCypherQAChain)                                                     |                    |Neptune Graph                        |이 체인은 자연어에서 Neptune Graph 쿼리를 구성하고, 그 쿼리를 그래프에 대해 실행한 다음 결과를 LLM에 전달하여 응답을 받습니다.              |
|[GraphSparqlChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.sparql.GraphSparqlQAChain.html#langchain.chains.graph_qa.sparql.GraphSparqlQAChain)                                                      |                    |Graph that works with SparQL                        |이 체인은 자연어에서 SparQL 쿼리를 구성하고, 그 쿼리를 그래프에 대해 실행한 다음 결과를 LLM에 전달하여 응답을 받습니다.              |
|[LLMMath](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm_math.base.LLMMathChain.html#langchain.chains.llm_math.base.LLMMathChain)                                                      |                    |                        |이 체인은 사용자 질문을 수학 문제로 변환한 다음 실행합니다 (using [numexpr](https://github.com/pydata/numexpr)))             |
|[LLMCheckerChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm_checker.base.LLMCheckerChain.html#langchain.chains.llm_checker.base.LLMCheckerChain)                                                      |                    |                        |이 체인은 초기 답변을 검증하기 위해 두 번째 LLM 호출을 사용합니다. 초기 LLM 호출에 대해 추가 검증 레이어가 필요할 때 사용하십시오.             |
|[LLMSummarizationChecker](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm_summarization_checker.base.LLMSummarizationCheckerChain.html#langchain.chains.llm_summarization_checker.base.LLMSummarizationCheckerChain)                              |                        |                                            |이 체인은 일련의 LLM 호출을 사용하여 요약을 생성하여 더 정확하도록 합니다. 속도/비용보다는 정확성이 더 중요한 경우 일반 요약 체인 대신 이 체인을 사용하십시오.             |
|[create_citation_fuzzy_match_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.citation_fuzzy_match.create_citation_fuzzy_match_chain.html#langchain.chains.openai_functions.citation_fuzzy_match.create_citation_fuzzy_match_chain)                                                      |✅                    |                        |OpenAI 함수 호출을 사용하여 질문에 답하고 출처를 인용합니다.             |
|[create_extraction_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.extraction.create_extraction_chain.html#langchain.chains.openai_functions.extraction.create_extraction_chain)                              |                        ✅                    |                        |OpenAI 함수 호출을 사용하여 텍스트에서 정보를 추출합니다.             |
|[create_extraction_chain_pydantic](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.extraction.create_extraction_chain_pydantic.html#langchain.chains.openai_functions.extraction.create_extraction_chain_pydantic)                              |                        ✅                    |                        |OpenAI 함수 호출을 사용하여 텍스트에서 Pydantic 모델로 정보를 추출합니다. `create_extraction_chain`과 비교하여 Pydantic과의 통합이 더 긴밀합니다.             |
|[get_openapi_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.openapi.get_openapi_chain.html#langchain.chains.openai_functions.openapi.get_openapi_chain)                              |                        ✅                    |OpenAPI Spec                        |OpenAI 함수 호출을 사용하여 OpenAPI를 쿼리합니다.             |
|[create_qa_with_structure_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.qa_with_structure.create_qa_with_structure_chain.html#langchain.chains.openai_functions.qa_with_structure.create_qa_with_structure_chain)                              |                        ✅                    |                        |OpenAI 함수 호출을 사용하여 텍스트에 대한 질문에 특정 형식으로 응답합니다.             |
|[create_qa_with_sources_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.qa_with_structure.create_qa_with_sources_chain.html#langchain.chains.openai_functions.qa_with_structure.create_qa_with_sources_chain)                              |                        ✅                    |                        |OpenAI 함수 호출을 사용하여 출처를 인용하며 질문에 답합니다.             |
|[QAGenerationChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.qa_generation.base.QAGenerationChain.html#langchain.chains.qa_generation.base.QAGenerationChain)                                          |            |                    |문서에서 질문과 답변을 모두 생성합니다. 검색 프로젝트 평가를 위한 질문/답변 쌍을 생성하는 데 사용됩니다.                        |
|[RetrievalQAWithSourcesChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.qa_with_sources.retrieval.RetrievalQAWithSourcesChain.html#langchain.chains.qa_with_sources.retrieval.RetrievalQAWithSourcesChain)                              |                        |                          Retriever                    |검색된 문서에 대해 질문에 답하고 출처를 인용합니다. 텍스트 응답에 출처를 포함하고자 할 때 사용하십시오. 체인에 관련 문서를 가져오는 리트리버를 사용하고자 할 때 `load_qa_with_sources_chain`보다 이 체인을 사용하십시오.|
|[load_qa_with_sources_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.qa_with_sources.loading.load_qa_with_sources_chain.html#langchain.chains.qa_with_sources.loading.load_qa_with_sources_chain)                                                     | |Retriever                    |입력한 문서에 대해 질문에 답하고 출처를 인용합니다. 텍스트 응답에 출처를 포함하고자 할 때 사용하십시오. 리트리버를 사용하여 관련 문서를 가져오는 대신 문서를 직접 입력하고자 할 때 RetrievalQAWithSources보다 이 체인을 사용하십시오.|

|[RetrievalQA](https://api.python.langchain.com/en/latest/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html#langchain.chains.retrieval_qa.base.RetrievalQA)   |                                            |Retriever                        |이 체인은 먼저 검색 단계를 수행하여 관련 문서를 가져온 다음, 해당 문서를 LLM에 전달하여 응답을 생성합니다.|
|[MultiPromptChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.router.multi_prompt.MultiPromptChain.html#langchain.chains.router.multi_prompt.MultiPromptChain)                                                      |                    |                        |이 체인은 입력을 여러 프롬프트 사이에서 라우팅합니다. 응답에 사용할 수 있는 여러 잠재적인 프롬프트가 있고 하나로 라우팅하려는 경우에 사용하십시오.|
|[MultiRetrievalQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.router.multi_retrieval_qa.MultiRetrievalQAChain.html#langchain.chains.router.multi_retrieval_qa.MultiRetrievalQAChain)|                                            |Retriever                        |이 체인은 입력을 여러 검색기 사이에서 라우팅합니다. 관련 문서를 가져올 수 있는 여러 잠재적인 검색기가 있고 하나로 라우팅하려는 경우에 사용하십시오.|
|[EmbeddingRouterChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.router.embedding_router.EmbeddingRouterChain.html#langchain.chains.router.embedding_router.EmbeddingRouterChain)|                                            |                        |이 체인은 임베딩 유사성을 사용하여 들어오는 쿼리를 라우팅합니다.|
|[LLMRouterChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.router.llm_router.LLMRouterChain.html#langchain.chains.router.llm_router.LLMRouterChain)|                                            |                        |이 체인은 LLM을 사용하여 잠재적인 옵션 사이에서 라우팅합니다.|
|load_summarize_chain|                        |                    |                        |이 체인은 텍스트를 요약합니다.|
|[LLMRequestsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm_requests.LLMRequestsChain.html#langchain.chains.llm_requests.LLMRequestsChain)|                        |                                            |이 체인은 사용자 입력으로부터 URL을 구성하고, 해당 URL에서 데이터를 가져온 다음 응답을 요약합니다. APIChain과 비교했을 때, 이 체인은 단일 API 사양에 중점을 두지 않고 더 일반적입니다.|
