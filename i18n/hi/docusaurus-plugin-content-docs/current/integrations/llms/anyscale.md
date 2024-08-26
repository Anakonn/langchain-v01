---
translated: true
---

# Anyscale

[Anyscale](https://www.anyscale.com/) एक पूरी तरह से प्रबंधित [Ray](https://www.ray.io/) प्लेटफॉर्म है, जिसके माध्यम से आप स्केलेबल AI और Python एप्लिकेशन बना, तैनात और प्रबंधित कर सकते हैं।

यह उदाहरण [Anyscale Endpoint](https://app.endpoints.anyscale.com/) के साथ LangChain का उपयोग करने के बारे में बताता है।

```python
ANYSCALE_API_BASE = "..."
ANYSCALE_API_KEY = "..."
ANYSCALE_MODEL_NAME = "..."
```

```python
import os

os.environ["ANYSCALE_API_BASE"] = ANYSCALE_API_BASE
os.environ["ANYSCALE_API_KEY"] = ANYSCALE_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import Anyscale
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = Anyscale(model_name=ANYSCALE_MODEL_NAME)
```

```python
llm_chain = prompt | llm
```

```python
question = "When was George Washington president?"

llm_chain.invoke({"question": question})
```

Ray के साथ, हम असिंक्रोनस कार्यान्वयन के बिना क्वेरी का वितरण कर सकते हैं। यह न केवल Anyscale LLM मॉडल पर लागू होता है, बल्कि ऐसे किसी भी अन्य Langchain LLM मॉडल पर भी लागू होता है जिनमें `_acall` या `_agenerate` कार्यान्वित नहीं है।

```python
prompt_list = [
    "When was George Washington president?",
    "Explain to me the difference between nuclear fission and fusion.",
    "Give me a list of 5 science fiction books I should read next.",
    "Explain the difference between Spark and Ray.",
    "Suggest some fun holiday ideas.",
    "Tell a joke.",
    "What is 2+2?",
    "Explain what is machine learning like I am five years old.",
    "Explain what is artifical intelligence.",
]
```

```python
import ray


@ray.remote(num_cpus=0.1)
def send_query(llm, prompt):
    resp = llm.invoke(prompt)
    return resp


futures = [send_query.remote(llm, prompt) for prompt in prompt_list]
results = ray.get(futures)
```
