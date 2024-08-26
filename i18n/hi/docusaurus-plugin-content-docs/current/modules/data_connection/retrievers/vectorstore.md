---
sidebar_position: 0
translated: true
---

# वेक्टर स्टोर-बैक्ड रिट्रीवर

एक वेक्टर स्टोर रिट्रीवर एक रिट्रीवर है जो वेक्टर स्टोर का उपयोग करके दस्तावेज़ों को पुनः प्राप्त करता है। यह वेक्टर स्टोर क्लास का एक हल्का राप्पर है जो इसे रिट्रीवर इंटरफ़ेस के अनुरूप बनाता है।
यह वेक्टर स्टोर द्वारा लागू किए गए खोज तरीकों, जैसे समानता खोज और MMR, का उपयोग करके वेक्टर स्टोर में मौजूद पाठों को क्वेरी करता है।

एक बार जब आप एक वेक्टर स्टोर का निर्माण कर लेते हैं, तो एक रिट्रीवर बनाना बहुत आसान है। चलिए एक उदाहरण के माध्यम से चलते हैं।

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../state_of_the_union.txt")
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
```

```python
retriever = db.as_retriever()
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## अधिकतम सीमांत प्रासंगिकता पुनर्प्राप्ति

डिफ़ॉल्ट रूप से, वेक्टर स्टोर रिट्रीवर समानता खोज का उपयोग करता है। यदि अंतर्निहित वेक्टर स्टोर अधिकतम सीमांत प्रासंगिकता खोज का समर्थन करता है, तो आप खोज प्रकार के रूप में इसका निर्दिष्ट कर सकते हैं।

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## समानता स्कोर थ्रेशोल्ड पुनर्प्राप्ति

आप एक पुनर्प्राप्ति विधि भी सेट कर सकते हैं जो एक समानता स्कोर थ्रेशोल्ड सेट करता है और केवल उन दस्तावेजों को वापस लौटाता है जिनका स्कोर उस थ्रेशोल्ड से ऊपर है।

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.5}
)
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## शीर्ष k निर्दिष्ट करना

आप खोज kwargs जैसे `k` को भी निर्दिष्ट कर सकते हैं जिसका उपयोग पुनर्प्राप्ति करते समय किया जाना है।

```python
retriever = db.as_retriever(search_kwargs={"k": 1})
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
len(docs)
```

```output
1
```
