---
translated: true
---

# आईबीएम watsonx.ai

>WatsonxEmbeddings आईबीएम [watsonx.ai](https://www.ibm.com/products/watsonx-ai) फाउंडेशन मॉडल्स के लिए एक रैपर है।

यह उदाहरण दिखाता है कि `LangChain` का उपयोग करके `watsonx.ai` मॉडल्स के साथ कैसे संवाद करें।

## सेट अप करना

पैकेज `langchain-ibm` इंस्टॉल करें।

```python
!pip install -qU langchain-ibm
```

यह सेल WML क्रेडेंशियल्स को परिभाषित करता है जो watsonx Embeddings के साथ काम करने के लिए आवश्यक हैं।

**कार्य:** आईबीएम क्लाउड उपयोगकर्ता एपीआई कुंजी प्रदान करें। विवरण के लिए, देखें
[प्रलेखन](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)।

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

इसके अतिरिक्त आप एक पर्यावरण परिवर्तनीय के रूप में अतिरिक्त रहस्यों को पास करने में सक्षम हैं।

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## मॉडल लोड करें

आपको विभिन्न मॉडलों के लिए मॉडल `parameters` को समायोजित करने की आवश्यकता हो सकती है।

```python
from ibm_watsonx_ai.metanames import EmbedTextParamsMetaNames

embed_params = {
    EmbedTextParamsMetaNames.TRUNCATE_INPUT_TOKENS: 3,
    EmbedTextParamsMetaNames.RETURN_OPTIONS: {"input_text": True},
}
```

पहले से सेट किए गए parameters के साथ `WatsonxEmbeddings` क्लास को प्रारंभ करें।

**नोट**:

- एपीआई कॉल के लिए संदर्भ प्रदान करने के लिए, आपको `project_id` या `space_id` जोड़ना होगा। अधिक जानकारी के लिए देखें [प्रलेखन](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects)।
- आपके प्रावधानित सेवा उदाहरण के क्षेत्र के आधार पर, [यहां](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication) वर्णित यूआरएल में से एक का उपयोग करें।

इस उदाहरण में, हम `project_id` और डलास यूआरएल का उपयोग करेंगे।

आपको `model_id` निर्दिष्ट करने की आवश्यकता है जिसका उपयोग अंतर करना के लिए किया जाएगा।

```python
from langchain_ibm import WatsonxEmbeddings

watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

वैकल्पिक रूप से आप क्लाउड पाक फॉर डेटा क्रेडेंशियल्स का उपयोग कर सकते हैं। विवरण के लिए, देखें [प्रलेखन](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)।

```python
watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="5.0",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

## उपयोग

### क्वेरी एम्बेड करें

```python
text = "This is a test document."

query_result = watsonx_embedding.embed_query(text)
query_result[:5]
```

```output
[0.0094472, -0.024981909, -0.026013248, -0.040483925, -0.057804465]
```

### दस्तावेज़ एम्बेड करें

```python
texts = ["This is a content of the document", "This is another document"]

doc_result = watsonx_embedding.embed_documents(texts)
doc_result[0][:5]
```

```output
[0.009447193, -0.024981918, -0.026013244, -0.040483937, -0.057804447]
```
