---
translated: true
---

# श्रृंखला उत्पादों की तुलना करना

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/examples/comparisons.ipynb)

मान लीजिए कि आपके पास दो अलग-अलग प्रोम्प्ट (या LLM) हैं। आप कैसे जान सकते हैं कि कौन सा "बेहतर" परिणाम उत्पन्न करेगा?

परिणाम को पसंद करने के लिए एक स्वचालित तरीका `PairwiseStringEvaluator` जैसे `PairwiseStringEvalChain`<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1) का उपयोग करना है। यह श्रृंखला एक LLM को प्रोम्प्ट करती है कि वह किस उत्पाद को पसंद करता है, दिए गए एक विशिष्ट इनपुट के आधार पर।

इस मूल्यांकन के लिए हमें 3 चीजों की आवश्यकता होगी:
1. एक मूल्यांकक
2. इनपुट डेटासेट
3. 2 (या अधिक) LLM, श्रृंखला या एजेंट की तुलना करने के लिए

फिर हम परिणामों को एकत्रित करेंगे ताकि पसंदीदा मॉडल का पता लगाया जा सके।

### चरण 1. मूल्यांकक बनाएं

इस उदाहरण में, आप gpt-4 का उपयोग करेंगे कि कौन सा उत्पाद पसंद किया जाता है।

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

eval_chain = load_evaluator("pairwise_string")
```

### चरण 2. डेटासेट का चयन करें

यदि आपके पास अपने LLM के वास्तविक उपयोग डेता हैं, तो आप एक प्रतिनिधि नमूना का उपयोग कर सकते हैं। अधिक उदाहरण अधिक विश्वसनीय परिणाम प्रदान करते हैं। हम यहां कुछ उदाहरण प्रश्नों का उपयोग करेंगे जिनके बारे में कोई व्यक्ति langchain का उपयोग करने के बारे में पूछ सकता है।

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

### चरण 3. तुलना करने के लिए मॉडल को परिभाषित करें

इस मामले में हम दो एजेंटों की तुलना करेंगे।

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

### चरण 4. प्रतिक्रियाएं उत्पन्न करें

हम मूल्यांकन करने से पहले प्रत्येक मॉडल के लिए उत्पादों को उत्पन्न करेंगे।

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

## चरण 5. जोड़ियों का मूल्यांकन करें

अब मूल्यांकन करने का समय है। प्रत्येक एजेंट प्रतिक्रिया के लिए, मूल्यांकन श्रृंखला को चलाएं ताकि यह चयन किया जा सके कि कौन सा उत्पाद पसंद किया जाता है (या टाई वापस करता है)।

इनपुट क्रम को यादृच्छिक रूप से चुनें ताकि यह कम हो जाए कि एक मॉडल केवल इसलिए पसंद किया जाता है क्योंकि यह पहले प्रस्तुत किया जाता है।

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

**वरीयताओं के अनुपात को प्रिंट करें।**

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

### आत्मविश्वास अंतराल का अनुमान लगाएं

परिणाम काफी स्पष्ट लगते हैं, लेकिन यदि आप इस बारे में बेहतर अंदाज़ा लगाना चाहते हैं कि मॉडल "A" (OpenAI Functions एजेंट) पसंदीदा मॉडल है, तो हम आत्मविश्वास अंतराल की गणना कर सकते हैं।

नीचे, विल्सन स्कोर का उपयोग करके आत्मविश्वास अंतराल का अनुमान लगाएं।

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

**p-मान को प्रिंट करें।**

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

<a name="cite_note-1"></a>_1. नोट: स्वचालित मूल्यांकन अभी भी एक खुला शोध विषय है और इसका उपयोग अन्य मूल्यांकन दृष्टिकोणों के साथ किया जाना चाहिए।
LLM वरीयताएं पूर्वाग्रह प्रदर्शित करती हैं, जिसमें बेनाल जैसे भी शामिल हैं कि उत्पादों का क्रम।
वरीयताओं को चुनते समय, "मूल सत्य" को ध्यान में नहीं रखा जा सकता है, जिससे स्कोर उपयोगिता में आधारित नहीं हो सकते हैं।_
