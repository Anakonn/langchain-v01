---
translated: true
---

# मेलीसर्च

> [मेलीसर्च](https://meilisearch.com) एक ओपन-सोर्स, तेज़ और अत्यधिक प्रासंगिक खोज इंजन है। यह डेवलपर्स को तेज़ खोज अनुभव बनाने में मदद करने के लिए बहुत अच्छे डिफ़ॉल्ट के साथ आता है।
>
> आप [मेलीसर्च को स्वयं होस्ट कर सकते हैं](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation) या [मेलीसर्च क्लाउड](https://www.meilisearch.com/pricing) पर चला सकते हैं।

मेलीसर्च v1.3 वेक्टर खोज का समर्थन करता है। यह पृष्ठ आपको मेलीसर्च को एक वेक्टर स्टोर के रूप में एकीकृत करने और इसका उपयोग करके वेक्टर खोज करने में मार्गदर्शन करता है।

## सेटअप

### मेलीसर्च इंस्टेंस लॉन्च करना

आपको अपने वेक्टर स्टोर के रूप में उपयोग करने के लिए एक चल रहा मेलीसर्च इंस्टेंस की आवश्यकता होगी। आप [स्थानीय रूप से मेलीसर्च](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation) चला सकते हैं या [मेलीसर्च क्लाउड](https://cloud.meilisearch.com/) खाता बना सकते हैं।

मेलीसर्च v1.3 के अनुसार, वेक्टर स्टोरेज एक प्रयोगात्मक सुविधा है। अपने मेलीसर्च इंस्टेंस को लॉन्च करने के बाद, आपको **वेक्टर स्टोरेज को सक्षम करना** होगा। स्वयं होस्ट किए गए मेलीसर्च के लिए, [प्रयोगात्मक सुविधाओं को सक्षम करने](https://www.meilisearch.com/docs/learn/experimental/overview) पर दस्तावेज़ पढ़ें। **मेलीसर्च क्लाउड** पर, अपने प्रोजेक्ट के _सेटिंग्स_ पृष्ठ से _वेक्टर स्टोर_ को सक्षम करें।

अब आपके पास वेक्टर स्टोरेज सक्षम के साथ एक चल रहा मेलीसर्च इंस्टेंस होना चाहिए। 🎉

### क्रेडेंशियल

अपने मेलीसर्च इंस्टेंस के साथ बातचीत करने के लिए, मेलीसर्च SDK को होस्ट (आपके इंस्टेंस का URL) और एक API कुंजी की आवश्यकता होती है।

**होस्ट**

- **स्थानीय** में, डिफ़ॉल्ट होस्ट `localhost:7700` है
- **मेलीसर्च क्लाउड** पर, अपने प्रोजेक्ट के _सेटिंग्स_ पृष्ठ में होस्ट खोजें

**API कुंजियाँ**

मेलीसर्च इंस्टेंस आपको तीन API कुंजियां प्रदान करता है:
- एक `MASTER KEY` - इसका उपयोग केवल अपने मेलीसर्च इंस्टेंस बनाने के लिए किया जाना चाहिए
- एक `ADMIN KEY` - केवल सर्वर-साइड अपडेट करने के लिए इसका उपयोग करें
- एक `SEARCH KEY` - आप इसे सुरक्षित रूप से अपने फ्रंट-एंड एप्लिकेशन में साझा कर सकते हैं

आप अपनी आवश्यकताओं के अनुसार [अतिरिक्त API कुंजियां](https://www.meilisearch.com/docs/learn/security/master_api_keys) बना सकते हैं।

### निर्भरताएं स्थापित करना

यह गाइड [मेलीसर्च पायथन SDK](https://github.com/meilisearch/meilisearch-python) का उपयोग करती है। आप इसे निम्नलिखित कमांड चलाकर स्थापित कर सकते हैं:

```python
%pip install --upgrade --quiet  meilisearch
```

अधिक जानकारी के लिए, [मेलीसर्च पायथन SDK दस्तावेज़ीकरण](https://meilisearch.github.io/meilisearch-python/) देखें।

## उदाहरण

मेलीसर्च वेक्टर स्टोर को इनिशियलाइज़ करने के कई तरीके हैं: मेलीसर्च क्लाइंट या _URL_ और _API कुंजी_ प्रदान करना जैसा आवश्यक हो। हमारे उदाहरणों में, क्रेडेंशियल को वातावरण से लोड किया जाएगा।

आप `os` और `getpass` का उपयोग करके अपने नोटबुक वातावरण में पर्यावरण चर उपलब्ध कर सकते हैं। आप इस तकनीक का उपयोग सभी निम्नलिखित उदाहरणों के लिए कर सकते हैं।

```python
import getpass
import os

os.environ["MEILI_HTTP_ADDR"] = getpass.getpass("Meilisearch HTTP address and port:")
os.environ["MEILI_MASTER_KEY"] = getpass.getpass("Meilisearch API Key:")
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

### पाठ और एम्बेडिंग जोड़ना

यह उदाहरण मेलीसर्च वेक्टर डेटाबेस में पाठ जोड़ता है, बिना मेलीसर्च वेक्टर स्टोर को इनिशियलाइज़ किए।

```python
from langchain_community.vectorstores import Meilisearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

embeddings = OpenAIEmbeddings()
embedders = {
    "default": {
        "source": "userProvided",
        "dimensions": 1536,
    }
}
embedder_name = "default"
```

```python
with open("../../modules/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
# Use Meilisearch vector store to store texts & associated embeddings as vector
vector_store = Meilisearch.from_texts(
    texts=texts, embedding=embeddings, embedders=embedders, embedder_name=embedder_name
)
```

पृष्ठभूमि में, मेलीसर्च पाठ को कई वेक्टरों में परिवर्तित करेगा। यह हमें निम्नलिखित उदाहरण के समान परिणाम देगा।

### दस्तावेज़ और एम्बेडिंग जोड़ना

इस उदाहरण में, हम Langchain TextSplitter का उपयोग करेंगे ताकि पाठ को कई दस्तावेज़ों में विभाजित किया जा सके। फिर, हम इन दस्तावेज़ों को उनके एम्बेडिंग के साथ संग्रहीत करेंगे।

```python
from langchain_community.document_loaders import TextLoader

# Load text
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)

# Create documents
docs = text_splitter.split_documents(documents)

# Import documents & embeddings in the vector store
vector_store = Meilisearch.from_documents(
    documents=documents,
    embedding=embeddings,
    embedders=embedders,
    embedder_name=embedder_name,
)

# Search in our vector store
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query, embedder_name=embedder_name)
print(docs[0].page_content)
```

## दस्तावेज़ जोड़ना एक मेलीसर्च वेक्टर स्टोर बनाकर

इस アप्रोच में, हम एक वेक्टर स्टोर ऑब्जेक्ट बनाते हैं और दस्तावेज़ उसमें जोड़ते हैं।

```python
import meilisearch
from langchain_community.vectorstores import Meilisearch

client = meilisearch.Client(url="http://127.0.0.1:7700", api_key="***")
vector_store = Meilisearch(
    embedding=embeddings,
    embedders=embedders,
    client=client,
    index_name="langchain_demo",
    text_key="text",
)
vector_store.add_documents(documents)
```

## स्कोर के साथ समानता खोज

यह विशिष्ट विधि आपको दस्तावेज़ और क्वेरी से उनकी दूरी स्कोर को वापस करने की अनुमति देती है। `embedder_name` वह नाम है जिसका उपयोग语义 खोज के लिए किया जाना चाहिए, डिफ़ॉल्ट "default" है।

```python
docs_and_scores = vector_store.similarity_search_with_score(
    query, embedder_name=embedder_name
)
docs_and_scores[0]
```

## वेक्टर द्वारा समानता खोज

`embedder_name` वह नाम है जिसका उपयोग语义 खोज के लिए किया जाना चाहिए, डिफ़ॉल्ट "default" है।

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = vector_store.similarity_search_by_vector(
    embedding_vector, embedder_name=embedder_name
)
docs_and_scores[0]
```

## अतिरिक्त संसाधन

दस्तावेज़ीकरण
- [मेलीसर्च](https://www.meilisearch.com/docs/)
- [मेलीसर्च पायथन SDK](https://python-sdk.meilisearch.com)

ओपन-सोर्स रिपॉजिटरी
- [मेलीसर्च रिपॉजिटरी](https://github.com/meilisearch/meilisearch)
- [मेलीसर्च पायथन SDK](https://github.com/meilisearch/meilisearch-python)
