---
translated: true
---

# Baichuan LLM

Baichuan Inc. (https://www.baichuan-ai.com/) es una startup china en la era de la AGI, dedicada a abordar las necesidades humanas fundamentales: Eficiencia, Salud y Felicidad.

## Prerequisito

Se requiere una clave API para acceder a la API de Baichuan LLM. Visite https://platform.baichuan-ai.com/ para obtener su clave API.

## Usar Baichuan LLM

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
