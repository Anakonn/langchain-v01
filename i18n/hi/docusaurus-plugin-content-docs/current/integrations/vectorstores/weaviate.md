---
sidebar_label: Weaviate
translated: true
---

# Weaviate

यह नोटबुक LangChain में Weaviate वेक्टर स्टोर के साथ शुरू करने के तरीके को कवर करती है, `langchain-weaviate` पैकेज का उपयोग करते हुए।

> [Weaviate](https://weaviate.io/) एक ओपन-सोर्स वेक्टर डेटाबेस है। यह आपको अपने पसंदीदा ML-मॉडल्स से डेटा ऑब्जेक्ट्स और वेक्टर एम्बेडिंग्स को स्टोर करने की अनुमति देता है, और बिना किसी रुकावट के अरबों डेटा ऑब्जेक्ट्स तक स्केल कर सकता है।

इस इंटेग्रेशन का उपयोग करने के लिए, आपके पास एक चल रही Weaviate डेटाबेस इंस्टेंस होनी चाहिए।

## न्यूनतम संस्करण

इस मॉड्यूल के लिए Weaviate `1.23.7` या उच्चतर की आवश्यकता है। हालांकि, हम सलाह देते हैं कि आप Weaviate के नवीनतम संस्करण का उपयोग करें।

## Weaviate से कनेक्ट करना

इस नोटबुक में, हम मानते हैं कि आपके पास `http://localhost:8080` पर चल रही Weaviate की एक स्थानीय इंस्टेंस है और [gRPC ट्रैफिक](https://weaviate.io/blog/grpc-performance-improvements) के लिए पोर्ट 50051 खुला है। इसलिए, हम Weaviate से कनेक्ट करेंगे:

```python
weaviate_client = weaviate.connect_to_local()
```

### अन्य तैनाती विकल्प

Weaviate को [कई विभिन्न तरीकों से तैनात किया जा सकता है](https://weaviate.io/developers/weaviate/starter-guides/which-weaviate) जैसे कि [Weaviate क्लाउड सेवाएं (WCS)](https://console.weaviate.cloud), [Docker](https://weaviate.io/developers/weaviate/installation/docker-compose), या [Kubernetes](https://weaviate.io/developers/weaviate/installation/kubernetes) का उपयोग करके।

यदि आपकी Weaviate इंस्टेंस किसी अन्य तरीके से तैनात की गई है, तो Weaviate से कनेक्ट करने के विभिन्न तरीकों के बारे में [यहाँ और पढ़ें](https://weaviate.io/developers/weaviate/client-libraries/python#instantiate-a-client)। आप विभिन्न [सहायक फ़ंक्शंस](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-helper-functions) का उपयोग कर सकते हैं या [कस्टम इंस्टेंस बना सकते हैं](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-explicit-connection)।

> ध्यान दें कि आपको `v4` क्लाइंट API की आवश्यकता है, जो `weaviate.WeaviateClient` ऑब्जेक्ट बनाएगा।

### प्रमाणीकरण

कुछ Weaviate इंस्टेंस, जैसे कि WCS पर चलने वाले, में प्रमाणीकरण सक्षम होता है, जैसे कि API कुंजी और/या उपयोगकर्ता नाम+पासवर्ड प्रमाणीकरण।

अधिक जानकारी के लिए [क्लाइंट प्रमाणीकरण गाइड](https://weaviate.io/developers/weaviate/client-libraries/python#authentication) और [विस्तृत प्रमाणीकरण कॉन्फ़िगरेशन पेज](https://weaviate.io/developers/weaviate/configuration/authentication) पढ़ें।

## इंस्टॉलेशन

```python
# install package
# %pip install -Uqq langchain-weaviate
# %pip install openai tiktoken langchain
```

## पर्यावरण सेटअप

यह नोटबुक `OpenAIEmbeddings` के माध्यम से OpenAI API का उपयोग करती है। हम सुझाव देते हैं कि आप एक OpenAI API कुंजी प्राप्त करें और इसे `OPENAI_API_KEY` नाम के पर्यावरण चर के रूप में निर्यात करें।

एक बार यह हो जाने के बाद, आपकी OpenAI API कुंजी स्वचालित रूप से पढ़ी जाएगी। यदि आप पर्यावरण चर के लिए नए हैं, तो उनके बारे में [यहाँ अधिक पढ़ें](https://docs.python.org/3/library/os.html#os.environ) या [इस गाइड में](https://www.twilio.com/en-us/blog/environment-variables-python)।

# उपयोग

## समानता द्वारा ऑब्जेक्ट्स ढूँढें

यहाँ एक उदाहरण है कि डेटा आयात से लेकर Weaviate इंस्टेंस को क्वेरी करने तक की क्वेरी, समानता द्वारा ऑब्जेक्ट्स को कैसे ढूँढा जाए।

### चरण 1: डेटा आयात

पहले, हम एक लंबे टेक्स्ट फ़ाइल की सामग्री को लोड और चंक करके `Weaviate` में जोड़ने के लिए डेटा बनाएंगे।

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.openai import OpenAIEmbeddings
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.embeddings.openai.OpenAIEmbeddings` was deprecated in langchain-community 0.1.0 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAIEmbeddings`.
  warn_deprecated(
```

अब, हम डेटा आयात कर सकते हैं।

ऐसा करने के लिए, Weaviate इंस्टेंस से कनेक्ट करें और परिणामी `weaviate_client` ऑब्जेक्ट का उपयोग करें। उदाहरण के लिए, हम नीचे दिखाए गए अनुसार दस्तावेज़ आयात कर सकते हैं:

```python
import weaviate
from langchain_weaviate.vectorstores import WeaviateVectorStore
```

```python
weaviate_client = weaviate.connect_to_local()
db = WeaviateVectorStore.from_documents(docs, embeddings, client=weaviate_client)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

### चरण 2: खोज करना

अब हम समानता खोज कर सकते हैं। यह क्वेरी टेक्स्ट के सबसे समान दस्तावेज़ों को लौटाएगा, Weaviate में संग्रहीत एम्बेडिंग्स और क्वेरी टेक्स्ट से उत्पन्न एक समतुल्य एम्बेडिंग के आधार पर। 

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# Print the first 100 characters of each result
for i, doc in enumerate(docs):
    print(f"\nDocument {i+1}:")
    print(doc.page_content[:100] + "...")
```

```output

Document 1:
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...

Document 2:
And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of ...

Document 3:
Vice President Harris and I ran for office with a new economic vision for America.

Invest in Ameri...

Document 4:
A former top litigator in private practice. A former federal public defender. And from a family of p...
```

आप फ़िल्टर भी जोड़ सकते हैं, जो फ़िल्टर शर्तों के आधार पर परिणामों को शामिल या बाहर करेगा। (अधिक फ़िल्टर उदाहरण देखें [यहाँ](https://weaviate.io/developers/weaviate/search/filters).)

```python
from weaviate.classes.query import Filter

for filter_str in ["blah.txt", "state_of_the_union.txt"]:
    search_filter = Filter.by_property("source").equal(filter_str)
    filtered_search_results = db.similarity_search(query, filters=search_filter)
    print(len(filtered_search_results))
    if filter_str == "state_of_the_union.txt":
        assert len(filtered_search_results) > 0  # There should be at least one result
    else:
        assert len(filtered_search_results) == 0  # There should be no results
```

```output
0
4
```

यह `k` प्रदान करना भी संभव है, जो लौटाए जाने वाले परिणामों की संख्या की ऊपरी सीमा है। 

```python
search_filter = Filter.by_property("source").equal("state_of_the_union.txt")
filtered_search_results = db.similarity_search(query, filters=search_filter, k=3)
assert len(filtered_search_results) <= 3
```

### परिणाम समानता मापना

आप वैकल्पिक रूप से एक प्रासंगिकता "स्कोर" प्राप्त कर सकते हैं। यह एक सापेक्ष स्कोर है जो दर्शाता है कि पूरे खोज परिणाम सेट में विशेष खोज परिणाम कितना अच्छा है।

ध्यान दें कि यह एक सापेक्ष स्कोर है, जिसका अर्थ है कि इसका उपयोग प्रासंगिकता के लिए थ्रेशोल्ड निर्धारित करने के लिए नहीं किया जाना चाहिए। हालाँकि, इसका उपयोग विभिन्न खोज परिणामों की प्रासंगिकता की तुलना करने के लिए किया जा सकता है। 

```python
docs = db.similarity_search_with_score("country", k=5)

for doc in docs:
    print(f"{doc[1]:.3f}", ":", doc[0].page_content[:100] + "...")
```

```output
0.935 : For that purpose we’ve mobilized American ground forces, air squadrons, and ship deployments to prot...
0.500 : And built the strongest, freest, and most prosperous nation the world has ever known.

Now is the h...
0.462 : If you travel 20 miles east of Columbus, Ohio, you’ll find 1,000 empty acres of land.

It won’t loo...
0.450 : And my report is this: the State of the Union is strong—because you, the American people, are strong...
0.442 : Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...
```

## खोज तंत्र

`similarity_search` Weaviate की [हाइब्रिड खोज](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid) का उपयोग करता है।

एक हाइब्रिड खोज वेक्टर और कीवर्ड खोज को जोड़ती है, जिसमें `alpha` वेक्टर खोज का भार होता है। `similarity_search` फ़ंक्शन आपको kwargs के रूप में अतिरिक्त तर्क पास करने की अनुमति देता है। उपलब्ध तर्कों के लिए इस [संदर्भ दस्तावेज़](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid) को देखें।

तो, आप नीचे दिखाए गए अनुसार `alpha=0` जोड़कर एक शुद्ध कीवर्ड खोज कर सकते हैं:

```python
docs = db.similarity_search(query, alpha=0)
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

## दृढ़ता

`langchain-weaviate` के माध्यम से जोड़ा गया कोई भी डेटा Weaviate में उसकी कॉन्फ़िगरेशन के अनुसार स्थायी रहेगा।

उदाहरण के लिए, WCS इंस्टेंस डेटा को अनिश्चित काल तक स्थायी रूप से रखने के लिए कॉन्फ़िगर किए गए हैं, और Docker इंस्टेंस को वॉल्यूम में डेटा स्थायी करने के लिए सेट किया जा सकता है। [Weaviate की दृढ़ता](https://weaviate.io/developers/weaviate/configuration/persistence) के बारे में अधिक पढ़ें।

## बहु-किरायेदारी

[बहु-किरायेदारी](https://weaviate.io/developers/weaviate/concepts/data#multi-tenancy) आपको एकल Weaviate इंस्टेंस में एक ही संग्रह कॉन्फ़िगरेशन के साथ डेटा के उच्च संख्या में अलग-अलग संग्रह करने की अनुमति देती है। यह एक SaaS ऐप बनाने जैसे बहु-उपयोगकर्ता वातावरण के लिए शानदार है, जहाँ प्रत्येक अंतिम उपयोगकर्ता का अपना अलग डेटा संग्रह होगा।

बहु-किरायेदारी का उपयोग करने के लिए, वेक्टर स्टोर को `tenant` पैरामीटर के बारे में पता होना चाहिए।

इसलिए, जब भी कोई डेटा जोड़ें, तो नीचे दिखाए गए अनुसार `tenant` पैरामीटर प्रदान करें। 

```python
db_with_mt = WeaviateVectorStore.from_documents(
    docs, embeddings, client=weaviate_client, tenant="Foo"
)
```

```output
2024-Mar-26 03:40 PM - langchain_weaviate.vectorstores - INFO - Tenant Foo does not exist in index LangChain_30b9273d43b3492db4fb2aba2e0d6871. Creating tenant.
```

और जब क्वेरी करते हैं, तो `tenant` पैरामीटर भी प्रदान करें। 

```python
db_with_mt.similarity_search(query, tenant="Foo")
```

```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand. \n\nI remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. \n\nThat’s why one of the first things I did as President was fight to pass the American Rescue Plan.  \n\nBecause people were hurting. We needed to act, and we did. \n\nFew pieces of legislation have done more in a critical moment in our history to lift us out of crisis. \n\nIt fueled our efforts to vaccinate the nation and combat COVID-19. It delivered immediate economic relief for tens of millions of Americans.  \n\nHelped put food on their table, keep a roof over their heads, and cut the cost of health insurance. \n\nAnd as my Dad used to say, it gave people a little breathing room.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='He and his Dad both have Type 1 diabetes, which means they need insulin every day. Insulin costs about $10 a vial to make.  \n\nBut drug companies charge families like Joshua and his Dad up to 30 times more. I spoke with Joshua’s mom. \n\nImagine what it’s like to look at your child who needs insulin and have no idea how you’re going to pay for it.  \n\nWhat it does to your dignity, your ability to look your child in the eye, to be the parent you expect to be. \n\nJoshua is here with us tonight. Yesterday was his birthday. Happy birthday, buddy.  \n\nFor Joshua, and for the 200,000 other young people with Type 1 diabetes, let’s cap the cost of insulin at $35 a month so everyone can afford it.  \n\nDrug companies will still do very well. And while we’re at it let Medicare negotiate lower prices for prescription drugs, like the VA already does.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. \n\nHe rejected repeated efforts at diplomacy. \n\nHe thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   \n\nWe prepared extensively and carefully. \n\nWe spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. \n\nI spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  \n\nWe countered Russia’s lies with truth.   \n\nAnd now that he has acted the free world is holding him accountable. \n\nAlong with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland.', metadata={'source': 'state_of_the_union.txt'})]
```

## पुनः प्राप्तकर्ता विकल्प

Weaviate को पुनः प्राप्तकर्ता के रूप में भी उपयोग किया जा सकता है

### अधिकतम सीमांत प्रासंगिकता खोज (MMR)

पुनः प्राप्तकर्ता ऑब्जेक्ट में समानता खोज का उपयोग करने के अलावा, आप `mmr` का भी उपयोग कर सकते हैं। 

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)[0]
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

# LangChain के साथ उपयोग

बड़े भाषा मॉडल्स (LLMs) की एक ज्ञात सीमा यह है कि उनका प्रशिक्षण डेटा पुराना हो सकता है, या इसमें विशिष्ट डोमेन ज्ञान शामिल नहीं हो सकता है जिसकी आपको आवश्यकता है।

नीचे दिए गए उदाहरण पर एक नज़र डालें:

```python
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
llm.predict("What did the president say about Justice Breyer")
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.chat_models.openai.ChatOpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import ChatOpenAI`.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `predict` was deprecated in LangChain 0.1.7 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
"I'm sorry, I cannot provide real-time information as my responses are generated based on a mixture of licensed data, data created by human trainers, and publicly available data. The last update was in October 2021."
```

वेक्टर स्टोर्स LLMs का पूरक होते हैं, जो प्रासंगिक जानकारी को स्टोर और पुनः प्राप्त करने का एक तरीका प्रदान करते हैं। यह आपको LLMs की तर्क और भाषाई क्षमताओं को वेक्टर स्टोर्स की प्रासंगिक जानकारी पुनः प्राप्त करने की क्षमता के साथ संयोजित करने की अनुमति देता है।

LLMs और वेक्टर स्टोर्स को संयोजित करने के दो प्रसिद्ध अनुप्रयोग हैं:
- प्रश्न उत्तर
- पुनः प्राप्ति-उन्नत पीढ़ी (RAG)

### स्रोतों के साथ प्रश्न उत्तर

LangChain में प्रश्न उत्तर को वेक्टर स्टोर्स के उपयोग से बढ़ाया जा सकता है। आइए देखें कि इसे कैसे किया जा सकता है।

इस खंड में `RetrievalQAWithSourcesChain` का उपयोग किया गया है, जो एक इंडेक्स से दस्तावेज़ों की खोज करता है।

पहले, हम टेक्स्ट को फिर से चंक करेंगे और उन्हें Weaviate वेक्टर स्टोर में आयात करेंगे। 

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_community.llms import OpenAI
```

```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)
```

अब हम चेन का निर्माण कर सकते हैं, जिसमें पुनः प्राप्तकर्ता निर्दिष्ट है:

```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.llms.openai.OpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAI`.
  warn_deprecated(
```

और चेन को चलाएँ, प्रश्न पूछने के लिए:

```python
chain(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `__call__` was deprecated in LangChain 0.1.0 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
{'answer': ' The president thanked Justice Stephen Breyer for his service and announced his nomination of Judge Ketanji Brown Jackson to the Supreme Court.\n',
 'sources': '31-pl'}
```

### पुनः प्राप्ति-उन्नत पीढ़ी

LLMs और वेक्टर स्टोर्स को संयोजित करने का एक और बहुत लोकप्रिय अनुप्रयोग पुनः प्राप्ति-उन्नत पीढ़ी (RAG) है। यह एक तकनीक है जो एक पुनः प्राप्तकर्ता का उपयोग वेक्टर स्टोर से प्रासंगिक जानकारी खोजने के लिए करती है, और फिर एक LLM का उपयोग पुनः प्राप्त डेटा और एक प्रॉम्प्ट के आधार पर आउटपुट प्रदान करने के लिए करती है।

हम एक समान सेटअप के साथ शुरू करते हैं:

```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)

retriever = docsearch.as_retriever()
```

हमें RAG मॉडल के लिए एक टेम्पलेट का निर्माण करने की आवश्यकता है ताकि पुनः प्राप्त जानकारी टेम्पलेट में भरी जा सके। 

```python
from langchain_core.prompts import ChatPromptTemplate

template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

print(prompt)
```

```output
input_variables=['context', 'question'] messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template="You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\nQuestion: {question}\nContext: {context}\nAnswer:\n"))]
```

```python
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

और सेल को चलाते हुए, हमें एक बहुत ही समान आउटपुट मिलता है। 

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain.invoke("What did the president say about Justice Breyer")
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
"The president honored Justice Stephen Breyer for his service to the country as an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. The president also mentioned nominating Circuit Court of Appeals Judge Ketanji Brown Jackson to continue Justice Breyer's legacy of excellence. The president expressed gratitude towards Justice Breyer and highlighted the importance of nominating someone to serve on the United States Supreme Court."
```

लेकिन ध्यान दें कि चूंकि टेम्पलेट को आपके द्वारा निर्माण करना है, आप इसे अपनी आवश्यकताओं के अनुसार अनुकूलित कर सकते हैं।

### निष्कर्ष और संसाधन

Weaviate एक स्केलेबल, उत्पादन-तैयार वेक्टर स्टोर है।

यह इंटेग्रेशन Weaviate को LangChain के साथ उपयोग करने की अनुमति देता है, बड़े भाषा मॉडल्स की क्षमताओं को एक मजबूत डेटा स्टोर के साथ बढ़ाने के लिए। इसकी स्केलेबिलिटी और उत्पादन-तैयारी इसे आपके LangChain अनुप्रयोगों के लिए एक शानदार विकल्प बनाती है, और यह आपके उत्पादन में जाने के समय को कम करेगा।
