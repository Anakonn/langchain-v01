---
translated: true
---

# Google Memorystore for Redis

> [Google Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) एक पूरी तरह से प्रबंधित सेवा है जो Redis इन-मेमोरी डेटा स्टोर द्वारा संचालित है, जिससे आप उप-मिलीसेकंड डेटा एक्सेस प्रदान करने वाले एप्लिकेशन कैश बना सकते हैं। Memorystore for Redis के Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक [Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) का उपयोग करके वेक्टर एम्बेडिंग्स को संग्रहित करने के लिए `MemorystoreVectorStore` क्लास का उपयोग करता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/) पर प्राप्त करें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/vector_store.ipynb)

## पूर्व-आवश्यकताएं

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [Memorystore for Redis API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [एक Memorystore for Redis इंस्टेंस बनाएं](https://cloud.google.com/memorystore/docs/redis/create-instance-console)। सुनिश्चित करें कि संस्करण 7.2 या उससे अधिक है।

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-memorystore-redis` पैकेज में अपने खुद का है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis langchain
```

**केवल Colab:** कर्नल को पुनरारंभ करने के लिए निम्नलिखित कोशिका को अनटिप्पण करें या बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनरारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

अपने Google Cloud प्रोजेक्ट को सेट करें ताकि आप इस नोटबुक में Google Cloud संसाधनों का उपयोग कर सकें।

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

अपने Google Cloud प्रोजेक्ट तक पहुंच प्राप्त करने के लिए इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए कोशिका का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### एक वेक्टर इंडेक्स प्रारंभ करें

```python
import redis
from langchain_google_memorystore_redis import (
    DistanceStrategy,
    HNSWConfig,
    RedisVectorStore,
)

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

# Configure HNSW index with descriptive parameters
index_config = HNSWConfig(
    name="my_vector_index", distance_strategy=DistanceStrategy.COSINE, vector_size=128
)

# Initialize/create the vector store index
RedisVectorStore.init_index(client=redis_client, index_config=index_config)
```

### दस्तावेज़ तैयार करें

वेक्टर स्टोर के साथ इंटरैक्ट करने से पहले पाठ को प्रसंस्करण और संख्यात्मक प्रतिनिधित्व में लाना आवश्यक है। इसमें निम्नलिखित शामिल हैं:

* पाठ लोड करना: TextLoader एक फ़ाइल (उदा., "state_of_the_union.txt") से पाठ डेटा प्राप्त करता है।
* पाठ विभाजन: CharacterTextSplitter पाठ को एम्बेडिंग मॉडल के लिए छोटे टुकड़ों में तोड़ता है।

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("./state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### दस्तावेज़ों को वेक्टर स्टोर में जोड़ें

पाठ तैयारी और एम्बेडिंग जनरेशन के बाद, निम्नलिखित विधियां उन्हें Redis वेक्टर स्टोर में डालती हैं।

#### विधि 1: प्रत्यक्ष डालने के लिए वर्गवार

यह दृष्टिकोण एम्बेडिंग सृजन और डालने को एक ही चरण में संयुक्त करता है:

```python
from langchain_community.embeddings.fake import FakeEmbeddings

embeddings = FakeEmbeddings(size=128)
redis_client = redis.from_url("redis://127.0.0.1:6379")
rvs = RedisVectorStore.from_documents(
    docs, embedding=embeddings, client=redis_client, index_name="my_vector_index"
)
```

#### विधि 2: इंस्टेंस-आधारित डालना

यह दृष्टिकोण नए या मौजूदा RedisVectorStore के साथ काम करते समय लचीलापन प्रदान करता है:

* [वैकल्पिक] RedisVectorStore इंस्टेंस बनाएं: अनुकूलन के लिए एक RedisVectorStore ऑब्जेक्ट इंस्टैंशिएट करें। यदि आपके पास पहले से एक इंस्टेंस है, तो अगले चरण पर जाएं।
* मेटाडेटा के साथ पाठ जोड़ें: कच्चे पाठ और मेटाडेटा प्रदान करें। एम्बेडिंग जनरेशन और वेक्टर स्टोर में डालना स्वचालित रूप से संभाला जाता है।

```python
rvs = RedisVectorStore(
    client=redis_client, index_name="my_vector_index", embeddings=embeddings
)
ids = rvs.add_texts(
    texts=[d.page_content for d in docs], metadatas=[d.metadata for d in docs]
)
```

### समानता खोज (KNN) करें

वेक्टर स्टोर भरने के बाद, किसी प्रश्न के अर्थ में समान पाठ को खोजना संभव है। यहां डिफ़ॉल्ट सेटिंग्स के साथ KNN (K-Nearest Neighbors) का उपयोग करने का तरीका है:

* प्रश्न तैयार करें: एक प्राकृतिक भाषा प्रश्न खोज उद्देश्य व्यक्त करता है (उदा., "Ketanji Brown Jackson के बारे में राष्ट्रपति ने क्या कहा")।
* समान परिणाम पुनर्प्राप्त करें: `similarity_search` विधि वेक्टर स्टोर में प्रश्न के अर्थ में सबसे करीबी आइटम ढूंढती है।

```python
import pprint

query = "What did the president say about Ketanji Brown Jackson"
knn_results = rvs.similarity_search(query=query)
pprint.pprint(knn_results)
```

### रेंज-आधारित समानता खोज करें

रेंज क्वेरी प्रश्न पाठ के साथ-साथ इच्छित समानता थ्रेशोल्ड निर्दिष्ट करके अधिक नियंत्रण प्रदान करते हैं:

* प्रश्न तैयार करें: एक प्राकृतिक भाषा प्रश्न खोज उद्देश्य को परिभाषित करता है।
* समानता थ्रेशोल्ड सेट करें: distance_threshold पैरामीटर निर्धारित करता है कि एक मैच कितना करीबी होना चाहिए।
* परिणाम पुनर्प्राप्त करें: `similarity_search_with_score` विधि निर्दिष्ट समानता थ्रेशोल्ड के भीतर आने वाले वेक्टर स्टोर के आइटम ढूंढती है।

```python
rq_results = rvs.similarity_search_with_score(query=query, distance_threshold=0.8)
pprint.pprint(rq_results)
```

### अधिकतम सीमांत प्रासंगिकता (MMR) खोज करें

MMR क्वेरी प्रासंगिकता और विविधता को संतुलित करने का प्रयास करती हैं, जिससे खोज परिणामों में अनावश्यकता कम हो जाती है।

* प्रश्न तैयार करें: एक प्राकृतिक भाषा प्रश्न खोज उद्देश्य को परिभाषित करता है।
* प्रासंगिकता और विविधता का संतुलन करें: lambda_mult पैरामीटर प्रासंगिकता और परिणामों में विविधता को बढ़ावा देने के बीच संतुलन नियंत्रित करता है।
* MMR परिणाम पुनर्प्राप्त करें: `max_marginal_relevance_search` विधि lambda सेटिंग के आधार पर प्रासंगिकता और विविधता के संयुक्त अनुकूलन को अनुकूलित करने वाले आइटम लौटाती है।

```python
mmr_results = rvs.max_marginal_relevance_search(query=query, lambda_mult=0.90)
pprint.pprint(mmr_results)
```

## रिट्रीवर के रूप में वेक्टर स्टोर का उपयोग करें

अन्य LangChain घटकों के साथ सुचारु एकीकरण के लिए, एक वेक्टर स्टोर को एक Retriever में परिवर्तित किया जा सकता है। इससे कई लाभ होते हैं:

* LangChain संगतता: कई LangChain उपकरण और विधियां प्रत्यक्ष रूप से रिट्रीवर के साथ इंटरैक्ट करने के लिए डिज़ाइन की गई हैं।
* उपयोग में आसानी: `as_retriever()` विधि वेक्टर स्टोर को एक ऐसे प्रारूप में परिवर्तित करती है जो क्वेरी करना आसान बनाती है।

```python
retriever = rvs.as_retriever()
results = retriever.invoke(query)
pprint.pprint(results)
```

## सफाई करें

### वेक्टर स्टोर से दस्तावेज़ हटाएं

कभी-कभी, वेक्टर स्टोर से दस्तावेज़ (और उनसे संबंधित वेक्टर) को हटाना आवश्यक होता है। `delete` विधि इस कार्यक्षमता प्रदान करती है।

```python
rvs.delete(ids)
```

### वेक्टर इंडेक्स हटाएं

ऐसी परिस्थितियां हो सकती हैं जहां मौजूदा वेक्टर इंडेक्स को हटाना आवश्यक हो। सामान्य कारण हैं:

* इंडेक्स कॉन्फ़िगरेशन परिवर्तन: यदि इंडेक्स पैरामीटर को संशोधित करने की आवश्यकता है, तो इंडेक्स को हटाकर फिर से बनाना अक्सर आवश्यक होता है।
* स्टोरेज प्रबंधन: अप्रयुक्त इंडेक्स को हटाने से Redis इंस्टेंस में स्थान मुक्त हो सकता है।

सावधानी: वेक्टर इंडेक्स हटाना एक अपरिवर्तनीय संचालन है। प्रक्रिया शुरू करने से पहले सुनिश्चित करें कि संग्रहीत वेक्टर और खोज कार्यक्षमता अब आवश्यक नहीं हैं।

```python
# Delete the vector index
RedisVectorStore.drop_index(client=redis_client, index_name="my_vector_index")
```
