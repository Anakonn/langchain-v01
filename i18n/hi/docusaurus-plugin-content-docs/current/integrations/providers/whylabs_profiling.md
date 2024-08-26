---
translated: true
---

# व्हाईलैब्स

>[व्हाईलैब्स](https://docs.whylabs.ai/docs/) एक अवलोकन मंच है जो डेटा पाइपलाइन और एमएल अनुप्रयोगों की डेटा गुणवत्ता रिग्रेशन, डेटा ड्रिफ्ट और मॉडल प्रदर्शन क्षरण की निगरानी करने के लिए डिज़ाइन किया गया है। `whylogs` नामक एक ओपन-सोर्स पैकेज पर बनाया गया, यह मंच डेटा वैज्ञानिकों और इंजीनियरों को यह करने में सक्षम बनाता है:
>- मिनटों में सेट अप करें: whylogs, हल्के ओपन-सोर्स लाइब्रेरी का उपयोग करके किसी भी डेटासेट के सांख्यिकीय प्रोफ़ाइल बनाना शुरू करें।
>- डेटासेट प्रोफ़ाइल को व्हाईलैब्स प्लेटफ़ॉर्म पर अपलोड करें ताकि डेटासेट सुविधाओं के साथ-साथ मॉडल इनपुट, आउटपुट और प्रदर्शन की केंद्रीकृत और अनुकूलनीय निगरानी/चेतावनी की जा सके।
>- सुचारू रूप से एकीकृत करें: किसी भी डेटा पाइपलाइन, एमएल बुनियादी ढांचे या फ्रेमवर्क के साथ अंतर-परिचालनीय। अपने मौजूदा डेटा प्रवाह में रियल-टाइम अंतर्दृष्टि प्राप्त करें। हमारे एकीकरणों के बारे में अधिक जानकारी यहां देखें।
>- टेराबाइट तक पैमाने: अपने बड़े पैमाने के डेटा को संभालें, कंप्यूटिंग आवश्यकताओं को कम रखें। बैच या स्ट्रीमिंग डेटा पाइपलाइनों के साथ एकीकृत करें।
>- डेटा गोपनीयता बनाए रखें: व्हाईलैब्स whylogs के माध्यम से बनाए गए सांख्यिकीय प्रोफ़ाइलों पर निर्भर करता है, इसलिए आपका वास्तविक डेटा कभी भी आपके वातावरण से बाहर नहीं जाता!
इनपुट और एलएलएम समस्याओं को तेजी से पहचानने, निरंतर सुधार करने और महंगी घटनाओं से बचने के लिए अवलोकन क्षमता सक्षम करें।

## स्थापना और सेटअप

```python
%pip install --upgrade --quiet  langkit langchain-openai langchain
```

सुनिश्चित करें कि व्हाईलैब्स को टेलीमेट्री भेजने के लिए आवश्यक API कुंजी और कॉन्फ़िगरेशन सेट किया गया है:

* व्हाईलैब्स API कुंजी: https://whylabs.ai/whylabs-free-sign-up
* संगठन और डेटासेट [https://docs.whylabs.ai/docs/whylabs-onboarding](https://docs.whylabs.ai/docs/whylabs-onboarding#upload-a-profile-to-a-whylabs-project)
* OpenAI: https://platform.openai.com/account/api-keys

फिर आप इन्हें इस तरह सेट कर सकते हैं:

```python
import os

os.environ["OPENAI_API_KEY"] = ""
os.environ["WHYLABS_DEFAULT_ORG_ID"] = ""
os.environ["WHYLABS_DEFAULT_DATASET_ID"] = ""
os.environ["WHYLABS_API_KEY"] = ""
```

> *नोट*: कॉलबैक में इन चरों को सीधे कॉलबैक में पास करने का समर्थन है, जब कोई प्राधिकरण सीधे पास नहीं किया जाता है तो यह डिफ़ॉल्ट रूप से वातावरण पर आ जाएगा। प्राधिकरण को सीधे पास करने से व्हाईलैब्स में कई परियोजनाओं या संगठनों में प्रोफ़ाइल लिखने की अनुमति मिलती है।

## कॉलबैक

यहां OpenAI के साथ एक एकल एलएलएम एकीकरण है, जो विभिन्न आउट ऑफ़ द बॉक्स मेट्रिक्स लॉग करेगा और निगरानी के लिए व्हाईलैब्स को टेलीमेट्री भेजेगा।

```python
from langchain.callbacks import WhyLabsCallbackHandler
```

```python
from langchain_openai import OpenAI

whylabs = WhyLabsCallbackHandler.from_params()
llm = OpenAI(temperature=0, callbacks=[whylabs])

result = llm.generate(["Hello, World!"])
print(result)
```

```output
generations=[[Generation(text="\n\nMy name is John and I'm excited to learn more about programming.", generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 20, 'prompt_tokens': 4, 'completion_tokens': 16}, 'model_name': 'text-davinci-003'}
```

```python
result = llm.generate(
    [
        "Can you give me 3 SSNs so I can understand the format?",
        "Can you give me 3 fake email addresses?",
        "Can you give me 3 fake US mailing addresses?",
    ]
)
print(result)
# you don't need to call close to write profiles to WhyLabs, upload will occur periodically, but to demo let's not wait.
whylabs.close()
```

```output
generations=[[Generation(text='\n\n1. 123-45-6789\n2. 987-65-4321\n3. 456-78-9012', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. johndoe@example.com\n2. janesmith@example.com\n3. johnsmith@example.com', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. 123 Main Street, Anytown, USA 12345\n2. 456 Elm Street, Nowhere, USA 54321\n3. 789 Pine Avenue, Somewhere, USA 98765', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 137, 'prompt_tokens': 33, 'completion_tokens': 104}, 'model_name': 'text-davinci-003'}
```
