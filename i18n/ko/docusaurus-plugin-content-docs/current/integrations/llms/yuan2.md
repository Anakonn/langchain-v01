---
translated: true
---

# 위안 2.0

[위안 2.0](https://github.com/IEIT-Yuan/Yuan-2.0)은 IEIT System에서 개발한 새로운 세대의 기본 대규모 언어 모델입니다. 우리는 위안 2.0-102B, 위안 2.0-51B, 위안 2.0-2B의 세 가지 모델을 모두 공개했습니다. 그리고 다른 개발자들을 위해 사전 학습, 미세 조정, 추론 서비스에 대한 관련 스크립트를 제공합니다. 위안 2.0은 위안 1.0을 기반으로 하며, 더 넓은 범위의 고품질 사전 학습 데이터와 지침 미세 조정 데이터를 활용하여 모델의 의미, 수학, 추론, 코드, 지식 등 다양한 측면에 대한 이해를 향상시켰습니다.

이 예제는 LangChain을 사용하여 `위안 2.0`(2B/51B/102B) 추론과 상호 작용하는 방법을 설명합니다.

위안 2.0은 추론 서비스를 설정했기 때문에 사용자는 추론 API를 요청하기만 하면 결과를 얻을 수 있습니다. 이에 대한 내용은 [위안 2.0 추론 서버](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md)에서 소개되어 있습니다.

```python
from langchain.chains import LLMChain
from langchain_community.llms.yuan2 import Yuan2
```

```python
# default infer_api for a local deployed Yuan2.0 inference server
infer_api = "http://127.0.0.1:8000/yuan"

# direct access endpoint in a proxied environment
# import os
# os.environ["no_proxy"]="localhost,127.0.0.1,::1"

yuan_llm = Yuan2(
    infer_api=infer_api,
    max_tokens=2048,
    temp=1.0,
    top_p=0.9,
    use_history=False,
)

# turn on use_history only when you want the Yuan2.0 to keep track of the conversation history
# and send the accumulated context to the backend model api, which make it stateful. By default it is stateless.
# llm.use_history = True
```

```python
question = "请介绍一下中国。"
```

```python
print(yuan_llm.invoke(question))
```
