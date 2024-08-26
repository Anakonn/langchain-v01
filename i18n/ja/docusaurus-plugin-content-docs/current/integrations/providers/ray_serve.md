---
translated: true
---

# Ray Serve

[Ray Serve](https://docs.ray.io/en/latest/serve/index.html)は、オンラインの推論APIを構築するためのスケーラブルなモデル提供ライブラリです。Serveは特にシステム構成に適しており、複数のチェーンやビジネスロジックを含む複雑な推論サービスをPythonコードで構築できます。

## このノートブックの目的

このノートブックでは、OpenAIチェーンをプロダクションにデプロイする簡単な例を示します。自分のホストされたモデルをデプロイするように拡張できます。そこでは、モデルを効率的にプロダクションで実行するために必要なGPUやCPUなどのハードウェアリソースを簡単に定義できます。Ray Serve [ドキュメンテーション](https://docs.ray.io/en/latest/serve/getting_started.html)にある利用可能なオプションについてもっと詳しく読むことができます。

## Ray Serveのセットアップ

`pip install ray[serve]`でrayをインストールします。

## 一般的なスケルトン

サービスをデプロイするための一般的なスケルトンは次のとおりです。

```python
# 0: Import ray serve and request from starlette
from ray import serve
from starlette.requests import Request


# 1: Define a Ray Serve deployment.
@serve.deployment
class LLMServe:
    def __init__(self) -> None:
        # All the initialization code goes here
        pass

    async def __call__(self, request: Request) -> str:
        # You can parse the request here
        # and return a response
        return "Hello World"


# 2: Bind the model to deployment
deployment = LLMServe.bind()

# 3: Run the deployment
serve.api.run(deployment)
```

```python
# Shutdown the deployment
serve.api.shutdown()
```

## OpenAIチェーンをカスタムプロンプトでデプロイする例

[ここ](https://platform.openai.com/account/api-keys)からOpenAI APIキーを取得します。次のコードを実行すると、APIキーの入力を求められます。

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
@serve.deployment
class DeployLLM:
    def __init__(self):
        # We initialize the LLM, template and the chain here
        llm = OpenAI(openai_api_key=OPENAI_API_KEY)
        template = "Question: {question}\n\nAnswer: Let's think step by step."
        prompt = PromptTemplate.from_template(template)
        self.chain = LLMChain(llm=llm, prompt=prompt)

    def _run_chain(self, text: str):
        return self.chain(text)

    async def __call__(self, request: Request):
        # 1. Parse the request
        text = request.query_params["text"]
        # 2. Run the chain
        resp = self._run_chain(text)
        # 3. Return the response
        return resp["text"]
```

デプロイメントをバインドできます。

```python
# Bind the model to deployment
deployment = DeployLLM.bind()
```

ポート番号とホストを割り当てることができます。

```python
# Example port number
PORT_NUMBER = 8282
# Run the deployment
serve.api.run(deployment, port=PORT_NUMBER)
```

`localhost:8282`にサービスがデプロイされたので、POSTリクエストを送信して結果を取得できます。

```python
import requests

text = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
response = requests.post(f"http://localhost:{PORT_NUMBER}/?text={text}")
print(response.content.decode())
```
