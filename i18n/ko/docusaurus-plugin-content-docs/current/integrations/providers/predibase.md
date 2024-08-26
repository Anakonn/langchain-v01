---
translated: true
---

# Predibase

Predibase에서 LangChain 모델 사용 방법을 알아보세요.

## 설정

- [Predibase](https://predibase.com/) 계정과 [API 키](https://docs.predibase.com/sdk-guide/intro)를 만드세요.
- `pip install predibase`로 Predibase Python 클라이언트를 설치하세요.
- API 키를 사용하여 인증하세요.

### LLM

Predibase는 LLM 모듈을 구현하여 LangChain과 통합됩니다. 아래에서 간단한 예제를 확인하거나 LLM > Integrations > Predibase에서 전체 노트북을 확인할 수 있습니다.

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

Predibase는 `model` 인수로 지정된 기본 모델을 미세 조정한 Predibase 호스팅 및 HuggingFace 호스팅 어댑터도 지원합니다:

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

Predibase는 `model` 인수로 지정된 기본 모델을 미세 조정한 어댑터도 지원합니다:

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at HuggingFace (adapter_version does not apply and will be ignored).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```
