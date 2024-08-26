---
sidebar_label: बेडरॉक
translated: true
---

# चैटबेडरॉक

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) एक पूरी तरह से प्रबंधित सेवा है जो `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI` और `Amazon` जैसी अग्रणी AI कंपनियों से उच्च-प्रदर्शन वाले फाउंडेशन मॉडल (एफएम) का चयन प्रदान करती है, एक एकल एपीआई के माध्यम से, साथ ही सुरक्षा, गोपनीयता और जिम्मेदार AI के साथ जनरेटिव AI एप्लिकेशन बनाने के लिए आवश्यक व्यापक क्षमताएं। `Amazon Bedrock` का उपयोग करके, आप अपने उपयोग मामले के लिए शीर्ष एफएम का आसानी से प्रयोग और मूल्यांकन कर सकते हैं, तकनीकों जैसे फाइन-ट्यूनिंग और `रिट्रीवल ऑग्मेंटेड जनरेशन` (`RAG`) का उपयोग करके उन्हें निजी रूप से अनुकूलित कर सकते हैं, और एजेंट बना सकते हैं जो आपके उद्यम प्रणालियों और डेटा स्रोतों का उपयोग करके कार्य निष्पादित करते हैं। चूंकि `Amazon Bedrock` सर्वरलेस है, आपको किसी भी बुनियादी ढांचे का प्रबंधन नहीं करना पड़ता, और आप AWS सेवाओं का उपयोग करके अपने एप्लिकेशनों में जनरेटिव AI क्षमताओं को सुरक्षित रूप से एकीकृत और तैनात कर सकते हैं।

```python
%pip install --upgrade --quiet  langchain-aws
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage
```

```python
chat = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    model_kwargs={"temperature": 0.1},
)
```

```python
messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat.invoke(messages)
```

```output
AIMessage(content="Voici la traduction en français :\n\nJ'aime la programmation.", additional_kwargs={'usage': {'prompt_tokens': 20, 'completion_tokens': 21, 'total_tokens': 41}}, response_metadata={'model_id': 'anthropic.claude-3-sonnet-20240229-v1:0', 'usage': {'prompt_tokens': 20, 'completion_tokens': 21, 'total_tokens': 41}}, id='run-994f0362-0e50-4524-afad-3c4f5bb11328-0')
```

### स्ट्रीमिंग

प्रतिक्रियाओं को स्ट्रीम करने के लिए, आप चलने योग्य `.stream()` विधि का उपयोग कर सकते हैं।

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Voici la traduction en français :

J'aime la programmation.
```
