---
translated: true
---

# Baichuan LLM

Baichuan Inc. (https://www.baichuan-ai.com/) est une startup chinoise à l'ère de l'AGI, dédiée à répondre aux besoins humains fondamentaux : l'Efficacité, la Santé et le Bonheur.

## Prérequis

Une clé d'API est requise pour accéder à l'API Baichuan LLM. Visitez https://platform.baichuan-ai.com/ pour obtenir votre clé d'API.

## Utiliser Baichuan LLM

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
