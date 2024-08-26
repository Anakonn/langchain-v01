---
translated: true
---

# Huggingface Endpoints

>Hugging Face Hub (https://huggingface.co/docs/hub/index) एक ऐसा प्लेटफॉर्म है जहां 120k से अधिक मॉडल, 20k से अधिक डेटासेट और 50k से अधिक डेमो ऐप (Spaces) हैं, जो सभी ओपन सोर्स और सार्वजनिक रूप से उपलब्ध हैं, और एक ऑनलाइन प्लेटफॉर्म है जहां लोग आसानी से एमएल में सहयोग कर सकते हैं और बना सकते हैं।

Hugging Face Hub विभिन्न एंडपॉइंट्स भी प्रदान करता है ताकि एमएल अनुप्रयोग बनाए जा सकें।
यह उदाहरण विभिन्न एंडपॉइंट प्रकारों से कनेक्ट करने का प्रदर्शन करता है।

विशेष रूप से, पाठ उत्पादन अनुमान [Text Generation Inference](https://github.com/huggingface/text-generation-inference) द्वारा संचालित है: एक कस्टम-निर्मित रस्ट, पायथन और gRPC सर्वर जो तेज़ पाठ उत्पादन अनुमान प्रदान करता है।

```python
from langchain_community.llms import HuggingFaceEndpoint
```

## स्थापना और सेटअप

उपयोग करने के लिए, आपके पास ``huggingface_hub`` पायथन [पैकेज इंस्टॉल](https://huggingface.co/docs/huggingface_hub/installation) होना चाहिए।

```python
%pip install --upgrade --quiet huggingface_hub
```

```python
# get a token: https://huggingface.co/docs/api-inference/quicktour#get-your-api-token

from getpass import getpass

HUGGINGFACEHUB_API_TOKEN = getpass()
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = HUGGINGFACEHUB_API_TOKEN
```

## उदाहरण तैयार करें

```python
from langchain_community.llms import HuggingFaceEndpoint
```

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
question = "Who won the FIFA World Cup in the year 1994? "

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## उदाहरण

यहां एक उदाहरण है कि आप कैसे [Serverless Endpoints](https://huggingface.co/inference-endpoints/serverless) के मुफ्त एपीआई का HuggingFaceEndpoint एकीकरण का उपयोग कर सकते हैं।

```python
repo_id = "mistralai/Mistral-7B-Instruct-v0.2"

llm = HuggingFaceEndpoint(
    repo_id=repo_id, max_length=128, temperature=0.5, token=HUGGINGFACEHUB_API_TOKEN
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
print(llm_chain.run(question))
```

## समर्पित एंडपॉइंट

मुफ्त सर्वरलेस एपीआई आपको समाधान लागू करने और जल्दी से इटरेट करने देता है, लेकिन भारी उपयोग मामलों के लिए यह दर-सीमित हो सकता है, क्योंकि लोड अन्य अनुरोधों के साथ साझा किया जाता है।

उद्यम कार्यभार के लिए, सर्वश्रेष्ठ है [Inference Endpoints - Dedicated](https://huggingface.co/inference-endpoints/dedicated) का उपयोग करना।
यह पूरी तरह से प्रबंधित बुनियादी ढांचे तक पहुंच प्रदान करता है जो अधिक लचीलापन और गति प्रदान करता है। ये संसाधन निरंतर समर्थन और अपटाइम गारंटी के साथ आते हैं, साथ ही ऑटोस्केलिंग जैसे विकल्प भी हैं।

```python
# Set the url to your Inference Endpoint below
your_endpoint_url = "https://fayjubiy2xqn36z0.us-east-1.aws.endpoints.huggingface.cloud"
```

```python
llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
)
llm("What did foo say about bar?")
```

### स्ट्रीमिंग

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import HuggingFaceEndpoint

llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
    streaming=True,
)
llm("What did foo say about bar?", callbacks=[StreamingStdOutCallbackHandler()])
```
