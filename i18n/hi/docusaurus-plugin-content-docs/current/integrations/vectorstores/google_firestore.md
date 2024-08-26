---
sidebar_label: Firestore
translated: true
---

# Google Firestore (Native Mode)

> [Firestore](https://cloud.google.com/firestore) एक सर्वरलेस दस्तावेज़-उन्मुख डेटाबेस है जो किसी भी मांग को पूरा करने के लिए स्केल होता है। Firestore के Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक [Firestore](https://cloud.google.com/firestore) का उपयोग करके वेक्टर को कैसे संग्रहित और उन्हें `FirestoreVectorStore` क्लास का उपयोग करके कैसे क्वेरी करें, इसके बारे में बताता है।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/vectorstores.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [Firestore API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [एक Firestore डेटाबेस बनाएं](https://cloud.google.com/firestore/docs/manage-databases)

इस नोटबुक के रनटाइम वातावरण में डेटाबेस तक पहुंच की पुष्टि करने के बाद, निम्नलिखित मान भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

```python
# @markdown Please specify a source for demo purpose.
COLLECTION_NAME = "test"  # @param {type:"CollectionReference"|"string"}
```

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण अपने `langchain-google-firestore` पैकेज में मौजूद है, इसलिए हमें इसे इंस्टॉल करना होगा। इस नोटबुक के लिए, हम Google Generative AI एम्बेडिंग का उपयोग करने के लिए `langchain-google-genai` भी इंस्टॉल करेंगे।

```python
%pip install -upgrade --quiet langchain-google-firestore langchain-google-vertexai
```

**केवल Colab**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या बटन का उपयोग करें। Vertex AI Workbench के लिए, आप ऊपर के बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने Google Cloud प्रोजेक्ट को सेट करें

अपने Google Cloud प्रोजेक्ट को सेट करें ताकि आप इस नोटबुक में Google Cloud संसाधनों का उपयोग कर सकें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* समर्थन पृष्ठ देखें: [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113)।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "extensions-testing"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 प्रमाणीकरण

इस नोटबुक में Google Cloud के रूप में प्रवेश किए गए IAM उपयोगकर्ता के रूप में प्रमाणित करें ताकि आप अपने Google Cloud प्रोजेक्ट तक पहुंच सकें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

# मूलभूत उपयोग

### FirestoreVectorStore को इनिशियलाइज़ करें

`FirestoreVectorStore` आपको Firestore डेटाबेस में नए वेक्टर को संग्रहित करने देता है। आप किसी भी मॉडल, जिसमें Google Generative AI के वेक्टर भी शामिल हैं, से एम्बेडिंग को संग्रहित करने के लिए इसका उपयोग कर सकते हैं।

```python
from langchain_google_firestore import FirestoreVectorStore
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest",
    project=PROJECT_ID,
)

# Sample data
ids = ["apple", "banana", "orange"]
fruits_texts = ['{"name": "apple"}', '{"name": "banana"}', '{"name": "orange"}']

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
)

# Add the fruits to the vector store
vector_store.add_texts(fruits_texts, ids=ids)
```

एक शॉर्टहैंड के रूप में, आप `from_texts` और `from_documents` विधि का उपयोग करके एक ही कदम में वेक्टर को इनिशियलाइज़ और जोड़ सकते हैं।

```python
vector_store = FirestoreVectorStore.from_texts(
    collection="fruits",
    texts=fruits_texts,
    embedding=embedding,
)
```

```python
from langchain_core.documents import Document

fruits_docs = [Document(page_content=fruit) for fruit in fruits_texts]

vector_store = FirestoreVectorStore.from_documents(
    collection="fruits",
    documents=fruits_docs,
    embedding=embedding,
)
```

### वेक्टर हटाएं

आप `delete` विधि का उपयोग करके डेटाबेस से वेक्टर वाले दस्तावेज़ को हटा सकते हैं। आपको हटाने के लिए वेक्टर का दस्तावेज़ आईडी प्रदान करना होगा। यह डेटाबेस से पूरे दस्तावेज़ को हटा देगा, जिसमें कोई अन्य फ़ील्ड भी हो सकती हैं।

```python
vector_store.delete(ids)
```

### वेक्टर अपडेट करें

वेक्टर को अपडेट करना जोड़ने के समान है। आप दस्तावेज़ आईडी और नया वेक्टर प्रदान करके `add` विधि का उपयोग करके दस्तावेज़ के वेक्टर को अपडेट कर सकते हैं।

```python
fruit_to_update = ['{"name": "apple","price": 12}']
apple_id = "apple"

vector_store.add_texts(fruit_to_update, ids=[apple_id])
```

## समानता खोज

आप `FirestoreVectorStore` का उपयोग करके आपके द्वारा संग्रहित वेक्टरों पर समानता खोज कर सकते हैं। यह समान दस्तावेज़ या पाठ ढूंढने के लिए उपयोगी है।

```python
vector_store.similarity_search("I like fuji apples", k=3)
```

```python
vector_store.max_marginal_relevance_search("fuji", 5)
```

आप `filters` पैरामीटर का उपयोग करके पूर्व-फ़िल्टर को खोज में जोड़ सकते हैं। यह किसी विशिष्ट फ़ील्ड या मान के अनुसार फ़िल्टर करने के लिए उपयोगी है।

```python
from google.cloud.firestore_v1.base_query import FieldFilter

vector_store.max_marginal_relevance_search(
    "fuji", 5, filters=FieldFilter("content", "==", "apple")
)
```

### कनेक्शन और प्रमाणीकरण को अनुकूलित करें

```python
from google.api_core.client_options import ClientOptions
from google.cloud import firestore
from langchain_google_firestore import FirestoreVectorStore

client_options = ClientOptions()
client = firestore.Client(client_options=client_options)

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
    client=client,
)
```
