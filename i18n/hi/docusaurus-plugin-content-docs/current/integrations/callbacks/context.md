---
translated: true
---

# संदर्भ

>[संदर्भ](https://context.ai/) एलएलएम-संचालित उत्पादों और सुविधाओं के लिए उपयोगकर्ता विश्लेषिकी प्रदान करता है।

`Context` के साथ, आप अपने उपयोगकर्ताओं को समझना और उनके अनुभव को 30 मिनट से भी कम समय में बेहतर बनाना शुरू कर सकते हैं।

इस गाइड में हम आपको Context के साथ एकीकरण करने का तरीका दिखाएंगे।

## स्थापना और सेटअप

```python
%pip install --upgrade --quiet  langchain langchain-openai context-python
```

### एपीआई क्रेडेंशियल प्राप्त करना

अपना Context API टोकन प्राप्त करने के लिए:

1. अपने Context खाते में सेटिंग पृष्ठ पर जाएं (https://with.context.ai/settings)।
2. एक नया API टोकन जनरेट करें।
3. इस टोकन को सुरक्षित रूप से संग्रहीत करें।

### Context सेट करें

`ContextCallbackHandler` का उपयोग करने के लिए, Langchain से हैंडलर आयात करें और अपने Context API टोकन के साथ इंस्टैंशिएट करें।

हैंडलर का उपयोग करने से पहले `context-python` पैकेज स्थापित किया गया है, यह सुनिश्चित करें।

```python
from langchain_community.callbacks.context_callback import ContextCallbackHandler
```

```python
import os

token = os.environ["CONTEXT_API_TOKEN"]

context_callback = ContextCallbackHandler(token)
```

## उपयोग

### चैट मॉडल में Context कॉलबैक

Context कॉलबैक हैंडलर का उपयोग करके उपयोगकर्ताओं और AI सहायकों के बीच के प्रतिलिपियों को सीधे रिकॉर्ड किया जा सकता है।

```python
import os

from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

chat = ChatOpenAI(
    headers={"user_id": "123"}, temperature=0, callbacks=[ContextCallbackHandler(token)]
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]

print(chat(messages))
```

### श्रृंखला में Context कॉलबैक

Context कॉलबैक हैंडलर का उपयोग श्रृंखला के इनपुट और आउटपुट को रिकॉर्ड करने के लिए भी किया जा सकता है। ध्यान दें कि श्रृंखला के मध्यवर्ती चरणों को रिकॉर्ड नहीं किया जाता है - केवल प्रारंभिक इनपुट और अंतिम आउटपुट।

__ध्यान दें:__ सुनिश्चित करें कि आप चैट मॉडल और श्रृंखला को एक ही संदर्भ ऑब्जेक्ट पास करते हैं।

गलत:
> ```python
> chat = ChatOpenAI(temperature=0.9, callbacks=[ContextCallbackHandler(token)])
> chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[ContextCallbackHandler(token)])
> ```

सही:
>```python
>handler = ContextCallbackHandler(token)
>chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
>chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
>```

```python
import os

from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

human_message_prompt = HumanMessagePromptTemplate(
    prompt=PromptTemplate(
        template="What is a good name for a company that makes {product}?",
        input_variables=["product"],
    )
)
chat_prompt_template = ChatPromptTemplate.from_messages([human_message_prompt])
callback = ContextCallbackHandler(token)
chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
print(chain.run("colorful socks"))
```
