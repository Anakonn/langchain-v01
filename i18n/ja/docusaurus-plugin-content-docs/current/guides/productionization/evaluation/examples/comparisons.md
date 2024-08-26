---
translated: true
---

# 出力の比較

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/examples/comparisons.ipynb)

2つの異なるプロンプト(またはLLM)があるとします。どちらが「良い」結果を生成するかを知る方法はありますか?

好ましい設定を予測する自動化された方法の1つは、`PairwiseStringEvaluator`のようなものを使うことです。`PairwiseStringEvalChain`<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1)です。このチェーンは、特定の入力に対して、どの出力が好ましいかをLLMに選択させます。

この評価には、以下の3つが必要です:
1. 評価器
2. 入力データセット
3. 比較する2つ(またはそれ以上)のLLM、Chain、またはAgent

その後、結果を集計して、好ましいモデルを判断します。

### ステップ1. 評価器の作成

この例では、gpt-4を使って、どの出力が好ましいかを選択します。

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

eval_chain = load_evaluator("pairwise_string")
```

### ステップ2. データセットの選択

LLMの実際の使用データがある場合は、代表的なサンプルを使用できます。例が多いほど、より信頼性の高い結果が得られます。ここでは、langchainの使用方法に関する質問の例を使用します。

```python
from langchain.evaluation.loading import load_dataset

dataset = load_dataset("langchain-howto-queries")
```

```output
Found cached dataset parquet (/Users/wfh/.cache/huggingface/datasets/LangChainDatasets___parquet/LangChainDatasets--langchain-howto-queries-bbb748bbee7e77aa/0.0.0/14a00e99c0d15a23649d0db8944380ac81082d4b021f398733dd84f3a6c569a7)
```

```output
  0%|          | 0/1 [00:00<?, ?it/s]
```

### ステップ3. 比較するモデルの定義

ここでは2つのエージェントを比較します。

```python
from langchain.agents import AgentType, Tool, initialize_agent
from langchain_community.utilities import SerpAPIWrapper
from langchain_openai import ChatOpenAI

# Initialize the language model
# You can add your own OpenAI API key by adding openai_api_key="<your_api_key>"
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")

# Initialize the SerpAPIWrapper for search functionality
# Replace <your_api_key> in openai_api_key="<your_api_key>" with your actual SerpAPI key.
search = SerpAPIWrapper()

# Define a list of tools offered by the agent
tools = [
    Tool(
        name="Search",
        func=search.run,
        coroutine=search.arun,
        description="Useful when you need to answer questions about current events. You should ask targeted questions.",
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

### ステップ4. 応答の生成

評価する前に、各モデルの出力を生成します。

```python
import asyncio

from tqdm.notebook import tqdm

results = []
agents = [functions_agent, conversations_agent]
concurrency_level = 6  # How many concurrent agents to run. May need to decrease if OpenAI is rate limiting.

# We will only run the first 20 examples of this dataset to speed things up
# This will lead to larger confidence intervals downstream.
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

## ステップ5. ペアの評価

いよいよ結果を評価する時です。各エージェントの応答について、評価チェーンを実行し、どの出力が好ましいか(またはタイ)を選択します。

入力の順序をランダムに選択して、あるモデルが最初に提示されただけで好ましいと判断されるのを避けます。

```python
import random


def predict_preferences(dataset, results) -> list:
    preferences = []

    for example, (res_a, res_b) in zip(dataset, results):
        input_ = example["inputs"]
        # Flip a coin to reduce persistent position bias
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
            preferences.append(None)  # No preference
    return preferences
```

```python
preferences = predict_preferences(dataset, results)
```

**好ましさの比率を出力します。**

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

### 信頼区間の推定

結果はかなり明確ですが、「A」(OpenAI Functions Agent)が好ましいモデルであるという確信度をより高めるには、信頼区間を計算することができます。

以下では、Wilson scoreを使って信頼区間を推定します。

```python
from math import sqrt


def wilson_score_interval(
    preferences: list, which: str = "a", z: float = 1.96
) -> tuple:
    """Estimate the confidence interval using the Wilson score.

    See: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval
    for more details, including when to use it and when it should not be used.
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
        f'The "{name}" would be preferred between {low:.2%} and {high:.2%} percent of the time (with 95% confidence).'
    )
```

```output
The "OpenAI Functions Agent" would be preferred between 83.18% and 100.00% percent of the time (with 95% confidence).
The "Structured Chat Agent" would be preferred between 0.00% and 16.82% percent of the time (with 95% confidence).
```

**p値を出力します。**

```python
from scipy import stats

preferred_model = max(pref_ratios, key=pref_ratios.get)
successes = preferences.count(preferred_model)
n = len(preferences) - preferences.count(None)
p_value = stats.binom_test(successes, n, p=0.5, alternative="two-sided")
print(
    f"""The p-value is {p_value:.5f}. If the null hypothesis is true (i.e., if the selected eval chain actually has no preference between the models),
then there is a {p_value:.5%} chance of observing the {name_map.get(preferred_model)} be preferred at least {successes}
times out of {n} trials."""
)
```

```output
The p-value is 0.00000. If the null hypothesis is true (i.e., if the selected eval chain actually has no preference between the models),
then there is a 0.00038% chance of observing the OpenAI Functions Agent be preferred at least 19
times out of 19 trials.

/var/folders/gf/6rnp_mbx5914kx7qmmh7xzmw0000gn/T/ipykernel_15978/384907688.py:6: DeprecationWarning: 'binom_test' is deprecated in favour of 'binomtest' from version 1.7.0 and will be removed in Scipy 1.12.0.
  p_value = stats.binom_test(successes, n, p=0.5, alternative="two-sided")
```

<a name="cite_note-1"></a>_1. 注: 自動評価は研究の途上にあり、他の評価アプローチと併せて使用するのが最適です。
LLMの好ましさには偏りがあり、出力の順序のような単純なものも含まれます。
好ましさを選択する際、「真の値」が考慮されない可能性があり、効用に基づいた得点にならない可能性があります。_
