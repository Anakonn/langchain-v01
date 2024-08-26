---
translated: true
---

# MoonshotChat

[Moonshot](https://platform.moonshot.cn/) es una startup china que proporciona servicio de LLM para empresas e individuos.

Este ejemplo explica cómo usar LangChain para interactuar con Moonshot.

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
