---
translated: true
---

# Distance de chaîne

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/string_distance.ipynb)

>En théorie de l'information, en linguistique et en informatique, la [distance de Levenshtein (Wikipédia)](https://en.wikipedia.org/wiki/Levenshtein_distance) est une métrique de chaîne pour mesurer la différence entre deux séquences. De manière informelle, la distance de Levenshtein entre deux mots est le nombre minimum d'éditions de caractères uniques (insertions, suppressions ou substitutions) nécessaires pour changer un mot en l'autre. Elle porte le nom du mathématicien soviétique Vladimir Levenshtein, qui a envisagé cette distance en 1965.

L'une des façons les plus simples de comparer la sortie de chaîne d'un LLM ou d'une chaîne à une étiquette de référence est d'utiliser des mesures de distance de chaîne telles que la distance `Levenshtein` ou `postfix`. Cela peut être utilisé avec des critères de correspondance approximative/floue pour des tests unitaires très basiques.

Cela peut être accessible à l'aide de l'évaluateur `string_distance`, qui utilise des métriques de distance de la bibliothèque [rapidfuzz](https://github.com/maxbachmann/RapidFuzz).

**Remarque :** Les scores renvoyés sont des _distances_, ce qui signifie que plus la valeur est faible, mieux c'est.

Pour plus d'informations, consultez la documentation de référence pour [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain) pour plus d'informations.

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

## Configurer la métrique de distance de chaîne

Par défaut, `StringDistanceEvalChain` utilise la distance de Levenshtein, mais il prend également en charge d'autres algorithmes de distance de chaîne. Configurez à l'aide de l'argument `distance`.

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
