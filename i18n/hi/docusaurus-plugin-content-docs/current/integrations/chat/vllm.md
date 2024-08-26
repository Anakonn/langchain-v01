---
sidebar_label: vLLM चैट
translated: true
---

# vLLM चैट

vLLM को एक सर्वर के रूप में तैनात किया जा सकता है जो OpenAI API प्रोटोकॉल का अनुकरण करता है। यह vLLM को OpenAI API का उपयोग करने वाले अनुप्रयोगों के लिए एक ड्रॉप-इन प्रतिस्थापन के रूप में उपयोग करने की अनुमति देता है। इस सर्वर को OpenAI API के समान प्रारूप में क्वेरी किया जा सकता है।

यह नोटबुक vLLM चैट मॉडल का उपयोग करने के लिए langchain के `ChatOpenAI` का उपयोग करने के बारे में बताता है **जैसा कि है**।

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
```

```python
inference_server_url = "http://localhost:8000/v1"

chat = ChatOpenAI(
    model="mosaicml/mpt-7b",
    openai_api_key="EMPTY",
    openai_api_base=inference_server_url,
    max_tokens=5,
    temperature=0,
)
```

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to Italian."
    ),
    HumanMessage(
        content="Translate the following sentence from English to Italian: I love programming."
    ),
]
chat(messages)
```

```output
AIMessage(content=' Io amo programmare', additional_kwargs={}, example=False)
```

आप `MessagePromptTemplate` का उपयोग करके टेम्पलेटिंग का उपयोग कर सकते हैं। आप एक या अधिक `MessagePromptTemplates` से `ChatPromptTemplate` बना सकते हैं। आप ChatPromptTemplate के format_prompt का उपयोग कर सकते हैं - यह एक `PromptValue` लौटाता है, जिसे आप स्ट्रिंग या `Message` ऑब्जेक्ट में परिवर्तित कर सकते हैं, यह निर्भर करता है कि आप इस प्रारूपित मूल्य का उपयोग एक llm या चैट मॉडल के इनपुट के रूप में करना चाहते हैं या नहीं।

सुविधा के लिए, टेम्पलेट पर `from_template` मेथड एक्सपोज़ किया गया है। यदि आप इस टेम्पलेट का उपयोग करते हैं, तो यह कैसा दिखेगा:

```python
template = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
system_message_prompt = SystemMessagePromptTemplate.from_template(template)
human_template = "{text}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)
```

```python
chat_prompt = ChatPromptTemplate.from_messages(
    [system_message_prompt, human_message_prompt]
)

# get a chat completion from the formatted messages
chat(
    chat_prompt.format_prompt(
        input_language="English", output_language="Italian", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content=' I love programming too.', additional_kwargs={}, example=False)
```
