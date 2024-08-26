---
translated: true
---

# मूल दस्तावेज़ प्राप्तकर्ता

दस्तावेजों को पुनर्प्राप्ति के लिए विभाजित करते समय, अक्सर विरोधाभासी इच्छाएं होती हैं:

1. आप छोटे दस्तावेजों को रखना चाहते हो, ताकि उनके एम्बेडिंग उनके अर्थ को सबसे सटीक ढंग से प्रतिबिंबित कर सकें। यदि बहुत लंबा हो, तो एम्बेडिंग का अर्थ खो सकता है।
2. आप इतने लंबे दस्तावेज़ रखना चाहते हैं कि प्रत्येक टुकड़े का संदर्भ बरकरार रहे।

`ParentDocumentRetriever` इस संतुलन को प्राप्त करता है क्योंकि यह डेटा के छोटे टुकड़ों को विभाजित और संग्रहीत करता है। पुनर्प्राप्ति के दौरान, यह पहले छोटे टुकड़ों को प्राप्त करता है, लेकिन फिर उन टुकड़ों के मूल आईडी को देखता है और उन बड़े दस्तावेजों को वापस देता है।

ध्यान दें कि "मूल दस्तावेज़" से तात्पर्य उस दस्तावेज़ से है जिससे एक छोटा टुकड़ा उत्पन्न हुआ है। यह या तो पूरा कच्चा दस्तावेज़ हो सकता है या एक बड़ा टुकड़ा।

```python
from langchain.retrievers import ParentDocumentRetriever
```

```python
from langchain.storage import InMemoryStore
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loaders = [
    TextLoader("../../paul_graham_essay.txt"),
    TextLoader("../../state_of_the_union.txt"),
]
docs = []
for loader in loaders:
    docs.extend(loader.load())
```

## पूर्ण दस्तावेज़ प्राप्त करना

इस मोड में, हम पूर्ण दस्तावेज़ प्राप्त करना चाहते हैं। इसलिए, हम केवल एक बच्चा विभाजक निर्दिष्ट करते हैं।

```python
# This text splitter is used to create the child documents
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
)
```

```python
retriever.add_documents(docs, ids=None)
```

इससे दो कुंजियां मिलनी चाहिए, क्योंकि हमने दो दस्तावेज़ जोड़े हैं।

```python
list(store.yield_keys())
```

```output
['cfdf4af7-51f2-4ea3-8166-5be208efa040',
 'bf213c21-cc66-4208-8a72-733d030187e6']
```

अब आइए वेक्टर स्टोर खोज कार्यक्षमता को कॉल करें - हमें देखना चाहिए कि यह छोटे टुकड़ों को वापस देता है (क्योंकि हम छोटे टुकड़ों को संग्रहीत कर रहे हैं)।

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
print(sub_docs[0].page_content)
```

```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

अब आइए समग्र पुनर्प्राप्तकर्ता से प्राप्त करें। यह बड़े दस्तावेज़ वापस देना चाहिए - क्योंकि यह उन दस्तावेज़ों को वापस देता है जहां छोटे टुकड़े स्थित हैं।

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
38540
```

## बड़े टुकड़ों को प्राप्त करना

कभी-कभी, पूर्ण दस्तावेज़ बहुत बड़े हो सकते हैं और उन्हें वैसे ही प्राप्त करना नहीं चाहते। ऐसे मामले में, वास्तव में हम पहले कच्चे दस्तावेज़ों को बड़े टुकड़ों में विभाजित करना चाहते हैं, और फिर उन्हें छोटे टुकड़ों में विभाजित करना चाहते हैं। हम फिर छोटे टुकड़ों को सूचीबद्ध करते हैं, लेकिन पुनर्प्राप्ति पर हम बड़े टुकड़ों को प्राप्त करते हैं (लेकिन अभी भी पूर्ण दस्तावेज़ नहीं)।

```python
# This text splitter is used to create the parent documents
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
# This text splitter is used to create the child documents
# It should create documents smaller than the parent
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="split_parents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
```

```python
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)
```

```python
retriever.add_documents(docs)
```

हम देख सकते हैं कि अब दो से कहीं अधिक दस्तावेज़ हैं - ये बड़े टुकड़े हैं।

```python
len(list(store.yield_keys()))
```

```output
66
```

आइए सुनिश्चित करें कि अंतर्निहित वेक्टर स्टोर अभी भी छोटे टुकड़ों को पुनर्प्राप्त करता है।

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
print(sub_docs[0].page_content)
```

```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
1849
```

```python
print(retrieved_docs[0].page_content)
```

```output
In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

We cannot let this happen.

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
```
