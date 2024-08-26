---
translated: true
---

# Google Cloud SQL for MySQL

> [Cloud SQL](https://cloud.google.com/sql) एक पूरी तरह से प्रबंधित रिलेशनल डेटाबेस सेवा है जो उच्च प्रदर्शन, सुचारु एकीकरण और प्रभावशाली स्केलेबिलिटी प्रदान करती है। यह PostgreSQL, MySQL और SQL Server डेटाबेस इंजन प्रदान करती है। Cloud SQL के LangChain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक `Cloud SQL for MySQL` का उपयोग करके वेक्टर एम्बेडिंग को संग्रहित करने के लिए `MySQLVectorStore` क्लास का उपयोग करने के बारे में बताता है।

[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/) पर पैकेज के बारे में अधिक जानें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/vector_store.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin API को सक्षम करें।](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
 * [एक Cloud SQL इंस्टेंस बनाएं।](https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy#create-instance) (संस्करण **8.0.36** या उससे अधिक होना चाहिए और **cloudsql_vector** डेटाबेस फ्लैग "On" पर कॉन्फ़िगर किया जाना चाहिए)
 * [एक Cloud SQL डेटाबेस बनाएं।](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [डेटाबेस में एक उपयोगकर्ता जोड़ें।](https://cloud.google.com/sql/docs/mysql/create-manage-users)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

`langchain-google-cloud-sql-mysql` एकीकरण लाइब्रेरी और `langchain-google-vertexai` एम्बेडिंग सेवा लाइब्रेरी को इंस्टॉल करें।

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
```

**Colab केवल:** कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित कोशिका को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में Google Cloud संसाधनों तक पहुंचने के लिए, इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

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

**नोट:** MySQL वेक्टर समर्थन केवल MySQL इंस्टेंस पर **>= 8.0.36** संस्करण पर उपलब्ध है।

मौजूदा इंस्टेंस के लिए, आपको [स्वयं सेवा रखरखाव अपडेट](https://cloud.google.com/sql/docs/mysql/self-service-maintenance) करना पड़ सकता है ताकि आपका रखरखाव संस्करण **MYSQL_8_0_36.R20240401.03_00** या उससे अधिक हो जाए। एक बार अपडेट होने के बाद, [अपने डेटाबेस फ्लैग कॉन्फ़िगर करें](https://cloud.google.com/sql/docs/mysql/flags) ताकि नया **cloudsql_vector** फ्लैग "On" हो।

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### MySQLEngine कनेक्शन पूल

Cloud SQL को एक वेक्टर स्टोर के रूप में स्थापित करने के लिए एक आवश्यकता और तर्क है `MySQLEngine` ऑब्जेक्ट। `MySQLEngine` आपके Cloud SQL डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन बनाया जा सके और उद्योग की सर्वोत्तम प्रथाओं का पालन किया जा सके।

`MySQLEngine.from_instance()` का उपयोग करके एक `MySQLEngine` बनाने के लिए आपको केवल 4 चीजें प्रदान करनी होंगी:

1. `project_id`: Cloud SQL इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region`: Cloud SQL इंस्टेंस स्थित क्षेत्र।
1. `instance`: Cloud SQL इंस्टेंस का नाम।
1. `database`: Cloud SQL इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।

डिफ़ॉल्ट रूप से, [IAM डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) डेटाबेस प्रमाणीकरण के तरीके के रूप में उपयोग किया जाएगा। यह लाइब्रेरी [एप्लिकेशन डिफ़ॉल्ट क्रेडेंशियल (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) से प्राप्त IAM प्रिंसिपल का उपयोग करती है।

IAM डेटाबेस प्रमाणीकरण के बारे में अधिक जानकारी के लिए:

* [IAM डेटाबेस प्रमाणीकरण के लिए एक इंस्टेंस कॉन्फ़िगर करें](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [IAM डेटाबेस प्रमाणीकरण के साथ उपयोगकर्ताओं का प्रबंधन करें](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

वैकल्पिक रूप से, उपयोगकर्ता नाम और पासवर्ड का उपयोग करके [बिल्ट-इन डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/mysql/built-in-authentication) का भी उपयोग किया जा सकता है। बस `MySQLEngine.from_instance()` में `user` और `password` तर्क प्रदान करें:

* `user`: बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस उपयोगकर्ता
* `password`: बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस पासवर्ड।

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### एक तालिका इनिशियलाइज़ करें

`MySQLVectorStore` क्लास को एक डेटाबेस तालिका की आवश्यकता होती है। `MySQLEngine` क्लास में एक सहायक विधि `init_vectorstore_table()` है जिसका उपयोग आप द्वारा आवश्यक स्कीमा के साथ एक तालिका बनाने के लिए किया जा सकता है।

```python
engine.init_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### एक एम्बेडिंग क्लास इंस्टेंस बनाएं

आप किसी भी [LangChain एम्बेडिंग मॉडल](/docs/integrations/text_embedding/) का उपयोग कर सकते हैं।
आपको `VertexAIEmbeddings` का उपयोग करने के लिए Vertex AI API को सक्षम करना पड़ सकता है।

हम उत्पादन के लिए एम्बेडिंग मॉडल के संस्करण को पिन करने की सिफारिश करते हैं, [पाठ एम्बेडिंग मॉडल](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings) के बारे में अधिक जानें।

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

### MySQLVectorStore का प्रारंभिकरण

`MySQLVectorStore` क्लास को प्रारंभ करने के लिए आपको केवल 3 चीजें प्रदान करने की आवश्यकता है:

1. `engine` - `MySQLEngine` इंजन का एक उदाहरण।
1. `embedding_service` - LangChain एम्बेडिंग मॉडल का एक उदाहरण।
1. `table_name`: Cloud SQL डेटाबेस में उपयोग करने के लिए टेबल का नाम।

```python
from langchain_google_cloud_sql_mysql import MySQLVectorStore

store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=TABLE_NAME,
)
```

### पाठ जोड़ें

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

store.add_texts(all_texts, metadatas=metadatas, ids=ids)
```

### पाठ हटाएं

आईडी द्वारा वेक्टर स्टोर से वेक्टर हटाएं।

```python
store.delete([ids[1]])
```

### दस्तावेज खोजें

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs[0].page_content)
```

```output
Pineapple
```

### वेक्टर द्वारा दस्तावेज खोजें

किसी दिए गए एम्बेडिंग वेक्टर के समान दस्तावेजों की खोज करना भी संभव है `similarity_search_by_vector` का उपयोग करके, जो एक पैरामीटर के रूप में एम्बेडिंग वेक्टर स्वीकार करता है।

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6})]
```

### एक सूचकांक जोड़ें

वेक्टर खोज क्वेरी को त्वरित करने के लिए एक वेक्टर सूचकांक लागू करें। [MySQL वेक्टर सूचकांक](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/src/langchain_google_cloud_sql_mysql/indexes.py) के बारे में अधिक जानें।

**नोट:** IAM डेटाबेस प्रमाणीकरण (डिफ़ॉल्ट उपयोग) के लिए, वेक्टर सूचकांक पर पूर्ण नियंत्रण के लिए IAM डेटाबेस उपयोगकर्ता को एक विशेषाधिकार प्राप्त डेटाबेस उपयोगकर्ता द्वारा निम्नलिखित अनुमतियों को प्रदान किया जाना चाहिए।

```sql
GRANT EXECUTE ON PROCEDURE mysql.create_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.alter_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.drop_vector_index TO '<IAM_DB_USER>'@'%';
GRANT SELECT ON mysql.vector_indexes TO '<IAM_DB_USER>'@'%';
```

```python
from langchain_google_cloud_sql_mysql import VectorIndex

store.apply_vector_index(VectorIndex())
```

### एक सूचकांक हटाएं

```python
store.drop_vector_index()
```

## उन्नत उपयोग

### कस्टम मेटाडेटा के साथ MySQLVectorStore बनाएं

एक वेक्टर स्टोर संबंधी डेटा का लाभ उठा सकता है ताकि समानता खोज को फ़िल्टर किया जा सके।

एक तालिका और कस्टम मेटाडेटा कॉलम के साथ `MySQLVectorStore` उदाहरण बनाएं।

```python
from langchain_google_cloud_sql_mysql import Column

# set table name
CUSTOM_TABLE_NAME = "vector_store_custom"

engine.init_vectorstore_table(
    table_name=CUSTOM_TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# initialize MySQLVectorStore with custom metadata columns
custom_store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=CUSTOM_TABLE_NAME,
    metadata_columns=["len"],
    # connect to an existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### मेटाडेटा फ़िल्टर के साथ दस्तावेज खोजें

उनके साथ काम करने से पहले दस्तावेजों को संकुचित करना मददगार हो सकता है।

उदाहरण के लिए, मेटाडेटा का उपयोग करके दस्तावेज `filter` तर्क का उपयोग करके फ़िल्टर किए जा सकते हैं।

```python
import uuid

# add texts to the vector store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
custom_store.add_texts(all_texts, metadatas=metadatas, ids=ids)

# use filter on search
query_vector = embedding.embed_query("I'd like a fruit.")
docs = custom_store.similarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6}), Document(page_content='Apples and oranges', metadata={'len': 18}), Document(page_content='Cars and airplanes', metadata={'len': 18})]
```
