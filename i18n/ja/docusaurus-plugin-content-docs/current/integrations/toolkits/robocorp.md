---
translated: true
---

# Robocorp

このノートブックでは、[Robocorp Action Server](https://github.com/robocorp/robocorp)アクションツールキットとLangChainの使い始め方について説明します。

Robocorpは、カスタムアクションを使ってAIエージェント、アシスタント、コパイロットの機能を簡単に拡張できる方法です。

## インストール

まず、[Robocorp クイックスタート](https://github.com/robocorp/robocorp#quickstart)を参照して、`Action Server`のセットアップと自分のアクションの作成方法を確認してください。

LangChainアプリケーションでは、`langchain-robocorp`パッケージをインストールします:

```python
# Install package
%pip install --upgrade --quiet langchain-robocorp
```

上記のクイックスタートに従って新しい`Action Server`を作成すると、

ディレクトリにファイルが作成されます。その中に`action.py`があります。

ここに[こちら](https://github.com/robocorp/robocorp/tree/master/actions#describe-your-action)のように、Pythonの関数をアクションとして追加できます。

`action.py`にダミーの関数を追加しましょう。

```python
@action
def get_weather_forecast(city: str, days: int, scale: str = "celsius") -> str:
    """
    Returns weather conditions forecast for a given city.

    Args:
        city (str): Target city to get the weather conditions for
        days: How many day forecast to return
        scale (str): Temperature scale to use, should be one of "celsius" or "fahrenheit"

    Returns:
        str: The requested weather conditions forecast
    """
    return "75F and sunny :)"
```

次にサーバーを起動します:

```bash
action-server start
```

そして以下のように表示されます:

```text
Found new action: get_weather_forecast

```

ローカルで動作確認するには、`http://localhost:8080`にアクセスしてUIからその関数を実行してみてください。

## 環境設定

オプションで以下の環境変数を設定できます:

- `LANGCHAIN_TRACING_V2=true`: LangSmithのログ実行トレースを有効にし、それぞれのAction Serverアクション実行ログにバインドできます。詳細は[LangSmith ドキュメント](https://docs.smith.langchain.com/tracing#log-runs)を参照してください。

## 使用方法

上記のようにローカルのアクションサーバーを`http://localhost:8080`で起動しました。

```python
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain_robocorp import ActionServerToolkit

# Initialize LLM chat model
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Initialize Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080", report_trace=True)
tools = toolkit.get_tools()

# Initialize Agent
system_message = SystemMessage(content="You are a helpful assistant")
prompt = OpenAIFunctionsAgent.create_prompt(system_message)
agent = OpenAIFunctionsAgent(llm=llm, prompt=prompt, tools=tools)

executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

executor.invoke("What is the current weather today in San Francisco in fahrenheit?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `robocorp_action_server_get_weather_forecast` with `{'city': 'San Francisco', 'days': 1, 'scale': 'fahrenheit'}`


[0m[33;1m[1;3m"75F and sunny :)"[0m[32;1m[1;3mThe current weather today in San Francisco is 75F and sunny.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What is the current weather today in San Francisco in fahrenheit?',
 'output': 'The current weather today in San Francisco is 75F and sunny.'}
```

### シングルインプットツール

デフォルトでは`toolkit.get_tools()`は、構造化ツールとしてアクションを返します。

シングルインプットツールを返すには、入力を処理するためのChatモデルを渡します。

```python
# Initialize single input Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080")
tools = toolkit.get_tools(llm=llm)
```
