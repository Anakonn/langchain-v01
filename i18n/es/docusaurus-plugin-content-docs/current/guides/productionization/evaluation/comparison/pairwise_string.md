---
sidebar_position: 0
title: Comparación de cadenas de caracteres por pares
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_string.ipynb)

A menudo querrás comparar las predicciones de un LLM, una Cadena o un Agente para una entrada dada. Los evaluadores `StringComparison` facilitan esto para que puedas responder preguntas como:

- ¿Qué LLM o prompt produce una salida preferida para una pregunta dada?
- ¿Qué ejemplos debo incluir para la selección de ejemplos de pocos disparos?
- ¿Qué salida es mejor incluir para el ajuste fino?

La forma más simple y a menudo más confiable de elegir una predicción preferida para una entrada dada es usar el evaluador `pairwise_string`.

Consulta la documentación de referencia para [PairwiseStringEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain) para obtener más información.

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

## Métodos

El evaluador de cadenas de caracteres por pares se puede llamar usando [evaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.evaluate_string_pairs) (o el método asíncrono [aevaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.aevaluate_string_pairs)), que aceptan:

- prediction (str) – La respuesta predicha del primer modelo, cadena o prompt.
- prediction_b (str) – La respuesta predicha del segundo modelo, cadena o prompt.
- input (str) – La pregunta de entrada, el prompt u otro texto.
- reference (str) – (Solo para la variante `labeled_pairwise_string`) La respuesta de referencia.

Devuelven un diccionario con los siguientes valores:

- value: 'A' o 'B', indicando si se prefiere `prediction` o `prediction_b`, respectivamente
- score: Entero 0 o 1 asignado a partir de 'value', donde una puntuación de 1 significaría que se prefiere la primera `prediction`, y una puntuación de 0 significaría que se prefiere `prediction_b`.
- reasoning: Cadena de "razonamiento de pensamiento en cadena" generada por el LLM antes de crear la puntuación

## Sin referencias

Cuando no hay referencias disponibles, aún puedes predecir la respuesta preferida.
Los resultados reflejarán la preferencia del modelo de evaluación, que es menos confiable y puede dar lugar a preferencias que son fácticamente incorrectas.

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

## Definir los criterios

De forma predeterminada, se instruye al LLM para que seleccione la respuesta "preferida" en función de la utilidad, la relevancia, la corrección y la profundidad del pensamiento. Puedes personalizar los criterios pasando un argumento `criteria`, donde los criterios podrían tomar cualquiera de las siguientes formas:

- Enum [`Criteria`](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.Criteria.html#langchain.evaluation.criteria.eval_chain.Criteria) o su valor de cadena - para usar uno de los criterios predeterminados y sus descripciones
- [Principio constitucional](https://api.python.langchain.com/en/latest/chains/langchain.chains.constitutional_ai.models.ConstitutionalPrinciple.html#langchain.chains.constitutional_ai.models.ConstitutionalPrinciple) - usar cualquiera de los principios constitucionales definidos en langchain
- Diccionario: una lista de criterios personalizados, donde la clave es el nombre del criterio y el valor es la descripción.
- Una lista de criterios o principios constitucionales - para combinar varios criterios en uno.

A continuación se muestra un ejemplo para determinar las respuestas de escritura preferidas en función de un estilo personalizado.

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

## Personalizar el LLM

De forma predeterminada, el cargador usa `gpt-4` en la cadena de evaluación. Puedes personalizarlo al cargar.

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

## Personalizar el prompt de evaluación

Puedes usar tu propio prompt de evaluación personalizado para agregar instrucciones más específicas de la tarea o para indicar al evaluador que puntúe la salida.

*Nota: Si usas un prompt que espera generar un resultado en un formato único, también es posible que tengas que pasar un analizador de salida personalizado (`output_parser=your_parser()`) en lugar del `PairwiseStringResultOutputParser` predeterminado.

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
