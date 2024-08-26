---
translated: true
---

# IBM watsonx.ai

>[WatsonxLLM](https://ibm.github.io/watsonx-ai-python-sdk/fm_extensions.html#langchain) IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai) फाउंडेशन मॉडल्स के लिए एक रैपर है।

यह उदाहरण दिखाता है कि `watsonx.ai` मॉडल्स के साथ `LangChain` का उपयोग करके कैसे संवाद करें।

## सेटअप करना

पैकेज `langchain-ibm` इंस्टॉल करें।

```python
!pip install -qU langchain-ibm
```

यह सेल WML क्रेडेंशियल्स को परिभाषित करता है जो watsonx Foundation Model inferencing के साथ काम करने के लिए आवश्यक हैं।

**क्रिया:** IBM Cloud उपयोगकर्ता API कुंजी प्रदान करें। विवरण के लिए, देखें
[डॉक्युमेंटेशन](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)।

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

अतिरिक्त रूप से आप अतिरिक्त सीक्रेट्स को एक पर्यावरण वेरिएबल के रूप में पास कर सकते हैं।

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## मॉडल लोड करें

आपको विभिन्न मॉडल्स या टास्क के लिए मॉडल `parameters` को समायोजित करने की आवश्यकता हो सकती है। विवरण के लिए, देखें [डॉक्युमेंटेशन](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#metanames.GenTextParamsMetaNames)।

```python
parameters = {
    "decoding_method": "sample",
    "max_new_tokens": 100,
    "min_new_tokens": 1,
    "temperature": 0.5,
    "top_k": 50,
    "top_p": 1,
}
```

पूर्व में सेट किए गए parameters के साथ `WatsonxLLM` क्लास को इनिशियलाइज़ करें।

**नोट**:

- API कॉल के लिए संदर्भ प्रदान करने के लिए, आपको `project_id` या `space_id` जोड़ना होगा। अधिक जानकारी के लिए देखें [डॉक्युमेंटेशन](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects)।
- आपके प्रोविज़न की गई सेवा इंस्टेंस के क्षेत्र के आधार पर, [यहां](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication) वर्णित urls में से एक का उपयोग करें।

इस उदाहरण में, हम `project_id` और डलास url का उपयोग करेंगे।

आपको `model_id` निर्दिष्ट करने की आवश्यकता है जो inferencing के लिए उपयोग किया जाएगा। सभी उपलब्ध मॉडल्स आप [डॉक्युमेंटेशन](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#ibm_watsonx_ai.foundation_models.utils.enums.ModelTypes) में पा सकते हैं।

```python
from langchain_ibm import WatsonxLLM

watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

वैकल्पिक रूप से आप Cloud Pak for Data क्रेडेंशियल्स का उपयोग कर सकते हैं। विवरण के लिए, देखें [डॉक्युमेंटेशन](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)।

```python
watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="4.8",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

`model_id` के बजाय, आप पहले से ट्यून किए गए मॉडल के `deployment_id` को भी पास कर सकते हैं। पूरे मॉडल ट्यूनिंग वर्कफ़्लो का वर्णन [यहां](https://ibm.github.io/watsonx-ai-python-sdk/pt_working_with_class_and_prompt_tuner.html) किया गया है।

```python
watsonx_llm = WatsonxLLM(
    deployment_id="PASTE YOUR DEPLOYMENT_ID HERE",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

## चेन बनाएँ

`PromptTemplate` ऑब्जेक्ट्स बनाएं जो एक रैंडम प्रश्न बनाने के लिए जिम्मेदार होंगे।

```python
from langchain_core.prompts import PromptTemplate

template = "Generate a random question about {topic}: Question: "
prompt = PromptTemplate.from_template(template)
```

एक टॉपिक प्रदान करें और `LLMChain` चलाएं।

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=watsonx_llm)
llm_chain.invoke("dog")
```

```output
{'topic': 'dog', 'text': 'Why do dogs howl?'}
```

## मॉडल को सीधे कॉल करना

समाप्तियों को प्राप्त करने के लिए, आप मॉडल को सीधे एक स्ट्रिंग प्रॉम्प्ट का उपयोग करके कॉल कर सकते हैं।

```python
# Calling a single prompt

watsonx_llm.invoke("Who is man's best friend?")
```

```output
"Man's best friend is his dog. "
```

```python
# Calling multiple prompts

watsonx_llm.generate(
    [
        "The fastest dog in the world?",
        "Describe your chosen dog breed",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='The fastest dog in the world is the greyhound, which can run up to 45 miles per hour. This is about the same speed as a human running down a track. Greyhounds are very fast because they have long legs, a streamlined body, and a strong tail. They can run this fast for short distances, but they can also run for long distances, like a marathon. ', generation_info={'finish_reason': 'eos_token'})], [Generation(text='The Beagle is a scent hound, meaning it is bred to hunt by following a trail of scents.', generation_info={'finish_reason': 'eos_token'})]], llm_output={'token_usage': {'generated_token_count': 106, 'input_token_count': 13}, 'model_id': 'ibm/granite-13b-instruct-v2', 'deployment_id': ''}, run=[RunInfo(run_id=UUID('52cb421d-b63f-4c5f-9b04-d4770c664725')), RunInfo(run_id=UUID('df2ea606-1622-4ed7-8d5d-8f6e068b71c4'))])
```

## मॉडल आउटपुट को स्ट्रीम करना

आप मॉडल आउटपुट को स्ट्रीम कर सकते हैं।

```python
for chunk in watsonx_llm.stream(
    "Describe your favorite breed of dog and why it is your favorite."
):
    print(chunk, end="")
```

```output
My favorite breed of dog is a Labrador Retriever. Labradors are my favorite because they are extremely smart, very friendly, and love to be with people. They are also very playful and love to run around and have a lot of energy.
```
