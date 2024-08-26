---
translated: true
---

# 에이전트 트래젝토리

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/trajectory/trajectory_eval.ipynb)

에이전트는 다양한 액션과 생성물을 만들 수 있기 때문에 전체적으로 평가하기 어려울 수 있습니다. 사용 사례에 적합한 여러 평가 기술을 사용하는 것이 좋습니다. 에이전트를 평가하는 한 가지 방법은 에이전트가 수행한 전체 액션 시퀀스와 그에 따른 응답을 함께 보는 것입니다.

이를 수행하는 평가기는 `AgentTrajectoryEvaluator` 인터페이스를 구현할 수 있습니다. 이 워크스루에서는 OpenAI 함수 에이전트를 평가하기 위해 `trajectory` 평가기를 사용하는 방법을 보여줍니다.

자세한 내용은 [TrajectoryEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain) 참조 문서를 확인하세요.

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("trajectory")
```

## 메서드

에이전트 트래젝토리 평가기는 [evaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.evaluate_agent_trajectory) (및 비동기 [aevaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.aevaluate_agent_trajectory)) 메서드와 함께 사용됩니다. 이 메서드는 다음 매개변수를 수락합니다:

- input (str) – 에이전트에 제공된 입력입니다.
- prediction (str) – 최종 예측 응답입니다.
- agent_trajectory (List[Tuple[AgentAction, str]]) – 에이전트 트래젝토리를 형성하는 중간 단계들입니다.

이 메서드는 다음 값을 포함하는 사전을 반환합니다:

- score: 0에서 1 사이의 부동 소수점 값으로, 1은 "가장 효과적"이고 0은 "가장 비효과적"을 의미합니다.
- reasoning: 점수를 생성하기 전에 LLM이 생성한 "사고의 연쇄" 문자열

## 트래젝토리 캡처

에이전트의 트래젝토리를 평가하기 위해 가장 쉽게 반환하는 방법은 에이전트를 `return_intermediate_steps=True` 매개변수로 초기화하는 것입니다. 아래에서는 평가할 예제 에이전트를 생성합니다.

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
    return_intermediate_steps=True,  # 중요!
)

result = agent("What's the latency like for https://langchain.com?")
```

## 트래젝토리 평가

입력, 트래젝토리 및 결과를 [evaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.AgentTrajectoryEvaluator.html#langchain.evaluation.schema.AgentTrajectoryEvaluator.evaluate_agent_trajectory) 메서드에 전달합니다.

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

## 평가 LLM 구성

평가에 사용할 LLM을 선택하지 않으면 [load_evaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.loading.load_evaluator.html#langchain.evaluation.loading.load_evaluator) 함수는 평가 체인을 구동하기 위해 `gpt-4`를 사용합니다. 아래와 같이 에이전트 트래젝토리 평가기를 위해 모든 채팅 모델을 선택할 수 있습니다.

```python
%pip install --upgrade --quiet anthropic
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

## 유효한 도구 목록 제공

기본적으로 평가기는 에이전트가 호출할 수 있는 도구를 고려하지 않습니다. `agent_tools` 인수를 통해 평가기에 이러한 도구를 제공할 수 있습니다.

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