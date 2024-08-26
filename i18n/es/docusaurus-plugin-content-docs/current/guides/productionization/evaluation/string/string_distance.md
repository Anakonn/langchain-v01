---
translated: true
---

# Distancia de cadena

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/string_distance.ipynb)

>En teoría de la información, lingüística y ciencias de la computación, la [distancia de Levenshtein (Wikipedia)](https://en.wikipedia.org/wiki/Levenshtein_distance) es una métrica de cadena para medir la diferencia entre dos secuencias. De manera informal, la distancia de Levenshtein entre dos palabras es el número mínimo de ediciones de un solo carácter (inserciones, eliminaciones o sustituciones) necesarias para cambiar una palabra en la otra. Lleva el nombre del matemático soviético Vladimir Levenshtein, quien consideró esta distancia en 1965.

Una de las formas más sencillas de comparar la salida de cadena de un LLM o cadena con una etiqueta de referencia es mediante el uso de mediciones de distancia de cadena como `Levenshtein` o `postfix`. Esto se puede usar junto con criterios de coincidencia aproximada/difusa para pruebas unitarias muy básicas.

Esto se puede acceder usando el evaluador `string_distance`, que utiliza métricas de distancia de la biblioteca [rapidfuzz](https://github.com/maxbachmann/RapidFuzz).

**Nota:** Los puntajes devueltos son _distancias_, lo que significa que un valor más bajo es típicamente "mejor".

Para obtener más información, consulte la documentación de referencia para [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain) para obtener más información.

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

## Configurar la métrica de distancia de cadena

De forma predeterminada, `StringDistanceEvalChain` usa la distancia de Levenshtein, pero también admite otros algoritmos de distancia de cadena. Configúrelo usando el argumento `distance`.

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
