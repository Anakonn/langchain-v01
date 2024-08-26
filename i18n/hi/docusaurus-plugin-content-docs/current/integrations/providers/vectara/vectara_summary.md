---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) एक विश्वसनीय GenAI प्लेटफ़ॉर्म है जो दस्तावेज़ इंडेक्सिंग और क्वेरी के लिए एक आसान-से-उपयोग API प्रदान करता है।

Vectara Retrieval Augmented Generation या [RAG](https://vectara.com/grounded-generation/) के लिए एक एंड-टू-एंड प्रबंधित सेवा प्रदान करता है, जिसमें शामिल है:

1. दस्तावेज़ फ़ाइलों से पाठ निकालने और उन्हें वाक्यों में विभाजित करने का एक तरीका।

2. अत्याधुनिक [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) एम्बेडिंग मॉडल। प्रत्येक पाठ खंड को Boomerang का उपयोग करके एक वेक्टर एम्बेडिंग में एन्कोड किया जाता है, और Vectara आंतरिक ज्ञान (वेक्टर+पाठ) स्टोर में संग्रहीत किया जाता है।

3. एक क्वेरी सेवा जो स्वचालित रूप से क्वेरी को एम्बेडिंग में एन्कोड करती है, और सबसे प्रासंगिक पाठ खंडों को पुनः प्राप्त करती है (जिसमें [Hybrid Search](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) और [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/)) के लिए समर्थन शामिल है)।

4. पुनः प्राप्त दस्तावेज़ों के आधार पर [generative summary](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview) बनाने का एक विकल्प, जिसमें उद्धरण शामिल हैं।

API का उपयोग कैसे करें, इस पर अधिक जानकारी के लिए [Vectara API documentation](https://docs.vectara.com/docs/) देखें।

यह नोटबुक LangChain के साथ `Vectara` के एकीकरण से संबंधित कार्यक्षमता का उपयोग कैसे करें, यह दिखाता है। विशेष रूप से हम [LangChain's Expression Language](/docs/expression_language/) के साथ चेनिंग का उपयोग करने और Vectara की एकीकृत संक्षेपण क्षमता का उपयोग करने का तरीका प्रदर्शित करेंगे।

# सेटअप

LangChain के साथ Vectara का उपयोग करने के लिए आपको Vectara खाता चाहिए होगा। आरंभ करने के लिए निम्नलिखित चरणों का उपयोग करें:

1. यदि आपके पास पहले से एक नहीं है तो एक Vectara खाता [Sign up](https://www.vectara.com/integrations/langchain) करें। एक बार जब आप साइन अप पूरा कर लेते हैं, तो आपके पास Vectara ग्राहक ID होगी। आप अपने नाम पर क्लिक करके, जो Vectara कंसोल विंडो के शीर्ष-दाईं ओर है, अपनी ग्राहक ID पा सकते हैं।

2. अपने खाते के भीतर आप एक या अधिक कॉर्पस बना सकते हैं। प्रत्येक कॉर्पस एक क्षेत्र का प्रतिनिधित्व करता है जो इनपुट दस्तावेज़ों से पाठ डेटा को संग्रहीत करता है। एक कॉर्पस बनाने के लिए, **"Create Corpus"** बटन का उपयोग करें। फिर आप अपने कॉर्पस को एक नाम और एक विवरण प्रदान करते हैं। वैकल्पिक रूप से आप फ़िल्टरिंग विशेषताओं को परिभाषित कर सकते हैं और कुछ उन्नत विकल्प लागू कर सकते हैं। यदि आप अपने बनाए गए कॉर्पस पर क्लिक करते हैं, तो आप शीर्ष पर इसका नाम और कॉर्पस ID देख सकते हैं।

3. अगला आपको कॉर्पस तक पहुंचने के लिए API कुंजियों को बनाना होगा। कॉर्पस दृश्य में **"Authorization"** टैब पर क्लिक करें और फिर **"Create API Key"** बटन पर क्लिक करें। अपनी कुंजी को एक नाम दें, और चुनें कि आप केवल क्वेरी या क्वेरी+इंडेक्स के लिए कुंजी चाहते हैं। "Create" पर क्लिक करें और अब आपके पास एक सक्रिय API कुंजी है। इस कुंजी को गोपनीय रखें।

LangChain के साथ Vectara का उपयोग करने के लिए, आपके पास ये तीन मान होने चाहिए: ग्राहक ID, कॉर्पस ID और api_key।
आप इन्हें LangChain को दो तरीकों से प्रदान कर सकते हैं:

1. अपने वातावरण में इन तीन चर को शामिल करें: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` और `VECTARA_API_KEY`।

> उदाहरण के लिए, आप os.environ और getpass का उपयोग करके इन वेरिएबल्स को निम्नलिखित तरीके से सेट कर सकते हैं:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. इन्हें Vectara वेक्टरस्टोर कंस्ट्रक्टर में जोड़ें:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

```python
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
```

सबसे पहले हम Vectara में state-of-the-union पाठ लोड करते हैं। ध्यान दें कि हम `from_files` इंटरफेस का उपयोग करते हैं जो किसी भी स्थानीय प्रोसेसिंग या चंकिंग की आवश्यकता नहीं होती - Vectara फ़ाइल सामग्री प्राप्त करता है और सभी आवश्यक पूर्व-प्रसंस्करण, चंकिंग और एम्बेडिंग को अपने ज्ञान स्टोर में करता है।

```python
vectara = Vectara.from_files(["state_of_the_union.txt"])
```

अब हम एक Vectara रिट्रीवर बनाते हैं और निर्दिष्ट करते हैं कि:
* इसे केवल शीर्ष 3 दस्तावेज़ मैच वापस करने चाहिए
* सारांश के लिए, इसे शीर्ष 5 परिणामों का उपयोग करना चाहिए और अंग्रेजी में उत्तर देना चाहिए

```python
summary_config = {"is_enabled": True, "max_results": 5, "response_lang": "eng"}
retriever = vectara.as_retriever(
    search_kwargs={"k": 3, "summary_config": summary_config}
)
```

जब Vectara के साथ संक्षेपण का उपयोग करते हैं, तो रिट्रीवर `Document` ऑब्जेक्ट्स की एक सूची के साथ प्रतिक्रिया करता है:
1. पहले `k` दस्तावेज़ वे होते हैं जो क्वेरी से मेल खाते हैं (जैसा कि हम एक मानक वेक्टर स्टोर के साथ उपयोग करते हैं)
2. सारांश सक्षम होने पर, एक अतिरिक्त `Document` ऑब्जेक्ट जोड़ा जाता है, जिसमें सारांश पाठ शामिल होता है। इस दस्तावेज़ में मेटाडेटा फ़ील्ड `summary` को True के रूप में सेट किया गया है।

आइए इनको अलग करने के लिए दो उपयोगिता कार्यों को परिभाषित करें:

```python
def get_sources(documents):
    return documents[:-1]


def get_summary(documents):
    return documents[-1].page_content


query_str = "what did Biden say?"
```

अब हम क्वेरी के लिए एक सारांश प्रतिक्रिया आज़मा सकते हैं:

```python
(retriever | get_summary).invoke(query_str)
```

```output
'The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.'
```

और यदि हम Vectara से पुनः प्राप्त स्रोतों को देखना चाहते हैं जो इस सारांश में उपयोग किए गए थे (उद्धरण):

```python
(retriever | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully.', metadata={'lang': 'eng', 'section': '1', 'offset': '2100', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```

Vectara की "RAG as a service" प्रश्न उत्तर या चैटबॉट चेन बनाने में बहुत सारा भारी काम करता है। LangChain के साथ एकीकरण अतिरिक्त क्षमताओं का उपयोग करने का विकल्प प्रदान करता है जैसे कि क्वेरी पूर्व-प्रसंस्करण जैसे `SelfQueryRetriever` या `MultiQueryRetriever`। आइए [MultiQueryRetriever](/docs/modules/data_connection/retrievers/MultiQueryRetriever) का उपयोग करने का एक उदाहरण देखें।

चूंकि MQR एक LLM का उपयोग करता है, हमें उसे सेट करना होगा - यहाँ हम `ChatOpenAI` चुनते हैं:

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
mqr = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

(mqr | get_summary).invoke(query_str)
```

```output
"President Biden has made several notable quotes and comments. He expressed a commitment to investigate the potential impact of burn pits on soldiers' health, referencing his son's brain cancer [1]. He emphasized the importance of unity among Americans, urging us to see each other as fellow citizens rather than enemies [2]. Biden also highlighted the need for schools to use funds from the American Rescue Plan to hire teachers and address learning loss, while encouraging community involvement in supporting education [3]."
```

```python
(mqr | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='And, if Congress provides the funds we need, we’ll have new stockpiles of tests, masks, and pills ready if needed. I cannot promise a new variant won’t come. But I can promise you we’ll do everything within our power to be ready if it does. Third – we can end the shutdown of schools and businesses. We have the tools we need.', metadata={'lang': 'eng', 'section': '1', 'offset': '24753', 'len': '82', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.', metadata={'summary': True}),
 Document(page_content='Danielle says Heath was a fighter to the very end. He didn’t know how to stop fighting, and neither did she. Through her pain she found purpose to demand we do better. Tonight, Danielle—we are. The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits.', metadata={'lang': 'eng', 'section': '1', 'offset': '35502', 'len': '58', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='Let’s stop seeing each other as enemies, and start seeing each other for who we really are: Fellow Americans. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together. I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.', metadata={'lang': 'eng', 'section': '1', 'offset': '26312', 'len': '89', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The American Rescue Plan gave schools money to hire teachers and help students make up for lost learning. I urge every parent to make sure your school does just that. And we can all play a part—sign up to be a tutor or a mentor. Children were also struggling before the pandemic. Bullying, violence, trauma, and the harms of social media.', metadata={'lang': 'eng', 'section': '1', 'offset': '33227', 'len': '61', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```
