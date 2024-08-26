---
translated: true
---

# जैगुआर वेक्टर डेटाबेस

1. यह एक वितरित वेक्टर डेटाबेस है
2. जैगुआरडीबी का "जीरोमूव" फीचर तुरंत क्षैतिज स्केलेबिलिटी को सक्षम करता है
3. बहुमुखी: एम्बेडिंग, पाठ, छवियां, वीडियो, पीडीएफ, ऑडियो, समय श्रृंखला और भू-स्थानिक
4. सभी मास्टर: समानांतर पठन और लेखन की अनुमति देता है
5. असामान्य पता लगाने की क्षमताएं
6. RAG समर्थन: प्रॉप्राइटरी और रियल-टाइम डेटा के साथ एलएलएम को जोड़ता है
7. साझा मेटाडेटा: एक से अधिक वेक्टर इंडेक्स के बीच मेटाडेटा साझाकरण
8. दूरी मीट्रिक्स: यूक्लिडियन, कोसाइन, इनरप्रोडक्ट, मैनहट्टन, चेबीशेव, हैमिंग, जेकार्ड, मिंकोस्की

## पूर्वापेक्षाएं

इस फ़ाइल में दिए गए उदाहरणों को चलाने के लिए दो आवश्यकताएं हैं।
1. आपको जैगुआरडीबी सर्वर और इसके एचटीटीपी गेटवे सर्वर को स्थापित और सेट अप करना होगा।
   कृपया इन निर्देशों का संदर्भ लें:
   [www.jaguardb.com](http://www.jaguardb.com)
   डॉकर वातावरण में त्वरित सेटअप के लिए:
   डॉकर पुल जैगुआरडीबी/जैगुआरडीबी_विथ_एचटीटीपी
   डॉकर रन -डी -पी 8888:8888 -पी 8080:8080 --नाम जैगुआरडीबी_विथ_एचटीटीपी जैगुआरडीबी/जैगुआरडीबी_विथ_एचटीटीपी

2. आपको जैगुआरडीबी के लिए एचटीटीपी क्लाइंट पैकेज को स्थापित करना होगा:
   ```
       pip install -U jaguardb-http-client
   ```

## लैंगचेन के साथ RAG

यह खंड लैंगचेन सॉफ्टवेयर स्टैक में एलएलएम के साथ चैट करने का प्रदर्शन करता है।

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.jaguar import Jaguar
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

"""
Load a text file into a set of documents
"""
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=300)
docs = text_splitter.split_documents(documents)

"""
Instantiate a Jaguar vector store
"""
### Jaguar HTTP endpoint
url = "http://192.168.5.88:8080/fwww/"

### Use OpenAI embedding model
embeddings = OpenAIEmbeddings()

### Pod is a database for vectors
pod = "vdb"

### Vector store name
store = "langchain_rag_store"

### Vector index name
vector_index = "v"

### Type of the vector index
# cosine: distance metric
# fraction: embedding vectors are decimal numbers
# float: values stored with floating-point numbers
vector_type = "cosine_fraction_float"

### Dimension of each embedding vector
vector_dimension = 1536

### Instantiate a Jaguar store object
vectorstore = Jaguar(
    pod, store, vector_index, vector_type, vector_dimension, url, embeddings
)

"""
Login must be performed to authorize the client.
The environment variable JAGUAR_API_KEY or file $HOME/.jagrc
should contain the API key for accessing JaguarDB servers.
"""
vectorstore.login()


"""
Create vector store on the JaguarDB database server.
This should be done only once.
"""
# Extra metadata fields for the vector store
metadata = "category char(16)"

# Number of characters for the text field of the store
text_size = 4096

#  Create a vector store on the server
vectorstore.create(metadata, text_size)

"""
Add the texts from the text splitter to our vectorstore
"""
vectorstore.add_documents(docs)
# or tag the documents:
# vectorstore.add_documents(more_docs, text_tag="tags to these documents")

""" Get the retriever object """
retriever = vectorstore.as_retriever()
# retriever = vectorstore.as_retriever(search_kwargs={"where": "m1='123' and m2='abc'"})

template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

""" Obtain a Large Language Model """
LLM = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

""" Create a chain for the RAG flow """
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | LLM
    | StrOutputParser()
)

resp = rag_chain.invoke("What did the president say about Justice Breyer?")
print(resp)
```

## जैगुआर वेक्टर स्टोर के साथ इंटरैक्शन

उपयोगकर्ता सीधे जैगुआर वेक्टर स्टोर के साथ समानता खोज और असामान्य पता लगाने के लिए बातचीत कर सकते हैं।

```python
from langchain_community.vectorstores.jaguar import Jaguar
from langchain_openai import OpenAIEmbeddings

# Instantiate a Jaguar vector store object
url = "http://192.168.3.88:8080/fwww/"
pod = "vdb"
store = "langchain_test_store"
vector_index = "v"
vector_type = "cosine_fraction_float"
vector_dimension = 10
embeddings = OpenAIEmbeddings()
vectorstore = Jaguar(
    pod, store, vector_index, vector_type, vector_dimension, url, embeddings
)

# Login for authorization
vectorstore.login()

# Create the vector store with two metadata fields
# This needs to be run only once.
metadata_str = "author char(32), category char(16)"
vectorstore.create(metadata_str, 1024)

# Add a list of texts
texts = ["foo", "bar", "baz"]
metadatas = [
    {"author": "Adam", "category": "Music"},
    {"author": "Eve", "category": "Music"},
    {"author": "John", "category": "History"},
]
ids = vectorstore.add_texts(texts=texts, metadatas=metadatas)

#  Search similar text
output = vectorstore.similarity_search(
    query="foo",
    k=1,
    metadatas=["author", "category"],
)
assert output[0].page_content == "foo"
assert output[0].metadata["author"] == "Adam"
assert output[0].metadata["category"] == "Music"
assert len(output) == 1

# Search with filtering (where)
where = "author='Eve'"
output = vectorstore.similarity_search(
    query="foo",
    k=3,
    fetch_k=9,
    where=where,
    metadatas=["author", "category"],
)
assert output[0].page_content == "bar"
assert output[0].metadata["author"] == "Eve"
assert output[0].metadata["category"] == "Music"
assert len(output) == 1

# Anomaly detection
result = vectorstore.is_anomalous(
    query="dogs can jump high",
)
assert result is False

# Remove all data in the store
vectorstore.clear()
assert vectorstore.count() == 0

# Remove the store completely
vectorstore.drop()

# Logout
vectorstore.logout()
```
