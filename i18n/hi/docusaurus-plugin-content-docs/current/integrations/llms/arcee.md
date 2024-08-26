---
translated: true
---

# Arcee

यह नोटबुक `Arcee` क्लास का उपयोग करके Arcee के डोमेन अनुकूलित भाषा मॉडल (DALMs) का उपयोग करके पाठ उत्पन्न करने का प्रदर्शन करता है।

### सेटअप

Arcee का उपयोग करने से पहले, सुनिश्चित करें कि Arcee API कुंजी `ARCEE_API_KEY` पर्यावरण चर के रूप में सेट है। आप API कुंजी को नामित पैरामीटर के रूप में भी पास कर सकते हैं।

```python
from langchain_community.llms import Arcee

# Create an instance of the Arcee class
arcee = Arcee(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### अतिरिक्त कॉन्फ़िगरेशन

आप `arcee_api_url`, `arcee_app_url` और `model_kwargs` जैसे Arcee के पैरामीटर भी कॉन्फ़िगर कर सकते हैं।
ऑब्जेक्ट प्रारंभीकरण पर `model_kwargs` सेट करना सभी बाद के जनरेट प्रतिक्रिया कॉल के लिए पैरामीटर को डिफ़ॉल्ट के रूप में उपयोग करता है।

```python
arcee = Arcee(
    model="DALM-Patent",
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

### पाठ उत्पन्न करना

आप प्रॉम्प्ट प्रदान करके Arcee से पाठ उत्पन्न कर सकते हैं। यहां एक उदाहरण है:

```python
# Generate text
prompt = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
response = arcee(prompt)
```

### अतिरिक्त पैरामीटर

Arcee आपको पाठ उत्पादन में मदद करने के लिए `फ़िल्टर` लागू करने और प्राप्त किए गए दस्तावेज़(ों) की `आकार` (गणना के संदर्भ में) को सेट करने की अनुमति देता है। फ़िल्टर परिणामों को संकीर्ण करने में मदद करते हैं। इन पैरामीटरों का उपयोग करने के लिए यह है:

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Einstein"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Generate text with filters and size params
response = arcee(prompt, size=5, filters=filters)
```
