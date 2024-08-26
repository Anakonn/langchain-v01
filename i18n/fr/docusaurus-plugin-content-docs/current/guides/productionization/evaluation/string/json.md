---
translated: true
---

# Évaluateurs JSON

L'évaluation des applications d'[extraction](/docs/use_cases/extraction) et d'appel de fonction se résume souvent à la validation du fait que la sortie de chaîne de caractères du LLM peut être analysée correctement et à la façon dont elle se compare à un objet de référence. Les validateurs `JSON` suivants fournissent des fonctionnalités pour vérifier la sortie de votre modèle de manière cohérente.

## JsonValidityEvaluator

Le `JsonValidityEvaluator` est conçu pour vérifier la validité d'une prédiction de chaîne de caractères `JSON`.

### Aperçu :

- **Nécessite une entrée ?** : Non
- **Nécessite une référence ?** : Non

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

Le `JsonEqualityEvaluator` évalue si une prédiction JSON correspond à une référence donnée après que les deux ont été analysées.

### Aperçu :

- **Nécessite une entrée ?** : Non
- **Nécessite une référence ?** : Oui

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

L'évaluateur vous permet également par défaut de fournir un dictionnaire directement.

```python
result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': False}
```

## JsonEditDistanceEvaluator

Le `JsonEditDistanceEvaluator` calcule une distance de Damerau-Levenshtein normalisée entre deux chaînes JSON "canonicalisées".

### Aperçu :

- **Nécessite une entrée ?** : Non
- **Nécessite une référence ?** : Oui
- **Fonction de distance** : Damerau-Levenshtein (par défaut)

_Remarque : Assurez-vous que `rapidfuzz` est installé ou fournissez une fonction `string_distance` alternative pour éviter une ImportError._

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

Le `JsonSchemaEvaluator` valide une prédiction JSON par rapport à un schéma JSON fourni. Si la prédiction est conforme au schéma, il renvoie un score de True (indiquant qu'il n'y a pas d'erreur). Sinon, il renvoie un score de 0 (indiquant une erreur).

### Aperçu :

- **Nécessite une entrée ?** : Oui
- **Nécessite une référence ?** : Oui (Un schéma JSON)
- **Score** : True (Pas d'erreur) ou False (Erreur survenue)

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
