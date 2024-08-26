---
translated: true
---

# Google AlloyDB for PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb) एक पूरी तरह से प्रबंधित रिलेशनल डेटाबेस सेवा है जो उच्च प्रदर्शन, सुचारु एकीकरण और प्रभावशाली स्केलेबिलिटी प्रदान करती है। AlloyDB PostgreSQL के साथ 100% संगत है। AlloyDB के Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक `AlloyDB for PostgreSQL` का उपयोग करके वेक्टर एम्बेडिंग को संग्रहित करने के लिए `AlloyDBVectorStore` क्लास का उपयोग करने के बारे में बताता है।

[GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/) पर पैकेज के बारे में अधिक जानें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/vector_store.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [AlloyDB API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [एक AlloyDB क्लस्टर और इंस्टेंस बनाएं।](https://cloud.google.com/alloydb/docs/cluster-create)
 * [एक AlloyDB डेटाबेस बनाएं।](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
 * [डेटाबेस में एक उपयोगकर्ता जोड़ें।](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

`langchain-google-alloydb-pg` एकीकरण लाइब्रेरी और `langchain-google-vertexai` एम्बेडिंग सेवा लाइब्रेरी इंस्टॉल करें।

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg langchain-google-vertexai
```

**Colab केवल:** कर्नल को पुनरारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या कर्नल को पुनरारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनरारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में Google Cloud के संसाधनों तक पहुंचने के लिए, इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

इस नोटबुक में Google Cloud संसाधनों का उपयोग करने के लिए अपने Google Cloud प्रोजेक्ट को सेट करें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113) समर्थन पृष्ठ देखें।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

## मूलभूत उपयोग

### AlloyDB डेटाबेस मान सेट करें

[AlloyDB इंस्टेंस पृष्ठ](https://console.cloud.google.com/alloydb/clusters) में अपने डेटाबेस मान ढूंढें।

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-cluster"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### AlloyDBEngine कनेक्शन पूल

AlloyDB को एक वेक्टर स्टोर के रूप में स्थापित करने के लिए एक आवश्यकता और तर्क है `AlloyDBEngine` ऑब्जेक्ट। `AlloyDBEngine` आपके एप्लिकेशन से सफल कनेक्शन को सक्षम करने और उद्योग की सर्वश्रेष्ठ प्रथाओं का पालन करने के लिए आपके AlloyDB डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है।

`AlloyDBEngine.from_instance()` का उपयोग करके एक `AlloyDBEngine` बनाने के लिए आपको केवल 5 चीजें प्रदान करनी होंगी:

1. `project_id`: AlloyDB इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region`: जहां AlloyDB इंस्टेंस स्थित है वह क्षेत्र।
1. `cluster`: AlloyDB क्लस्टर का नाम।
1. `instance`: AlloyDB इंस्टेंस का नाम।
1. `database`: AlloyDB इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।

डिफ़ॉल्ट रूप से, [IAM डेटाबेस प्रमाणीकरण](https://cloud.google.com/alloydb/docs/connect-iam) डेटाबेस प्रमाणीकरण के तरीके के रूप में उपयोग किया जाएगा। यह लाइब्रेरी [एप्लिकेशन डिफ़ॉल्ट क्रेडेंशियल्स (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) से प्राप्त वातावरण से प्राप्त IAM प्रिंसिपल का उपयोग करती है।

वैकल्पिक रूप से, [बिल्ट-इन डेटाबेस प्रमाणीकरण](https://cloud.google.com/alloydb/docs/database-users/about) का उपयोग करके एक उपयोगकर्ता नाम और पासवर्ड का उपयोग करके AlloyDB डेटाबेस तक पहुंच भी की जा सकती है। बस `AlloyDBEngine.from_instance()` में `user` और `password` तर्क प्रदान करें:

* `user`: बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस उपयोगकर्ता
* `password`: बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस पासवर्ड।

**नोट:** यह ट्यूटोरियल एसिंक्रोनस इंटरफ़ेस का प्रदर्शन करता है। सभी एसिंक्रोनस मेथड के पास संबंधित सिंक मेथड हैं।

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = await AlloyDBEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### एक तालिका इनिशियलाइज़ करें

`AlloyDBVectorStore` क्लास को एक डेटाबेस तालिका की आवश्यकता होती है। `AlloyDBEngine` इंजन में एक मदद करने वाली मेथड `init_vectorstore_table()` है जिसका उपयोग आप द्वारा आवश्यक स्कीमा के साथ एक तालिका बनाने के लिए किया जा सकता है।

```python
await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### एक एम्बेडिंग क्लास इंस्टेंस बनाएं

आप किसी भी [LangChain एम्बेडिंग मॉडल](/docs/integrations/text_embedding/) का उपयोग कर सकते हैं।
`VertexAIEmbeddings` का उपयोग करने के लिए आपको Vertex AI API को सक्षम करना होगा। हम उत्पादन के लिए एम्बेडिंग मॉडल के संस्करण को सेट करने की सलाह देते हैं, [पाठ एम्बेडिंग मॉडल](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings) के बारे में अधिक जानें।

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### एक डिफ़ॉल्ट AlloyDBVectorStore इनिशियलाइज़ करें

```python
from langchain_google_alloydb_pg import AlloyDBVectorStore

store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
)
```

### पाठ जोड़ें

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)
```

### पाठ हटाएं

```python
await store.adelete([ids[1]])
```

### दस्तावेज़ों की खोज करें

```python
query = "I'd like a fruit."
docs = await store.asimilarity_search(query)
print(docs)
```

### वेक्टर द्वारा दस्तावेज़ों की खोज करें

```python
query_vector = embedding.embed_query(query)
docs = await store.asimilarity_search_by_vector(query_vector, k=2)
print(docs)
```

## एक इंडेक्स जोड़ें

वेक्टर खोज क्वेरी को त्वरित करने के लिए एक वेक्टर इंडेक्स लागू करें। [वेक्टर इंडेक्स](https://cloud.google.com/blog/products/databases/faster-similarity-search-performance-with-pgvector-indexes) के बारे में अधिक जानें।

```python
from langchain_google_alloydb_pg.indexes import IVFFlatIndex

index = IVFFlatIndex()
await store.aapply_vector_index(index)
```

### पुनः इंडेक्स करें

```python
await store.areindex()  # Re-index using default index name
```

### एक इंडेक्स हटाएं

```python
await store.adrop_vector_index()  # Delete index using default name
```

## एक कस्टम वेक्टर स्टोर बनाएं

एक वेक्टर स्टोर रिलेशनल डेटा का लाभ उठा सकता है ताकि समानता खोज को फ़िल्टर किया जा सके।

कस्टम मेटाडेटा कॉलम के साथ एक तालिका बनाएं।

```python
from langchain_google_alloydb_pg import Column

# Set table name
TABLE_NAME = "vectorstore_custom"

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# Initialize AlloyDBVectorStore
custom_store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
    metadata_columns=["len"],
    # Connect to a existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### मेटाडेटा फ़िल्टर के साथ दस्तावेज़ों की खोज करें

```python
import uuid

# Add texts to the Vector Store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)

# Use filter on search
docs = await custom_store.asimilarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```
