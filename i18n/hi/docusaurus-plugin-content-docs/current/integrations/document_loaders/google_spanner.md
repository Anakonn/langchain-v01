---
translated: true
---

# गूगल स्पैनर

> [स्पैनर](https://cloud.google.com/spanner) एक अत्यधिक स्केलेबल डेटाबेस है जो अनीमिक स्केलेबिलिटी के साथ रिलेशनल सेमेंटिक्स, जैसे सेकंडरी इंडेक्स, मजबूत सुसंगति, स्कीमा और SQL का संयोजन प्रदान करता है, जो एक आसान समाधान में 99.999% उपलब्धता प्रदान करता है।

यह नोटबुक [स्पैनर](https://cloud.google.com/spanner) का उपयोग करके कैसे `SpannerLoader` और `SpannerDocumentSaver` के साथ [लैंगचेन दस्तावेजों को सहेजना, लोड करना और हटाना](/docs/modules/data_connection/document_loaders/) का विवरण देता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-spanner-python/) पर।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित करना होगा:

* [एक गूगल क्लाउड प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [क्लाउड स्पैनर API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
* [एक स्पैनर इंस्टेंस बनाएं](https://cloud.google.com/spanner/docs/create-manage-instances)
* [एक स्पैनर डेटाबेस बनाएं](https://cloud.google.com/spanner/docs/create-manage-databases)
* [एक स्पैनर टेबल बनाएं](https://cloud.google.com/spanner/docs/create-query-database-console#create-schema)

इस नोटबुक के रनटाइम वातावरण में डेटाबेस तक पहुंच की पुष्टि करने के बाद, निम्नलिखित मूल्यों को भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

```python
# @markdown Please specify an instance id, a database, and a table for demo purpose.
INSTANCE_ID = "test_instance"  # @param {type:"string"}
DATABASE_ID = "test_database"  # @param {type:"string"}
TABLE_NAME = "test_table"  # @param {type:"string"}
```

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-spanner` पैकेज में अपने खुद का है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-spanner langchain
```

**केवल Colab**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने गूगल क्लाउड प्रोजेक्ट सेट करें

अपने गूगल क्लाउड प्रोजेक्ट को सेट करें ताकि आप इस नोटबुक में गूगल क्लाउड संसाधनों का लाभ उठा सकें।

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

इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में गूगल क्लाउड में प्रमाणित करें ताकि आप अपने गूगल क्लाउड प्रोजेक्ट तक पहुंच सकें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### दस्तावेज़ सहेजना

`SpannerDocumentSaver.add_documents(<documents>)` के साथ लैंगचेन दस्तावेज़ सहेजें। `SpannerDocumentSaver` क्लास को प्रारंभ करने के लिए आपको 3 चीज़ों की आवश्यकता होती है:

1. `instance_id` - डेटा लोड करने के लिए स्पैनर का एक इंस्टेंस।
1. `database_id` - डेटा लोड करने के लिए स्पैनर डेटाबेस का एक इंस्टेंस।
1. `table_name` - स्पैनर डेटाबेस में लैंगचेन दस्तावेज़ को संग्रहित करने के लिए टेबल का नाम।

```python
from langchain_core.documents import Document
from langchain_google_spanner import SpannerDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]

saver = SpannerDocumentSaver(
    instance_id=INSTANCE_ID,
    database_id=DATABASE_ID,
    table_name=TABLE_NAME,
)
saver.add_documents(test_docs)
```

### स्पैनर से दस्तावेज़ क्वेरी करना

स्पैनर टेबल से कनेक्ट करने के बारे में अधिक जानकारी के लिए, कृपया [Python SDK दस्तावेज़ीकरण](https://cloud.google.com/python/docs/reference/spanner/latest) देखें।

#### टेबल से दस्तावेज़ लोड करें

`SpannerLoader.load()` या `SpannerLoader.lazy_load()` के साथ लैंगचेन दस्तावेज़ लोड करें। `lazy_load` एक जनरेटर लौटाता है जो केवल इटरेशन के दौरान डेटाबेस क्वेरी करता है। `SpannerLoader` क्लास को प्रारंभ करने के लिए आपको निम्नलिखित प्रदान करने की आवश्यकता होती है:

1. `instance_id` - डेटा लोड करने के लिए स्पैनर का एक इंस्टेंस।
1. `database_id` - डेटा लोड करने के लिए स्पैनर डेटाबेस का एक इंस्टेंस।
1. `query` - डेटाबेस वाक्यविन्यास का एक क्वेरी।

```python
from langchain_google_spanner import SpannerLoader

query = f"SELECT * from {TABLE_NAME}"
loader = SpannerLoader(
    instance_id=INSTANCE_ID,
    database_id=DATABASE_ID,
    query=query,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### दस्तावेज़ हटाना

`SpannerDocumentSaver.delete(<documents>)` के साथ टेबल से एक दस्तावेज़ सूची हटाएं।

```python
docs = loader.load()
print("Documents before delete:", docs)

doc = test_docs[0]
saver.delete([doc])
print("Documents after delete:", loader.load())
```

## उन्नत उपयोग

### कस्टम क्लाइंट

डिफ़ॉल्ट रूप से बनाया गया क्लाइंट डिफ़ॉल्ट क्लाइंट है। `credentials` और `project` को स्पष्ट रूप से पारित करने के लिए, कंस्ट्रक्टर में एक कस्टम क्लाइंट पारित किया जा सकता है।

```python
from google.cloud import spanner
from google.oauth2 import service_account

creds = service_account.Credentials.from_service_account_file("/path/to/key.json")
custom_client = spanner.Client(project="my-project", credentials=creds)
loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    client=custom_client,
)
```

### पृष्ठ सामग्री और मेटाडेटा को अनुकूलित करें

लोडर एक विशिष्ट डेटा कॉलम से पृष्ठ सामग्री के साथ दस्तावेज़ों की एक सूची लौटाता है। अन्य सभी डेटा कॉलम को मेटाडेटा में जोड़ा जाएगा। प्रत्येक पंक्ति एक दस्तावेज़ बन जाती है।

#### पृष्ठ सामग्री प्रारूप को अनुकूलित करें

SpannerLoader मानता है कि `page_content` नामक एक कॉलम है। ये डिफ़ॉल्ट को इस प्रकार बदला जा सकता है:

```python
custom_content_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, content_columns=["custom_content"]
)
```

यदि एक से अधिक कॉलम निर्दिष्ट किए गए हैं, तो पृष्ठ सामग्री का स्ट्रिंग प्रारूप `text` (स्पेस-अलग किया गया स्ट्रिंग संयोजन) होगा। उपयोगकर्ता `text`, `JSON`, `YAML`, `CSV` सहित अन्य प्रारूप निर्दिष्ट कर सकते हैं।

#### मेटाडेटा प्रारूप को अनुकूलित करें

SpannerLoader मानता है कि `langchain_metadata` नामक एक मेटाडेटा कॉलम है जो JSON डेटा संग्रहित करता है। मेटाडेटा कॉलम को आधार डिक्शनरी के रूप में उपयोग किया जाएगा। डिफ़ॉल्ट रूप से, अन्य सभी कॉलम डेटा जोड़ दिए जाएंगे और मूल मान को ओवरराइट कर सकते हैं। ये डिफ़ॉल्ट को इस प्रकार बदला जा सकता है:

```python
custom_metadata_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, metadata_columns=["column1", "column2"]
)
```

#### JSON मेटाडेटा कॉलम नाम को अनुकूलित करें

डिफ़ॉल्ट रूप से, लोडर `langchain_metadata` का उपयोग करता है जो आधार डिक्शनरी के रूप में मेटाडेटा के लिए उपयोग किया जाता है। इसे उस JSON कॉलम को चुनने के लिए अनुकूलित किया जा सकता है जिसका उपयोग Document के मेटाडेटा के लिए आधार डिक्शनरी के रूप में किया जाना है।

```python
custom_metadata_json_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, metadata_json_column="another-json-column"
)
```

### कस्टम स्टेलनेस

डिफ़ॉल्ट [स्टेलनेस](https://cloud.google.com/python/docs/reference/spanner/latest/snapshot-usage#beginning-a-snapshot) 15 सेकंड है। इसे एक कमज़ोर बाउंड (जो या तो किसी दिए गए समय-मान के रूप में सभी पठन को करने के लिए हो सकता है) या पिछले कुछ समय के रूप में निर्दिष्ट करके अनुकूलित किया जा सकता है।

```python
import datetime

timestamp = datetime.datetime.utcnow()
custom_timestamp_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    staleness=timestamp,
)
```

```python
duration = 20.0
custom_duration_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    staleness=duration,
)
```

### डेटा बूस्ट चालू करें

डिफ़ॉल्ट रूप से, लोडर [डेटा बूस्ट](https://cloud.google.com/spanner/docs/databoost/databoost-overview) का उपयोग नहीं करेगा क्योंकि इससे अतिरिक्त लागत जुड़ी हुई है, और अतिरिक्त IAM अनुमतियों की आवश्यकता होती है। हालांकि, उपयोगकर्ता इसे चालू करने का विकल्प चुन सकता है।

```python
custom_databoost_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    databoost=True,
)
```

### कस्टम क्लाइंट

डिफ़ॉल्ट रूप से बनाया गया क्लाइंट डिफ़ॉल्ट क्लाइंट है। `credentials` और `project` को स्पष्ट रूप से पास करने के लिए, कंस्ट्रक्टर में एक कस्टम क्लाइंट पास किया जा सकता है।

```python
from google.cloud import spanner

custom_client = spanner.Client(project="my-project", credentials=creds)
saver = SpannerDocumentSaver(
    INSTANCE_ID,
    DATABASE_ID,
    TABLE_NAME,
    client=custom_client,
)
```

### SpannerDocumentSaver के लिए कस्टम प्रारंभीकरण

SpannerDocumentSaver कस्टम प्रारंभीकरण की अनुमति देता है। यह उपयोगकर्ता को यह निर्दिष्ट करने की अनुमति देता है कि डॉक्यूमेंट को टेबल में कैसे सहेजा जाए।

content_column: यह डॉक्यूमेंट के पृष्ठ सामग्री के लिए कॉलम नाम के रूप में उपयोग किया जाएगा। डिफ़ॉल्ट रूप से `page_content` है।

metadata_columns: यदि डॉक्यूमेंट के मेटाडेटा में कुंजी मौजूद है, तो यह मेटाडेटा विशिष्ट कॉलम में सहेजा जाएगा।

metadata_json_column: यह विशेष JSON कॉलम के लिए कॉलम नाम होगा। डिफ़ॉल्ट रूप से `langchain_metadata` है।

```python
custom_saver = SpannerDocumentSaver(
    INSTANCE_ID,
    DATABASE_ID,
    TABLE_NAME,
    content_column="my-content",
    metadata_columns=["foo"],
    metadata_json_column="my-special-json-column",
)
```

### Spanner के लिए कस्टम स्कीमा प्रारंभ करें

SpannerDocumentSaver में `init_document_table` मेथड होगा जो कस्टम स्कीमा के साथ नई तालिका बनाने के लिए होगा।

```python
from langchain_google_spanner import Column

new_table_name = "my_new_table"

SpannerDocumentSaver.init_document_table(
    INSTANCE_ID,
    DATABASE_ID,
    new_table_name,
    content_column="my-page-content",
    metadata_columns=[
        Column("category", "STRING(36)", True),
        Column("price", "FLOAT64", False),
    ],
)
```
