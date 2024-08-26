---
translated: true
---

# गूगल फायरस्टोर (नेटिव मोड)

> [फायरस्टोर](https://cloud.google.com/firestore) एक सर्वरलेस दस्तावेज़ उन्मुख डेटाबेस है जो किसी भी मांग को पूरा करने के लिए स्केल होता है। फायरस्टोर के लैंगचेन एकीकरण का उपयोग करके अपने डेटाबेस अनुप्रयोग को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक [फायरस्टोर](https://cloud.google.com/firestore) का उपयोग करके [लैंगचेन दस्तावेजों को सहेजने, लोड करने और हटाने](/docs/modules/data_connection/document_loaders/) के बारे में बताता है, जिसमें `FirestoreLoader` और `FirestoreSaver` शामिल हैं।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-firestore-python/) पर मिलती है।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक गूगल क्लाउड प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [फायरस्टोर API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [एक फायरस्टोर डेटाबेस बनाएं](https://cloud.google.com/firestore/docs/manage-databases)

इस नोटबुक के रनटाइम वातावरण में डेटाबेस तक पहुंच की पुष्टि करने के बाद, निम्नलिखित मूल्यों को भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

```python
# @markdown Please specify a source for demo purpose.
SOURCE = "test"  # @param {type:"Query"|"CollectionGroup"|"DocumentReference"|"string"}
```

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण अपने `langchain-google-firestore` पैकेज में है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-firestore
```

**केवल Colab**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने गूगल क्लाउड प्रोजेक्ट सेट करें

अपने गूगल क्लाउड प्रोजेक्ट को सेट करें ताकि आप इस नोटबुक में गूगल क्लाउड संसाधनों का उपयोग कर सकें।

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

इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में गूगल क्लाउड में प्रमाणित हों ताकि आप अपने गूगल क्लाउड प्रोजेक्ट तक पहुंच सकें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### दस्तावेज़ सहेजें

`FirestoreSaver` दस्तावेज़ों को फायरस्टोर में संग्रहीत कर सकता है। डिफ़ॉल्ट रूप से यह मेटाडेटा से दस्तावेज़ संदर्भ निकालने का प्रयास करेगा।

`FirestoreSaver.upsert_documents(<documents>)` के साथ लैंगचेन दस्तावेज़ सहेजें।

```python
from langchain_core.documents import Document
from langchain_google_firestore import FirestoreSaver

saver = FirestoreSaver()

data = [Document(page_content="Hello, World!")]

saver.upsert_documents(data)
```

#### संदर्भ के बिना दस्तावेज़ सहेजें

यदि एक संग्रह निर्दिष्ट किया जाता है तो दस्तावेज़ स्वतः उत्पन्न आईडी के साथ संग्रहीत किए जाएंगे।

```python
saver = FirestoreSaver("Collection")

saver.upsert_documents(data)
```

#### अन्य संदर्भों के साथ दस्तावेज़ सहेजें

```python
doc_ids = ["AnotherCollection/doc_id", "foo/bar"]
saver = FirestoreSaver()

saver.upsert_documents(documents=data, document_ids=doc_ids)
```

### संग्रह या उप-संग्रह से लोड करें

`FirestoreLoader.load()` या `Firestore.lazy_load()` के साथ लैंगचेन दस्तावेज़ लोड करें। `lazy_load` एक जनरेटर लौटाता है जो केवल इटरेशन के दौरान डेटाबेस का प्रश्न करता है। `FirestoreLoader` क्लास को प्रारंभ करने के लिए आपको निम्नलिखित प्रदान करना होगा:

1. `source` - एक क्वेरी, संग्रह समूह, दस्तावेज़ संदर्भ या एकल `\`-डिलिमिटेड फायरस्टोर संग्रह पथ का एक उदाहरण।

```python
from langchain_google_firestore import FirestoreLoader

loader_collection = FirestoreLoader("Collection")
loader_subcollection = FirestoreLoader("Collection/doc/SubCollection")


data_collection = loader_collection.load()
data_subcollection = loader_subcollection.load()
```

### एकल दस्तावेज़ लोड करें

```python
from google.cloud import firestore

client = firestore.Client()
doc_ref = client.collection("foo").document("bar")

loader_document = FirestoreLoader(doc_ref)

data = loader_document.load()
```

### संग्रह समूह या क्वेरी से लोड करें

```python
from google.cloud.firestore import CollectionGroup, FieldFilter, Query

col_ref = client.collection("col_group")
collection_group = CollectionGroup(col_ref)

loader_group = FirestoreLoader(collection_group)

col_ref = client.collection("collection")
query = col_ref.where(filter=FieldFilter("region", "==", "west_coast"))

loader_query = FirestoreLoader(query)
```

### दस्तावेज़ हटाएं

`FirestoreSaver.delete_documents(<documents>)` के साथ फायरस्टोर संग्रह से एक सूची के लैंगचेन दस्तावेज़ हटाएं।

यदि दस्तावेज़ आईडी प्रदान किए गए हैं, तो दस्तावेज़ अनदेखे हो जाएंगे।

```python
saver = FirestoreSaver()

saver.delete_documents(data)

# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, doc_ids)
```

## उन्नत उपयोग

### कस्टमाइज़ दस्तावेज़ पृष्ठ सामग्री और मेटाडेटा के साथ दस्तावेज़ लोड करें

`page_content_fields` और `metadata_fields` के तर्क फायरस्टोर दस्तावेज़ फ़ील्ड को निर्दिष्ट करेंगे जिन्हें LangChain दस्तावेज़ `page_content` और `metadata` में लिखा जाएगा।

```python
loader = FirestoreLoader(
    source="foo/bar/subcol",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

#### पृष्ठ सामग्री प्रारूप कस्टमाइज़ करें

जब `page_content` में केवल एक फ़ील्ड होता है तो जानकारी केवल फ़ील्ड मान होगी। अन्यथा `page_content` JSON प्रारूप में होगा।

### कनेक्शन और प्रमाणीकरण कस्टमाइज़ करें

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = FirestoreLoader(
    source="foo",
    client=client,
)
```
