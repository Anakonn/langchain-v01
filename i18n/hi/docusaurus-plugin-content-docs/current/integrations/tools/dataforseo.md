---
translated: true
---

# DataForSEO

>[DataForSeo](https://dataforseo.com/) कंप्रीहेंसिव एसईओ और डिजिटल मार्केटिंग डेटा समाधान प्रदान करता है एपीआई के माध्यम से।

>`DataForSeo API` `Google`, `Bing`, `Yahoo` जैसे सबसे लोकप्रिय सर्च इंजनों से `SERP` प्राप्त करता है। यह `Maps`, `News`, `Events` जैसे विभिन्न सर्च इंजन प्रकारों से SERP प्राप्त करने की भी अनुमति देता है।

यह नोटबुक [DataForSeo API](https://dataforseo.com/apis) का उपयोग करके सर्च इंजन परिणाम प्राप्त करने का प्रदर्शन करता है।

```python
from langchain_community.utilities.dataforseo_api_search import DataForSeoAPIWrapper
```

## एपीआई क्रेडेंशियल सेट करना

आप `DataForSeo` वेबसाइट पर पंजीकरण करके अपने एपीआई क्रेडेंशियल प्राप्त कर सकते हैं।

```python
import os

os.environ["DATAFORSEO_LOGIN"] = "your_api_access_username"
os.environ["DATAFORSEO_PASSWORD"] = "your_api_access_password"

wrapper = DataForSeoAPIWrapper()
```

रन मेथड निम्नलिखित में से किसी एक तत्व से पहला परिणाम स्निपेट लौटाएगा: answer_box, knowledge_graph, featured_snippet, shopping, organic।

```python
wrapper.run("Weather in Los Angeles")
```

## `run` और `results` के बीच अंतर

`DataForSeoAPIWrapper` क्लास द्वारा प्रदान किए गए `run` और `results` दो मेथड हैं।

`run` मेथड खोज को निष्पादित करता है और उत्तर बॉक्स, ज्ञान ग्राफ, फीचर्ड स्निपेट, शॉपिंग या कार्गो परिणामों में से पहला परिणाम स्निपेट लौटाता है। ये तत्व प्राथमिकता के आधार पर उच्चतम से निम्नतम तक क्रमबद्ध हैं।

`results` मेथड वैपर में सेट किए गए पैरामीटरों के अनुसार कॉन्फ़िगर किए गए JSON प्रतिक्रिया लौटाता है। यह एपीआई से वापस लौटाए जाने वाले डेटा के बारे में अधिक लचीलापन प्रदान करता है।

## JSON के रूप में परिणाम प्राप्त करना

आप JSON प्रतिक्रिया में वापस लौटाए जाने वाले परिणाम प्रकारों और फ़ील्डों को अनुकूलित कर सकते हैं। आप वापस लौटाए जाने वाले शीर्ष परिणामों की अधिकतम संख्या भी सेट कर सकते हैं।

```python
json_wrapper = DataForSeoAPIWrapper(
    json_result_types=["organic", "knowledge_graph", "answer_box"],
    json_result_fields=["type", "title", "description", "text"],
    top_count=3,
)
```

```python
json_wrapper.results("Bill Gates")
```

## स्थान और भाषा को अनुकूलित करना

आप एपीआई वैपर में अतिरिक्त पैरामीटर पास करके अपने खोज परिणामों का स्थान और भाषा निर्दिष्ट कर सकते हैं।

```python
customized_wrapper = DataForSeoAPIWrapper(
    top_count=10,
    json_result_types=["organic", "local_pack"],
    json_result_fields=["title", "description", "type"],
    params={"location_name": "Germany", "language_code": "en"},
)
customized_wrapper.results("coffee near me")
```

## सर्च इंजन को अनुकूलित करना

आप वह सर्च इंजन भी निर्दिष्ट कर सकते हैं जिसका आप उपयोग करना चाहते हैं।

```python
customized_wrapper = DataForSeoAPIWrapper(
    top_count=10,
    json_result_types=["organic", "local_pack"],
    json_result_fields=["title", "description", "type"],
    params={"location_name": "Germany", "language_code": "en", "se_name": "bing"},
)
customized_wrapper.results("coffee near me")
```

## सर्च प्रकार को अनुकूलित करना

एपीआई वैपर आपको वह प्रकार भी निर्दिष्ट करने की अनुमति देता है जिस प्रकार की खोज आप करना चाहते हैं। उदाहरण के लिए, आप एक मानचित्र खोज कर सकते हैं।

```python
maps_search = DataForSeoAPIWrapper(
    top_count=10,
    json_result_fields=["title", "value", "address", "rating", "type"],
    params={
        "location_coordinate": "52.512,13.36,12z",
        "language_code": "en",
        "se_type": "maps",
    },
)
maps_search.results("coffee near me")
```

## Langchain एजेंटों के साथ एकीकरण

आप `langchain.agents` मॉड्यूल से `Tool` क्लास का उपयोग करके `DataForSeoAPIWrapper` को एक langchain एजेंट के साथ एकीकृत कर सकते हैं। `Tool` क्लास एक फ़ंक्शन को कैप्सूलबद्ध करती है जिसे एजेंट कॉल कर सकता है।

```python
from langchain.agents import Tool

search = DataForSeoAPIWrapper(
    top_count=3,
    json_result_types=["organic"],
    json_result_fields=["title", "description", "type"],
)
tool = Tool(
    name="google-search-answer",
    description="My new answer tool",
    func=search.run,
)
json_tool = Tool(
    name="google-search-json",
    description="My new json tool",
    func=search.results,
)
```
