---
translated: true
---

# C Transformers

[C Transformers](https://github.com/marella/ctransformers) 라이브러리는 GGML 모델에 대한 Python 바인딩을 제공합니다.

이 예제에서는 `C Transformers` [모델](https://github.com/marella/ctransformers#supported-models)과 상호 작용하는 방법을 살펴봅니다.

**설치**

```python
%pip install --upgrade --quiet  ctransformers
```

**모델 로드**

```python
from langchain_community.llms import CTransformers

llm = CTransformers(model="marella/gpt-2-ggml")
```

**텍스트 생성**

```python
print(llm.invoke("AI is going to"))
```

**스트리밍**

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
