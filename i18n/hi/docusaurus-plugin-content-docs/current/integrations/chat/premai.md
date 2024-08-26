---
sidebar_label: PremAI
translated: true
---

# ChatPremAI

>[PremAI](https://app.premai.io) एक एकीकृत प्लेटफ़ॉर्म है जो आपको उपयोगकर्ता अनुभव और समग्र वृद्धि पर ध्यान केंद्रित करने के लिए कम प्रयास से शक्तिशाली उत्पादन-तैयार GenAI-संचालित अनुप्रयोग बनाने की अनुमति देता है।

यह उदाहरण `ChatPremAI` के साथ LangChain का उपयोग करने के बारे में बताता है।

### स्थापना और सेटअप

हम पहले langchain और premai-sdk को स्थापित करते हैं। आप निम्नलिखित कमांड टाइप करके इन्हें स्थापित कर सकते हैं:

```bash
pip install premai langchain
```

आगे बढ़ने से पहले, कृपया सुनिश्चित करें कि आपने PremAI पर एक खाता बना लिया है और पहले से ही एक परियोजना शुरू कर दी है। यदि नहीं, तो यहां आप मुफ्त में शुरू कर सकते हैं:

1. [PremAI](https://app.premai.io/accounts/login/) पर साइन इन करें, यदि आप पहली बार आ रहे हैं और यहां [अपना API कुंजी](https://app.premai.io/api_keys/) बनाएं।

2. [app.premai.io](https://app.premai.io) पर जाएं और यह आपको परियोजना के डैशबोर्ड पर ले जाएगा।

3. एक परियोजना बनाएं और इससे एक परियोजना-आईडी (ID के रूप में लिखा) जनरेट होगा। यह आईडी आपके तैनात अनुप्रयोग के साथ बातचीत करने में मदद करेगी।

4. LaunchPad (जिसमें 🚀 आइकन है) पर जाएं। और वहां अपने पसंदीदा मॉडल को तैनात करें। आपका डिफ़ॉल्ट मॉडल `gpt-4` होगा। आप जेनरेशन पैरामीटर (जैसे max-tokens, तापमान आदि) को भी सेट और फ़िक्स कर सकते हैं और अपने सिस्टम प्रोम्प्ट को भी पूर्व-सेट कर सकते हैं।

PremAI पर अपने पहले तैनात अनुप्रयोग बनाने पर बधाई 🎉 अब हम langchain का उपयोग करके अपने अनुप्रयोग के साथ बातचीत कर सकते हैं।

```python
from langchain_community.chat_models import ChatPremAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## LangChain में ChatPremAI इंस्टेंस सेट करना

एक बार जब हम अपने आवश्यक मॉड्यूल आयात कर लेते हैं, तो चलिए अपने क्लाइंट को सेट करते हैं। अभी के लिए, मान लीजिए कि हमारा `project_id` 8 है। लेकिन सुनिश्चित करें कि आप अपना project-id का उपयोग करें, नहीं तो यह एक त्रुटि उत्पन्न करेगा।

prem के साथ langchain का उपयोग करने के लिए, आपको किसी भी मॉडल नाम को पास करने या हमारे चैट क्लाइंट के साथ किसी भी पैरामीटर को सेट करने की आवश्यकता नहीं है। ये सभी LaunchPad मॉडल के डिफ़ॉल्ट मॉडल नाम और पैरामीटर का उपयोग करेंगे।

`नोट:` यदि आप क्लाइंट को सेट करते समय `model_name` या किसी अन्य पैरामीटर जैसे `temperature` को बदलते हैं, तो यह मौजूदा डिफ़ॉल्ट कॉन्फ़िगरेशन को ओवरराइड कर देगा।

```python
import getpass
import os

# First step is to set up the env variable.
# you can also pass the API key while instantiating the model but this
# comes under a best practices to set it as env variable.

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
# By default it will use the model which was deployed through the platform
# in my case it will is "claude-3-haiku"

chat = ChatPremAI(project_id=8)
```

## मॉडल को कॉल करना

अब आप सब कुछ सेट हैं। अब हम अपने अनुप्रयोग के साथ बातचीत करना शुरू कर सकते हैं। `ChatPremAI` दो विधियों `invoke` (जो `generate` के समान है) और `stream` का समर्थन करता है।

पहला एक स्थिर परिणाम देगा। जबकि दूसरा एक-एक टोकन स्ट्रीम करेगा। चलिए चैट-जैसी पूर्णता उत्पन्न करने के बारे में जानते हैं।

### जनरेशन

```python
human_message = HumanMessage(content="Who are you?")

response = chat.invoke([human_message])
print(response.content)
```

```output
I am an artificial intelligence created by Anthropic. I'm here to help with a wide variety of tasks, from research and analysis to creative projects and open-ended conversation. I have general knowledge and capabilities, but I'm not a real person - I'm an AI assistant. Please let me know if you have any other questions!
```

ऊपर का कुछ दिलचस्प लगता है, है ना? मैंने अपने डिफ़ॉल्ट लांचपैड सिस्टम-प्रोम्प्ट को "हमेशा एक डाकू की तरह बोलें" के रूप में सेट किया है। आप यदि आवश्यक हो, तो डिफ़ॉल्ट सिस्टम प्रोम्प्ट को भी ओवरराइड कर सकते हैं।

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="I am an artificial intelligence created by Anthropic. My purpose is to assist and converse with humans in a friendly and helpful way. I have a broad knowledge base that I can use to provide information, answer questions, and engage in discussions on a wide range of topics. Please let me know if you have any other questions - I'm here to help!")
```

आप मॉडल को कॉल करते समय जेनरेशन पैरामीटर भी बदल सकते हैं। यह कैसे करें, यह यहां बताया गया है।

```python
chat.invoke([system_message, human_message], temperature=0.7, max_tokens=10, top_p=0.95)
```

```output
AIMessage(content='I am an artificial intelligence created by Anthropic')
```

### महत्वपूर्ण टिप्पणियाँ:

आगे बढ़ने से पहले, कृपया ध्यान दें कि ChatPrem का वर्तमान संस्करण [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n) और [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) पैरामीटरों का समर्थन नहीं करता है।

हम जल्द ही इन दो पैरामीटरों का समर्थन प्रदान करेंगे।

### स्ट्रीमिंग

और अंत में, यह है कि आप गतिशील चैट जैसे अनुप्रयोगों के लिए टोकन स्ट्रीमिंग कैसे करें।

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical state, but I'm functioning properly and ready to assist you with any questions or tasks you might have. How can I help you today?
```

ऊपर की तरह, यदि आप सिस्टम-प्रोम्प्ट और जेनरेशन पैरामीटर को ओवरराइड करना चाहते हैं, तो आप ऐसा कैसे कर सकते हैं।

```python
import sys

# For some experimental reasons if you want to override the system prompt then you
# can pass that here too. However it is not recommended to override system prompt
# of an already deployed model.

for chunk in chat.stream(
    "hello how are you",
    system_prompt="act like a dog",
    temperature=0.7,
    max_tokens=200,
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical form, but I'm functioning properly and ready to assist you. How can I help you today?
```
