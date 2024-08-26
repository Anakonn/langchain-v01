---
translated: true
---

# Transformateurs C

La bibliothèque [Transformateurs C](https://github.com/marella/ctransformers) fournit des liaisons Python pour les modèles GGML.

Cet exemple explique comment utiliser LangChain pour interagir avec les [modèles](https://github.com/marella/ctransformers#supported-models) `Transformateurs C`.

**Installer**

```python
%pip install --upgrade --quiet  ctransformers
```

**Charger le modèle**

```python
from langchain_community.llms import CTransformers

llm = CTransformers(model="marella/gpt-2-ggml")
```

**Générer du texte**

```python
print(llm.invoke("AI is going to"))
```

**Diffusion en continu**

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
