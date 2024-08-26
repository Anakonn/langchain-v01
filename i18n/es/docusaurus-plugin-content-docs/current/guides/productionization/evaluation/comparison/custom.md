---
sidebar_position: 2
title: Evaluador de pares personalizado
translated: true
---

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/custom.ipynb)

Puedes crear tus propios evaluadores de pares de cadenas heredando de la clase `PairwiseStringEvaluator` y sobrescribiendo el método `_evaluate_string_pairs` (y el método `_aevaluate_string_pairs` si quieres usar el evaluador de forma asincrónica).

En este ejemplo, crearás un evaluador personalizado simple que simplemente devuelve si la primera predicción tiene más 'palabras' tokenizadas con espacios en blanco que la segunda.

Puedes consultar la documentación de referencia de la [interfaz PairwiseStringEvaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.PairwiseStringEvaluator.html#langchain.evaluation.schema.PairwiseStringEvaluator) para obtener más información.

```python
from typing import Any, Optional

from langchain.evaluation import PairwiseStringEvaluator


class LengthComparisonPairwiseEvaluator(PairwiseStringEvaluator):
    """
    Custom evaluator to compare two strings.
    """

    def _evaluate_string_pairs(
        self,
        *,
        prediction: str,
        prediction_b: str,
        reference: Optional[str] = None,
        input: Optional[str] = None,
        **kwargs: Any,
    ) -> dict:
        score = int(len(prediction.split()) > len(prediction_b.split()))
        return {"score": score}
```

```python
evaluator = LengthComparisonPairwiseEvaluator()

evaluator.evaluate_string_pairs(
    prediction="The quick brown fox jumped over the lazy dog.",
    prediction_b="The quick brown fox jumped over the dog.",
)
```

```output
{'score': 1}
```

## Ejemplo basado en LLM

Ese ejemplo era simple para ilustrar la API, pero no era muy útil en la práctica. A continuación, usa un LLM con algunas instrucciones personalizadas para formar un simple marcador de preferencias similar a la [PairwiseStringEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain) incorporada. Utilizaremos `ChatAnthropic` para la cadena de evaluación.

```python
%pip install --upgrade --quiet  anthropic
# %env ANTHROPIC_API_KEY=YOUR_API_KEY
```

```python
from typing import Any, Optional

from langchain.chains import LLMChain
from langchain.evaluation import PairwiseStringEvaluator
from langchain_community.chat_models import ChatAnthropic


class CustomPreferenceEvaluator(PairwiseStringEvaluator):
    """
    Custom evaluator to compare two strings using a custom LLMChain.
    """

    def __init__(self) -> None:
        llm = ChatAnthropic(model="claude-2", temperature=0)
        self.eval_chain = LLMChain.from_string(
            llm,
            """Which option is preferred? Do not take order into account. Evaluate based on accuracy and helpfulness. If neither is preferred, respond with C. Provide your reasoning, then finish with Preference: A/B/C

Input: How do I get the path of the parent directory in python 3.8?
Option A: You can use the following code:
\```python
import os

os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
\```

Option B: You can use the following code:

\```python
from pathlib import Path
Path(__file__).absolute().parent
\```

Reasoning: Both options return the same result. However, since option B is more concise and easily understand, it is preferred.
Preference: B

Which option is preferred? Do not take order into account. Evaluate based on accuracy and helpfulness. If neither is preferred, respond with C. Provide your reasoning, then finish with Preference: A/B/C
Input: {input}
Option A: {prediction}
Option B: {prediction_b}
Reasoning:""",
        )

    @property
    def requires_input(self) -> bool:
        return True

    @property
    def requires_reference(self) -> bool:
        return False

    def _evaluate_string_pairs(
        self,
        *,
        prediction: str,
        prediction_b: str,
        reference: Optional[str] = None,
        input: Optional[str] = None,
        **kwargs: Any,
    ) -> dict:
        result = self.eval_chain(
            {
                "input": input,
                "prediction": prediction,
                "prediction_b": prediction_b,
                "stop": ["Which option is preferred?"],
            },
            **kwargs,
        )

        response_text = result["text"]
        reasoning, preference = response_text.split("Preference:", maxsplit=1)
        preference = preference.strip()
        score = 1.0 if preference == "A" else (0.0 if preference == "B" else None)
        return {"reasoning": reasoning.strip(), "value": preference, "score": score}

```

```python
evaluator = CustomPreferenceEvaluator()
```

```python
evaluator.evaluate_string_pairs(
    input="How do I import from a relative directory?",
    prediction="use importlib! importlib.import_module('.my_package', '.')",
    prediction_b="from .sibling import foo",
)
```

```output
{'reasoning': 'Option B is preferred over option A for importing from a relative directory, because it is more straightforward and concise.\n\nOption A uses the importlib module, which allows importing a module by specifying the full name as a string. While this works, it is less clear compared to option B.\n\nOption B directly imports from the relative path using dot notation, which clearly shows that it is a relative import. This is the recommended way to do relative imports in Python.\n\nIn summary, option B is more accurate and helpful as it uses the standard Python relative import syntax.',
 'value': 'B',
 'score': 0.0}
```

```python
# Setting requires_input to return True adds additional validation to avoid returning a grade when insufficient data is provided to the chain.

try:
    evaluator.evaluate_string_pairs(
        prediction="use importlib! importlib.import_module('.my_package', '.')",
        prediction_b="from .sibling import foo",
    )
except ValueError as e:
    print(e)
```

```output
CustomPreferenceEvaluator requires an input string.
```
