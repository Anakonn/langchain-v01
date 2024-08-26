---
sidebar_position: 2
title: 커스텀 페어와이즈 평가기
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/custom.ipynb)

`PairwiseStringEvaluator` 클래스를 상속하고 `_evaluate_string_pairs` 메서드를 덮어쓰면 자신만의 페어와이즈 문자열 평가기를 만들 수 있습니다. (비동기식으로 평가기를 사용하려면 `_aevaluate_string_pairs` 메서드도 덮어써야 합니다.)

이 예제에서는 첫 번째 예측이 두 번째 예측보다 공백으로 구분된 '단어'가 더 많은지 여부를 반환하는 간단한 커스텀 평가기를 만듭니다.

[PairwiseStringEvaluator 인터페이스](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.PairwiseStringEvaluator.html#langchain.evaluation.schema.PairwiseStringEvaluator)의 참고 문서를 확인해보세요.

```python
from typing import Any, Optional

from langchain.evaluation import PairwiseStringEvaluator

class LengthComparisonPairwiseEvaluator(PairwiseStringEvaluator):
    """
    두 문자열을 비교하는 커스텀 평가기.
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

## LLM 기반 예제

이 예제는 API를 설명하기 위해 단순히 만든 것이며 실제로 유용하지는 않습니다. 아래에서는 커스텀 지시사항을 사용하여 내장된 [PairwiseStringEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain)과 유사한 간단한 선호도 평가기를 만들기 위해 LLM을 사용합니다. 평가 체인을 위해 `ChatAnthropic`을 사용합니다.

```python
%pip install --upgrade --quiet anthropic
# %env ANTHROPIC_API_KEY=YOUR_API_KEY

```

```python
from typing import Any, Optional

from langchain.chains import LLMChain
from langchain.evaluation import PairwiseStringEvaluator
from langchain_community.chat_models import ChatAnthropic

class CustomPreferenceEvaluator(PairwiseStringEvaluator):
    """
    커스텀 LLMChain을 사용하여 두 문자열을 비교하는 커스텀 평가기.
    """

    def __init__(self) -> None:
        llm = ChatAnthropic(model="claude-2", temperature=0)
        self.eval_chain = LLMChain.from_string(
            llm,
            """어떤 옵션이 더 선호됩니까? 순서를 고려하지 마세요. 정확성과 유용성을 기준으로 평가하세요. 어느 것도 선호되지 않으면 C로 응답하세요. 이유를 제공한 후 선호도: A/B/C로 끝내세요.

입력: Python 3.8에서 부모 디렉터리의 경로를 얻는 방법은?
옵션 A: 다음 코드를 사용할 수 있습니다:
```python
import os

os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
```

옵션 B: 다음 코드를 사용할 수 있습니다:

```python
from pathlib import Path
Path(__file__).absolute().parent
```

이유: 두 옵션 모두 동일한 결과를 반환합니다. 그러나 옵션 B가 더 간결하고 이해하기 쉬우므로 선호됩니다.
선호도: B

어떤 옵션이 더 선호됩니까? 순서를 고려하지 마세요. 정확성과 유용성을 기준으로 평가하세요. 어느 것도 선호되지 않으면 C로 응답하세요. 이유를 제공한 후 선호도: A/B/C로 끝내세요.
입력: {input}
옵션 A: {prediction}
옵션 B: {prediction_b}
이유:""",
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
                "stop": ["어떤 옵션이 더 선호됩니까?"],
            },
            **kwargs,
        )

        response_text = result["text"]
        reasoning, preference = response_text.split("선호도:", maxsplit=1)
        preference = preference.strip()
        score = 1.0 if preference == "A" else (0.0 if preference == "B" else None)
        return {"reasoning": reasoning.strip(), "value": preference, "score": score}

```

```python
evaluator = CustomPreferenceEvaluator()
```

```python
evaluator.evaluate_string_pairs(
    input="상대 경로에서 가져오는 방법은?",
    prediction="importlib을 사용하세요! importlib.import_module('.my_package', '.')",
    prediction_b="from .sibling import foo",
)
```

```output
{'reasoning': '옵션 B는 상대 경로에서 가져오는 데 있어 옵션 A보다 선호됩니다. 더 간단하고 명확하기 때문입니다.\n\n옵션 A는 importlib 모듈을 사용하여 문자열로 전체 이름을 지정하여 모듈을 가져올 수 있습니다. 이 방법도 작동하지만 옵션 B에 비해 명확성이 떨어집니다.\n\n옵션 B는 점 표기법을 사용하여 상대 경로에서 직접 가져오며, 이는 상대 가져오기임을 명확하게 보여줍니다. 이는 Python에서 상대 가져오기를 수행하는 권장 방법입니다.\n\n요약하면, 옵션 B는 표준 Python 상대 가져오기 구문을 사용하므로 더 정확하고 유용합니다.',
 'value': 'B',
 'score': 0.0}
```

```python
# requires_input을 True로 설정하면 체인이 불충분한 데이터를 제공할 때 등급을 반환하지 않도록 추가 검증을 수행합니다.

try:
    evaluator.evaluate_string_pairs(
        prediction="importlib을 사용하세요! importlib.import_module('.my_package', '.')",
        prediction_b="from .sibling import foo",
    )
except ValueError as e:
    print(e)
```

```output
CustomPreferenceEvaluator는 입력 문자열이 필요합니다.
```