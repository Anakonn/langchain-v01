---
translated: true
---

# बेड़ा (ज्ञान आधार)

> [अमेज़न बेड़ा के लिए ज्ञान आधार](https://aws.amazon.com/bedrock/knowledge-bases/) एक अमेज़न वेब सेवाएं (AWS) प्रस्ताव है जो आपके निजी डेटा का उपयोग करके FM प्रतिक्रिया को अनुकूलित करके `RAG` अनुप्रयोग को तेजी से बनाने देता है।

> `RAG` को लागू करने के लिए, संगठनों को डेटा को embeddings (वेक्टर) में परिवर्तित करने, embeddings को एक विशिष्ट वेक्टर डेटाबेस में संग्रहित करने और उपयोगकर्ता के प्रश्न के लिए प्रासंगिक पाठ को खोजने और पुनर्प्राप्त करने के लिए डेटाबेस में कस्टम एकीकरण बनाने के कई कठिन कदम उठाने होते हैं। यह समय-लेने और अकुशल हो सकता है।

> `अमेज़न बेड़ा के लिए ज्ञान आधार` के साथ, बस अपने डेटा के स्थान को `अमेज़न एस3` में इंगित करें, और `अमेज़न बेड़ा के लिए ज्ञान आधार` पूरे अंतःक्रिया प्रवाह को आपके वेक्टर डेटाबेस में लेता है। यदि आपके पास कोई मौजूदा वेक्टर डेटाबेस नहीं है, तो अमेज़न बेड़ा आपके लिए एक अमेज़न ओपनसर्च सर्वरलेस वेक्टर स्टोर बनाता है। पुनर्प्राप्ति के लिए, रिट्रीव एपीआई के माध्यम से लैंगचेन - अमेज़न बेड़ा एकीकरण का उपयोग करें ताकि उपयोगकर्ता के प्रश्न से संबंधित परिणाम ज्ञान आधारों से पुनर्प्राप्त किए जा सकें।

> ज्ञान आधार को [AWS कंसोल](https://aws.amazon.com/console/) या [AWS एसडीके](https://aws.amazon.com/developer/tools/) का उपयोग करके कॉन्फ़िगर किया जा सकता है।

## ज्ञान आधार रिट्रीवर का उपयोग करना

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.retrievers import AmazonKnowledgeBasesRetriever

retriever = AmazonKnowledgeBasesRetriever(
    knowledge_base_id="PUIJP4EQUA",
    retrieval_config={"vectorSearchConfiguration": {"numberOfResults": 4}},
)
```

```python
query = "What did the president say about Ketanji Brown?"

retriever.invoke(query)
```

### एक QA श्रृंखला में उपयोग करना

```python
from botocore.client import Config
from langchain.chains import RetrievalQA
from langchain_community.llms import Bedrock

model_kwargs_claude = {"temperature": 0, "top_k": 10, "max_tokens_to_sample": 3000}

llm = Bedrock(model_id="anthropic.claude-v2", model_kwargs=model_kwargs_claude)

qa = RetrievalQA.from_chain_type(
    llm=llm, retriever=retriever, return_source_documents=True
)

qa(query)
```
