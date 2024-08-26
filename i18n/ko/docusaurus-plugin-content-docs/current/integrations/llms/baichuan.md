---
translated: true
---

# Baichuan LLM

Baichuan Inc. (https://www.baichuan-ai.com/)은 AGI 시대의 중국 스타트업으로, 효율성, 건강, 행복과 같은 근본적인 인간의 필요를 해결하는 데 전념하고 있습니다.

## 전제 조건

Baichuan LLM API에 액세스하려면 API 키가 필요합니다. https://platform.baichuan-ai.com/에서 API 키를 받으세요.

## Baichuan LLM 사용하기

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
