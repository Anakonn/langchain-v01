---
translated: true
---

# Google Cloud SQL for PostgreSQL

> [Cloud SQL](https://cloud.google.com/sql) एक पूरी तरह से प्रबंधित रिलेशनल डेटाबेस सेवा है जो उच्च प्रदर्शन, सुचारु एकीकरण और प्रभावशाली स्केलेबिलिटी प्रदान करती है। यह PostgreSQL, PostgreSQL और SQL Server डेटाबेस इंजन प्रदान करती है। Cloud SQL के Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक `Cloud SQL for PostgreSQL` का उपयोग करके `PostgresVectorStore` क्लास के साथ वेक्टर एम्बेडिंग को कैसे संग्रहित करें, इसके बारे में बताता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/) पर प्राप्त करें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/vector_store.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin API को सक्षम करें।](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
 * [एक Cloud SQL इंस्टेंस बनाएं।](https://cloud.google.com/sql/docs/postgres/connect-instance-auth-proxy#create-instance)
 * [एक Cloud SQL डेटाबेस बनाएं।](https://cloud.google.com/sql/docs/postgres/create-manage-databases)
 * [डेटाबेस में एक उपयोगकर्ता जोड़ें।](https://cloud.google.com/sql/docs/postgres/create-manage-users)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

`langchain-google-cloud-sql-pg` एकीकरण लाइब्रेरी और एम्बेडिंग सेवा के लिए `langchain-google-vertexai` लाइब्रेरी इंस्टॉल करें।

```python
%pip install --upgrade --quiet  langchain-google-cloud-sql-pg langchain-google-vertexai
```

**Colab केवल:** कर्नल को पुनरारंभ करने के लिए निम्नलिखित कोशिका को अनकमेंट करें या कर्नल को पुनरारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनरारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में Google Cloud संसाधनों का उपयोग करने के लिए, इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए कोशिका का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

इस नोटबुक में Google Cloud संसाधनों का उपयोग करने के लिए अपने Google Cloud प्रोजेक्ट को सेट करें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित कोशिका आज़मा सकते हैं:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113) सपोर्ट पेज देखें।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

## मूलभूत उपयोग

### Cloud SQL डेटाबेस मूल्य सेट करें

[Cloud SQL इंस्टेंस पृष्ठ](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687) में अपने डेटाबेस मूल्य ढूंढें।

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-pg-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### PostgresEngine कनेक्शन पूल

Cloud SQL को एक वेक्टर स्टोर के रूप में स्थापित करने के लिए एक आवश्यकता और तर्क है `PostgresEngine` ऑब्जेक्ट। `PostgresEngine` आपके Cloud SQL डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन बनाया जा सके और उद्योग की सर्वश्रेष्ठ प्रथाओं का पालन किया जा सके।

`PostgresEngine.from_instance()` का उपयोग करके एक `PostgresEngine` बनाने के लिए आपको केवल 4 चीजें प्रदान करनी होंगी:

1.   `project_id` : Cloud SQL इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region` : Cloud SQL इंस्टेंस स्थित क्षेत्र।
1. `instance` : Cloud SQL इंस्टेंस का नाम।
1. `database` : Cloud SQL इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।

डिफ़ॉल्ट रूप से, [IAM डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/postgres/iam-authentication#iam-db-auth) डेटाबेस प्रमाणीकरण का तरीका होगा। यह लाइब्रेरी [एप्लिकेशन डिफ़ॉल्ट क्रेडेंशियल्स (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) से प्राप्त वातावरण से प्राप्त IAM प्रिंसिपल का उपयोग करती है।

IAM डेटाबेस प्रमाणीकरण के बारे में अधिक जानकारी के लिए:

* [IAM डेटाबेस प्रमाणीकरण के लिए एक इंस्टेंस कॉन्फ़िगर करें](https://cloud.google.com/sql/docs/postgres/create-edit-iam-instances)
* [IAM डेटाबेस प्रमाणीकरण के साथ उपयोगकर्ताओं का प्रबंधन करें](https://cloud.google.com/sql/docs/postgres/add-manage-iam-users)

वैकल्पिक रूप से, Cloud SQL डेटाबेस तक पहुंचने के लिए [बिल्ट-इन डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/postgres/built-in-authentication) का उपयोग करके उपयोगकर्ता नाम और पासवर्ड का उपयोग किया जा सकता है। बस `PostgresEngine.from_instance()` में वैकल्पिक `user` और `password` तर्क प्रदान करें:

* `user` : बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस उपयोगकर्ता
* `password` : बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस पासवर्ड।

"**नोट**: यह ट्यूटोरियल एसिंक्रोनस इंटरफ़ेस का प्रदर्शन करता है। सभी एसिंक्रोनस मेथड के पास संबंधित सिंक मेथड हैं।"

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = await PostgresEngine.afrom_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### एक टेबल इनिशियलाइज़ करें

`PostgresVectorStore` क्लास को एक डेटाबेस टेबल की आवश्यकता होती है। `PostgresEngine` इंजन में एक हेल्पर मेथड `init_vectorstore_table()` है जिसका उपयोग आप टेबल को उचित स्कीमा के साथ बनाने के लिए कर सकते हैं।

```python
from langchain_google_cloud_sql_pg import PostgresEngine

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### एम्बेडिंग क्लास इंस्टेंस बनाएं

आप किसी भी [LangChain एम्बेडिंग मॉडल](/docs/integrations/text_embedding/) का उपयोग कर सकते हैं।
आपको `VertexAIEmbeddings` का उपयोग करने के लिए Vertex AI API को सक्षम करना पड़ सकता है। हम उत्पादन के लिए एम्बेडिंग मॉडल के संस्करण को सेट करने की सिफारिश करते हैं, [पाठ एम्बेडिंग मॉडल](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings) के बारे में अधिक जानें।

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

### एक डिफ़ॉल्ट PostgresVectorStore इनिशियलाइज़ करें

```python
from langchain_google_cloud_sql_pg import PostgresVectorStore

store = await PostgresVectorStore.create(  # Use .create() to initialize an async vector store
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
from langchain_google_cloud_sql_pg.indexes import IVFFlatIndex

index = IVFFlatIndex()
await store.aapply_vector_index(index)
```

### पुनः इंडेक्स करें

```python
await store.areindex()  # Re-index using default index name
```

### एक इंडेक्स हटाएं

```python
await store.aadrop_vector_index()  # Delete index using default name
```

## एक कस्टम वेक्टर स्टोर बनाएं

एक वेक्टर स्टोर रिलेशनल डेटा का लाभ उठा सकता है ताकि समानता खोज में फ़िल्टर किया जा सके।

कस्टम मेटाडेटा कॉलम के साथ एक टेबल बनाएं।

```python
from langchain_google_cloud_sql_pg import Column

# Set table name
TABLE_NAME = "vectorstore_custom"

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# Initialize PostgresVectorStore
custom_store = await PostgresVectorStore.create(
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
