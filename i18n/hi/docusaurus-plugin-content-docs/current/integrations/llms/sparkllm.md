---
translated: true
---

# SparkLLM

[SparkLLM](https://xinghuo.xfyun.cn/spark) एक बड़े पैमाने पर संज्ञानात्मक मॉडल है जिसे iFLYTEK द्वारा स्वतंत्र रूप से विकसित किया गया है।
यह बड़ी मात्रा में पाठ, कोड और छवियों को सीखकर क्रॉस-डोमेन ज्ञान और भाषा समझ क्षमता रखता है।
यह प्राकृतिक संवाद के आधार पर कार्य समझ और निष्पादन कर सकता है।

## पूर्वापेक्षा

- [iFlyTek SparkLLM API कंसोल](https://console.xfyun.cn/services/bm3) से SparkLLM का app_id, api_key और api_secret प्राप्त करें (अधिक जानकारी के लिए, [iFlyTek SparkLLM परिचय](https://xinghuo.xfyun.cn/sparkapi) देखें), फिर `IFLYTEK_SPARK_APP_ID`, `IFLYTEK_SPARK_API_KEY` और `IFLYTEK_SPARK_API_SECRET` पर्यावरण चर सेट करें या ऊपर दिए गए डेमो के रूप में `ChatSparkLLM` बनाते समय पैरामीटर पास करें।

## SparkLLM का उपयोग करें

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
