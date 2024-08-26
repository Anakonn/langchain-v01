---
translated: true
---

# मोमेंटो वेक्टर इंडेक्स (एमवीआई)

>[एमवीआई](https://gomomento.com): आपके डेटा के लिए सबसे उत्पादक, सबसे आसान उपयोग, सर्वरलेस वेक्टर इंडेक्स। एमवीआई के साथ शुरू करने के लिए, बस एक खाता खोलें। इंफ्रास्ट्रक्चर को संभालने, सर्वर का प्रबंधन करने या स्केलिंग के बारे में चिंता करने की आवश्यकता नहीं है। एमवीआई एक सेवा है जो आपकी जरूरतों को पूरा करने के लिए स्वचालित रूप से स्केल होता है।

एमवीआई में साइन अप करने और उसका उपयोग करने के लिए, [मोमेंटो कंसोल](https://console.gomomento.com) पर जाएं।

# सेटअप

## पूर्वापेक्षाएं स्थापित करें

आपको निम्नलिखित की आवश्यकता होगी:
- एमवीआई के साथ बातचीत करने के लिए [`momento`](https://pypi.org/project/momento/) पैकेज, और
- ओपनएआई एपीआई के साथ बातचीत करने के लिए ओपनएआई पैकेज।
- पाठ को टोकनाइज़ करने के लिए टिकटोक पैकेज।

```python
%pip install --upgrade --quiet  momento langchain-openai tiktoken
```

## एपीआई कुंजियां दर्ज करें

```python
import getpass
import os
```

### मोमेंटो: डेटा इंडेक्सिंग के लिए

अपना एपीआई कुंजी प्राप्त करने के लिए [मोमेंटो कंसोल](https://console.gomomento.com) पर जाएं।

```python
os.environ["MOMENTO_API_KEY"] = getpass.getpass("Momento API Key:")
```

### ओपनएआई: पाठ एम्बेडिंग के लिए

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

# अपना डेटा लोड करें

यहां हम लैंगचेन से उदाहरण डेटासेट, राष्ट्रपति के संयुक्त राज्य अमेरिका के संदेश का उपयोग करते हैं।

पहले हम संबंधित मॉड्यूल लोड करते हैं:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MomentoVectorIndex
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

फिर हम डेटा लोड करते हैं:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
len(documents)
```

```output
1
```

ध्यान दें कि डेटा एक बड़ी फ़ाइल है, इसलिए केवल एक दस्तावेज़ है:

```python
len(documents[0].page_content)
```

```output
38539
```

क्योंकि यह एक बड़ा पाठ फ़ाइल है, हम प्रश्न उत्तर के लिए इसे टुकड़ों में विभाजित करते हैं। इस तरह, उपयोगकर्ता के प्रश्नों का उत्तर सबसे प्रासंगिक टुकड़े से दिया जाएगा।

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
len(docs)
```

```output
42
```

# अपना डेटा इंडेक्स करें

अपना डेटा इंडेक्स करना `MomentoVectorIndex` ऑब्जेक्ट को इंस्टैंशिएट करना है। यहां हम `from_documents` हेल्पर का उपयोग करते हैं जो दोनों इंस्टैंशिएट और डेटा इंडेक्स करता है:

```python
vector_db = MomentoVectorIndex.from_documents(
    docs, OpenAIEmbeddings(), index_name="sotu"
)
```

यह आपके एपीआई कुंजी का उपयोग करके मोमेंटो वेक्टर इंडेक्स सेवा से कनेक्ट होता है और डेटा को इंडेक्स करता है। यदि पहले से इंडेक्स मौजूद नहीं था, तो यह प्रक्रिया उसे आपके लिए बनाती है। अब डेटा खोजने योग्य है।

# अपना डेटा क्वेरी करें

## सीधे इंडेक्स के खिलाफ प्रश्न पूछें

डेटा को क्वेरी करने का सबसे सीधा तरीका इंडेक्स के खिलाफ खोजना है। हम `VectorStore` एपीआई का उपयोग करके ऐसा कर सकते हैं:

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

हालांकि, यह केटांजी ब्राउन जैक्सन के बारे में प्रासंगिक जानकारी शामिल करता है, लेकिन हमारे पास एक संक्षिप्त, मानव-पठनीय उत्तर नहीं है। हम अगले खंड में इस पर काम करेंगे।

## एक एलएलएम का उपयोग करके सुलभ उत्तर उत्पन्न करें

एमवीआई में डेटा इंडेक्स होने के साथ, हम किसी भी श्रृंखला के साथ एकीकृत कर सकते हैं जो वेक्टर समानता खोज का उपयोग करता है। यहां हम `RetrievalQA` श्रृंखला का उपयोग करके दिखाते हैं कि इंडेक्स किए गए डेटा से प्रश्नों का उत्तर कैसे दिया जाता है।

पहले हम संबंधित मॉड्यूल लोड करते हैं:

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
```

फिर हम पुनर्प्राप्ति क्यूए श्रृंखला को इंस्टैंशिएट करते हैं:

```python
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
qa_chain = RetrievalQA.from_chain_type(llm, retriever=vector_db.as_retriever())
```

```python
qa_chain({"query": "What did the president say about Ketanji Brown Jackson?"})
```

```output
{'query': 'What did the president say about Ketanji Brown Jackson?',
 'result': "The President said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court. He described her as one of the nation's top legal minds and mentioned that she has received broad support from various groups, including the Fraternal Order of Police and former judges appointed by Democrats and Republicans."}
```

# अगले कदम

यही है! अब आपने अपना डेटा इंडेक्स कर लिया है और मोमेंटो वेक्टर इंडेक्स का उपयोग करके इसे क्वेरी कर सकते हैं। आप वही इंडेक्स किसी भी श्रृंखला से क्वेरी करने के लिए उपयोग कर सकते हैं जो वेक्टर समानता खोज का समर्थन करता है।

मोमेंटो के साथ, आप न केवल अपने वेक्टर डेटा को इंडेक्स कर सकते हैं, बल्कि अपने एपीआई कॉल और चैट संदेश इतिहास को भी कैश कर सकते हैं। मोमेंटो लैंगचेन एकीकरणों के बारे में और जानने के लिए देखें।

मोमेंटो वेक्टर इंडेक्स के बारे में अधिक जानने के लिए, [मोमेंटो दस्तावेज़ीकरण](https://docs.gomomento.com) पर जाएं।
