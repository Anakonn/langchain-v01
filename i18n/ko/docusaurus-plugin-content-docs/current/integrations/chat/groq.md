---
sidebar_label: Groq
translated: true
---

# Groq

langchain-groq 패키지를 설치하십시오:

```bash
pip install langchain-groq
```

[API 키](https://wow.groq.com)를 요청하고 환경 변수로 설정하십시오:

```bash
export GROQ_API_KEY=<YOUR API KEY>
```

또는, ChatGroq를 초기화할 때 API 키를 설정할 수 있습니다.

ChatGroq 클래스를 가져와서 모델과 함께 초기화합니다:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
```

```python
chat = ChatGroq(temperature=0, model_name="mixtral-8x7b-32768")
```

사용 가능한 모델은 [여기](https://console.groq.com/docs/models)에서 확인할 수 있습니다.

API 키를 환경 변수에 설정하고 싶지 않다면, 클라이언트에 직접 전달할 수 있습니다:

```python
chat = ChatGroq(temperature=0, groq_api_key="YOUR_API_KEY", model_name="mixtral-8x7b-32768")
```

프롬프트를 작성하고 ChatGroq를 호출하여 응답을 생성합니다:

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

## `ChatGroq`는 비동기 및 스트리밍 기능도 지원합니다:

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