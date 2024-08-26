---
translated: true
---

# Amazon Neptune के साथ Cypher

>[Amazon Neptune](https://aws.amazon.com/neptune/) एक उच्च-प्रदर्शन ग्राफ विश्लेषण और सर्वरलेस डेटाबेस है जो उत्कृष्ट स्केलेबिलिटी और उपलब्धता प्रदान करता है।
>
>यह उदाहरण `Neptune` ग्राफ डेटाबेस को `openCypher` का उपयोग करके क्वेरी करता है और मानव-पठनीय प्रतिक्रिया देता है।
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) एक घोषणात्मक ग्राफ क्वेरी भाषा है जो संपत्ति ग्राफ में प्रभावी और कुशल डेटा क्वेरी करने की अनुमति देता है।
>
>[openCypher](https://opencypher.org/) Cypher का एक ओपन-सोर्स कार्यान्वयन है।# Neptune Open Cypher QA Chain
यह QA श्रृंखला Amazon Neptune को openCypher का उपयोग करके क्वेरी करती है और मानव-पठनीय प्रतिक्रिया देती है

LangChain `NeptuneOpenCypherQAChain` का समर्थन करता है [Neptune Database](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html) और [Neptune Analytics](https://docs.aws.amazon.com/neptune-analytics/latest/userguide/what-is-neptune-analytics.html) दोनों के साथ

Neptune Database एक सर्वरलेस ग्राफ डेटाबेस है जो अनुकूलन क्षमता और उपलब्धता के लिए डिज़ाइन किया गया है। यह 100,000 क्वेरी प्रति सेकंड तक स्केल करने, मल्टी-एजी उच्च उपलब्धता और मल्टी-क्षेत्र तैनाती के लिए एक समाधान प्रदान करता है। आप सामाजिक नेटवर्किंग, धोखाधड़ी अलर्ट और ग्राहक 360 अनुप्रयोगों के लिए Neptune Database का उपयोग कर सकते हैं।

Neptune Analytics एक विश्लेषण डेटाबेस इंजन है जो बड़ी मात्रा में ग्राफ डेटा को तेजी से मेमोरी में विश्लेषित कर सकता है ताकि अंतर्दृष्टि और प्रवृत्तियां प्राप्त की जा सकें। Neptune Analytics मौजूदा ग्राफ डेटाबेसों या डेटा लेक में संग्रहीत ग्राफ डेटासेट का तेजी से विश्लेषण करने का एक समाधान है। यह लोकप्रिय ग्राफ विश्लेषण एल्गोरिदम और कम-विलंबता विश्लेषण क्वेरी का उपयोग करता है।

## Neptune Database का उपयोग करना

```python
from langchain_community.graphs import NeptuneGraph

host = "<neptune-host>"
port = 8182
use_https = True

graph = NeptuneGraph(host=host, port=port, use_https=use_https)
```

### Neptune Analytics का उपयोग करना

```python
from langchain_community.graphs import NeptuneAnalyticsGraph

graph = NeptuneAnalyticsGraph(graph_identifier="<neptune-analytics-graph-id>")
```

## NeptuneOpenCypherQAChain का उपयोग करना

यह QA श्रृंखला Neptune ग्राफ डेटाबेस को openCypher का उपयोग करके क्वेरी करती है और मानव-पठनीय प्रतिक्रिया देती है।

```python
from langchain.chains import NeptuneOpenCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model="gpt-4")

chain = NeptuneOpenCypherQAChain.from_llm(llm=llm, graph=graph)

chain.invoke("how many outgoing routes does the Austin airport have?")
```

```output
'The Austin airport has 98 outgoing routes.'
```
