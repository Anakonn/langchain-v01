---
translated: true
---

# Databricks

[Databricks](https://www.databricks.com/) Lakehouse 플랫폼은 데이터, 분석 및 AI를 하나의 플랫폼에 통합합니다.

이 예제 노트북은 LangChain에서 Databricks 엔드포인트를 LLM으로 래핑하는 방법을 보여줍니다.
두 가지 엔드포인트 유형을 지원합니다:

* 서빙 엔드포인트, 프로덕션 및 개발에 권장됨,
* 클러스터 드라이버 프록시 앱, 대화형 개발에 권장됨.

## 설치

이 노트북의 코드를 실행하려면 `mlflow >= 2.9`가 필요합니다. 설치되어 있지 않은 경우 다음 명령어를 사용하여 설치하십시오:

```bash
pip install mlflow>=2.9
```

또한 이 예제에는 `dbutils`가 필요합니다.

```bash
pip install dbutils
```

## 서빙 엔드포인트 래핑: 외부 모델

전제 조건: OpenAI API 키를 비밀로 등록합니다:

```bash
databricks secrets create-scope <scope>
databricks secrets put-secret <scope> openai-api-key --string-value $OPENAI_API_KEY
```

다음 코드는 OpenAI의 GPT-4 모델을 사용하여 새로운 서빙 엔드포인트를 만들고 엔드포인트를 사용하여 응답을 생성합니다.

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

## 서빙 엔드포인트 래핑: 기반 모델

다음 코드는 `databricks-bge-large-en` 서빙 엔드포인트(엔드포인트 생성 불필요)를 사용하여 입력 텍스트에서 임베딩을 생성합니다.

```python
from langchain_community.embeddings import DatabricksEmbeddings

embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
embeddings.embed_query("hello")[:3]
```

```output
[0.051055908203125, 0.007221221923828125, 0.003879547119140625]
```

## 서빙 엔드포인트 래핑: 사용자 정의 모델

전제 조건:

* LLM이 [Databricks 서빙 엔드포인트](https://docs.databricks.com/machine-learning/model-serving/index.html)에 등록되고 배포되었습니다.
* 엔드포인트에 ["Can Query" 권한](https://docs.databricks.com/security/auth-authz/access-control/serving-endpoint-acl.html)이 있습니다.

예상되는 MLflow 모델 서명은 다음과 같습니다:

  * inputs: `[{"name": "prompt", "type": "string"}, {"name": "stop", "type": "list[string]"}]`
  * outputs: `[{"type": "string"}]`

모델 서명이 호환되지 않거나 추가 구성을 삽입하려면 `transform_input_fn` 및 `transform_output_fn`을 적절히 설정할 수 있습니다.

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

## 클러스터 드라이버 프록시 앱 래핑

전제 조건:

* "단일 사용자" 또는 "격리 없는 공유" 모드의 Databricks 대화형 클러스터에 로드된 LLM.
* 모델을 JSON 입력/출력을 사용하여 HTTP POST로 `"/"` 에서 제공하는 로컬 HTTP 서버가 드라이버 노드에서 실행 중입니다.
* `[3000, 8000]` 범위의 포트 번호를 사용하고 localhost가 아닌 드라이버 IP 주소 또는 `0.0.0.0`에 수신합니다.
* 클러스터에 "Can Attach To" 권한이 있습니다.

예상되는 서버 스키마(JSON 스키마 사용):

* inputs:
  ```json
  {"type": "object",
   "properties": {
      "prompt": {"type": "string"},
       "stop": {"type": "array", "items": {"type": "string"}}},
    "required": ["prompt"]}
  ```
* outputs: `{"type": "string"}`

서버 스키마가 호환되지 않거나 추가 구성을 삽입하려면 `transform_input_fn` 및 `transform_output_fn`을 사용할 수 있습니다.

다음은 LLM을 제공하는 드라이버 프록시 앱을 실행하는 최소 예제입니다:

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

서버가 실행되면 `Databricks` 인스턴스를 만들어 LLM으로 래핑할 수 있습니다.

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
