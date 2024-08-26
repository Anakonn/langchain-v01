---
canonical: https://python.langchain.com/v0.1/docs/guides/productionization/evaluation/string/json
translated: false
---

# JSON Evaluators

Evaluating [extraction](/docs/use_cases/extraction) and function calling applications often comes down to validation that the LLM's string output can be parsed correctly and how it compares to a reference object. The following `JSON` validators provide functionality to check your model's output consistently.

## JsonValidityEvaluator

The `JsonValidityEvaluator` is designed to check the validity of a `JSON` string prediction.

### Overview:

- **Requires Input?**: No
- **Requires Reference?**: No

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

The `JsonEqualityEvaluator` assesses whether a JSON prediction matches a given reference after both are parsed.

### Overview:

- **Requires Input?**: No
- **Requires Reference?**: Yes

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

The evaluator also by default lets you provide a dictionary directly

```python
result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': False}
```

## JsonEditDistanceEvaluator

The `JsonEditDistanceEvaluator` computes a normalized Damerau-Levenshtein distance between two "canonicalized" JSON strings.

### Overview:

- **Requires Input?**: No
- **Requires Reference?**: Yes
- **Distance Function**: Damerau-Levenshtein (by default)

_Note: Ensure that `rapidfuzz` is installed or provide an alternative `string_distance` function to avoid an ImportError._

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

The `JsonSchemaEvaluator` validates a JSON prediction against a provided JSON schema. If the prediction conforms to the schema, it returns a score of True (indicating no errors). Otherwise, it returns a score of 0 (indicating an error).

### Overview:

- **Requires Input?**: Yes
- **Requires Reference?**: Yes (A JSON schema)
- **Score**: True (No errors) or False (Error occurred)

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