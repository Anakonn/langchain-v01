---
translated: true
---

# OpenAI Functions Agent - Gmail

受信箱をゼロにするのに苦労したことがありますか？

このテンプレートを使用すると、Gmailアカウントを管理するための独自のAIアシスタントを作成およびカスタマイズできます。デフォルトのGmailツールを使用して、メールを読み込んだり、検索したり、返信用の下書きを作成したりできます。また、Tavily検索エンジンにアクセスできるため、メールスレッド内の話題や人物について関連情報を検索し、下書きに必要な情報をすべて含めて知識豊富に見えるようにすることができます。

## 詳細

このアシスタントは、OpenAIの[function calling](https://python.langchain.com/docs/modules/chains/how_to/openai_functions)サポートを使用して、提供したツールを確実に選択および呼び出します。

このテンプレートは、適切な場所で[langchain-core](https://pypi.org/project/langchain-core/)および[`langchain-community`](https://pypi.org/project/langchain-community/)から直接インポートも行います。LangChainを再構築して、使用ケースに必要な特定の統合を選択できるようにしました。まだ`langchain`からインポートすることもできますが（この移行は後方互換性を持たせています）、ほとんどのクラスの場所を所有権に反映するように分離し、依存リストを軽量化しました。必要な統合のほとんどは`langchain-community`パッケージにあり、コアの表現言語APIのみを使用する場合は、`langchain-core`のみに基づいて構築することもできます。

## 環境セットアップ

次の環境変数を設定する必要があります：

OpenAIモデルにアクセスするために`OPENAI_API_KEY`環境変数を設定します。

Tavily検索にアクセスするために`TAVILY_API_KEY`環境変数を設定します。

GmailからのOAuthクライアントIDを含む[`credentials.json`](https://developers.google.com/gmail/api/quickstart/python#authorize_credentials_for_a_desktop_application)ファイルを作成します。認証をカスタマイズするには、以下の[認証のカスタマイズ](#customize-auth)セクションを参照してください。

_*注意:* このアプリを初めて実行すると、ユーザー認証フローを強制的に行わせます。_

（オプション）：`GMAIL_AGENT_ENABLE_SEND`を`true`に設定するか、このテンプレートの`agent.py`ファイルを修正して、「送信」ツールへのアクセスを許可します。これにより、アシスタントがあなたの明示的なレビューなしにメールを送信する権限が与えられますが、推奨されません。

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります：

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のようにします：

```shell
langchain app new my-app --package openai-functions-agent-gmail
```

既存のプロジェクトに追加する場合は、次のコマンドを実行するだけです：

```shell
langchain app add openai-functions-agent-gmail
```

そして、次のコードを`server.py`ファイルに追加します：

```python
from openai_functions_agent import agent_executor as openai_functions_agent_chain

add_routes(app, openai_functions_agent_chain, path="/openai-functions-agent-gmail")
```

（オプション）次にLangSmithを構成しましょう。
LangSmithは、LangChainアプリケーションをトレース、監視、およびデバッグするのに役立ちます。
[こちら](https://smith.langchain.com/)でLangSmithにサインアップできます。
アクセスできない場合は、このセクションをスキップできます

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合、次のコマンドで直接LangServeインスタンスを起動できます：

```shell
langchain serve
```

これにより、ローカルでサーバーが実行されているFastAPIアプリが開始されます。
[http://localhost:8000](http://localhost:8000)

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドには[http://127.0.0.1:8000/openai-functions-agent-gmail/playground](http://127.0.0.1:8000/openai-functions-agent/playground)でアクセスできます。

コードからテンプレートにアクセスするには：

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-agent-gmail")
```

## 認証のカスタマイズ

```python
from langchain_community.tools.gmail.utils import build_resource_service, get_gmail_credentials

# Can review scopes here https://developers.google.com/gmail/api/auth/scopes
# For instance, readonly scope is 'https://www.googleapis.com/auth/gmail.readonly'
credentials = get_gmail_credentials(
    token_file="token.json",
    scopes=["https://mail.google.com/"],
    client_secrets_file="credentials.json",
)
api_resource = build_resource_service(credentials=credentials)
toolkit = GmailToolkit(api_resource=api_resource)
```
