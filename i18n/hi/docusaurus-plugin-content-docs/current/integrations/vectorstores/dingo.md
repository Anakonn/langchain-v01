---
translated: true
---

# DingoDB

>[DingoDB](https://dingodb.readthedocs.io/en/latest/) एक वितरित बहु-मोड वेक्टर डेटाबेस है, जो डेटा झीलों और वेक्टर डेटाबेसों की विशेषताओं को मिलाता है, और किसी भी प्रकार और आकार के डेटा (कुंजी-मूल्य, PDF, ऑडियो, वीडियो आदि) को संग्रहीत कर सकता है। इसमें तेज़ अंतर्दृष्टि और प्रतिक्रिया प्राप्त करने के लिए वास्तविक-समय कम-विलंबता प्रसंस्करण क्षमताएं हैं, और यह बहु-मोडल डेटा का तत्काल विश्लेषण और प्रसंस्करण कर सकता है।

यह नोटबुक DingoDB वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

चलाने के लिए, आपके पास एक [DingoDB उदाहरण चालू और चल रहा होना चाहिए](https://github.com/dingodb/dingo-deploy/blob/main/README.md)।

```python
%pip install --upgrade --quiet  dingodb
# or install latest:
%pip install --upgrade --quiet  git+https://git@github.com/dingodb/pydingo.git
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
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
from dingodb import DingoDB

index_name = "langchain_demo"

dingo_client = DingoDB(user="", password="", host=["127.0.0.1:13000"])
# First, check if our index already exists. If it doesn't, we create it
if (
    index_name not in dingo_client.get_index()
    and index_name.upper() not in dingo_client.get_index()
):
    # we create a new index, modify to your own
    dingo_client.create_index(
        index_name=index_name, dimension=1536, metric_type="cosine", auto_id=False
    )

# The OpenAI embedding model `text-embedding-ada-002 uses 1536 dimensions`
docsearch = Dingo.from_documents(
    docs, embeddings, client=dingo_client, index_name=index_name
)
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```

### मौजूदा सूचकांक में अधिक पाठ जोड़ना

`add_texts` फ़ंक्शन का उपयोग करके मौजूदा Dingo सूचकांक में अधिक पाठ एम्बेड और अपलोड किया जा सकता है।

```python
vectorstore = Dingo(embeddings, "text", client=dingo_client, index_name=index_name)

vectorstore.add_texts(["More text!"])
```

### अधिकतम सीमांत प्रासंगिकता खोज

रिट्रीवर ऑब्जेक्ट में समानता खोज का उपयोग करने के अलावा, आप `mmr` का भी उपयोग कर सकते हैं।

```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

या `max_marginal_relevance_search` का सीधा उपयोग करें:

```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```
