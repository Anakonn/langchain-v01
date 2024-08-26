---
translated: true
---

# KoboldAI API

[KoboldAI](https://github.com/KoboldAI/KoboldAI-Client)는 "다양한 로컬 및 원격 AI 모델을 사용하는 AI 지원 작성을 위한 브라우저 기반 프론트엔드"입니다. langchain에서 사용할 수 있는 공개 및 로컬 API가 있습니다.

이 예제에서는 해당 API를 LangChain과 함께 사용하는 방법을 설명합니다.

문서는 엔드포인트 끝에 /api를 추가하여 브라우저에서 찾을 수 있습니다(예: http://127.0.0.1/:5000/api).

```python
from langchain_community.llms import KoboldApiLLM
```

아래에 표시된 엔드포인트를 --api 또는 --public-api로 웹 UI를 시작한 후 출력된 엔드포인트로 바꾸세요.

선택적으로 온도 또는 max_length와 같은 매개변수를 전달할 수 있습니다.

```python
llm = KoboldApiLLM(endpoint="http://192.168.1.144:5000", max_length=80)
```

```python
response = llm.invoke(
    "### Instruction:\nWhat is the first book of the bible?\n### Response:"
)
```
