---
translated: true
---

# 문자열 거리

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/string_distance.ipynb)

> 정보 이론, 언어학, 컴퓨터 과학에서 [레벤슈타인 거리 (Wikipedia)](https://en.wikipedia.org/wiki/Levenshtein_distance)는 두 시퀀스 간의 차이를 측정하는 문자열 메트릭입니다. 비공식적으로, 두 단어 간의 레벤슈타인 거리는 한 단어를 다른 단어로 바꾸기 위해 필요한 최소한의 단일 문자 편집(삽입, 삭제 또는 대체)의 수입니다. 이는 1965년 이 거리를 고려한 소련 수학자 블라디미르 레벤슈타인의 이름을 따서 명명되었습니다.

LLM 또는 체인의 문자열 출력을 참조 라벨과 비교하는 가장 간단한 방법 중 하나는 `레벤슈타인` 또는 `postfix` 거리와 같은 문자열 거리 측정을 사용하는 것입니다. 이는 매우 기본적인 단위 테스트를 위해 근사/퍼지 매칭 기준과 함께 사용할 수 있습니다.

이는 [rapidfuzz](https://github.com/maxbachmann/RapidFuzz) 라이브러리의 거리 메트릭을 사용하는 `string_distance` 평가기를 통해 접근할 수 있습니다.

**참고:** 반환된 점수는 *거리*이므로 숫자가 낮을수록 일반적으로 "더 나은" 것으로 간주됩니다.

자세한 내용은 [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain) 참조 문서를 확인하세요.

```python
%pip install --upgrade --quiet rapidfuzz
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
# 결과는 순전히 문자 기반이므로 부정의 경우 덜 유용합니다.

evaluator.evaluate_strings(
    prediction="The job is done.",
    reference="The job isn't done",
)
```

```output
{'score': 0.0724999999999999}
```

## 문자열 거리 메트릭 구성

기본적으로 `StringDistanceEvalChain`은 레벤슈타인 거리를 사용하지만, 다른 문자열 거리 알고리즘도 지원합니다. `distance` 인수를 사용하여 구성할 수 있습니다.

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