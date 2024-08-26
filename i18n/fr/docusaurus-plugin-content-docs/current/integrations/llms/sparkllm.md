---
translated: true
---

# SparkLLM

[SparkLLM](https://xinghuo.xfyun.cn/spark) est un modèle cognitif à grande échelle développé de manière indépendante par iFLYTEK.
Il possède des connaissances transversales et des capacités de compréhension du langage en apprenant une grande quantité de textes, de codes et d'images.
Il peut comprendre et effectuer des tâches basées sur un dialogue naturel.

## Prérequis

- Obtenez l'app_id, l'api_key et l'api_secret de SparkLLM depuis [iFlyTek SparkLLM API Console](https://console.xfyun.cn/services/bm3) (pour plus d'informations, voir [iFlyTek SparkLLM Intro](https://xinghuo.xfyun.cn/sparkapi)), puis définissez les variables d'environnement `IFLYTEK_SPARK_APP_ID`, `IFLYTEK_SPARK_API_KEY` et `IFLYTEK_SPARK_API_SECRET` ou transmettez les paramètres lors de la création de `ChatSparkLLM` comme dans la démonstration ci-dessus.

## Utiliser SparkLLM

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
