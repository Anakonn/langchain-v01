---
translated: true
---

# DeepSparse

このページでは、LangChain 内の [DeepSparse](https://github.com/neuralmagic/deepsparse) inference runtime の使用方法について説明します。
インストールとセットアップ、DeepSparse の使用例の 2 つの部分に分かれています。

## インストールとセットアップ

- `pip install deepsparse` でPythonパッケージをインストールします
- [SparseZoo モデル](https://sparsezoo.neuralmagic.com/?useCase=text_generation) を選択するか、[Optimum を使用](https://github.com/neuralmagic/notebooks/blob/main/notebooks/opt-text-generation-deepsparse-quickstart/OPT_Text_Generation_DeepSparse_Quickstart.md) してサポートされているモデルを ONNX にエクスポートします

DeepSparse LLM ラッパーが用意されており、すべてのモデルに対して統一されたインターフェイスを提供します:

```python
from langchain_community.llms import DeepSparse

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none"
)

print(llm.invoke("def fib():"))
```

`config` パラメーターを使用して、追加のパラメーターを渡すことができます:

```python
config = {"max_generated_tokens": 256}

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none",
    config=config,
)
```
