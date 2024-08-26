---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io)は、ユーザーエクスペリエンスと全体的な成長に集中できるように、最小限の労力で強力な本番稼働GenAIアプリケーションを構築できるユニファイドプラットフォームです。

## ChatPremAI

この例では、`ChatPremAI`を使って異なるチャットモデルとやり取りする方法を説明します。

### インストールとセットアップ

まずは、langchainとpremai-sdkをインストールします。以下のコマンドを入力してインストールできます:

```bash
pip install premai langchain
```

続行する前に、PremAIにアカウントを作成し、プロジェクトを既に開始していることを確認してください。そうでない場合は、無料で始める方法は以下の通りです:

1. [PremAI](https://app.premai.io/accounts/login/)にサインインし、[ここ](https://app.premai.io/api_keys/)でAPIキーを作成します。

2. [app.premai.io](https://app.premai.io)に移動すると、プロジェクトのダッシュボードに移動します。

3. プロジェクトを作成すると、プロジェクトIDが生成されます(IDとして記述されます)。このIDを使ってアプリケーションと対話できます。

4. LaunchPad(🚀アイコンのもの)に移動し、好きなモデルをデプロイします。デフォルトのモデルは`gpt-4`です。生成パラメータ(max-tokens、temperature など)を設定・固定したり、システムプロンプトを事前に設定することもできます。

PremAIでの最初のアプリケーションデプロイおめでとうございます 🎉 langchainを使ってアプリケーションと対話できるようになりました。

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "PremAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "PremAI"}, {"imported": "ChatPremAI", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.premai.ChatPremAI.html", "title": "PremAI"}]-->
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_models import ChatPremAI
```

### LangChainでChatPremインスタンスをセットアップする

必要なモジュールをインポートしたら、クライアントをセットアップしましょう。今回は、`project_id`が8だと仮定しましょう。ただし、必ず自分のプロジェクトIDを使ってください。そうしないとエラーが発生します。

langchainでpremを使う場合、モデル名や生成パラメータを渡す必要はありません。LaunchPadモデルのデフォルト設定が使用されます。

`注意:`モデル名や`temperature`などのパラメータを設定すると、既存のデフォルト設定が上書きされます。

```python
import os
import getpass

if "PREMAI_API_KEY" not in os.environ:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

chat = ChatPremAI(project_id=8)
```

### モデルの呼び出し

これで準備ができました。アプリケーションとの対話を始められます。`ChatPremAI`は`invoke`(`generate`と同じ)と`stream`の2つのメソッドをサポートしています。

前者は静的な結果を返し、後者はトークンを1つずつストリーミングします。チャット形式の補完を生成する方法は以下の通りです。

### 生成

```python
human_message = HumanMessage(content="Who are you?")

chat.invoke([human_message])
```

面白いですね? デフォルトのlaunchpadシステムプロンプトを「常に海賊のように話す」に設定しました。必要に応じて、デフォルトのシステムプロンプトを上書きすることもできます。

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

生成パラメータを呼び出し時に変更することもできます。

```python
chat.invoke(
    [system_message, human_message],
    temperature = 0.7, max_tokens = 20, top_p = 0.95
)
```

### 重要な注意事項:

さらに進む前に、現在のChatPremバージョンでは[n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n)と[stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop)パラメータがサポートされていないことに注意してください。

これらのパラメータは、今後のバージョンで提供される予定です。

### ストリーミング

最後に、動的なチャットアプリケーションのためのトークンストリーミングの方法は以下の通りです。

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

上記と同様に、システムプロンプトや生成パラメータを上書きする方法は以下の通りです。

```python
import sys

for chunk in chat.stream(
    "hello how are you",
    system_prompt = "You are an helpful assistant", temperature = 0.7, max_tokens = 20
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

## 埋め込み

このセクションでは、`PremEmbeddings`を使ってさまざまな埋め込みモデルにアクセスする方法について説明します。まずはインポートとembeddingオブジェクトの定義から始めましょう。

```python
from langchain_community.embeddings import PremEmbeddings
```

クライアントをセットアップしました。プロジェクトIDは8だと仮定しましたが、必ず自分のプロジェクトIDを使ってください。

```python

import os
import getpass

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

# Define a model as a required parameter here since there is no default embedding model

model = "text-embedding-3-large"
embedder = PremEmbeddings(project_id=8, model=model)
```

埋め込みモデルを定義しました。多くの埋め込みモデルをサポートしています。サポートしているモデルの一覧は以下の表の通りです。

| プロバイダ  | スラッグ                                   | コンテキストトークン |
|------------|------------------------------------------|-------------------|
| cohere     | embed-english-v3.0                       | N/A               |
| openai     | text-embedding-3-small                   | 8191              |
| openai     | text-embedding-3-large                   | 8191              |
| openai     | text-embedding-ada-002                   | 8191              |
| replicate  | replicate/all-mpnet-base-v2              | N/A               |
| together   | togethercomputer/Llama-2-7B-32K-Instruct | N/A               |
| mistralai  | mistral-embed                            | 4096              |

モデルを変更するには、`slug`をコピーして埋め込みモデルにアクセスするだけです。単一のクエリと複数のクエリ(ドキュメントとも呼ばれる)の埋め込みを見ていきましょう。

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

最後に、ドキュメントの埋め込みを行います。

```python
documents = [
    "This is document1",
    "This is document2",
    "This is document3"
]

doc_result = embedder.embed_documents(documents)

# Similar to the previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```
