---
sidebar_position: 0
title: 文字列の比較
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_string.ipynb)

LLMやチェーン、エージェントの予測結果を比較したい場合がよくあります。`StringComparison`評価器を使うと、以下のような質問に答えることができます:

- どのLLMやプロンプトが、特定の質問に対して好ましい出力を生成するか?
- few-shotの例の選択に含めるべき例はどれか?
- fine-tuningに含めるべき出力はどれか?

特定の入力に対して好ましい予測を選択する最も単純で信頼できる自動化された方法は、`pairwise_string`評価器を使うことです。

[PairwiseStringEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain)のリファレンスドキュメントをチェックしてください。

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

## メソッド

ペア文字列評価器は、[evaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.evaluate_string_pairs)（または非同期の[aevaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.aevaluate_string_pairs))）メソッドを使って呼び出すことができ、以下の引数を受け取ります:

- prediction (str) – 1つ目のモデル、チェーン、またはプロンプトの予測された応答。
- prediction_b (str) – 2つ目のモデル、チェーン、またはプロンプトの予測された応答。
- input (str) – 質問、プロンプト、またはその他のテキスト。
- reference (str) – (labeled_pairwise_stringバリアントの場合のみ) 参照応答。

これらのメソッドは以下の値を含む辞書を返します:

- value: 'A' または 'B'。'prediction' または 'prediction_b' のどちらが好ましいかを示します。
- score: 0 または 1 の整数。'value'から変換されたもので、1は'prediction'が好ましいことを、0は'prediction_b'が好ましいことを示します。
- reasoning: スコアを生成する前に生成された、LLMによる「思考過程の説明」を示す文字列。

## 参照なしの場合

参照が利用できない場合でも、好ましい応答を予測することができます。
結果は評価モデルの好みを反映しますが、信頼性が低く、事実的に正しくない好みが生じる可能性があります。

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

## 評価基準の定義

デフォルトでは、LLMは有用性、関連性、正確性、思考の深さに基づいて「好ましい」応答を選択するよう指示されています。`criteria`引数を渡すことで、基準をカスタマイズできます。基準は以下のいずれかの形式をとることができます:

- [`Criteria`](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.Criteria.html#langchain.evaluation.criteria.eval_chain.Criteria)列挙型または文字列値 - デフォルトの基準とその説明を使用する
- [Constitutional principal](https://api.python.langchain.com/en/latest/chains/langchain.chains.constitutional_ai.models.ConstitutionalPrinciple.html#langchain.chains.constitutional_ai.models.ConstitutionalPrinciple) - langchainで定義された憲法原則を使用する
- 辞書: カスタムの基準のリスト。キーは基準の名称、値は説明です。
- 基準または憲法原則のリスト - 複数の基準を組み合わせる

以下は、カスタムのスタイルに基づいて好ましい文章応答を判断する例です。

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

## LLMのカスタマイズ

デフォルトでは、ローダーは評価チェーンで `gpt-4` を使用します。ロード時にこれをカスタマイズできます。

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

## 評価プロンプトのカスタマイズ

タスク固有の指示を追加したり、出力にスコアを付けるよう評価器に指示するために、独自のカスタム評価プロンプトを使用できます。

*注意: 固有の形式で結果を生成するプロンプトを使用する場合は、デフォルトの `PairwiseStringResultOutputParser` の代わりに、独自のパーサー (`output_parser=your_parser()`) を渡す必要があるかもしれません。

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
