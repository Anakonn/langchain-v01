---
translated: true
---

# Google Vertex AI Search

>[Google Vertex AI Search](https://cloud.google.com/enterprise-search) (पहले `Enterprise Search` के रूप में जाना जाता था `Generative AI App Builder` पर) `Google Cloud` द्वारा प्रदान किए जाने वाले [Vertex AI](https://cloud.google.com/vertex-ai) मशीन लर्निंग प्लेटफॉर्म का एक हिस्सा है।

>`Vertex AI Search` संगठनों को ग्राहकों और कर्मचारियों के लिए जनरेटिव एआई-संचालित खोज इंजन तेजी से बनाने देता है। यह `Google Search` प्रौद्योगिकियों के विविध सेट पर आधारित है, जिसमें सेमेंटिक खोज शामिल है, जो परंपरागत कीवर्ड-आधारित खोज तकनीकों की तुलना में अधिक प्रासंगिक परिणाम प्रदान करने में मदद करता है, क्योंकि यह प्राकृतिक भाषा प्रसंस्करण और मशीन लर्निंग तकनीकों का उपयोग करके सामग्री के भीतर संबंधों और उपयोगकर्ता के क्वेरी इनपुट के इरादे को समझने में मदद करता है। Vertex AI Search भी Google की उपयोगकर्ता खोज समझ और प्रदर्शित परिणामों की प्रासंगिकता को ध्यान में रखने का लाभ उठाता है।

>`Vertex AI Search` `Google Cloud Console` और एक एंटरप्राइज़ वर्कफ़्लो एकीकरण के लिए एक एपीआई में उपलब्ध है।

यह नोटबुक `Vertex AI Search` कॉन्फ़िगर करने और Vertex AI Search रिट्रीवर का उपयोग करने का प्रदर्शन करता है। Vertex AI Search रिट्रीवर [Python क्लाइंट लाइब्रेरी](https://cloud.google.com/generative-ai-app-builder/docs/libraries#client-libraries-install-python) को कैप्सूलीकृत करता है और [Search Service API](https://cloud.google.com/python/docs/reference/discoveryengine/latest/google.cloud.discoveryengine_v1beta.services.search_service) का उपयोग करने के लिए इसका उपयोग करता है।

## पूर्व-आवश्यकताएं स्थापित करें

Vertex AI Search रिट्रीवर का उपयोग करने के लिए आपको `google-cloud-discoveryengine` पैकेज स्थापित करना होगा।

```python
%pip install --upgrade --quiet google-cloud-discoveryengine
```

## Google Cloud और Vertex AI Search तक पहुंच कॉन्फ़िगर करें

अगस्त 2023 से Vertex AI Search सामान्य रूप से उपलब्ध है, बिना अनुमति सूची के।

रिट्रीवर का उपयोग करने से पहले, आपको निम्नलिखित चरणों को पूरा करना होगा:

### एक खोज इंजन बनाएं और एक अव्यवस्थित डेटा स्टोर भरें

- [Vertex AI Search शुरू करने के मार्गदर्शन](https://cloud.google.com/generative-ai-app-builder/docs/try-enterprise-search) का पालन करें ताकि एक Google Cloud परियोजना और Vertex AI Search सेट अप किया जा सके।
- [Google Cloud Console का उपयोग करके एक अव्यवस्थित डेटा स्टोर बनाएं](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es#unstructured-data)
  - इसे `gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs` Cloud Storage फ़ोल्डर से उदाहरण PDF दस्तावेजों से भरें।
  - `Cloud Storage (metadata के बिना)` विकल्प का उपयोग सुनिश्चित करें।

### Vertex AI Search API तक पहुंच के लिए क्रेडेंशियल सेट करें

Vertex AI Search रिट्रीवर द्वारा उपयोग किए जाने वाले [Vertex AI Search क्लाइंट लाइब्रेरीज](https://cloud.google.com/generative-ai-app-builder/docs/libraries) Google Cloud में प्रामाणिक होने के लिए उच्च स्तरीय भाषा समर्थन प्रदान करते हैं।
क्लाइंट लाइब्रेरीज [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) का समर्थन करती हैं; लाइब्रेरीज क्रेडेंशियल को परिभाषित स्थानों में खोजती हैं और API के लिए अनुरोधों को प्रमाणित करने के लिए उन क्रेडेंशियल का उपयोग करती हैं।
ADC के साथ, आप अपने अनुप्रयोग कोड को संशोधित किए बिना विभिन्न वातावरणों, जैसे स्थानीय विकास या उत्पादन, में अपने अनुप्रयोग के लिए क्रेडेंशियल उपलब्ध कर सकते हैं।

यदि [Google Colab](https://colab.google) में चल रहे हैं तो `google.colab.google.auth` के साथ प्रमाणीकरण करें, अन्यथा [समर्थित विधियों](https://cloud.google.com/docs/authentication/application-default-credentials) में से किसी एक का पालन करें ताकि आप सुनिश्चित कर सकें कि आपके Application Default Credentials सही ढंग से सेट हैं।

```python
import sys

if "google.colab" in sys.modules:
    from google.colab import auth as google_auth

    google_auth.authenticate_user()
```

## Vertex AI Search रिट्रीवर कॉन्फ़िगर और उपयोग करें

Vertex AI Search रिट्रीवर `langchain.retriever.GoogleVertexAISearchRetriever` वर्ग में कार्यान्वित है। `get_relevant_documents` विधि एक `langchain.schema.Document` दस्तावेज़ों की सूची लौटाती है जहां प्रत्येक दस्तावेज़ का `page_content` फ़ील्ड दस्तावेज़ सामग्री से भरा होता है।
Vertex AI Search में उपयोग किए जाने वाले डेटा प्रकार (वेबसाइट, संरचित या अव्यवस्थित) के आधार पर `page_content` फ़ील्ड निम्नानुसार भरा जाता है:

- उन्नत अनुक्रमण के साथ वेबसाइट: एक क्वेरी से मेल खाने वाला `extractive answer`। `metadata` फ़ील्ड में से अनुच्छेदों या उत्तरों को निकाले गए दस्तावेज़ों का मेटाडेटा (यदि कोई हो) भरा जाता है।
- अव्यवस्थित डेटा स्रोत: या तो एक `extractive segment` या एक क्वेरी से मेल खाने वाला `extractive answer`। `metadata` फ़ील्ड में से अनुच्छेदों या उत्तरों को निकाले गए दस्तावेज़ों का मेटाडेटा (यदि कोई हो) भरा जाता है।
- संरचित डेटा स्रोत: संरचित डेटा स्रोत से प्राप्त सभी फ़ील्डों को समाहित करने वाला एक स्ट्रिंग json। `metadata` फ़ील्ड में से निकाले गए दस्तावेज़ों का मेटाडेटा (यदि कोई हो) भरा जाता है।

### extractive उत्तर और extractive अनुच्छेद

एक extractive उत्तर वह शब्दश: पाठ है जो प्रत्येक खोज परिणाम के साथ लौटाया जाता है। यह मूल दस्तावेज़ से सीधे निकाला जाता है। extractive उत्तर आमतौर पर वेब पृष्ठों के शीर्ष पर प्रदर्शित किए जाते हैं ताकि एक अंत उपयोगकर्ता को उनके क्वेरी के संदर्भ में प्रासंगिक एक संक्षिप्त उत्तर प्रदान किया जा सके। extractive उत्तर वेबसाइट और अव्यवस्थित खोज के लिए उपलब्ध हैं।

एक extractive अनुच्छेद वह शब्दश: पाठ है जो प्रत्येक खोज परिणाम के साथ लौटाया जाता है। एक extractive अनुच्छेद एक extractive उत्तर से अधिक विस्तृत होता है। extractive अनुच्छेद को एक क्वेरी का उत्तर के रूप में प्रदर्शित किया जा सकता है, और इसका उपयोग पोस्ट-प्रोसेसिंग कार्यों और बड़े भाषा मॉडलों के इनपुट के रूप में किया जा सकता है ताकि उत्तर या नई पाठ्य सामग्री उत्पन्न की जा सके। extractive अनुच्छेद अव्यवस्थित खोज के लिए उपलब्ध हैं।

extractive अनुच्छेदों और extractive उत्तरों के बारे में अधिक जानकारी के लिए [उत्पाद दस्तावेज़ीकरण](https://cloud.google.com/generative-ai-app-builder/docs/snippets) देखें।

नोट: extractive अनुच्छेद के लिए [Enterprise संस्करण](https://cloud.google.com/generative-ai-app-builder/docs/about-advanced-features#enterprise-features) सुविधाएं सक्षम होनी चाहिए।

रिट्रीवर का एक उदाहरण बनाते समय, आप किस डेटा स्टोर का उपयोग करना है और एक प्राकृतिक भाषा क्वेरी को कैसे प्रोसेस किया जाता है, इसमें extractive उत्तर और अनुच्छेद के लिए कॉन्फ़िगरेशन सहित, कई पैरामीटर निर्दिष्ट कर सकते हैं।

### अनिवार्य मापदंड हैं:

- `project_id` - आपका Google Cloud प्रोजेक्ट आईडी।
- `location_id` - डेटा स्टोर का स्थान।
  - `global` (डिफ़ॉल्ट)
  - `us`
  - `eu`

एक में से:
- `search_engine_id` - आप उपयोग करना चाहते हैं खोज ऐप का आईडी। (ब्लेंडेड खोज के लिए आवश्यक)
- `data_store_id` - आप उपयोग करना चाहते हैं डेटा स्टोर का आईडी।

`project_id`, `search_engine_id` और `data_store_id` मापदंड को रिट्रीवर के निर्माता में स्पष्ट रूप से या `PROJECT_ID`, `SEARCH_ENGINE_ID` और `DATA_STORE_ID` पर्यावरण चर के माध्यम से प्रदान किया जा सकता है।

आप कई वैकल्पिक मापदंड भी कॉन्फ़िगर कर सकते हैं, जिनमें शामिल हैं:

- `max_documents` - एक्स्ट्रैक्टिव सेगमेंट या एक्स्ट्रैक्टिव उत्तर प्रदान करने के लिए उपयोग किए जाने वाले अधिकतम दस्तावेज।
- `get_extractive_answers` - डिफ़ॉल्ट रूप से, रिट्रीवर को एक्स्ट्रैक्टिव सेगमेंट लौटाने के लिए कॉन्फ़िगर किया जाता है।
  - इस फ़ील्ड को `True` पर सेट करें ताकि एक्स्ट्रैक्टिव उत्तर लौटाए जा सकें। यह केवल तब उपयोग किया जाता है जब `engine_data_type` को `0` (अструक्चर्ड) पर सेट किया जाता है।
- `max_extractive_answer_count` - प्रत्येक खोज परिणाम में लौटाए जाने वाले अधिकतम एक्स्ट्रैक्टिव उत्तर।
  - अधिकतम 5 उत्तर लौटाए जाएंगे। यह केवल तब उपयोग किया जाता है जब `engine_data_type` को `0` (अструक्चर्ड) पर सेट किया जाता है।
- `max_extractive_segment_count` - प्रत्येक खोज परिणाम में लौटाए जाने वाले अधिकतम एक्स्ट्रैक्टिव सेगमेंट।
  - वर्तमान में एक सेगमेंट लौटाया जाएगा। यह केवल तब उपयोग किया जाता है जब `engine_data_type` को `0` (अstruक्चर्ड) पर सेट किया जाता है।
- `filter` - डेटा स्टोर में दस्तावेजों से संबंधित मेटाडेटा पर आधारित खोज परिणामों के लिए फ़िल्टर अभिव्यक्ति।
- `query_expansion_condition` - यह निर्धारित करने के लिए विनिर्देश कि क्वेरी विस्तार कब होना चाहिए।
  - `0` - अनिर्दिष्ट क्वेरी विस्तार स्थिति। इस मामले में, सर्वर व्यवहार डिसेबल होता है।
  - `1` - क्वेरी विस्तार अक्षम। केवल सटीक खोज क्वेरी का उपयोग किया जाता है, भले ही SearchResponse.total_size शून्य हो।
  - `2` - Search API द्वारा निर्मित स्वचालित क्वेरी विस्तार।
- `engine_data_type` - Vertex AI Search डेटा प्रकार को परिभाषित करता है
  - `0` - अструक्चर्ड डेटा
  - `1` - संरचित डेटा
  - `2` - वेबसाइट डेटा
  - `3` - [ब्लेंडेड खोज](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es#multi-data-stores)

### `GoogleCloudEnterpriseSearchRetriever` के लिए माइग्रेशन गाइड

पिछले संस्करणों में, यह रिट्रीवर `GoogleCloudEnterpriseSearchRetriever` कहलाता था।

नए रिट्रीवर में अपडेट करने के लिए, निम्नलिखित परिवर्तन करें:

- आयात को इस प्रकार बदलें: `from langchain.retrievers import GoogleCloudEnterpriseSearchRetriever` -> `from langchain.retrievers import GoogleVertexAISearchRetriever`।
- सभी क्लास संदर्भों को `GoogleCloudEnterpriseSearchRetriever` से `GoogleVertexAISearchRetriever` में बदलें।

### **अstruक्चर्ड** डेटा के साथ एक्स्ट्रैक्टिव सेगमेंट के लिए रिट्रीवर कॉन्फ़िगर और उपयोग करें

```python
from langchain_community.retrievers import (
    GoogleVertexAIMultiTurnSearchRetriever,
    GoogleVertexAISearchRetriever,
)

PROJECT_ID = "<YOUR PROJECT ID>"  # Set to your Project ID
LOCATION_ID = "<YOUR LOCATION>"  # Set to your data store location
SEARCH_ENGINE_ID = "<YOUR SEARCH APP ID>"  # Set to your search app ID
DATA_STORE_ID = "<YOUR DATA STORE ID>"  # Set to your data store ID
```

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
)
```

```python
query = "What are Alphabet's Other Bets?"

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **अstruक्चर्ड** डेटा के साथ एक्स्ट्रैक्टिव उत्तर के लिए रिट्रीवर कॉन्फ़िगर और उपयोग करें

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **संरचित** डेटा के लिए रिट्रीवर कॉन्फ़िगर और उपयोग करें

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    engine_data_type=1,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### उन्नत वेबसाइट इंडेक्सिंग के साथ **वेबसाइट** डेटा के लिए रिट्रीवर कॉन्फ़िगर और उपयोग करें

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
    engine_data_type=2,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **ब्लेंडेड** डेटा के लिए रिट्रीवर कॉन्फ़िगर और उपयोग करें

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    search_engine_id=SEARCH_ENGINE_ID,
    max_documents=3,
    engine_data_type=3,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### बहु-दौर खोज के लिए रिट्रीवर कॉन्फ़िगर और उपयोग करें

[फॉलो-अप के साथ खोज](https://cloud.google.com/generative-ai-app-builder/docs/multi-turn-search) जनरेटिव AI मॉडलों पर आधारित है और यह नियमित अstruक्चर्ड डेटा खोज से अलग है।

```python
retriever = GoogleVertexAIMultiTurnSearchRetriever(
    project_id=PROJECT_ID, location_id=LOCATION_ID, data_store_id=DATA_STORE_ID
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```
