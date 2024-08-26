---
translated: true
---

# बैचुआन एलएलएम

बैचुआन इंक. (https://www.baichuan-ai.com/) एक चीनी स्टार्टअप है जो एजीआई के युग में मानव की मूलभूत आवश्यकताओं को संबोधित करने के लिए समर्पित है: दक्षता, स्वास्थ्य और खुशी।

## पूर्वापेक्षा

बैचुआन एलएलएम एपीआई का उपयोग करने के लिए एक एपीआई कुंजी की आवश्यकता है। अपनी एपीआई कुंजी प्राप्त करने के लिए https://platform.baichuan-ai.com/ पर जाएं।

## बैचुआन एलएलएम का उपयोग करें

```python
import os

os.environ["BAICHUAN_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_community.llms import BaichuanLLM

# Load the model
llm = BaichuanLLM()

res = llm.invoke("What's your name?")
print(res)
```

```python
res = llm.generate(prompts=["你好！"])
res
```

```python
for res in llm.stream("Who won the second world war?"):
    print(res)
```

```python
import asyncio


async def run_aio_stream():
    async for res in llm.astream("Write a poem about the sun."):
        print(res)


asyncio.run(run_aio_stream())
```
