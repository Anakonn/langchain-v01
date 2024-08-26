---
translated: true
---

# 모달

[Modal 클라우드 플랫폼](https://modal.com/docs/guide)은 로컬 컴퓨터의 Python 스크립트에서 편리하고 주문형으로 서버리스 클라우드 컴퓨팅에 액세스할 수 있습니다.
LLM API에 의존하는 대신 `modal`을 사용하여 사용자 정의 LLM 모델을 실행할 수 있습니다.

이 예제에서는 LangChain을 사용하여 `modal` HTTPS [웹 엔드포인트](https://modal.com/docs/guide/webhooks)와 상호 작용하는 방법을 설명합니다.

[_LangChain을 사용한 질문-답변_](https://modal.com/docs/guide/ex/potus_speech_qanda)은 `Modal`과 함께 LangChain을 사용하는 또 다른 예입니다. 이 예에서 Modal은 LangChain 애플리케이션을 엔드-투-엔드로 실행하고 OpenAI를 LLM API로 사용합니다.

```python
%pip install --upgrade --quiet  modal
```

```python
# Register an account with Modal and get a new token.

!modal token new
```

```output
Launching login page in your browser window...
If this is not showing up, please copy this URL into your web browser manually:
https://modal.com/token-flow/tf-Dzm3Y01234mqmm1234Vcu3
```

[`langchain.llms.modal.Modal`](https://github.com/langchain-ai/langchain/blame/master/langchain/llms/modal.py) 통합 클래스에는 다음 JSON 인터페이스를 준수하는 웹 엔드포인트가 있는 Modal 애플리케이션을 배포해야 합니다:

1. LLM 프롬프트는 `"prompt"` 키 아래의 `str` 값으로 수락됩니다.
2. LLM 응답은 `"prompt"` 키 아래의 `str` 값으로 반환됩니다.

**예제 요청 JSON:**

```json
{
    "prompt": "Identify yourself, bot!",
    "extra": "args are allowed",
}
```

**예제 응답 JSON:**

```json
{
    "prompt": "This is the LLM speaking",
}
```

이 인터페이스를 충족하는 'dummy' Modal 웹 엔드포인트 함수의 예는 다음과 같습니다.

```python
...
...

class Request(BaseModel):
    prompt: str

@stub.function()
@modal.web_endpoint(method="POST")
def web(request: Request):
    _ = request  # ignore input
    return {"prompt": "hello world"}
```

* Modal의 [웹 엔드포인트](https://modal.com/docs/guide/webhooks#passing-arguments-to-web-endpoints) 가이드를 참조하여 이 인터페이스를 충족하는 엔드포인트를 설정하는 기본 사항을 확인하세요.
* Modal의 ['Run Falcon-40B with AutoGPTQ'](https://modal.com/docs/guide/ex/falcon_gptq) 오픈 소스 LLM 예제를 사용자 정의 LLM의 시작점으로 사용하세요.

Modal 웹 엔드포인트를 배포하면 해당 URL을 `langchain.llms.modal.Modal` LLM 클래스에 전달할 수 있습니다. 이 클래스는 체인의 구성 요소로 사용할 수 있습니다.

```python
from langchain.chains import LLMChain
from langchain_community.llms import Modal
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
endpoint_url = "https://ecorp--custom-llm-endpoint.modal.run"  # REPLACE ME with your deployed Modal web endpoint's URL
llm = Modal(endpoint_url=endpoint_url)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
