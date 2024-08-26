---
translated: true
---

# Azure ML

[Azure ML](https://azure.microsoft.com/en-us/products/machine-learning/) एक प्लेटफ़ॉर्म है जिसका उपयोग मशीन लर्निंग मॉडल बनाने, प्रशिक्षित करने और तैनात करने के लिए किया जाता है। उपयोगकर्ता मॉडल कैटलॉग में मॉडल के प्रकारों का अन्वेषण कर सकते हैं, जो विभिन्न प्रदाताओं से मूलभूत और सामान्य उद्देश्य मॉडल प्रदान करता है।

यह नोटबुक `Azure ML ऑनलाइन एंडपॉइंट` पर होस्ट किए गए एक एलएलएम का उपयोग करने के बारे में बताता है।

```python
from langchain_community.llms.azureml_endpoint import AzureMLOnlineEndpoint
```

## सेटअप

आपको [Azure ML पर एक मॉडल तैनात करना](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2#deploying-foundation-models-to-endpoints-for-inferencing) या [Azure AI स्टूडियो पर](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-open) और निम्नलिखित पैरामीटर प्राप्त करना होगा:

* `endpoint_url`: एंडपॉइंट द्वारा प्रदान किया गया REST एंडपॉइंट यूआरएल।
* `endpoint_api_type`: **समर्पित एंडपॉइंट** (होस्ट किया गया प्रबंधित बुनियादी ढांचा) पर मॉडल तैनात करते समय `endpoint_type='dedicated'` का उपयोग करें। **पे-ऐज-यू-गो** ऑफ़रिंग (मॉडल के रूप में सेवा) का उपयोग करते समय `endpoint_type='serverless'` का उपयोग करें।
* `endpoint_api_key`: एंडपॉइंट द्वारा प्रदान किया गया API कुंजी।
* `deployment_name`: (वैकल्पिक) एंडपॉइंट का उपयोग करते हुए मॉडल का तैनाती नाम।

## कंटेंट फॉर्मैटर

`content_formatter` पैरामीटर एक हैंडलर क्लास है जो AzureML एंडपॉइंट के अनुरोध और प्रतिक्रिया को आवश्यक स्कीमा के साथ मेल खाने के लिए रूपांतरित करता है। मॉडल कैटलॉग में व्यापक श्रृंखला के मॉडल होने के कारण, प्रत्येक मॉडल डेटा को अलग-अलग प्रक्रिया कर सकता है, इसलिए `ContentFormatterBase` क्लास प्रदान की गई है ताकि उपयोगकर्ता अपनी पसंद के अनुसार डेटा को रूपांतरित कर सकें। निम्नलिखित कंटेंट फॉर्मैटर प्रदान किए गए हैं:

* `GPT2ContentFormatter`: GPT2 के लिए अनुरोध और प्रतिक्रिया डेटा को फॉर्मैट करता है
* `DollyContentFormatter`: Dolly-v2 के लिए अनुरोध और प्रतिक्रिया डेटा को फॉर्मैट करता है
* `HFContentFormatter`: पाठ-जनरेशन Hugging Face मॉडल के लिए अनुरोध और प्रतिक्रिया डेटा को फॉर्मैट करता है
* `CustomOpenAIContentFormatter`: OpenAI API संगत योजना का पालन करने वाले मॉडल जैसे LLaMa2 के लिए अनुरोध और प्रतिक्रिया डेटा को फॉर्मैट करता है।

*नोट: `OSSContentFormatter` को डिप्रीकेट किया जा रहा है और `GPT2ContentFormatter` से प्रतिस्थापित किया जा रहा है। लॉजिक समान है लेकिन `GPT2ContentFormatter` एक अधिक उपयुक्त नाम है। आप अभी भी `OSSContentFormatter` का उपयोग कर सकते हैं क्योंकि परिवर्तन पीछे की ओर संगत हैं।*

## उदाहरण

### उदाहरण: वास्तविक समय के एंडपॉइंट के साथ LlaMa 2 पूर्णता

```python
from langchain_community.llms.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIContentFormatter,
)
from langchain_core.messages import HumanMessage

llm = AzureMLOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/score",
    endpoint_api_type=AzureMLEndpointApiType.dedicated,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIContentFormatter(),
    model_kwargs={"temperature": 0.8, "max_new_tokens": 400},
)
response = llm.invoke("Write me a song about sparkling water:")
response
```

मॉडल पैरामीटर को आमंत्रण के दौरान भी इंगित किया जा सकता है:

```python
response = llm.invoke("Write me a song about sparkling water:", temperature=0.5)
response
```

### उदाहरण: पे-ऐज-यू-गो तैनाती (मॉडल के रूप में सेवा) के साथ चैट पूर्णता

```python
from langchain_community.llms.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIContentFormatter,
)
from langchain_core.messages import HumanMessage

llm = AzureMLOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIContentFormatter(),
    model_kwargs={"temperature": 0.8, "max_new_tokens": 400},
)
response = llm.invoke("Write me a song about sparkling water:")
response
```

### उदाहरण: कस्टम कंटेंट फॉर्मैटर

नीचे Hugging Face से सारांशीकरण मॉडल का उपयोग करने का एक उदाहरण है।

```python
import json
import os
from typing import Dict

from langchain_community.llms.azureml_endpoint import (
    AzureMLOnlineEndpoint,
    ContentFormatterBase,
)


class CustomFormatter(ContentFormatterBase):
    content_type = "application/json"
    accepts = "application/json"

    def format_request_payload(self, prompt: str, model_kwargs: Dict) -> bytes:
        input_str = json.dumps(
            {
                "inputs": [prompt],
                "parameters": model_kwargs,
                "options": {"use_cache": False, "wait_for_model": True},
            }
        )
        return str.encode(input_str)

    def format_response_payload(self, output: bytes) -> str:
        response_json = json.loads(output)
        return response_json[0]["summary_text"]


content_formatter = CustomFormatter()

llm = AzureMLOnlineEndpoint(
    endpoint_api_type="dedicated",
    endpoint_api_key=os.getenv("BART_ENDPOINT_API_KEY"),
    endpoint_url=os.getenv("BART_ENDPOINT_URL"),
    model_kwargs={"temperature": 0.8, "max_new_tokens": 400},
    content_formatter=content_formatter,
)
large_text = """On January 7, 2020, Blockberry Creative announced that HaSeul would not participate in the promotion for Loona's
next album because of mental health concerns. She was said to be diagnosed with "intermittent anxiety symptoms" and would be
taking time to focus on her health.[39] On February 5, 2020, Loona released their second EP titled [#] (read as hash), along
with the title track "So What".[40] Although HaSeul did not appear in the title track, her vocals are featured on three other
songs on the album, including "365". Once peaked at number 1 on the daily Gaon Retail Album Chart,[41] the EP then debuted at
number 2 on the weekly Gaon Album Chart. On March 12, 2020, Loona won their first music show trophy with "So What" on Mnet's
M Countdown.[42]

On October 19, 2020, Loona released their third EP titled [12:00] (read as midnight),[43] accompanied by its first single
"Why Not?". HaSeul was again not involved in the album, out of her own decision to focus on the recovery of her health.[44]
The EP then became their first album to enter the Billboard 200, debuting at number 112.[45] On November 18, Loona released
the music video for "Star", another song on [12:00].[46] Peaking at number 40, "Star" is Loona's first entry on the Billboard
Mainstream Top 40, making them the second K-pop girl group to enter the chart.[47]

On June 1, 2021, Loona announced that they would be having a comeback on June 28, with their fourth EP, [&] (read as and).
[48] The following day, on June 2, a teaser was posted to Loona's official social media accounts showing twelve sets of eyes,
confirming the return of member HaSeul who had been on hiatus since early 2020.[49] On June 12, group members YeoJin, Kim Lip,
Choerry, and Go Won released the song "Yum-Yum" as a collaboration with Cocomong.[50] On September 8, they released another
collaboration song named "Yummy-Yummy".[51] On June 27, 2021, Loona announced at the end of their special clip that they are
making their Japanese debut on September 15 under Universal Music Japan sublabel EMI Records.[52] On August 27, it was announced
that Loona will release the double A-side single, "Hula Hoop / Star Seed" on September 15, with a physical CD release on October
20.[53] In December, Chuu filed an injunction to suspend her exclusive contract with Blockberry Creative.[54][55]
"""
summarized_text = llm.invoke(large_text)
print(summarized_text)
```

### उदाहरण: Dolly with LLMChain

```python
from langchain.chains import LLMChain
from langchain_community.llms.azureml_endpoint import DollyContentFormatter
from langchain_core.prompts import PromptTemplate

formatter_template = "Write a {word_count} word essay about {topic}."

prompt = PromptTemplate(
    input_variables=["word_count", "topic"], template=formatter_template
)

content_formatter = DollyContentFormatter()

llm = AzureMLOnlineEndpoint(
    endpoint_api_key=os.getenv("DOLLY_ENDPOINT_API_KEY"),
    endpoint_url=os.getenv("DOLLY_ENDPOINT_URL"),
    model_kwargs={"temperature": 0.8, "max_tokens": 300},
    content_formatter=content_formatter,
)

chain = LLMChain(llm=llm, prompt=prompt)
print(chain.invoke({"word_count": 100, "topic": "how to make friends"}))
```

## एक एलएलएम सीरियलाइज करना

आप एलएलएम कॉन्फ़िगरेशन को भी सहेज और लोड कर सकते हैं

```python
from langchain_community.llms.loading import load_llm

save_llm = AzureMLOnlineEndpoint(
    deployment_name="databricks-dolly-v2-12b-4",
    model_kwargs={
        "temperature": 0.2,
        "max_tokens": 150,
        "top_p": 0.8,
        "frequency_penalty": 0.32,
        "presence_penalty": 72e-3,
    },
)
save_llm.save("azureml.json")
loaded_llm = load_llm("azureml.json")

print(loaded_llm)
```
