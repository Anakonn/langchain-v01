---
translated: true
---

# vLLM

[vLLM](https://vllm.readthedocs.io/en/latest/index.html)は、LLMのインファレンスとサービングのための高速で使いやすいライブラリで、以下の機能を提供しています:

* 最先端のサービングスループット
* PagedAttentionを使った効率的な注意キーとメモリ管理
* 着信リクエストの連続バッチ処理
* 最適化されたCUDAカーネル

このノートブックでは、langchainとvLLMを使ってLLMを使う方法を説明します。

使用するには、`vllm`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  vllm -q
```

```python
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-7b",
    trust_remote_code=True,  # mandatory for hf models
    max_new_tokens=128,
    top_k=10,
    top_p=0.95,
    temperature=0.8,
)

print(llm.invoke("What is the capital of France ?"))
```

```output
INFO 08-06 11:37:33 llm_engine.py:70] Initializing an LLM engine with config: model='mosaicml/mpt-7b', tokenizer='mosaicml/mpt-7b', tokenizer_mode=auto, trust_remote_code=True, dtype=torch.bfloat16, use_dummy_weights=False, download_dir=None, use_np_weights=False, tensor_parallel_size=1, seed=0)
INFO 08-06 11:37:41 llm_engine.py:196] # GPU blocks: 861, # CPU blocks: 512

Processed prompts: 100%|██████████| 1/1 [00:00<00:00,  2.00it/s]


What is the capital of France ? The capital of France is Paris.


```

## LLMChainにモデルを統合する

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "Who was the US president in the year the first Pokemon game was released?"

print(llm_chain.invoke(question))
```

```output
Processed prompts: 100%|██████████| 1/1 [00:01<00:00,  1.34s/it]



1. The first Pokemon game was released in 1996.
2. The president was Bill Clinton.
3. Clinton was president from 1993 to 2001.
4. The answer is Clinton.


```

## 分散インファレンス

vLLMは、分散テンソー並列インファレンスとサービングをサポートしています。

LLMクラスで多GPU推論を実行するには、`tensor_parallel_size`引数を使用するGPUの数に設定します。例えば、4 GPUで推論を実行するには

```python
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-30b",
    tensor_parallel_size=4,
    trust_remote_code=True,  # mandatory for hf models
)

llm.invoke("What is the future of AI?")
```

## 量子化

vLLMは`awq`量子化をサポートしています。これを有効にするには、`vllm_kwargs`に`quantization`を渡します。

```python
llm_q = VLLM(
    model="TheBloke/Llama-2-7b-Chat-AWQ",
    trust_remote_code=True,
    max_new_tokens=512,
    vllm_kwargs={"quantization": "awq"},
)
```

## OpenAI互換サーバー

vLLMは、OpenAI APIプロトコルを模倣するサーバーとしてデプロイできます。これにより、vLLMをOpenAI APIを使用するアプリケーションの代替品として使用できます。

このサーバーは、OpenAI APIと同じ形式で照会できます。

### OpenAI互換の完成

```python
from langchain_community.llms import VLLMOpenAI

llm = VLLMOpenAI(
    openai_api_key="EMPTY",
    openai_api_base="http://localhost:8000/v1",
    model_name="tiiuae/falcon-7b",
    model_kwargs={"stop": ["."]},
)
print(llm.invoke("Rome is"))
```

```output
 a city that is filled with history, ancient buildings, and art around every corner
```
