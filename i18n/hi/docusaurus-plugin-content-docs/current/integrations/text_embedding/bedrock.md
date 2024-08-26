---
translated: true
---

# बेडरॉक

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) एक पूरी तरह से प्रबंधित सेवा है जो `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI`, और `Amazon` जैसी अग्रणी AI कंपनियों से उच्च-प्रदर्शन वाले फाउंडेशन मॉडल (एफएम) का चयन प्रदान करती है, एक एकल एपीआई के माध्यम से, साथ ही सुरक्षा, गोपनीयता और जिम्मेदार AI के साथ जनरेटिव AI एप्लिकेशन बनाने के लिए आवश्यक व्यापक क्षमताएं। `Amazon Bedrock` का उपयोग करके, आप अपने उपयोग मामले के लिए शीर्ष एफएम का आसानी से प्रयोग और मूल्यांकन कर सकते हैं, तकनीकों जैसे फाइन-ट्यूनिंग और `रिट्रीवल ऑग्मेंटेड जनरेशन` (`RAG`) का उपयोग करके उन्हें निजी रूप से अनुकूलित कर सकते हैं, और एजेंट बना सकते हैं जो अपने उद्यम प्रणालियों और डेटा स्रोतों का उपयोग करके कार्य निष्पादित करते हैं। चूंकि `Amazon Bedrock` सर्वरलेस है, आपको किसी भी बुनियादी ढांचे का प्रबंधन नहीं करना होता है, और आप AWS सेवाओं का उपयोग करके अपने एप्लिकेशनों में जनरेटिव AI क्षमताओं को सुरक्षित रूप से एकीकृत और तैनात कर सकते हैं।

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.embeddings import BedrockEmbeddings

embeddings = BedrockEmbeddings(
    credentials_profile_name="bedrock-admin", region_name="us-east-1"
)
```

```python
embeddings.embed_query("This is a content of the document")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("This is a content of the document")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```
