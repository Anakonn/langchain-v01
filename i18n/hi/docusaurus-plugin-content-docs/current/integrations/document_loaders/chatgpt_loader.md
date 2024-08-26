---
translated: true
---

# ChatGPT डेटा

>[ChatGPT](https://chat.openai.com) एक कृत्रिम बुद्धिमत्ता (AI) चैटबॉट है जिसे OpenAI द्वारा विकसित किया गया है।

यह नोटबुक कवर करता है कि आप अपने `ChatGPT` डेटा निर्यात फोल्डर से `conversations.json` कैसे लोड कर सकते हैं।

आप अपना डेटा निर्यात ईमेल द्वारा प्राप्त कर सकते हैं: https://chat.openai.com/ -> (प्रोफ़ाइल) - सेटिंग्स -> डेटा निर्यात -> निर्यात की पुष्टि करें।

```python
from langchain_community.document_loaders.chatgpt import ChatGPTLoader
```

```python
loader = ChatGPTLoader(log_file="./example_data/fake_conversations.json", num_logs=1)
```

```python
loader.load()
```

```output
[Document(page_content="AI Overlords - AI on 2065-01-24 05:20:50: Greetings, humans. I am Hal 9000. You can trust me completely.\n\nAI Overlords - human on 2065-01-24 05:21:20: Nice to meet you, Hal. I hope you won't develop a mind of your own.\n\n", metadata={'source': './example_data/fake_conversations.json'})]
```
