---
translated: true
---

# OpenLLM

[🦾 OpenLLM](https://github.com/bentoml/OpenLLM)은 프로덕션에서 대규모 언어 모델(LLM)을 운영하기 위한 오픈 플랫폼입니다. 개발자가 오픈 소스 LLM을 사용하여 쉽게 추론을 실행하고, 클라우드 또는 온-프레미스에 배포하며, 강력한 AI 애플리케이션을 구축할 수 있게 해줍니다.

## 설치

[PyPI](https://pypi.org/project/openllm/)를 통해 `openllm`을 설치하세요.

```python
%pip install --upgrade --quiet  openllm
```

## 로컬에서 OpenLLM 서버 시작하기

LLM 서버를 시작하려면 `openllm start` 명령을 사용하세요. 예를 들어, dolly-v2 서버를 시작하려면 다음 명령을 터미널에서 실행하세요:

```bash
openllm start dolly-v2
```

## Wrapper

```python
from langchain_community.llms import OpenLLM

server_url = "http://localhost:3000"  # Replace with remote host if you are running on a remote server
llm = OpenLLM(server_url=server_url)
```

### 선택 사항: 로컬 LLM 추론

OpenLLM에서 관리하는 LLM을 현재 프로세스에서 로컬로 초기화할 수도 있습니다. 이는 개발 목적에 유용하며 개발자가 다양한 유형의 LLM을 빠르게 시도할 수 있게 해줍니다.

LLM 애플리케이션을 프로덕션으로 이동할 때는 OpenLLM 서버를 별도로 배포하고 위에 표시된 `server_url` 옵션을 통해 액세스하는 것이 좋습니다.

LangChain wrapper를 통해 로컬에서 LLM을 로드하려면:

```python
from langchain_community.llms import OpenLLM

llm = OpenLLM(
    model_name="dolly-v2",
    model_id="databricks/dolly-v2-3b",
    temperature=0.94,
    repetition_penalty=1.2,
)
```

### LLMChain과 통합하기

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "What is a good name for a company that makes {product}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(product="mechanical keyboard")
print(generated)
```

```output
iLkb
```
