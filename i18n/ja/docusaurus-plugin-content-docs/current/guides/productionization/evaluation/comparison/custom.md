---
sidebar_position: 2
title: カスタムペアワイズ評価器
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/custom.ipynb)

`PairwiseStringEvaluator`クラスを継承し、`_evaluate_string_pairs`メソッド(および非同期的に評価器を使用したい場合は`_aevaluate_string_pairs`メソッド)をオーバーライドすることで、独自のペアワイズ文字列評価器を作成できます。

この例では、最初の予測の方が2つ目の予測よりも空白で区切られた'単語'が多いかどうかを返す、シンプルなカスタム評価器を作成します。

[PairwiseStringEvaluator インターフェース](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.PairwiseStringEvaluator.html#langchain.evaluation.schema.PairwiseStringEvaluator)のリファレンスドキュメントを確認して、詳細を確認できます。

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

## LLMベースの例

その例は API を説明するためにシンプルでしたが、実際には役立つものではありませんでした。以下では、組み込みの[PairwiseStringEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain)に似た簡単な選好スコアラーを作成するために、カスタムの指示を使ってLLMを使用します。`ChatAnthropic`を評価器チェーンに使用します。

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
