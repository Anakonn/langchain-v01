---
sidebar_label: कोंको
translated: true
---

# चैटकोंको

# कोंको

>[कोंको](https://www.konko.ai/) API एक पूरी तरह से प्रबंधित वेब API है जो एप्लिकेशन डेवलपर्स को मदद करने के लिए डिज़ाइन किया गया है:

1. अपने एप्लिकेशन के लिए सही ओपन सोर्स या प्रोप्राइटरी एलएलएम का **चयन** करें
2. अग्रणी एप्लिकेशन फ्रेमवर्क और पूरी तरह से प्रबंधित एपीआई के साथ एकीकरण के साथ **बनाएं** एप्लिकेशन तेजी से
3. उद्योग में अग्रणी प्रदर्शन प्राप्त करने के लिए छोटे ओपन-सोर्स एलएलएम को **फाइन ट्यून** करें, लागत का एक छोटा हिस्सा
4. सुरक्षा, गोपनीयता, थ्रूपुट और लेटेंसी एसएलए को पूरा करने वाले उत्पादन-स्केल एपीआई को **तैनात करें** जो कि कोंको एआई के एसओसी 2 अनुपालन, बहु-क्लाउड बुनियादी ढांचे का उपयोग करके बिना बुनियादी ढांचा सेटअप या प्रशासन के

यह उदाहरण `कोंको` चैटकम्पलीशन [मॉडल](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-chatcompletion) के साथ एलैंगचेन का उपयोग करने के बारे में बताता है

इस नोटबुक को चलाने के लिए, आपको कोंको एपीआई कुंजी की आवश्यकता होगी। [एपीआई कुंजी बनाने](https://platform.konko.ai/settings/api-keys) के लिए हमारे वेब ऐप में साइन इन करें ताकि आप मॉडल तक पहुंच सकें

```python
from langchain_community.chat_models import ChatKonko
from langchain_core.messages import HumanMessage, SystemMessage
```

#### वातावरण चर सेट करें

1. आप निम्नलिखित के लिए वातावरण चर सेट कर सकते हैं:
   1. KONKO_API_KEY (आवश्यक)
   2. OPENAI_API_KEY (वैकल्पिक)
2. अपने वर्तमान शेल सत्र में, निर्यात कमांड का उपयोग करें:

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## एक मॉडल को कॉल करना

[कोंको अवलोकन पृष्ठ](https://docs.konko.ai/docs/list-of-models) पर एक मॉडल खोजें

कोंको इंस्टेंस पर चल रहे मॉडलों की सूची खोजने का एक और तरीका यह [एंडपॉइंट](https://docs.konko.ai/reference/get-models) है।

यहां से, हम अपने मॉडल को प्रारंभ कर सकते हैं:

```python
chat = ChatKonko(max_tokens=400, model="meta-llama/llama-2-13b-chat")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Explain Big Bang Theory briefly"),
]
chat(messages)
```

```output
AIMessage(content="  Sure thing! The Big Bang Theory is a scientific theory that explains the origins of the universe. In short, it suggests that the universe began as an infinitely hot and dense point around 13.8 billion years ago and expanded rapidly. This expansion continues to this day, and it's what makes the universe look the way it does.\n\nHere's a brief overview of the key points:\n\n1. The universe started as a singularity, a point of infinite density and temperature.\n2. The singularity expanded rapidly, causing the universe to cool and expand.\n3. As the universe expanded, particles began to form, including protons, neutrons, and electrons.\n4. These particles eventually came together to form atoms, and later, stars and galaxies.\n5. The universe is still expanding today, and the rate of this expansion is accelerating.\n\nThat's the Big Bang Theory in a nutshell! It's a pretty mind-blowing idea when you think about it, and it's supported by a lot of scientific evidence. Do you have any other questions about it?")
```
