---
translated: true
---

# होलोग्रेस

>[होलोग्रेस](https://www.alibabacloud.com/help/en/hologres/latest/introduction) एक एकीकृत रियल-टाइम डेटा वेयरहाउसिंग सेवा है जिसे अलीबाबा क्लाउड द्वारा विकसित किया गया है। आप होलोग्रेस का उपयोग कर सकते हैं ताकि आप बड़ी मात्रा में डेटा को रियल-टाइम में लिख, अपडेट, प्रोसेस और विश्लेषण कर सकें।
>होलोग्रेस मानक SQL वाक्यविन्यास का समर्थन करता है, PostgreSQL के साथ संगत है और अधिकांश PostgreSQL फ़ंक्शनों का समर्थन करता है। होलोग्रेस पेटाबाइट्स के डेटा के लिए ऑनलाइन विश्लेषणात्मक प्रोसेसिंग (OLAP) और एड-हॉक विश्लेषण का समर्थन करता है और उच्च-कंकरेंसी और कम-लेटेंसी ऑनलाइन डेटा सेवाएं प्रदान करता है।

>होलोग्रेस [Proxima](https://www.alibabacloud.com/help/en/hologres/latest/vector-processing) को अपनाकर **वेक्टर डेटाबेस** कार्यक्षमता प्रदान करता है।
>Proxima एक उच्च-प्रदर्शन सॉफ़्टवेयर लाइब्रेरी है जिसे अलीबाबा DAMO अकादमी द्वारा विकसित किया गया है। यह आपको वेक्टरों के निकटतम पड़ोसियों को खोजने में सक्षम बनाता है। Proxima Faiss जैसे समान ओपन-सोर्स सॉफ़्टवेयर की तुलना में अधिक स्थिरता और प्रदर्शन प्रदान करता है। Proxima आपको उच्च थ्रूपुट और कम लेटेंसी के साथ समान पाठ या छवि एम्बेडिंग खोजने में सक्षम बनाता है। होलोग्रेस Proxima के साथ गहराई से एकीकृत है ताकि एक उच्च-प्रदर्शन वेक्टर खोज सेवा प्रदान किया जा सके।

यह नोटबुक `Hologres Proxima` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।
[यहाँ](https://www.alibabacloud.com/zh/product/hologres) क्लिक करें ताकि एक होलोग्रेस क्लाउड इंस्टेंस को तेजी से तैनात किया जा सके।

```python
%pip install --upgrade --quiet  hologres-vector
```

```python
from langchain_community.vectorstores import Hologres
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

OpenAI API को कॉल करके दस्तावेजों को विभाजित करें और एम्बेडिंग प्राप्त करें

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

संबंधित पर्यावरण सेट करके होलोग्रेस से कनेक्ट करें

```bash
export PG_HOST={host}
export PG_PORT={port} # Optional, default is 80
export PG_DATABASE={db_name} # Optional, default is postgres
export PG_USER={username}
export PG_PASSWORD={password}
```

फिर अपने एम्बेडिंग और दस्तावेज़ों को होलोग्रेस में संग्रहीत करें

```python
import os

connection_string = Hologres.connection_string_from_db_params(
    host=os.environ.get("PGHOST", "localhost"),
    port=int(os.environ.get("PGPORT", "80")),
    database=os.environ.get("PGDATABASE", "postgres"),
    user=os.environ.get("PGUSER", "postgres"),
    password=os.environ.get("PGPASSWORD", "postgres"),
)

vector_db = Hologres.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
    table_name="langchain_example_embeddings",
)
```

क्वेरी और डेटा पुनः प्राप्त करें

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
