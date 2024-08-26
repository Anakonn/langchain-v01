---
translated: true
---

# タイタンの離陸

`TitanML`は、トレーニング、圧縮、推論最適化プラットフォームを通じて、より優れた、より小さい、より安価、より高速なNLPモデルを企業が構築およびデプロイできるようサポートしています。

私たちの推論サーバー、[Titan Takeoff](https://docs.titanml.co/docs/intro)は、単一のコマンドでハードウェアにローカルにLLMをデプロイできます。Falcon、Llama 2、GPT2、T5など、ほとんどの生成モデルアーキテクチャがサポートされています。特定のモデルで問題が発生した場合は、hello@titanml.coまでご連絡ください。

## 使用例

Titan Takeoff Serverの使用を開始するための便利な例をいくつか紹介します。これらのコマンドを実行する前に、Takeoffサーバーがバックグラウンドで起動していることを確認する必要があります。詳細については、[Takeoffの起動に関するドキュメントページ](https://docs.titanml.co/docs/Docs/launching/)を参照してください。

```python
import time

from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# Note importing TitanTakeoffPro instead of TitanTakeoff will work as well both use same object under the hood
from langchain_community.llms import TitanTakeoff
from langchain_core.prompts import PromptTemplate
```

### 例1

Takeoffがデフォルトのポート(つまりlocalhost:3000)で実行されていることを前提とした基本的な使用方法です。

```python
llm = TitanTakeoff()
output = llm.invoke("What is the weather in London in August?")
print(output)
```

### 例2

ポートや他の生成パラメーターを指定する方法

```python
llm = TitanTakeoff(port=3000)
# A comprehensive list of parameters can be found at https://docs.titanml.co/docs/next/apis/Takeoff%20inference_REST_API/generate#request
output = llm.invoke(
    "What is the largest rainforest in the world?",
    consumer_group="primary",
    min_new_tokens=128,
    max_new_tokens=512,
    no_repeat_ngram_size=2,
    sampling_topk=1,
    sampling_topp=1.0,
    sampling_temperature=1.0,
    repetition_penalty=1.0,
    regex_string="",
    json_schema=None,
)
print(output)
```

### 例3

複数の入力を使用してgenerateする方法

```python
llm = TitanTakeoff()
rich_output = llm.generate(["What is Deep Learning?", "What is Machine Learning?"])
print(rich_output.generations)
```

### 例4

ストリーミング出力の使用方法

```python
llm = TitanTakeoff(
    streaming=True, callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
prompt = "What is the capital of France?"
output = llm.invoke(prompt)
print(output)
```

### 例5

LCELの使用方法

```python
llm = TitanTakeoff()
prompt = PromptTemplate.from_template("Tell me about {topic}")
chain = prompt | llm
output = chain.invoke({"topic": "the universe"})
print(output)
```

### 例6

TitanTakeoffPythonラッパーを使用してリーダーを起動する方法。Takeoffを最初に起動していないか、別のリーダーを追加したい場合は、TitanTakeoffオブジェクトを初期化する際に`models`パラメーターとしてモデル構成のリストを渡すことで行えます。

```python
# Model config for the llama model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
#   tensor_parallel (Optional[int]): The number of gpus you would like your model to be split across
#   max_seq_length (int): The maximum sequence length to use for inference, defaults to 512
#   max_batch_size (int_: The max batch size for continuous batching of requests
llama_model = {
    "model_name": "TheBloke/Llama-2-7b-Chat-AWQ",
    "device": "cuda",
    "consumer_group": "llama",
}
llm = TitanTakeoff(models=[llama_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
output = llm.invoke(prompt, consumer_group="llama")
print(output)
```
