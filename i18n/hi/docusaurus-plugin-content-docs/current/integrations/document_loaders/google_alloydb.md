---
translated: true
---

# Google AlloyDB for PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb) एक पूरी तरह से प्रबंधित रिलेशनल डेटाबेस सेवा है जो उच्च प्रदर्शन, सुचारु एकीकरण और प्रभावशाली स्केलेबिलिटी प्रदान करता है। AlloyDB PostgreSQL के साथ 100% संगत है। AlloyDB के Langchain एकीकरणों का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक `AlloyDB for PostgreSQL` का उपयोग करके दस्तावेजों को `AlloyDBLoader` क्लास के साथ कैसे लोड करें, इस बारे में चर्चा करता है।

पैकेज के बारे में अधिक जानकारी के लिए [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/) पर जाएं।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [AlloyDB API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [एक AlloyDB क्लस्टर और इंस्टेंस बनाएं।](https://cloud.google.com/alloydb/docs/cluster-create)
 * [एक AlloyDB डेटाबेस बनाएं।](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
 * [डेटाबेस में एक उपयोगकर्ता जोड़ें।](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

`langchain-google-alloydb-pg` एकीकरण लाइब्रेरी इंस्टॉल करें।

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg
```

**केवल Colab:** कर्नल को पुनः प्रारंभ करने के लिए नीचे दिए गए सेल को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में अपने Google Cloud प्रोजेक्ट तक पहुंचने के लिए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

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
* [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113) सपोर्ट पेज देखें।

```python
# @title Project { display-mode: "form" }
PROJECT_ID = "gcp_project_id"  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

## मूलभूत उपयोग

### AlloyDB डेटाबेस चर सेट करें

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

AlloyDB को एक वेक्टर स्टोर के रूप में स्थापित करने के लिए एक आवश्यकता और तर्क है `AlloyDBEngine` ऑब्जेक्ट। `AlloyDBEngine` आपके AlloyDB डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन प्राप्त होते हैं और उद्योग की सर्वश्रेष्ठ प्रथाओं का पालन होता है।

`AlloyDBEngine.from_instance()` का उपयोग करके एक `AlloyDBEngine` बनाने के लिए, आपको केवल 5 चीजें प्रदान करनी होंगी:

1. `project_id` : AlloyDB इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region` : जहां AlloyDB इंस्टेंस स्थित है वह क्षेत्र।
1. `cluster`: AlloyDB क्लस्टर का नाम।
1. `instance` : AlloyDB इंस्टेंस का नाम।
1. `database` : AlloyDB इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।

डिफ़ॉल्ट रूप से, [IAM डेटाबेस प्रमाणीकरण](https://cloud.google.com/alloydb/docs/connect-iam) डेटाबेस प्रमाणीकरण के तरीके के रूप में उपयोग किया जाएगा। यह लाइब्रेरी [एप्लिकेशन डिफ़ॉल्ट क्रेडेंशियल्स (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) से प्राप्त वातावरण से प्राप्त IAM प्रिंसिपल का उपयोग करती है।

वैकल्पिक रूप से, [बिल्ट-इन डेटाबेस प्रमाणीकरण](https://cloud.google.com/alloydb/docs/database-users/about) का उपयोग करके उपयोगकर्ता नाम और पासवर्ड का उपयोग करके AlloyDB डेटाबेस तक पहुंच भी की जा सकती है। बस `AlloyDBEngine.from_instance()` में `user` और `password` तर्क प्रदान करें:

* `user` : बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस उपयोगकर्ता
* `password` : बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस पासवर्ड।

**नोट**: यह ट्यूटोरियल एसिंक्रोनस इंटरफ़ेस का प्रदर्शन करता है। सभी एसिंक्रोनस मेथड के पास संबंधित सिंक मेथड हैं।

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

### AlloyDBLoader बनाएं

```python
from langchain_google_alloydb_pg import AlloyDBLoader

# Creating a basic AlloyDBLoader object
loader = await AlloyDBLoader.create(engine, table_name=TABLE_NAME)
```

### डिफ़ॉल्ट टेबल के माध्यम से दस्तावेज लोड करें

लोडर पहली कॉलम को page_content के रूप में और अन्य सभी कॉलमों को मेटाडेटा के रूप में उपयोग करते हुए टेबल से दस्तावेजों की एक सूची वापस देता है। डिफ़ॉल्ट टेबल में पहली कॉलम page_content के रूप में और दूसरी कॉलम मेटाडेटा (JSON) के रूप में होगी। प्रत्येक पंक्ति एक दस्तावेज़ बन जाती है।

```python
docs = await loader.aload()
print(docs)
```

### कस्टम टेबल/मेटाडेटा या कस्टम पेज सामग्री कॉलम के माध्यम से दस्तावेज लोड करें

```python
loader = await AlloyDBLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### पेज सामग्री प्रारूप सेट करें

लोडर दस्तावेजों की एक सूची वापस देता है, जिसमें प्रत्येक दस्तावेज एक पंक्ति होती है, जिसमें निर्दिष्ट स्ट्रिंग प्रारूप में पेज सामग्री होती है, अर्थात् पाठ (स्पेस से अलग किया गया संयोजन), JSON, YAML, CSV आदि। JSON और YAML प्रारूप में हेडर शामिल हैं, जबकि पाठ और CSV में फ़ील्ड हेडर शामिल नहीं हैं।

```python
loader = AlloyDBLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
