---
translated: true
---

# MoonshotChat

[Moonshot](https://platform.moonshot.cn/)은 기업과 개인을 위한 LLM 서비스를 제공하는 중국 스타트업입니다.

이 예제에서는 LangChain을 사용하여 Moonshot과 상호 작용하는 방법을 살펴봅니다.

```python
from langchain_community.llms.moonshot import Moonshot
```

```python
import os

# Generate your api key from: https://platform.moonshot.cn/console/api-keys
os.environ["MOONSHOT_API_KEY"] = "MOONSHOT_API_KEY"
```

```python
llm = Moonshot()
# or use a specific model
# Available models: https://platform.moonshot.cn/docs
# llm = Moonshot(model="moonshot-v1-128k")
```

```python
# Prompt the model
llm.invoke("What is the difference between panda and bear?")
```
