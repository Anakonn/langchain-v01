---
translated: true
---

# Databricks

[Databricks](https://www.databricks.com/) Lakehouse Platformは、1つのプラットフォーム上でデータ、分析、AIを統合しています。

このサンプルノートブックでは、DatabricksのエンドポイントをLangChainのLLMとしてラップする方法を示しています。
2つのエンドポイントタイプをサポートしています:

* サービングエンドポイント - 本番環境や開発に推奨
* クラスタードライバープロキシアプリ - 対話型開発に推奨

## インストール

このノートブックのコードを実行するには、`mlflow >= 2.9`が必要です。インストールされていない場合は、次のコマンドでインストールしてください:

```bash
pip install mlflow>=2.9
```

また、このサンプルでは`dbutils`も必要です。

```bash
pip install dbutils
```

## サービングエンドポイントのラッピング: 外部モデル

前提条件: OpenAPI APIキーをシークレットとして登録する:

```bash
databricks secrets create-scope <scope>
databricks secrets put-secret <scope> openai-api-key --string-value $OPENAI_API_KEY
```

次のコードは、OpenAIのGPT-4モデルを使用したチャット用の新しいサービングエンドポイントを作成し、そのエンドポイントを使用して応答を生成します。

```python
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage
from mlflow.deployments import get_deploy_client

client = get_deploy_client("databricks")

secret = "secrets/<scope>/openai-api-key"  # replace `<scope>` with your scope
name = "my-chat"  # rename this if my-chat already exists
client.create_endpoint(
    name=name,
    config={
        "served_entities": [
            {
                "name": "my-chat",
                "external_model": {
                    "name": "gpt-4",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{" + secret + "}}",
                    },
                },
            }
        ],
    },
)

chat = ChatDatabricks(
    target_uri="databricks",
    endpoint=name,
    temperature=0.1,
)
chat([HumanMessage(content="hello")])
```

```output
content='Hello! How can I assist you today?'
```

## サービングエンドポイントのラッピング: ファウンデーションモデル

次のコードは、`databricks-bge-large-en`サービングエンドポイント(エンドポイントの作成は不要)を使用して、入力テキストからエンベディングを生成します。

```python
from langchain_community.embeddings import DatabricksEmbeddings

embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
embeddings.embed_query("hello")[:3]
```

```output
[0.051055908203125, 0.007221221923828125, 0.003879547119140625]
```

## サービングエンドポイントのラッピング: カスタムモデル

前提条件:

* LLMが[Databricksサービングエンドポイント](https://docs.databricks.com/machine-learning/model-serving/index.html)に登録およびデプロイされている。
* エンドポイントに["Can Query"権限](https://docs.databricks.com/security/auth-authz/access-control/serving-endpoint-acl.html)がある。

期待されるMLflowモデルシグネチャは以下の通りです:

  * inputs: `[{"name": "prompt", "type": "string"}, {"name": "stop", "type": "list[string]"}]`
  * outputs: `[{"type": "string"}]`

モデルシグネチャが互換性がない場合や、追加の設定を挿入したい場合は、`transform_input_fn`と`transform_output_fn`を適切に設定できます。

```python
from langchain_community.llms import Databricks

# If running a Databricks notebook attached to an interactive cluster in "single user"
# or "no isolation shared" mode, you only need to specify the endpoint name to create
# a `Databricks` instance to query a serving endpoint in the same workspace.
llm = Databricks(endpoint_name="dolly")

llm("How are you?")
```

```output
'I am happy to hear that you are in good health and as always, you are appreciated.'
```

```python
llm("How are you?", stop=["."])
```

```output
'Good'
```

```python
# Otherwise, you can manually specify the Databricks workspace hostname and personal access token
# or set `DATABRICKS_HOST` and `DATABRICKS_TOKEN` environment variables, respectively.
# See https://docs.databricks.com/dev-tools/auth.html#databricks-personal-access-tokens
# We strongly recommend not exposing the API token explicitly inside a notebook.
# You can use Databricks secret manager to store your API token securely.
# See https://docs.databricks.com/dev-tools/databricks-utils.html#secrets-utility-dbutilssecrets

import os

import dbutils

os.environ["DATABRICKS_TOKEN"] = dbutils.secrets.get("myworkspace", "api_token")

llm = Databricks(host="myworkspace.cloud.databricks.com", endpoint_name="dolly")

llm("How are you?")
```

```output
'I am fine. Thank you!'
```

```python
# If the serving endpoint accepts extra parameters like `temperature`,
# you can set them in `model_kwargs`.
llm = Databricks(endpoint_name="dolly", model_kwargs={"temperature": 0.1})

llm("How are you?")
```

```output
'I am fine.'
```

```python
# Use `transform_input_fn` and `transform_output_fn` if the serving endpoint
# expects a different input schema and does not return a JSON string,
# respectively, or you want to apply a prompt template on top.


def transform_input(**request):
    full_prompt = f"""{request["prompt"]}
    Be Concise.
    """
    request["prompt"] = full_prompt
    return request


llm = Databricks(endpoint_name="dolly", transform_input_fn=transform_input)

llm("How are you?")
```

```output
'I’m Excellent. You?'
```

## クラスタードライバープロキシアプリのラッピング

前提条件:

* "single user"または"no isolation shared"モードのDatabricksインタラクティブクラスターにロードされたLLM。
* ドライバーノードで実行されるローカルHTTPサーバーで、JSONの入出力を使ってモデルを`"/"`でサービングする。
* ポート番号は`[3000, 8000]`の範囲で、ドライバーIPアドレスまたは単に`0.0.0.0`をリッスンする(localhostのみではない)。
* クラスターに"Can Attach To"権限がある。

期待されるサーバースキーマ(JSONスキーマを使用):

* inputs:
  ```json
  {"type": "object",
   "properties": {
      "prompt": {"type": "string"},
       "stop": {"type": "array", "items": {"type": "string"}}},
    "required": ["prompt"]}
  ```
* outputs: `{"type": "string"}`

サーバースキーマが互換性がない場合や、追加の設定を挿入したい場合は、`transform_input_fn`と`transform_output_fn`を適切に使用できます。

LLMを提供するドライバープロキシアプリを実行する最小限の例は以下の通りです:

```python
from flask import Flask, request, jsonify
import torch
from transformers import pipeline, AutoTokenizer, StoppingCriteria

model = "databricks/dolly-v2-3b"
tokenizer = AutoTokenizer.from_pretrained(model, padding_side="left")
dolly = pipeline(model=model, tokenizer=tokenizer, trust_remote_code=True, device_map="auto")
device = dolly.device

class CheckStop(StoppingCriteria):
    def __init__(self, stop=None):
        super().__init__()
        self.stop = stop or []
        self.matched = ""
        self.stop_ids = [tokenizer.encode(s, return_tensors='pt').to(device) for s in self.stop]
    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs):
        for i, s in enumerate(self.stop_ids):
            if torch.all((s == input_ids[0][-s.shape[1]:])).item():
                self.matched = self.stop[i]
                return True
        return False

def llm(prompt, stop=None, **kwargs):
  check_stop = CheckStop(stop)
  result = dolly(prompt, stopping_criteria=[check_stop], **kwargs)
  return result[0]["generated_text"].rstrip(check_stop.matched)

app = Flask("dolly")

@app.route('/', methods=['POST'])
def serve_llm():
  resp = llm(**request.json)
  return jsonify(resp)

app.run(host="0.0.0.0", port="7777")
```

サーバーが起動したら、`Databricks`インスタンスを作成してLLMとしてラップできます。

```python
# If running a Databricks notebook attached to the same cluster that runs the app,
# you only need to specify the driver port to create a `Databricks` instance.
llm = Databricks(cluster_driver_port="7777")

llm("How are you?")
```

```output
'Hello, thank you for asking. It is wonderful to hear that you are well.'
```

```python
# Otherwise, you can manually specify the cluster ID to use,
# as well as Databricks workspace hostname and personal access token.

llm = Databricks(cluster_id="0000-000000-xxxxxxxx", cluster_driver_port="7777")

llm("How are you?")
```

```output
'I am well. You?'
```

```python
# If the app accepts extra parameters like `temperature`,
# you can set them in `model_kwargs`.
llm = Databricks(cluster_driver_port="7777", model_kwargs={"temperature": 0.1})

llm("How are you?")
```

```output
'I am very well. It is a pleasure to meet you.'
```

```python
# Use `transform_input_fn` and `transform_output_fn` if the app
# expects a different input schema and does not return a JSON string,
# respectively, or you want to apply a prompt template on top.


def transform_input(**request):
    full_prompt = f"""{request["prompt"]}
    Be Concise.
    """
    request["prompt"] = full_prompt
    return request


def transform_output(response):
    return response.upper()


llm = Databricks(
    cluster_driver_port="7777",
    transform_input_fn=transform_input,
    transform_output_fn=transform_output,
)

llm("How are you?")
```

```output
'I AM DOING GREAT THANK YOU.'
```
