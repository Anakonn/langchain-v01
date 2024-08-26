---
translated: true
---

# MyScale

>[MyScale](https://docs.myscale.com/en/overview/) एक क्लाउड-आधारित डेटाबेस है जो AI अनुप्रयोगों और समाधानों के लिए अनुकूलित है, जो [ClickHouse](https://github.com/ClickHouse/ClickHouse) ओपन-सोर्स पर निर्मित है।

यह नोटबुक `MyScale` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

## वातावरण सेट करना

```python
%pip install --upgrade --quiet  clickhouse-connect
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["OPENAI_API_BASE"] = getpass.getpass("OpenAI Base:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale Host:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

myscale इंडेक्स के लिए पैरामीटर सेट करने के दो तरीके हैं।

1. पर्यावरण चर

    ऐप चलाने से पहले, कृपया `export` के साथ पर्यावरण चर सेट करें:
    `export MYSCALE_HOST='<your-endpoints-url>' MYSCALE_PORT=<your-endpoints-port> MYSCALE_USERNAME=<your-username> MYSCALE_PASSWORD=<your-password> ...`

    आप आसानी से अपने खाते, पासवर्ड और अन्य जानकारी हमारे SaaS पर पा सकते हैं। विवरण के लिए कृपया [इस दस्तावेज](https://docs.myscale.com/en/cluster-management/) का संदर्भ लें

    `MyScaleSettings` के तहत सभी गुण `MYSCALE_` उपसर्ग के साथ सेट किए जा सकते हैं और वे केस-इन्सेंसिटिव हैं।

2. `MyScaleSettings` ऑब्जेक्ट बनाएं पैरामीटर के साथ

    ```python
    from langchain_community.vectorstores import MyScale, MyScaleSettings
    config = MyScaleSetting(host="<your-backend-url>", port=8443, ...)
    index = MyScale(embedding_function, config)
    index.add_documents(...)
    ```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
for d in docs:
    d.metadata = {"some": "metadata"}
docsearch = MyScale.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.66it/s]
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## कनेक्शन जानकारी और डेटा स्कीमा प्राप्त करें

```python
print(str(docsearch))
```

## फ़िल्टरिंग

आप myscale SQL `WHERE` वक्तव्य तक सीधे पहुंच सकते हैं। आप मानक SQL का पालन करते हुए `WHERE` क्लॉज लिख सकते हैं।

**ध्यान दें**: कृपया SQL इंजेक्शन के बारे में सावधान रहें, यह इंटरफ़ेस अंत-उपयोगकर्ता द्वारा सीधे कॉल नहीं किया जाना चाहिए।

यदि आपने अपने सेटिंग में `column_map` को कस्टमाइज़ किया है, तो आप इस तरह फ़िल्टर के साथ खोज कर सकते हैं:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = MyScale.from_documents(docs, embeddings)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.68it/s]
```

### स्कोर के साथ समानता खोज

लौटाया गया दूरी स्कोर कोसाइन दूरी है। इसलिए, एक कम स्कोर बेहतर है।

```python
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.229655921459198 {'doc_id': 0} Madam Speaker, Madam...
0.24506962299346924 {'doc_id': 8} And so many families...
0.24786919355392456 {'doc_id': 1} Groups of citizens b...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
```

## अपने डेटा को हटाना

आप या तो `.drop()` विधि के साथ तालिका को ड्रॉप कर सकते हैं या `.delete()` विधि के साथ अपने डेटा को आंशिक रूप से हटा सकते हैं।

```python
# use directly a `where_str` to delete
docsearch.delete(where_str=f"{docsearch.metadata_column}.doc_id < 5")
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.24506962299346924 {'doc_id': 8} And so many families...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
0.26027143001556396 {'doc_id': 7} We see the unity amo...
0.26390212774276733 {'doc_id': 9} And unlike the $2 Tr...
```

```python
docsearch.drop()
```
