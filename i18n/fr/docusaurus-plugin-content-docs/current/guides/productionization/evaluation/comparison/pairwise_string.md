---
sidebar_position: 0
title: Comparaison par paires de chaînes de caractères
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_string.ipynb)

Souvent, vous voudrez comparer les prédictions d'un LLM, d'une chaîne ou d'un agent pour une entrée donnée. Les évaluateurs `StringComparison` facilitent cela afin que vous puissiez répondre à des questions telles que :

- Quel LLM ou prompt produit une sortie préférée pour une question donnée ?
- Quels exemples devrais-je inclure pour la sélection d'exemples à quelques coups ?
- Quelle sortie est préférable d'inclure pour le fine-tuning ?

La manière la plus simple et souvent la plus fiable de choisir une prédiction préférée pour une entrée donnée est d'utiliser l'évaluateur `pairwise_string`.

Consultez la documentation de référence pour le [PairwiseStringEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain) pour plus d'informations.

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("labeled_pairwise_string")
```

```python
evaluator.evaluate_string_pairs(
    prediction="there are three dogs",
    prediction_b="4",
    input="how many dogs are in the park?",
    reference="four",
)
```

```output
{'reasoning': 'Both responses are relevant to the question asked, as they both provide a numerical answer to the question about the number of dogs in the park. However, Response A is incorrect according to the reference answer, which states that there are four dogs. Response B, on the other hand, is correct as it matches the reference answer. Neither response demonstrates depth of thought, as they both simply provide a numerical answer without any additional information or context. \n\nBased on these criteria, Response B is the better response.\n',
 'value': 'B',
 'score': 0}
```

## Méthodes

L'évaluateur de chaînes de caractères par paires peut être appelé en utilisant [evaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.evaluate_string_pairs) (ou les méthodes async [aevaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.aevaluate_string_pairs)), qui acceptent :

- prediction (str) – La réponse prédite du premier modèle, chaîne ou prompt.
- prediction_b (str) – La réponse prédite du deuxième modèle, chaîne ou prompt.
- input (str) – La question d'entrée, le prompt ou un autre texte.
- reference (str) – (Uniquement pour la variante labeled_pairwise_string) La réponse de référence.

Ils renvoient un dictionnaire avec les valeurs suivantes :

- value: 'A' ou 'B', indiquant si `prediction` ou `prediction_b` est préféré, respectivement
- score: Entier 0 ou 1 mappé à partir de la 'value', où un score de 1 signifierait que la première `prediction` est préférée, et un score de 0 signifierait que `prediction_b` est préférée.
- reasoning: Chaîne de "raisonnement en chaîne de pensée" générée par le LLM avant de créer le score

## Sans Références

Lorsque les références ne sont pas disponibles, vous pouvez toujours prédire la réponse préférée.
Les résultats refléteront la préférence du modèle d'évaluation, ce qui est moins fiable et peut entraîner
des préférences qui sont factuellement incorrectes.

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("pairwise_string")
```

```python
evaluator.evaluate_string_pairs(
    prediction="Addition is a mathematical operation.",
    prediction_b="Addition is a mathematical operation that adds two numbers to create a third number, the 'sum'.",
    input="What is addition?",
)
```

```output
{'reasoning': 'Both responses are correct and relevant to the question. However, Response B is more helpful and insightful as it provides a more detailed explanation of what addition is. Response A is correct but lacks depth as it does not explain what the operation of addition entails. \n\nFinal Decision: [[B]]',
 'value': 'B',
 'score': 0}
```

## Définir les Critères

Par défaut, le LLM est chargé de sélectionner la réponse 'préférée' en se basant sur l'utilité, la pertinence, l'exactitude et la profondeur de la pensée. Vous pouvez personnaliser les critères en passant un argument `criteria`, où les critères peuvent prendre l'une des formes suivantes :

- [`Criteria`](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.Criteria.html#langchain.evaluation.criteria.eval_chain.Criteria) enum ou sa valeur en chaîne - pour utiliser l'un des critères par défaut et leurs descriptions
- [Constitutional principal](https://api.python.langchain.com/en/latest/chains/langchain.chains.constitutional_ai.models.ConstitutionalPrinciple.html#langchain.chains.constitutional_ai.models.ConstitutionalPrinciple) - utiliser l'un des principes constitutionnels définis dans langchain
- Dictionnaire : une liste de critères personnalisés, où la clé est le nom du critère et la valeur est la description.
- Une liste de critères ou de principes constitutionnels - pour combiner plusieurs critères en un.

Ci-dessous un exemple pour déterminer les réponses écrites préférées en se basant sur un style personnalisé.

```python
custom_criteria = {
    "simplicity": "Is the language straightforward and unpretentious?",
    "clarity": "Are the sentences clear and easy to understand?",
    "precision": "Is the writing precise, with no unnecessary words or details?",
    "truthfulness": "Does the writing feel honest and sincere?",
    "subtext": "Does the writing suggest deeper meanings or themes?",
}
evaluator = load_evaluator("pairwise_string", criteria=custom_criteria)
```

```python
evaluator.evaluate_string_pairs(
    prediction="Every cheerful household shares a similar rhythm of joy; but sorrow, in each household, plays a unique, haunting melody.",
    prediction_b="Where one finds a symphony of joy, every domicile of happiness resounds in harmonious,"
    " identical notes; yet, every abode of despair conducts a dissonant orchestra, each"
    " playing an elegy of grief that is peculiar and profound to its own existence.",
    input="Write some prose about families.",
)
```

```output
{'reasoning': 'Response A is simple, clear, and precise. It uses straightforward language to convey a deep and sincere message about families. The metaphor of joy and sorrow as music is effective and easy to understand.\n\nResponse B, on the other hand, is more complex and less clear. The language is more pretentious, with words like "domicile," "resounds," "abode," "dissonant," and "elegy." While it conveys a similar message to Response A, it does so in a more convoluted way. The precision is also lacking due to the use of unnecessary words and details.\n\nBoth responses suggest deeper meanings or themes about the shared joy and unique sorrow in families. However, Response A does so in a more effective and accessible way.\n\nTherefore, the better response is [[A]].',
 'value': 'A',
 'score': 1}
```

## Personnaliser le LLM

Par défaut, le chargeur utilise `gpt-4` dans la chaîne d'évaluation. Vous pouvez personnaliser cela lors du chargement.

```python
from langchain_community.chat_models import ChatAnthropic

llm = ChatAnthropic(temperature=0)

evaluator = load_evaluator("labeled_pairwise_string", llm=llm)
```

```python
evaluator.evaluate_string_pairs(
    prediction="there are three dogs",
    prediction_b="4",
    input="how many dogs are in the park?",
    reference="four",
)
```

```output
{'reasoning': 'Here is my assessment:\n\nResponse B is more helpful, insightful, and accurate than Response A. Response B simply states "4", which directly answers the question by providing the exact number of dogs mentioned in the reference answer. In contrast, Response A states "there are three dogs", which is incorrect according to the reference answer. \n\nIn terms of helpfulness, Response B gives the precise number while Response A provides an inaccurate guess. For relevance, both refer to dogs in the park from the question. However, Response B is more correct and factual based on the reference answer. Response A shows some attempt at reasoning but is ultimately incorrect. Response B requires less depth of thought to simply state the factual number.\n\nIn summary, Response B is superior in terms of helpfulness, relevance, correctness, and depth. My final decision is: [[B]]\n',
 'value': 'B',
 'score': 0}
```

## Personnaliser le Prompt d'Évaluation

Vous pouvez utiliser votre propre prompt d'évaluation personnalisé pour ajouter des instructions plus spécifiques à la tâche ou pour instruire l'évaluateur à noter la sortie.

*Note : Si vous utilisez un prompt qui génère un résultat dans un format unique, vous devrez peut-être également passer un analyseur de sortie personnalisé (`output_parser=your_parser()`) au lieu du `PairwiseStringResultOutputParser` par défaut.

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    """Given the input context, which do you prefer: A or B?
Evaluate based on the following criteria:
{criteria}
Reason step by step and finally, respond with either [[A]] or [[B]] on its own line.

DATA
----
input: {input}
reference: {reference}
A: {prediction}
B: {prediction_b}
---
Reasoning:

"""
)
evaluator = load_evaluator("labeled_pairwise_string", prompt=prompt_template)
```

```python
# The prompt was assigned to the evaluator
print(evaluator.prompt)
```

```output
input_variables=['prediction', 'reference', 'prediction_b', 'input'] output_parser=None partial_variables={'criteria': 'helpfulness: Is the submission helpful, insightful, and appropriate?\nrelevance: Is the submission referring to a real quote from the text?\ncorrectness: Is the submission correct, accurate, and factual?\ndepth: Does the submission demonstrate depth of thought?'} template='Given the input context, which do you prefer: A or B?\nEvaluate based on the following criteria:\n{criteria}\nReason step by step and finally, respond with either [[A]] or [[B]] on its own line.\n\nDATA\n----\ninput: {input}\nreference: {reference}\nA: {prediction}\nB: {prediction_b}\n---\nReasoning:\n\n' template_format='f-string' validate_template=True
```

```python
evaluator.evaluate_string_pairs(
    prediction="The dog that ate the ice cream was named fido.",
    prediction_b="The dog's name is spot",
    input="What is the name of the dog that ate the ice cream?",
    reference="The dog's name is fido",
)
```

```output
{'reasoning': 'Helpfulness: Both A and B are helpful as they provide a direct answer to the question.\nRelevance: A is relevant as it refers to the correct name of the dog from the text. B is not relevant as it provides a different name.\nCorrectness: A is correct as it accurately states the name of the dog. B is incorrect as it provides a different name.\nDepth: Both A and B demonstrate a similar level of depth as they both provide a straightforward answer to the question.\n\nGiven these evaluations, the preferred response is:\n',
 'value': 'A',
 'score': 1}
```
