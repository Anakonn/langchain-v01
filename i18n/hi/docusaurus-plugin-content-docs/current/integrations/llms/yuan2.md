---
translated: true
---

# Yuan2.0

[Yuan2.0](https://github.com/IEIT-Yuan/Yuan-2.0) IEIT प्रणाली द्वारा विकसित एक नई पीढ़ी का मूलभूत बड़ा भाषा मॉडल है। हमने Yuan 2.0-102B, Yuan 2.0-51B और Yuan 2.0-2B तीनों मॉडल प्रकाशित किए हैं। और हम अन्य डेवलपर्स के लिए पूर्व प्रशिक्षण, फाइन-ट्यूनिंग और अनुमान सेवाओं के लिए संबंधित स्क्रिप्ट प्रदान करते हैं। Yuan2.0 Yuan1.0 पर आधारित है, जिसमें अर्थशास्त्र, गणित, तर्क, कोड, ज्ञान और अन्य पहलुओं की समझ को बढ़ाने के लिए उच्च गुणवत्ता वाले पूर्व प्रशिक्षण डेटा और निर्देश फाइन-ट्यूनिंग डेटासेट का व्यापक उपयोग किया गया है।

यह उदाहरण LangChain का उपयोग करके `Yuan2.0`(2B/51B/102B) अनुमान के साथ पाठ उत्पादन का उपयोग करने के बारे में बताता है।

Yuan2.0 ने एक अनुमान सेवा स्थापित की है ताकि उपयोगकर्ता केवल अनुमान एपीआई का अनुरोध करके परिणाम प्राप्त कर सके, जिसका परिचय [Yuan2.0 Inference-Server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md) में दिया गया है।

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
