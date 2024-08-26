---
translated: true
---

# Transformadores C

La biblioteca [Transformadores C](https://github.com/marella/ctransformers) proporciona enlaces de Python para modelos GGML.

Este ejemplo explica cómo usar LangChain para interactuar con [modelos](https://github.com/marella/ctransformers#supported-models) `Transformadores C`.

**Instalar**

```python
%pip install --upgrade --quiet  ctransformers
```

**Cargar modelo**

```python
from langchain_community.llms import CTransformers

llm = CTransformers(model="marella/gpt-2-ggml")
```

**Generar texto**

```python
print(llm.invoke("AI is going to"))
```

**Transmisión**

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
