---
sidebar_position: 3
translated: true
---

# कम-शॉट प्रॉम्प्ट टेम्प्लेट

इस ट्यूटोरियल में, हम सीखेंगे कि कैसे कम-शॉट उदाहरणों का उपयोग करके एक प्रॉम्प्ट टेम्प्लेट बनाया जाए। एक कम-शॉट प्रॉम्प्ट टेम्प्लेट को या तो उदाहरणों के एक सेट से या फिर एक उदाहरण चयनकर्ता ऑब्जेक्ट से बनाया जा सकता है।

### उपयोग मामला

इस ट्यूटोरियल में, हम खोज के साथ स्वयं-पूछने के लिए कम-शॉट उदाहरण कॉन्फ़िगर करेंगे।

## एक उदाहरण सेट का उपयोग करना

### उदाहरण सेट बनाएं

शुरू करने के लिए, कम-शॉट उदाहरणों की एक सूची बनाएं। प्रत्येक उदाहरण एक डिक्शनरी होना चाहिए, जिसमें इनपुट चर होते हैं और उनके मान होते हैं।

```python
from langchain_core.prompts.few_shot import FewShotPromptTemplate
from langchain_core.prompts.prompt import PromptTemplate

examples = [
    {
        "question": "Who lived longer, Muhammad Ali or Alan Turing?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: How old was Muhammad Ali when he died?
Intermediate answer: Muhammad Ali was 74 years old when he died.
Follow up: How old was Alan Turing when he died?
Intermediate answer: Alan Turing was 41 years old when he died.
So the final answer is: Muhammad Ali
""",
    },
    {
        "question": "When was the founder of craigslist born?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who was the founder of craigslist?
Intermediate answer: Craigslist was founded by Craig Newmark.
Follow up: When was Craig Newmark born?
Intermediate answer: Craig Newmark was born on December 6, 1952.
So the final answer is: December 6, 1952
""",
    },
    {
        "question": "Who was the maternal grandfather of George Washington?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball
""",
    },
    {
        "question": "Are both the directors of Jaws and Casino Royale from the same country?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who is the director of Jaws?
Intermediate Answer: The director of Jaws is Steven Spielberg.
Follow up: Where is Steven Spielberg from?
Intermediate Answer: The United States.
Follow up: Who is the director of Casino Royale?
Intermediate Answer: The director of Casino Royale is Martin Campbell.
Follow up: Where is Martin Campbell from?
Intermediate Answer: New Zealand.
So the final answer is: No
""",
    },
]
```

### कम-शॉट उदाहरणों के लिए एक फॉर्मैटर बनाएं

एक फॉर्मैटर कॉन्फ़िगर करें जो कम-शॉट उदाहरणों को एक स्ट्रिंग में फॉर्मैट करेगा। यह फॉर्मैटर एक `PromptTemplate` ऑब्जेक्ट होना चाहिए।

```python
example_prompt = PromptTemplate(
    input_variables=["question", "answer"], template="Question: {question}\n{answer}"
)

print(example_prompt.format(**examples[0]))
```

```output
Question: Who lived longer, Muhammad Ali or Alan Turing?

Are follow up questions needed here: Yes.
Follow up: How old was Muhammad Ali when he died?
Intermediate answer: Muhammad Ali was 74 years old when he died.
Follow up: How old was Alan Turing when he died?
Intermediate answer: Alan Turing was 41 years old when he died.
So the final answer is: Muhammad Ali
```

### उदाहरण और फॉर्मैटर को `FewShotPromptTemplate` में डालें

अंत में, एक `FewShotPromptTemplate` ऑब्जेक्ट बनाएं। यह ऑब्जेक्ट कम-शॉट उदाहरणों और कम-शॉट उदाहरणों के लिए फॉर्मैटर को लेता है।

```python
prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    suffix="Question: {input}",
    input_variables=["input"],
)

print(prompt.format(input="Who was the father of Mary Ball Washington?"))
```

```output
Question: Who lived longer, Muhammad Ali or Alan Turing?

Are follow up questions needed here: Yes.
Follow up: How old was Muhammad Ali when he died?
Intermediate answer: Muhammad Ali was 74 years old when he died.
Follow up: How old was Alan Turing when he died?
Intermediate answer: Alan Turing was 41 years old when he died.
So the final answer is: Muhammad Ali


Question: When was the founder of craigslist born?

Are follow up questions needed here: Yes.
Follow up: Who was the founder of craigslist?
Intermediate answer: Craigslist was founded by Craig Newmark.
Follow up: When was Craig Newmark born?
Intermediate answer: Craig Newmark was born on December 6, 1952.
So the final answer is: December 6, 1952


Question: Who was the maternal grandfather of George Washington?

Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball


Question: Are both the directors of Jaws and Casino Royale from the same country?

Are follow up questions needed here: Yes.
Follow up: Who is the director of Jaws?
Intermediate Answer: The director of Jaws is Steven Spielberg.
Follow up: Where is Steven Spielberg from?
Intermediate Answer: The United States.
Follow up: Who is the director of Casino Royale?
Intermediate Answer: The director of Casino Royale is Martin Campbell.
Follow up: Where is Martin Campbell from?
Intermediate Answer: New Zealand.
So the final answer is: No


Question: Who was the father of Mary Ball Washington?
```

## एक उदाहरण चयनकर्ता का उपयोग करना

### उदाहरण को `ExampleSelector` में डालें

हम पिछले खंड से उदाहरण सेट और फॉर्मैटर का पुनः उपयोग करेंगे। हालांकि, उदाहरणों को सीधे `FewShotPromptTemplate` ऑब्जेक्ट में नहीं डालेंगे, बल्कि उन्हें एक `ExampleSelector` ऑब्जेक्ट में डालेंगे।

इस ट्यूटोरियल में, हम `SemanticSimilarityExampleSelector` क्लास का उपयोग करेंगे। यह क्लास इनपुट से कम-शॉट उदाहरणों की समानता के आधार पर कम-शॉट उदाहरण चुनती है। यह एक एम्बेडिंग मॉडल का उपयोग करके इनपुट और कम-शॉट उदाहरणों के बीच समानता की गणना करती है, साथ ही एक वेक्टर स्टोर का उपयोग करके नजदीकी पड़ोसी खोज भी करती है।

```python
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

example_selector = SemanticSimilarityExampleSelector.from_examples(
    # This is the list of examples available to select from.
    examples,
    # This is the embedding class used to produce embeddings which are used to measure semantic similarity.
    OpenAIEmbeddings(),
    # This is the VectorStore class that is used to store the embeddings and do a similarity search over.
    Chroma,
    # This is the number of examples to produce.
    k=1,
)

# Select the most similar example to the input.
question = "Who was the father of Mary Ball Washington?"
selected_examples = example_selector.select_examples({"question": question})
print(f"Examples most similar to the input: {question}")
for example in selected_examples:
    print("\n")
    for k, v in example.items():
        print(f"{k}: {v}")
```

```output
Examples most similar to the input: Who was the father of Mary Ball Washington?


answer:
Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball

question: Who was the maternal grandfather of George Washington?
```

### उदाहरण चयनकर्ता को `FewShotPromptTemplate` में डालें

अंत में, एक `FewShotPromptTemplate` ऑब्जेक्ट बनाएं। यह ऑब्जेक्ट उदाहरण चयनकर्ता और कम-शॉट उदाहरणों के लिए फॉर्मैटर को लेता है।

```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    suffix="Question: {input}",
    input_variables=["input"],
)

print(prompt.format(input="Who was the father of Mary Ball Washington?"))
```

```output
Question: Who was the maternal grandfather of George Washington?

Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball


Question: Who was the father of Mary Ball Washington?
```
