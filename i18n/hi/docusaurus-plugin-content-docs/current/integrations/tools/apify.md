---
translated: true
---

# Apify

यह नोटबुक [LangChain](https://apify.com) में [Apify एकीकरण](/docs/integrations/providers/apify) का उपयोग करने का प्रदर्शन करता है।

[Apify](https://apify.com/store) वेब स्क्रैपिंग और डेटा निकालने के लिए एक क्लाउड प्लेटफ़ॉर्म है, जो विभिन्न वेब स्क्रैपिंग, क्रॉलिंग और डेटा निकालने के उपयोग मामलों के लिए *एक्टर्स* कहे जाने वाले एक हज़ार से अधिक तैयार किए गए ऐप्स का एक पारिस्थितिकी तंत्र प्रदान करता है। उदाहरण के लिए, आप इसका उपयोग Google खोज परिणाम, Instagram और Facebook प्रोफ़ाइल, Amazon या Shopify से उत्पाद, Google Maps समीक्षाएं आदि को निकालने के लिए कर सकते हैं।

इस उदाहरण में, हम [वेबसाइट सामग्री क्रॉलर](https://apify.com/apify/website-content-crawler) एक्टर का उपयोग करेंगे, जो दस्तावेज़, ज्ञान आधार, सहायता केंद्र या ब्लॉग जैसी वेबसाइटों को गहराई से क्रॉल कर सकता है और वेब पृष्ठों से पाठ्य सामग्री निकाल सकता है। फिर हम दस्तावेजों को एक वेक्टर सूचकांक में फ़ीड करते हैं और उससे प्रश्नों का उत्तर देते हैं।

```python
%pip install --upgrade --quiet  apify-client langchain-openai langchain
```

पहले, अपने स्रोत कोड में `ApifyWrapper` आयात करें:

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.utilities import ApifyWrapper
from langchain_core.documents import Document
```

अपने [Apify API टोकन](https://console.apify.com/account/integrations) और इस उदाहरण के उद्देश्य के लिए अपने OpenAI API कुंजी का उपयोग करके इसे प्रारंभ करें:

```python
import os

os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
os.environ["APIFY_API_TOKEN"] = "Your Apify API token"

apify = ApifyWrapper()
```

फिर एक्टर को चलाएं, इसके समाप्त होने का इंतज़ार करें, और Apify डेटासेट से इसके परिणामों को LangChain दस्तावेज़ लोडर में प्राप्त करें।

ध्यान रखें कि यदि आपके पास पहले से ही Apify डेटासेट में कुछ परिणाम हैं, तो आप [इस नोटबुक](/docs/integrations/document_loaders/apify_dataset) में दिखाए गए `ApifyDatasetLoader` का उपयोग करके उन्हें सीधे लोड कर सकते हैं। उस नोटबुक में, आप `dataset_mapping_function` की व्याख्या भी पाएंगे, जिसका उपयोग Apify डेटासेट रिकॉर्ड के क्षेत्रों को LangChain `Document` क्षेत्रों से मैप करने के लिए किया जाता है।

```python
loader = apify.call_actor(
    actor_id="apify/website-content-crawler",
    run_input={"startUrls": [{"url": "https://python.langchain.com/en/latest/"}]},
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

क्रॉल किए गए दस्तावेजों से वेक्टर सूचकांक को प्रारंभ करें:

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

और अंत में, वेक्टर सूचकांक का प्रश्न पूछें:

```python
query = "What is LangChain?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 LangChain is a standard interface through which you can interact with a variety of large language models (LLMs). It provides modules that can be used to build language model applications, and it also provides chains and agents with memory capabilities.

https://python.langchain.com/en/latest/modules/models/llms.html, https://python.langchain.com/en/latest/getting_started/getting_started.html
```
