---
translated: true
---

# JinaChat

यह नोटबुक JinaChat चैट मॉडल्स का उपयोग शुरू करने के बारे में कवर करता है।

```python
from langchain_community.chat_models import JinaChat
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```

```python
chat = JinaChat(temperature=0)
```

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]
chat(messages)
```

```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```

आप `MessagePromptTemplate` का उपयोग करके टेम्पलेटिंग का उपयोग कर सकते हैं। आप एक या अधिक `MessagePromptTemplates` से `ChatPromptTemplate` बना सकते हैं। आप `ChatPromptTemplate` के `format_prompt` का उपयोग कर सकते हैं - यह एक `PromptValue` लौटाता है, जिसे आप स्ट्रिंग या संदेश ऑब्जेक्ट में परिवर्तित कर सकते हैं, यह निर्भर करता है कि आप इस प्रारूपित मूल्य का उपयोग किसी llm या चैट मॉडल के इनपुट के रूप में करना चाहते हैं या नहीं।

सुविधा के लिए, टेम्पलेट पर एक `from_template` विधि उपलब्ध है। यदि आप इस टेम्पलेट का उपयोग करते हैं, तो यह कैसा दिखेगा:

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
        input_language="English", output_language="French", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```
