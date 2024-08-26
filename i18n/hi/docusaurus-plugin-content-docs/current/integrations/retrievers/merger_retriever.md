---
translated: true
---

# LOTR (मर्जर रिट्रीवर)

>`रिट्रीवर्स का प्रभु (LOTR)`, जिसे `MergerRetriever` के रूप में भी जाना जाता है, रिट्रीवर्स की एक सूची को इनपुट के रूप में लेता है और उनके get_relevant_documents() मेथड के परिणामों को एक एकल सूची में मर्ज करता है। मर्ज किए गए परिणाम एक ऐसी दस्तावेजों की सूची होगी जो क्वेरी के प्रासंगिक हैं और जिन्हें विभिन्न रिट्रीवर्स द्वारा रैंक किया गया है।

`MergerRetriever` क्लास का उपयोग दस्तावेज पुनर्प्राप्ति की सटीकता को कई तरीकों से बढ़ाने के लिए किया जा सकता है। पहला, यह कई रिट्रीवर्स के परिणामों को संयुक्त कर सकता है, जो परिणामों में प्रवचन के जोखिम को कम करने में मदद कर सकता है। दूसरा, यह विभिन्न रिट्रीवर्स के परिणामों को रैंक कर सकता है, जो यह सुनिश्चित करने में मदद कर सकता है कि सबसे प्रासंगिक दस्तावेज पहले लौटाए जाएं।

```python
import os

import chromadb
from langchain.retrievers import (
    ContextualCompressionRetriever,
    DocumentCompressorPipeline,
    MergerRetriever,
)
from langchain_chroma import Chroma
from langchain_community.document_transformers import (
    EmbeddingsClusteringFilter,
    EmbeddingsRedundantFilter,
)
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings

# Get 3 diff embeddings.
all_mini = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
multi_qa_mini = HuggingFaceEmbeddings(model_name="multi-qa-MiniLM-L6-dot-v1")
filter_embeddings = OpenAIEmbeddings()

ABS_PATH = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(ABS_PATH, "db")

# Instantiate 2 diff chromadb indexes, each one with a diff embedding.
client_settings = chromadb.config.Settings(
    is_persistent=True,
    persist_directory=DB_DIR,
    anonymized_telemetry=False,
)
db_all = Chroma(
    collection_name="project_store_all",
    persist_directory=DB_DIR,
    client_settings=client_settings,
    embedding_function=all_mini,
)
db_multi_qa = Chroma(
    collection_name="project_store_multi",
    persist_directory=DB_DIR,
    client_settings=client_settings,
    embedding_function=multi_qa_mini,
)

# Define 2 diff retrievers with 2 diff embeddings and diff search type.
retriever_all = db_all.as_retriever(
    search_type="similarity", search_kwargs={"k": 5, "include_metadata": True}
)
retriever_multi_qa = db_multi_qa.as_retriever(
    search_type="mmr", search_kwargs={"k": 5, "include_metadata": True}
)

# The Lord of the Retrievers will hold the output of both retrievers and can be used as any other
# retriever on different types of chains.
lotr = MergerRetriever(retrievers=[retriever_all, retriever_multi_qa])
```

## मर्ज किए गए रिट्रीवर्स से अतिरिक्त परिणामों को हटाएं।

```python
# We can remove redundant results from both retrievers using yet another embedding.
# Using multiples embeddings in diff steps could help reduce biases.
filter = EmbeddingsRedundantFilter(embeddings=filter_embeddings)
pipeline = DocumentCompressorPipeline(transformers=[filter])
compression_retriever = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```

## मर्ज किए गए रिट्रीवर्स से प्रतिनिधि नमूने का चयन करें।

```python
# This filter will divide the documents vectors into clusters or "centers" of meaning.
# Then it will pick the closest document to that center for the final results.
# By default the result document will be ordered/grouped by clusters.
filter_ordered_cluster = EmbeddingsClusteringFilter(
    embeddings=filter_embeddings,
    num_clusters=10,
    num_closest=1,
)

# If you want the final document to be ordered by the original retriever scores
# you need to add the "sorted" parameter.
filter_ordered_by_retriever = EmbeddingsClusteringFilter(
    embeddings=filter_embeddings,
    num_clusters=10,
    num_closest=1,
    sorted=True,
)

pipeline = DocumentCompressorPipeline(transformers=[filter_ordered_by_retriever])
compression_retriever = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```

## प्रदर्शन क्षरण से बचने के लिए परिणामों को पुनः व्यवस्थित करें।

किसी भी मॉडल की वास्तुकला के बावजूद, जब आप 10+ पुनर्प्राप्त दस्तावेजों को शामिल करते हैं, तो प्रदर्शन में काफी गिरावट आती है।
संक्षेप में: जब मॉडल को लंबे संदर्भों में प्रासंगिक जानकारी तक पहुंचना होता है, तो वे प्रदान किए गए दस्तावेजों को अनदेखा कर देते हैं।
देखें: https://arxiv.org/abs//2307.03172

```python
# You can use an additional document transformer to reorder documents after removing redundancy.
from langchain_community.document_transformers import LongContextReorder

filter = EmbeddingsRedundantFilter(embeddings=filter_embeddings)
reordering = LongContextReorder()
pipeline = DocumentCompressorPipeline(transformers=[filter, reordering])
compression_retriever_reordered = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```
