---
translated: true
---

# लेबल स्टूडियो

>[लेबल स्टूडियो](https://labelstud.io/guide/get_started) एक ओपन-सोर्स डेटा लेबलिंग प्लेटफॉर्म है जो LangChain को बड़े भाषा मॉडलों (LLM) के लिए डेटा को फाइन-ट्यून करने में लचीलापन प्रदान करता है। यह कस्टम प्रशिक्षण डेटा तैयार करने और मानव प्रतिक्रिया के माध्यम से प्रतिक्रियाओं को एकत्रित और मूल्यांकन करने में भी सक्षम है।

इस गाइड में, आप जानेंगे कि कैसे एक LangChain पाइपलाइन को `लेबल स्टूडियो` से कनेक्ट करें:

- सभी इनपुट प्रॉम्प्ट, वार्तालाप और प्रतिक्रियाओं को एक `लेबल स्टूडियो` प्रोजेक्ट में एकत्रित करें। यह सभी डेटा को आसान लेबलिंग और विश्लेषण के लिए एक जगह पर एकत्रित करता है।
- प्रॉम्प्ट और प्रतिक्रियाओं को रिफाइन करें और पर्यवेक्षित फाइन-ट्यूनिंग (SFT) और मानव प्रतिक्रिया के साथ पुनर्बलन सीखने (RLHF) के लिए एक डेटासेट बनाएं। लेबल किया गया डेटा का उपयोग LLM के प्रदर्शन को बेहतर बनाने के लिए उसे और प्रशिक्षित करने के लिए किया जा सकता है।
- मानव प्रतिक्रिया के माध्यम से मॉडल प्रतिक्रियाओं का मूल्यांकन करें। `लेबल स्टूडियो` मॉडल प्रतिक्रियाओं की समीक्षा और प्रतिक्रिया प्रदान करने के लिए एक इंटरफ़ेस प्रदान करता है, जिससे मूल्यांकन और पुनरावृत्ति की अनुमति मिलती है।

## स्थापना और सेटअप

सबसे पहले नवीनतम संस्करण के लेबल स्टूडियो और लेबल स्टूडियो API क्लाइंट को स्थापित करें:

```python
%pip install --upgrade --quiet langchain label-studio label-studio-sdk langchain-openai
```

अब, `label-studio` को कमांड लाइन पर चलाएं ताकि `http://localhost:8080` पर स्थानीय LabelStudio इंस्टेंस शुरू हो जाए। अधिक विकल्पों के लिए [लेबल स्टूडियो स्थापना गाइड](https://labelstud.io/guide/install) देखें।

आपको API कॉल करने के लिए एक टोकन की आवश्यकता होगी।

अपने LabelStudio इंस्टेंस को अपने ब्राउज़र में खोलें, `Account & Settings > Access Token` पर जाएं और कुंजी कॉपी करें।

अपने LabelStudio URL, API कुंजी और OpenAI API कुंजी के साथ पर्यावरण चर सेट करें:

```python
import os

os.environ["LABEL_STUDIO_URL"] = "<YOUR-LABEL-STUDIO-URL>"  # e.g. http://localhost:8080
os.environ["LABEL_STUDIO_API_KEY"] = "<YOUR-LABEL-STUDIO-API-KEY>"
os.environ["OPENAI_API_KEY"] = "<YOUR-OPENAI-API-KEY>"
```

## LLMs प्रॉम्प्ट और प्रतिक्रियाओं का संग्रह

लेबलिंग के लिए उपयोग किया जाने वाला डेटा लेबल स्टूडियो में प्रोजेक्ट्स में संग्रहीत किया जाता है। प्रत्येक प्रोजेक्ट को एक XML कॉन्फ़िगरेशन द्वारा पहचाना जाता है जो इनपुट और आउटपुट डेटा के लिए विनिर्देशों का ब्यौरा देता है।

एक ऐसा प्रोजेक्ट बनाएं जो पाठ प्रारूप में मानव इनपुट लेता है और एक पाठ क्षेत्र में संपादन योग्य LLM प्रतिक्रिया उत्पन्न करता है:

```xml
<View>
<Style>
    .prompt-box {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
    }
</Style>
<View className="root">
    <View className="prompt-box">
        <Text name="prompt" value="$prompt"/>
    </View>
    <TextArea name="response" toName="prompt"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="prompt"/>
</View>
```

1. लेबल स्टूडियो में प्रोजेक्ट बनाने के लिए "Create" बटन पर क्लिक करें।
2. "Project Name" फ़ील्ड में अपने प्रोजेक्ट का नाम दर्ज करें, जैसे `My Project`।
3. `Labeling Setup > Custom Template` पर नेविगेट करें और ऊपर दिए गए XML कॉन्फ़िगरेशन को पेस्ट करें।

आप `LabelStudioCallbackHandler` के माध्यम से एक LabelStudio प्रोजेक्ट में इनपुट LLM प्रॉम्प्ट और आउटपुट प्रतिक्रियाएं एकत्रित कर सकते हैं:

```python
from langchain_community.callbacks.labelstudio_callback import (
    LabelStudioCallbackHandler,
)
```

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0, callbacks=[LabelStudioCallbackHandler(project_name="My Project")]
)
print(llm.invoke("Tell me a joke"))
```

लेबल स्टूडियो में, `My Project` खोलें। आप प्रॉम्प्ट, प्रतिक्रियाएं और मॉडल नाम जैसे मेटाडेटा देखेंगे।

## चैट मॉडल संवादों का संग्रह

आप पूरे चैट संवादों को LabelStudio में ट्रैक और प्रदर्शित कर सकते हैं, और अंतिम प्रतिक्रिया को रेट और संशोधित कर सकते हैं:

1. लेबल स्टूडियो खोलें और "Create" बटन पर क्लिक करें।
2. "Project Name" फ़ील्ड में अपने प्रोजेक्ट का नाम दर्ज करें, जैसे `New Project with Chat`।
3. Labeling Setup > Custom Template पर नेविगेट करें और निम्नलिखित XML कॉन्फ़िगरेशन को पेस्ट करें:

```xml
<View>
<View className="root">
     <Paragraphs name="dialogue"
               value="$prompt"
               layout="dialogue"
               textKey="content"
               nameKey="role"
               granularity="sentence"/>
  <Header value="Final response:"/>
    <TextArea name="response" toName="dialogue"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="dialogue"/>
</View>
```

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    callbacks=[
        LabelStudioCallbackHandler(
            mode="chat",
            project_name="New Project with Chat",
        )
    ]
)
llm_results = chat_llm.invoke(
    [
        SystemMessage(content="Always use a lot of emojis"),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

लेबल स्टूडियो में, "New Project with Chat" खोलें। किसी भी बनाए गए कार्य पर क्लिक करें ताकि संवाद इतिहास देखा जा सके और प्रतिक्रियाओं को संपादित/नोट किया जा सके।

## कस्टम लेबलिंग कॉन्फ़िगरेशन

आप LabelStudio में डिफ़ॉल्ट लेबलिंग कॉन्फ़िगरेशन को प्रतिक्रिया भाव, प्रासंगिकता और [अन्य प्रकार के एनोटेटर की प्रतिक्रिया](https://labelstud.io/tags/) जैसे अतिरिक्त लक्ष्य लेबल जोड़कर संशोधित कर सकते हैं।

नई लेबलिंग कॉन्फ़िगरेशन को UI से जोड़ा जा सकता है: `Settings > Labeling Interface` पर जाएं और `Choices` के लिए भाव या `Rating` के लिए प्रासंगिकता जैसे अतिरिक्त टैग के साथ एक कस्टम कॉन्फ़िगरेशन सेट करें। याद रखें कि किसी भी कॉन्फ़िगरेशन में [`TextArea` टैग](https://labelstud.io/tags/textarea) को प्रस्तुत किया जाना चाहिए ताकि LLM प्रतिक्रियाएं प्रदर्शित हो सकें।

वैकल्पिक रूप से, आप प्रोजेक्ट सृजन से पहले लेबलिंग कॉन्फ़िगरेशन को निर्दिष्ट कर सकते हैं:

```python
ls = LabelStudioCallbackHandler(
    project_config="""
<View>
<Text name="prompt" value="$prompt"/>
<TextArea name="response" toName="prompt"/>
<TextArea name="user_feedback" toName="prompt"/>
<Rating name="rating" toName="prompt"/>
<Choices name="sentiment" toName="prompt">
    <Choice value="Positive"/>
    <Choice value="Negative"/>
</Choices>
</View>
"""
)
```

ध्यान रखें कि यदि प्रोजेक्ट मौजूद नहीं है, तो निर्दिष्ट लेबलिंग कॉन्फ़िगरेशन के साथ एक नया प्रोजेक्ट बनाया जाएगा।

## अन्य पैरामीटर

`LabelStudioCallbackHandler` कई वैकल्पिक पैरामीटर स्वीकार करता है:

- **api_key** - लेबल स्टूडियो API कुंजी। पर्यावरण चर `LABEL_STUDIO_API_KEY` को ओवरराइड करता है।
- **url** - लेबल स्टूडियो URL। `LABEL_STUDIO_URL` को ओवरराइड करता है, डिफ़ॉल्ट `http://localhost:8080`।
- **project_id** - मौजूदा लेबल स्टूडियो प्रोजेक्ट ID। `LABEL_STUDIO_PROJECT_ID` को ओवरराइड करता है। इस प्रोजेक्ट में डेटा संग्रहीत करता है।
- **project_name** - प्रोजेक्ट ID निर्दिष्ट नहीं होने पर प्रोजेक्ट का नाम। एक नया प्रोजेक्ट बनाता है। डिफ़ॉल्ट `"LangChain-%Y-%m-%d"` है जो वर्तमान तिथि के साथ प्रारूपित है।
- **project_config** - [कस्टम लेबलिंग कॉन्फ़िगरेशन](#custom-labeling-configuration)
- **mode**: लक्ष्य कॉन्फ़िगरेशन को स्क्रैच से बनाने के लिए इस शॉर्टकट का उपयोग करें:
   - `"prompt"` - एकल प्रॉम्प्ट, एकल प्रतिक्रिया। डिफ़ॉल्ट।
   - `"chat"` - बहु-दौर चैट मोड।
