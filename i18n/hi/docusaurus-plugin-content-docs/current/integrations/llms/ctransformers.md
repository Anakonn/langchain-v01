---
translated: true
---

# C Transformers

[C Transformers](https://github.com/marella/ctransformers) पुस्तकालय GGML मॉडल के लिए Python बाइंडिंग प्रदान करता है।

यह उदाहरण `C Transformers` [मॉडल](https://github.com/marella/ctransformers#supported-models) के साथ LangChain का उपयोग करने के बारे में बताता है।

**इंस्टॉल करें**

```python
%pip install --upgrade --quiet  ctransformers
```

**मॉडल लोड करें**

```python
from langchain_community.llms import CTransformers

llm = CTransformers(model="marella/gpt-2-ggml")
```

**टेक्स्ट जनरेट करें**

```python
print(llm.invoke("AI is going to"))
```

**स्ट्रीमिंग**

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm = CTransformers(
    model="marella/gpt-2-ggml", callbacks=[StreamingStdOutCallbackHandler()]
)

response = llm.invoke("AI is going to")
```

**LLMChain**

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

response = llm_chain.run("What is AI?")
```
