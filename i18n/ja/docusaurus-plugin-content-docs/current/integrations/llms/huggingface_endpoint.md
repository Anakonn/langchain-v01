---
translated: true
---

# Huggingfaceエンドポイント

>The [Hugging Face Hub](https://huggingface.co/docs/hub/index)は、120,000以上のモデル、20,000以上のデータセット、50,000以上のデモアプリ(Spaces)を持つプラットフォームで、すべてオープンソースで一般に公開されており、人々がML(機械学習)を共同で構築できるオンラインプラットフォームです。

`Hugging Face Hub`には、MLアプリケーションを構築するためのさまざまなエンドポイントも提供されています。
この例では、さまざまなエンドポイントタイプに接続する方法を紹介します。

特に、テキスト生成推論は、[Text Generation Inference](https://github.com/huggingface/text-generation-inference)によって実現されています。これは、高速なテキスト生成推論のためのカスタムビルトのRust、Python、gRPCサーバーです。

```python
from langchain_community.llms import HuggingFaceEndpoint
```

## インストールとセットアップ

使用するには、``huggingface_hub``Pythonパッケージ[がインストールされている](https://huggingface.co/docs/huggingface_hub/installation)必要があります。

```python
%pip install --upgrade --quiet huggingface_hub
```

```python
# get a token: https://huggingface.co/docs/api-inference/quicktour#get-your-api-token

from getpass import getpass

HUGGINGFACEHUB_API_TOKEN = getpass()
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = HUGGINGFACEHUB_API_TOKEN
```

## 例の準備

```python
from langchain_community.llms import HuggingFaceEndpoint
```

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
question = "Who won the FIFA World Cup in the year 1994? "

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## 例

ここでは、無料の[Serverless Endpoints](https://huggingface.co/inference-endpoints/serverless) APIのHuggingFaceエンドポイント統合にアクセスする方法の例を示します。

```python
repo_id = "mistralai/Mistral-7B-Instruct-v0.2"

llm = HuggingFaceEndpoint(
    repo_id=repo_id, max_length=128, temperature=0.5, token=HUGGINGFACEHUB_API_TOKEN
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
print(llm_chain.run(question))
```

## 専用エンドポイント

無料のサーバーレスAPIを使えば、すぐに解決策を実装して反復することができますが、他のリクエストと負荷が共有されるため、大量の使用例では制限される可能性があります。

エンタープライズワークロードの場合、[Inference Endpoints - Dedicated](https://huggingface.co/inference-endpoints/dedicated)を使うのが最適です。
これにより、より柔軟性と速度を備えた完全に管理されたインフラストラクチャにアクセスできます。これらのリソースには、継続的なサポートと稼働時間の保証、オートスケーリングなどのオプションが付属しています。

```python
# Set the url to your Inference Endpoint below
your_endpoint_url = "https://fayjubiy2xqn36z0.us-east-1.aws.endpoints.huggingface.cloud"
```

```python
llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
)
llm("What did foo say about bar?")
```

### ストリーミング

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import HuggingFaceEndpoint

llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
    streaming=True,
)
llm("What did foo say about bar?", callbacks=[StreamingStdOutCallbackHandler()])
```
