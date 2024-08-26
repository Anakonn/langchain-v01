---
translated: true
---

# Dappier AI

**Dappier: AIを動的でリアルタイムのデータモデルで強化する**

Dappierは、ニュース、エンターテイメント、金融、市場データ、気象など、幅広いリアルタイムのデータモデルにすぐにアクセスできる最先端のプラットフォームを提供しています。事前トレーニングされたデータモデルを使うことで、AI アプリケーションを強化し、正確で最新の回答を提供し、不正確さを最小限に抑えることができます。

Dappierのデータモデルを使えば、世界有数のブランドからの信頼できる最新のコンテンツを使って、次世代のLLMアプリを構築できます。簡単なAPIを通じて、独自のデータを活用することで、創造性を発揮し、GPTアプリやAIワークフローを強化できます。信頼できるソースからの独自データを使ってAIを補強するのが、質問に関わらず、事実に基づいた最新の回答を得る最良の方法です。

開発者のための開発者
開発者を念頭に置いて設計されたDappierは、データ統合から収益化までの道のりを簡素化し、AIモデルの展開と収益化への明確で簡単な道筋を提供します。新しいインターネットの収益化インフラの未来を体験してください。**https://dappier.com/**

このサンプルでは、LangChainを使ってDappier AIモデルと連携する方法を説明します。

-----------------------------------------------------------------------------------

Dappier AIデータモデルを使うには、APIキーが必要です。Dappierプラットフォーム(https://platform.dappier.com/)にログインし、プロフィールでAPIキーを作成してください。

APIリファレンスの詳細は https://docs.dappier.com/introduction をご覧ください。

Dappier Chatモデルを使うには、dappier_api_keyパラメーターにキーを直接渡すか、環境変数に設定します。

```bash
export DAPPIER_API_KEY="..."
```

```python
from langchain_community.chat_models.dappier import ChatDappierAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatDappierAI(
    dappier_endpoint="https://api.dappier.com/app/datamodelconversation",
    dappier_model="dm_01hpsxyfm2fwdt2zet9cg6fdxt",
    dappier_api_key="...",
)
```

```python
messages = [HumanMessage(content="Who won the super bowl in 2024?")]
chat.invoke(messages)
```

```output
AIMessage(content='Hey there! The Kansas City Chiefs won Super Bowl LVIII in 2024. They beat the San Francisco 49ers in overtime with a final score of 25-22. It was quite the game! 🏈')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='The Kansas City Chiefs won Super Bowl LVIII in 2024! 🏈')
```
