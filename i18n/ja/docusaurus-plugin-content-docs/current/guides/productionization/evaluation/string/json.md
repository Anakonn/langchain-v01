---
translated: true
---

# JSON 評価器

[抽出](/docs/use_cases/extraction)や関数呼び出しアプリケーションの評価は、LLMの文字列出力が正しくパースできるかどうか、そして参照オブジェクトとの比較方法に帰着することが多い。以下の `JSON` 検証ツールは、モデルの出力を一貫して確認するための機能を提供する。

## JsonValidityEvaluator

`JsonValidityEvaluator` は、`JSON` 文字列の予測の妥当性をチェックするように設計されている。

### 概要:

- **入力が必要?**: いいえ
- **参照が必要?**: いいえ

```python
from langchain.evaluation import JsonValidityEvaluator

evaluator = JsonValidityEvaluator()
# Equivalently
# evaluator = load_evaluator("json_validity")
prediction = '{"name": "John", "age": 30, "city": "New York"}'

result = evaluator.evaluate_strings(prediction=prediction)
print(result)
```

```output
{'score': 1}
```

```python
prediction = '{"name": "John", "age": 30, "city": "New York",}'
result = evaluator.evaluate_strings(prediction=prediction)
print(result)
```

```output
{'score': 0, 'reasoning': 'Expecting property name enclosed in double quotes: line 1 column 48 (char 47)'}
```

## JsonEqualityEvaluator

`JsonEqualityEvaluator` は、両方がパースされた後、JSON の予測が与えられた参照と一致するかどうかを評価する。

### 概要:

- **入力が必要?**: いいえ
- **参照が必要?**: はい

```python
from langchain.evaluation import JsonEqualityEvaluator

evaluator = JsonEqualityEvaluator()
# Equivalently
# evaluator = load_evaluator("json_equality")
result = evaluator.evaluate_strings(prediction='{"a": 1}', reference='{"a": 1}')
print(result)
```

```output
{'score': True}
```

```python
result = evaluator.evaluate_strings(prediction='{"a": 1}', reference='{"a": 2}')
print(result)
```

```output
{'score': False}
```

評価器はまた、デフォルトで辞書を直接提供できる

```python
result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': False}
```

## JsonEditDistanceEvaluator

`JsonEditDistanceEvaluator` は、2つの "正規化された" JSON 文字列間のDamerau-Levenshtein距離の正規化値を計算する。

### 概要:

- **入力が必要?**: いいえ
- **参照が必要?**: はい
- **距離関数**: Damerau-Levenshtein (デフォルト)

_注: `rapidfuzz` がインストールされていることを確認するか、代替の `string_distance` 関数を提供してください。ImportErrorを避けるため。_

```python
from langchain.evaluation import JsonEditDistanceEvaluator

evaluator = JsonEditDistanceEvaluator()
# Equivalently
# evaluator = load_evaluator("json_edit_distance")

result = evaluator.evaluate_strings(
    prediction='{"a": 1, "b": 2}', reference='{"a": 1, "b": 3}'
)
print(result)
```

```output
{'score': 0.07692307692307693}
```

```python
# The values are canonicalized prior to comparison
result = evaluator.evaluate_strings(
    prediction="""
    {
        "b": 3,
        "a":   1
    }""",
    reference='{"a": 1, "b": 3}',
)
print(result)
```

```output
{'score': 0.0}
```

```python
# Lists maintain their order, however
result = evaluator.evaluate_strings(
    prediction='{"a": [1, 2]}', reference='{"a": [2, 1]}'
)
print(result)
```

```output
{'score': 0.18181818181818182}
```

```python
# You can also pass in objects directly
result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': 0.14285714285714285}
```

## JsonSchemaEvaluator

`JsonSchemaEvaluator` は、提供された JSON スキーマに対して JSON の予測を検証する。予測がスキーマに準拠している場合は True (エラーなし) のスコアを返す。そうでない場合は 0 (エラーあり) のスコアを返す。

### 概要:

- **入力が必要?**: はい
- **参照が必要?**: はい (JSON スキーマ)
- **スコア**: True (エラーなし) または False (エラーあり)

```python
from langchain.evaluation import JsonSchemaEvaluator

evaluator = JsonSchemaEvaluator()
# Equivalently
# evaluator = load_evaluator("json_schema_validation")

result = evaluator.evaluate_strings(
    prediction='{"name": "John", "age": 30}',
    reference={
        "type": "object",
        "properties": {"name": {"type": "string"}, "age": {"type": "integer"}},
    },
)
print(result)
```

```output
{'score': True}
```

```python
result = evaluator.evaluate_strings(
    prediction='{"name": "John", "age": 30}',
    reference='{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "integer"}}}',
)
print(result)
```

```output
{'score': True}
```

```python
result = evaluator.evaluate_strings(
    prediction='{"name": "John", "age": 30}',
    reference='{"type": "object", "properties": {"name": {"type": "string"},'
    '"age": {"type": "integer", "minimum": 66}}}',
)
print(result)
```

```output
{'score': False, 'reasoning': "<ValidationError: '30 is less than the minimum of 66'>"}
```
