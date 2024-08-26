---
translated: true
---

# बैडू क्लाउड एलास्टिक सर्च वेक्टर सर्च

>[बैडू क्लाउड वेक्टर सर्च](https://cloud.baidu.com/doc/BES/index.html?from=productToDoc) एक पूरी तरह से प्रबंधित, उद्यम-स्तरीय वितरित खोज और विश्लेषण सेवा है जो 100% ओपन सोर्स के अनुरूप है। बैडू क्लाउड वेक्टर सर्च संरचित/अरचित डेटा के लिए एक कम लागत, उच्च-प्रदर्शन और विश्वसनीय पुनर्प्राप्ति और विश्लेषण प्लेटफॉर्म स्तर की उत्पाद सेवाएं प्रदान करता है। एक वेक्टर डेटाबेस के रूप में, यह कई सूचकांक प्रकार और समानता दूरी विधियों का समर्थन करता है।

>`बैडू क्लाउड एलास्टिक सर्च` एक विशेषाधिकार प्रबंधन तंत्र प्रदान करता है, ताकि आप क्लस्टर विशेषाधिकारों को स्वतंत्र रूप से कॉन्फ़िगर कर सकें, ताकि डेटा सुरक्षा को और सुनिश्चित किया जा सके।

यह नोटबुक `बैडू क्लाउड एलास्टिक सर्च वेक्टर स्टोर` से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।
चलाने के लिए, आपके पास एक [बैडू क्लाउड एलास्टिक सर्च](https://cloud.baidu.com/product/bes.html) उदाहरण चालू और चल रहा होना चाहिए:

[सहायता दस्तावेज़](https://cloud.baidu.com/doc/BES/s/8llyn0hh4) पढ़कर बैडू क्लाउड एलास्टिक सर्च उदाहरण को जल्दी से परिचित और कॉन्फ़िगर करें।

उदाहरण चालू और चल रहा होने के बाद, दस्तावेज़ों को विभाजित करने, एम्बेडिंग प्राप्त करने, बैडू क्लाउड एलास्टिक सर्च उदाहरण से कनेक्ट करने, दस्तावेज़ों को सूचीबद्ध करने और वेक्टर पुनर्प्राप्ति करने के लिए इन चरणों का पालन करें।

हमें पहले निम्नलिखित Python पैकेज स्थापित करने की आवश्यकता है।

```python
%pip install --upgrade --quiet  elasticsearch == 7.11.0
```

पहले, हम `QianfanEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें क्वियानफान AK और SK प्राप्त करने की आवश्यकता है। क्वियानफान से संबंधित विवरण [बैडू क्वियानफान वर्कशॉप](https://cloud.baidu.com/product/wenxinworkshop) से संबंधित है।

```python
import getpass
import os

os.environ["QIANFAN_AK"] = getpass.getpass("Your Qianfan AK:")
os.environ["QIANFAN_SK"] = getpass.getpass("Your Qianfan SK:")
```

दूसरा, दस्तावेज़ों को विभाजित करें और एम्बेडिंग प्राप्त करें।

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint()
```

फिर, एक बैडू एलास्टिक सर्च पहुंच योग्य उदाहरण बनाएं।

```python
# Create a bes instance and index docs.
from langchain_community.vectorstores import BESVectorStore

bes = BESVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    bes_url="your bes cluster url",
    index_name="your vector index",
)
bes.client.indices.refresh(index="your vector index")
```

अंत में, क्वेरी और डेटा पुनर्प्राप्त करें।

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = bes.similarity_search(query)
print(docs[0].page_content)
```

कृपया <liuboyao@baidu.com> या <chenweixu01@baidu.com> से संपर्क करें यदि आप किसी भी समस्या का सामना करते हैं, और हम आपका समर्थन करने का पूरा प्रयास करेंगे।
