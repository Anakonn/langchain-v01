---
translated: true
---

# Connery Toolkit

このツールキットを使用すると、Connery ActionsをあなたのLangChainエージェントに統合できます。

特定のConnery Actionのみをエージェントで使用したい場合は、[Connery Action Tool](/docs/integrations/tools/connery)のドキュメントをご確認ください。

## Conneryとは?

Conneryは、AIのためのオープンソースプラグインインフラストラクチャです。

Conneryを使うと、アクションのセットを持つカスタムプラグインを簡単に作成し、LangChainエージェントに自然に統合できます。
Conneryは、ランタイム、認証、シークレット管理、アクセス管理、監査ログなどの重要な側面を管理します。

さらに、Conneryは、コミュニティによってサポートされ、使い勝手の良い多数のオープンソースプラグインを提供しています。

Conneryの詳細:

- GitHub: https://github.com/connery-io/connery
- ドキュメンテーション: https://docs.connery.io

## 前提条件

LangChainエージェントでConnery Actionsを使用するには、いくつかの準備が必要です:

1. [クイックスタート](https://docs.connery.io/docs/runner/quick-start/)ガイドに従ってConnery ランナーをセットアップします。
2. エージェントで使用したいアクションを持つすべてのプラグインをインストールします。
3. ツールキットがConnery Runnerと通信できるように、`CONNERY_RUNNER_URL`と`CONNERY_RUNNER_API_KEY`の環境変数を設定します。

## Connery Toolkitの使用例

以下の例では、2つのConnery Actionsを使用するエージェントを作成します:

1. [Summarization](https://github.com/connery-io/summarization-plugin)プラグインの**公開ウェブページの要約**アクション。
2. [Gmail](https://github.com/connery-io/gmail)プラグインの**メール送信**アクション。

このサンプルのLangSmithトレースは[こちら](https://smith.langchain.com/public/4af5385a-afe9-46f6-8a53-57fe2d63c5bc/r)で確認できます。

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.connery import ConneryToolkit
from langchain_community.chat_models import ChatOpenAI
from langchain_community.tools.connery import ConneryService

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the email with the summary from example below.
recepient_email = "test@example.com"

# Create a Connery Toolkit with all the available actions from the Connery Runner.
connery_service = ConneryService()
connery_toolkit = ConneryToolkit.create_instance(connery_service)

# Use OpenAI Functions agent to execute the prompt using actions from the Connery Toolkit.
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    connery_toolkit.get_tools(), llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
result = agent.run(
    f"""Make a short summary of the webpage http://www.paulgraham.com/vb.html in three sentences
and send it to {recepient_email}. Include the link to the webpage into the body of the email."""
)
print(result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CA72DFB0AB4DF6C830B43E14B0782F70` with `{'publicWebpageUrl': 'http://www.paulgraham.com/vb.html'}`


[0m[33;1m[1;3m{'summary': 'The author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.'}[0m[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Summary of the webpage', 'body': 'Here is a short summary of the webpage http://www.paulgraham.com/vb.html:\n\nThe author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.\n\nYou can find the full webpage [here](http://www.paulgraham.com/vb.html).'}`


[0m[33;1m[1;3m{'messageId': '<2f04b00e-122d-c7de-c91e-e78e0c3276d6@gmail.com>'}[0m[32;1m[1;3mI have sent the email with the summary of the webpage to test@example.com. Please check your inbox.[0m

[1m> Finished chain.[0m
I have sent the email with the summary of the webpage to test@example.com. Please check your inbox.
```

注意: Connery Actionは構造化ツールなので、構造化ツールをサポートするエージェントでのみ使用できます。
