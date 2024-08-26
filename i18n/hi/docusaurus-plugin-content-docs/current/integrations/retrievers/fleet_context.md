---
translated: true
---

# फ्लीट एआई संदर्भ

>[फ्लीट एआई संदर्भ](https://www.fleet.so/context) एक उच्च गुणवत्ता वाले एम्बेडिंग डेटासेट है जो सबसे लोकप्रिय और अनुमतिपूर्ण पायथन लाइब्रेरियों और उनकी प्रलेखन में से शीर्ष 1200 को शामिल करता है।

>`फ्लीट एआई` टीम दुनिया के सबसे महत्वपूर्ण डेटा को एम्बेड करने का मिशन पर है। उन्होंने कोड जनरेशन को नवीनतम ज्ञान के साथ सक्षम करने के लिए शीर्ष 1200 पायथन लाइब्रेरियों को एम्बेड करना शुरू किया है। उन्होंने [LangChain दस्तावेज़](/docs/get_started/introduction) और [API संदर्भ](https://api.python.langchain.com/en/latest/api_reference.html) के अपने एम्बेडिंग साझा करने की कृपा की है।

आइए देखें कि हम इन एम्बेडिंग का उपयोग करके एक दस्तावेज़ पुनर्प्राप्ति प्रणाली और अंततः एक सरल कोड-जनरेटिंग श्रृंखला को कैसे संचालित कर सकते हैं!

```python
%pip install --upgrade --quiet  langchain fleet-context langchain-openai pandas faiss-cpu # faiss-gpu for CUDA supported GPU
```

```python
from operator import itemgetter
from typing import Any, Optional, Type

import pandas as pd
from langchain.retrievers import MultiVectorRetriever
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.stores import BaseStore
from langchain_core.vectorstores import VectorStore
from langchain_openai import OpenAIEmbeddings


def load_fleet_retriever(
    df: pd.DataFrame,
    *,
    vectorstore_cls: Type[VectorStore] = FAISS,
    docstore: Optional[BaseStore] = None,
    **kwargs: Any,
):
    vectorstore = _populate_vectorstore(df, vectorstore_cls)
    if docstore is None:
        return vectorstore.as_retriever(**kwargs)
    else:
        _populate_docstore(df, docstore)
        return MultiVectorRetriever(
            vectorstore=vectorstore, docstore=docstore, id_key="parent", **kwargs
        )


def _populate_vectorstore(
    df: pd.DataFrame,
    vectorstore_cls: Type[VectorStore],
) -> VectorStore:
    if not hasattr(vectorstore_cls, "from_embeddings"):
        raise ValueError(
            f"Incompatible vector store class {vectorstore_cls}."
            "Must implement `from_embeddings` class method."
        )
    texts_embeddings = []
    metadatas = []
    for _, row in df.iterrows():
        texts_embeddings.append((row.metadata["text"], row["dense_embeddings"]))
        metadatas.append(row.metadata)
    return vectorstore_cls.from_embeddings(
        texts_embeddings,
        OpenAIEmbeddings(model="text-embedding-ada-002"),
        metadatas=metadatas,
    )


def _populate_docstore(df: pd.DataFrame, docstore: BaseStore) -> None:
    parent_docs = []
    df = df.copy()
    df["parent"] = df.metadata.apply(itemgetter("parent"))
    for parent_id, group in df.groupby("parent"):
        sorted_group = group.iloc[
            group.metadata.apply(itemgetter("section_index")).argsort()
        ]
        text = "".join(sorted_group.metadata.apply(itemgetter("text")))
        metadata = {
            k: sorted_group.iloc[0].metadata[k] for k in ("title", "type", "url")
        }
        text = metadata["title"] + "\n" + text
        metadata["id"] = parent_id
        parent_docs.append(Document(page_content=text, metadata=metadata))
    docstore.mset(((d.metadata["id"], d) for d in parent_docs))
```

## रिट्रीवर टुकड़े

अपने एम्बेडिंग प्रक्रिया के हिस्से के रूप में, फ्लीट एआई टीम ने लंबे दस्तावेज़ों को पहले टुकड़ों में बांट दिया। इसका मतलब है कि वेक्टर LangChain दस्तावेज़ों के पृष्ठों के अनुभागों से संबंधित हैं, न कि पूरे पृष्ठों से। डिफ़ॉल्ट रूप से, जब हम इन एम्बेडिंग से एक रिट्रीवर को चालू करते हैं, तो हम इन एम्बेडेड टुकड़ों को पुनर्प्राप्त करेंगे।

हम Fleet Context के `download_embeddings()` का उपयोग करेंगे ताकि LangChain के प्रलेखन एम्बेडिंग को प्राप्त कर सकें। आप https://fleet.so/context पर सभी समर्थित लाइब्रेरियों के प्रलेखन देख सकते हैं।

```python
from context import download_embeddings

df = download_embeddings("langchain")
vecstore_retriever = load_fleet_retriever(df)
```

```python
vecstore_retriever.invoke("How does the multi vector retriever work")
```

## अन्य पैकेज

आप [इस Dropbox लिंक](https://www.dropbox.com/scl/fo/54t2e7fogtixo58pnlyub/h?rlkey=tne16wkssgf01jor0p1iqg6p9&dl=0) से अन्य एम्बेडिंग डाउनलोड और उपयोग कर सकते हैं।

## मूल दस्तावेज़ पुनर्प्राप्त करें

फ्लीट एआई द्वारा प्रदान किए गए एम्बेडिंग में मेटाडेटा है जो इंगित करता है कि कौन से एम्बेडिंग टुकड़े मूल दस्तावेज़ पृष्ठ के समान हैं। यदि हम चाहें तो हम इस जानकारी का उपयोग करके पूरे मूल दस्तावेज़ को पुनर्प्राप्त कर सकते हैं, न कि केवल एम्बेडेड टुकड़ों को। नीचे की परत में, हम MultiVectorRetriever और BaseStore ऑब्जेक्ट का उपयोग करेंगे ताकि प्रासंगिक टुकड़ों को खोजा जा सके और फिर उन्हें उनके मूल दस्तावेज़ से मैप किया जा सके।

```python
from langchain.storage import InMemoryStore

parent_retriever = load_fleet_retriever(
    "https://www.dropbox.com/scl/fi/4rescpkrg9970s3huz47l/libraries_langchain_release.parquet?rlkey=283knw4wamezfwiidgpgptkep&dl=1",
    docstore=InMemoryStore(),
)
```

```python
parent_retriever.invoke("How does the multi vector retriever work")
```

## इसे एक श्रृंखला में रखना

आइए अपने पुनर्प्राप्ति प्रणालियों का उपयोग एक सरल श्रृंखला में करते हैं!

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a great software engineer who is very familiar \
with Python. Given a user question or request about a new Python library called LangChain and \
parts of the LangChain documentation, answer the question or generate the requested code. \
Your answers must be accurate, should include code whenever possible, and should assume anything \
about LangChain which is note explicitly stated in the LangChain documentation. If the required \
information is not available, just say so.

LangChain Documentation
------------------

{context}""",
        ),
        ("human", "{question}"),
    ]
)

model = ChatOpenAI(model="gpt-3.5-turbo-16k")

chain = (
    {
        "question": RunnablePassthrough(),
        "context": parent_retriever
        | (lambda docs: "\n\n".join(d.page_content for d in docs)),
    }
    | prompt
    | model
    | StrOutputParser()
)
```

```python
for chunk in chain.invoke(
    "How do I create a FAISS vector store retriever that returns 10 documents per search query"
):
    print(chunk, end="", flush=True)
```
