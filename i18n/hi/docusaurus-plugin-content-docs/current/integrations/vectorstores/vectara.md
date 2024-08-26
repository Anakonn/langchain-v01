---
translated: true
---

# वेक्टारा

>[वेक्टारा](https://vectara.com/) एक विश्वसनीय जेनएआई प्लेटफॉर्म है जो दस्तावेज़ अनुक्रमण और क्वेरी के लिए एक आसान-इस्तेमाल एपीआई प्रदान करता है।

वेक्टारा रिट्रीवल ऑग्मेंटेड जनरेशन या [RAG](https://vectara.com/grounded-generation/) के लिए एक एंड-टू-एंड प्रबंधित सेवा प्रदान करता है, जिसमें शामिल हैं:

1. दस्तावेज़ फ़ाइलों से पाठ निकालने और उन्हें वाक्यों में विभाजित करने का एक तरीका।

2. [बूमरैंग](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) एम्बेडिंग्स मॉडल का सर्वश्रेष्ठ स्तर। प्रत्येक पाठ खंड को बूमरैंग का उपयोग करके वेक्टर एम्बेडिंग में एनकोड किया जाता है और वेक्टारा आंतरिक ज्ञान (वेक्टर+पाठ) स्टोर में संग्रहीत किया जाता है।

3. एक क्वेरी सेवा जो क्वेरी को स्वचालित रूप से एम्बेडिंग में एनकोड करती है और सबसे प्रासंगिक पाठ खंडों को पुनः प्राप्त करती है ([हाइब्रिड खोज](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) और [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/)) का समर्थन सहित)।

4. [जनरेटिव सारांश](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview) बनाने का विकल्प, पुनः प्राप्त दस्तावेजों के आधार पर, उद्धरण सहित।

एपीआई का उपयोग करने के बारे में अधिक जानकारी के लिए [वेक्टारा एपीआई दस्तावेज़ीकरण](https://docs.vectara.com/docs/) देखें।

यह नोटबुक बुनियादी पुनः प्राप्ति कार्यक्षमता का उपयोग करने का तरीका दिखाता है, जब वेक्टारा का उपयोग केवल एक वेक्टर स्टोर (सारांशीकरण के बिना) के रूप में किया जाता है, जिसमें `similarity_search` और `similarity_search_with_score` शामिल हैं, साथ ही LangChain `as_retriever` कार्यक्षमता का उपयोग करना भी शामिल है।

# सेटअप

वेक्टारा के साथ LangChain का उपयोग करने के लिए आपको एक वेक्टारा खाता होना चाहिए। शुरू करने के लिए निम्नलिखित चरणों का पालन करें:

1. यदि आपके पास पहले से कोई खाता नहीं है, तो [साइन अप](https://www.vectara.com/integrations/langchain) करें। एक बार साइन अप करने के बाद, आपके पास एक वेक्टारा ग्राहक आईडी होगी। आप वेक्टारा कंसोल विंडो के शीर्ष-दाईं ओर अपने नाम पर क्लिक करके अपना ग्राहक आईडी ढूंढ सकते हैं।

2. अपने खाते में आप एक या अधिक कॉर्पस बना सकते हैं। प्रत्येक कॉर्पस इनपुट दस्तावेजों से पाठ डेटा को संग्रहीत करने वाले क्षेत्र का प्रतिनिधित्व करता है। कॉर्पस बनाने के लिए **"Create Corpus"** बटन का उपयोग करें। फिर आप अपने कॉर्पस का नाम और वर्णन प्रदान करते हैं। वैकल्पिक रूप से, आप फ़िल्टरिंग गुण परिभाषित कर सकते हैं और कुछ उन्नत विकल्प लागू कर सकते हैं। यदि आप अपने बनाए गए कॉर्पस पर क्लिक करते हैं, तो आप इसका नाम और कॉर्पस आईडी शीर्ष पर देख सकते हैं।

3. अगला कदम एपीआई कुंजी बनाना है जिससे कॉर्पस तक पहुंच प्राप्त हो। कॉर्पस दृश्य में **"Authorization"** टैब पर क्लिक करें और फिर **"Create API Key"** बटन पर क्लिक करें। अपनी कुंजी का नाम दें और क्वेरी केवल या क्वेरी+इंडेक्स के लिए चुनें। "Create" पर क्लिक करें और अब आपके पास एक सक्रिय एपीआई कुंजी है। इस कुंजी को गोपनीय रखें।

LangChain के साथ वेक्टारा का उपयोग करने के लिए, आपको इन तीन मूल्यों की आवश्यकता होगी: ग्राहक आईडी, कॉर्पस आईडी और api_key।
आप LangChain को इन तीन मूल्यों को दो तरीकों से प्रदान कर सकते हैं:

1. अपने वातावरण में इन तीन चरों को शामिल करें: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` और `VECTARA_API_KEY`।

> उदाहरण के लिए, आप os.environ और getpass का उपयोग करके इन चरों को सेट कर सकते हैं:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. उन्हें वेक्टारा वेक्टर स्टोर निर्माता में जोड़ें:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

## LangChain से वेक्टारा से कनेक्ट करना

शुरू करने के लिए, आइए from_documents() विधि का उपयोग करके दस्तावेजों को इंजेस्ट करें।
यहां हम मान रहे हैं कि आपने VECTARA_CUSTOMER_ID, VECTARA_CORPUS_ID और क्वेरी+इंडेक्सिंग VECTARA_API_KEY को पर्यावरण चरों के रूप में जोड़ दिया है।

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vectara = Vectara.from_documents(
    docs,
    embedding=FakeEmbeddings(size=768),
    doc_metadata={"speech": "state-of-the-union"},
)
```

वेक्टारा के अनुक्रमण एपीआई में एक फ़ाइल अपलोड एपीआई है जहां फ़ाइल को सीधे वेक्टारा द्वारा संभाला जाता है - पूर्व-प्रसंस्कृत, अनुकूलतम रूप से टुकड़ों में विभाजित और वेक्टारा वेक्टर स्टोर में जोड़ा जाता है।
इसका उपयोग करने के लिए, हमने add_files() विधि (और from_files()) जोड़ी है।

चलो इसे कार्रवाई में देखते हैं। हम दो PDF दस्तावेज़ अपलोड करने का चयन करते हैं:

1. डॉ. किंग द्वारा "मेरा सपना है" भाषण
2. चर्चिल का "हम समुद्र तट पर लड़ेंगे" भाषण

```python
import tempfile
import urllib.request

urls = [
    [
        "https://www.gilderlehrman.org/sites/default/files/inline-pdfs/king.dreamspeech.excerpts.pdf",
        "I-have-a-dream",
    ],
    [
        "https://www.parkwayschools.net/cms/lib/MO01931486/Centricity/Domain/1578/Churchill_Beaches_Speech.pdf",
        "we shall fight on the beaches",
    ],
]
files_list = []
for url, _ in urls:
    name = tempfile.NamedTemporaryFile().name
    urllib.request.urlretrieve(url, name)
    files_list.append(name)

docsearch: Vectara = Vectara.from_files(
    files=files_list,
    embedding=FakeEmbeddings(size=768),
    metadatas=[{"url": url, "speech": title} for url, title in urls],
)
```

## समानता खोज

वेक्टारा का उपयोग करने का सबसे सरल परिदृश्य समानता खोज करना है।

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search(
    query, n_sentence_context=0, filter="doc.speech = 'state-of-the-union'"
)
```

```python
found_docs
```

```output
[Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '141', 'len': '117', 'speech': 'state-of-the-union'}),
 Document(page_content='As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '77', 'speech': 'state-of-the-union'}),
 Document(page_content='Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '122', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought he could roll into Ukraine and the world would roll over.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '664', 'len': '68', 'speech': 'state-of-the-union'}),
 Document(page_content='That’s why one of the first things I did as President was fight to pass the American Rescue Plan.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '314', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='And he thought he could divide us at home.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '160', 'len': '42', 'speech': 'state-of-the-union'}),
 Document(page_content='He met the Ukrainian people.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '788', 'len': '28', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought the West and NATO wouldn’t respond.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '113', 'len': '46', 'speech': 'state-of-the-union'}),
 Document(page_content='In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '772', 'len': '131', 'speech': 'state-of-the-union'})]
```

```python
print(found_docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.
```

## स्कोर के साथ समानता खोज

कभी-कभी हम खोज करना चाहते हैं, लेकिन साथ ही प्रासंगिकता स्कोर भी प्राप्त करना चाहते हैं ताकि हम जान सकें कि किसी विशिष्ट परिणाम का कितना अच्छा है।

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'state-of-the-union'",
    score_threshold=0.2,
)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.

Score: 0.74179757
```

अब आइए हमने अपलोड की गई फ़ाइलों में मौजूद सामग्री के लिए समान खोज करें।

```python
query = "We must forever conduct our struggle"
min_score = 1.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 1.2 we have 0 documents
```

```python
query = "We must forever conduct our struggle"
min_score = 0.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 0.2 we have 10 documents
```

MMR एक महत्वपूर्ण पुनः प्राप्ति क्षमता है कई अनुप्रयोगों के लिए, जहां आपके जेनएआई अनुप्रयोग को फ़ीड करने वाले खोज परिणाम परिणामों की विविधता को बेहतर बनाने के लिए पुनः क्रमबद्ध किए जाते हैं।

चलो देखते हैं कि वेक्टारा के साथ यह कैसे काम करता है:

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 0.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

Grow the workforce. Build the economy from the bottom up
and the middle out, not from the top down.

When we invest in our workers, when we build the economy from the bottom up and the middle out together, we can do something we haven’t done in a long time: build a better America.

Our economy grew at a rate of 5.7% last year, the strongest growth in nearly 40 years, the first step in bringing fundamental change to an economy that hasn’t worked for the working people of this nation for too long.

Economists call it “increasing the productive capacity of our economy.”
```

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 1.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

The Russian stock market has lost 40% of its value and trading remains suspended.

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century.

In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

The federal government spends about $600 Billion a year to keep the country safe and secure.
```

जैसा कि आप देख सकते हैं, पहले उदाहरण में diversity_bias को 0.0 पर सेट किया गया था (विविधता पुनः क्रमबद्धता को अक्षम करने के बराबर), जिसके परिणामस्वरूप सबसे प्रासंगिक 5 दस्तावेज़ प्राप्त हुए। diversity_bias=1.0 के साथ, हमने विविधता को अधिकतम किया और जैसा कि आप देख सकते हैं, परिणामी शीर्ष दस्तावेज़ अपने सेमेंटिक अर्थों में काफी अधिक विविध हैं।

## एक पुनः प्राप्तकर्ता के रूप में वेक्टारा

अंत में, आइए देखें कि `as_retriever()` इंटरफ़ेस के साथ वेक्टारा का उपयोग कैसे किया जाता है:

```python
retriever = vectara.as_retriever()
retriever
```

```output
VectorStoreRetriever(tags=['Vectara'], vectorstore=<langchain_community.vectorstores.vectara.Vectara object at 0x109a3c760>)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'})
```
