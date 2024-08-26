---
translated: true
---

# Évaluateur de chaîne de caractères personnalisé

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/custom.ipynb)

Vous pouvez créer vos propres évaluateurs de chaînes de caractères personnalisés en héritant de la classe `StringEvaluator` et en implémentant les méthodes `_evaluate_strings` (et `_aevaluate_strings` pour la prise en charge asynchrone).

Dans cet exemple, vous allez créer un évaluateur de perplexité à l'aide de la bibliothèque [evaluate](https://huggingface.co/docs/evaluate/index) de HuggingFace.
[La perplexité](https://en.wikipedia.org/wiki/Perplexity) est une mesure de la façon dont le texte généré serait bien prédit par le modèle utilisé pour calculer la métrique.

```python
%pip install --upgrade --quiet  evaluate > /dev/null
```

```python
from typing import Any, Optional

from evaluate import load
from langchain.evaluation import StringEvaluator


class PerplexityEvaluator(StringEvaluator):
    """Evaluate the perplexity of a predicted string."""

    def __init__(self, model_id: str = "gpt2"):
        self.model_id = model_id
        self.metric_fn = load(
            "perplexity", module_type="metric", model_id=self.model_id, pad_token=0
        )

    def _evaluate_strings(
        self,
        *,
        prediction: str,
        reference: Optional[str] = None,
        input: Optional[str] = None,
        **kwargs: Any,
    ) -> dict:
        results = self.metric_fn.compute(
            predictions=[prediction], model_id=self.model_id
        )
        ppl = results["perplexities"][0]
        return {"score": ppl}
```

```python
evaluator = PerplexityEvaluator()
```

```python
evaluator.evaluate_strings(prediction="The rains in Spain fall mainly on the plain.")
```

```output
Using pad_token, but it is not set yet.

huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)
```

```output
  0%|          | 0/1 [00:00<?, ?it/s]
```

```output
{'score': 190.3675537109375}
```

```python
# The perplexity is much higher since LangChain was introduced after 'gpt-2' was released and because it is never used in the following context.
evaluator.evaluate_strings(prediction="The rains in Spain fall mainly on LangChain.")
```

```output
Using pad_token, but it is not set yet.
```

```output
  0%|          | 0/1 [00:00<?, ?it/s]
```

```output
{'score': 1982.0709228515625}
```
