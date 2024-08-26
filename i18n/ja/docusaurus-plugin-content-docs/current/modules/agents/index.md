---
sidebar_class_name: hidden
sidebar_position: 4
title: エージェント
translated: true
---

エージェントの核心的なアイデアは、言語モデルを使ってアクションの順序を選択することです。
チェーンでは、アクションの順序がコード内で決められています。
エージェントでは、言語モデルが推論エンジンとして使われ、どのアクションを取り、どの順序で取るかを決めます。

## [クイックスタート](/docs/modules/agents/quick_start)

エージェントを使い始めるには、[このスタートガイド](/docs/modules/agents/quick_start)をご覧ください。エージェントの初期化、ツールの作成、メモリの追加などの基本を説明しています。

## [概念](/docs/modules/agents/concepts)

エージェントを構築する上で理解が必要な重要な概念には、エージェント、AgentExecutor、ツール、ツールキットがあります。詳しい説明は[このガイド](/docs/modules/agents/concepts)をご覧ください。

## [エージェントの種類](/docs/modules/agents/agent_types/)

使用可能なエージェントの種類は多数あります。それぞれの特徴と使い分けについては[このセクション](/docs/modules/agents/agent_types/)をご確認ください。

## [ツール](/docs/modules/tools/)

エージェントの性能はツールに依存します。ツールについての包括的なガイドは[このセクション](/docs/modules/tools/)をご覧ください。

## ハウツーガイド

エージェントには関連する多くの機能があります。以下のガイドをご確認ください:

- [カスタムエージェントの構築](/docs/modules/agents/how_to/custom_agent)
- [ストリーミング(中間ステップとトークン)](/docs/modules/agents/how_to/streaming)
- [構造化出力を返すエージェントの構築](/docs/modules/agents/how_to/agent_structured)
- AgentExecutorの使用に関する機能:
  - [イテレーターとして使用する](/docs/modules/agents/how_to/agent_iter)
  - [解析エラーの処理](/docs/modules/agents/how_to/handle_parsing_errors)
  - [中間ステップの返却](/docs/modules/agents/how_to/intermediate_steps)
  - [最大反復回数の制限](/docs/modules/agents/how_to/max_iterations)
  - [エージェントのタイムアウト](/docs/modules/agents/how_to/max_time_limit)
