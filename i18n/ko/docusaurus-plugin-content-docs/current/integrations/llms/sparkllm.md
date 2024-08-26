---
translated: true
---

# SparkLLM

[SparkLLM](https://xinghuo.xfyun.cn/spark)은 iFLYTEK에서 독자적으로 개발한 대규모 인지 모델입니다.
많은 텍스트, 코드 및 이미지를 학습하여 cross-domain 지식과 언어 이해 능력을 갖추고 있습니다.
자연스러운 대화를 기반으로 작업을 이해하고 수행할 수 있습니다.

## 전제 조건

- [iFlyTek SparkLLM API Console](https://console.xfyun.cn/services/bm3)에서 SparkLLM의 app_id, api_key 및 api_secret을 받으세요(자세한 내용은 [iFlyTek SparkLLM 소개](https://xinghuo.xfyun.cn/sparkapi) 참조). 그런 다음 환경 변수 `IFLYTEK_SPARK_APP_ID`, `IFLYTEK_SPARK_API_KEY` 및 `IFLYTEK_SPARK_API_SECRET`을 설정하거나 `ChatSparkLLM`을 생성할 때 매개변수로 전달하세요.

## SparkLLM 사용하기

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
