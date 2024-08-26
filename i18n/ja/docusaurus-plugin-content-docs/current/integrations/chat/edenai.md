---
translated: true
---

# Eden AI

Eden AIは、最高のAIプロバイダーを統合することで、AIの可能性を無限大に広げ、人工知能の真の潜在力を引き出すことで、AIの景観を革新しています。包括的で面倒な手間のないプラットフォームにより、ユーザーはAI機能をライトニングスピードで本番環境に展開でき、単一のAPIを通じてAI機能の全範囲に簡単にアクセスできます。 (ウェブサイト: https://edenai.co/)

この例では、LangChainを使ってEden AIモデルと対話する方法を説明します。

-----------------------------------------------------------------------------------

`EdenAI`は単なるモデル呼び出しを超えています。以下の高度な機能を提供しています:

- **複数のプロバイダー**: 様々なプロバイダーが提供する言語モデルにアクセスできるため、ユースケースに最適なモデルを選択できます。

- **フォールバックメカニズム**: プライマリプロバイダーが利用できない場合でも、シームレスな操作を確保するためのフォールバックメカニズムを設定できます。

- **使用状況の追跡**: プロジェクトごとおよびAPIキーごとの使用状況を追跡できます。この機能により、リソース消費を効果的に監視および管理できます。

- **モニタリングと可視化**: `EdenAI`は、プラットフォーム上の包括的なモニタリングと可視化ツールを提供します。言語モデルのパフォーマンスを監視し、使用パターンを分析し、アプリケーションの最適化に役立つ重要な洞察を得ることができます。

EdenAIのAPIにアクセスするには、APIキーが必要です。

アカウントを作成 https://app.edenai.run/user/register し、ここ https://app.edenai.run/admin/iam/api-keys からAPIキーを取得できます。

キーが手に入ったら、次のように環境変数に設定します:

```bash
export EDENAI_API_KEY="..."
```

APIリファレンスの詳細については、こちらをご覧ください: https://docs.edenai.co/reference

環境変数を設定したくない場合は、edenai_api_keyパラメーターを使ってキーを直接渡すこともできます。

 EdenAIチャットモデルクラスのインスタンス化時に。

```python
from langchain_community.chat_models.edenai import ChatEdenAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatEdenAI(
    edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250
)
```

```python
messages = [HumanMessage(content="Hello !")]
chat.invoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## ストリーミングとバッチ処理

`ChatEdenAI`はストリーミングとバッチ処理をサポートしています。以下に例を示します。

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Hello! How can I assist you today?
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='Hello! How can I assist you today?')]
```

## フォールバックメカニズム

Eden AIでは、プライマリプロバイダーが利用できない場合でも、シームレスな操作を確保するためのフォールバックメカニズムを設定できます。

```python
chat = ChatEdenAI(
    edenai_api_key="...",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
    fallback_providers="google",
)
```

この例では、OpenAIに問題がある場合、Googleをバックアッププロバイダーとして使用できます。

Eden AIの詳細については、こちらのリンクをご覧ください: https://docs.edenai.co/docs/additional-parameters

## 呼び出しのチェーン

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "What is a good name for a company that makes {product}?"
)
chain = prompt | chat
```

```python
chain.invoke({"product": "healthy snacks"})
```

```output
AIMessage(content='VitalBites')
```
