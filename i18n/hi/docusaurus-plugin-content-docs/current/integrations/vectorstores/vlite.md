---
translated: true
---

# vlite

VLite एक सरल और तेज़ वेक्टर डेटाबेस है जो आपको एम्बेडिंग का उपयोग करके डेटा को语义रूप से स्टोर और पुनः प्राप्त करने की अनुमति देता है। numpy के साथ बनाया गया, vlite आपके प्रोजेक्ट्स में RAG, समानता खोज और एम्बेडिंग को लागू करने के लिए एक हल्का बैटरी-शामिल डेटाबेस है।

## इंस्टॉलेशन

VLite का उपयोग करने के लिए, आपको `vlite` पैकेज इंस्टॉल करना होगा:

```bash
!pip install vlite
```

## VLite आयात करना

```python
from langchain.vectorstores import VLite
```

## बेसिक उदाहरण

इस बेसिक उदाहरण में, हम एक पाठ दस्तावेज़ लोड करते हैं और उन्हें VLite वेक्टर डेटाबेस में संग्रहीत करते हैं। फिर, हम एक क्वेरी के आधार पर प्रासंगिक दस्तावेज़ों को पुनः प्राप्त करने के लिए समानता खोज करते हैं।

VLite पाठ को टुकड़ों में बांटने और एम्बेड करने के लिए आपके लिए देखता है, और आप पाठ को पहले से टुकड़ों में बांटकर और/या उन टुकड़ों को VLite डेटाबेस में एम्बेड करके इन पैरामीटरों को बदल सकते हैं।

```python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# Load the document and split it into chunks
loader = TextLoader("path/to/document.txt")
documents = loader.load()

# Create a VLite instance
vlite = VLite(collection="my_collection")

# Add documents to the VLite vector database
vlite.add_documents(documents)

# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query)

# Print the most relevant document
print(docs[0].page_content)
```

## पाठ और दस्तावेज़ जोड़ना

आप `add_texts` और `add_documents` विधियों का उपयोग करके VLite वेक्टर डेटाबेस में पाठ या दस्तावेज़ जोड़ सकते हैं।

```python
# Add texts to the VLite vector database
texts = ["This is the first text.", "This is the second text."]
vlite.add_texts(texts)

# Add documents to the VLite vector database
documents = [Document(page_content="This is a document.", metadata={"source": "example.txt"})]
vlite.add_documents(documents)
```

## समानता खोज

VLite संग्रहीत दस्तावेज़ों पर समानता खोज करने के लिए विधियां प्रदान करता है।

```python
# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query, k=3)

# Perform a similarity search with scores
docs_with_scores = vlite.similarity_search_with_score(query, k=3)
```

## अधिकतम सीमांत प्रासंगिकता खोज

VLite अधिकतम सीमांत प्रासंगिकता (MMR) खोज का भी समर्थन करता है, जो क्वेरी से समानता और पुनः प्राप्त दस्तावेज़ों के बीच विविधता को अनुकूलित करता है।

```python
# Perform an MMR search
docs = vlite.max_marginal_relevance_search(query, k=3)
```

## दस्तावेज़ अपडेट और हटाना

आप `update_document` और `delete` विधियों का उपयोग करके VLite वेक्टर डेटाबेस में दस्तावेज़ अपडेट या हटा सकते हैं।

```python
# Update a document
document_id = "doc_id_1"
updated_document = Document(page_content="Updated content", metadata={"source": "updated.txt"})
vlite.update_document(document_id, updated_document)

# Delete documents
document_ids = ["doc_id_1", "doc_id_2"]
vlite.delete(document_ids)
```

## दस्तावेज़ पुनः प्राप्त करना

आप `get` विधि का उपयोग करके उनके ID या मेटाडेटा के आधार पर VLite वेक्टर डेटाबेस से दस्तावेज़ पुनः प्राप्त कर सकते हैं।

```python
# Retrieve documents by IDs
document_ids = ["doc_id_1", "doc_id_2"]
docs = vlite.get(ids=document_ids)

# Retrieve documents by metadata
metadata_filter = {"source": "example.txt"}
docs = vlite.get(where=metadata_filter)
```

## VLite इंस्टेंस बनाना

आप विभिन्न तरीकों का उपयोग करके VLite इंस्टेंस बना सकते हैं:

```python
# Create a VLite instance from texts
vlite = VLite.from_texts(texts)

# Create a VLite instance from documents
vlite = VLite.from_documents(documents)

# Create a VLite instance from an existing index
vlite = VLite.from_existing_index(collection="existing_collection")
```

## अतिरिक्त सुविधाएं

VLite वेक्टर डेटाबेस के प्रबंधन के लिए अतिरिक्त सुविधाएं प्रदान करता है:

```python
from langchain.vectorstores import VLite
vlite = VLite(collection="my_collection")

# Get the number of items in the collection
count = vlite.count()

# Save the collection
vlite.save()

# Clear the collection
vlite.clear()

# Get collection information
vlite.info()

# Dump the collection data
data = vlite.dump()
```
