---
translated: true
---

# Baichuan LLM

Baichuan Inc. (https://www.baichuan-ai.com/) は、効率、健康、幸福といった基本的な人間のニーズに取り組むことに専念している、AGI時代の中国のスタートアップです。

## 前提条件

Baichuan LLM APIにアクセスするには、APIキーが必要です。https://platform.baichuan-ai.com/ にアクセスしてAPIキーを取得してください。

## Baichuan LLMの使用

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
