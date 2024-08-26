---
translated: true
---

# लेमन एजेंट

>[लेमन एजेंट](https://github.com/felixbrock/lemon-agent) आपको कुछ ही मिनटों में शक्तिशाली AI सहायकों का निर्माण करने और कार्यप्रवाहों को स्वचालित करने में मदद करता है, जिससे `Airtable`, `Hubspot`, `Discord`, `Notion`, `Slack` और `Github` जैसे उपकरणों में सटीक और विश्वसनीय पढ़ने और लिखने के कार्य संभव हो जाते हैं।

[पूर्ण दस्तावेज़ यहाँ देखें](https://github.com/felixbrock/lemonai-py-client)।

आज उपलब्ध अधिकांश कनेक्टर केवल पढ़ने-योग्य कार्यों पर केंद्रित हैं, जिससे एलएलएम की संभावनाओं को सीमित कर दिया जाता है। दूसरी ओर, एजेंटों में कभी-कभी संदर्भ या निर्देशों की कमी के कारण भ्रम होने की प्रवृत्ति होती है।

`लेमन AI` के साथ, आप अपने एजेंटों को विश्वसनीय पढ़ने और लिखने के कार्यों के लिए अच्छी तरह परिभाषित एपीआई तक पहुंच प्रदान कर सकते हैं। इसके अलावा, `लेमन AI` फ़ंक्शन आपको भ्रम के जोखिम को और कम करने में मदद कर सकते हैं, क्योंकि वे आपको अनिश्चितता की स्थिति में मॉडल पर भरोसा करने के लिए स्थिर रूप से परिभाषित कार्यप्रवाहों का एक तरीका प्रदान करते हैं।

## त्वरित शुरुआत

निम्नलिखित त्वरित शुरुआत दिखाती है कि आंतरिक उपकरणों के साथ संवाद करने वाले कार्यप्रवाहों को स्वचालित करने के लिए एजेंटों के साथ लेमन AI का कैसे उपयोग किया जाए।

### 1. लेमन AI स्थापित करें

पायथन 3.8.1 और उससे ऊपर की आवश्यकता है।

अपने पायथन प्रोजेक्ट में लेमन AI का उपयोग करने के लिए `pip install lemonai` चलाएं।

इससे संबंधित लेमन AI क्लाइंट स्थापित होगा, जिसे आप अपने स्क्रिप्ट में आयात कर सकते हैं।

इस उपकरण में पायथन पैकेज langchain और loguru का उपयोग किया जाता है। लेमन AI के साथ कोई भी स्थापना त्रुटि होने पर, पहले दोनों पैकेज स्थापित करें और फिर लेमन AI पैकेज स्थापित करें।

### 2. सर्वर लॉन्च करें

आपके एजेंटों और लेमन AI द्वारा प्रदान किए गए सभी उपकरणों के बीच की बातचीत [लेमन AI सर्वर](https://github.com/felixbrock/lemonai-server) द्वारा संभाली जाती है। लेमन AI का उपयोग करने के लिए, आपको अपने स्थानीय मशीन पर सर्वर चलाना होगा ताकि लेमन AI पायथन क्लाइंट इससे कनेक्ट कर सके।

### 3. लैंगचेन के साथ लेमन AI का उपयोग करें

लेमन AI स्वचालित रूप से दिए गए कार्यों को सुलझाता है, जो सुसंगत उपकरणों का सही संयोजन ढूंढता है या वैकल्पिक रूप से लेमन AI फ़ंक्शन का उपयोग करता है। निम्नलिखित उदाहरण दिखाता है कि हैकरन्यूज से एक उपयोगकर्ता को कैसे पुनः प्राप्त किया जाए और उसे एयरटेबल में एक तालिका में कैसे लिखा जाए:

#### (वैकल्पिक) अपने लेमन AI फ़ंक्शन को परिभाषित करें

[OpenAI फ़ंक्शन](https://openai.com/blog/function-calling-and-other-api-updates) की तरह, लेमन AI भी कार्यप्रवाहों को पुनर्उपयोगी फ़ंक्शन के रूप में परिभाषित करने का विकल्प प्रदान करता है। ये फ़ंक्शन उन उपयोग मामलों के लिए परिभाषित किए जा सकते हैं जहां निर्धारित व्यवहार के करीब जाना विशेष रूप से महत्वपूर्ण है। एक अलग lemonai.json में विशिष्ट कार्यप्रवाहों को परिभाषित किया जा सकता है:

```json
[
  {
    "name": "Hackernews Airtable User Workflow",
    "description": "retrieves user data from Hackernews and appends it to a table in Airtable",
    "tools": ["hackernews-get-user", "airtable-append-data"]
  }
]
```

आपका मॉडल इन फ़ंक्शनों तक पहुंच सकेगा और दिए गए कार्य को हल करने के लिए स्वयं चयनित उपकरणों के बजाय उन्हें प्राथमिकता देगा। आपको केवल एजेंट को यह बताने की आवश्यकता है कि उसे किसी दिए गए फ़ंक्शन का उपयोग करना चाहिए, इसके लिए आप प्रॉम्प्ट में फ़ंक्शन का नाम शामिल करें।

#### अपने लैंगचेन प्रोजेक्ट में लेमन AI शामिल करें

```python
import os

from langchain_openai import OpenAI
from lemonai import execute_workflow
```

#### API कुंजियां और एक्सेस टोकन लोड करें

प्रमाणीकरण की आवश्यकता वाले उपकरणों का उपयोग करने के लिए, आपको अपने वातावरण में संबंधित एक्सेस क्रेडेंशियल को "{tool name}_{authentication string}" प्रारूप में संग्रहीत करना होगा, जहां प्रमाणीकरण स्ट्रिंग में से एक ["API_KEY", "SECRET_KEY", "SUBSCRIPTION_KEY", "ACCESS_KEY"] एपीआई कुंजियों या ["ACCESS_TOKEN", "SECRET_TOKEN"] प्रमाणीकरण टोकनों के लिए होता है। उदाहरण हैं "OPENAI_API_KEY", "BING_SUBSCRIPTION_KEY", "AIRTABLE_ACCESS_TOKEN"।

```python
""" Load all relevant API Keys and Access Tokens into your environment variables """
os.environ["OPENAI_API_KEY"] = "*INSERT OPENAI API KEY HERE*"
os.environ["AIRTABLE_ACCESS_TOKEN"] = "*INSERT AIRTABLE TOKEN HERE*"
```

```python
hackernews_username = "*INSERT HACKERNEWS USERNAME HERE*"
airtable_base_id = "*INSERT BASE ID HERE*"
airtable_table_id = "*INSERT TABLE ID HERE*"

""" Define your instruction to be given to your LLM """
prompt = f"""Read information from Hackernews for user {hackernews_username} and then write the results to
Airtable (baseId: {airtable_base_id}, tableId: {airtable_table_id}). Only write the fields "username", "karma"
and "created_at_i". Please make sure that Airtable does NOT automatically convert the field types.
"""

"""
Use the Lemon AI execute_workflow wrapper
to run your Langchain agent in combination with Lemon AI
"""
model = OpenAI(temperature=0)

execute_workflow(llm=model, prompt_string=prompt)
```

### 4. अपने एजेंट के निर्णय लेने में पारदर्शिता प्राप्त करें

अपने एजेंट द्वारा दिए गए कार्य को हल करने के लिए लेमन AI उपकरणों के साथ किए गए संवादों पर पारदर्शिता प्राप्त करने के लिए, सभी निर्णय, उपयोग किए गए उपकरण और किए गए कार्य स्थानीय `lemonai.log` फ़ाइल में लिखे जाते हैं। जब भी आपका एलएलएम एजेंट लेमन AI टूल स्टैक के साथ संवाद करता है, तब एक संबंधित लॉग प्रविष्टि बनाई जाती है।

```log
2023-06-26T11:50:27.708785+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - hackernews-get-user
2023-06-26T11:50:39.624035+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - airtable-append-data
2023-06-26T11:58:32.925228+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - hackernews-get-user
2023-06-26T11:58:43.988788+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - airtable-append-data
```

[लेमन AI एनालिटिक्स](https://github.com/felixbrock/lemon-agent/blob/main/apps/analytics/README.md) का उपयोग करके, आप आसानी से यह समझ सकते हैं कि उपकरणों का कितनी बार और किस क्रम में उपयोग किया जाता है। इसके परिणामस्वरूप, आप अपने एजेंट के निर्णय लेने की क्षमताओं में कमजोर बिंदुओं की पहचान कर सकते हैं और अधिक निर्धारित व्यवहार की ओर बढ़ने के लिए लेमन AI फ़ंक्शन को परिभाषित कर सकते हैं।
