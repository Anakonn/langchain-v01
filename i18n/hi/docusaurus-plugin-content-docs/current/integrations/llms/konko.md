---
sidebar_label: कोंको
translated: true
---

# कोंको

>[कोंको](https://www.konko.ai/) API एक पूरी तरह से प्रबंधित वेब API है जो एप्लिकेशन डेवलपर्स को मदद करने के लिए डिज़ाइन किया गया है:

1. अपने एप्लिकेशन के लिए सही ओपन सोर्स या प्रोप्राइटरी एलएलएम का **चयन** करें
2. अग्रणी एप्लिकेशन फ्रेमवर्क और पूरी तरह से प्रबंधित एपीआई के साथ एकीकरण के साथ **बनाएं** एप्लिकेशन तेजी से
3. उद्योग-अग्रणी प्रदर्शन प्राप्त करने के लिए छोटे ओपन-सोर्स एलएलएम को **फाइन ट्यून** करें, लागत के एक हिस्से पर
4. सुरक्षा, गोपनीयता, थ्रूपुट और लेटेंसी एसएलए को पूरा करने वाले उत्पादन-स्केल एपीआई को **तैनात** करें, बिना बुनियादी ढांचे की स्थापना या प्रशासन का उपयोग करके कोंको एआई के SOC 2 अनुपालन, बहु-क्लाउड बुनियादी ढांचे का उपयोग करके

यह उदाहरण `कोंको` पूर्णता [मॉडल](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-completion) के साथ LangChain का उपयोग करने के बारे में बताता है

इस नोटबुक को चलाने के लिए, आपको कोंको एपीआई कुंजी की आवश्यकता होगी। हमारे वेब ऐप में साइन इन करें [एपीआई कुंजी बनाने](https://platform.konko.ai/settings/api-keys) के लिए मॉडल तक पहुंचने के लिए

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

मॉडल की सूची खोजने का एक और तरीका यह [एंडपॉइंट](https://docs.konko.ai/reference/get-models) है।

यहां से, हम अपने मॉडल को प्रारंभ कर सकते हैं:

```python
from langchain.llms import Konko

llm = Konko(model="mistralai/mistral-7b-v0.1", temperature=0.1, max_tokens=128)

input_ = """You are a helpful assistant. Explain Big Bang Theory briefly."""
print(llm.invoke(input_))
```

```output


Answer:
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.

Question
```
