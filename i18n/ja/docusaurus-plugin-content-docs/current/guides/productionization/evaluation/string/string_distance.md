---
translated: true
---

# 文字列距離

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/string_distance.ipynb)

>情報理論、言語学、コンピューター科学において、[Levenshtein distance (Wikipedia)](https://en.wikipedia.org/wiki/Levenshtein_distance)は、2つの系列の違いを測る文字列メトリックです。非公式には、2つの単語のLevenshtein距離は、1つの単語を別の単語に変換するために必要な単一文字の編集(挿入、削除、置換)の最小数です。これは、1965年にソ連の数学者ウラジーミル・レーベンシュタインが考案したものです。

LLMやチェーンの文字列出力を参照ラベルと比較する最も単純な方法の1つは、`Levenshtein`や`postfix`距離などの文字列距離測定を使うことです。これは、非常に基本的なユニットテストのために、近似/ファジー一致基準と併せて使用できます。

これは、[rapidfuzz](https://github.com/maxbachmann/RapidFuzz)ライブラリの距離メトリックを使用する`string_distance`評価器を使って、アクセスできます。

**注意:** 返される得点は_距離_であり、一般的に低いほうが「良い」です。

詳細については、[StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain)のリファレンスドキュメントを確認してください。

```python
%pip install --upgrade --quiet  rapidfuzz
```

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("string_distance")
```

```python
evaluator.evaluate_strings(
    prediction="The job is completely done.",
    reference="The job is done",
)
```

```output
{'score': 0.11555555555555552}
```

```python
# The results purely character-based, so it's less useful when negation is concerned
evaluator.evaluate_strings(
    prediction="The job is done.",
    reference="The job isn't done",
)
```

```output
{'score': 0.0724999999999999}
```

## 文字列距離メトリックの設定

デフォルトでは、`StringDistanceEvalChain`はLevenshtein距離を使用しますが、他の文字列距離アルゴリズムもサポートしています。`distance`引数を使って設定できます。

```python
from langchain.evaluation import StringDistance

list(StringDistance)
```

```output
[<StringDistance.DAMERAU_LEVENSHTEIN: 'damerau_levenshtein'>,
 <StringDistance.LEVENSHTEIN: 'levenshtein'>,
 <StringDistance.JARO: 'jaro'>,
 <StringDistance.JARO_WINKLER: 'jaro_winkler'>]
```

```python
jaro_evaluator = load_evaluator("string_distance", distance=StringDistance.JARO)
```

```python
jaro_evaluator.evaluate_strings(
    prediction="The job is completely done.",
    reference="The job is done",
)
```

```output
{'score': 0.19259259259259254}
```

```python
jaro_evaluator.evaluate_strings(
    prediction="The job is done.",
    reference="The job isn't done",
)
```

```output
{'score': 0.12083333333333324}
```
