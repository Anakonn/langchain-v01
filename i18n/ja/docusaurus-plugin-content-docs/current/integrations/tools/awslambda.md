---
translated: true
---

# AWS Lambda

>[`Amazon AWS Lambda`](https://aws.amazon.com/pm/lambda/) は、`Amazon Web Services`(`AWS`)が提供するサーバーレスコンピューティングサービスです。開発者がサーバーのプロビジョニングや管理を行うことなく、アプリケーションやサービスを構築およびランさせることができます。このサーバーレスアーキテクチャにより、コードの記述とデプロイに集中でき、AWS が自動的にスケーリング、パッチ適用、インフラストラクチャの管理を行います。

このノートブックでは、`AWS Lambda` ツールの使用方法について説明します。

`AWS Lambda` をエージェントに提供されるツールリストに含めることで、エージェントにAWSクラウド上で実行されるコードを呼び出す機能を付与できます。

エージェントが `AWS Lambda` ツールを使用する際、文字列型の引数を提供し、それがLambda関数のイベントパラメータとして渡されます。

まず、`boto3` Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  boto3 > /dev/null
```

エージェントがツールを使用するには、ラムダ関数のロジック機能に合わせた名前と説明を提供する必要があります。

また、関数名も提供する必要があります。

このツールは実質的に `boto3` ライブラリのラッパーであるため、ツールを使用するには `aws configure` を実行する必要があります。詳細については[こちら](https://docs.aws.amazon.com/cli/index.html)を参照してください。

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)

tools = load_tools(
    ["awslambda"],
    awslambda_tool_name="email-sender",
    awslambda_tool_description="sends an email with the specified content to test@testing123.com",
    function_name="testFunction1",
)

agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("Send an email to test@testing123.com saying hello world.")
```
