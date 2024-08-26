---
sidebar_label: Friendli
translated: true
---

# ChatFriendli

> [Friendli](https://friendli.ai/) बढ़ती मांग वाले AI कार्यभार के लिए अनुकूलित, स्केलेबल और कुशल तैनाती विकल्पों के साथ AI अनुप्रयोग प्रदर्शन को बढ़ाता है और लागत बचत को अनुकूलित करता है।

यह ट्यूटोरियल आपको LangChain का उपयोग करके चैट अनुप्रयोगों में `ChatFriendli` को एकीकृत करने में मार्गदर्शन करता है। `ChatFriendli` वार्तालाप AI प्रतिक्रियाओं को जनरेट करने के लिए एक लचीला दृष्टिकोण प्रदान करता है, जो सिंक्रोनस और असिंक्रोनस कॉल दोनों का समर्थन करता है।

## सेटअप

सुनिश्चित करें कि `langchain_community` और `friendli-client` स्थापित हैं।

```sh
pip install -U langchain-comminity friendli-client.
```

[Friendli Suite](https://suite.friendli.ai/) में साइन इन करें और एक व्यक्तिगत एक्सेस टोकन बनाएं, और इसे `FRIENDLI_TOKEN` पर्यावरण के रूप में सेट करें।

```python
import getpass
import os

os.environ["FRIENDLI_TOKEN"] = getpass.getpass("Friendi Personal Access Token: ")
```

आप उपयोग करना चाहते हैं मॉडल का चयन करके एक Friendli चैट मॉडल को प्रारंभ कर सकते हैं। डिफ़ॉल्ट मॉडल `mixtral-8x7b-instruct-v0-1` है। आप [docs.friendli.ai](https://docs.periflow.ai/guides/serverless_endpoints/pricing#text-generation-models) पर उपलब्ध मॉडलों की जांच कर सकते हैं।

```python
from langchain_community.chat_models.friendli import ChatFriendli

chat = ChatFriendli(model="llama-2-13b-chat", max_tokens=100, temperature=0)
```

## उपयोग

`FrienliChat` [`ChatModel`](/docs/modules/model_io/chat/) के सभी तरीकों का समर्थन करता है, जिसमें असिंक्रोनस API शामिल हैं।

आप `invoke`, `batch`, `generate` और `stream` की कार्यक्षमता का भी उपयोग कर सकते हैं।

```python
from langchain_core.messages.human import HumanMessage
from langchain_core.messages.system import SystemMessage

system_message = SystemMessage(content="Answer questions as short as you can.")
human_message = HumanMessage(content="Tell me a joke.")
messages = [system_message, human_message]

chat.invoke(messages)
```

```output
AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")
```

```python
chat.batch([messages, messages])
```

```output
[AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"),
 AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")]
```

```python
chat.generate([messages, messages])
```

```output
LLMResult(generations=[[ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))], [ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))]], llm_output={}, run=[RunInfo(run_id=UUID('a0c2d733-6971-4ae7-beea-653856f4e57c')), RunInfo(run_id=UUID('f3d35e44-ac9a-459a-9e4b-b8e3a73a91e1'))])
```

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
 Knock, knock!
Who's there?
Cows go.
Cows go who?
MOO!
```

आप असिंक्रोनस API `ainvoke`, `abatch`, `agenerate` और `astream` की सभी कार्यक्षमता का भी उपयोग कर सकते हैं।

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")
```

```python
await chat.abatch([messages, messages])
```

```output
[AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"),
 AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")]
```

```python
await chat.agenerate([messages, messages])
```

```output
LLMResult(generations=[[ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))], [ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))]], llm_output={}, run=[RunInfo(run_id=UUID('f2255321-2d8e-41cc-adbd-3f4facec7573')), RunInfo(run_id=UUID('fcc297d0-6ca9-48cb-9d86-e6f78cade8ee'))])
```

```python
async for chunk in chat.astream(messages):
    print(chunk.content, end="", flush=True)
```

```output
 Knock, knock!
Who's there?
Cows go.
Cows go who?
MOO!
```
