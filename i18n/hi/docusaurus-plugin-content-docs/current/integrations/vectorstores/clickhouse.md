---
translated: true
---

# ClickHouse

> [ClickHouse](https://clickhouse.com/) वास्तविक समय के अनुप्रयोगों और विश्लेषण के लिए सबसे तेज़ और संसाधन कुशल ओपन-सोर्स डेटाबेस है, जिसमें पूर्ण SQL समर्थन और विश्लेषणात्मक क्वेरी लिखने में उपयोगकर्ताओं की मदद करने के लिए कई कार्यक्षमताएं हैं। हाल ही में जोड़े गए डेटा संरचनाएं और दूरी खोज कार्यक्षमताएं (जैसे `L2Distance`) के साथ-साथ [अनुमानित निकटतम पड़ोसी खोज सूचकांक](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/annindexes) ClickHouse को उच्च प्रदर्शन और पैमाने योग्य वेक्टर डेटाबेस के रूप में उपयोग करने में सक्षम बनाते हैं, जहां वेक्टरों को SQL के साथ संग्रहीत और खोजा जा सकता है।

यह नोटबुक `ClickHouse` वेक्टर खोज से संबंधित कार्यक्षमताओं का उपयोग करने का प्रदर्शन करता है।

## वातावरण सेट करना

डॉकर के साथ स्थानीय clickhouse सर्वर सेट करना (वैकल्पिक)

```python
! docker run -d -p 8123:8123 -p9000:9000 --name langchain-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server:23.4.2.11
```

clickhouse क्लाइंट ड्राइवर सेट करना

```python
%pip install --upgrade --quiet  clickhouse-connect
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

if not os.environ["OPENAI_API_KEY"]:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings
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
settings = ClickhouseSettings(table="clickhouse_vector_search_example")
docsearch = Clickhouse.from_documents(docs, embeddings, config=settings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:00<00:00, 2801.49it/s]
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

## कनेक्शन जानकारी और डेटा स्कीमा प्राप्त करना

```python
print(str(docsearch))
```

```output
[92m[1mdefault.clickhouse_vector_search_example @ localhost:8123[0m

[1musername: None[0m

Table Schema:
---------------------------------------------------
|[94mid                      [0m|[96mNullable(String)        [0m|
|[94mdocument                [0m|[96mNullable(String)        [0m|
|[94membedding               [0m|[96mArray(Float32)          [0m|
|[94mmetadata                [0m|[96mObject('json')          [0m|
|[94muuid                    [0m|[96mUUID                    [0m|
---------------------------------------------------
```

### ClickHouse तालिका स्कीमा

> डिफ़ॉल्ट रूप से, यदि मौजूद नहीं है, तो ClickHouse तालिका स्वचालित रूप से बना दी जाएगी। उन्नत उपयोगकर्ता पहले से अनुकूलित सेटिंग्स के साथ तालिका पूर्व-बना सकते हैं। शार्डिंग के साथ वितरित ClickHouse क्लस्टर के लिए, तालिका इंजन को `Distributed` के रूप में कॉन्फ़िगर किया जाना चाहिए।

```python
print(f"Clickhouse Table DDL:\n\n{docsearch.schema}")
```

```output
Clickhouse Table DDL:

CREATE TABLE IF NOT EXISTS default.clickhouse_vector_search_example(
    id Nullable(String),
    document Nullable(String),
    embedding Array(Float32),
    metadata JSON,
    uuid UUID DEFAULT generateUUIDv4(),
    CONSTRAINT cons_vec_len CHECK length(embedding) = 1536,
    INDEX vec_idx embedding TYPE annoy(100,'L2Distance') GRANULARITY 1000
) ENGINE = MergeTree ORDER BY uuid SETTINGS index_granularity = 8192
```

## फ़िल्टरिंग

आप ClickHouse SQL के `WHERE` स्टेटमेंट तक सीधे पहुंच सकते हैं। आप मानक SQL का पालन करते हुए `WHERE` क्लॉज लिख सकते हैं।

**नोट**: कृपया SQL इंजेक्शन के बारे में सावधान रहें, यह इंटरफ़ेस अंत-उपयोगकर्ता द्वारा सीधे कॉल नहीं किया जाना चाहिए।

यदि आपने अपनी `column_map` को अपने सेटिंग के तहत कस्टमाइज़ किया है, तो आप इस तरह से फ़िल्टर के साथ खोज कर सकते हैं:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = Clickhouse.from_documents(docs, embeddings)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:00<00:00, 6939.56it/s]
```

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
0.6779101415357189 {'doc_id': 0} Madam Speaker, Madam...
0.6997970363474885 {'doc_id': 8} And so many families...
0.7044504914336727 {'doc_id': 1} Groups of citizens b...
0.7053558702165094 {'doc_id': 6} And I’m taking robus...
```

## अपने डेटा को हटाना

```python
docsearch.drop()
```
