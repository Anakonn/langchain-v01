---
translated: true
---

# MLX

このノートブックでは、`MLX` LLMをチャットモデルとして使い始める方法を示します。

特に、以下のことを行います:
1. [MLXPipeline](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/mlx_pipelines.py)の利用
2. `ChatMLX`クラスを利用して、これらのLLMのいずれかをLangChainの[Chat Messages](https://python.langchain.com/docs/modules/model_io/chat/#messages)抽象化とインターフェースさせる
3. オープンソースのLLMを使ってChatAgentパイプラインを動作させる方法の実演

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

## 1. LLMのインスタンス化

選択できるLLMは3つあります。

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

llm = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

## 2. `ChatMLX`のインスタンス化でチャットテンプレートを適用する

チャットモデルとメッセージのインスタンスを作成します。

```python
from langchain.schema import (
    HumanMessage,
)
from langchain_community.chat_models.mlx import ChatMLX

messages = [
    HumanMessage(
        content="What happens when an unstoppable force meets an immovable object?"
    ),
]

chat_model = ChatMLX(llm=llm)
```

LLMの呼び出しに合わせてチャットメッセージがどのようにフォーマットされているかを確認します。

```python
chat_model._to_chat_prompt(messages)
```

モデルを呼び出します。

```python
res = chat_model.invoke(messages)
print(res.content)
```

## 3. エージェントとして試してみる!

ここでは、`gemma-2b-it`をゼロショットの`ReAct`エージェントとしてテストします。以下の例は[ここ](https://python.langchain.com/docs/modules/agents/agent_types/react#using-chat-models)から引用したものです。

> 注意: このセクションを実行するには、[SerpAPI Token](https://serpapi.com/)を環境変数`SERPAPI_API_KEY`として保存しておく必要があります。

```python
from langchain import hub
from langchain.agents import AgentExecutor, load_tools
from langchain.agents.format_scratchpad import format_log_to_str
from langchain.agents.output_parsers import (
    ReActJsonSingleInputOutputParser,
)
from langchain.tools.render import render_text_description
from langchain_community.utilities import SerpAPIWrapper
```

`react-json`スタイルのプロンプトと検索エンジンと電卓へのアクセスを備えたエージェントを設定します。

```python
# setup tools
tools = load_tools(["serpapi", "llm-math"], llm=llm)

# setup ReAct style prompt
prompt = hub.pull("hwchase17/react-json")
prompt = prompt.partial(
    tools=render_text_description(tools),
    tool_names=", ".join([t.name for t in tools]),
)

# define the agent
chat_model_with_stop = chat_model.bind(stop=["\nObservation"])
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_log_to_str(x["intermediate_steps"]),
    }
    | prompt
    | chat_model_with_stop
    | ReActJsonSingleInputOutputParser()
)

# instantiate AgentExecutor
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke(
    {
        "input": "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
    }
)
```
