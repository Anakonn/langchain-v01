---
sidebar_class_name: hidden
title: 構造化出力の抽出
translated: true
---

## 概要

大規模言語モデル(LLM)は、情報抽出アプリケーションを強化するための非常に優れた技術として台頭してきています。

情報抽出に対する従来のソリューションは、人間、(多数の)手作業のルール(正規表現など)、およびカスタムのファインチューンされたMLモデルの組み合わせに依存しています。

このようなシステムは時間とともに複雑になり、メンテナンスが次第に高コストになり、拡張が困難になる傾向にあります。

LLMは、適切な指示と適切な参照例を提供することで、特定の抽出タスクに迅速に適応できます。

このガイドでは、LLMを使用した抽出アプリケーションの使用方法を示します。

## アプローチ

LLMを使用した情報抽出には、3つの主要なアプローチがあります:

- **ツール/関数呼び出し**モード: 一部のLLMは、*ツールや関数の呼び出し*モードをサポートしています。これらのLLMは、与えられた**スキーマ**に従って出力を構造化できます。一般的に、このアプローチは最も扱いやすく、良い結果が期待できます。

- **JSONモード**: 一部のLLMは、有効なJSONを出力するように強制できます。これは**ツール/関数呼び出し**アプローチと似ていますが、スキーマがプロンプトの一部として提供されます。一般的に、私たちの直感では、**ツール/関数呼び出し**アプローチよりも性能が低いと考えられますが、自分のユースケースで検証してください。

- **プロンプティングベース**: 指示に従うことができるLLMは、所望の形式で文章を生成するように指示できます。生成された文章は、既存の[出力パーサー](/docs/modules/model_io/output_parsers/)または[カスタムパーサー](/docs/modules/model_io/output_parsers/custom)を使用してJSONなどの構造化フォーマットにパースできます。このアプローチは、JSONモードやツール/関数呼び出しモードをサポートしていないLLMでも使用できます。このアプローチはより広範囲に適用できますが、抽出やファンクション呼び出しに特化したモデルよりも結果が劣る可能性があります。

## クイックスタート

[クイックスタート](/docs/use_cases/extraction/quickstart)に移動して、**ツール/関数呼び出し**アプローチを使用してLLMを使用した情報抽出の基本的なエンドツーエンドの例を確認してください。

## ハウツーガイド

- [参照例の使用](/docs/use_cases/extraction/how_to/examples): 性能を向上させるための**参照例**の使用方法を学びます。
- [長文への対応](/docs/use_cases/extraction/how_to/handle_long_text): LLMのコンテキストウィンドウに収まらないテキストにはどのように対処すべきですか?
- [ファイルの処理](/docs/use_cases/extraction/how_to/handle_files): PDFなどのファイルから抽出する際のLangChainドキュメントローダーとパーサーの使用例。
- [パースアプローチの使用](/docs/use_cases/extraction/how_to/parse): **ツール/関数呼び出し**をサポートしないモデルで抽出するためのプロンプトベースのアプローチを使用します。

## ガイドライン

[ガイドライン](/docs/use_cases/extraction/guidelines)ページに移動して、抽出ユースケースの最高のパフォーマンスを得るためのオピニオンベースのガイドラインのリストを確認してください。

## ユースケースアクセラレータ

[langchain-extract](https://github.com/langchain-ai/langchain-extract)は、LLMを使用してテキストやファイルから情報を抽出するための簡単なWebサーバーを実装したスターターリポジトリです。**FastAPI**、**LangChain**、**Postgresql**を使用して構築されています。ご自身のユースケースに合わせて適応してください。

## その他のリソース

* [出力パーサー](/docs/modules/model_io/output_parsers/)のドキュメントには、リスト、日時、列挙型など、特定のタイプ用のパーサーの例が含まれています。
* ファイルからコンテンツを読み込むための LangChain [ドキュメントローダー](/docs/modules/data_connection/document_loaders/)。[統合](/docs/integrations/document_loaders)のリストをご覧ください。
* 実験的な[Anthropic関数呼び出し](/docs/integrations/chat/anthropic_functions)サポートは、Anthropicチャットモデルと同様の機能を提供します。
* [LlamaCPP](/docs/integrations/llms/llamacpp#grammars)は、カスタムグラマーを使用した制限付きデコーディングをネイティブでサポートしているため、ローカルLLMを使用して構造化コンテンツを出力するのが簡単です。
* [JSONFormer](/docs/integrations/llms/jsonformer_experimental)は、JSONスキーマのサブセットの構造化デコーディングのための別の方法を提供します。
* [Kor](https://eyurtsev.github.io/kor/)は、スキーマと例をLLMに提供できる抽出のための別のライブラリです。Korはパースアプローチ向けに最適化されています。
* [OpenAIの関数とツールの呼び出し](https://platform.openai.com/docs/guides/function-calling)
* 例として、[OpenAIのJSONモード](https://platform.openai.com/docs/guides/text-generation/json-mode)をご覧ください。
