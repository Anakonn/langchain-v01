---
translated: true
---

# OctoAI

[OctoAI](https://docs.octoai.cloud/docs) उपयोगकर्ताओं को कुशल कंप्यूटिंग तक आसान पहुंच प्रदान करता है और उन्हें अपने पसंदीदा AI मॉडल को अनुप्रयोगों में एकीकृत करने में सक्षम बनाता है। `OctoAI` कंप्यूटिंग सेवा आपको AI अनुप्रयोगों को आसानी से चलाने, ट्यून करने और पैमाना बढ़ाने में मदद करती है।

यह उदाहरण `OctoAI` [LLM अंतिम बिंदु](https://octoai.cloud/templates) के साथ LangChain का उपयोग करने के बारे में बताता है।

## सेटअप

हमारे उदाहरण ऐप को चलाने के लिए, दो सरल चरण हैं:

1. [अपने OctoAI खाते पृष्ठ](https://octoai.cloud/settings) से एक API टोकन प्राप्त करें।

2. अपना API कुंजी नीचे दिए गए कोड सेल में चिपकाएं।

नोट: यदि आप एक अलग LLM मॉडल का उपयोग करना चाहते हैं, तो आप मॉडल को कंटेनराइज़ कर सकते हैं और [Python से कंटेनर बनाने](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) और [कंटेनर से कस्टम अंतिम बिंदु बनाने](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container) का पालन करके खुद एक कस्टम OctoAI अंतिम बिंदु बना सकते हैं, और फिर अपने `OCTOAI_API_BASE` पर्यावरण चर को अपडेट कर सकते हैं।

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain.chains import LLMChain
from langchain_community.llms.octoai_endpoint import OctoAIEndpoint
from langchain_core.prompts import PromptTemplate
```

## उदाहरण

```python
template = """Below is an instruction that describes a task. Write a response that appropriately completes the request.\n Instruction:\n{question}\n Response: """
prompt = PromptTemplate.from_template(template)
```

```python
llm = OctoAIEndpoint(
    model="llama-2-13b-chat-fp16",
    max_tokens=200,
    presence_penalty=0,
    temperature=0.1,
    top_p=0.9,
)
```

```python
question = "Who was Leonardo da Vinci?"

llm_chain = LLMChain(prompt=prompt, llm=llm)

print(llm_chain.run(question))
```

लियोनार्दो दा विंची एक सच्चे रेनेसांस व्यक्ति थे। वह 1452 में इटली के विंची में जन्मे थे और कला, विज्ञान, इंजीनियरिंग और गणित सहित विभिन्न क्षेत्रों में अपने कार्य के लिए जाने जाते थे। उन्हें सभी समयों के महानतम चित्रकारों में से एक माना जाता है, और उनके सबसे प्रसिद्ध कार्यों में मोना लिसा और द लास्ट सुपर शामिल हैं। अपने कला के अलावा, दा विंची ने इंजीनियरिंग और शरीर रचना में महत्वपूर्ण योगदान दिया, और उनके मशीनों और आविष्कारों के लिए उनके डिज़ाइन अपने समय से कई सदियों आगे थे। वह अपने व्यापक जर्नल और चित्रों के लिए भी जाने जाते हैं, जो उनके विचारों और विचारों में मूल्यवान अंतर्दृष्टि प्रदान करते हैं। दा विंची का वारसा आज भी दुनिया भर के कलाकारों, वैज्ञानिकों और विचारकों को प्रेरित और प्रभावित करता है।
