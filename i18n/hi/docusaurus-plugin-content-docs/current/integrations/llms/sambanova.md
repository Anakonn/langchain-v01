---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)** का [Sambaverse](https://sambaverse.sambanova.ai/) और [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) ओपन-सोर्स मॉडल्स को चलाने के लिए प्लेटफॉर्म हैं

यह उदाहरण LangChain का उपयोग करके SambaNova मॉडल्स के साथ कैसे काम करें, इस बारे में बताता है

## Sambaverse

**Sambaverse** आपको कई ओपन-सोर्स मॉडल्स के साथ काम करने में मदद करता है। आप उपलब्ध मॉडल्स की सूची देख सकते हैं और [playground](https://sambaverse.sambanova.ai/playground) में उनके साथ काम कर सकते हैं।
 **कृपया ध्यान दें कि Sambaverse का मुफ्त ऑफ़र प्रदर्शन-सीमित है।** जो कंपनियां उत्पादन टोकन-प्रति-सेकंड प्रदर्शन, वॉल्यूम थ्रूपुट और 10 गुना कम कुल लागत स्वामित्व (TCO) का मूल्यांकन करने के लिए तैयार हैं, वे [हमसे संपर्क करें](https://sambaverse.sambanova.ai/contact-us) एक असीमित मूल्यांकन उदाहरण के लिए।

Sambaverse मॉडल्स तक पहुंचने के लिए एक API कुंजी की आवश्यकता है। एक कुंजी प्राप्त करने के लिए, [sambaverse.sambanova.ai](https://sambaverse.sambanova.ai/) पर एक खाता बनाएं

[sseclient-py](https://pypi.org/project/sseclient-py/) पैकेज स्ट्रीमिंग भविष्यवाणी चलाने के लिए आवश्यक है

```python
%pip install --quiet sseclient-py==1.8.0
```

अपने API कुंजी को एक पर्यावरण चर के रूप में पंजीकृत करें:

```python
import os

sambaverse_api_key = "<Your sambaverse API key>"

# Set the environment variables
os.environ["SAMBAVERSE_API_KEY"] = sambaverse_api_key
```

LangChain से सीधे Sambaverse मॉडल्स को कॉल करें!

```python
from langchain_community.llms.sambanova import Sambaverse

llm = Sambaverse(
    sambaverse_model_name="Meta/llama-2-7b-chat-hf",
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        "process_prompt": True,
        "select_expert": "llama-2-7b-chat-hf",
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```

## SambaStudio

**SambaStudio** आपको ओपन सोर्स मॉडल्स को प्रशिक्षित करने, बैच अनुमान कार्यों को चलाने और ऑनलाइन अनुमान अंतःबिंदु तैनात करने में मदद करता है जिन्हें आप खुद फाइन-ट्यून करते हैं।

एक SambaStudio पर्यावरण की आवश्यकता है एक मॉडल तैनात करने के लिए। अधिक जानकारी के लिए [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite) पर जाएं

[sseclient-py](https://pypi.org/project/sseclient-py/) पैकेज स्ट्रीमिंग भविष्यवाणी चलाने के लिए आवश्यक है

```python
%pip install --quiet sseclient-py==1.8.0
```

अपने पर्यावरण चरों को पंजीकृत करें:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_API_KEY"] = sambastudio_api_key
```

LangChain से सीधे SambaStudio मॉडल्स को कॉल करें!

```python
from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_logprobs": {"type": "int", "value": "0"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```
