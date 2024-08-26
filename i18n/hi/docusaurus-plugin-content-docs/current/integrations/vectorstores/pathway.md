---
translated: true
---

# मार्ग

> [मार्ग](https://pathway.com/) एक खुला डेटा प्रोसेसिंग फ्रेमवर्क है। यह आपको लाइव डेटा स्रोतों और बदलते डेटा के साथ काम करने वाली डेटा रूपांतरण पाइपलाइन और मशीन लर्निंग एप्लिकेशन को आसानी से विकसित करने देता है।

यह नोटबुक दिखाता है कि `Langchain` के साथ एक लाइव `मार्ग` डेटा इंडेक्सिंग पाइपलाइन का उपयोग कैसे किया जाए। आप अपने श्रृंखला में इस पाइपलाइन के परिणामों को एक नियमित वेक्टर स्टोर की तरह ही क्वेरी कर सकते हैं। हालांकि, पृष्ठभूमि में, मार्ग प्रत्येक डेटा परिवर्तन पर सूचकांक को अपडेट करता है, जिससे आपको हमेशा नवीनतम उत्तर मिलते हैं।

इस नोटबुक में, हम एक [सार्वजनिक डेमो दस्तावेज़ प्रोसेसिंग पाइपलाइन](https://pathway.com/solutions/ai-pipelines#try-it-out) का उपयोग करेंगे जो:

1. कई क्लाउड डेटा स्रोतों में डेटा परिवर्तनों की निगरानी करता है।
2. डेटा के लिए एक वेक्टर सूचकांक बनाता है।

अपनी खुद की दस्तावेज़ प्रोसेसिंग पाइपलाइन के लिए [होस्ट किए गए ऑफ़र](https://pathway.com/solutions/ai-pipelines) या [अपना खुद का बनाएं](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/) देखें।

हम `VectorStore` क्लाइंट का उपयोग करके सूचकांक से कनेक्ट करेंगे, जो `similarity_search` फ़ंक्शन को लागू करता है ताकि मेल खाते दस्तावेज़ प्राप्त किए जा सकें।

इस दस्तावेज़ में उपयोग की जाने वाली मूल पाइपलाइन क्लाउड स्थान में संग्रहीत फ़ाइलों के एक सरल वेक्टर सूचकांक को आसानी से बनाने की अनुमति देती है। हालांकि, मार्ग समय-आधारित समूहीकरण और विंडोइंग डेटा, और कई कनेक्टर्स सहित SQL-जैसी क्षमता वाले ऑपरेशन जैसे groupby-कमी और विभिन्न डेटा स्रोतों के बीच संयोजन बनाने के लिए सब कुछ प्रदान करता है।

## डेटा पाइपलाइन का क्वेरी करना

क्लाइंट को इंस्टैंशिएट और कॉन्फ़िगर करने के लिए आपको या तो `url` या `host` और `port` का उपयोग करके अपने दस्तावेज़ इंडेक्सिंग पाइपलाइन का उल्लेख करना होगा। नीचे दिए गए कोड में हम एक सार्वजनिक रूप से उपलब्ध [डेमो पाइपलाइन](https://pathway.com/solutions/ai-pipelines#try-it-out) का उपयोग करते हैं, जिसका REST API आप `https://demo-document-indexing.pathway.stream` पर एक्सेस कर सकते हैं। यह डेमो [Google Drive](https://drive.google.com/drive/u/0/folders/1cULDv2OaViJBmOfG5WB0oWcgayNrGtVs) और [Sharepoint](https://navalgo.sharepoint.com/sites/ConnectorSandbox/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FConnectorSandbox%2FShared%20Documents%2FIndexerSandbox&p=true&ga=1) से दस्तावेज़ इंजेस्ट करता है और दस्तावेज़ प्राप्त करने के लिए एक सूचकांक बनाए रखता है।

```python
from langchain_community.vectorstores import PathwayVectorClient

client = PathwayVectorClient(url="https://demo-document-indexing.pathway.stream")
```

और हम क्वेरी पूछना शुरू कर सकते हैं

```python
query = "What is Pathway?"
docs = client.similarity_search(query)
```

```python
print(docs[0].page_content)
```

**आपकी बारी!** [अपनी पाइपलाइन प्राप्त करें](https://pathway.com/solutions/ai-pipelines) या [नए दस्तावेज़](https://chat-realtime-sharepoint-gdrive.demo.pathway.com/) डेमो पाइपलाइन में अपलोड करें और क्वेरी को फिर से प्रयास करें!

## फ़ाइल मेटाडेटा के आधार पर फ़िल्टरिंग

हम [jmespath](https://jmespath.org/) अभिव्यक्तियों का उपयोग करके दस्तावेज़ फ़िल्टरिंग का समर्थन करते हैं, उदाहरण के लिए:

```python
# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="modified_at >= `1702672093`")

# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="owner == `james`")

# take into account only sources with path containing 'repo_readme'
docs = client.similarity_search(query, metadata_filter="contains(path, 'repo_readme')")

# and of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` && modified_at >= `1702672093`"
)

# or of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` || modified_at >= `1702672093`"
)
```

## इंडेक्स की गई फ़ाइलों के बारे में जानकारी प्राप्त करना

`PathwayVectorClient.get_vectorstore_statistics()` वेक्टर स्टोर की स्थिति पर महत्वपूर्ण सांख्यिकी देता है, जैसे इंडेक्स की गई फ़ाइलों की संख्या और अंतिम अपडेट किए गए समय। आप इसका उपयोग अपने श्रृंखला में कर सकते हैं ताकि उपयोगकर्ता को बता सकें कि आपका ज्ञान आधार कितना ताजा है।

```python
client.get_vectorstore_statistics()
```

## आपकी खुद की पाइपलाइन

### उत्पादन में चलाना

अपनी खुद की मार्ग डेटा इंडेक्सिंग पाइपलाइन के लिए [होस्ट किए गए पाइपलाइन](https://pathway.com/solutions/ai-pipelines) की पेशकश देखें। आप अपनी खुद की मार्ग पाइपलाइन भी चला सकते हैं - पाइपलाइन बनाने के बारे में जानकारी के लिए [मार्ग गाइड](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/) देखें।

### दस्तावेज़ प्रोसेसिंग

वेक्टरीकरण पाइपलाइन में दस्तावेज़ पार्सिंग, विभाजन और एम्बेडिंग के लिए प्लगइन घटक समर्थित हैं। एम्बेडिंग और विभाजन के लिए आप [Langchain घटक](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/#langchain) का उपयोग कर सकते हैं या [एम्बेडर](https://pathway.com/developers/api-docs/pathway-xpacks-llm/embedders) और [स्प्लिटर](https://pathway.com/developers/api-docs/pathway-xpacks-llm/splitters) देख सकते हैं जो मार्ग में उपलब्ध हैं। यदि पार्सर प्रदान नहीं किया जाता है, तो यह डिफ़ॉल्ट रूप से `UTF-8` पार्सर पर जाता है। आप उपलब्ध पार्सर [यहां](https://github.com/pathwaycom/pathway/blob/main/python/pathway/xpacks/llm/parser.py) पा सकते हैं।
