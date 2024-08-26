---
sidebar_class_name: hidden
translated: true
---

# テンプレート

さまざまなカテゴリのテンプレートをハイライトします。

## ⭐ 人気

これらは初めてお使いいただくのに適したテンプレートです。

- [Retrieval Augmented Generation Chatbot](/docs/templates/rag-conversation): OpenAIとPineconeVectorStoreを使用してデータ上でチャットボットを構築します。
- [Extraction with OpenAI Functions](/docs/templates/extraction-openai-functions): 構造化されていないデータから構造化データを抽出します。OpenAI関数呼び出しを使用します。
- [Local Retrieval Augmented Generation](/docs/templates/rag-chroma-private): データ上でチャットボットを構築します。Ollama、GPT4all、Chromaなどのローカルツールのみを使用します。
- [OpenAI Functions Agent](/docs/templates/openai-functions-agent): アクションを実行できるチャットボットを構築します。OpenAI関数呼び出しとTavilyを使用します。
- [XML Agent](/docs/templates/xml-agent): アクションを実行できるチャットボットを構築します。AnthropicとYou.comを使用します。

## 📥 高度な検索

これらのテンプレートは高度な検索手法をカバーしており、データベースやドキュメントに対するチャットやQAに使用できます。

- [Reranking](/docs/templates/rag-pinecone-rerank): この検索手法では、Cohereのreranking エンドポイントを使用して、初期検索ステップから取得したドキュメントをランク付けし直します。
- [Anthropic Iterative Search](/docs/templates/anthropic-iterative-search): この検索手法では、反復的なプロンプティングを使用して、何を検索すべきか、そして検索したドキュメントが十分良いかどうかを判断します。
- **親ドキュメントの検索** [Neo4j](/docs/templates/neo4j-parent)または[MongoDB](/docs/templates/mongo-parent-document-retrieval)を使用: この検索手法では、より小さな塊のためのエンベディングを保存しますが、生成のためにより大きな塊を返します。
- [Semi-Structured RAG](/docs/templates/rag-semi-structured): このテンプレートは、半構造化データ(テキストとテーブルの両方を含むデータなど)に対する検索方法を示しています。
- [Temporal RAG](/docs/templates/rag-timescale-hybrid-search-time): このテンプレートは、[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)を使用して時間ベースのコンポーネントを持つデータに対するハイブリッド検索方法を示しています。

## 🔍 高度な検索 - クエリ変換

ユーザークエリを変換することで検索品質を向上させることができる高度な検索手法の選択。

- [Hypothetical Document Embeddings](/docs/templates/hyde): 与えられたクエリに対して仮想的なドキュメントを生成し、そのドキュメントのエンベディングを使用してセマンティック検索を行う検索手法。[論文](https://arxiv.org/abs/2212.10496)。
- [Rewrite-Retrieve-Read](/docs/templates/rewrite-retrieve-read): 与えられたクエリを書き換えてから検索エンジンに渡す検索手法。[論文](https://arxiv.org/abs/2305.14283)。
- [Step-back QA Prompting](/docs/templates/stepback-qa-prompting): 「ステップバック」の質問を生成し、その質問と元の質問の両方に関連するドキュメントを検索する検索手法。[論文](https://arxiv.org/abs//2310.06117)。
- [RAG-Fusion](/docs/templates/rag-fusion): 複数のクエリを生成し、取得したドキュメントを相互ランク融合を使用してランク付けし直す検索手法。[記事](https://towardsdatascience.com/forget-rag-the-future-is-rag-fusion-1147298d8ad1)。
- [Multi-Query Retriever](/docs/templates/rag-pinecone-multi-query): この検索手法では、LLMを使用して複数のクエリを生成し、すべてのクエリのドキュメントを取得します。

## 🧠 高度な検索 - クエリ構築

自然言語ではなく別のDSLでクエリを構築する高度な検索手法の選択。これにより、さまざまな構造化データベースに対する自然言語チャットが可能になります。

- [Elastic Query Generator](/docs/templates/elastic-query-generator): 自然言語からElasticsearchクエリを生成します。
- [Neo4j Cypher Generation](/docs/templates/neo4j-cypher): 自然言語からCypherステートメントを生成します。["full text"オプション](/docs/templates/neo4j-cypher-ft)もあります。
- [Supabase Self Query](/docs/templates/self-query-supabase): 自然言語クエリをセマンティッククエリとSupabaseのメタデータフィルターに解析します。

## 🦙 OSS モデル

これらのテンプレートはOSSモデルを使用しており、機密データのプライバシーを確保できます。

- [Local Retrieval Augmented Generation](/docs/templates/rag-chroma-private): Ollama、GPT4all、Chromaなどのローカルツールのみを使用してデータ上でチャットボットを構築します。
- [SQL Question Answering (Replicate)](/docs/templates/sql-llama2): [Replicate](https://replicate.com/)でホストされているLlama2を使用してSQL データベースに対する質問応答を行います。
- [SQL Question Answering (LlamaCpp)](/docs/templates/sql-llamacpp): [LlamaCpp](https://github.com/ggerganov/llama.cpp)を使用してSQL データベースに対する質問応答を行います。
- [SQL Question Answering (Ollama)](/docs/templates/sql-ollama): [Ollama](https://github.com/jmorganca/ollama)を使用してSQL データベースに対する質問応答を行います。

## ⛏️ 抽出

これらのテンプレートは、ユーザー指定のスキーマに基づいて、構造化されたフォーマットでデータを抽出します。

- [OpenAI Functions を使った抽出](/docs/templates/extraction-openai-functions): OpenAI Function Calling を使用してテキストから情報を抽出します。
- [Anthropic Functions を使った抽出](/docs/templates/extraction-anthropic-functions): Anthropic のエンドポイントをラップしたLangChainを使用してテキストから情報を抽出します。
- [バイオテック プレートデータの抽出](/docs/templates/plate-chain): 雑然としたExcelスプレッドシートからマイクロプレートデータを、より正規化された形式に抽出します。

## ⛏️要約とタグ付け

これらのテンプレートは、文書やテキストを要約したり分類したりします。

- [Anthropic による要約](/docs/templates/summarize-anthropic): Anthropic の Claude2 を使用して長文書を要約します。

## 🤖 エージェント

これらのテンプレートは、タスクを自動化するアクションを取ることができるチャットボットを構築します。

- [OpenAI Functions エージェント](/docs/templates/openai-functions-agent): OpenAI function calling と Tavily を使用してアクションを取るチャットボットを構築します。
- [XMLエージェント](/docs/templates/xml-agent): Anthropic と You.com を使用してアクションを取るチャットボットを構築します。

## :rotating_light: 安全性と評価

これらのテンプレートは、LLM出力の適切性を検証したり評価したりすることができます。

- [Guardrails Output Parser](/docs/templates/guardrails-output-parser): guardrails-ai を使用してLLM出力を検証します。
- [チャットボットフィードバック](/docs/templates/chat-bot-feedback): LangSmith を使用してチャットボットの応答を評価します。
