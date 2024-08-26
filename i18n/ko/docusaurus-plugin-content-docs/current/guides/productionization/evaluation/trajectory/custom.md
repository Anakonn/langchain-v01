---
translated: true
---

# 커스텀 트래젝토리 평가기

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/trajectory/custom.ipynb)

[AgentTrajectoryEvaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.AgentTrajectoryEvaluator.html#langchain.evaluation.schema.AgentTrajectoryEvaluator) 클래스를 상속하고 `_evaluate_agent_trajectory` (및 `_aevaluate_agent_action`) 메서드를 재정의하여 자신만의 커스텀 트래젝토리 평가기를 만들 수 있습니다.

이 예제에서는 LLM을 사용하여 불필요한 작업이 있었는지 여부를 판단하는 간단한 트래젝토리 평가기를 만듭니다.

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
from typing import Any, Optional, Sequence, Tuple

from langchain.chains import LLMChain
from langchain.evaluation import AgentTrajectoryEvaluator
from langchain_core.agents import AgentAction
from langchain_openai import ChatOpenAI


class StepNecessityEvaluator(AgentTrajectoryEvaluator):
    """예측된 문자열의 퍼플렉서티를 평가합니다."""

    def __init__(self) -> None:
        llm = ChatOpenAI(model="gpt-4", temperature=0.0)
        template = """Are any of the following steps unnecessary in answering {input}? Provide the verdict on a new line as a single "Y" for yes or "N" for no.

        DATA
        ------
        Steps: {trajectory}
        ------

        Verdict:"""
        self.chain = LLMChain.from_string(llm, template)

    def _evaluate_agent_trajectory(
        self,
        *,
        prediction: str,
        input: str,
        agent_trajectory: Sequence[Tuple[AgentAction, str]],
        reference: Optional[str] = None,
        **kwargs: Any,
    ) -> dict:
        vals = [
            f"{i}: Action=[{action.tool}] returned observation = [{observation}]"
            for i, (action, observation) in enumerate(agent_trajectory)
        ]
        trajectory = "\n".join(vals)
        response = self.chain.run(dict(trajectory=trajectory, input=input), **kwargs)
        decision = response.split("\n")[-1].strip()
        score = 1 if decision == "Y" else 0
        return {"score": score, "value": decision, "reasoning": response}
```

위의 예제는 언어 모델이 어떤 작업이 불필요하다고 예측하면 1의 점수를 반환하고, 모든 작업이 필요하다고 예측하면 0의 점수를 반환합니다. 'decision' 문자열을 'value'로 반환하고, 생성된 나머지 텍스트를 'reasoning'으로 포함하여 결정을 감사할 수 있도록 합니다.

이 평가기를 호출하여 에이전트의 트래젝토리 중간 단계를 채점할 수 있습니다.

```python
evaluator = StepNecessityEvaluator()

evaluator.evaluate_agent_trajectory(
    prediction="The answer is pi",
    input="What is today?",
    agent_trajectory=[
        (
            AgentAction(tool="ask", tool_input="What is today?", log=""),
            "tomorrow's yesterday",
        ),
        (
            AgentAction(tool="check_tv", tool_input="Watch tv for half hour", log=""),
            "bzzz",
        ),
    ],
)
```

```output
{'score': 1, 'value': 'Y', 'reasoning': 'Y'}
```