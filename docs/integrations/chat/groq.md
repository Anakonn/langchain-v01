---
canonical: https://python.langchain.com/v0.1/docs/integrations/chat/groq
sidebar_label: Groq
translated: false
---

# Groq

Install the langchain-groq package if not already installed:

```bash
pip install langchain-groq
```

Request an [API key](https://wow.groq.com) and set it as an environment variable:

```bash
export GROQ_API_KEY=<YOUR API KEY>
```

Alternatively, you may configure the API key when you initialize ChatGroq.

Import the ChatGroq class and initialize it with a model:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
```

```python
chat = ChatGroq(temperature=0, model_name="mixtral-8x7b-32768")
```

You can view the available models [here](https://console.groq.com/docs/models).

If you do not want to set your API key in the environment, you can pass it directly to the client:

```python
chat = ChatGroq(temperature=0, groq_api_key="YOUR_API_KEY", model_name="mixtral-8x7b-32768")

```

Write a prompt and invoke ChatGroq to create completions:

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

## `ChatGroq` also supports async and streaming functionality:

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