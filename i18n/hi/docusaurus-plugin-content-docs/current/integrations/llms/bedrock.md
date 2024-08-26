---
translated: true
---

# बेड्रॉक

>[अमेज़न बेड्रॉक](https://aws.amazon.com/bedrock/) एक पूरी तरह से प्रबंधित सेवा है जो `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI` और `Amazon` जैसी अग्रणी AI कंपनियों से उच्च-प्रदर्शन वाले फाउंडेशन मॉडल्स (एफएम) का एक विकल्प प्रदान करती है, एक एकल एपीआई के माध्यम से, साथ ही सुरक्षा, गोपनीयता और जिम्मेदार AI के साथ जनरेटिव AI एप्लिकेशन बनाने के लिए आवश्यक व्यापक क्षमताएं। `अमेज़न बेड्रॉक` का उपयोग करके, आप अपने उपयोग मामले के लिए शीर्ष एफएम का आसानी से प्रयोग और मूल्यांकन कर सकते हैं, तकनीकों जैसे फाइन-ट्यूनिंग और `रिट्रीवल ऑग्मेंटेड जनरेशन` (`RAG`) का उपयोग करके उन्हें निजी रूप से अनुकूलित कर सकते हैं, और एजेंट बना सकते हैं जो आपके उद्यम प्रणालियों और डेटा स्रोतों का उपयोग करके कार्य निष्पादित करते हैं। चूंकि `अमेज़न बेड्रॉक` सर्वरलेस है, आपको किसी भी बुनियादी ढांचे का प्रबंधन नहीं करना होता है, और आप AWS सेवाओं का उपयोग करके अपने एप्लिकेशनों में जनरेटिव AI क्षमताओं को सुरक्षित रूप से एकीकृत और तैनात कर सकते हैं।

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin", model_id="amazon.titan-text-express-v1"
)
```

### वार्तालाप श्रृंखला में उपयोग करना

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### स्ट्रीमिंग के साथ वार्तालाप श्रृंखला

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="amazon.titan-text-express-v1",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
```

```python
conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### कस्टम मॉडल्स

```python
custom_llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    provider="cohere",
    model_id="<Custom model ARN>",  # ARN like 'arn:aws:bedrock:...' obtained via provisioning the custom model
    model_kwargs={"temperature": 1},
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)

conversation = ConversationChain(
    llm=custom_llm, verbose=True, memory=ConversationBufferMemory()
)
conversation.predict(input="What is the recipe of mayonnaise?")
```

### अमेज़न बेड्रॉक उदाहरण के लिए गार्डरेल्स

## अमेज़न बेड्रॉक (प्रीव्यू) के लिए गार्डरेल्स

[अमेज़न बेड्रॉक के लिए गार्डरेल्स](https://aws.amazon.com/bedrock/guardrails/) उपयोग मामले विशिष्ट नीतियों के आधार पर उपयोगकर्ता इनपुट और मॉडल प्रतिक्रियाओं का मूल्यांकन करता है, और मूल मॉडल के बावजूद अतिरिक्त सुरक्षा उपाय प्रदान करता है। गार्डरेल्स एंथ्रोपिक क्लॉड, मेटा Llama 2, Cohere Command, AI21 Labs Jurassic और Amazon Titan Text सहित मॉडल्स, साथ ही फाइन-ट्यून किए गए मॉडल्स पर लागू किए जा सकते हैं।
**नोट**: अमेज़न बेड्रॉक के लिए गार्डरेल्स वर्तमान में प्रीव्यू में हैं और सामान्य रूप से उपलब्ध नहीं हैं। इस सुविधा तक पहुंच प्राप्त करने के लिए अपने सामान्य AWS सपोर्ट संपर्कों के माध्यम से संपर्क करें।
इस खंड में, हम एक विशिष्ट गार्डरेल्स के साथ एक बेड्रॉक भाषा मॉडल सेट अप करने जा रहे हैं जिसमें ट्रेसिंग क्षमताएं शामिल हैं।

```python
from typing import Any

from langchain_core.callbacks import AsyncCallbackHandler


class BedrockAsyncCallbackHandler(AsyncCallbackHandler):
    # Async callback handler that can be used to handle callbacks from langchain.

    async def on_llm_error(self, error: BaseException, **kwargs: Any) -> Any:
        reason = kwargs.get("reason")
        if reason == "GUARDRAIL_INTERVENED":
            print(f"Guardrails: {kwargs}")


# Guardrails for Amazon Bedrock with trace
llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="<Model_ID>",
    model_kwargs={},
    guardrails={"id": "<Guardrail_ID>", "version": "<Version>", "trace": True},
    callbacks=[BedrockAsyncCallbackHandler()],
)
```
