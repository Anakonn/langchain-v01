---
translated: true
---

# कस्टम ट्राजेक्टरी इवैल्यूएटर

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/trajectory/custom.ipynb)

आप [AgentTrajectoryEvaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.AgentTrajectoryEvaluator.html#langchain.evaluation.schema.AgentTrajectoryEvaluator) क्लास से इनहेरिट करके और `_evaluate_agent_trajectory` (और `_aevaluate_agent_action`) मेथड को ओवरराइट करके अपने खुद के कस्टम ट्राजेक्टरी इवैल्यूएटर बना सकते हैं।

इस उदाहरण में, आप एक साधारण ट्राजेक्टरी इवैल्यूएटर बनाएंगे जो यह निर्धारित करने के लिए एक LLM का उपयोग करता है कि क्या कोई क्रियाएं अनावश्यक थीं।

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

उपरोक्त उदाहरण 1 का स्कोर लौटाएगा यदि भाषा मॉडल भविष्यवाणी करता है कि कोई भी क्रियाएं अनावश्यक थीं, और यह 0 का स्कोर लौटाता है यदि सभी को आवश्यक भविष्यवाणी की गई थी। यह 'decision' को 'value' के रूप में लौटाता है, और निर्णय का ऑडिट करने के लिए 'reasoning' के रूप में उत्पन्न पाठ के बाकी हिस्से को शामिल करता है।

आप अपने एजेंट की ट्राजेक्टरी के मध्यवर्ती चरणों को ग्रेड करने के लिए इस इवैल्यूएटर को कॉल कर सकते हैं।

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
