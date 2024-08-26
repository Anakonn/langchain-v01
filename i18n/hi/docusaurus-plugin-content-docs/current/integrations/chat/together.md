---
translated: true
---

# Together AI

[Together AI](https://www.together.ai/) एक API प्रदान करता है जो [50+ प्रमुख ओपन-सोर्स मॉडल](https://docs.together.ai/docs/inference-models) को कुछ लाइनों के कोड में क्वेरी करने की सुविधा देता है।

यह उदाहरण दिखाता है कि Together AI मॉडल के साथ बातचीत करने के लिए LangChain का उपयोग कैसे करें।

## Installation

```python
%pip install --upgrade langchain-together
```

## Environment

Together AI का उपयोग करने के लिए, आपको एक API कुंजी की आवश्यकता होगी जिसे आप यहां पा सकते हैं:
https://api.together.ai/settings/api-keys. इसे एक init param ``together_api_key`` के रूप में पास किया जा सकता है या पर्यावरण वेरिएबल ``TOGETHER_API_KEY`` के रूप में सेट किया जा सकता है।

## Example

```python
# Querying chat models with Together AI

from langchain_together import ChatTogether

# choose from our 50+ models here: https://docs.together.ai/docs/inference-models
chat = ChatTogether(
    # together_api_key="YOUR_API_KEY",
    model="meta-llama/Llama-3-70b-chat-hf",
)

# stream the response back from the model
for m in chat.stream("Tell me fun things to do in NYC"):
    print(m.content, end="", flush=True)

# if you don't want to do streaming, you can use the invoke method
# chat.invoke("Tell me fun things to do in NYC")
```

```python
# Querying code and language models with Together AI

from langchain_together import Together

llm = Together(
    model="codellama/CodeLlama-70b-Python-hf",
    # together_api_key="..."
)

print(llm.invoke("def bubble_sort(): "))
```
