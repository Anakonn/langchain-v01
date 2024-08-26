---
sidebar_label: Groq
translated: true
---

# Groq

यदि पहले से ही स्थापित नहीं है, तो langchain-groq पैकेज स्थापित करें:

```bash
pip install langchain-groq
```

[API कुंजी](https://wow.groq.com) का अनुरोध करें और उसे एक पर्यावरण चर के रूप में सेट करें:

```bash
export GROQ_API_KEY=<YOUR API KEY>
```

वैकल्पिक रूप से, आप ChatGroq को प्रारंभ करते समय API कुंजी कॉन्फ़िगर कर सकते हैं।

ChatGroq वर्ग आयात करें और एक मॉडल के साथ उसे प्रारंभ करें:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
```

```python
chat = ChatGroq(temperature=0, model_name="mixtral-8x7b-32768")
```

आप उपलब्ध मॉडल को यहाँ देख सकते हैं [यहाँ](https://console.groq.com/docs/models)।

यदि आप अपनी API कुंजी को पर्यावरण में सेट नहीं करना चाहते हैं, तो आप उसे सीधे क्लाइंट को पास कर सकते हैं:

```python
chat = ChatGroq(temperature=0, groq_api_key="YOUR_API_KEY", model_name="mixtral-8x7b-32768")

```

एक प्रॉम्प्ट लिखें और ChatGroq को कंप्लीशन बनाने के लिए कॉल करें:

```python
system = "You are a helpful assistant."
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chain = prompt | chat
chain.invoke({"text": "Explain the importance of low latency LLMs."})
```

```output
AIMessage(content='Low Latency Large Language Models (LLMs) are a type of artificial intelligence model that can understand and generate human-like text. The term "low latency" refers to the model\'s ability to process and respond to inputs quickly, with minimal delay.\n\nThe importance of low latency in LLMs can be explained through the following points:\n\n1. Improved user experience: In real-time applications such as chatbots, virtual assistants, and interactive games, users expect quick and responsive interactions. Low latency LLMs can provide instant feedback and responses, creating a more seamless and engaging user experience.\n\n2. Better decision-making: In time-sensitive scenarios, such as financial trading or autonomous vehicles, low latency LLMs can quickly process and analyze vast amounts of data, enabling faster and more informed decision-making.\n\n3. Enhanced accessibility: For individuals with disabilities, low latency LLMs can help create more responsive and inclusive interfaces, such as voice-controlled assistants or real-time captioning systems.\n\n4. Competitive advantage: In industries where real-time data analysis and decision-making are crucial, low latency LLMs can provide a competitive edge by enabling businesses to react more quickly to market changes, customer needs, or emerging opportunities.\n\n5. Scalability: Low latency LLMs can efficiently handle a higher volume of requests and interactions, making them more suitable for large-scale applications and services.\n\nIn summary, low latency is an essential aspect of LLMs, as it significantly impacts user experience, decision-making, accessibility, competitiveness, and scalability. By minimizing delays and response times, low latency LLMs can unlock new possibilities and applications for artificial intelligence in various industries and scenarios.')
```

## `ChatGroq` एसिंक्रोनस और स्ट्रीमिंग कार्यक्षमता का भी समर्थन करता है:

```python
chat = ChatGroq(temperature=0, model_name="mixtral-8x7b-32768")
prompt = ChatPromptTemplate.from_messages([("human", "Write a Limerick about {topic}")])
chain = prompt | chat
await chain.ainvoke({"topic": "The Sun"})
```

```output
AIMessage(content="There's a star that shines up in the sky,\nThe Sun, that makes the day bright and spry.\nIt rises and sets,\nIn a daily, predictable bet,\nGiving life to the world, oh my!")
```

```python
chat = ChatGroq(temperature=0, model_name="llama2-70b-4096")
prompt = ChatPromptTemplate.from_messages([("human", "Write a haiku about {topic}")])
chain = prompt | chat
for chunk in chain.stream({"topic": "The Moon"}):
    print(chunk.content, end="", flush=True)
```

```output
The moon's gentle glow
Illuminates the night sky
Peaceful and serene
```
