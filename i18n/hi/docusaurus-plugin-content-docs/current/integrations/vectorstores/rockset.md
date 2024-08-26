---
translated: true
---

# रॉकसेट

>[रॉकसेट](https://rockset.com/) एक रियल-टाइम सर्च और विश्लेषण डेटाबेस है जो क्लाउड के लिए बनाया गया है। रॉकसेट एक [कन्वर्ज्ड इंडेक्स™](https://rockset.com/blog/converged-indexing-the-secret-sauce-behind-rocksets-fast-queries/) का उपयोग करता है जिसमें वेक्टर एम्बेडिंग्स के लिए एक कुशल स्टोर है ताकि बड़े पैमाने पर कम लेटेंसी और उच्च कंकरेंसी सर्च क्वेरी को सर्व किया जा सके। रॉकसेट में मेटाडेटा फिल्टरिंग का पूर्ण समर्थन है और यह लगातार अपडेट होते, स्ट्रीमिंग डेटा के लिए रियल-टाइम इंजेस्ट को संभालता है।

यह नोटबुक दिखाता है कि LangChain में वेक्टर स्टोर के रूप में `रॉकसेट` का उपयोग कैसे किया जाए। शुरू करने से पहले, आपके पास एक `रॉकसेट` खाता और उपलब्ध API कुंजी होना सुनिश्चित करें। [आज ही अपना मुफ्त ट्रायल शुरू करें।](https://rockset.com/create/)

## अपने वातावरण को सेट करना

1. लिखने वाले API को अपना स्रोत बनाकर `रॉकसेट` कंसोल का उपयोग करके एक [संग्रह](https://rockset.com/docs/collections/) बनाएं। इस वॉकथ्रू में, हम `langchain_demo` नाम का एक संग्रह बनाते हैं।

    निम्नलिखित [इंजेस्ट ट्रांसफॉर्मेशन](https://rockset.com/docs/ingest-transformation/) कॉन्फ़िगर करें ताकि आप अपने एम्बेडिंग फ़ील्ड को चिह्नित कर सकें और प्रदर्शन और स्टोरेज अनुकूलन का लाभ उठा सकें:

   (हमने इन उदाहरणों के लिए OpenAI `text-embedding-ada-002` का उपयोग किया है, जहां #length_of_vector_embedding = 1536)

```sql
SELECT _input.* EXCEPT(_meta),
VECTOR_ENFORCE(_input.description_embedding, #length_of_vector_embedding, 'float') as description_embedding
FROM _input
```

2. अपना संग्रह बनाने के बाद, कंसोल का उपयोग करके एक [API कुंजी](https://rockset.com/docs/iam/#users-api-keys-and-roles) प्राप्त करें। इस नोटबुक के उद्देश्य के लिए, हम `ओरेगन(us-west-2)` क्षेत्र का उपयोग कर रहे हैं।

3. LangChain को सीधे `रॉकसेट` से संवाद करने में सक्षम बनाने के लिए [rockset-python-client](https://github.com/rockset/rockset-python-client) स्थापित करें।

```python
%pip install --upgrade --quiet  rockset
```

## LangChain ट्यूटोरियल

अपने स्वयं के Python नोटबुक में अनुसरण करें और रॉकसेट में वेक्टर एम्बेडिंग्स को जनरेट और स्टोर करें।
अपने सर्च क्वेरी से मिलते-जुलते दस्तावेजों को खोजने के लिए रॉकसेट का उपयोग शुरू करें।

### 1. प्रमुख चर परिभाषित करें

```python
import os

import rockset

ROCKSET_API_KEY = os.environ.get(
    "ROCKSET_API_KEY"
)  # Verify ROCKSET_API_KEY environment variable
ROCKSET_API_SERVER = rockset.Regions.usw2a1  # Verify Rockset region
rockset_client = rockset.RocksetClient(ROCKSET_API_SERVER, ROCKSET_API_KEY)

COLLECTION_NAME = "langchain_demo"
TEXT_KEY = "description"
EMBEDDING_KEY = "description_embedding"
```

### 2. दस्तावेज तैयार करें

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Rockset
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 3. दस्तावेज़ डालें

```python
embeddings = OpenAIEmbeddings()  # Verify OPENAI_API_KEY environment variable

docsearch = Rockset(
    client=rockset_client,
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    text_key=TEXT_KEY,
    embedding_key=EMBEDDING_KEY,
)

ids = docsearch.add_texts(
    texts=[d.page_content for d in docs],
    metadatas=[d.metadata for d in docs],
)
```

### 4. समान दस्तावेज़ खोजें

```python
query = "What did the president say about Ketanji Brown Jackson"
output = docsearch.similarity_search_with_relevance_scores(
    query, 4, Rockset.DistanceFunction.COSINE_SIM
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.764990692109871 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7485416901622112 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7468678973398306 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7436231261419488 {'source': '../../../state_of_the_union.txt'} Groups of citizens b...
```

### 5. फ़िल्टरिंग के साथ समान दस्तावेज़ खोजें

```python
output = docsearch.similarity_search_with_relevance_scores(
    query,
    4,
    Rockset.DistanceFunction.COSINE_SIM,
    where_str="{} NOT LIKE '%citizens%'".format(TEXT_KEY),
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.7651359650263554 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7486265516824893 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7469625542348115 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7344177777547739 {'source': '../../../state_of_the_union.txt'} We see the unity amo...
```

### 6. [वैकल्पिक] डाले गए दस्तावेज़ हटाएं

प्रत्येक दस्तावेज़ को हटाने के लिए आपके पास उसका अद्वितीय ID होना चाहिए।
`Rockset.add_texts()` के साथ दस्तावेज़ डालते समय ID परिभाषित करें। अन्यथा, रॉकसेट प्रत्येक दस्तावेज़ के लिए एक अद्वितीय ID उत्पन्न करेगा। इसके बावजूद, `Rockset.add_texts()` डाले गए दस्तावेज़ों के ID लौटाता है।

इन दस्तावेज़ों को हटाने के लिए, बस `Rockset.delete_texts()` फ़ंक्शन का उपयोग करें।

```python
docsearch.delete_texts(ids)
```

## सारांश

इस ट्यूटोरियल में, हमने सफलतापूर्वक एक `रॉकसेट` संग्रह बनाया, OpenAI एम्बेडिंग्स के साथ दस्तावेज़ `डाले`, और मेटाडेटा फ़िल्टर के साथ और बिना समान दस्तावेज़ खोजे।

https://rockset.com/ पर भविष्य के अपडेट के लिए नज़र रखें।
