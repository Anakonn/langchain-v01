---
translated: true
---

# Xorbits Inference (Xinference)

[Xinference](https://github.com/xorbitsai/inference) एक शक्तिशाली और बहुमुखी लाइब्रेरी है जो LLM, स्पीच रिकग्निशन मॉडल और मल्टीमोडल मॉडल को भी आपके लैपटॉप पर सेवा देने के लिए डिज़ाइन की गई है। यह GGML के साथ संगत कई मॉडल जैसे chatglm, baichuan, whisper, vicuna, orca और अन्य का समर्थन करता है। यह नोटबुक LangChain के साथ Xinference का उपयोग करने का प्रदर्शन करता है।

## इंस्टॉलेशन

PyPI के माध्यम से `Xinference` इंस्टॉल करें:

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## Xinference को स्थानीय रूप से या वितरित क्लस्टर में तैनात करें।

स्थानीय तैनाती के लिए, `xinference` चलाएं।

Xinference को क्लस्टर में तैनात करने के लिए, पहले `xinference-supervisor` का उपयोग करके एक Xinference पर्यवेक्षक शुरू करें। आप -p का विकल्प पोर्ट निर्दिष्ट करने और -H का उपयोग होस्ट निर्दिष्ट करने के लिए भी कर सकते हैं। डिफ़ॉल्ट पोर्ट 9997 है।

फिर, प्रत्येक सर्वर पर जहां आप उन्हें चलाना चाहते हैं, `xinference-worker` का उपयोग करके Xinference वर्कर शुरू करें।

आप [Xinference](https://github.com/xorbitsai/inference) से README फ़ाइल देख सकते हैं अधिक जानकारी के लिए।

## रैपर

LangChain के साथ Xinference का उपयोग करने के लिए, आपको पहले एक मॉडल लॉन्च करना होगा। आप कमांड लाइन इंटरफ़ेस (CLI) का उपयोग कर सकते हैं:

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 7167b2b0-2a04-11ee-83f0-d29396a3f064
```

एक मॉडल UID आपके उपयोग के लिए वापस दिया जाता है। अब आप LangChain के साथ Xinference का उपयोग कर सकते हैं:

```python
from langchain_community.llms import Xinference

llm = Xinference(
    server_url="http://0.0.0.0:9997", model_uid="7167b2b0-2a04-11ee-83f0-d29396a3f064"
)

llm(
    prompt="Q: where can we visit in the capital of France? A:",
    generate_config={"max_tokens": 1024, "stream": True},
)
```

```output
' You can visit the Eiffel Tower, Notre-Dame Cathedral, the Louvre Museum, and many other historical sites in Paris, the capital of France.'
```

### एक LLMChain के साथ एकीकृत करें

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "Where can we visit in the capital of {country}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(country="France")
print(generated)
```

```output

A: You can visit many places in Paris, such as the Eiffel Tower, the Louvre Museum, Notre-Dame Cathedral, the Champs-Elysées, Montmartre, Sacré-Cœur, and the Palace of Versailles.
```

अंत में, जब आपको इसका उपयोग करने की आवश्यकता नहीं होती है, तो मॉडल को समाप्त करें:

```python
!xinference terminate --model-uid "7167b2b0-2a04-11ee-83f0-d29396a3f064"
```
