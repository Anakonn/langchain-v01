---
translated: true
---

यह दस्तावेज़ गूगल फ़ायरस्टोर में डेटास्टोर मोड के बारे में है।

# गूगल फ़ायरस्टोर में डेटास्टोर मोड

> [डेटास्टोर मोड में फ़ायरस्टोर](https://cloud.google.com/datastore) एक NoSQL दस्तावेज़ डेटाबेस है जो स्वचालित स्केलिंग, उच्च प्रदर्शन और अनुप्रयोग विकास की आसानी के लिए बनाया गया है। डेटास्टोर के Langchain एकीकरणों का उपयोग करके अपने डेटाबेस अनुप्रयोग को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक [डेटास्टोर मोड में फ़ायरस्टोर](https://cloud.google.com/datastore) का उपयोग करके [Langchain दस्तावेज़ों को सहेजने, लोड करने और हटाने](/docs/modules/data_connection/document_loaders/) के बारे में बताता है, जिसमें `DatastoreLoader` और `DatastoreSaver` का उपयोग किया जाता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-datastore-python/) पर मिल सकती है।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-datastore-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक गूगल क्लाउड प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [डेटास्टोर API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)
* [डेटास्टोर मोड में एक फ़ायरस्टोर डेटाबेस बनाएं](https://cloud.google.com/datastore/docs/manage-databases)

इस नोटबुक के रनटाइम वातावरण में डेटाबेस तक पहुंच की पुष्टि करने के बाद, निम्नलिखित मूल्यों को भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-datastore` पैकेज में अपने खुद के में है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-datastore
```

**केवल Colab**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने गूगल क्लाउड प्रोजेक्ट सेट करें

इस नोटबुक में गूगल क्लाउड संसाधनों का लाभ उठाने के लिए अपने गूगल क्लाउड प्रोजेक्ट को सेट करें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* समर्थन पृष्ठ देखें: [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113)।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 प्रमाणीकरण

अपने गूगल क्लाउड प्रोजेक्ट तक पहुंच प्राप्त करने के लिए इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में गूगल क्लाउड में प्रमाणित करें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### दस्तावेज़ सहेजें

`DatastoreSaver.upsert_documents(<documents>)` के साथ Langchain दस्तावेज़ सहेजें। डिफ़ॉल्ट रूप से यह दस्तावेज़ मेटाडेटा में `key` से एंटिटी कुंजी निकालने का प्रयास करेगा।

```python
from langchain_core.documents import Document
from langchain_google_datastore import DatastoreSaver

saver = DatastoreSaver()

data = [Document(page_content="Hello, World!")]
saver.upsert_documents(data)
```

#### बिना कुंजी के दस्तावेज़ सहेजें

यदि `kind` निर्दिष्ट किया जाता है तो दस्तावेज़ स्वतः उत्पन्न आईडी के साथ संग्रहीत किए जाएंगे।

```python
saver = DatastoreSaver("MyKind")

saver.upsert_documents(data)
```

### Kind के माध्यम से दस्तावेज़ लोड करें

`DatastoreLoader.load()` या `DatastoreLoader.lazy_load()` के साथ Langchain दस्तावेज़ लोड करें। `lazy_load` एक जनरेटर लौटाता है जो केवल इटरेशन के दौरान डेटाबेस से प्रश्न करता है। `DatastoreLoader` क्लास को प्रारंभ करने के लिए आपको निम्नलिखित प्रदान करना होगा:
1. `source` - दस्तावेज़ लोड करने का स्रोत। यह Query का एक उदाहरण या पढ़ने के लिए Datastore प्रकार का नाम हो सकता है।

```python
from langchain_google_datastore import DatastoreLoader

loader = DatastoreLoader("MyKind")
data = loader.load()
```

### क्वेरी के माध्यम से दस्तावेज़ लोड करें

प्रकार से दस्तावेज़ लोड करने के अलावा, हम क्वेरी से भी दस्तावेज़ लोड कर सकते हैं। उदाहरण के लिए:

```python
from google.cloud import datastore

client = datastore.Client(database="non-default-db", namespace="custom_namespace")
query_load = client.query(kind="MyKind")
query_load.add_filter("region", "=", "west_coast")

loader_document = DatastoreLoader(query_load)

data = loader_document.load()
```

### दस्तावेज़ हटाएं

`DatastoreSaver.delete_documents(<documents>)` के साथ Datastore से Langchain दस्तावेज़ की एक सूची हटाएं।

```python
saver = DatastoreSaver()

saver.delete_documents(data)

keys_to_delete = [
    ["Kind1", "identifier"],
    ["Kind2", 123],
    ["Kind3", "identifier", "NestedKind", 456],
]
# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, keys_to_delete)
```

## उन्नत उपयोग

### अनुकूलित दस्तावेज़ पृष्ठ सामग्री और मेटाडेटा के साथ दस्तावेज़ लोड करें

`page_content_properties` और `metadata_properties` के तर्क Langchain दस्तावेज़ `page_content` और `metadata` में लिखे जाने वाले एंटिटी गुणों को निर्दिष्ट करेंगे।

```python
loader = DatastoreLoader(
    source="MyKind",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

### पृष्ठ सामग्री प्रारूप अनुकूलित करें

जब `page_content` में केवल एक फ़ील्ड होता है तो जानकारी केवल फ़ील्ड मान होगी। अन्यथा `page_content` JSON प्रारूप में होगा।

### कनेक्शन और प्रमाणीकरण अनुकूलित करें

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = DatastoreLoader(
    source="foo",
    client=client,
)
```
