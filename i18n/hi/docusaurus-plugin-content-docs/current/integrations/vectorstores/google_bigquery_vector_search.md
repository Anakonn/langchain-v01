---
translated: true
---

# Google BigQuery Vector Search

> [Google Cloud BigQuery Vector Search](https://cloud.google.com/bigquery/docs/vector-search-intro) आपको GoogleSQL का उपयोग करके सेमेंटिक खोज करने की अनुमति देता है, जिसमें तेज़ अनुमानित परिणाम के लिए वेक्टर इंडेक्स का उपयोग किया जाता है, या सटीक परिणाम के लिए ब्रूट फ़ोर्स का उपयोग किया जाता है।

यह ट्यूटोरियल LangChain में एक एंड-टू-एंड डेटा और एम्बेडिंग प्रबंधन प्रणाली के साथ काम करने और BigQuery में स्केलेबल सेमेंटिक खोज प्रदान करने का प्रदर्शन करता है।

## शुरू करना

### लाइब्रेरी इंस्टॉल करें

```python
%pip install --upgrade --quiet  langchain langchain-google-vertexai google-cloud-bigquery
```

**केवल Colab:** कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित कोशिका को अनटिप्पण करें या कर्नल को पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

## शुरू करने से पहले

#### अपना प्रोजेक्ट आईडी सेट करें

यदि आप अपना प्रोजेक्ट आईडी नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:
* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* [प्रोजेक्ट आईडी खोजें](https://support.google.com/googleapi/answer/7014113) सपोर्ट पेज देखें।

```python
# @title Project { display-mode: "form" }
PROJECT_ID = ""  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

#### क्षेत्र सेट करें

आप BigQuery द्वारा उपयोग किए जाने वाले `REGION` चर को भी बदल सकते हैं। [BigQuery क्षेत्रों](https://cloud.google.com/bigquery/docs/locations#supported_locations) के बारे में अधिक जानें।

```python
# @title Region { display-mode: "form" }
REGION = "US"  # @param {type: "string"}
```

#### डेटासेट और टेबल नाम सेट करें

ये आपके BigQuery Vector Store होंगे।

```python
# @title Dataset and Table { display-mode: "form" }
DATASET = "my_langchain_dataset"  # @param {type: "string"}
TABLE = "doc_and_vectors"  # @param {type: "string"}
```

### अपने नोटबुक वातावरण को प्रमाणित करना

- यदि आप इस नोटबुक को चलाने के लिए **Colab** का उपयोग कर रहे हैं, तो नीचे दी गई कोशिका को अनटिप्पण करें और आगे बढ़ें।
- यदि आप **Vertex AI Workbench** का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों को देखें।

```python
from google.colab import auth as google_auth

google_auth.authenticate_user()
```

## Demo: BigQueryVectorSearch

### एम्बेडिंग क्लास इंस्टेंस बनाएं

आप शायद अपने प्रोजेक्ट में Vertex AI API को सक्षम करने की आवश्यकता हो सकती है, `gcloud services enable aiplatform.googleapis.com --project {PROJECT_ID}` चलाकर (अपने प्रोजेक्ट के नाम से `{PROJECT_ID}` को बदलें)।

आप किसी भी [LangChain एम्बेडिंग मॉडल](/docs/integrations/text_embedding/) का उपयोग कर सकते हैं।

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### BigQuery डेटासेट बनाएं

यह वैकल्पिक चरण है जो तब उपयोगी हो सकता है जब डेटासेट मौजूद न हो।

```python
from google.cloud import bigquery

client = bigquery.Client(project=PROJECT_ID, location=REGION)
client.create_dataset(dataset=DATASET, exists_ok=True)
```

### मौजूदा BigQuery डेटासेट के साथ BigQueryVectorSearch Vector Store को इनिशियलाइज़ करें

```python
from langchain.vectorstores.utils import DistanceStrategy
from langchain_community.vectorstores import BigQueryVectorSearch

store = BigQueryVectorSearch(
    project_id=PROJECT_ID,
    dataset_name=DATASET,
    table_name=TABLE,
    location=REGION,
    embedding=embedding,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)
```

### पाठ जोड़ें

```python
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]

store.add_texts(all_texts, metadatas=metadatas)
```

### दस्तावेज़ों की खोज करें

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs)
```

### वेक्टर द्वारा दस्तावेज़ों की खोज करें

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

### मेटाडेटा फ़िल्टर के साथ दस्तावेज़ों की खोज करें

```python
# This should only return "Banana" document.
docs = store.similarity_search_by_vector(query_vector, filter={"len": 6})
print(docs)
```

### BigQuery जॉब आईडी के साथ जॉब सांख्यिकी का अन्वेषण करें

```python
job_id = ""  # @param {type:"string"}
# Debug and explore the job statistics with a BigQuery Job id.
store.explore_job_stats(job_id)
```
