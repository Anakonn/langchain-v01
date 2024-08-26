---
translated: true
---

# Yuan2.0

[Yuan2.0](https://github.com/IEIT-Yuan/Yuan-2.0) es un modelo de lenguaje grande fundamental de nueva generación desarrollado por IEIT System. Hemos publicado los tres modelos, Yuan 2.0-102B, Yuan 2.0-51B y Yuan 2.0-2B. Y proporcionamos scripts relevantes para el entrenamiento previo, el ajuste fino y los servicios de inferencia para otros desarrolladores. Yuan2.0 se basa en Yuan1.0, utilizando una gama más amplia de datos de entrenamiento previo de alta calidad y conjuntos de datos de ajuste fino de instrucciones para mejorar la comprensión del modelo sobre semántica, matemáticas, razonamiento, código, conocimiento y otros aspectos.

Este ejemplo explica cómo usar LangChain para interactuar con la inferencia de `Yuan2.0`(2B/51B/102B) para la generación de texto.

Yuan2.0 configuró un servicio de inferencia, por lo que el usuario solo necesita solicitar la API de inferencia para obtener el resultado, que se introduce en [Yuan2.0 Inference-Server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md).

```python
from langchain.chains import LLMChain
from langchain_community.llms.yuan2 import Yuan2
```

```python
# default infer_api for a local deployed Yuan2.0 inference server
infer_api = "http://127.0.0.1:8000/yuan"

# direct access endpoint in a proxied environment
# import os
# os.environ["no_proxy"]="localhost,127.0.0.1,::1"

yuan_llm = Yuan2(
    infer_api=infer_api,
    max_tokens=2048,
    temp=1.0,
    top_p=0.9,
    use_history=False,
)

# turn on use_history only when you want the Yuan2.0 to keep track of the conversation history
# and send the accumulated context to the backend model api, which make it stateful. By default it is stateless.
# llm.use_history = True
```

```python
question = "请介绍一下中国。"
```

```python
print(yuan_llm.invoke(question))
```
