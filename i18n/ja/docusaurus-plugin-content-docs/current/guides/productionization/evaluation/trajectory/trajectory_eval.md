---
translated: true
---

# エージェントの軌跡

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/trajectory/trajectory_eval.ipynb)

エージェントの包括的な評価は、その行動と生成の幅広さのため困難な場合があります。使用例に適した複数の評価手法を使用することをお勧めします。エージェントを評価する1つの方法は、取られた行動の全体的な軌跡とその応答を見ることです。

このようなことを行う評価者は、`AgentTrajectoryEvaluator`インターフェイスを実装できます。このチュートリアルでは、`trajectory`評価器を使用してOpenAI関数エージェントを評価する方法を示します。

詳細については、[TrajectoryEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain)のリファレンスドキュメントをご覧ください。

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("trajectory")
```

## メソッド

エージェントの軌跡評価者は、[evaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.evaluate_agent_trajectory)（および非同期の[aevaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.aevaluate_agent_trajectory))）メソッドと共に使用されます。これらのメソッドは以下を受け入れます:

- input (str) – エージェントへの入力。
- prediction (str) – 最終的な予測された応答。
- agent_trajectory (List[Tuple[AgentAction, str]]) – エージェントの軌跡を形成する中間ステップ

これらのメソッドは以下の値を含む辞書を返します:
- score: 0から1までの浮動小数点数。1は"最も効果的"、0は"最も効果的でない"を意味します。
- reasoning: LLMによって生成された、スコアを作成する前の"思考過程"を示す文字列

## 軌跡の取得

(LangSmithのようなトレースコールバックを使用せずに)エージェントの軌跡を返すための最も簡単な方法は、`return_intermediate_steps=True`でエージェントを初期化することです。

以下では、評価するためのサンプルエージェントを作成します。

```python
import subprocess
from urllib.parse import urlparse

from langchain.agents import AgentType, initialize_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import HttpUrl


@tool
def ping(url: HttpUrl, return_error: bool) -> str:
    """Ping the fully specified url. Must include https:// in the url."""
    hostname = urlparse(str(url)).netloc
    completed_process = subprocess.run(
        ["ping", "-c", "1", hostname], capture_output=True, text=True
    )
    output = completed_process.stdout
    if return_error and completed_process.returncode != 0:
        return completed_process.stderr
    return output


@tool
def trace_route(url: HttpUrl, return_error: bool) -> str:
    """Trace the route to the specified url. Must include https:// in the url."""
    hostname = urlparse(str(url)).netloc
    completed_process = subprocess.run(
        ["traceroute", hostname], capture_output=True, text=True
    )
    output = completed_process.stdout
    if return_error and completed_process.returncode != 0:
        return completed_process.stderr
    return output


llm = ChatOpenAI(model="gpt-3.5-turbo-0613", temperature=0)
agent = initialize_agent(
    llm=llm,
    tools=[ping, trace_route],
    agent=AgentType.OPENAI_MULTI_FUNCTIONS,
    return_intermediate_steps=True,  # IMPORTANT!
)

result = agent("What's the latency like for https://langchain.com?")
```

## 軌跡の評価

入力、軌跡を渡し、[evaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.AgentTrajectoryEvaluator.html#langchain.evaluation.schema.AgentTrajectoryEvaluator.evaluate_agent_trajectory)メソッドを呼び出します。

```python
evaluation_result = evaluator.evaluate_agent_trajectory(
    prediction=result["output"],
    input=result["input"],
    agent_trajectory=result["intermediate_steps"],
)
evaluation_result
```

```output
{'score': 1.0,
 'reasoning': "i. The final answer is helpful. It directly answers the user's question about the latency for the website https://langchain.com.\n\nii. The AI language model uses a logical sequence of tools to answer the question. It uses the 'ping' tool to measure the latency of the website, which is the correct tool for this task.\n\niii. The AI language model uses the tool in a helpful way. It inputs the URL into the 'ping' tool and correctly interprets the output to provide the latency in milliseconds.\n\niv. The AI language model does not use too many steps to answer the question. It only uses one step, which is appropriate for this type of question.\n\nv. The appropriate tool is used to answer the question. The 'ping' tool is the correct tool to measure website latency.\n\nGiven these considerations, the AI language model's performance is excellent. It uses the correct tool, interprets the output correctly, and provides a helpful and direct answer to the user's question."}
```

## 評価LLMの設定

評価に使用するLLMを選択しない場合、[load_evaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.loading.load_evaluator.html#langchain.evaluation.loading.load_evaluator)関数は`gpt-4`を使用して評価チェーンをパワーアップします。以下のように、エージェントの軌跡評価器に任意のチャットモデルを選択できます。

```python
%pip install --upgrade --quiet  anthropic
# ANTHROPIC_API_KEY=<YOUR ANTHROPIC API KEY>
```

```python
from langchain_community.chat_models import ChatAnthropic

eval_llm = ChatAnthropic(temperature=0)
evaluator = load_evaluator("trajectory", llm=eval_llm)
```

```python
evaluation_result = evaluator.evaluate_agent_trajectory(
    prediction=result["output"],
    input=result["input"],
    agent_trajectory=result["intermediate_steps"],
)
evaluation_result
```

```output
{'score': 1.0,
 'reasoning': "Here is my detailed evaluation of the AI's response:\n\ni. The final answer is helpful, as it directly provides the latency measurement for the requested website.\n\nii. The sequence of using the ping tool to measure latency is logical for this question.\n\niii. The ping tool is used in a helpful way, with the website URL provided as input and the output latency measurement extracted.\n\niv. Only one step is used, which is appropriate for simply measuring latency. More steps are not needed.\n\nv. The ping tool is an appropriate choice to measure latency. \n\nIn summary, the AI uses an optimal single step approach with the right tool and extracts the needed output. The final answer directly answers the question in a helpful way.\n\nOverall"}
```

## 有効なツールのリストの提供

デフォルトでは、評価器はエージェントが呼び出すことができるツールを考慮しません。`agent_tools`引数を使用してこれらを評価器に提供できます。

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("trajectory", agent_tools=[ping, trace_route])
```

```python
evaluation_result = evaluator.evaluate_agent_trajectory(
    prediction=result["output"],
    input=result["input"],
    agent_trajectory=result["intermediate_steps"],
)
evaluation_result
```

```output
{'score': 1.0,
 'reasoning': "i. The final answer is helpful. It directly answers the user's question about the latency for the specified website.\n\nii. The AI language model uses a logical sequence of tools to answer the question. In this case, only one tool was needed to answer the question, and the model chose the correct one.\n\niii. The AI language model uses the tool in a helpful way. The 'ping' tool was used to determine the latency of the website, which was the information the user was seeking.\n\niv. The AI language model does not use too many steps to answer the question. Only one step was needed and used.\n\nv. The appropriate tool was used to answer the question. The 'ping' tool is designed to measure latency, which was the information the user was seeking.\n\nGiven these considerations, the AI language model's performance in answering this question is excellent."}
```
