---
sidebar_position: 0
title: 페어와이즈 문자열 비교
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_string.ipynb)

종종 주어진 입력에 대해 LLM, 체인 또는 에이전트의 예측을 비교하고자 할 때가 있습니다. `StringComparison` 평가기는 다음과 같은 질문에 답할 수 있도록 이를 도와줍니다:

- 어떤 LLM이나 프롬프트가 주어진 질문에 대해 선호되는 출력을 생성합니까?
- 소수 예제 선택을 위해 어떤 예제를 포함해야 합니까?
- 파인튜닝을 위해 어떤 출력을 포함하는 것이 더 좋습니까?

주어진 입력에 대해 선호되는 예측을 선택하는 가장 간단하고 종종 가장 신뢰할 수 있는 자동화된 방법은 `pairwise_string` 평가기를 사용하는 것입니다.

[PairwiseStringEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain)의 참고 문서를 확인해보세요.

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
{'reasoning': '두 응답 모두 질문에 대해 숫자 답변을 제공하므로 관련성이 있습니다. 그러나 응답 A는 네 마리의 개가 있다는 참조 답변과 비교했을 때 잘못된 답변입니다. 반면 응답 B는 참조 답변과 일치하여 올바른 답변입니다. 두 응답 모두 깊이 있는 사고를 보여주지 않으며, 단순히 숫자 답변을 제공할 뿐입니다.\n\n이 기준에 따라 응답 B가 더 나은 응답입니다.\n',
 'value': 'B',
 'score': 0}
```

## 메서드

페어와이즈 문자열 평가기는 [evaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.evaluate_string_pairs) (또는 비동기식 [aevaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.aevaluate_string_pairs)) 메서드를 사용하여 호출할 수 있으며, 다음을 수락합니다:

- prediction (str) – 첫 번째 모델, 체인 또는 프롬프트의 예측된 응답.
- prediction_b (str) – 두 번째 모델, 체인 또는 프롬프트의 예측된 응답.
- input (str) – 입력 질문, 프롬프트 또는 기타 텍스트.
- reference (str) – (labeled_pairwise_string 변형에만 해당) 참조 응답.

이 메서드는 다음 값을 포함하는 사전을 반환합니다:

- value: 'A' 또는 'B', 각각 `prediction` 또는 `prediction_b`가 선호되는지 나타냅니다.
- score: Integer 0 또는 1, 'value'에서 매핑된 값으로, 1이면 첫 번째 `prediction`이 선호되고, 0이면 `prediction_b`가 선호됨을 의미합니다.
- reasoning: 점수를 생성하기 전에 LLM에서 생성된 "사고의 연쇄" 설명 문자열.

## 참조가 없는 경우

참조가 없는 경우에도 선호되는 응답을 예측할 수 있습니다.
결과는 평가 모델의 선호도를 반영하며, 신뢰성이 떨어지고 사실과 다른 선호도가 나올 수 있습니다.

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
{'reasoning': '두 응답 모두 질문에 대해 올바르고 관련이 있습니다. 그러나 응답 B는 더 자세한 설명을 제공하여 더 도움이 되고 통찰력이 있습니다. 응답 A는 올바르지만 깊이가 부족하여 덧셈이 무엇인지 설명하지 않습니다.\n\n최종 결정: [[B]]',
 'value': 'B',
 'score': 0}
```

## 기준 정의

기본적으로 LLM은 유용성, 관련성, 정확성 및 깊이를 기준으로 '선호되는' 응답을 선택하도록 지시받습니다. `criteria` 인수를 전달하여 기준을 사용자 정의할 수 있으며, 기준은 다음 형식 중 하나를 취할 수 있습니다:

- [`Criteria`](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.Criteria.html#langchain.evaluation.criteria.eval_chain.Criteria) enum 또는 문자열 값 - 기본 기준 및 설명을 사용합니다.
- [헌법적 원칙](https://api.python.langchain.com/en/latest/chains/langchain.chains.constitutional_ai.models.ConstitutionalPrinciple.html#langchain.chains.constitutional_ai.models.ConstitutionalPrinciple) - langchain에 정의된 헌법적 원칙 중 하나를 사용합니다.
- 사전: 기준의 이름이 키이고 설명이 값인 사용자 정의 기준 목록.
- 기준이나 헌법적 원칙의 목록 - 하나의 기준에 여러 기준을 결합합니다.

아래는 사용자 정의 스타일을 기준으로 선호하는 작문 응답을 결정하는 예제입니다.

```python
custom_criteria = {
    "simplicity": "언어가 직설적이고 겉치레가 없는가?",
    "clarity": "문장이 명확하고 이해하기 쉬운가?",
    "precision": "불필요한 단어나 세부 사항 없이 글이 정확한가?",
    "truthfulness": "글이 정직하고 진실한 느낌을 주는가?",
    "subtext": "글이 더 깊은 의미나 주제를 암시하는가?",
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
{'reasoning': '응답 A는 간결하고 명확하며 정밀합니다. 그것은 가족에 대한 깊고 진실한 메시지를 전달하기 위해 직설적인 언어를 사용합니다. 기쁨과 슬픔을 음악으로 비유한 것은 효과적이고 이해하기 쉽습니다.\n\n응답 B는 더 복잡하고 덜 명확합니다. "domicile," "resounds," "abode," "dissonant," "elegy"와 같은 단어를 사용하여 언어가 더 겉치레가 많습니다. 응답 B는 응답 A와 유사한 메시지를 전달하지만, 더 복잡한 방식으로 전달합니다. 불필요한 단어와 세부 사항의 사용으로 정밀도가 부족합니다.\n\n두 응답 모두 가족의 공유된 기쁨과 고유한 슬픔에 대한 더 깊은 의미나 주제를 암시합니다. 그러나 응답 A는 더 효과적이고 접근하기 쉬운 방식으로 이를 수행합니다.\n\n따라서 더 나은 응답은 [[A]]입니다.',
 'value': 'A',
 'score': 1}
```

## LLM 사용자 정의

기본적으로 로더는 평가 체인에서 `gpt-4`를 사용합니다. 로드할 때 이를 사용자 정의할 수 있습니다.

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
{'reasoning': '다음은 나의 평가입니다:\n\n응답 B는 응답 A보다 더 도움이 되고, 통찰력이 있으며, 정확합니다. 응답 B는 "4"를 간단히 진술하여 참조 답변에 언급된 정확한 개 수를 제공합니다. 반면, 응답 A는 "there are three dogs"라고 말하여 참조 답변과 비교했을 때 잘못된 답변입니다.\n\n유용성 측면에서 응답 B는 정확한 숫자를 제공하며, 응답 A는 부정확한 추측을 제공합니다. 관련성 측면에서 두 응답 모두 질문에서 공원의 개 수를 언급합니다. 그러나 참조 답변에 기반한 정확성과 사실성 측면에서는 응답 B가 더 맞습니다. 응답 A는 일부 추론을 시도하지만 궁극적으로는 잘못되었습니다. 응답 B는 사실적인 숫자를 간단히 진술하는 데 더 적은 깊이의 사고를 필요로 합니다.\n\n요약하자면, 응답 B는 유용성, 관련성, 정확성 및 깊이 측면에서 우수합니다. 최종 결정은: [[B]]\n',
 'value': 'B',
 'score': 0}
```

## 평가 프롬프트 사용자 정의

고유한 평가 프롬프트를 사용하여 작업별 지시사항을 추가하거나 평가자가 출력을 점수화하도록 지시할 수 있습니다.

\*참고: 고유한 형식으로 결과를 생성하도록 프롬프트를 사용하는 경우, 기본 `PairwiseStringResultOutputParser` 대신 사용자 정의 출력 파서를 전달해야 할 수도 있습니다 (`output_parser=your_parser()`).

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
# 평가자에게 프롬프트가 할당되었습니다.

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
{'reasoning': '유용성: A와 B 모두 질문에 직접적인 답변을 제공하므로 유용합니다.\n관련성: A는 텍스트에서 올바른 개의 이름을 언급하므로 관련이 있습니다. B는 다른 이름을 제공하므로 관련이 없습니다.\n정확성: A는 개의 이름을 정확하게 명시하므로 정확합니다. B는 다른 이름을 제공하므로 부정확합니다.\n깊이: A와 B 모두 질문에 간단한 답변을 제공하므로 유사한 수준의 깊이를 보여줍니다.\n\n이 평가에 따라 선호되는 응답은:\n',
 'value': 'A',
 'score': 1}
```