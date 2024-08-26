---
sidebar_label: Cohere
translated: true
---

# Cohere

यह नोटबुक [Cohere चैट मॉडल](https://cohere.com/chat) का उपयोग शुरू करने के बारे में कवर करता है।

विस्तृत प्रलेखन के लिए [API संदर्भ](https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.cohere.ChatCohere.html) पर जाएं।

## सेटअप

एकीकरण `langchain-cohere` पैकेज में मौजूद है। हम इन्हें इस प्रकार स्थापित कर सकते हैं:

```bash
pip install -U langchain-cohere
```

हमें एक [Cohere API कुंजी](https://cohere.com/) भी प्राप्त करनी होगी और `COHERE_API_KEY` पर्यावरण चर को सेट करना होगा:

```python
import getpass
import os

os.environ["COHERE_API_KEY"] = getpass.getpass()
```

[LangSmith](https://smith.langchain.com/) को सेट करना भी उपयोगी (लेकिन आवश्यक नहीं) है जो उत्कृष्ट अवलोकनीयता प्रदान करता है।

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## उपयोग

ChatCohere सभी [ChatModel](/docs/modules/model_io/chat/) कार्यक्षमता का समर्थन करता है:

```python
from langchain_cohere import ChatCohere
from langchain_core.messages import HumanMessage
```

```python
chat = ChatCohere(model="command")
```

```python
messages = [HumanMessage(content="1"), HumanMessage(content="2 3")]
chat.invoke(messages)
```

```output
AIMessage(content='4 && 5 \n6 || 7 \n\nWould you like to play a game of odds and evens?', additional_kwargs={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '2076b614-52b3-4082-a259-cc92cd3d9fea', 'token_count': {'prompt_tokens': 68, 'response_tokens': 23, 'total_tokens': 91, 'billed_tokens': 77}}, response_metadata={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '2076b614-52b3-4082-a259-cc92cd3d9fea', 'token_count': {'prompt_tokens': 68, 'response_tokens': 23, 'total_tokens': 91, 'billed_tokens': 77}}, id='run-3475e0c8-c89b-4937-9300-e07d652455e1-0')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='4 && 5', additional_kwargs={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': 'f0708a92-f874-46ee-9b93-334d616ad92e', 'token_count': {'prompt_tokens': 68, 'response_tokens': 3, 'total_tokens': 71, 'billed_tokens': 57}}, response_metadata={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': 'f0708a92-f874-46ee-9b93-334d616ad92e', 'token_count': {'prompt_tokens': 68, 'response_tokens': 3, 'total_tokens': 71, 'billed_tokens': 57}}, id='run-1635e63e-2994-4e7f-986e-152ddfc95777-0')
```

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
4 && 5
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='4 && 5', additional_kwargs={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '6770ca86-f6c3-4ba3-a285-c4772160612f', 'token_count': {'prompt_tokens': 68, 'response_tokens': 3, 'total_tokens': 71, 'billed_tokens': 57}}, response_metadata={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '6770ca86-f6c3-4ba3-a285-c4772160612f', 'token_count': {'prompt_tokens': 68, 'response_tokens': 3, 'total_tokens': 71, 'billed_tokens': 57}}, id='run-8d6fade2-1b39-4e31-ab23-4be622dd0027-0')]
```

## श्रृंखलाबद्ध

आप प्रयोक्ता इनपुट को आसानी से संरचित करने के लिए प्रॉम्प्ट टेम्प्लेट के साथ भी आसानी से जोड़ सकते हैं। हम [LCEL](/docs/expression_language) का उपयोग करके ऐसा कर सकते हैं।

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | chat
```

```python
chain.invoke({"topic": "bears"})
```

```output
AIMessage(content='What color socks do bears wear?\n\nThey don’t wear socks, they have bear feet. \n\nHope you laughed! If not, maybe this will help: laughter is the best medicine, and a good sense of humor is infectious!', additional_kwargs={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '6edccf44-9bc8-4139-b30e-13b368f3563c', 'token_count': {'prompt_tokens': 68, 'response_tokens': 51, 'total_tokens': 119, 'billed_tokens': 108}}, response_metadata={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '6edccf44-9bc8-4139-b30e-13b368f3563c', 'token_count': {'prompt_tokens': 68, 'response_tokens': 51, 'total_tokens': 119, 'billed_tokens': 108}}, id='run-ef7f9789-0d4d-43bf-a4f7-f2a0e27a5320-0')
```
