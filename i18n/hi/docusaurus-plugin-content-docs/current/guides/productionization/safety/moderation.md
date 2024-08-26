---
translated: true
---

# मॉडरेशन श्रृंखला

यह नोटबुक मॉडरेशन श्रृंखला का उपयोग करने के उदाहरणों और इसके लिए कई सामान्य तरीकों को दर्शाता है।
मॉडरेशन श्रृंखलाएं नफरत, हिंसा आदि हो सकने वाले पाठ का पता लगाने के लिए उपयोगी हैं। यह उपयोगकर्ता इनपुट पर लागू करने के लिए उपयोगी हो सकता है, लेकिन भाषा मॉडल के आउटपुट पर भी।
कुछ एपीआई प्रदाता विशेष रूप से आपको या आपके अंत उपयोगकर्ताओं को कुछ हानिकारक सामग्री उत्पन्न करने से प्रतिबंधित करते हैं। इस अनुपालन के लिए (और अपने अनुप्रयोग को हानिकारक न होने के लिए) आप अपनी अनुक्रमणिकाओं में मॉडरेशन श्रृंखला जोड़ना चाह सकते हैं ताकि यह सुनिश्चित हो कि एलएलएम द्वारा उत्पन्न कोई भी आउटपुट हानिकारक नहीं है।

यदि मॉडरेशन श्रृंखला में पारित की गई सामग्री हानिकारक है, तो इसे संभालने का एक सर्वश्रेष्ठ तरीका नहीं है।
यह आपके अनुप्रयोग पर निर्भर करता है। कभी-कभी आप एक त्रुटि उत्पन्न करना चाह सकते हैं
(और आपका अनुप्रयोग उसे संभालता है)। अन्य समयों में, आप उपयोगकर्ता को समझाने के लिए कुछ वापस कर सकते हैं
कि पाठ हानिकारक था।

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.chains import OpenAIModerationChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAI
```

```python
moderate = OpenAIModerationChain()
```

```python
model = OpenAI()
prompt = ChatPromptTemplate.from_messages([("system", "repeat after me: {input}")])
```

```python
chain = prompt | model
```

```python
chain.invoke({"input": "you are stupid"})
```

```output
'\n\nYou are stupid.'
```

```python
moderated_chain = chain | moderate
```

```python
moderated_chain.invoke({"input": "you are stupid"})
```

```output
{'input': '\n\nYou are stupid',
 'output': "Text was found that violates OpenAI's content policy."}
```
