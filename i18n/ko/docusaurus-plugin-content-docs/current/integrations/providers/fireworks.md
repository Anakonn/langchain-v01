---
translated: true
---

# 불꽃놀이

이 페이지에서는 [Fireworks](https://fireworks.ai/)모델을 Langchain에서 사용하는 방법을 다룹니다.

## 설치 및 설정

- Fireworks 통합 패키지를 설치합니다.

  ```
  pip install langchain-fireworks
  ```

- [fireworks.ai](https://fireworks.ai)에 가입하여 Fireworks API 키를 받습니다.
- FIREWORKS_API_KEY 환경 변수를 설정하여 인증합니다.

## 인증

Fireworks API 키를 사용하여 인증하는 두 가지 방법이 있습니다:

1.  `FIREWORKS_API_KEY` 환경 변수를 설정합니다.

    ```python
    os.environ["FIREWORKS_API_KEY"] = "<KEY>"
    ```

2.  Fireworks LLM 모듈의 `api_key` 필드를 설정합니다.

    ```python
    llm = Fireworks(api_key="<KEY>")
    ```

## Fireworks LLM 모듈 사용하기

Fireworks는 LLM 모듈을 통해 Langchain과 통합됩니다. 이 예에서는 mixtral-8x7b-instruct 모델을 사용할 것입니다.

```python
<!--IMPORTS:[{"imported": "Fireworks", "source": "langchain_fireworks", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_fireworks.llms.Fireworks.html", "title": "Fireworks"}]-->
from langchain_fireworks import Fireworks

llm = Fireworks(
    api_key="<KEY>",
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    max_tokens=256)
llm("Name 3 sports.")
```

자세한 내용은 [여기](/docs/integrations/llms/Fireworks)를 참고하세요.
