---
translated: true
---

# カスタムトラジェクトリ評価器

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/trajectory/custom.ipynb)

[AgentTrajectoryEvaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.AgentTrajectoryEvaluator.html#langchain.evaluation.schema.AgentTrajectoryEvaluator)クラスを継承し、`_evaluate_agent_trajectory`(および`_aevaluate_agent_action`)メソッドをオーバーライドすることで、独自のカスタムトラジェクトリ評価器を作成できます。

この例では、LLMを使用して、アクションが不必要であったかどうかを判断する簡単なトラジェクトリ評価器を作成します。

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from typing import Any, Optional, Sequence, Tuple

from langchain.chains import LLMChain
from langchain.evaluation import AgentTrajectoryEvaluator
from langchain_core.agents import AgentAction
from langchain_openai import ChatOpenAI


class StepNecessityEvaluator(AgentTrajectoryEvaluator):
    """Evaluate the perplexity of a predicted string."""

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

上記の例では、言語モデルがいずれかのアクションが不必要であると予測した場合は1点を返し、すべてが必要であると予測した場合は0点を返します。'decision'という文字列を'value'として返し、決定を監査できるよう、生成されたテキストの残りを'reasoning'として含めます。

この評価器を呼び出して、エージェントのトラジェクトリの中間ステップを評価することができます。

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
