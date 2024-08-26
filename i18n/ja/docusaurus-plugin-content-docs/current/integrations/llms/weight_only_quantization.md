---
translated: true
---

# インテルの重みのみ量子化

## インテルエクステンションを使用したHuggingfaceモデルの重みのみ量子化

Hugging Faceモデルは、`WeightOnlyQuantPipeline`クラスを通じてローカルで重みのみの量子化を行うことができます。

[Hugging Face Model Hub](https://huggingface.co/models)には、120k以上のモデル、20kのデータセット、50kのデモアプリ（Spaces）があり、すべてオープンソースで公開されており、人々が簡単に協力してMLを構築できるオンラインプラットフォームです。

これらは、このローカルパイプラインラッパークラスを通じてLangChainから呼び出すことができます。

使用するには、``transformers`` Python [パッケージをインストール](https://pypi.org/project/transformers/)するとともに、[pytorch](https://pytorch.org/get-started/locally/)、[intel-extension-for-transformers](https://github.com/intel/intel-extension-for-transformers)もインストールしている必要があります。

```python
%pip install transformers --quiet
%pip install intel-extension-for-transformers
```

### モデルの読み込み

モデルは、`from_model_id`メソッドを使用してモデルパラメータを指定することで読み込むことができます。モデルパラメータには、intel_extension_for_transformersの`WeightOnlyQuantConfig`クラスが含まれます。

```python
from intel_extension_for_transformers.transformers import WeightOnlyQuantConfig
from langchain_community.llms.weight_only_quantization import WeightOnlyQuantPipeline

conf = WeightOnlyQuantConfig(weight_dtype="nf4")
hf = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)
```

既存の`transformers`パイプラインを直接渡すことで読み込むこともできます

```python
from intel_extension_for_transformers.transformers import AutoModelForSeq2SeqLM
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoTokenizer, pipeline

model_id = "google/flan-t5-large"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
pipe = pipeline(
    "text2text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10
)
hf = WeightOnlyQuantPipeline(pipeline=pipe)
```

### チェーンの作成

メモリにモデルを読み込んだら、プロンプトと組み合わせてチェーンを作成することができます。

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### CPU推論

現在、intel-extension-for-transformersはCPUデバイス推論のみをサポートしています。近日中にインテルGPUもサポート予定です。CPUを搭載したマシンで実行する場合、`device="cpu"`または`device=-1`パラメータを指定してモデルをCPUデバイスに置くことができます。
デフォルトではCPU推論のために`-1`に設定されています。

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### バッチCPU推論

CPUでバッチモードで推論を実行することもできます。

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

chain = prompt | llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = chain.batch(questions)
for answer in answers:
    print(answer)
```

### Intel-extension-for-transformersでサポートされているデータ型

以下のデータ型に重みを量子化して保存することをサポートしています（WeightOnlyQuantConfigのweight_dtype）：

* **int8**: 8ビットデータ型を使用します。
* **int4_fullrange**: 通常のint4範囲[-7,7]と比較してint4範囲の-8値を使用します。
* **int4_clip**: int4範囲内の値をクリップして保持し、その他の値をゼロに設定します。
* **nf4**: 正規化されたフロート4ビットデータ型を使用します。
* **fp4_e2m1**: 通常のフロート4ビットデータ型を使用します。「e2」は指数に2ビットが使用され、「m1」は仮数に1ビットが使用されることを意味します。

これらの技術は4ビットまたは8ビットで重みを保存しますが、計算はfloat32、bfloat16、またはint8（WeightOnlyQuantConfigのcompute_dtype）で行われます：
* **fp32**: float32データ型を使用して計算します。
* **bf16**: bfloat16データ型を使用して計算します。
* **int8**: 8ビットデータ型を使用して計算します。

### サポートされているアルゴリズムマトリックス

intel-extension-for-transformersでサポートされている量子化アルゴリズム（WeightOnlyQuantConfigのalgorithm）：

| アルゴリズム |   PyTorch  |    LLM Runtime    |
|:--------------:|:----------:|:----------:|
|       RTN      |  &#10004;  |  &#10004;  |
|       AWQ      |  &#10004;  | 乞うご期待 |
|      TEQ      | &#10004; | 乞うご期待 |
> **RTN:** 非常に直感的に考えることができる量子化方法です。追加のデータセットを必要とせず、非常に高速な量子化方法です。一般に、RTNは重みを均一に分布した整数データ型に変換しますが、Qloraのようなアルゴリズムでは、非均一なNF4データ型を提案し、その理論的最適性を証明しています。

> **AWQ:** 重要な重みの1%を保護するだけで、量子化誤差を大幅に減少させることが証明されています。重要な重みチャネルは、チャネルごとのアクティベーションと重みの分布を観察することで選択されます。重要な重みも、量子化前に大きなスケールファクターを掛けて量子化され、保存されます。

> **TEQ:** 重みのみの量子化においてFP32精度を維持するトレーニング可能な等価変換です。AWQにインスパイアされており、アクティベーションと重みの間の最適なチャネルごとのスケーリングファクターを検索する新しいソリューションを提供します。
