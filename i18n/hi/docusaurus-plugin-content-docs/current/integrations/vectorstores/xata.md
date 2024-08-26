---
translated: true
---

# Xata

> [Xata](https://xata.io) एक सर्वरलेस डेटा प्लेटफॉर्म है, जो PostgreSQL पर आधारित है। यह आपके डेटाबेस के साथ इंटरैक्ट करने के लिए एक Python SDK और अपने डेटा को प्रबंधित करने के लिए एक UI प्रदान करता है।
> Xata में एक नेटिव वेक्टर प्रकार है, जिसे किसी भी टेबल में जोड़ा जा सकता है, और यह समानता खोज का समर्थन करता है। LangChain सीधे Xata में वेक्टर डालता है, और किसी दिए गए वेक्टर के निकटतम पड़ोसियों को खोजने के लिए इसका प्रश्न पूछता है, ताकि आप Xata के साथ LangChain Embeddings एकीकरण का उपयोग कर सकें।

यह नोटबुक आपको Xata को एक VectorStore के रूप में कैसे उपयोग करना है, इसका मार्गदर्शन करता है।

## सेटअप

### वेक्टर स्टोर के रूप में उपयोग करने के लिए एक डेटाबेस बनाएं

[Xata UI](https://app.xata.io) में एक नया डेटाबेस बनाएं। आप इसे जो भी नाम देना चाहते हैं, इस नोटपैड में हम `langchain` का उपयोग करेंगे।
एक टेबल बनाएं, फिर से आप इसे कुछ भी नाम दे सकते हैं, लेकिन हम `vectors` का उपयोग करेंगे। UI के माध्यम से निम्नलिखित कॉलम जोड़ें:

* `content` प्रकार "Text"। यह `Document.pageContent` मूल्यों को संग्रहित करने के लिए उपयोग किया जाता है।
* `embedding` प्रकार "Vector"। आप जिस मॉडल का उपयोग करने की योजना बना रहे हैं, उसके आयाम का उपयोग करें। इस नोटबुक में हम OpenAI embeddings का उपयोग करते हैं, जिनमें 1536 आयाम हैं।
* `source` प्रकार "Text"। यह इस उदाहरण द्वारा उपयोग किए जाने वाला एक मेटाडेटा कॉलम है।
* `Document.metadata` ऑब्जेक्ट से जोड़े जाने वाले किसी भी अन्य मेटाडेटा कॉलम। उदाहरण के लिए, यदि `Document.metadata` ऑब्जेक्ट में `title` गुण है, तो आप एक `title` कॉलम बना सकते हैं और यह भर दिया जाएगा।

पहले आइए अपनी निर्भरताओं को लोड करें:

```python
%pip install --upgrade --quiet  xata langchain-openai tiktoken langchain
```

अब हम OpenAI कुंजी को वातावरण में लोड करेंगे। यदि आपके पास कोई नहीं है, तो आप एक OpenAI खाता बना सकते हैं और इस [पृष्ठ](https://platform.openai.com/account/api-keys) पर एक कुंजी बना सकते हैं।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

इसी तरह, हमें Xata के लिए वातावरण चर भी प्राप्त करने होंगे। आप अपने [खाता सेटिंग्स](https://app.xata.io/settings) पर जाकर एक नया API कुंजी बना सकते हैं। डेटाबेस URL खोजने के लिए, आप डेटाबेस के सेटिंग्स पृष्ठ पर जाएं जिसे आपने बनाया है। डेटाबेस URL इस तरह दिखना चाहिए: `https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`।

```python
api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Xata वेक्टर स्टोर बनाएं

आइए अपने परीक्षण डेटासेट को लोड करें:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

अब वास्तविक वेक्टर स्टोर बनाएं, जो Xata टेबल द्वारा बैक किया जाता है।

```python
vector_store = XataVectorStore.from_documents(
    docs, embeddings, api_key=api_key, db_url=db_url, table_name="vectors"
)
```

उपरोक्त कमांड चलाने के बाद, यदि आप Xata UI पर जाते हैं, तो आपको दस्तावेज़ लोड होते हुए और उनके embeddings के साथ देखना चाहिए।
पहले से ही वेक्टर सामग्री वाले Xata टेबल का उपयोग करने के लिए, XataVectorStore कंस्ट्रक्टर को इनिशियलाइज़ करें:

```python
vector_store = XataVectorStore(
    api_key=api_key, db_url=db_url, embedding=embeddings, table_name="vectors"
)
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
