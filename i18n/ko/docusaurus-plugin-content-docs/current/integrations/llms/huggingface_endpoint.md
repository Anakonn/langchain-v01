---
translated: true
---

# Huggingface Endpoints

>The [Hugging Face Hub](https://huggingface.co/docs/hub/index)는 12만 개 이상의 모델, 2만 개 이상의 데이터셋, 5만 개 이상의 데모 앱(Spaces)이 모두 오픈 소스이자 공개적으로 사용 가능한 온라인 플랫폼으로, 사람들이 ML을 쉽게 협업하고 구축할 수 있습니다.

`Hugging Face Hub`는 ML 애플리케이션을 구축하기 위한 다양한 엔드포인트를 제공합니다.
이 예제는 다양한 엔드포인트 유형에 연결하는 방법을 보여줍니다.

특히 텍스트 생성 추론은 [Text Generation Inference](https://github.com/huggingface/text-generation-inference)에 의해 구동됩니다: 빠른 텍스트 생성 추론을 위한 사용자 정의 Rust, Python 및 gRPC 서버입니다.

```python
from langchain_community.llms import HuggingFaceEndpoint
```

## 설치 및 설정

사용하려면 ``huggingface_hub`` Python [패키지](https://huggingface.co/docs/huggingface_hub/installation)가 설치되어 있어야 합니다.

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

## 예제 준비

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

## 예제

여기에는 무료 [Serverless Endpoints](https://huggingface.co/inference-endpoints/serverless) API의 `HuggingFaceEndpoint` 통합에 액세스하는 방법의 예가 나와 있습니다.

```python
repo_id = "mistralai/Mistral-7B-Instruct-v0.2"

llm = HuggingFaceEndpoint(
    repo_id=repo_id, max_length=128, temperature=0.5, token=HUGGINGFACEHUB_API_TOKEN
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
print(llm_chain.run(question))
```

## 전용 엔드포인트

무료 서버리스 API를 사용하면 솔루션을 구현하고 반복할 수 있지만, 다른 요청과 부하가 공유되므로 무거운 사용 사례에 대해 속도가 제한될 수 있습니다.

엔터프라이즈 워크로드의 경우 [Inference Endpoints - Dedicated](https://huggingface.co/inference-endpoints/dedicated)를 사용하는 것이 가장 좋습니다.
이를 통해 더 많은 유연성과 속도를 제공하는 완전 관리형 인프라에 액세스할 수 있습니다. 이러한 리소스에는 지속적인 지원과 가동 시간 보증, AutoScaling과 같은 옵션이 포함됩니다.

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

### 스트리밍

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
