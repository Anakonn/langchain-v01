---
translated: true
---

# पेब्लो सुरक्षित डॉक्यूमेंटलोडर

> [पेब्लो](https://daxa-ai.github.io/pebblo/) डेवलपर्स को सुरक्षित रूप से डेटा लोड करने और अपने जेन एआई ऐप को तैनाती के लिए बिना किसी चिंता के संगठन की अनुपालन और सुरक्षा आवश्यकताओं को प्रोत्साहित करने में सक्षम बनाता है। प्रोजेक्ट लोड किए गए डेटा में पाए गए语义主题और संस्थाओं की पहचान करता है और उन्हें यूआई या पीडीएफ रिपोर्ट पर सारांशित करता है।

पेब्लो के दो घटक हैं।

1. लैंगचेन के लिए पेब्लो सुरक्षित डॉक्यूमेंटलोडर
1. पेब्लो सर्वर

यह दस्तावेज़ बताता है कि आप अपने मौजूदा लैंगचेन डॉक्यूमेंटलोडर को पेब्लो सुरक्षित डॉक्यूमेंटलोडर के साथ कैसे बढ़ा सकते हैं ताकि जेन-एआई लैंगचेन एप्लिकेशन में इंगेस्ट किए गए विषयों और संस्थाओं के प्रकारों पर गहरी डेटा दृश्यता प्राप्त की जा सके। `पेब्लो सर्वर` के बारे में विवरण के लिए इस [पेब्लो सर्वर](https://daxa-ai.github.io/pebblo/daemon) दस्तावेज़ देखें।

पेब्लो सेफलोडर लैंगचेन `डॉक्यूमेंटलोडर` के लिए सुरक्षित डेटा इंजेक्शन सक्षम करता है। यह `पेब्लो सुरक्षित डॉक्यूमेंटलोडर` के साथ डॉक्यूमेंट लोडर कॉल को लपेटकर किया जाता है।

नोट: पेब्लो के डिफ़ॉल्ट (localhost:8000) यूआरएल के अलावा किसी अन्य यूआरएल पर पेब्लो सर्वर कॉन्फ़िगर करने के लिए, `PEBBLO_CLASSIFIER_URL` env वेरिएबल में सही यूआरएल डालें। यह `classifier_url` कीवर्ड आर्गुमेंट का उपयोग करके भी कॉन्फ़िगरेबल है। संदर्भ: [सर्वर-कॉन्फ़िगरेशन](https://daxa-ai.github.io/pebblo/config)

#### डॉक्यूमेंट लोडिंग को पेब्लो कैसे सक्षम करें?

मान लीजिए कि एक लैंगचेन RAG एप्लिकेशन स्निपेट `CSVLoader` का उपयोग करके एक CSV दस्तावेज़ को पढ़ने के लिए।

यहां `CSVLoader` का उपयोग करके डॉक्यूमेंट लोडिंग का स्निपेट है।

```python
from langchain.document_loaders.csv_loader import CSVLoader

loader = CSVLoader("data/corp_sens_data.csv")
documents = loader.load()
print(documents)
```

पेब्लो सेफलोडर को कुछ कोड परिवर्तन के साथ सक्षम किया जा सकता है।

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
)
documents = loader.load()
print(documents)
```

### पेब्लो क्लाउड सर्वर को सेमांटिक विषयों और पहचानों भेजें

पेब्लो-क्लाउड को सेमांटिक डेटा भेजने के लिए, api-key को PebbloSafeLoader के रूप में एक तर्क के रूप में पारित करें या वैकल्पिक रूप से, `PEBBLO_API_KEY` पर्यावरण वेरिएबल में api-key रखें।

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
)
documents = loader.load()
print(documents)
```

### लोड किए गए मेटाडेटा में सेमांटिक विषयों और पहचानों को जोड़ें

लोड किए गए दस्तावेजों के मेटाडेटा में सेमांटिक विषयों और सेमांटिक संस्थाओं को जोड़ने के लिए, लोड_सेमांटिक को True के रूप में एक तर्क के रूप में सेट करें या वैकल्पिक रूप से, एक नया पर्यावरण वेरिएबल `PEBBLO_LOAD_SEMANTIC` परिभाषित करें, और इसे True पर सेट करें।

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
    load_semantic=True,  # Load semantic data (Optional, default is False, can be set in the environment variable PEBBLO_LOAD_SEMANTIC)
)
documents = loader.load()
print(documents[0].metadata)
```
