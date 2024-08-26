---
translated: true
---

# आर्सी

>[आर्सी](https://www.arcee.ai/about/about-us) एसएलएम - छोटे, विशिष्ट, सुरक्षित और स्केलेबल भाषा मॉडल के विकास में मदद करता है।

यह नोटबुक `ArceeRetriever` क्लास का उपयोग करके आर्सी के `डोमेन अनुकूलित भाषा मॉडल` (`डीएएलएम`) के लिए प्रासंगिक दस्तावेज(ों) को पुनः प्राप्त करने का प्रदर्शन करता है।

### सेटअप

`ArceeRetriever` का उपयोग करने से पहले, सुनिश्चित करें कि आर्सी API कुंजी `ARCEE_API_KEY` पर्यावरण चर के रूप में सेट है। आप API कुंजी को नामित पैरामीटर के रूप में भी पास कर सकते हैं।

```python
from langchain_community.retrievers import ArceeRetriever

retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### अतिरिक्त कॉन्फ़िगरेशन

आप `ArceeRetriever` के पैरामीटर जैसे `arcee_api_url`, `arcee_app_url` और `model_kwargs` को आवश्यकतानुसार कॉन्फ़िगर भी कर सकते हैं।
ऑब्जेक्ट प्रारंभीकरण पर `model_kwargs` सेट करना सभी बाद के पुनः प्राप्तियों के लिए फ़िल्टर और आकार को डिफ़ॉल्ट के रूप में उपयोग करता है।

```python
retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY", # if not already set in the environment
    arcee_api_url="https://custom-api.arcee.ai",  # default is https://api.arcee.ai
    arcee_app_url="https://custom-app.arcee.ai",  # default is https://app.arcee.ai
    model_kwargs={
        "size": 5,
        "filters": [
            {
                "field_name": "document",
                "filter_type": "fuzzy_search",
                "value": "Einstein",
            }
        ],
    },
)
```

### दस्तावेज पुनः प्राप्त करना

आप एक क्वेरी प्रदान करके अपलोड किए गए संदर्भों से प्रासंगिक दस्तावेज पुनः प्राप्त कर सकते हैं। यहाँ एक उदाहरण है:

```python
query = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
documents = retriever.invoke(query)
```

### अतिरिक्त पैरामीटर

आर्सी आपको `फ़िल्टर` लागू करने और पुनः प्राप्त किए गए दस्तावेज(ों) की `आकार` (गणना के संदर्भ में) को सेट करने की अनुमति देता है। फ़िल्टर परिणामों को संकीर्ण करने में मदद करते हैं। इन पैरामीटरों का उपयोग करने के लिए यह है:

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Music"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Retrieve documents with filters and size params
documents = retriever.invoke(query, size=5, filters=filters)
```
