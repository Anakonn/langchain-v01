---
translated: true
---

# Google Spanner

> [Spanner](https://cloud.google.com/spanner) एक अत्यधिक स्केलेबल डेटाबेस है जो असीमित स्केलेबिलिटी को रिलेशनल सेमेंटिक्स के साथ जोड़ता है, जैसे सेकंडरी इंडेक्स, मजबूत सुसंगति, स्कीमा और SQL, जो एक आसान समाधान में 99.999% उपलब्धता प्रदान करता है।

यह नोटबुक `Spanner` का उपयोग करके `SpannerVectorStore` क्लास के साथ वेक्टर सर्च का उपयोग करने के बारे में बताता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-spanner-python/) पर।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/docs/vector_store.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [Cloud Spanner API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
 * [एक Spanner इंस्टेंस बनाएं](https://cloud.google.com/spanner/docs/create-manage-instances)
 * [एक Spanner डेटाबेस बनाएं](https://cloud.google.com/spanner/docs/create-manage-databases)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-spanner` पैकेज में अपने खुद का है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet langchain-google-spanner
```

```output
Note: you may need to restart the kernel to use updated packages.
```

**Colab केवल:** कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित कोशिका को अनकमेंट करें या कर्नल को पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें ताकि आप अपने Google Cloud प्रोजेक्ट तक पहुंच सकें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए कोशिका का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों को देखें।

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

अपने Google Cloud प्रोजेक्ट को सेट करें ताकि आप इस नोटबुक में Google Cloud संसाधनों का उपयोग कर सकें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* सहायता पृष्ठ देखें: [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113)।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API सक्षमता

`langchain-google-spanner` पैकेज के लिए आपके Google Cloud प्रोजेक्ट में [Spanner API को सक्षम करना](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com) आवश्यक है।

```python
# enable Spanner API
!gcloud services enable spanner.googleapis.com
```

## मूलभूत उपयोग

### Spanner डेटाबेस मूल्यों को सेट करें

[Spanner इंस्टेंस पृष्ठ](https://console.cloud.google.com/spanner?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687) में अपने डेटाबेस मूल्यों को ढूंढें।

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vectors_search_data"  # @param {type: "string"}
```

### एक तालिका प्रारंभ करें

`SpannerVectorStore` क्लास इंस्टेंस को id, content और embeddings कॉलम के साथ एक डेटाबेस तालिका की आवश्यकता होती है।

`init_vector_store_table()` सहायक विधि का उपयोग करके आप आपके लिए उचित स्कीमा के साथ एक तालिका बना सकते हैं।

```python
from langchain_google_spanner import SecondaryIndex, SpannerVectorStore, TableColumn

SpannerVectorStore.init_vector_store_table(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    id_column="row_id",
    metadata_columns=[
        TableColumn(name="metadata", type="JSON", is_null=True),
        TableColumn(name="title", type="STRING(MAX)", is_null=False),
    ],
    secondary_indexes=[
        SecondaryIndex(index_name="row_id_and_title", columns=["row_id", "title"])
    ],
)
```

### एक एम्बेडिंग क्लास इंस्टेंस बनाएं

आप किसी भी [LangChain एम्बेडिंग मॉडल](/docs/integrations/text_embedding/) का उपयोग कर सकते हैं।
`VertexAIEmbeddings` का उपयोग करने के लिए आपको Vertex AI API को सक्षम करना होगा। हम उत्पादन के लिए एम्बेडिंग मॉडल के संस्करण को सेट करने की सिफारिश करते हैं, [पाठ एम्बेडिंग मॉडल](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings) के बारे में अधिक जानें।

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embeddings = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### SpannerVectorStore

`SpannerVectorStore` क्लास को प्रारंभ करने के लिए आपको 4 आवश्यक तर्कों और अन्य तर्कों को केवल तभी पास करना है जब वे डिफ़ॉल्ट से अलग हों

1. `instance_id` - Spanner इंस्टेंस का नाम
1. `database_id` - Spanner डेटाबेस का नाम
1. `table_name` - डेटाबेस में तालिका का नाम जिसमें दस्तावेज और उनके एम्बेडिंग्स को संग्रहीत किया जाता है।
1. `embedding_service` - एम्बेडिंग्स को जनरेट करने के लिए उपयोग की जाने वाली एम्बेडिंग्स कार्यान्वयन।

```python
db = SpannerVectorStore(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    ignore_metadata_columns=[],
    embedding_service=embeddings,
    metadata_json_column="metadata",
)
```

#### 🔐 दस्तावेज़ जोड़ें

वेक्टर स्टोर में दस्तावेज़ जोड़ने के लिए।

```python
import uuid

from langchain_community.document_loaders import HNLoader

loader = HNLoader("https://news.ycombinator.com/item?id=34817881")

documents = loader.load()
ids = [str(uuid.uuid4()) for _ in range(len(documents))]
```

#### 🔐 दस्तावेज़ खोजें

समानता खोज के साथ वेक्टर स्टोर में दस्तावेज़ खोजने के लिए।

```python
db.similarity_search(query="Explain me vector store?", k=3)
```

#### 🔐 दस्तावेज़ खोजें

अधिकतम सीमांत प्रासंगिकता खोज के साथ वेक्टर स्टोर में दस्तावेज़ खोजने के लिए।

```python
db.max_marginal_relevance_search("Testing the langchain integration with spanner", k=3)
```

#### 🔐 दस्तावेज़ हटाएं

वेक्टर स्टोर से दस्तावेज़ को हटाने के लिए, `row_id` कॉलम में मौजूद मूल्यों से संबंधित आईडी का उपयोग करें।

```python
db.delete(ids=["id1", "id2"])
```

#### 🔐 दस्तावेज़ हटाएं

वेक्टर स्टोर से दस्तावेज़ को हटाने के लिए, आप खुद दस्तावेज़ का उपयोग कर सकते हैं। VectorStore प्रारंभ करते समय प्रदान की गई सामग्री कॉलम और मेटाडेटा कॉलम का उपयोग दस्तावेज़ से संबंधित पंक्तियों को पता लगाने के लिए किया जाएगा। कोई भी मेल खाने वाली पंक्तियों को फिर से हटा दिया जाएगा।

```python
db.delete(documents=[documents[0], documents[1]])
```
