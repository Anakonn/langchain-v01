---
sidebar_label: PremAI
translated: true
---

# ChatPremAI

>[PremAI](https://app.premai.io)は、ユーザーエクスペリエンスと全体的な成長に集中できるように、最小限の労力で強力な本番用GenAIアプリケーションを構築できるユニファイドプラットフォームです。

この例では、`ChatPremAI`とやり取りするためのLangChainの使用方法について説明します。

### インストールとセットアップ

まず、langchainとpremai-sdkをインストールします。次のコマンドを入力してインストールできます:

```bash
pip install premai langchain
```

続行する前に、PremAIにアカウントを作成し、プロジェクトを既に開始していることを確認してください。そうでない場合は、無料で始める方法は次のとおりです:

1. [PremAI](https://app.premai.io/accounts/login/)にサインインし、[ここ](https://app.premai.io/api_keys/)でAPIキーを作成します。

2. [app.premai.io](https://app.premai.io)に移動すると、プロジェクトのダッシュボードに移動します。

3. プロジェクトを作成すると、プロジェクトIDが生成されます(IDとして書かれています)。このIDを使用して、デプロイされたアプリケーションと対話できます。

4. LaunchPad(🚀アイコンのもの)に移動します。そこで、選択したモデルをデプロイします。デフォルトのモデルは `gpt-4` です。生成パラメーター(max-tokens、temperature など)を設定・固定したり、システムプロンプトを事前に設定することもできます。

PremAIで最初のデプロイアプリケーションを作成できました 🎉 これでLangChainを使ってアプリケーションと対話できます。

```python
from langchain_community.chat_models import ChatPremAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## LangChainでChatPremAIインスタンスをセットアップする

必要なモジュールをインポートしたら、クライアントをセットアップしましょう。今のところ、`project_id`が8だと仮定しましょう。ただし、必ずご自身のproject-idを使用してください。そうしないと、エラーが発生します。

LangChainでPremを使用する場合、モデル名を渡したり、チャットクライアントでパラメーターを設定する必要はありません。すべてがLaunchPadモデルのデフォルト設定を使用します。

`注意:`クライアントを設定する際に`model_name`や`temperature`などのパラメーターを変更すると、既存のデフォルト設定が上書きされます。

```python
import getpass
import os

# First step is to set up the env variable.
# you can also pass the API key while instantiating the model but this
# comes under a best practices to set it as env variable.

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
# By default it will use the model which was deployed through the platform
# in my case it will is "claude-3-haiku"

chat = ChatPremAI(project_id=8)
```

## モデルの呼び出し

これで準備ができました。アプリケーションとの対話を始められます。`ChatPremAI`は`invoke`(`generate`と同じ)と`stream`の2つのメソッドをサポートしています。

前者は静的な結果を返し、後者はトークンを1つずつストリーミングします。チャットのような補完を生成する方法は次のとおりです。

### 生成

```python
human_message = HumanMessage(content="Who are you?")

response = chat.invoke([human_message])
print(response.content)
```

```output
I am an artificial intelligence created by Anthropic. I'm here to help with a wide variety of tasks, from research and analysis to creative projects and open-ended conversation. I have general knowledge and capabilities, but I'm not a real person - I'm an AI assistant. Please let me know if you have any other questions!
```

上記の結果はおもしろいですね? デフォルトのLaunchPadシステムプロンプトを `Always sound like a pirate` に設定しました。必要に応じて、デフォルトのシステムプロンプトを上書きすることもできます。

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="I am an artificial intelligence created by Anthropic. My purpose is to assist and converse with humans in a friendly and helpful way. I have a broad knowledge base that I can use to provide information, answer questions, and engage in discussions on a wide range of topics. Please let me know if you have any other questions - I'm here to help!")
```

生成パラメーターを呼び出し時に変更することもできます。

```python
chat.invoke([system_message, human_message], temperature=0.7, max_tokens=10, top_p=0.95)
```

```output
AIMessage(content='I am an artificial intelligence created by Anthropic')
```

### 重要な注意事項:

さらに進む前に、現在のChatPremのバージョンでは、[n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n)と[stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop)パラメーターがサポートされていないことに注意してください。

これらの2つのパラメーターについては、近いバージョンでサポートする予定です。

### ストリーミング

最後に、ダイナミックなチャットアプリケーションのためのトークンストリーミングの方法は次のとおりです。

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical state, but I'm functioning properly and ready to assist you with any questions or tasks you might have. How can I help you today?
```

上記と同様に、システムプロンプトや生成パラメーターを上書きする方法は次のとおりです。

```python
import sys

# For some experimental reasons if you want to override the system prompt then you
# can pass that here too. However it is not recommended to override system prompt
# of an already deployed model.

for chunk in chat.stream(
    "hello how are you",
    system_prompt="act like a dog",
    temperature=0.7,
    max_tokens=200,
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical form, but I'm functioning properly and ready to assist you. How can I help you today?
```
