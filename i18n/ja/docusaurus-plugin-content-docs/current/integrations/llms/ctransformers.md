---
translated: true
---

# C Transformers

[C Transformers](https://github.com/marella/ctransformers)ライブラリは、GGMLモデルのPythonバインディングを提供します。

この例では、`C Transformers`[モデル](https://github.com/marella/ctransformers#supported-models)とのやり取りにLangChainを使う方法について説明します。

**インストール**

```python
%pip install --upgrade --quiet  ctransformers
```

**モデルの読み込み**

```python
from langchain_community.llms import CTransformers

llm = CTransformers(model="marella/gpt-2-ggml")
```

**テキストの生成**

```python
print(llm.invoke("AI is going to"))
```

**ストリーミング**

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
