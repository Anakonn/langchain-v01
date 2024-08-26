---
translated: true
---

# MLXローカルパイプライン

MLXモデルは、`MLXPipeline`クラスを使ってローカルで実行できます。

[MLXコミュニティ](https://huggingface.co/mlx-community)には150以上のモデルがあり、すべてオープンソースでHugging Face Model Hubという、MLを簡単に共同で構築できるオンラインプラットフォームで公開されています。

これらは、このローカルパイプラインラッパーを通してLangChainから呼び出すことも、MLXPipelineクラスを通してホストされているインファレンスエンドポイントから呼び出すこともできます。mlxの詳細については、[examples repo](https://github.com/ml-explore/mlx-examples/tree/main/llms)のノートブックを参照してください。

使用するには、``mlx-lm``Pythonの[パッケージがインストール](https://pypi.org/project/mlx-lm/)されている必要があり、[transformers](https://pypi.org/project/transformers/)もインストールする必要があります。`huggingface_hub`もインストールできます。

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

### モデルのロード

`from_model_id`メソッドを使ってモデルパラメータを指定することで、モデルをロードできます。

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

pipe = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

また、既存の`transformers`パイプラインを直接渡してもロードできます。

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from mlx_lm import load

model, tokenizer = load("mlx-community/quantized-gemma-2b-it")
pipe = MLXPipeline(model=model, tokenizer=tokenizer)
```

### チェーンの作成

メモリにモデルがロードされたら、プロンプトと組み合わせてチェーンを構成できます。

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | pipe

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```
