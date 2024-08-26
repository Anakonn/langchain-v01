---
sidebar_position: 2
translated: true
---

# JSON 평가기

[추출](/docs/use_cases/extraction) 및 함수 호출 애플리케이션을 평가할 때 종종 LLM의 문자열 출력이 올바르게 구문 분석될 수 있는지, 참조 객체와 어떻게 비교되는지를 검증하는 것이 중요합니다. 다음의 `JSON` 검증기들은 일관되게 모델의 출력을 확인하는 기능을 제공합니다.

## JsonValidityEvaluator

`JsonValidityEvaluator`는 `JSON` 문자열 예측의 유효성을 확인하는 데 사용됩니다.

### 개요:

- **입력이 필요한가요?**: 아니요
- **참조가 필요한가요?**: 아니요

```python
from langchain.evaluation import JsonValidityEvaluator

evaluator = JsonValidityEvaluator()
# 동등하게

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

`JsonEqualityEvaluator`는 JSON 예측이 모두 구문 분석된 후 주어진 참조와 일치하는지 평가합니다.

### 개요:

- **입력이 필요한가요?**: 아니요
- **참조가 필요한가요?**: 예

```python
from langchain.evaluation import JsonEqualityEvaluator

evaluator = JsonEqualityEvaluator()
# 동등하게

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

평가기는 기본적으로 사전을 직접 제공할 수도 있습니다.

```python
result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': False}
```

## JsonEditDistanceEvaluator

`JsonEditDistanceEvaluator`는 "표준화된" JSON 문자열 간의 정규화된 Damerau-Levenshtein 거리를 계산합니다.

### 개요:

- **입력이 필요한가요?**: 아니요
- **참조가 필요한가요?**: 예
- **거리 함수**: 기본적으로 Damerau-Levenshtein

_참고: `rapidfuzz`가 설치되어 있는지 확인하거나 ImportError를 방지하기 위해 대체 `string_distance` 함수를 제공하십시오._

```python
from langchain.evaluation import JsonEditDistanceEvaluator

evaluator = JsonEditDistanceEvaluator()
# 동등하게

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
# 비교 전에 값이 표준화됩니다.

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
# 그러나 목록은 순서를 유지합니다.

result = evaluator.evaluate_strings(
    prediction='{"a": [1, 2]}', reference='{"a": [2, 1]}'
)
print(result)
```

```output
{'score': 0.18181818181818182}
```

```python
# 객체를 직접 전달할 수도 있습니다.

result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': 0.14285714285714285}
```

## JsonSchemaEvaluator

`JsonSchemaEvaluator`는 JSON 예측을 제공된 JSON 스키마에 대해 검증합니다. 예측이 스키마에 부합하면 True(오류 없음)의 점수를 반환합니다. 그렇지 않으면 0(오류 발생)의 점수를 반환합니다.

### 개요:

- **입력이 필요한가요?**: 예
- **참조가 필요한가요?**: 예 (JSON 스키마)
- **점수**: True (오류 없음) 또는 False (오류 발생)

```python
from langchain.evaluation import JsonSchemaEvaluator

evaluator = JsonSchemaEvaluator()
# 동등하게

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