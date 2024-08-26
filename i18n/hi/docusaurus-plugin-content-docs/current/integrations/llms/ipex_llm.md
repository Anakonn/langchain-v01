---
translated: true
---

# IPEX-LLM

> [IPEX-LLM](https://github.com/intel-analytics/ipex-llm/) एक PyTorch लाइब्रेरी है जो Intel CPU और GPU (जैसे स्थानीय PC में iGPU, Arc, Flex और Max जैसे डिस्क्रीट GPU) पर LLM को बहुत कम लेटेंसी के साथ चलाने के लिए है।

यह उदाहरण LangChain का उपयोग करके `ipex-llm` के साथ पाठ उत्पादन के लिए कैसे इंटरैक्ट करें, इसके बारे में बताता है।

## सेटअप

```python
# Update Langchain

%pip install -qU langchain langchain-community
```

Intel CPU पर LLMs को स्थानीय रूप से चलाने के लिए IEPX-LLM इंस्टॉल करें।

```python
%pip install --pre --upgrade ipex-llm[all]
```

## मूल उपयोग

```python
import warnings

from langchain.chains import LLMChain
from langchain_community.llms import IpexLLM
from langchain_core.prompts import PromptTemplate

warnings.filterwarnings("ignore", category=UserWarning, message=".*padding_mask.*")
```

अपने मॉडल के लिए प्रॉम्प्ट टेम्प्लेट निर्दिष्ट करें। इस उदाहरण में, हम [vicuna-1.5](https://huggingface.co/lmsys/vicuna-7b-v1.5) मॉडल का उपयोग करते हैं। यदि आप किसी अन्य मॉडल के साथ काम कर रहे हैं, तो उचित टेम्प्लेट चुनें।

```python
template = "USER: {question}\nASSISTANT:"
prompt = PromptTemplate(template=template, input_variables=["question"])
```

IpexLLM का उपयोग करके मॉडल को स्थानीय रूप से लोड करें `IpexLLM.from_model_id` का उपयोग करके। यह मॉडल को सीधे इसके Huggingface प्रारूप में लोड करेगा और इंफरेंस के लिए इसे स्वचालित रूप से कम-बिट प्रारूप में रूपांतरित करेगा।

```python
llm = IpexLLM.from_model_id(
    model_id="lmsys/vicuna-7b-v1.5",
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

इसका उपयोग श्रृंखलाओं में करें:

```python
llm_chain = prompt | llm

question = "What is AI?"
output = llm_chain.invoke(question)
```

## कम-बिट मॉडल सहेजें/लोड करें

वैकल्पिक रूप से, आप कम-बिट मॉडल को डिस्क पर एक बार सहेज सकते हैं और बाद में पुनः उपयोग के लिए `from_model_id_low_bit` का उपयोग कर सकते हैं, न कि `from_model_id` का - यहां तक कि अलग-अलग मशीनों पर भी। यह स्थान-कुशल है, क्योंकि कम-बिट मॉडल मूल मॉडल की तुलना में काफी कम डिस्क स्थान मांगता है। और `from_model_id_low_bit` गति और मेमोरी उपयोग के मामले में भी `from_model_id` से अधिक कुशल है, क्योंकि यह मॉडल रूपांतरण चरण को छोड़ देता है।

कम-बिट मॉडल को सहेजने के लिए, `save_low_bit` का उपयोग करें।

```python
saved_lowbit_model_path = "./vicuna-7b-1.5-low-bit"  # path to save low-bit model
llm.model.save_low_bit(saved_lowbit_model_path)
del llm
```

सहेजे गए कम-बिट मॉडल पथ से मॉडल लोड करें।
> ध्यान दें कि कम-बिट मॉडल के लिए सहेजे गए पथ में केवल मॉडल ही शामिल है, लेकिन टोकनाइज़र नहीं। यदि आप सब कुछ एक ही स्थान पर रखना चाहते हैं, तो आपको मैन्युअल रूप से मूल मॉडल के निर्देशिका से टोकनाइज़र फ़ाइलों को डाउनलोड या कॉपी करना होगा जहां कम-बिट मॉडल सहेजा गया है।

```python
llm_lowbit = IpexLLM.from_model_id_low_bit(
    model_id=saved_lowbit_model_path,
    tokenizer_id="lmsys/vicuna-7b-v1.5",
    # tokenizer_name=saved_lowbit_model_path,  # copy the tokenizers to saved path if you want to use it this way
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

श्रृंखलाओं में लोड किए गए मॉडल का उपयोग करें:

```python
llm_chain = prompt | llm_lowbit


question = "What is AI?"
output = llm_chain.invoke(question)
```
