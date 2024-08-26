---
translated: true
---

# Google Bigtable

> [Bigtable](https://cloud.google.com/bigtable) एक कुंजी-मूल्य और व्यापक-स्तंभ स्टोर है, जो संरचित, अर्ध-संरचित या अव्यवस्थित डेटा तक तेज़ पहुंच के लिए उपयुक्त है। Bigtable के Langchain एकीकरण का उपयोग करके अपने डेटाबेस अनुप्रयोग को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक [Bigtable](https://cloud.google.com/bigtable) का उपयोग करके [Langchain दस्तावेज़ों को सहेजने, लोड करने और हटाने](/docs/modules/data_connection/document_loaders/) के बारे में बताता है, जिसमें `BigtableLoader` और `BigtableSaver` का उपयोग किया जाता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-bigtable-python/) पर प्राप्त करें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [Bigtable API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [एक Bigtable इंस्टेंस बनाएं](https://cloud.google.com/bigtable/docs/creating-instance)
* [एक Bigtable टेबल बनाएं](https://cloud.google.com/bigtable/docs/managing-tables)
* [Bigtable एक्सेस क्रेडेंशियल बनाएं](https://developers.google.com/workspace/guides/create-credentials)

इस नोटबुक के रनटाइम वातावरण में डेटाबेस तक पहुंच की पुष्टि करने के बाद, निम्नलिखित मूल्यों को भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-bigtable` पैकेज में अपना खुद का है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**Colab केवल**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

इस नोटबुक में Google Cloud संसाधनों का लाभ उठाने के लिए अपने Google Cloud प्रोजेक्ट को सेट करें।

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

इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें ताकि आप अपने Google Cloud प्रोजेक्ट तक पहुंच सकें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### सेवर का उपयोग करना

`BigtableSaver.add_documents(<documents>)` के साथ Langchain दस्तावेज़ सहेजें। `BigtableSaver` वर्ग को प्रारंभ करने के लिए आपको 2 चीज़ें प्रदान करनी होंगी:

1. `instance_id` - एक Bigtable इंस्टेंस।
1. `table_id` - Langchain दस्तावेज़ को संग्रहित करने के लिए Bigtable के भीतर टेबल का नाम।

```python
from langchain_core.documents import Document
from langchain_google_bigtable import BigtableSaver

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

saver = BigtableSaver(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

saver.add_documents(test_docs)
```

### Bigtable से दस्तावेज़ों को क्वेरी करना

Bigtable टेबल से कनेक्ट करने के बारे में अधिक जानकारी के लिए, कृपया [Python SDK दस्तावेज़ीकरण](https://cloud.google.com/python/docs/reference/bigtable/latest/client) देखें।

#### टेबल से दस्तावेज़ लोड करें

`BigtableLoader.load()` या `BigtableLoader.lazy_load()` के साथ Langchain दस्तावेज़ लोड करें। `lazy_load` एक जनरेटर लौटाता है जो केवल इटरेशन के दौरान डेटाबेस से क्वेरी करता है। `BigtableLoader` वर्ग को प्रारंभ करने के लिए आपको निम्नलिखित प्रदान करने की आवश्यकता है:

1. `instance_id` - एक Bigtable इंस्टेंस।
1. `table_id` - Langchain दस्तावेज़ को संग्रहित करने के लिए Bigtable के भीतर टेबल का नाम।

```python
from langchain_google_bigtable import BigtableLoader

loader = BigtableLoader(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### दस्तावेज़ हटाएं

`BigtableSaver.delete(<documents>)` के साथ Bigtable टेबल से एक सूची Langchain दस्तावेज़ हटाएं।

```python
from langchain_google_bigtable import BigtableSaver

docs = loader.load()
print("Documents before delete: ", docs)

onedoc = test_docs[0]
saver.delete([onedoc])
print("Documents after delete: ", loader.load())
```

## उन्नत उपयोग

### लौटाए गए पंक्तियों को सीमित करना

लौटाए गए पंक्तियों को सीमित करने के दो तरीके हैं:

1. [फ़िल्टर](https://cloud.google.com/python/docs/reference/bigtable/latest/row-filters) का उपयोग करना
2. [row_set](https://cloud.google.com/python/docs/reference/bigtable/latest/row-set#google.cloud.bigtable.row_set.RowSet) का उपयोग करना

```python
import google.cloud.bigtable.row_filters as row_filters

filter_loader = BigtableLoader(
    INSTANCE_ID, TABLE_ID, filter=row_filters.ColumnQualifierRegexFilter(b"os_build")
)


from google.cloud.bigtable.row_set import RowSet

row_set = RowSet()
row_set.add_row_range_from_keys(
    start_key="phone#4c410523#20190501", end_key="phone#4c410523#201906201"
)

row_set_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    row_set=row_set,
)
```

### कस्टम क्लाइंट

डिफ़ॉल्ट रूप से बनाया गया क्लाइंट केवल admin=True विकल्प का उपयोग करता है। गैर-डिफ़ॉल्ट का उपयोग करने के लिए, [कस्टम क्लाइंट](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone) को निर्माता में पास किया जा सकता है।

```python
from google.cloud import bigtable

custom_client_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
)
```

### कस्टम सामग्री

BigtableLoader मानता है कि `langchain` नामक एक कॉलम परिवार है, जिसमें `content` नामक एक कॉलम है, जो UTF-8 में एन्कोड मान रखता है। ये डिफ़ॉल्ट को इस प्रकार बदला जा सकता है:

```python
from langchain_google_bigtable import Encoding

custom_content_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
)
```

### मेटाडेटा मैपिंग

डिफ़ॉल्ट रूप से, `Document` ऑब्जेक्ट पर `metadata` मैप में एक ही कुंजी होगी, `rowkey`, जिसका मान पंक्ति के rowkey मान होगा। उस मैप में और आइटम जोड़ने के लिए, metadata_mapping का उपयोग करें।

```python
import json

from langchain_google_bigtable import MetadataMapping

metadata_mapping_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
)
```

### JSON के रूप में मेटाडेटा

यदि Bigtable में ऐसा कॉलम है जो JSON स्ट्रिंग रखता है जिसे आप आउटपुट दस्तावेज़ मेटाडेटा में जोड़ना चाहते हैं, तो BigtableLoader में निम्नलिखित पैरामीटर जोड़ना संभव है। ध्यान दें, `metadata_as_json_encoding` के लिए डिफ़ॉल्ट मान UTF-8 है।

```python
metadata_as_json_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```

### BigtableSaver को अनुकूलित करें

BigtableSaver को BigtableLoader की तरह ही अनुकूलित किया जा सकता है।

```python
saver = BigtableSaver(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```
