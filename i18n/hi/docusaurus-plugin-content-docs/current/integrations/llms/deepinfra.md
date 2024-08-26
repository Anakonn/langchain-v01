---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain) एक सर्वरलेस अनुमान सेवा है जो [विभिन्न एलएलएम](https://deepinfra.com/models?utm_source=langchain) और [एम्बेडिंग मॉडल](https://deepinfra.com/models?type=embeddings&utm_source=langchain) तक पहुंच प्रदान करता है। यह नोटबुक LangChain का उपयोग करके DeepInfra के साथ भाषा मॉडल का उपयोग करने के बारे में बताता है।

## वातावरण API कुंजी सेट करें

सुनिश्चित करें कि आप DeepInfra से अपना API कुंजी प्राप्त करें। आपको [लॉगिन](https://deepinfra.com/login?from=%2Fdash) करना और एक नया टोकन प्राप्त करना होगा।

आपको परीक्षण के लिए 1 घंटे का मुफ्त सर्वरलेस जीपीयू कंप्यूट दिया जाता है। (देखें [यहां](https://github.com/deepinfra/deepctl#deepctl)))
आप `deepctl auth token` के साथ अपना टोकन प्रिंट कर सकते हैं।

```python
# get a new token: https://deepinfra.com/login?from=%2Fdash

from getpass import getpass

DEEPINFRA_API_TOKEN = getpass()
```

```output
 ········
```

```python
import os

os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN
```

## DeepInfra इंस्टेंस बनाएं

आप हमारे ओपन-सोर्स [deepctl टूल](https://github.com/deepinfra/deepctl#deepctl) का भी उपयोग कर सकते हैं अपने मॉडल तैनाती का प्रबंधन करने के लिए। आप उपलब्ध पैरामीटरों की सूची [यहां](https://deepinfra.com/databricks/dolly-v2-12b#API) देख सकते हैं।

```python
from langchain_community.llms import DeepInfra

llm = DeepInfra(model_id="meta-llama/Llama-2-70b-chat-hf")
llm.model_kwargs = {
    "temperature": 0.7,
    "repetition_penalty": 1.2,
    "max_new_tokens": 250,
    "top_p": 0.9,
}
```

```python
# run inferences directly via wrapper
llm("Who let the dogs out?")
```

```output
'This is a question that has puzzled many people'
```

```python
# run streaming inference
for chunk in llm.stream("Who let the dogs out?"):
    print(chunk)
```

```output
 Will
 Smith
.
```

## एक प्रॉम्प्ट टेम्प्लेट बनाएं

हम प्रश्न और उत्तर के लिए एक प्रॉम्प्ट टेम्प्लेट बनाएंगे।

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## LLMChain प्रारंभ करें

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## LLMChain चलाएं

एक प्रश्न प्रदान करें और LLMChain चलाएं।

```python
question = "Can penguins reach the North pole?"

llm_chain.run(question)
```

```output
"Penguins are found in Antarctica and the surrounding islands, which are located at the southernmost tip of the planet. The North Pole is located at the northernmost tip of the planet, and it would be a long journey for penguins to get there. In fact, penguins don't have the ability to fly or migrate over such long distances. So, no, penguins cannot reach the North Pole. "
```
