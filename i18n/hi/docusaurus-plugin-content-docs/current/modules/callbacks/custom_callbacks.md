---
translated: true
---

# कस्टम कॉलबैक हैंडलर

कस्टम कॉलबैक हैंडलर बनाने के लिए हमें यह निर्धारित करने की आवश्यकता है कि हम किन [घटना(ओं)](/docs/modules/callbacks/) को हैंडल करना चाहते हैं और जब घटना ट्रिगर होती है तो हम अपने कॉलबैक हैंडलर को क्या करना चाहते हैं। फिर हमें बस उस वस्तु से कॉलबैक हैंडलर को जोड़ना है, चाहे वह निर्माण कॉलबैक हो या अनुरोध कॉलबैक (देखें [कॉलबैक प्रकार](/docs/modules/callbacks/))।

नीचे दिए गए उदाहरण में, हम एक कस्टम हैंडलर के साथ स्ट्रीमिंग को लागू करेंगे।

हमारे कस्टम कॉलबैक हैंडलर `MyCustomHandler` में, हम `on_llm_new_token` को लागू करते हैं ताकि हम अभी प्राप्त किए गए टोकन को प्रिंट कर सकें। फिर हम अपने कस्टम हैंडलर को मॉडल वस्तु से निर्माण कॉलबैक के रूप में जोड़ते हैं।

```python
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI


class MyCustomHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs) -> None:
        print(f"My custom handler, token: {token}")


prompt = ChatPromptTemplate.from_messages(["Tell me a joke about {animal}"])

# To enable streaming, we pass in `streaming=True` to the ChatModel constructor
# Additionally, we pass in our custom handler as a list to the callbacks parameter
model = ChatOpenAI(streaming=True, callbacks=[MyCustomHandler()])

chain = prompt | model

response = chain.invoke({"animal": "bears"})
```

```output
My custom handler, token:
My custom handler, token: Why
My custom handler, token:  do
My custom handler, token:  bears
My custom handler, token:  have
My custom handler, token:  hairy
My custom handler, token:  coats
My custom handler, token: ?


My custom handler, token: F
My custom handler, token: ur
My custom handler, token:  protection
My custom handler, token: !
My custom handler, token:
```
