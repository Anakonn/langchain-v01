---
hide_table_of_contents: true
sidebar_class_name: hidden
sidebar_position: 3
title: チェーン
translated: true
---

チェーンとは、LLM、ツール、またはデータ前処理ステップへの呼び出しのシーケンスを指します。これを行うための主なサポート方法は[LCEL](/docs/expression_language)です。

LCELはチェーンを構築するのに優れていますが、市販のチェーンを使用するのも良いです。LangChainがサポートする市販のチェーンには2種類あります:

- LCELで構築されたチェーン。この場合、LangChainは高レベルのコンストラクターメソッドを提供します。しかし、内部で行われているのはLCELを使ったチェーンの構築だけです。
- レガシー `Chain` クラスからサブクラス化して構築された[Legacy]チェーン。これらのチェーンは内部でLCELを使用せず、スタンドアロンのクラスです。

すべてのチェーンのLCELバージョンを作成するメソッドの開発に取り組んでいます。これにはいくつかの理由があります。

1. この方法で構築されたチェーンは、チェーンの内部を変更したい場合に、単にLCELを変更するだけで済むので便利です。
2. これらのチェーンは、ストリーミング、非同期、バッチをネイティブにサポートします。
3. これらのチェーンは各ステップで自動的に観測可能性を得ます。

このページには2つのリストがあります。まず、すべてのLCELチェーンコンストラクターのリスト。次に、すべてのレガシーチェーンのリストです。

## LCELチェーン

以下はすべての`LCELチェーンコンストラクター`の表です。

表の列:

- **チェーンコンストラクター:** このチェーンのコンストラクタ関数。これらはすべてLCEL Runnablesを返すメソッドです。また、APIドキュメントへのリンクもあります。
- **関数呼び出し:** これがOpenAI関数呼び出しを必要とするかどうか。
- **その他のツール:** このチェーンで使用されるその他のツール（あれば）。
- **使用時期:** このチェーンを使用するタイミングに関する私たちのコメント。

| チェーンコンストラクター                | 関数呼び出し      | その他のツール  | 使用時期                                                                    |
|----------------------------------|-------------------------|--------------|--------------------------------------------------------------------------------|
| [create_stuff_documents_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html#langchain.chains.combine_documents.stuff.create_stuff_documents_chain)     |                         |              | このチェーンは文書のリストを受け取り、それらをプロンプトにフォーマットしてからLLMに渡します。すべての文書を渡すため、使用するLLMのコンテキストウィンドウに収まるようにする必要があります。 |
| [create_openai_fn_runnable](https://api.python.langchain.com/en/latest/chains/langchain.chains.structured_output.base.create_openai_fn_runnable.html#langchain.chains.structured_output.base.create_openai_fn_runnable)     | ✅ |              | OpenAI関数呼び出しを使用して出力レスポンスをオプションで構造化したい場合に使用します。複数の関数を呼び出しに渡すことができますが、呼び出す必要はありません。                                     |
| [create_structured_output_runnable](https://api.python.langchain.com/en/latest/chains/langchain.chains.structured_output.base.create_structured_output_runnable.html#langchain.chains.structured_output.base.create_structured_output_runnable)   | ✅ |              | OpenAI関数呼び出しを使用してLLMが特定の関数で応答するように強制したい場合に使用します。1つの関数のみを渡すことができ、このチェーンは常にこのレスポンスを返します。                                      |
| [load_query_constructor_runnable](https://api.python.langchain.com/en/latest/chains/langchain.chains.query_constructor.base.load_query_constructor_runnable.html#langchain.chains.query_constructor.base.load_query_constructor_runnable)  |                         |              | クエリを生成するために使用できます。許可された操作のリストを指定し、それを自然言語クエリからこれらの許可された操作に変換するRunnableを返します。                                                                               |
| [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html#langchain.chains.sql_database.query.create_sql_query_chain)           |                         | SQLデータベース | 自然言語からSQLデータベースのクエリを構築したい場合に使用します。                            |
| [create_history_aware_retriever](https://api.python.langchain.com/en/latest/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html#langchain.chains.history_aware_retriever.create_history_aware_retriever)   |                         | レトリーバー    | このチェーンは会話履歴を取り込み、それを使用して検索クエリを生成し、基礎となるレトリーバーに渡します。                       |
| [create_retrieval_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.retrieval.create_retrieval_chain.html#langchain.chains.retrieval.create_retrieval_chain)           |                         | レトリーバー    | このチェーンはユーザーの問い合わせを受け取り、それをレトリーバーに渡して関連する文書を取得します。これらの文書（および元の入力）をLLMに渡してレスポンスを生成します。      |

## レガシーチェーン

以下は `レガシーチェーン` です。これらはLCELの代替が作成されるまでサポートを維持します。

表の列:

- **チェーン:** チェーンの名前またはコンストラクターメソッドの名前。コンストラクターメソッドの場合、`Chain` サブクラスを返します。
- **Function Calling:** チェーンがOpenAI Function Callingを必要とするかどうか。
- **その他のツール:** チェーンで使用されるその他のツール。
- **使用タイミング:** いつ使用するかについてのコメント。

| チェーン                        |  Function Calling | その他のツール            | 使用タイミング |
|------------------------------|--------------------|------------------------|-------------|
| [APIChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.api.base.APIChain.html#langchain.chains.api.base.APIChain)                    |                                            | Requests Wrapper               | このチェーンは、クエリをAPIリクエストに変換し、そのリクエストを実行し、応答を取得し、そのリクエストをLLMに渡して応答します。            |
| [OpenAPIEndpointChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.api.openapi.chain.OpenAPIEndpointChain.html#langchain.chains.api.openapi.chain.OpenAPIEndpointChain)         |                                            | OpenAPI Spec           | APIChainに似ていますが、このチェーンはAPIとのやり取りを目的としています。主な違いは、OpenAPIエンドポイントとの使いやすさに最適化されている点です。            |
| [ConversationalRetrievalChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.conversational_retrieval.base.ConversationalRetrievalChain.html#langchain.chains.conversational_retrieval.base.ConversationalRetrievalChain) |                                            | Retriever              |このチェーンは、ドキュメントとの**会話**に使用できます。質問と（オプションで）以前の会話履歴を受け取ります。以前の会話履歴がある場合、LLMを使用してその会話をリトリーバーに送信するクエリに書き直します（そうでない場合は、最新のユーザー入力を使用します）。その後、これらのドキュメントを取得し（会話と共に）LLMに渡して応答します。             |
| [StuffDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html#langchain.chains.combine_documents.stuff.StuffDocumentsChain)           |                    |                        |このチェーンはドキュメントのリストを受け取り、それらすべてをプロンプトにフォーマットし、そのプロンプトをLLMに渡します。すべてのドキュメントを渡すため、使用しているLLMのコンテキストウィンドウに収まるようにする必要があります。             |
| [ReduceDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.reduce.ReduceDocumentsChain.html#langchain.chains.combine_documents.reduce.ReduceDocumentsChain)         |                                            |                        |このチェーンはドキュメントを反復的に減らすことによって組み合わせます。ドキュメントをチャンクに分け（コンテキスト長未満）、それをLLMに渡します。応答を受け取り、最終的なLLM呼び出しに収めるまでこれを繰り返します。大量のドキュメントがある場合に役立ち、すべてのドキュメントに対してLLMを実行したい場合、並行して実行することができます。              |
| [MapReduceDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.map_reduce.MapReduceDocumentsChain.html#langchain.chains.combine_documents.map_reduce.MapReduceDocumentsChain)      |                        |                                            |このチェーンは、まず各ドキュメントをLLMに通し、その後`ReduceDocumentsChain`を使用してそれらを減らします。`ReduceDocumentsChain`と同じ状況で有用ですが、ドキュメントを減らす前に初期のLLM呼び出しを行います。          |
| [RefineDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.refine.RefineDocumentsChain.html#langchain.chains.combine_documents.refine.RefineDocumentsChain)         |    |                                        |このチェーンは、最初のドキュメントに基づいて初期の回答を生成し、残りのドキュメントをループして*精緻化*することによって回答を統合します。これは順次動作するため、並列化することはできません。MapReduceDocumentsChainと同様の状況で有用ですが、回答を精緻化することによって構築したい場合に使用します（呼び出しを並列化するのではなく）。                        |             |
| [MapRerankDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.map_rerank.MapRerankDocumentsChain.html#langchain.chains.combine_documents.map_rerank.MapRerankDocumentsChain)      |                        |                    |                                      このチェーンは各ドキュメントに対してLLMを呼び出し、回答するだけでなく、どれだけ自信があるかのスコアも生成します。最も自信のある回答が返されます。大量のドキュメントがあるが、回答を一つのドキュメントに基づいて行いたい場合に有用です（RefineやReduceの方法のように回答を組み合わせるのではなく）。|
| [ConstitutionalChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.constitutional_ai.base.ConstitutionalChain.html#langchain.chains.constitutional_ai.base.ConstitutionalChain)          |                                            |                        |このチェーンは回答し、その後提供された憲法原則に基づいて回答を精緻化しようとします。チェーンの回答が特定の原則に従うようにするために使用します。             |
| [LLMChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm.LLMChain.html#langchain.chains.llm.LLMChain)                                 |  |                  |                        |このチェーンは単にプロンプトをLLMと出力パーサーと組み合わせます。これを行う推奨方法はLCELを使用することです。             |
| [ElasticsearchDatabaseChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.elasticsearch_database.base.ElasticsearchDatabaseChain.html#langchain.chains.elasticsearch_database.base.ElasticsearchDatabaseChain)                           |                    | Elasticsearch Instance |このチェーンは自然言語の質問を`Elasticsearch`クエリに変換し、それを実行して応答を要約します。`Elasticsearch`データベースに自然言語の質問をしたい場合に有用です。             |
| [FlareChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.flare.base.FlareChain.html#langchain.chains.flare.base.FlareChain)                   |                                            |                        |これは高度な検索手法である[FLARE](https://arxiv.org/abs/2305.06983)を実装します。主に探索的な高度な検索手法として意図されています。             |
| [ArangoGraphQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.arangodb.ArangoGraphQAChain.html#langchain.chains.graph_qa.arangodb.ArangoGraphQAChain)                                   |                    |Arango Graph                        |このチェーンは自然言語からArangoクエリを作成し、そのクエリをグラフに対して実行し、結果をLLMに渡して応答します。             |
|[GraphCypherQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.cypher.GraphCypherQAChain.html#langchain.chains.graph_qa.cypher.GraphCypherQAChain)                                                      |                    |Cypherクエリ言語と連携するグラフ                        |このチェーンは自然言語からCypherクエリを作成し、そのクエリをグラフに対して実行し、結果をLLMに渡して応答します。             |
|[FalkorDBGraphQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.falkordb.FalkorDBQAChain.html#langchain.chains.graph_qa.falkordb.FalkorDBQAChain)                                                      |                    |Falkor Database                        | このチェーンは自然言語からFalkorDBクエリを作成し、そのクエリをグラフに対して実行し、結果をLLMに渡して応答します。             |
|[HugeGraphQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.hugegraph.HugeGraphQAChain.html#langchain.chains.graph_qa.hugegraph.HugeGraphQAChain)                                                     |                    |HugeGraph                        |このチェーンは自然言語からHugeGraphクエリを作成し、そのクエリをグラフに対して実行し、結果をLLMに渡して応答します。              |
|[KuzuQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.kuzu.KuzuQAChain.html#langchain.chains.graph_qa.kuzu.KuzuQAChain)                                                      |                    |Kuzu Graph                        |このチェーンは自然言語からKuzu Graphクエリを作成し、そのクエリをグラフに対して実行し、結果をLLMに渡して応答します。              |
|[NebulaGraphQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.nebulagraph.NebulaGraphQAChain.html#langchain.chains.graph_qa.nebulagraph.NebulaGraphQAChain)                                                      |                    |Nebula Graph                        |このチェーンは自然言語からNebula Graphクエリを作成し、そのクエリをグラフに対して実行し、結果をLLMに渡して応答します。              |
|[NeptuneOpenCypherQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.neptune_cypher.NeptuneOpenCypherQAChain.html#langchain.chains.graph_qa.neptune_cypher.NeptuneOpenCypherQAChain)                                                     |                    |Neptune Graph                        |このチェーンは自然言語からNeptune Graphクエリを作成し、そのクエリをグラフに対して実行し、結果をLLMに渡して応答します。              |
|[GraphSparqlChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.graph_qa.sparql.GraphSparqlQAChain.html#langchain.chains.graph_qa.sparql.GraphSparqlQAChain)                                                      |                    |SparQLと連携するグラフ                        |このチェーンは自然言語からSparQLクエリを作成し、そのクエリをグラフに対して実行し、結果をLLMに渡して応答します。              |
|[LLMMath](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm_math.base.LLMMathChain.html#langchain.chains.llm_math.base.LLMMathChain)                                                      |                    |                        |このチェーンはユーザーの質問を数学問題に変換し、それを実行します（[numexpr](https://github.com/pydata/numexpr))を使用）。             |
|[LLMCheckerChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm_checker.base.LLMCheckerChain.html#langchain.chains.llm_checker.base.LLMCheckerChain)                                                      |                    |                        |このチェーンは初期の回答を検証するために2回目のLLM呼び出しを使用します。初期のLLM呼び出しに対して追加の検証層が必要な場合に使用します。             |
|[LLMSummarizationChecker](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm_summarization_checker.base.LLMSummarizationCheckerChain.html#langchain.chains.llm_summarization_checker.base.LLMSummarizationCheckerChain)                              |                        |                                            |このチェーンは複数のLLM呼び出しを使用して要約を作成し、正確さを確保します。通常の要約チェーンよりも、速度/コストよりも正確さを重視する場合に使用します。             |
|[create_citation_fuzzy_match_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.citation_fuzzy_match.create_citation_fuzzy_match_chain.html#langchain.chains.openai_functions.citation_fuzzy_match.create_citation_fuzzy_match_chain)                                                      |✅                    |                        |質問に回答し、その出典を引用するためにOpenAIのfunction callingを使用します。             |
|[create_extraction_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.extraction.create_extraction_chain.html#langchain.chains.openai_functions.extraction.create_extraction_chain)                              |                        ✅                    |                        |テキストから情報を抽出するためにOpenAIのFunction callingを使用します。             |
|[create_extraction_chain_pydantic](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.extraction.create_extraction_chain_pydantic.html#langchain.chains.openai_functions.extraction.create_extraction_chain_pydantic)                              |                        ✅                    |                        |テキストからPydanticモデルに情報を抽出するためにOpenAIのfunction callingを使用します。`create_extraction_chain`と比較して、Pydanticとの統合がより緊密です。             |
|[get_openapi_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.openapi.get_openapi_chain.html#langchain.chains.openai_functions.openapi.get_openapi_chain)                              |                        ✅                    |OpenAPI Spec                        |OpenAIのfunction callingを使用してOpenAPIをクエリします。             |
|[create_qa_with_structure_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.qa_with_structure.create_qa_with_structure_chain.html#langchain.chains.openai_functions.qa_with_structure.create_qa_with_structure_chain)                              |                        ✅                    |                        |テキストに対して質問に回答し、特定の形式で応答するためにOpenAIのfunction callingを使用します。             |
|[create_qa_with_sources_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_functions.qa_with_structure.create_qa_with_sources_chain.html#langchain.chains.openai_functions.qa_with_structure.create_qa_with_sources_chain)                              |                        ✅                    |                        |出典付きで質問に回答するためにOpenAIのfunction callingを使用します。             |
|[QAGenerationChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.qa_generation.base.QAGenerationChain.html#langchain.chains.qa_generation.base.QAGenerationChain)                                          |            |                    |ドキュメントから質問と回答の両方を作成します。検索プロジェクトの評価のための質問/回答ペアを生成するために使用されます。                        |
|[RetrievalQAWithSourcesChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.qa_with_sources.retrieval.RetrievalQAWithSourcesChain.html#langchain.chains.qa_with_sources.retrieval.RetrievalQAWithSourcesChain)                              |                        |                          Retriever                    |取得したドキュメントに基づいて質問に回答し、その出典を引用します。回答テキストに出典を含めたい場合に使用します。ドキュメントをチェーンの一部として取得するためにリトリーバーを使用する場合に、`load_qa_with_sources_chain`よりも使用します。|
|[load_qa_with_sources_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.qa_with_sources.loading.load_qa_with_sources_chain.html#langchain.chains.qa_with_sources.loading.load_qa_with_sources_chain)                                                     | |Retriever                    |渡されたドキュメントに基づいて質問に回答し、その出典を引用します。回答テキストに出典を含めたい場合に使用します。リトリーバーに頼らずにドキュメントを直接渡したい場合に、RetrievalQAWithSourcesよりも使用します。|
|[RetrievalQA](https://api.python.langchain.com/en/latest/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html#langchain.chains.retrieval_qa.base.RetrievalQA)   |                                            |Retriever                        |このチェーンはまず関連するドキュメントを取得し、それらのドキュメントをLLMに渡して応答を生成します。|
|[MultiPromptChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.router.multi_prompt.MultiPromptChain.html#langchain.chains.router.multi_prompt.MultiPromptChain)                                                      |                    |                        |このチェーンは入力を複数のプロンプトの間でルーティングします。応答に使用する可能性のある複数のプロンプトがあり、一つにルーティングしたい場合に使用します。 |
|[MultiRetrievalQAChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.router.multi_retrieval_qa.MultiRetrievalQAChain.html#langchain.chains.router.multi_retrieval_qa.MultiRetrievalQAChain)|                                            |Retriever                        |このチェーンは入力を複数のリトリーバーの間でルーティングします。関連するドキュメントを取得するための複数のリトリーバーがあり、そのうち一つにルーティングしたい場合に使用します。 |
|[EmbeddingRouterChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.router.embedding_router.EmbeddingRouterChain.html#langchain.chains.router.embedding_router.EmbeddingRouterChain)|                                            |                        |このチェーンは埋め込みの類似性を使用して受信クエリをルーティングします。|
|[LLMRouterChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.router.llm_router.LLMRouterChain.html#langchain.chains.router.llm_router.LLMRouterChain)|                                            |                        |このチェーンはLLMを使用して潜在的なオプションの間でルーティングします。|
|load_summarize_chain|                        |                    |                        |このチェーンはテキストを要約します|
|[LLMRequestsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.llm_requests.LLMRequestsChain.html#langchain.chains.llm_requests.LLMRequestsChain)|                        |                                            |このチェーンはユーザー入力からURLを構築し、そのURLのデータを取得し、応答を要約します。APIChainとは異なり、このチェーンは特定のAPI仕様に焦点を当てず、より一般的です。       |
