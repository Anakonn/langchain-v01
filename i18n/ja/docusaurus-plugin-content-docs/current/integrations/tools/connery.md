---
translated: true
---

# Connery Action Tool

このツールを使うと、LangChain エージェントに個別の Connery Action を統合できます。

エージェントで複数の Connery Action を使用したい場合は、[Connery Toolkit](/docs/integrations/toolkits/connery) のドキュメントをご確認ください。

## Connery とは?

Connery は、オープンソースのプラグインインフラストラクチャーです。

Connery を使えば、アクションのセットを持つカスタムプラグインを簡単に作成し、LangChain エージェントに統合できます。
Connery は、ランタイム、認証、シークレット管理、アクセス管理、監査ログなの重要な側面を管理します。

さらに、Connery は、コミュニティーによってサポートされ、使い勝手の良いオープンソースプラグインのコレクションを提供しています。

Connery の詳細:

- GitHub: https://github.com/connery-io/connery
- ドキュメンテーション: https://docs.connery.io

## 前提条件

LangChain エージェントで Connery Actions を使うには、いくつかの準備が必要です:

1. [クイックスタート](https://docs.connery.io/docs/runner/quick-start/)ガイドに従って Connery ランナーをセットアップします。
2. エージェントで使用したいアクションを含むすべてのプラグインをインストールします。
3. ツールキットが Connery ランナーと通信できるよう、`CONNERY_RUNNER_URL` と `CONNERY_RUNNER_API_KEY` の環境変数を設定します。

## Connery Action Tool の使用例

以下の例では、Connery ランナーからアクションの ID を取得し、指定のパラメーターで呼び出しています。

ここでは、[Gmail](https://github.com/connery-io/gmail) プラグインの **Send email** アクションの ID を使用しています。

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.tools.connery import ConneryService
from langchain_openai import ChatOpenAI

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the emails from examples below.
recepient_email = "test@example.com"

# Get the SendEmail action from the Connery Runner by ID.
connery_service = ConneryService()
send_email_action = connery_service.get_action("CABC80BB79C15067CA983495324AE709")
```

アクションを手動で実行します。

```python
manual_run_result = send_email_action.run(
    {
        "recipient": recepient_email,
        "subject": "Test email",
        "body": "This is a test email sent from Connery.",
    }
)
print(manual_run_result)
```

OpenAI Functions エージェントを使ってアクションを実行します。

このサンプルの LangSmith トレースは[こちら](https://smith.langchain.com/public/a37d216f-c121-46da-a428-0e09dc19b1dc/r)で確認できます。

```python
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    [send_email_action], llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
agent_run_result = agent.run(
    f"Send an email to the {recepient_email} and say that I will be late for the meeting."
)
print(agent_run_result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Late for Meeting', 'body': 'Dear Team,\n\nI wanted to inform you that I will be late for the meeting today. I apologize for any inconvenience caused. Please proceed with the meeting without me and I will join as soon as I can.\n\nBest regards,\n[Your Name]'}`


[0m[36;1m[1;3m{'messageId': '<d34a694d-50e0-3988-25da-e86b4c51d7a7@gmail.com>'}[0m[32;1m[1;3mI have sent an email to test@example.com informing them that you will be late for the meeting.[0m

[1m> Finished chain.[0m
I have sent an email to test@example.com informing them that you will be late for the meeting.
```

注意: Connery Action は構造化ツールなので、構造化ツールをサポートするエージェントでのみ使用できます。
