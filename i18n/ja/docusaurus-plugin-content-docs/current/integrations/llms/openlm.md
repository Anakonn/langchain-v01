---
translated: true
---

# OpenLM

[OpenLM](https://github.com/r2d4/openlm) は、さまざまな推論エンドポイントを直接 HTTP 経由で呼び出すことができる、ゼロ依存の OpenAI 互換 LLM プロバイダーです。

OpenAI 完了クラスを実装しているため、OpenAI API の drop-in 置き換えとして使用できます。このチェンジセットでは、追加コードを最小限に抑えるために BaseOpenAI を使用しています。

この例では、LangChain を使用して OpenAI と HuggingFace の両方と対話する方法を説明します。両方の API キーが必要です。

### セットアップ

依存関係をインストールし、API キーを設定します。

```python
# Uncomment to install openlm and openai if you haven't already

%pip install --upgrade --quiet  openlm
%pip install --upgrade --quiet  langchain-openai
```

```python
import os
from getpass import getpass

# Check if OPENAI_API_KEY environment variable is set
if "OPENAI_API_KEY" not in os.environ:
    print("Enter your OpenAI API key:")
    os.environ["OPENAI_API_KEY"] = getpass()

# Check if HF_API_TOKEN environment variable is set
if "HF_API_TOKEN" not in os.environ:
    print("Enter your HuggingFace Hub API key:")
    os.environ["HF_API_TOKEN"] = getpass()
```

### LangChain を使用した OpenLM の使用

ここでは、OpenAI の `text-davinci-003` モデルと HuggingFace の `gpt2` モデルの 2 つのモデルを LLMChain で呼び出します。

```python
from langchain.chains import LLMChain
from langchain_community.llms import OpenLM
from langchain_core.prompts import PromptTemplate
```

```python
question = "What is the capital of France?"
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

for model in ["text-davinci-003", "huggingface.co/gpt2"]:
    llm = OpenLM(model=model)
    llm_chain = LLMChain(prompt=prompt, llm=llm)
    result = llm_chain.run(question)
    print(
        """Model: {}
Result: {}""".format(model, result)
    )
```

```output
Model: text-davinci-003
Result:  France is a country in Europe. The capital of France is Paris.
Model: huggingface.co/gpt2
Result: Question: What is the capital of France?

Answer: Let's think step by step. I am not going to lie, this is a complicated issue, and I don't see any solutions to all this, but it is still far more
```
