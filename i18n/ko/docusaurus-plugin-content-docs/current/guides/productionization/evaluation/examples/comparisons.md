---
translated: true
---

# 체인 출력 비교

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/examples/comparisons.ipynb)

두 개의 다른 프롬프트(또는 LLM)가 있을 때, 어떤 것이 "더 나은" 결과를 생성할지 어떻게 알 수 있을까요?

선호되는 구성을 예측하는 자동화된 방법 중 하나는 `PairwiseStringEvaluator`인 `PairwiseStringEvalChain`을 사용하는 것입니다.<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1). 이 체인은 특정 입력이 주어졌을 때 어느 출력을 선호하는지 선택하도록 LLM에 프롬프트를 제공합니다.

이 평가를 위해서는 다음 세 가지가 필요합니다:

1. 평가기
2. 입력 데이터셋
3. 비교할 2개(또는 그 이상)의 LLM, 체인 또는 에이전트

그런 다음 결과를 집계하여 선호되는 모델을 결정합니다.

### 1단계. 평가기 생성

이 예제에서는 gpt-4를 사용하여 어느 출력을 선호하는지 선택합니다.

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

eval_chain = load_evaluator("pairwise_string")
```

### 2단계. 데이터셋 선택

LLM에 대한 실제 사용 데이터가 이미 있는 경우 대표 샘플을 사용할 수 있습니다. 더 많은 예제는 더 신뢰할 수 있는 결과를 제공합니다. 여기에서는 langchain에 대해 누군가가 가질 수 있는 몇 가지 예제 질문을 사용합니다.

```python
from langchain.evaluation.loading import load_dataset

dataset = load_dataset("langchain-howto-queries")
```

```output
캐시된 데이터셋 parquet (/Users/wfh/.cache/huggingface/datasets/LangChainDatasets___parquet/LangChainDatasets--langchain-howto-queries-bbb748bbee7e77aa/0.0.0/14a00e99c0d15a23649d0db8944380ac81082d4b021f398733dd84f3a6c569a7) 찾음
```

```output
  0%|          | 0/1 [00:00<?, ?it/s]
```

### 3단계. 비교할 모델 정의

이 경우 두 에이전트를 비교합니다.

```python
from langchain.agents import AgentType, Tool, initialize_agent
from langchain_community.utilities import SerpAPIWrapper
from langchain_openai import ChatOpenAI

# 언어 모델 초기화

# openai_api_key="<your_api_key>"에 자신의 OpenAI API 키를 추가할 수 있습니다.

llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")

# 검색 기능을 위한 SerpAPIWrapper 초기화

# openai_api_key="<your_api_key>"에 실제 SerpAPI 키를 추가하십시오.

search = SerpAPIWrapper()

# 에이전트가 제공하는 도구 목록 정의

tools = [
    Tool(
        name="Search",
        func=search.run,
        coroutine=search.arun,
        description="현재 이벤트에 대한 질문에 답변해야 할 때 유용합니다. 목표 지향적인 질문을 해야 합니다.",
    ),
]
```

```python
functions_agent = initialize_agent(
    tools, llm, agent=AgentType.OPENAI_MULTI_FUNCTIONS, verbose=False
)
conversations_agent = initialize_agent(
    tools, llm, agent=AgentType.CHAT_ZERO_SHOT_REACT_DESCRIPTION, verbose=False
)
```

### 4단계. 응답 생성

모델 각각에 대한 출력을 생성한 후 평가합니다.

```python
import asyncio

from tqdm.notebook import tqdm

results = []
agents = [functions_agent, conversations_agent]
concurrency_level = 6  # 동시에 실행할 에이전트 수. OpenAI의 속도 제한이 있을 경우 줄여야 할 수도 있습니다.

# 속도를 높이기 위해 이 데이터셋의 첫 20개 예제만 실행합니다.

# 이는 나중에 더 큰 신뢰 구간을 초래할 것입니다.

batch = []
for example in tqdm(dataset[:20]):
    batch.extend([agent.acall(example["inputs"]) for agent in agents])
    if len(batch) >= concurrency_level:
        batch_results = await asyncio.gather(*batch, return_exceptions=True)
        results.extend(list(zip(*[iter(batch_results)] * 2)))
        batch = []
if batch:
    batch_results = await asyncio.gather(*batch, return_exceptions=True)
    results.extend(list(zip(*[iter(batch_results)] * 2)))
```

```output
  0%|          | 0/20 [00:00<?, ?it/s]
```

## 5단계. 쌍 평가

이제 결과를 평가할 시간입니다. 각 에이전트 응답에 대해 어느 출력을 선호하는지 선택하기 위해 평가 체인을 실행합니다(또는 동점을 반환합니다).

입력 순서를 무작위로 선택하여 한 모델이 먼저 제공된 것만으로 선호되는 가능성을 줄입니다.

```python
import random

def predict_preferences(dataset, results) -> list:
    preferences = []

    for example, (res_a, res_b) in zip(dataset, results):
        input_ = example["inputs"]
        # 지속적인 위치 편향을 줄이기 위해 동전을 던져 결정합니다.
        if random.random() < 0.5:
            pred_a, pred_b = res_a, res_b
            a, b = "a", "b"
        else:
            pred_a, pred_b = res_b, res_a
            a, b = "b", "a"
        eval_res = eval_chain.evaluate_string_pairs(
            prediction=pred_a["output"] if isinstance(pred_a, dict) else str(pred_a),
            prediction_b=pred_b["output"] if isinstance(pred_b, dict) else str(pred_b),
            input=input_,
        )
        if eval_res["value"] == "A":
            preferences.append(a)
        elif eval_res["value"] == "B":
            preferences.append(b)
        else:
            preferences.append(None)  # 선호 없음
    return preferences
```

```python
preferences = predict_preferences(dataset, results)
```

**선호도 비율 출력.**

```python
from collections import Counter

name_map = {
    "a": "OpenAI Functions Agent",
    "b": "Structured Chat Agent",
}
counts = Counter(preferences)
pref_ratios = {k: v / len(preferences) for k, v in counts.items()}
for k, v in pref_ratios.items():
    print(f"{name_map.get(k)}: {v:.2%}")
```

```output
OpenAI Functions Agent: 95.00%
None: 5.00%
```

### 신뢰 구간 추정

결과는 꽤 명확해 보이지만, 모델 "A"(OpenAI Functions Agent)가 선호되는 모델인지 얼마나 자신 있는지 더 잘 이해하려면 신뢰 구간을 계산할 수 있습니다.

아래에서는 윌슨 점수를 사용하여 신뢰 구간을 추정합니다.

```python
from math import sqrt

def wilson_score_interval(
    preferences: list, which: str = "a", z: float = 1.96
) -> tuple:
    """윌슨 점수를 사용하여 신뢰 구간을 추정합니다.

    자세한 내용은 다음을 참조하십시오: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval
    사용할 때와 사용해서는 안 되는 경우를 포함하여.
    """
    total_preferences = preferences.count("a") + preferences.count("b")
    n_s = preferences.count(which)

    if total_preferences == 0:
        return (0, 0)

    p_hat = n_s / total_preferences

    denominator = 1 + (z**2) / total_preferences
    adjustment = (z / denominator) * sqrt(
        p_hat * (1 - p_hat) / total_preferences
        + (z**2) / (4 * total_preferences * total_preferences)
    )
    center = (p_hat + (z**2) / (2 * total_preferences)) / denominator
    lower_bound = min(max(center - adjustment, 0.0), 1.0)
    upper_bound = min(max(center + adjustment, 0.0), 1.0)

    return (lower_bound, upper_bound)
```

```python
for which_, name in name_map.items():
    low, high = wilson_score_interval(preferences, which=which_)
    print(
        f'"{name}"는 95% 신뢰 수준으로 {low:.2%}에서 {high:.2%} 사이의 비율로 선호될 것입니다.'
    )
```

```output
"OpenAI Functions Agent"는 95% 신뢰 수준으로 83.18%에서 100.00% 사이의 비율로 선호될 것입니다.
"Structured Chat Agent"는 95% 신뢰 수준으로 0.00%에서 16.82% 사이의 비율로 선호될 것입니다.
```

**p-값 출력.**

```python
from scipy import stats

preferred_model = max(pref_ratios, key=pref_ratios.get)
successes = preferences.count(preferred_model)
n = len(preferences) - preferences.count(None)
p_value = stats.binom_test(successes, n, p=0.5, alternative="two-sided")
print(
    f"""p-값은 {p_value:.5f}입니다. 귀무 가설이 참이라면(즉, 선택된 평가 체인이 모델 간에 선호도가 전혀 없다고 가정하면),
{n}번의 시도 중 최소 {successes}번 OpenAI Functions Agent가 선호되는 것을 관찰할 확률은 {p_value:.5%}입니다."""
)
```

```output
p-값은 0.00000입니다. 귀무 가설이 참이라면(즉, 선택된 평가 체인이 모델 간에 선호도가 전혀 없다고 가정하면),
19번의 시도 중 최소 19번 OpenAI Functions Agent가 선호되는 것을 관찰할 확률은 0.00038%입니다.

/var/folders/gf/6rnp_mbx5914kx7qmmh7xzmw0000gn/T/ipykernel_15978/384907688.py:6: DeprecationWarning: 'binom_test' is deprecated in favour of 'binomtest' from version 1.7.0 and will be removed in Scipy 1.12.0.
  p_value = stats.binom_test(successes, n, p=0.5, alternative="two-sided")
```

<a name="cite_note-1"></a>_1. 참고: 자동 평가(evals)는 여전히 개방형 연구 주제이며, 다른 평가 접근 방식과 함께 사용하는 것이 가장 좋습니다.
LLM 선호도는 출력 순서와 같은 평범한 편견을 포함한 편향을 나타냅니다.
선호도를 선택할 때 "진실"이 고려되지 않을 수 있으며, 이는 유용성에 기반하지 않은 점수로 이어질 수 있습니다._