---
translated: true
---

# Lemon Agent

>[Lemon Agent](https://github.com/felixbrock/lemon-agent)は、数分でパワフルなAIアシスタントを構築し、`Airtable`、`Hubspot`、`Discord`、`Notion`、`Slack`、`Github`などのツールでの正確で信頼性の高い読み取りと書き込み操作を可能にすることで、ワークフローを自動化できます。

[完全なドキュメントはこちら](https://github.com/felixbrock/lemonai-py-client)をご覧ください。

現在利用可能な多くのコネクタは読み取り専用の操作に焦点を当てているため、LLMの可能性を制限しています。一方、エージェントは文脈や指示が不足しているために時折幻覚を見る傾向があります。

`Lemon AI`を使えば、信頼性の高い読み取りと書き込み操作のためのよく定義されたAPIにエージェントがアクセスできるようになります。さらに、`Lemon AI`関数を使うことで、不確実性の場合にモデルが依存できるワークフローを静的に定義することで、幻覚のリスクをさらに低減できます。

## クイックスタート

以下のクイックスタートでは、内部ツールとの対話を伴うワークフローを自動化するためにLemon AIとエージェントを組み合わせて使う方法を示します。

### 1. Lemon AIをインストールする

Python 3.8.1以降が必要です。

PythonプロジェクトでLemon AIを使うには、`pip install lemonai`を実行してください。

これにより、Lemon AIクライアントがインストールされ、スクリプトにインポートできるようになります。

このツールはPythonパッケージのlangchainとloguruを使用しています。Lemon AIのインストールエラーが発生した場合は、まずこれらのパッケージをインストールしてから、Lemon AIパッケージをインストールしてください。

### 2. サーバーを起動する

エージェントとLemon AIが提供するすべてのツールの対話は、[Lemon AIサーバー](https://github.com/felixbrock/lemonai-server)によって処理されます。Lemon AIを使うには、Lemon AIのPythonクライアントが接続できるように、ローカルマシンでサーバーを実行する必要があります。

### 3. LangchainでLemon AIを使う

Lemon AIは、関連するツールの適切な組み合わせを見つけるか、代替としてLemon AI関数を使うことで、与えられたタスクを自動的に解決します。以下の例は、Hackernewsからユーザーを取得し、Airtableのテーブルに書き込む方法を示しています:

#### (オプション) Lemon AI関数を定義する

[OpenAI functions](https://openai.com/blog/function-calling-and-other-api-updates)と同様に、Lemon AIでは、再利用可能な関数としてワークフローを定義するオプションが提供されています。これらの関数は、可能な限り決定論的な動作に近づけることが特に重要な使用例に対して定義できます。個別のワークフローは、lemonai.jsonで定義できます:

```json
[
  {
    "name": "Hackernews Airtable User Workflow",
    "description": "retrieves user data from Hackernews and appends it to a table in Airtable",
    "tools": ["hackernews-get-user", "airtable-append-data"]
  }
]
```

モデルはこれらの関数にアクセスでき、タスクを解決するためのツールを自ら選択するよりも、これらの関数を優先的に使用します。プロンプトに関数名を含めるだけで、エージェントにその関数を使うよう指示できます。

#### LangchainプロジェクトにLemon AIを組み込む

```python
import os

from langchain_openai import OpenAI
from lemonai import execute_workflow
```

#### APIキーとアクセストークンを読み込む

認証が必要なツールを使うには、環境変数に対応するアクセス資格情報を、"{ツール名}_{認証文字列}"の形式で保存する必要があります。認証文字列は、APIキーの場合は"API_KEY"、"SECRET_KEY"、"SUBSCRIPTION_KEY"、"ACCESS_KEY"のいずれか、認証トークンの場合は"ACCESS_TOKEN"、"SECRET_TOKEN"のいずれかです。例えば"OPENAI_API_KEY"、"BING_SUBSCRIPTION_KEY"、"AIRTABLE_ACCESS_TOKEN"などです。

```python
""" Load all relevant API Keys and Access Tokens into your environment variables """
os.environ["OPENAI_API_KEY"] = "*INSERT OPENAI API KEY HERE*"
os.environ["AIRTABLE_ACCESS_TOKEN"] = "*INSERT AIRTABLE TOKEN HERE*"
```

```python
hackernews_username = "*INSERT HACKERNEWS USERNAME HERE*"
airtable_base_id = "*INSERT BASE ID HERE*"
airtable_table_id = "*INSERT TABLE ID HERE*"

""" Define your instruction to be given to your LLM """
prompt = f"""Read information from Hackernews for user {hackernews_username} and then write the results to
Airtable (baseId: {airtable_base_id}, tableId: {airtable_table_id}). Only write the fields "username", "karma"
and "created_at_i". Please make sure that Airtable does NOT automatically convert the field types.
"""

"""
Use the Lemon AI execute_workflow wrapper
to run your Langchain agent in combination with Lemon AI
"""
model = OpenAI(temperature=0)

execute_workflow(llm=model, prompt_string=prompt)
```

### 4. エージェントの意思決定の透明性を得る

エージェントがLemon AIツールを使ってタスクを解決する際の意思決定、使用したツール、実行した操作の透明性を得るために、すべての決定内容が`lemonai.log`ファイルに書き込まれます。LLMエージェントがLemon AIツールスタックと対話するたびに、対応するログエントリが作成されます。

```log
2023-06-26T11:50:27.708785+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - hackernews-get-user
2023-06-26T11:50:39.624035+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - airtable-append-data
2023-06-26T11:58:32.925228+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - hackernews-get-user
2023-06-26T11:58:43.988788+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - airtable-append-data
```

[Lemon AI Analytics](https://github.com/felixbrock/lemon-agent/blob/main/apps/analytics/README.md)を使えば、ツールの使用頻度や順序を簡単に把握できます。その結果、エージェントの意思決定能力の弱点を特定し、Lemon AI関数を定義することで、より決定論的な動作に移行できます。
