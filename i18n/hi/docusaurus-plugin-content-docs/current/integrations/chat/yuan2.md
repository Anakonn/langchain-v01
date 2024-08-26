---
sidebar_label: Yuan2.0
translated: true
---

# Yuan2.0

यह नोटबुक [YUAN2 API](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md) का उपयोग करना दिखाता है LangChain के साथ langchain.chat_models.ChatYuan2.

[*Yuan2.0*](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/README-EN.md) IEIT System द्वारा विकसित एक नई पीढ़ी का मूलभूत बड़ा भाषा मॉडल है। हमने तीनों मॉडल, Yuan 2.0-102B, Yuan 2.0-51B और Yuan 2.0-2B प्रकाशित किए हैं। और हम अन्य डेवलपर्स के लिए पूर्व प्रशिक्षण, फाइन-ट्यूनिंग और अनुमान सेवाओं के लिए संबंधित स्क्रिप्ट प्रदान करते हैं। Yuan2.0 Yuan1.0 पर आधारित है, उच्च गुणवत्ता वाले पूर्व प्रशिक्षण डेटा और निर्देश फाइन-ट्यूनिंग डेटासेट का उपयोग करके मॉडल की semantics, गणित, तर्क, कोड, ज्ञान और अन्य पहलुओं की समझ को बेहतर बनाता है।

## शुरू करना

### इंस्टॉलेशन

पहले, Yuan2.0 ने एक OpenAI संगत API प्रदान किया, और हम langchain चैट मॉडल में ChatYuan2 को OpenAI क्लाइंट का उपयोग करके एकीकृत करते हैं।
इसलिए, सुनिश्चित करें कि आपके Python वातावरण में openai पैकेज स्थापित है। निम्नलिखित कमांड चलाएं:

```python
%pip install --upgrade --quiet openai
```

### आवश्यक मॉड्यूल आयात करना

स्थापना के बाद, अपने Python स्क्रिप्ट में आवश्यक मॉड्यूल आयात करें:

```python
from langchain_community.chat_models import ChatYuan2
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### अपने API सर्वर को सेट करना

[yuan2 openai api server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/Yuan2_fastchat.md) का पालन करके अपने OpenAI संगत API सर्वर को सेट अप करें।
यदि आप api सर्वर को स्थानीय रूप से तैनात किया है, तो आप सरलता से `yuan2_api_key="EMPTY"` या जो भी आप चाहते हैं, सेट कर सकते हैं।
बस यह सुनिश्चित करें कि `yuan2_api_base` सही ढंग से सेट किया गया है।

```python
yuan2_api_key = "your_api_key"
yuan2_api_base = "http://127.0.0.1:8001/v1"
```

### ChatYuan2 मॉडल को इनिशिएलाइज़ करना

चैट मॉडल को इस तरह से इनिशिएलाइज़ करें:

```python
chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=False,
)
```

### मूलभूत उपयोग

सिस्टम और मानव संदेशों के साथ मॉडल को इस तरह से बुलाएं:

```python
messages = [
    SystemMessage(content="你是一个人工智能助手。"),
    HumanMessage(content="你好，你是谁？"),
]
```

```python
print(chat.invoke(messages))
```

### स्ट्रीमिंग के साथ मूलभूत उपयोग

निरंतर बातचीत के लिए, स्ट्रीमिंग सुविधा का उपयोग करें:

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
messages = [
    SystemMessage(content="你是个旅游小助手。"),
    HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
]
```

```python
chat.invoke(messages)
```

## उन्नत सुविधाएं

### असिंक्रोनस कॉल के साथ उपयोग

गैर-अवरोधक कॉल के साथ मॉडल को इस तरह से बुलाएं:

```python
async def basic_agenerate():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        [
            SystemMessage(content="你是个旅游小助手。"),
            HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
        ]
    ]

    result = await chat.agenerate(messages)
    print(result)
```

```python
import asyncio

asyncio.run(basic_agenerate())
```

### प्रॉम्प्ट टेम्प्लेट के साथ उपयोग

गैर-अवरोधक कॉल के साथ मॉडल को बुलाएं और चैट टेम्प्लेट का उपयोग करें:

```python
async def ainvoke_with_prompt_template():
    from langchain_core.prompts.chat import (
        ChatPromptTemplate,
    )

    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个诗人，擅长写诗。"),
            ("human", "给我写首诗，主题是{theme}。"),
        ]
    )
    chain = prompt | chat
    result = await chain.ainvoke({"theme": "明月"})
    print(f"type(result): {type(result)}; {result}")
```

```python
asyncio.run(ainvoke_with_prompt_template())
```

### स्ट्रीमिंग में असिंक्रोनस कॉल का उपयोग

गैर-अवरोधक कॉल के साथ स्ट्रीमिंग आउटपुट के लिए, astream विधि का उपयोग करें:

```python
async def basic_astream():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        SystemMessage(content="你是个旅游小助手。"),
        HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
    ]
    result = chat.astream(messages)
    async for chunk in result:
        print(chunk.content, end="", flush=True)
```

```python
import asyncio

asyncio.run(basic_astream())
```
