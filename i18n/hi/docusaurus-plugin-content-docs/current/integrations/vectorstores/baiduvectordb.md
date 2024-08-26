---
translated: true
---

# बैडू वेक्टर डीबी

>[बैडू वेक्टर डीबी](https://cloud.baidu.com/product/vdb.html) एक मजबूत, उद्यम-स्तरीय वितरित डेटाबेस सेवा है, जिसे बैडू इंटेलिजेंट क्लाउड द्वारा बारीकी से विकसित और पूरी तरह से प्रबंधित किया गया है। यह बहु-आयामी वेक्टर डेटा को संग्रहीत, पुनर्प्राप्त और विश्लेषित करने की अपनी असाधारण क्षमता के लिए प्रसिद्ध है। वेक्टर डीबी का मूल केंद्र बैडू के स्वामित्व वाले "मोचो" वेक्टर डेटाबेस केर्नल पर काम करता है, जो उच्च प्रदर्शन, उपलब्धता और सुरक्षा के साथ-साथ उल्लेखनीय स्केलेबिलिटी और उपयोगकर्ता-अनुकूलता सुनिश्चित करता है।

>यह डेटाबेस सेवा विभिन्न प्रकार के सूचकांक और समानता गणना विधियों का समर्थन करती है, जो विभिन्न उपयोग मामलों के अनुकूल है। वेक्टर डीबी की एक उल्लेखनीय विशेषता यह है कि यह 10 बिलियन तक के विशाल वेक्टर स्केल का प्रबंधन करने में सक्षम है, साथ ही मिलीसेकंड स्तर की क्वेरी लेटेंसी के साथ प्रति सेकंड मिलियन क्वेरी (QPS) का समर्थन करते हुए भी उत्कृष्ट क्वेरी प्रदर्शन बनाए रखता है।

यह नोटबुक बैडू वेक्टर डीबी से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

चलाने के लिए, आपके पास एक [डेटाबेस इंस्टेंस](https://cloud.baidu.com/doc/VDB/s/hlrsoazuf) होना चाहिए।

```python
!pip3 install pymochow
```

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import BaiduVectorDB
from langchain_community.vectorstores.baiduvectordb import ConnectionParams
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = FakeEmbeddings(size=128)
```

```python
conn_params = ConnectionParams(
    endpoint="http://192.168.xx.xx:xxxx", account="root", api_key="****"
)

vector_db = BaiduVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, drop_old=True
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```

```python
vector_db = BaiduVectorDB(embeddings, conn_params)
vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```
