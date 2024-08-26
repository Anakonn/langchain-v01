---
translated: true
---

# MoonshotChat

[Moonshot](https://platform.moonshot.cn/)は、企業や個人にLLMサービスを提供する中国のスタートアップです。

このサンプルでは、LangChainを使ってMoonshotと対話する方法について説明します。

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
