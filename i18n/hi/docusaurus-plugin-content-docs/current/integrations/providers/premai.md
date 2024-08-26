---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io) एक एकीकृत प्लेटफॉर्म है जो आपको कम प्रयास से शक्तिशाली उत्पादन-तैयार GenAI-संचालित अनुप्रयोगों को बनाने देता है ताकि आप उपयोगकर्ता अनुभव और समग्र वृद्धि पर अधिक ध्यान दे सकें।

## ChatPremAI

यह उदाहरण बताता है कि `ChatPremAI` के साथ विभिन्न चैट मॉडल्स के साथ LangChain कैसे इंटरैक्ट करें

### स्थापना और सेटअप

हम langchain और premai-sdk को स्थापित करने से शुरू करते हैं। आप निम्नलिखित कमांड टाइप करके इन्हें स्थापित कर सकते हैं:

```bash
pip install premai langchain
```

आगे बढ़ने से पहले, कृपया सुनिश्चित करें कि आपने PremAI पर एक खाता बना लिया है और पहले से ही एक परियोजना शुरू कर दी है। यदि नहीं, तो यहां आप मुफ्त में शुरू कर सकते हैं:

1. [PremAI](https://app.premai.io/accounts/login/) पर साइन इन करें, यदि आप पहली बार आ रहे हैं और यहां [अपना API कुंजी](https://app.premai.io/api_keys/) बनाएं।

2. [app.premai.io](https://app.premai.io) पर जाएं और यह आपको परियोजना के डैशबोर्ड पर ले जाएगा।

3. एक परियोजना बनाएं और यह एक परियोजना-आईडी (ID के रूप में लिखा) जनरेट करेगा। यह आईडी आपके तैनात अनुप्रयोग के साथ इंटरैक्ट करने में मदद करेगी।

4. LaunchPad (जिसमें 🚀 आइकन है) पर जाएं। और वहां अपने पसंदीदा मॉडल को तैनात करें। आपका डिफ़ॉल्ट मॉडल `gpt-4` होगा। आप जेनरेशन पैरामीटर (जैसे max-tokens, तापमान आदि) को भी सेट और स्थिर कर सकते हैं और अपने सिस्टम प्रोम्प्ट को भी पूर्व-सेट कर सकते हैं।

PremAI पर अपने पहले तैनात अनुप्रयोग बनाने पर बधाई 🎉 अब हम langchain का उपयोग करके अपने अनुप्रयोग के साथ इंटरैक्ट कर सकते हैं।

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "PremAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "PremAI"}, {"imported": "ChatPremAI", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.premai.ChatPremAI.html", "title": "PremAI"}]-->
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_models import ChatPremAI
```

### LangChain में ChatPrem इंस्टेंस सेटअप करना

एक बार जब हम अपने आवश्यक मॉड्यूल आयात कर लेते हैं, तो चलिए अपने क्लाइंट को सेट करते हैं। अभी के लिए, मान लीजिए कि हमारा `project_id` 8 है। लेकिन सुनिश्चित करें कि आप अपना project-id का उपयोग करें, नहीं तो यह त्रुटि देगा।

prem के साथ langchain का उपयोग करने के लिए, आपको किसी भी मॉडल नाम को पास करने या हमारे चैट क्लाइंट के साथ किसी भी पैरामीटर को सेट करने की आवश्यकता नहीं है। ये सभी LaunchPad मॉडल के डिफ़ॉल्ट मॉडल नाम और पैरामीटर का उपयोग करेंगे।

`नोट:` यदि आप क्लाइंट को सेट करते समय `model_name` या किसी अन्य पैरामीटर जैसे `temperature` को बदलते हैं, तो यह मौजूदा डिफ़ॉल्ट कॉन्फ़िगरेशन को ओवरराइड कर देगा।

```python
import os
import getpass

if "PREMAI_API_KEY" not in os.environ:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

chat = ChatPremAI(project_id=8)
```

### मॉडल को कॉल करना

अब आप सब कुछ सेट हैं। अब हम अपने अनुप्रयोग के साथ इंटरैक्ट करना शुरू कर सकते हैं। `ChatPremAI` दो विधियों `invoke` (जो `generate` के समान है) और `stream` का समर्थन करता है।

पहला एक स्थिर परिणाम देगा। जबकि दूसरा एक-एक टोकन स्ट्रीम करेगा। चलिए चैट-जैसे पूर्णता को जनरेट करने का तरीका देखते हैं।

### जनरेशन

```python
human_message = HumanMessage(content="Who are you?")

chat.invoke([human_message])
```

उपरोक्त दिलचस्प लगता है, है ना? मैंने अपने डिफ़ॉल्ट launchpad सिस्टम-प्रोम्प्ट को "Always sound like a pirate" के रूप में सेट किया है। आप यदि आवश्यक हो, तो डिफ़ॉल्ट सिस्टम प्रोम्प्ट को भी ओवरराइड कर सकते हैं।

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

आप मॉडल को कॉल करते समय जनरेशन पैरामीटर भी बदल सकते हैं। यह करने का तरीका यह है:

```python
chat.invoke(
    [system_message, human_message],
    temperature = 0.7, max_tokens = 20, top_p = 0.95
)
```

### महत्वपूर्ण टिप्पणियाँ:

आगे बढ़ने से पहले, कृपया ध्यान दें कि ChatPrem का वर्तमान संस्करण [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n) और [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) पैरामीटरों का समर्थन नहीं करता है।

हम बाद के संस्करणों में इन दो पैरामीटरों का समर्थन प्रदान करेंगे।

### स्ट्रीमिंग

और अंत में, यह है कि आप गतिशील चैट-जैसे अनुप्रयोगों के लिए टोकन स्ट्रीमिंग कैसे करें।

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

ऊपर की तरह, यदि आप सिस्टम-प्रोम्प्ट और जनरेशन पैरामीटर को ओवरराइड करना चाहते हैं, तो यह करने का तरीका यह है।

```python
import sys

for chunk in chat.stream(
    "hello how are you",
    system_prompt = "You are an helpful assistant", temperature = 0.7, max_tokens = 20
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

## एम्बेडिंग

इस खंड में, हम `PremEmbeddings` का उपयोग करके विभिन्न एम्बेडिंग मॉडल तक कैसे पहुंच सकते हैं, इस पर चर्चा करेंगे। चलिए कुछ आयात करके और अपने एम्बेडिंग ऑब्जेक्ट को परिभाषित करके शुरू करते हैं।

```python
from langchain_community.embeddings import PremEmbeddings
```

एक बार जब हम अपने आवश्यक मॉड्यूल आयात कर लेते हैं, तो चलिए अपने क्लाइंट को सेट करते हैं। अभी के लिए, मान लीजिए कि हमारा `project_id` 8 है। लेकिन सुनिश्चित करें कि आप अपना project-id का उपयोग करें, नहीं तो यह त्रुटि देगा।

```python

import os
import getpass

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

# Define a model as a required parameter here since there is no default embedding model

model = "text-embedding-3-large"
embedder = PremEmbeddings(project_id=8, model=model)
```

हमने अपने एम्बेडिंग मॉडल को परिभाषित किया है। हम कई एम्बेडिंग मॉडल का समर्थन करते हैं। यहां एक तालिका है जो हम समर्थित एम्बेडिंग मॉडलों की संख्या दिखाती है।

| प्रदाता    | स्लग                                     | संदर्भ टोकन |
|-------------|------------------------------------------|----------------|
| cohere      | embed-english-v3.0                       | N/A            |
| openai      | text-embedding-3-small                   | 8191           |
| openai      | text-embedding-3-large                   | 8191           |
| openai      | text-embedding-ada-002                   | 8191           |
| replicate   | replicate/all-mpnet-base-v2              | N/A            |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A            |
| mistralai   | mistral-embed                            | 4096           |

मॉडल को बदलने के लिए, आपको बस `slug` कॉपी करना होगा और अपने एम्बेडिंग मॉडल तक पहुंच सकते हैं। अब चलिए एक क्वेरी के साथ अपने एम्बेडिंग मॉडल का उपयोग करना शुरू करें, जिसके बाद कई क्वेरी (जिसे दस्तावेज़ भी कहा जाता है) का उपयोग करेंगे।

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

अंत में, चलिए एक दस्तावेज़ एम्बेड करते हैं।

```python
documents = [
    "This is document1",
    "This is document2",
    "This is document3"
]

doc_result = embedder.embed_documents(documents)

# Similar to the previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```
