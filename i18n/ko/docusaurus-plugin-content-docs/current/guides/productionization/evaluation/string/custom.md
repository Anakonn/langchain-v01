---
translated: true
---

# 커스텀 문자열 평가기

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/custom.ipynb)

`StringEvaluator` 클래스를 상속하고 `_evaluate_strings` (및 비동기 지원을 위한 `_aevaluate_strings`) 메서드를 구현하여 자신만의 커스텀 문자열 평가기를 만들 수 있습니다.

이 예제에서는 HuggingFace [evaluate](https://huggingface.co/docs/evaluate/index) 라이브러리를 사용하여 퍼플렉서티(perplexity) 평가기를 만듭니다.
[퍼플렉서티](https://en.wikipedia.org/wiki/Perplexity)는 생성된 텍스트가 메트릭을 계산하는 데 사용된 모델에 의해 얼마나 잘 예측될 수 있는지를 나타내는 척도입니다.

```python
%pip install --upgrade --quiet evaluate > /dev/null
```

```python
from typing import Any, Optional

from evaluate import load
from langchain.evaluation import StringEvaluator


class PerplexityEvaluator(StringEvaluator):
    """예측된 문자열의 퍼플렉서티를 평가합니다."""

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
# 퍼플렉서티가 훨씬 높게 나타나는 이유는 LangChain이 'gpt-2' 출시 이후 도입되었고, 아래 맥락에서 전혀 사용되지 않았기 때문입니다.

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