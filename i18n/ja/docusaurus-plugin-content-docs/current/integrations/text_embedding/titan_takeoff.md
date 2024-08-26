---
translated: true
---

# タイタンの離陸

`TitanML`は、トレーニング、圧縮、推論最適化プラットフォームを通じて、より優れた、より小さい、より安価、より高速なNLPモデルを企業が構築およびデプロイできるようサポートしています。

私たちの推論サーバー、[Titan Takeoff](https://docs.titanml.co/docs/intro)は、単一のコマンドでハードウェアにローカルにLLMをデプロイできます。ほとんどの埋め込みモデルは、すぐに使えるようになっています。特定のモデルで問題が発生した場合は、hello@titanml.coまでご連絡ください。

## 使用例

Titan Takeoffサーバーの使用を開始するための便利な例をいくつか紹介します。これらのコマンドを実行する前に、Takeoffサーバーがバックグラウンドで起動していることを確認する必要があります。詳細については、[Takeoffの起動に関するドキュメントページ](https://docs.titanml.co/docs/Docs/launching/)を参照してください。

```python
import time

from langchain_community.embeddings import TitanTakeoffEmbed
```

### 例1

Takeoffがデフォルトのポート(つまりlocalhost:3000)で実行されていることを前提とした基本的な使用方法です。

```python
embed = TitanTakeoffEmbed()
output = embed.embed_query(
    "What is the weather in London in August?", consumer_group="embed"
)
print(output)
```

### 例2

TitanTakeoffEmbedPythonラッパーを使用してリーダーを起動します。Takeoffを最初に起動していない場合、または別のリーダーを追加したい場合は、TitanTakeoffEmbedオブジェクトを初期化するときに行うことができます。`models`パラメーターにリストとして起動したいモデルを渡します。

`embed.query_documents`を使用して、複数のドキュメントを一度に埋め込むことができます。期待される入力は、`embed_query`メソッドで期待されるものとは異なり、文字列のリストです。

```python
# Model config for the embedding model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
embedding_model = {
    "model_name": "BAAI/bge-large-en-v1.5",
    "device": "cpu",
    "consumer_group": "embed",
}
embed = TitanTakeoffEmbed(models=[embedding_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
# We specified "embed" consumer group so need to send request to the same consumer group so it hits our embedding model and not others
output = embed.embed_query(prompt, consumer_group="embed")
print(output)
```
