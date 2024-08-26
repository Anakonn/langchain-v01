---
canonical: https://python.langchain.com/v0.1/docs/guides/productionization/evaluation/string/string_distance
translated: false
---

# String Distance

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/string_distance.ipynb)

>In information theory, linguistics, and computer science, the [Levenshtein distance (Wikipedia)](https://en.wikipedia.org/wiki/Levenshtein_distance) is a string metric for measuring the difference between two sequences. Informally, the Levenshtein distance between two words is the minimum number of single-character edits (insertions, deletions or substitutions) required to change one word into the other. It is named after the Soviet mathematician Vladimir Levenshtein, who considered this distance in 1965.

One of the simplest ways to compare an LLM or chain's string output against a reference label is by using string distance measurements such as `Levenshtein` or `postfix` distance.  This can be used alongside approximate/fuzzy matching criteria for very basic unit testing.

This can be accessed using the `string_distance` evaluator, which uses distance metrics from the [rapidfuzz](https://github.com/maxbachmann/RapidFuzz) library.

**Note:** The returned scores are _distances_, meaning lower is typically "better".

For more information, check out the reference docs for the [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain) for more info.

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

## Configure the String Distance Metric

By default, the `StringDistanceEvalChain` uses  levenshtein distance, but it also supports other string distance algorithms. Configure using the `distance` argument.

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