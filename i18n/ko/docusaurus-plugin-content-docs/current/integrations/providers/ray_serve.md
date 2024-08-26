---
translated: true
---

# Ray Serve

[Ray Serve](https://docs.ray.io/en/latest/serve/index.html)은 온라인 추론 API를 구축하기 위한 확장 가능한 모델 서빙 라이브러리입니다. Serve는 특히 시스템 구성에 적합하며, 여러 체인과 비즈니스 로직으로 구성된 복잡한 추론 서비스를 Python 코드로 쉽게 구축할 수 있습니다.

## 이 노트북의 목표

이 노트북은 OpenAI 체인을 프로덕션에 배포하는 간단한 예를 보여줍니다. 이를 확장하여 자체 호스팅 모델을 배포할 수 있으며, 프로덕션에서 모델을 효율적으로 실행하는 데 필요한 하드웨어 리소스(GPU 및 CPU)의 양을 쉽게 정의할 수 있습니다. Ray Serve [문서](https://docs.ray.io/en/latest/serve/getting-started.html)에서 자동 스케일링을 포함한 사용 가능한 옵션에 대해 자세히 알아보세요.

## Ray Serve 설정

`pip install ray[serve]`로 ray를 설치하세요.

## 일반적인 골격

서비스를 배포하는 일반적인 골격은 다음과 같습니다:

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

## OpenAI 체인을 사용자 정의 프롬프트로 배포하는 예

[여기](https://platform.openai.com/account/api-keys)에서 OpenAI API 키를 얻으세요. 다음 코드를 실행하면 API 키를 제공하라는 메시지가 표시됩니다.

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

이제 배포를 바인딩할 수 있습니다.

```python
# Bind the model to deployment
deployment = DeployLLM.bind()
```

포트 번호와 호스트를 지정하여 배포를 실행할 수 있습니다.

```python
# Example port number
PORT_NUMBER = 8282
# Run the deployment
serve.api.run(deployment, port=PORT_NUMBER)
```

이제 `localhost:8282` 포트에 서비스가 배포되었으므로 POST 요청을 보내 결과를 받을 수 있습니다.

```python
import requests

text = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
response = requests.post(f"http://localhost:{PORT_NUMBER}/?text={text}")
print(response.content.decode())
```
