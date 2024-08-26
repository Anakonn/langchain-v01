---
translated: true
---

# MoonshotChat

[Moonshot](https://platform.moonshot.cn/) एक चीनी स्टार्टअप है जो कंपनियों और व्यक्तियों के लिए LLM सेवा प्रदान करता है।

यह उदाहरण LangChain का उपयोग करके Moonshot के साथ कैसे बातचीत करें, इस बारे में बताता है।

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
