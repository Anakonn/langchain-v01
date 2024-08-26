---
translated: true
---

# Hugging Face ローカルパイプライン

Hugging Faceモデルは、`HuggingFacePipeline`クラスを使ってローカルで実行できます。

[Hugging Face Model Hub](https://huggingface.co/models)には、オープンソースで一般に公開されている12万を超えるモデル、2万を超えるデータセット、5万を超えるデモアプリ(Spaces)が集約されており、人々がMLを一緒に構築できるオンラインプラットフォームとなっています。

これらは、このローカルパイプラインラッパーを通して、またはHuggingFaceHubクラスを通してホストされているインファレンスエンドポイントを呼び出すことで、LangChainから呼び出すことができます。

使用するには、`transformers`Pythonパッケージ[インストール済み](https://pypi.org/project/transformers/)、および[PyTorch](https://pytorch.org/get-started/locally/)が必要です。また、メモリ効率の良いアテンション実装のために`xformer`もインストールできます。

```python
%pip install --upgrade --quiet  transformers --quiet
```

### モデルのロード

モデルは、`from_model_id`メソッドを使ってモデルパラメータを指定することでロードできます。

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

hf = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    pipeline_kwargs={"max_new_tokens": 10},
)
```

また、既存の`transformers`パイプラインを直接渡すこともできます。

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

model_id = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10)
hf = HuggingFacePipeline(pipeline=pipe)
```

### チェーンの作成

モデルをメモリにロードしたら、プロンプトと組み合わせてチェーンを構成できます。

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### GPUインファレンス

GPUを搭載したマシンで実行する場合は、`device=n`パラメータを指定してモデルを指定したデバイスに配置できます。
デフォルトは`-1`でCPUインファレンスになります。

複数GPUがある場合やモデルが単一のGPUに収まらない場合は、`device_map="auto"`を指定できます。これには[Accelerate](https://huggingface.co/docs/accelerate/index)ライブラリが必要で、モデルの重みをどのように読み込むかを自動的に決定します。

*注意*: `device`と`device_map`は同時に指定しないでください。予期せぬ動作につながる可能性があります。

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    device=0,  # replace with device_map="auto" to use the accelerate library.
    pipeline_kwargs={"max_new_tokens": 10},
)

gpu_chain = prompt | gpu_llm

question = "What is electroencephalography?"

print(gpu_chain.invoke({"question": question}))
```

### バッチGPUインファレンス

GPUを搭載したデバイスで実行する場合は、バッチモードでGPUインファレンスを行うこともできます。

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="bigscience/bloom-1b7",
    task="text-generation",
    device=0,  # -1 for CPU
    batch_size=2,  # adjust as needed based on GPU map and model size.
    model_kwargs={"temperature": 0, "max_length": 64},
)

gpu_chain = prompt | gpu_llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = gpu_chain.batch(questions)
for answer in answers:
    print(answer)
```

### OpenVINOバックエンドでのインファレンス

OpenVINOでモデルをデプロイするには、`backend="openvino"`パラメータを指定してOpenVINOをバックエンドのインファレンスフレームワークとして使うことができます。

Intel GPUがある場合は、`model_kwargs={"device": "GPU"}`を指定してそのGPUでインファレンスを実行できます。

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

```python
ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

### ローカルのOpenVINOモデルでのインファレンス

[モデルをエクスポート](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export)してOpenVINO IR形式にし、ローカルのフォルダからモデルをロードすることも可能です。

```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

推論レイテンシーとモデルのフットプリントを減らすために、`--weight-format`を使って8ビットまたは4ビットの重み量子化を適用することをお勧めします。

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

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

アクティベーションの動的量子化とKV-キャッシュの量子化を有効にすることで、さらに推論速度の改善が得られます。これらのオプションは`ov_config`で有効にできます。

```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

詳細については、[OpenVINO LLMガイド](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)と[OpenVINO ローカルパイプラインノートブック](/docs/integrations/llms/openvino/)を参照してください。
