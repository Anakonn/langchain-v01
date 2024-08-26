---
translated: true
---

# Évaluateur de trajectoire personnalisé

[![Ouvrir dans Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/trajectory/custom.ipynb)

Vous pouvez créer vos propres évaluateurs de trajectoire personnalisés en héritant de la classe [AgentTrajectoryEvaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.AgentTrajectoryEvaluator.html#langchain.evaluation.schema.AgentTrajectoryEvaluator) et en remplaçant la méthode `_evaluate_agent_trajectory` (et `_aevaluate_agent_action`).

Dans cet exemple, vous allez créer un évaluateur de trajectoire simple qui utilise un LLM pour déterminer si des actions étaient inutiles.

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

L'exemple ci-dessus renverra un score de 1 si le modèle de langage prédit que l'une des actions était inutile, et un score de 0 si elles étaient toutes jugées nécessaires. Il renvoie la chaîne 'decision' comme 'value', et inclut le reste du texte généré comme 'reasoning' pour vous permettre d'auditer la décision.

Vous pouvez appeler cet évaluateur pour noter les étapes intermédiaires de la trajectoire de votre agent.

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
