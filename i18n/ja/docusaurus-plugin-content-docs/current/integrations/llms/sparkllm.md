---
translated: true
---

# SparkLLM

[SparkLLM](https://xinghuo.xfyun.cn/spark)は、iFLYTEKが独自に開発した大規模な認知モデルです。
大量のテキスト、コード、画像を学習することで、クロスドメインの知識と言語理解能力を持っています。
自然な対話に基づいてタスクを理解し、実行することができます。

## 前提条件

- [iFlyTek SparkLLM API Console](https://console.xfyun.cn/services/bm3)から、SparkLLMのapp_id、api_key、api_secretを取得し (詳細は[iFlyTek SparkLLM Intro](https://xinghuo.xfyun.cn/sparkapi)を参照)、環境変数`IFLYTEK_SPARK_APP_ID`、`IFLYTEK_SPARK_API_KEY`、`IFLYTEK_SPARK_API_SECRET`を設定するか、デモのように`ChatSparkLLM`を作成する際にパラメータを渡してください。

## SparkLLMの使用

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
