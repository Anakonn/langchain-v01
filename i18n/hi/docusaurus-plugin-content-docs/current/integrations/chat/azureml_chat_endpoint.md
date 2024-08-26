---
sidebar_label: Azure ML Endpoint
translated: true
---

# AzureMLChatOnlineEndpoint

>[Azure Machine Learning](https://azure.microsoft.com/en-us/products/machine-learning/) एक प्लेटफ़ॉर्म है जिसका उपयोग मशीन लर्निंग मॉडल बनाने, प्रशिक्षित करने और तैनात करने के लिए किया जाता है। उपयोगकर्ता मॉडल कैटलॉग में मॉडल के प्रकारों का अन्वेषण कर सकते हैं, जो विभिन्न प्रदाताओं से मूलभूत और सामान्य उद्देश्य मॉडल प्रदान करता है।
>
>सामान्य रूप से, आप मॉडल की भविष्यवाणियों (अनुमान) का उपभोग करने के लिए मॉडल को तैनात करने की आवश्यकता होती है। `Azure Machine Learning` में, [ऑनलाइन एंडपॉइंट](https://learn.microsoft.com/en-us/azure/machine-learning/concept-endpoints) का उपयोग इन मॉडल को रियल-टाइम सर्विंग के साथ तैनात करने के लिए किया जाता है। वे `एंडपॉइंट` और `डिप्लॉयमेंट` के विचारों पर आधारित हैं जो आपको अपने उत्पादन कार्यभार के इंटरफ़ेस को उस कार्यान्वयन से अलग करने की अनुमति देते हैं जो इसे प्रदान करता है।

यह नोटबुक `Azure Machine Learning एंडपॉइंट` पर होस्ट किए गए चैट मॉडल का उपयोग करने के बारे में बताता है।

```python
from langchain_community.chat_models.azureml_endpoint import AzureMLChatOnlineEndpoint
```

## सेटअप

आपको `Azure ML` पर [एक मॉडल तैनात करना](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2#deploying-foundation-models-to-endpoints-for-inferencing) या [Azure AI स्टूडियो पर](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-open) और निम्नलिखित पैरामीटर प्राप्त करना होगा:

* `endpoint_url`: एंडपॉइंट द्वारा प्रदान किया गया REST एंडपॉइंट यूआरएल।
* `endpoint_api_type`: **समर्पित एंडपॉइंट** (होस्ट किया गया प्रबंधित बुनियादी ढांचा) पर मॉडल तैनात करते समय `endpoint_type='dedicated'` का उपयोग करें। **पे-ऐज-यू-गो** ऑफ़रिंग (मॉडल के रूप में सेवा) पर मॉडल तैनात करते समय `endpoint_type='serverless'` का उपयोग करें।
* `endpoint_api_key`: एंडपॉइंट द्वारा प्रदान किया गया API कुंजी

## कंटेंट फॉर्मैटर

`content_formatter` पैरामीटर एक हैंडलर क्लास है जो AzureML एंडपॉइंट के अनुरोध और प्रतिक्रिया को आवश्यक स्कीमा के साथ मेल खाने के लिए रूपांतरित करता है। चूंकि मॉडल कैटलॉग में एक विस्तृत श्रृंखला के मॉडल हैं, जिनमें से प्रत्येक डेटा को अलग-अलग प्रक्रिया कर सकता है, इसलिए `ContentFormatterBase` क्लास प्रदान की गई है ताकि उपयोगकर्ता अपनी पसंद के अनुसार डेटा को रूपांतरित कर सकें। निम्नलिखित कंटेंट फॉर्मैटर प्रदान किए गए हैं:

* `CustomOpenAIChatContentFormatter`: LLaMa2-chat जैसे मॉडलों के लिए अनुरोध और प्रतिक्रिया डेटा को OpenAI API विनिर्देश के अनुसार प्रारूपित करता है।

*नोट: `langchain.chat_models.azureml_endpoint.LlamaChatContentFormatter` को डिप्रीकेट किया जा रहा है और `langchain.chat_models.azureml_endpoint.CustomOpenAIChatContentFormatter` से प्रतिस्थापित किया जा रहा है।*

आप `langchain_community.llms.azureml_endpoint.ContentFormatterBase` क्लास से व्युत्पन्न कर अपने मॉडल के लिए कस्टम कंटेंट फॉर्मैटर लागू कर सकते हैं।

## उदाहरण

निम्नलिखित खंड में इस क्लास का उपयोग करने के बारे में उदाहरण शामिल हैं:

### उदाहरण: रियल-टाइम एंडपॉइंट के साथ चैट पूर्णता

```python
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIChatContentFormatter,
)
from langchain_core.messages import HumanMessage

chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/score",
    endpoint_api_type=AzureMLEndpointApiType.dedicated,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter(),
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

```output
AIMessage(content='  The Collatz Conjecture is one of the most famous unsolved problems in mathematics, and it has been the subject of much study and research for many years. While it is impossible to predict with certainty whether the conjecture will ever be solved, there are several reasons why it is considered a challenging and important problem:\n\n1. Simple yet elusive: The Collatz Conjecture is a deceptively simple statement that has proven to be extraordinarily difficult to prove or disprove. Despite its simplicity, the conjecture has eluded some of the brightest minds in mathematics, and it remains one of the most famous open problems in the field.\n2. Wide-ranging implications: The Collatz Conjecture has far-reaching implications for many areas of mathematics, including number theory, algebra, and analysis. A solution to the conjecture could have significant impacts on these fields and potentially lead to new insights and discoveries.\n3. Computational evidence: While the conjecture remains unproven, extensive computational evidence supports its validity. In fact, no counterexample to the conjecture has been found for any starting value up to 2^64 (a number', additional_kwargs={}, example=False)
```

### उदाहरण: पे-ऐज-यू-गो डिप्लॉयमेंट (मॉडल के रूप में सेवा) के साथ चैट पूर्णता

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

यदि आपको मॉडल को अतिरिक्त पैरामीटर पास करने की आवश्यकता है, तो `model_kwargs` तर्क का उपयोग करें:

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
    model_kwargs={"temperature": 0.8},
)
```

पैरामीटर को आमंत्रण के दौरान भी पास किया जा सकता है:

```python
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")],
    max_tokens=512,
)
response
```
