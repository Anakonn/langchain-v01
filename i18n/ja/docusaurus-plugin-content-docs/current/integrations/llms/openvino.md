---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino)は、AIインファレンスを最適化およびデプロイするためのオープンソースツールキットです。OpenVINO™ Runtimeは、同じモデルを最適化して様々なハードウェア[デバイス](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix)で実行できるようにします。言語 + LLM、コンピュータービジョン、自動音声認識など、さまざまなユースケースでディープラーニングのパフォーマンスを高速化できます。

OpenVINOモデルは、`HuggingFacePipeline`[クラス](https://python.langchain.com/docs/integrations/llms/huggingface_pipeline)を使ってローカルで実行できます。OpenVINOをバックエンドのインファレンスフレームワークとして使用するには、`backend="openvino"`パラメーターを指定してモデルをデプロイできます。

使用するには、``optimum-intel``にOpenVINOアクセラレーターのPythonパッケージがインストールされている必要があります。[パッケージのインストール](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#installation)が必要です。

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

### モデルのロード

`from_model_id`メソッドを使ってモデルパラメーターを指定することでモデルをロードできます。

Intel GPUをお持ちの場合は、`model_kwargs={"device": "GPU"}`を指定してGPU上でインファレンスを実行できます。

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)
```

また、既存の[`optimum-intel`](https://huggingface.co/docs/optimum/main/en/intel/inference)パイプラインを直接渡してモデルをロードすることもできます。

```python
from optimum.intel.openvino import OVModelForCausalLM
from transformers import AutoTokenizer, pipeline

model_id = "gpt2"
device = "CPU"
tokenizer = AutoTokenizer.from_pretrained(model_id)
ov_model = OVModelForCausalLM.from_pretrained(
    model_id, export=True, device=device, ov_config=ov_config
)
ov_pipe = pipeline(
    "text-generation", model=ov_model, tokenizer=tokenizer, max_new_tokens=10
)
ov_llm = HuggingFacePipeline(pipeline=ov_pipe)
```

### チェーンの作成

メモリにモデルをロードしたら、プロンプトと組み合わせてチェーンを構築できます。

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### ローカルOpenVINOモデルでのインファレンス

OpenVINO IR形式でモデルをエクスポートし、ローカルフォルダからモデルをロードすることができます。[モデルのエクスポート](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export)が可能です。

```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

インファレンスの待ち時間とモデルのフットプリントを減らすために、`--weight-format`を使って8ビットまたは4ビットの重み量子化を適用することをお勧めします。

```python
!optimum-cli export openvino --model gpt2  --weight-format int8 ov_model_dir # for 8-bit quantization

!optimum-cli export openvino --model gpt2  --weight-format int4 ov_model_dir # for 4-bit quantization
```

```python
ov_llm = HuggingFacePipeline.from_model_id(
    model_id="ov_model_dir",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

アクティベーションの動的量子化とKV-キャッシュの量子化を有効にすることで、さらにインファレンススピードを向上させることができます。これらのオプションは`ov_config`で有効にできます。

```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

詳細については以下をご参照ください:

* [OpenVINO LLMガイド](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)
* [OpenVINOドキュメンテーション](https://docs.openvino.ai/2024/home.html)
* [OpenVINO入門ガイド](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html)
* [LangChainを使ったRAGノートブック](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain)
