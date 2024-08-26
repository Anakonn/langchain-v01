---
translated: true
---

# रिमेम्ब्राल

यह पृष्ठ LangChain के भीतर [रिमेम्ब्राल](https://remembrall.dev) पारिस्थितिकी तंत्र का उपयोग करने के तरीके को कवर करता है।

## रिमेम्ब्राल क्या है?

रिमेम्ब्राल आपके भाषा मॉडल को दीर्घकालिक स्मृति, पुनः प्राप्त संवर्धित पीढ़ी, और केवल कुछ पंक्तियों के कोड के साथ पूर्ण प्रेक्षणीयता प्रदान करता है।

![रिमेम्ब्राल डैशबोर्ड का स्क्रीनशॉट जिसमें अनुरोध के आंकड़े और मॉडल इंटरैक्शन दिखाए गए हैं।](/img/RemembrallDashboard.png "रिमेम्ब्राल डैशबोर्ड इंटरफ़ेस")

यह आपके OpenAI कॉल्स के ऊपर एक हल्के प्रॉक्सी के रूप में काम करता है और केवल रनटाइम पर चैट कॉल्स के संदर्भ को एकत्रित किए गए प्रासंगिक तथ्यों के साथ संवर्धित करता है।

## सेटअप

शुरू करने के लिए, [रिमेम्ब्राल प्लेटफ़ॉर्म पर Github के साथ साइन इन करें](https://remembrall.dev/login) और [सेटिंग्स पेज से अपना API कुंजी कॉपी करें](https://remembrall.dev/dashboard/settings)।

कोई भी अनुरोध जो आप संशोधित `openai_api_base` (नीचे देखें) और रिमेम्ब्राल API कुंजी के साथ भेजते हैं, स्वचालित रूप से रिमेम्ब्राल डैशबोर्ड में ट्रैक किया जाएगा। आपको **कभी भी** अपना OpenAI कुंजी हमारे प्लेटफ़ॉर्म के साथ साझा करने की आवश्यकता नहीं है और यह जानकारी **कभी भी** रिमेम्ब्राल सिस्टम द्वारा संग्रहीत नहीं की जाती है।

ऐसा करने के लिए, हमें निम्नलिखित निर्भरताओं को स्थापित करने की आवश्यकता है:

```bash
pip install -U langchain-openai
```

### दीर्घकालिक स्मृति सक्षम करें

`openai_api_base` और रिमेम्ब्राल API कुंजी को `x-gp-api-key` के माध्यम से सेट करने के अलावा, आपको एक UID निर्दिष्ट करना चाहिए ताकि मेमोरी बनाए रखी जा सके। यह आमतौर पर एक अद्वितीय उपयोगकर्ता पहचानकर्ता (जैसे ईमेल) होगा।

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Remembrall"}]-->
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-remember": "user@email.com",
                            }
                        })

chat_model.predict("My favorite color is blue.")
import time; time.sleep(5)  # wait for system to save fact via auto save
print(chat_model.predict("What is my favorite color?"))
```

### पुनः प्राप्त संवर्धित पीढ़ी सक्षम करें

पहले, [रिमेम्ब्राल डैशबोर्ड](https://remembrall.dev/dashboard/spells) में एक दस्तावेज़ संदर्भ बनाएँ। दस्तावेज़ पाठों को पेस्ट करें या दस्तावेज़ों को PDF के रूप में अपलोड करें ताकि उन्हें संसाधित किया जा सके। दस्तावेज़ संदर्भ ID को सुरक्षित करें और इसे नीचे दिखाए गए अनुसार डालें।

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Remembrall"}]-->
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-context": "document-context-id-goes-here",
                            }
                        })

print(chat_model.predict("This is a question that can be answered with my document."))
```
