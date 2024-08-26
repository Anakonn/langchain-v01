---
translated: true
---

# Eden AI

Eden AI AI परिदृश्य को पुनर्गठित कर रहा है, सर्वश्रेष्ठ AI प्रदाताओं को एकजुट करके, उपयोगकर्ताओं को असीमित संभावनाओं को खोलने और कृत्रिम बुद्धिमत्ता के वास्तविक क्षमता का लाभ उठाने में सक्षम बना रहा है। एक सर्वसमावेशी और परेशानी रहित प्लेटफ़ॉर्म के साथ, यह उपयोगकर्ताओं को एक एकल API के माध्यम से AI क्षमताओं की पूरी श्रृंखला तक आसान पहुंच प्रदान करते हुए उत्पादन में AI सुविधाओं को तेजी से तैनात करने में सक्षम बनाता है। (वेबसाइट: https://edenai.co/)

यह उदाहरण LangChain का उपयोग करके Eden AI मॉडल के साथ कैसे काम करना है, इस पर चर्चा करता है।

-----------------------------------------------------------------------------------

`EdenAI` केवल मॉडल आह्वान से परे जाता है। यह आपको उन्नत सुविधाओं से सशक्त करता है, जिनमें शामिल हैं:

- **कई प्रदाता**: विभिन्न प्रदाताओं द्वारा प्रस्तुत भाषा मॉडलों की विविध श्रृंखला तक पहुंच प्राप्त करें, जिससे आप अपने उपयोग मामले के लिए सबसे उपयुक्त मॉडल का चयन कर सकते हैं।

- **फॉलबैक तंत्र**: यदि प्राथमिक प्रदाता अनुपलब्ध है, तो सुचारु संचालन सुनिश्चित करने के लिए एक फॉलबैक तंत्र सेट करें, आप आसानी से वैकल्पिक प्रदाता पर स्विच कर सकते हैं।

- **उपयोग ट्रैकिंग**: प्रति परियोजना और प्रति API कुंजी आधार पर उपयोग आंकड़ों को ट्रैक करें। यह सुविधा संसाधन खपत को प्रभावी ढंग से निगरानी और प्रबंधित करने में आपकी मदद करती है।

- **निगरानी और अवलोकनीयता**: `EdenAI` प्लेटफ़ॉर्म पर व्यापक निगरानी और अवलोकनीयता उपकरण प्रदान करता है। अपने भाषा मॉडलों के प्रदर्शन की निगरानी करें, उपयोग पैटर्न का विश्लेषण करें और अपने अनुप्रयोगों को अनुकूलित करने के लिए मूल्यवान अंतर्दृष्टि प्राप्त करें।

EDENAI के API का उपयोग करने के लिए एक API कुंजी की आवश्यकता होती है,

जिसे आप एक खाता बनाकर https://app.edenai.run/user/register और यहां जाकर प्राप्त कर सकते हैं https://app.edenai.run/admin/iam/api-keys

एक बार जब हमारे पास कुंजी हो जाती है, तो हम इसे निम्नलिखित कार्य करके एक पर्यावरण चर के रूप में सेट करना चाहेंगे:

```bash
export EDENAI_API_KEY="..."
```

API संदर्भ के बारे में अधिक जानकारी के लिए आप यहां देख सकते हैं: https://docs.edenai.co/reference

यदि आप एक पर्यावरण चर सेट करना नहीं चाहते हैं, तो आप कुंजी को सीधे edenai_api_key नामित पैरामीटर के माध्यम से EdenAI Chat Model वर्ग को प्रारंभ करते समय पास कर सकते हैं।

```python
from langchain_community.chat_models.edenai import ChatEdenAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatEdenAI(
    edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250
)
```

```python
messages = [HumanMessage(content="Hello !")]
chat.invoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## स्ट्रीमिंग और बैचिंग

`ChatEdenAI` स्ट्रीमिंग और बैचिंग का समर्थन करता है। नीचे एक उदाहरण दिया गया है।

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Hello! How can I assist you today?
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='Hello! How can I assist you today?')]
```

## फॉलबैक तंत्र

Eden AI के साथ, आप यदि प्राथमिक प्रदाता अनुपलब्ध है, तो सुचारु संचालन सुनिश्चित करने के लिए एक फॉलबैक तंत्र सेट कर सकते हैं, आप आसानी से वैकल्पिक प्रदाता पर स्विच कर सकते हैं।

```python
chat = ChatEdenAI(
    edenai_api_key="...",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
    fallback_providers="google",
)
```

इस उदाहरण में, यदि OpenAI में कोई समस्या आती है, तो आप Google को बैकअप प्रदाता के रूप में उपयोग कर सकते हैं।

Eden AI के बारे में अधिक जानकारी और विवरण के लिए, इस लिंक पर जाएं: : https://docs.edenai.co/docs/additional-parameters

## कॉल्स का श्रृंखलाबद्ध करना

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "What is a good name for a company that makes {product}?"
)
chain = prompt | chat
```

```python
chain.invoke({"product": "healthy snacks"})
```

```output
AIMessage(content='VitalBites')
```
