---
translated: true
---

# IPEX-LLM

> [IPEX-LLM](https://github.com/intel-analytics/ipex-llm/)は、Intel CPUおよびGPU(例えば、iGPU付きのローカルPC、Arc、Flex、Maxなどの個別GPU)で低レイテンシーでLLMを実行するためのPyTorchライブラリです。

このサンプルでは、`ipex-llm`を使ってLangChainでテキスト生成を行う方法を説明します。

## セットアップ

```python
# Update Langchain

%pip install -qU langchain langchain-community
```

Intel CPUでLLMsを実行するためのIPEX-LLMをインストールします。

```python
%pip install --pre --upgrade ipex-llm[all]
```

## 基本的な使い方

```python
import warnings

from langchain.chains import LLMChain
from langchain_community.llms import IpexLLM
from langchain_core.prompts import PromptTemplate

warnings.filterwarnings("ignore", category=UserWarning, message=".*padding_mask.*")
```

モデルのプロンプトテンプレートを指定します。この例では[vicuna-1.5](https://huggingface.co/lmsys/vicuna-7b-v1.5)モデルを使用しています。別のモデルを使用する場合は、適切なテンプレートを選択してください。

```python
template = "USER: {question}\nASSISTANT:"
prompt = PromptTemplate(template=template, input_variables=["question"])
```

`IpexLLM.from_model_id`を使ってローカルにモデルをロードします。これにより、Hugging Faceフォーマットのモデルが直接ロードされ、自動的に低ビット形式に変換されます。

```python
llm = IpexLLM.from_model_id(
    model_id="lmsys/vicuna-7b-v1.5",
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

Chainsで使用します:

```python
llm_chain = prompt | llm

question = "What is AI?"
output = llm_chain.invoke(question)
```

## 低ビットモデルの保存/ロード

代替として、一度低ビットモデルをディスクに保存し、`from_model_id_low_bit`を使って後で再ロードすることもできます。これは、元のモデルに比べてディスク容量が大幅に小さくなるため、スペース効率的です。また、モデル変換の手順がスキップされるため、`from_model_id_low_bit`は速度とメモリ使用量の面でも効率的です。

低ビットモデルを保存するには、以下のように`save_low_bit`を使います。

```python
saved_lowbit_model_path = "./vicuna-7b-1.5-low-bit"  # path to save low-bit model
llm.model.save_low_bit(saved_lowbit_model_path)
del llm
```

保存した低ビットモデルのパスからモデルをロードします。
> 注意: 低ビットモデルの保存パスには、モデル自体は含まれますが、トークナイザーは含まれていません。すべてを1か所に置きたい場合は、元のモデルのディレクトリからトークナイザーファイルを手動でダウンロードまたはコピーする必要があります。

```python
llm_lowbit = IpexLLM.from_model_id_low_bit(
    model_id=saved_lowbit_model_path,
    tokenizer_id="lmsys/vicuna-7b-v1.5",
    # tokenizer_name=saved_lowbit_model_path,  # copy the tokenizers to saved path if you want to use it this way
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

ロードしたモデルをChainsで使用します:

```python
llm_chain = prompt | llm_lowbit


question = "What is AI?"
output = llm_chain.invoke(question)
```
