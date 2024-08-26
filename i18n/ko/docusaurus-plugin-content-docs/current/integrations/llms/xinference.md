---
translated: true
---

# Xorbits Inference (Xinference)

[Xinference](https://github.com/xorbitsai/inference)는 노트북에서도 LLM, 음성 인식 모델, 멀티모달 모델을 지원하는 강력하고 다재다능한 라이브러리입니다. GGML과 호환되는 다양한 모델, 예를 들어 chatglm, baichuan, whisper, vicuna, orca 등을 지원합니다. 이 노트북은 LangChain에서 Xinference를 사용하는 방법을 보여줍니다.

## 설치

PyPI를 통해 `Xinference`를 설치하세요:

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## Xinference를 로컬 또는 분산 클러스터에 배포하기

로컬 배포의 경우 `xinference`를 실행하세요.

Xinference를 클러스터에 배포하려면 먼저 `xinference-supervisor`를 사용하여 Xinference 수퍼바이저를 시작하세요. -p 옵션으로 포트를, -H 옵션으로 호스트를 지정할 수 있습니다. 기본 포트는 9997입니다.

그 다음 `xinference-worker`를 사용하여 각 서버에서 Xinference 워커를 시작하세요.

[Xinference](https://github.com/xorbitsai/inference)의 README 파일을 참조하세요.

## 래퍼

LangChain에서 Xinference를 사용하려면 먼저 모델을 실행해야 합니다. 명령줄 인터페이스(CLI)를 사용할 수 있습니다:

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 7167b2b0-2a04-11ee-83f0-d29396a3f064
```

모델 UID가 반환되므로 이를 사용할 수 있습니다. 이제 LangChain에서 Xinference를 사용할 수 있습니다:

```python
from langchain_community.llms import Xinference

llm = Xinference(
    server_url="http://0.0.0.0:9997", model_uid="7167b2b0-2a04-11ee-83f0-d29396a3f064"
)

llm(
    prompt="Q: where can we visit in the capital of France? A:",
    generate_config={"max_tokens": 1024, "stream": True},
)
```

```output
' You can visit the Eiffel Tower, Notre-Dame Cathedral, the Louvre Museum, and many other historical sites in Paris, the capital of France.'
```

### LLMChain과 통합하기

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "Where can we visit in the capital of {country}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(country="France")
print(generated)
```

```output

A: You can visit many places in Paris, such as the Eiffel Tower, the Louvre Museum, Notre-Dame Cathedral, the Champs-Elysées, Montmartre, Sacré-Cœur, and the Palace of Versailles.
```

마지막으로 더 이상 사용하지 않을 때 모델을 종료하세요:

```python
!xinference terminate --model-uid "7167b2b0-2a04-11ee-83f0-d29396a3f064"
```
