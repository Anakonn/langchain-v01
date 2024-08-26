---
translated: true
---

# MoonshotChat

[Moonshot](https://platform.moonshot.cn/) est une startup chinoise qui fournit un service LLM aux entreprises et aux particuliers.

Cet exemple explique comment utiliser LangChain pour interagir avec Moonshot.

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
