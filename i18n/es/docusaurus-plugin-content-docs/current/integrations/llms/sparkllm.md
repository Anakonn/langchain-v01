---
translated: true
---

# SparkLLM

[SparkLLM](https://xinghuo.xfyun.cn/spark) es un modelo cognitivo a gran escala desarrollado de forma independiente por iFLYTEK.
Tiene conocimientos transversales y capacidad de comprensión del lenguaje al aprender una gran cantidad de textos, códigos e imágenes.
Puede entender y realizar tareas basadas en diálogo natural.

## Prerequisito

- Obtén el app_id, api_key y api_secret de SparkLLM de la [Consola de API de iFlyTek SparkLLM](https://console.xfyun.cn/services/bm3) (para más información, consulta la [Introducción a iFlyTek SparkLLM](https://xinghuo.xfyun.cn/sparkapi)), luego establece las variables de entorno `IFLYTEK_SPARK_APP_ID`, `IFLYTEK_SPARK_API_KEY` y `IFLYTEK_SPARK_API_SECRET` o pasa los parámetros al crear `ChatSparkLLM` como se muestra en el ejemplo anterior.

## Usar SparkLLM

```python
import os

os.environ["IFLYTEK_SPARK_APP_ID"] = "app_id"
os.environ["IFLYTEK_SPARK_API_KEY"] = "api_key"
os.environ["IFLYTEK_SPARK_API_SECRET"] = "api_secret"
```

```python
from langchain_community.llms import SparkLLM

# Load the model
llm = SparkLLM()

res = llm.invoke("What's your name?")
print(res)
```

```output
/Users/liugddx/code/langchain/libs/core/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `__call__` was deprecated in LangChain 0.1.7 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(

My name is iFLYTEK Spark. How can I assist you today?
```

```python
res = llm.generate(prompts=["hello!"])
res
```

```output
LLMResult(generations=[[Generation(text='Hello! How can I assist you today?')]], llm_output=None, run=[RunInfo(run_id=UUID('d8cdcd41-a698-4cbf-a28d-e74f9cd2037b'))])
```

```python
for res in llm.stream("foo:"):
    print(res)
```

```output
Hello! How can I assist you today?
```
