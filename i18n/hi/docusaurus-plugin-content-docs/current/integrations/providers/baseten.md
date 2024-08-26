---
translated: true
---

# बेसेटेन

>[बेसेटेन](https://baseten.co) एक ऐसा प्रदाता है जो आपको मशीन लर्निंग मॉडल को प्रदर्शित और सेवा देने के लिए आवश्यक सभी बुनियादी ढांचे प्रदान करता है।

>एक मॉडल अनुमान प्लेटफॉर्म के रूप में, `बेसेटेन` LangChain पारिस्थितिकी तंत्र में एक `प्रदाता` है।
`बेसेटेन` एकीकरण वर्तमान में एक `घटक`, LLMs को लागू करता है, लेकिन अधिक योजना बनाई जा रही है!

>`बेसेटेन` आपको न केवल Llama 2 या Mistral जैसे ओपन सोर्स मॉडल चलाने देता है, बल्कि समर्पित GPU पर अपने स्वयं के या अनुकूलित मॉडल भी चलाने देता है। यदि आप OpenAI जैसे किसी प्रदाता से परिचित हैं, तो बेसेटेन का उपयोग करने में कुछ अंतर हैं:

>* प्रति टोकन के बजाय, आप प्रति मिनट GPU उपयोग के लिए भुगतान करते हैं।
>* बेसेटेन पर प्रत्येक मॉडल अधिकतम अनुकूलनीयता के लिए हमारे ओपन-सोर्स मॉडल पैकेजिंग फ्रेमवर्क [Truss](https://truss.baseten.co/welcome) का उपयोग करता है।
>* हमारे पास कुछ [OpenAI ChatCompletions-संगत मॉडल](https://docs.baseten.co/api-reference/openai) हैं, लेकिन आप `Truss` के साथ अपना स्वयं का I/O विनिर्देश परिभाषित कर सकते हैं।

>[मॉडल आईडी और तैनाती के बारे में अधिक जानें](https://docs.baseten.co/deploy/lifecycle)।

>बेसेटेन के बारे में अधिक जानकारी के लिए [बेसेटेन दस्तावेज़](https://docs.baseten.co/) देखें।

## स्थापना और सेटअप

LangChain के साथ बेसेटेन मॉडल का उपयोग करने के लिए आपको दो चीजों की आवश्यकता होगी:

- एक [बेसेटेन खाता](https://baseten.co)
- एक [API कुंजी](https://docs.baseten.co/observability/api-keys)

अपनी API कुंजी को `BASETEN_API_KEY` नामक एक पर्यावरण चर के रूप में निर्यात करें।

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

## LLMs

[उपयोग उदाहरण](/docs/integrations/llms/baseten) देखें।

```python
<!--IMPORTS:[{"imported": "Baseten", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.baseten.Baseten.html", "title": "Baseten"}]-->
from langchain_community.llms import Baseten
```
