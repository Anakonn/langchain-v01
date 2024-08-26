---
translated: true
---

# मल्टीवेक्टर रिट्रीवर

अक्सर एक दस्तावेज़ में कई वेक्टर संग्रहीत करना लाभकारी हो सकता है। कई उपयोग के मामलों में यह लाभकारी होता है। लैंगचेन के पास एक बेस `MultiVectorRetriever` है जो इस प्रकार की सेटअप क्वेरी करना आसान बनाता है। बहुत सी जटिलता इस बात में होती है कि प्रत्येक दस्तावेज़ के लिए कई वेक्टर कैसे बनाए जाएं। इस नोटबुक में उन सामान्य तरीकों को शामिल किया गया है जिनसे वेक्टर बनाए जा सकते हैं और `MultiVectorRetriever` का उपयोग किया जा सकता है।

दस्तावेज़ प्रति कई वेक्टर बनाने के तरीके शामिल हैं:

- छोटे हिस्से: एक दस्तावेज़ को छोटे हिस्सों में विभाजित करें, और उन्हें एम्बेड करें (यह `ParentDocumentRetriever` है)।
- सारांश: प्रत्येक दस्तावेज़ के लिए एक सारांश बनाएं, उसे दस्तावेज़ के साथ (या उसके बजाय) एम्बेड करें।
- काल्पनिक प्रश्न: ऐसे काल्पनिक प्रश्न बनाएं जो प्रत्येक दस्तावेज़ के लिए उपयुक्त हों, उन्हें दस्तावेज़ के साथ (या उसके बजाय) एम्बेड करें।

ध्यान दें कि यह मैन्युअल रूप से एम्बेडिंग जोड़ने का एक और तरीका भी सक्षम करता है। यह बहुत अच्छा है क्योंकि आप स्पष्ट रूप से प्रश्न या क्वेरी जोड़ सकते हैं जो किसी दस्तावेज़ की पुनर्प्राप्ति का नेतृत्व कर सकते हैं, जिससे आपको अधिक नियंत्रण मिलता है।

```python
from langchain.retrievers.multi_vector import MultiVectorRetriever
```

```python
from langchain.storage import InMemoryByteStore
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
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000)
docs = text_splitter.split_documents(docs)
```

## छोटे हिस्से

अक्सर यह उपयोगी हो सकता है कि बड़ी मात्रा में जानकारी को पुनः प्राप्त किया जाए, लेकिन छोटे हिस्सों को एम्बेड किया जाए। यह एम्बेडिंग को जितना संभव हो सके अर्थपूर्ण बनाने की अनुमति देता है, लेकिन जितना संभव हो सके संदर्भ को डाउनस्ट्रीम पास किया जा सकता है। ध्यान दें कि यह वही है जो `ParentDocumentRetriever` करता है। यहाँ हम दिखाते हैं कि हुड के नीचे क्या हो रहा है।

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
import uuid

doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
# The splitter to use to create smaller chunks
child_text_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
```

```python
sub_docs = []
for i, doc in enumerate(docs):
    _id = doc_ids[i]
    _sub_docs = child_text_splitter.split_documents([doc])
    for _doc in _sub_docs:
        _doc.metadata[id_key] = _id
    sub_docs.extend(_sub_docs)
```

```python
retriever.vectorstore.add_documents(sub_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
# Vectorstore alone retrieves the small chunks
retriever.vectorstore.similarity_search("justice breyer")[0]
```

```output
Document(page_content='Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.', metadata={'doc_id': '2fd77862-9ed5-4fad-bf76-e487b747b333', 'source': '../../state_of_the_union.txt'})
```

```python
# Retriever returns larger chunks
len(retriever.invoke("justice breyer")[0].page_content)
```

```output
9875
```

रिट्रीवर द्वारा वेक्टर डेटाबेस पर किया गया डिफ़ॉल्ट खोज प्रकार एक समानता खोज है। लैंगचेन वेक्टर स्टोर्स [Max Marginal Relevance](https://api.python.langchain.com/en/latest/vectorstores/langchain_core.vectorstores.VectorStore.html#langchain_core.vectorstores.VectorStore.max_marginal_relevance_search) के माध्यम से खोज का समर्थन भी करते हैं, इसलिए यदि आप इसे चाहते हैं तो आप बस `search_type` प्रॉपर्टी को निम्नानुसार सेट कर सकते हैं:

```python
from langchain.retrievers.multi_vector import SearchType

retriever.search_type = SearchType.mmr

len(retriever.invoke("justice breyer")[0].page_content)
```

```output
9875
```

## सारांश

अक्सर एक सारांश अधिक सटीकता से यह बता सकता है कि कोई हिस्सा किस बारे में है, जिससे बेहतर पुनर्प्राप्ति हो सकती है। यहाँ हम दिखाते हैं कि सारांश कैसे बनाए जाएं, और फिर उन्हें एम्बेड करें।

```python
import uuid

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
```

```python
chain = (
    {"doc": lambda x: x.page_content}
    | ChatPromptTemplate.from_template("Summarize the following document:\n\n{doc}")
    | ChatOpenAI(max_retries=0)
    | StrOutputParser()
)
```

```python
summaries = chain.batch(docs, {"max_concurrency": 5})
```

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(collection_name="summaries", embedding_function=OpenAIEmbeddings())
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
summary_docs = [
    Document(page_content=s, metadata={id_key: doc_ids[i]})
    for i, s in enumerate(summaries)
]
```

```python
retriever.vectorstore.add_documents(summary_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
# # We can also add the original chunks to the vectorstore if we so want
# for i, doc in enumerate(docs):
#     doc.metadata[id_key] = doc_ids[i]
# retriever.vectorstore.add_documents(docs)
```

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
sub_docs[0]
```

```output
Document(page_content="The document is a speech given by President Biden addressing various issues and outlining his agenda for the nation. He highlights the importance of nominating a Supreme Court justice and introduces his nominee, Judge Ketanji Brown Jackson. He emphasizes the need to secure the border and reform the immigration system, including providing a pathway to citizenship for Dreamers and essential workers. The President also discusses the protection of women's rights, including access to healthcare and the right to choose. He calls for the passage of the Equality Act to protect LGBTQ+ rights. Additionally, President Biden discusses the need to address the opioid epidemic, improve mental health services, support veterans, and fight against cancer. He expresses optimism for the future of America and the strength of the American people.", metadata={'doc_id': '56345bff-3ead-418c-a4ff-dff203f77474'})
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
9194
```

## काल्पनिक क्वेरी

किसी विशेष दस्तावेज़ से पूछे जा सकने वाले काल्पनिक प्रश्नों की सूची उत्पन्न करने के लिए एक LLM का भी उपयोग किया जा सकता है। इन प्रश्नों को फिर एम्बेड किया जा सकता है

```python
functions = [
    {
        "name": "hypothetical_questions",
        "description": "Generate hypothetical questions",
        "parameters": {
            "type": "object",
            "properties": {
                "questions": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": ["questions"],
        },
    }
]
```

```python
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser

chain = (
    {"doc": lambda x: x.page_content}
    # Only asking for 3 hypothetical questions, but this could be adjusted
    | ChatPromptTemplate.from_template(
        "Generate a list of exactly 3 hypothetical questions that the below document could be used to answer:\n\n{doc}"
    )
    | ChatOpenAI(max_retries=0, model="gpt-4").bind(
        functions=functions, function_call={"name": "hypothetical_questions"}
    )
    | JsonKeyOutputFunctionsParser(key_name="questions")
)
```

```python
chain.invoke(docs[0])
```

```output
["What was the author's first experience with programming like?",
 'Why did the author switch their focus from AI to Lisp during their graduate studies?',
 'What led the author to contemplate a career in art instead of computer science?']
```

```python
hypothetical_questions = chain.batch(docs, {"max_concurrency": 5})
```

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="hypo-questions", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
question_docs = []
for i, question_list in enumerate(hypothetical_questions):
    question_docs.extend(
        [Document(page_content=s, metadata={id_key: doc_ids[i]}) for s in question_list]
    )
```

```python
retriever.vectorstore.add_documents(question_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
sub_docs
```

```output
[Document(page_content='Who has been nominated to serve on the United States Supreme Court?', metadata={'doc_id': '0b3a349e-c936-4e77-9c40-0a39fc3e07f0'}),
 Document(page_content="What was the context and content of Robert Morris' advice to the document's author in 2010?", metadata={'doc_id': 'b2b2cdca-988a-4af1-ba47-46170770bc8c'}),
 Document(page_content='How did personal circumstances influence the decision to pass on the leadership of Y Combinator?', metadata={'doc_id': 'b2b2cdca-988a-4af1-ba47-46170770bc8c'}),
 Document(page_content='What were the reasons for the author leaving Yahoo in the summer of 1999?', metadata={'doc_id': 'ce4f4981-ca60-4f56-86f0-89466de62325'})]
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
9194
```
