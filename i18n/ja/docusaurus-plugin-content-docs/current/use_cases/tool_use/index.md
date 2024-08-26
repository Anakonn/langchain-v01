---
sidebar_class_name: hidden
translated: true
---

# ツールの使用とエージェント

LLMsの興味深い使用例の1つは、APIやファンクション、データベースなどの他の「ツール」のためのナチュラルランゲージインターフェースを構築することです。LangChainは、以下の機能を持っているため、そのようなインターフェースを構築するのに適しています:

- 優れたモデル出力解析機能で、モデル出力からJSONやXML、OpenAIのファンクションコールなどを簡単に抽出できます。
- 組み込みの[ツール](/docs/integrations/tools)が豊富に用意されています。
- これらのツールを呼び出す方法に柔軟性があります。

ツールを使う主な2つの方法は、[chains](/docs/modules/chains)と[agents](/docs/modules/agents/)です。

Chainsでは、ツールの使用順序を事前に定義できます。

![chain](../../../../../../static/img/tool_chain.svg)

Agentsでは、モデルがツールを繰り返し使用して、ツールを使う回数を決めることができます。

![agent](../../../../../../static/img/tool_agent.svg)

両方のアプローチの使い始め方は、[クイックスタート](/docs/use_cases/tool_use/quickstart)ページをご覧ください。
