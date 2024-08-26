---
translated: true
---

# Trajectoire de l'agent

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/trajectory/trajectory_eval.ipynb)

Il peut être difficile d'évaluer de manière holistique les agents en raison de l'étendue des actions et de la génération qu'ils peuvent effectuer. Nous vous recommandons d'utiliser plusieurs techniques d'évaluation adaptées à votre cas d'utilisation. Une façon d'évaluer un agent est d'examiner l'ensemble de la trajectoire des actions entreprises ainsi que leurs réponses.

Les évaluateurs qui font cela peuvent mettre en œuvre l'interface `AgentTrajectoryEvaluator`. Ce tutoriel montrera comment utiliser l'évaluateur `trajectory` pour noter un agent de fonctions OpenAI.

Pour plus d'informations, consultez la documentation de référence pour [TrajectoryEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain) pour plus d'informations.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("trajectory")
```

## Méthodes

Les évaluateurs de trajectoire d'agent sont utilisés avec les méthodes [evaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.evaluate_agent_trajectory) (et [aevaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.aevaluate_agent_trajectory)) asynchrone), qui acceptent :

- input (str) - L'entrée de l'agent.
- prediction (str) - La réponse finale prédite.
- agent_trajectory (List[Tuple[AgentAction, str]]) - Les étapes intermédiaires formant la trajectoire de l'agent

Ils renvoient un dictionnaire avec les valeurs suivantes :
- score : Flottant de 0 à 1, où 1 signifierait "le plus efficace" et 0 "le moins efficace"
- reasoning : Chaîne de caractères "raisonnement de la chaîne de pensée" générée par le LLM avant de créer le score

## Capture de la trajectoire

Le moyen le plus simple de renvoyer la trajectoire d'un agent (sans utiliser de rappels de traçage comme ceux de LangSmith) pour l'évaluation est d'initialiser l'agent avec `return_intermediate_steps=True`.

Ci-dessous, créez un agent d'exemple que nous appellerons pour évaluer.

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

## Évaluer la trajectoire

Transmettez l'entrée, la trajectoire et passez à la méthode [evaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.AgentTrajectoryEvaluator.html#langchain.evaluation.schema.AgentTrajectoryEvaluator.evaluate_agent_trajectory).

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

## Configuration du LLM d'évaluation

Si vous ne sélectionnez pas de LLM à utiliser pour l'évaluation, la fonction [load_evaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.loading.load_evaluator.html#langchain.evaluation.loading.load_evaluator) utilisera `gpt-4` pour alimenter la chaîne d'évaluation. Vous pouvez sélectionner n'importe quel modèle de discussion pour l'évaluateur de trajectoire d'agent comme ci-dessous.

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

## Fournir une liste d'outils valides

Par défaut, l'évaluateur ne tient pas compte des outils que l'agent est autorisé à appeler. Vous pouvez les fournir à l'évaluateur via l'argument `agent_tools`.

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
