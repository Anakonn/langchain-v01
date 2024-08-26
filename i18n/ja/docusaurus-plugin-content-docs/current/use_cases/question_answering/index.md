---
sidebar_class_name: hidden
translated: true
---

# Q&Aについて

## 概要

LLMが可能にする最も強力なアプリケーションの1つが、高度な質問応答(Q&A)チャットボットです。これらのアプリケーションは、特定のソース情報について質問に答えることができます。これらのアプリケーションは、Retrieval Augmented Generation (RAG)と呼ばれる手法を使用しています。

### RAGとは何ですか?

RAGは、LLMの知識にさらなるデータを追加する手法です。

LLMは幅広いトピックについて推論することができますが、その知識は、モデルが訓練された時点までの一般公開データに限られています。プライベートデータや、モデルの切断日以降に導入されたデータについて推論できるAIアプリケーションを構築するには、モデルの知識にその特定の情報を追加する必要があります。適切な情報を引き出し、モデルのプロンプトに挿入するプロセスは、Retrieval Augmented Generation (RAG)と呼ばれています。

LangChainには、Q&Aアプリケーション、およびRAGアプリケーションをより一般的に構築するためのコンポーネントが多数用意されています。

**注意**: ここでは非構造化データに対するQ&Aについて説明します。他のRAGのユースケースは以下の通りです:

- [SQLデータに対するQ&A](/docs/use_cases/sql/)
- [コードに対するQ&A](/docs/use_cases/code_understanding) (例: Python)

## RAGアーキテクチャ

典型的なRAGアプリケーションには、主に2つのコンポーネントがあります:

**インデックス作成**: データソースからデータを取り込み、インデックス化するパイプラインです。*通常はオフラインで行われます。*

**検索と生成**: ユーザーの質問を受け取り、関連するデータをインデックスから検索し、それをモデルに渡して回答を生成する実際のRAGチェーンです。

生のデータから回答を得るまでの一般的な流れは以下の通りです:

#### インデックス作成

1. **ロード**: まずデータをロードする必要があります。これは[DocumentLoaders](/docs/modules/data_connection/document_loaders/)を使って行います。
2. **分割**: [Text splitters](/docs/modules/data_connection/document_transformers/)は、大きな`Documents`を小さな塊に分割します。これは、データのインデックス化とモデルへの入力の両方で役立ちます。大きな塊は検索が難しく、モデルの有限なコンテキストウィンドウに収まらないためです。
3. **保存**: 後で検索できるよう、分割したデータを保存・インデックス化する必要があります。これは通常、[VectorStore](/docs/modules/data_connection/vectorstores/)と[Embeddings](/docs/modules/data_connection/text_embedding/)モデルを使って行います。

![index_diagram](../../../../../../static/img/rag_indexing.png)

#### 検索と生成

4. **検索**: ユーザーの入力に対して、[Retriever](/docs/modules/data_connection/retrievers/)を使って関連するデータ塊を検索します。
5. **生成**: [ChatModel](/docs/modules/model_io/chat)や[LLM](/docs/modules/model_io/llms/)を使って、質問とretrieved dataを含むプロンプトから回答を生成します。

![retrieval_diagram](../../../../../../static/img/rag_retrieval_generation.png)

## 目次

- [クイックスタート](/docs/use_cases/question_answering/quickstart): ここから始めることをおすすめします。以下のガイドの多くは、このクイックスタートの内容を理解していることを前提としています。
- [ソースの返却](/docs/use_cases/question_answering/sources): 特定の生成に使用されたソース文書を返す方法。
- [ストリーミング](/docs/use_cases/question_answering/streaming): 最終的な回答と中間ステップをストリーミングする方法。
- [チャット履歴の追加](/docs/use_cases/question_answering/chat_history): Q&Aアプリにチャット履歴を追加する方法。
- [ハイブリッド検索](/docs/use_cases/question_answering/hybrid): ハイブリッド検索を行う方法。
- [ユーザー別の検索](/docs/use_cases/question_answering/per_user): ユーザーごとにプライベートデータがある場合の検索方法。
- [エージェントの使用](/docs/use_cases/question_answering/conversational_retrieval_agents): Q&Aにエージェントを使う方法。
- [ローカルモデルの使用](/docs/use_cases/question_answering/local_retrieval_qa): ローカルモデルを使ってQ&Aを行う方法。
