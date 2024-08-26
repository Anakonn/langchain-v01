---
translated: true
---

# टुगेदर एआई

[टुगेदर एआई](https://www.together.ai/) कुछ लाइनों के कोड में [50+ प्रमुख ओपन-सोर्स मॉडल](https://docs.together.ai/docs/inference-models) को क्वेरी करने के लिए एक एपीआई प्रदान करता है।

यह उदाहरण बताता है कि टुगेदर एआई मॉडल के साथ बातचीत करने के लिए LangChain का उपयोग कैसे करें।

## इंस्टॉलेशन

```python
%pip install --upgrade langchain-together
```

## पर्यावरण

टुगेदर एआई का उपयोग करने के लिए, आपको एक एपीआई कुंजी की आवश्यकता होगी जो आपको यहाँ मिलेगी:
https://api.together.ai/settings/api-keys. इसे init param ``together_api_key`` के रूप में पास किया जा सकता है या environment variable ``TOGETHER_API_KEY`` के रूप में सेट किया जा सकता है।

## उदाहरण

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
