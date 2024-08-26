---
translated: true
---

# टाइग्रिस

> [टाइग्रिस](https://tigrisdata.com) एक ओपन-सोर्स सर्वरलेस NoSQL डेटाबेस और सर्च प्लेटफॉर्म है जो उच्च-प्रदर्शन वेक्टर सर्च एप्लिकेशन बनाने को आसान बनाने के लिए डिज़ाइन किया गया है।
> `टाइग्रिस` कई उपकरणों को प्रबंधित, संचालित और समन्वयित करने की बुनियादी ढांचा की जटिलता को समाप्त करता है, जिससे आप महान एप्लिकेशन बनाने पर ध्यान केंद्रित कर सकते हैं।

यह नोटबुक आपको टाइग्रिस को अपने वेक्टर स्टोर के रूप में कैसे उपयोग करना है, इसका मार्गदर्शन करता है।

**पूर्व आवश्यकताएं**
1. एक OpenAI खाता। आप [यहां](https://platform.openai.com/) खाता बना सकते हैं।
2. [एक मुफ्त टाइग्रिस खाता साइन अप करें](https://console.preview.tigrisdata.cloud)। एक बार टाइग्रिस खाता साइन अप करने के बाद, `vectordemo` नामक एक नया प्रोजेक्ट बनाएं। अगला, आप जिस क्षेत्र में अपना प्रोजेक्ट बनाया है, उसका *Uri*, **clientId** और **clientSecret** नोट करें। आप इन सभी जानकारियों को प्रोजेक्ट के **एप्लिकेशन कुंजी** अनुभाग से प्राप्त कर सकते हैं।

आइए पहले अपनी निर्भरताओं को स्थापित करें:

```python
%pip install --upgrade --quiet  tigrisdb openapi-schema-pydantic langchain-openai tiktoken
```

हम अपने वातावरण में `OpenAI` api कुंजी और `Tigris` क्रेडेंशियल लोड करेंगे।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["TIGRIS_PROJECT"] = getpass.getpass("Tigris Project Name:")
os.environ["TIGRIS_CLIENT_ID"] = getpass.getpass("Tigris Client Id:")
os.environ["TIGRIS_CLIENT_SECRET"] = getpass.getpass("Tigris Client Secret:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Tigris
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### टाइग्रिस वेक्टर स्टोर को प्रारंभ करें

आइए अपने परीक्षण डेटासेट को आयात करें:

```python
loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_store = Tigris.from_documents(docs, embeddings, index_name="my_embeddings")
```

### समानता खोज

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### स्कोर (वेक्टर दूरी) के साथ समानता खोज

```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```
