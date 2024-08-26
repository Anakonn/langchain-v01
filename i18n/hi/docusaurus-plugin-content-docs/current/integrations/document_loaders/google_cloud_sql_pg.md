---
translated: true
---

# Google Cloud SQL for PostgreSQL

> [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres) एक पूरी तरह से प्रबंधित डेटाबेस सेवा है जो आपको Google Cloud Platform पर अपने PostgreSQL रिलेशनल डेटाबेस को सेट अप, बनाए रखने, प्रबंधित और प्रशासित करने में मदद करती है। Cloud SQL for PostgreSQL के Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक `Cloud SQL for PostgreSQL` का उपयोग करके `PostgresLoader` क्लास के साथ दस्तावेज़ लोड करने के बारे में बताता है।

पैकेज के बारे में अधिक जानकारी के लिए [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/) पर जाएं।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin API को सक्षम करें।](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [एक Cloud SQL for PostgreSQL इंस्टेंस बनाएं।](https://cloud.google.com/sql/docs/postgres/create-instance)
 * [एक Cloud SQL for PostgreSQL डेटाबेस बनाएं।](https://cloud.google.com/sql/docs/postgres/create-manage-databases)
 * [डेटाबेस में एक उपयोगकर्ता जोड़ें।](https://cloud.google.com/sql/docs/postgres/create-manage-users)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

`langchain_google_cloud_sql_pg` एकीकरण लाइब्रेरी इंस्टॉल करें।

```python
%pip install --upgrade --quiet  langchain_google_cloud_sql_pg
```

**Colab केवल:** कर्नल को पुनरारंभ करने के लिए नीचे दिए गए कोशिका को अनकमेंट करें या कर्नल को पुनरारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनरारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में Google Cloud संसाधनों तक पहुंचने के लिए इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए कोशिका का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

इस नोटबुक में Google Cloud संसाधनों का उपयोग कर सकें, इसलिए अपने Google Cloud प्रोजेक्ट को सेट करें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113) सपोर्ट पेज देखें।

```python
# @title Project { display-mode: "form" }
PROJECT_ID = "gcp_project_id"  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

## मूलभूत उपयोग

### Cloud SQL डेटाबेस मान सेट करें

[Cloud SQL इंस्टेंस पृष्ठ](https://console.cloud.google.com/sql/instances) में अपने डेटाबेस चर ढूंढें।

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Cloud SQL इंजन

PostgreSQL को एक दस्तावेज़ लोडर के रूप में स्थापित करने के लिए एक आवश्यकता और तर्क है `PostgresEngine` ऑब्जेक्ट। `PostgresEngine` आपके Cloud SQL for PostgreSQL डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन बनाया जा सके और उद्योग की सर्वोत्तम प्रथाओं का पालन किया जा सके।

`PostgresEngine.from_instance()` का उपयोग करके एक `PostgresEngine` बनाने के लिए, आपको केवल 4 चीज़ें प्रदान करनी होंगी:

1. `project_id` : Cloud SQL इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region` : जहां Cloud SQL इंस्टेंस स्थित है वह क्षेत्र।
1. `instance` : Cloud SQL इंस्टेंस का नाम।
1. `database` : Cloud SQL इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।

डिफ़ॉल्ट रूप से, [IAM डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/postgres/iam-authentication) डेटाबेस प्रमाणीकरण के तरीके के रूप में उपयोग किया जाएगा। यह लाइब्रेरी [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) से प्राप्त वातावरण से प्राप्त IAM प्रिंसिपल का उपयोग करती है।

वैकल्पिक रूप से, [बिल्ट-इन डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/postgres/users) का उपयोग करके उपयोगकर्ता नाम और पासवर्ड का उपयोग करके Cloud SQL डेटाबेस तक पहुंच भी की जा सकती है। बस `PostgresEngine.from_instance()` में वैकल्पिक `user` और `password` तर्क प्रदान करें:

* `user` : बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस उपयोगकर्ता
* `password` : बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस पासवर्ड।

**नोट**: यह ट्यूटोरियल एसिंक्रोनस इंटरफ़ेस का प्रदर्शन करता है। सभी एसिंक्रोनस मेथड के पास संबंधित सिंक मेथड हैं।

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = await PostgresEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
)
```

### PostgresLoader बनाएं

```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgreSQL object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)
```

### डिफ़ॉल्ट तालिका के माध्यम से दस्तावेज़ लोड करें

लोडर तालिका का उपयोग करके दस्तावेज़ों की एक सूची लौटाता है, जहां पहला कॉलम `page_content` और अन्य सभी कॉलम `metadata` के रूप में होते हैं। डिफ़ॉल्ट तालिका में पहला कॉलम `page_content` और दूसरा कॉलम `metadata` (JSON) होगा। प्रत्येक पंक्ति एक दस्तावेज़ बन जाती है। कृपया ध्यान दें कि यदि आप अपने दस्तावेज़ों में आईडी होना चाहते हैं, तो आपको उन्हें जोड़ना होगा।

```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgresLoader object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)

docs = await loader.aload()
print(docs)
```

### कस्टम तालिका/मेटाडेटा या कस्टम पेज सामग्री कॉलम के माध्यम से दस्तावेज़ लोड करें

```python
loader = await PostgresLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### पेज सामग्री प्रारूप सेट करें

लोडर दस्तावेज़ों की एक सूची लौटाता है, जहां प्रत्येक दस्तावेज़ एक पंक्ति होता है, जिसमें निर्दिष्ट स्ट्रिंग प्रारूप में पेज सामग्री होती है, अर्थात् पाठ (स्पेस से अलग किया गया संयोजन), JSON, YAML, CSV आदि। JSON और YAML प्रारूप में हेडर शामिल होते हैं, जबकि पाठ और CSV में फ़ील्ड हेडर शामिल नहीं होते हैं।

```python
loader = await PostgresLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
