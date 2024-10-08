---
canonical: https://python.langchain.com/v0.1/docs/integrations/llms/baichuan
translated: false
---

# Baichuan LLM

Baichuan Inc. (https://www.baichuan-ai.com/) is a Chinese startup in the era of AGI, dedicated to addressing fundamental human needs: Efficiency, Health, and Happiness.

## Prerequisite

An API key is required to access Baichuan LLM API. Visit https://platform.baichuan-ai.com/ to get your API key.

## Use Baichuan LLM

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