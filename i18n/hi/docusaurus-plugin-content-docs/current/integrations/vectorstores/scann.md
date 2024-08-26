---
translated: true
---

# ScaNN

ScaNN (Scalable Nearest Neighbors) एक पैमाने पर वेक्टर समानता खोज के लिए एक प्रणाली है।

ScaNN में अधिकतम आंतरिक उत्पाद खोज के लिए खोज स्थान प्रुनिंग और क्वांटीकरण शामिल है और यह यूक्लिडियन दूरी जैसे अन्य दूरी कार्यों का भी समर्थन करता है। कार्यान्वयन AVX2 समर्थन के साथ x86 प्रोसेसर के लिए अनुकूलित है। अधिक जानकारी के लिए इसके [Google Research github](https://github.com/google-research/google-research/tree/master/scann) देखें।

## स्थापना

pip के माध्यम से ScaNN स्थापित करें। वैकल्पिक रूप से, आप [ScaNN वेबसाइट](https://github.com/google-research/google-research/tree/master/scann#building-from-source) पर दिए गए निर्देशों का पालन करके स्रोत से स्थापित कर सकते हैं।

```python
%pip install --upgrade --quiet  scann
```

## पुनर्प्राप्ति प्रदर्शन

नीचे हम Huggingface Embeddings के साथ ScaNN का उपयोग करने का प्रदर्शन करते हैं।

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import ScaNN
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)


embeddings = HuggingFaceEmbeddings()

db = ScaNN.from_documents(docs, embeddings)
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

## RetrievalQA प्रदर्शन

अगला, हम Google PaLM API के साथ ScaNN का उपयोग करने का प्रदर्शन करते हैं।

आप https://developers.generativeai.google/tutorials/setup से एक API कुंजी प्राप्त कर सकते हैं।

```python
from langchain.chains import RetrievalQA
from langchain_community.chat_models import google_palm

palm_client = google_palm.ChatGooglePalm(google_api_key="YOUR_GOOGLE_PALM_API_KEY")

qa = RetrievalQA.from_chain_type(
    llm=palm_client,
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={"k": 10}),
)
```

```python
print(qa.run("What did the president say about Ketanji Brown Jackson?"))
```

```output
The president said that Ketanji Brown Jackson is one of our nation's top legal minds, who will continue Justice Breyer's legacy of excellence.
```

```python
print(qa.run("What did the president say about Michael Phelps?"))
```

```output
The president did not mention Michael Phelps in his speech.
```

## स्थानीय पुनर्प्राप्ति सूचकांक सहेजें और लोड करें

```python
db.save_local("/tmp/db", "state_of_union")
restored_db = ScaNN.load_local("/tmp/db", embeddings, index_name="state_of_union")
```
