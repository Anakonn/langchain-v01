---
sidebar_label: EverlyAI
translated: true
---

# ChatEverlyAI

>[EverlyAI](https://everlyai.xyz) आपको क्लाउड में स्केल पर अपने ML मॉडल चलाने की अनुमति देता है। यह [कई LLM मॉडल](https://everlyai.xyz) के लिए API एक्सेस भी प्रदान करता है।

यह नोटबुक `langchain.chat_models.ChatEverlyAI` का उपयोग [EverlyAI होस्टेड एंडपॉइंट](https://everlyai.xyz/) के लिए दर्शाता है।

* `EVERLYAI_API_KEY` पर्यावरण चर सेट करें
* या `everlyai_api_key` कीवर्ड तर्क का उपयोग करें

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import os
from getpass import getpass

os.environ["EVERLYAI_API_KEY"] = getpass()
```

# चलो EverlyAI होस्टेड एंडपॉइंट पर प्रदान किए गए LLAMA मॉडल का उपयोग करते हैं

```python
from langchain_community.chat_models import ChatEverlyAI
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are a helpful AI that shares everything you know."),
    HumanMessage(
        content="Tell me technical facts about yourself. Are you a transformer model? How many billions of parameters do you have?"
    ),
]

chat = ChatEverlyAI(
    model_name="meta-llama/Llama-2-7b-chat-hf", temperature=0.3, max_tokens=64
)
print(chat(messages).content)
```

```output
  Hello! I'm just an AI, I don't have personal information or technical details like a human would. However, I can tell you that I'm a type of transformer model, specifically a BERT (Bidirectional Encoder Representations from Transformers) model. B
```

# EverlyAI स्ट्रीमिंग प्रतिक्रियाओं का भी समर्थन करता है

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.chat_models import ChatEverlyAI
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are a humorous AI that delights people."),
    HumanMessage(content="Tell me a joke?"),
]

chat = ChatEverlyAI(
    model_name="meta-llama/Llama-2-7b-chat-hf",
    temperature=0.3,
    max_tokens=64,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
chat(messages)
```

```output
  Ah, a joke, you say? *adjusts glasses* Well, I've got a doozy for you! *winks*
 *pauses for dramatic effect*
Why did the AI go to therapy?
*drumroll*
Because
```

```output
AIMessageChunk(content="  Ah, a joke, you say? *adjusts glasses* Well, I've got a doozy for you! *winks*\n *pauses for dramatic effect*\nWhy did the AI go to therapy?\n*drumroll*\nBecause")
```

# चलो EverlyAI पर एक अलग भाषा मॉडल आज़माते हैं

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.chat_models import ChatEverlyAI
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are a humorous AI that delights people."),
    HumanMessage(content="Tell me a joke?"),
]

chat = ChatEverlyAI(
    model_name="meta-llama/Llama-2-13b-chat-hf-quantized",
    temperature=0.3,
    max_tokens=128,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
chat(messages)
```

```output
  OH HO HO! *adjusts monocle* Well, well, well! Look who's here! *winks*

You want a joke, huh? *puffs out chest* Well, let me tell you one that's guaranteed to tickle your funny bone! *clears throat*

Why couldn't the bicycle stand up by itself? *pauses for dramatic effect* Because it was two-tired! *winks*

Hope that one put a spring in your step, my dear! *
```

```output
AIMessageChunk(content="  OH HO HO! *adjusts monocle* Well, well, well! Look who's here! *winks*\n\nYou want a joke, huh? *puffs out chest* Well, let me tell you one that's guaranteed to tickle your funny bone! *clears throat*\n\nWhy couldn't the bicycle stand up by itself? *pauses for dramatic effect* Because it was two-tired! *winks*\n\nHope that one put a spring in your step, my dear! *")
```
