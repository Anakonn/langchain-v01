---
translated: true
---

# Cohere

>[Cohere](https://cohere.ai/about)는 기업이 인간-기계 상호작용을 개선할 수 있도록 돕는 자연어 처리 모델을 제공하는 캐나다 스타트업입니다.

[API 참조](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html)에서 모든 속성과 메서드에 대한 자세한 문서를 확인하세요.

## 설정

이 통합은 `langchain-community` 패키지에 있습니다. 또한 `cohere` 패키지 자체를 설치해야 합니다. 다음과 같이 설치할 수 있습니다:

```bash
pip install -U langchain-community langchain-cohere
```

[Cohere API 키](https://cohere.com/)를 얻고 `COHERE_API_KEY` 환경 변수를 설정해야 합니다:

```python
import getpass
import os

os.environ["COHERE_API_KEY"] = getpass.getpass()
```

```output
 ········
```

[LangSmith](https://smith.langchain.com/)를 설정하면 최고 수준의 관찰 기능을 사용할 수 있습니다(필수는 아님).

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 사용법

Cohere는 모든 [LLM](/docs/modules/model_io/llms/) 기능을 지원합니다:

```python
from langchain_cohere import Cohere
from langchain_core.messages import HumanMessage
```

```python
model = Cohere(model="command", max_tokens=256, temperature=0.75)
```

```python
message = "Knock knock"
model.invoke(message)
```

```output
" Who's there?"
```

```python
await model.ainvoke(message)
```

```output
" Who's there?"
```

```python
for chunk in model.stream(message):
    print(chunk, end="", flush=True)
```

```output
 Who's there?
```

```python
model.batch([message])
```

```output
[" Who's there?"]
```

프롬프트 템플릿과 쉽게 결합할 수 있습니다. [LCEL](/docs/expression_language)을 사용하여 이를 수행할 수 있습니다.

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | model
```

```python
chain.invoke({"topic": "bears"})
```

```output
' Why did the teddy bear cross the road?\nBecause he had bear crossings.\n\nWould you like to hear another joke? '
```
