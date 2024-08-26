---
translated: true
---

# Evaluadores JSON

Evaluar [extracción](/docs/use_cases/extraction) y aplicaciones de llamada a funciones a menudo se reduce a la validación de que la salida de cadena del LLM se puede analizar correctamente y cómo se compara con un objeto de referencia. Los siguientes validadores `JSON` proporcionan funcionalidad para verificar la salida de su modelo de manera consistente.

## JsonValidityEvaluator

El `JsonValidityEvaluator` está diseñado para verificar la validez de una predicción de cadena `JSON`.

### Resumen:

- **¿Requiere entrada?**: No
- **¿Requiere referencia?**: No

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

El `JsonEqualityEvaluator` evalúa si una predicción JSON coincide con una referencia dada después de que ambas se hayan analizado.

### Resumen:

- **¿Requiere entrada?**: No
- **¿Requiere referencia?**: Sí

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

El evaluador también le permite proporcionar un diccionario directamente de forma predeterminada

```python
result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': False}
```

## JsonEditDistanceEvaluator

El `JsonEditDistanceEvaluator` calcula una distancia de Damerau-Levenshtein normalizada entre dos cadenas JSON "canonicalizadas".

### Resumen:

- **¿Requiere entrada?**: No
- **¿Requiere referencia?**: Sí
- **Función de distancia**: Damerau-Levenshtein (de forma predeterminada)

_Nota: Asegúrese de que `rapidfuzz` esté instalado o proporcione una función `string_distance` alternativa para evitar un ImportError._

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

El `JsonSchemaEvaluator` valida una predicción JSON contra un esquema JSON proporcionado. Si la predicción se ajusta al esquema, devuelve una puntuación de True (lo que indica que no hay errores). De lo contrario, devuelve una puntuación de 0 (lo que indica que se produjo un error).

### Resumen:

- **¿Requiere entrada?**: Sí
- **¿Requiere referencia?**: Sí (un esquema JSON)
- **Puntuación**: True (sin errores) o False (se produjo un error)

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
