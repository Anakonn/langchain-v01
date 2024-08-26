---
translated: true
---

# MultiOn

[MultiON](https://www.multion.ai/blog/multion-building-a-brighter-future-for-humanity-with-ai-agents)は、幅広いウェブサービスやアプリケーションと対話できるAIエージェントを構築しています。

このノートブックでは、LangChainを使って`MultiOn`クライアントをブラウザに接続する方法を説明します。

これにより、MultiONエージェントの力を活用したカスタムエージェントワークフローを作成できます。

このツールキットを使うには、ブラウザに`MultiOn Extension`を追加する必要があります:

* [MultiOnアカウント](https://app.multion.ai/login?callbackUrl=%2Fprofile)を作成します。
* [ChromeのMultiOn拡張機能](https://multion.notion.site/Download-MultiOn-ddddcfe719f94ab182107ca2612c07a5)を追加します。

```python
%pip install --upgrade --quiet  multion langchain -q
```

```python
from langchain_community.agent_toolkits import MultionToolkit

toolkit = MultionToolkit()
toolkit
```

```output
MultionToolkit()
```

```python
tools = toolkit.get_tools()
tools
```

```output
[MultionCreateSession(), MultionUpdateSession(), MultionCloseSession()]
```

## MultiOn セットアップ

アカウントを作成したら、https://app.multion.ai/ でAPIキーを作成します。

拡張機能との接続を確立するためにログインします。

```python
# Authorize connection to your Browser extention
import multion

multion.login()
```

```output
Logged in.
```

## エージェント内でMultionツールキットを使う

これにより、MultiONのChromeの拡張機能を使って所望のアクションを実行します。

以下を実行すると、[トレース](https://smith.langchain.com/public/34aaf36d-204a-4ce3-a54e-4a0976f09670/r)を見ることができます:

* エージェントは`create_multion_session`ツールを使用します
* その後、MultiONを使ってクエリを実行します

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
```

```python
# Prompt
instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
```

```python
# LLM
llm = ChatOpenAI(temperature=0)
```

```python
# Agent
agent = create_openai_functions_agent(llm, toolkit.get_tools(), prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    verbose=False,
)
```

```python
agent_executor.invoke(
    {
        "input": "Use multion to explain how AlphaCodium works, a recently released code language model."
    }
)
```

```output
WARNING: 'new_session' is deprecated and will be removed in a future version. Use 'create_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
```

```output
{'input': 'Use multion to how AlphaCodium works, a recently released code language model.',
 'output': 'AlphaCodium is a recently released code language model that is designed to assist developers in writing code more efficiently. It is based on advanced machine learning techniques and natural language processing. AlphaCodium can understand and generate code in multiple programming languages, making it a versatile tool for developers.\n\nThe model is trained on a large dataset of code snippets and programming examples, allowing it to learn patterns and best practices in coding. It can provide suggestions and auto-complete code based on the context and the desired outcome.\n\nAlphaCodium also has the ability to analyze code and identify potential errors or bugs. It can offer recommendations for improving code quality and performance.\n\nOverall, AlphaCodium aims to enhance the coding experience by providing intelligent assistance and reducing the time and effort required to write high-quality code.\n\nFor more detailed information, you can visit the official AlphaCodium website or refer to the documentation and resources available online.\n\nI hope this helps! Let me know if you have any other questions.'}
```
