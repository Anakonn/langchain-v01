---
translated: true
---

# एप्सिला

>[एप्सिला](https://www.epsilla.com) एक ओपन-सोर्स वेक्टर डेटाबेस है जो उन्नत समानांतर ग्राफ ट्रावर्सल तकनीकों का उपयोग करके वेक्टर इंडेक्सिंग करता है। एप्सिला जीपीएल-3.0 के तहत लाइसेंस प्राप्त है।

यह नोटबुक `एप्सिला` वेक्टर डेटाबेस से संबंधित कार्यक्षमताओं का उपयोग करने का तरीका दिखाता है।

पूर्व-आवश्यकता के रूप में, आपके पास एक चल रहा एप्सिला वेक्टर डेटाबेस (उदाहरण के लिए, हमारे डॉकर छवि के माध्यम से) और `pyepsilla` पैकेज इंस्टॉल होना चाहिए। पूर्ण दस्तावेज़ देखें [docs](https://epsilla-inc.gitbook.io/epsilladb/quick-start)।

```python
!pip/pip3 install pyepsilla
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API Key प्राप्त करना होगा।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

OpenAI API Key: ········

```python
from langchain_community.vectorstores import Epsilla
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0).split_documents(
    documents
)

embeddings = OpenAIEmbeddings()
```

एप्सिला वेक्टरडीबी डिफ़ॉल्ट होस्ट "localhost" और पोर्ट "8888" पर चल रहा है। हमारे पास कस्टम डीबी पथ, डीबी नाम और संग्रह नाम हैं, न कि डिफ़ॉल्ट।

```python
from pyepsilla import vectordb

client = vectordb.Client()
vector_store = Epsilla.from_documents(
    documents,
    embeddings,
    client,
    db_path="/tmp/mypath",
    db_name="MyDB",
    collection_name="MyCollection",
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```

राज्य दर राज्य में, न केवल मतदान को दबाने के लिए, बल्कि पूरे चुनावों को उलट देने के लिए नए कानून पारित किए गए हैं।

हम इसे होने नहीं दे सकते।

आज रात। मैं सीनेट से आग्रह करता हूं कि: स्वतंत्रता मतदान अधिनियम पारित करें। जॉन लुईस मतदान अधिकार अधिनियम पारित करें। और इसके साथ ही, प्रकटीकरण अधिनियम भी पारित करें ताकि अमेरिकी जान सकें कि हमारे चुनावों का वित्तपोषण किसके द्वारा किया जा रहा है।

आज रात, मैं किसी ऐसे व्यक्ति का सम्मान करना चाहता हूं जिसने इस देश की सेवा करने के लिए अपना जीवन समर्पित कर दिया है: न्यायाधीश स्टीफन ब्रेयर - एक सेना के पूर्व सैनिक, संवैधानिक विद्वान और संयुक्त राज्य अमेरिका के सर्वोच्च न्यायालय के सेवानिवृत्त न्यायाधीश। न्यायाधीश ब्रेयर, आपके सेवा के लिए धन्यवाद।

राष्ट्रपति का सबसे गंभीर संवैधानिक उत्तरदायित्वों में से एक संयुक्त राज्य अमेरिका के सर्वोच्च न्यायालय में किसी व्यक्ति को नामित करना है।

और मैंने ऐसा ही किया है 4 दिन पहले, जब मैंने अपीलीय न्यायालय के न्यायाधीश केटानी ब्राउन जैक्सन को नामित किया। हमारे देश के शीर्ष कानूनी मस्तिष्कों में से एक, जो न्यायाधीश ब्रेयर के उत्कृष्टता के कार्यकाल को जारी रखेंगे।
