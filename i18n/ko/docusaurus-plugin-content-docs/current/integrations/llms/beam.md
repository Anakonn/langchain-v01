---
translated: true
---

# 빔

GPT2 LLM의 클라우드 배포 인스턴스를 배포하고 후속 호출을 하기 위해 Beam API 래퍼를 호출합니다. Beam 라이브러리 설치와 Beam 클라이언트 ID 및 클라이언트 비밀 등록이 필요합니다. 래퍼를 호출하면 모델의 인스턴스가 생성되고 실행되며, 프롬프트와 관련된 반환 텍스트가 있습니다. 그 후 Beam API를 직접 호출하여 추가 호출을 할 수 있습니다.

[계정을 만드세요](https://www.beam.cloud/), 아직 없다면. [대시보드](https://www.beam.cloud/dashboard/settings/api-keys)에서 API 키를 가져오세요.

Beam CLI를 설치하세요

```python
!curl https://raw.githubusercontent.com/slai-labs/get-beam/main/get-beam.sh -sSfL | sh
```

API 키를 등록하고 beam 클라이언트 ID와 비밀 환경 변수를 설정하세요:

```python
import os

beam_client_id = "<Your beam client id>"
beam_client_secret = "<Your beam client secret>"

# Set the environment variables
os.environ["BEAM_CLIENT_ID"] = beam_client_id
os.environ["BEAM_CLIENT_SECRET"] = beam_client_secret

# Run the beam configure command
!beam configure --clientId={beam_client_id} --clientSecret={beam_client_secret}
```

Beam SDK를 설치하세요:

```python
%pip install --upgrade --quiet  beam-sdk
```

**Langchain에서 Beam을 직접 배포하고 호출하세요!**

초기 시작에는 응답을 받는 데 몇 분 정도 걸릴 수 있지만, 이후 호출은 더 빠를 것입니다!

```python
from langchain_community.llms.beam import Beam

llm = Beam(
    model_name="gpt2",
    name="langchain-gpt2-test",
    cpu=8,
    memory="32Gi",
    gpu="A10G",
    python_version="python3.8",
    python_packages=[
        "diffusers[torch]>=0.10",
        "transformers",
        "torch",
        "pillow",
        "accelerate",
        "safetensors",
        "xformers",
    ],
    max_length="50",
    verbose=False,
)

llm._deploy()

response = llm._call("Running machine learning on a remote GPU")

print(response)
```
