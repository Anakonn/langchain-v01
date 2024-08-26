---
translated: true
---

# Predibase

[Predibase](https://predibase.com/) आपको किसी भी ML मॉडल को प्रशिक्षित, फाइन-ट्यून और तैनात करने में सक्षम बनाता है - लिनियर रिग्रेशन से लेकर बड़े भाषा मॉडल तक।

यह उदाहरण Langchain का उपयोग करके Predibase पर तैनात मॉडलों का उपयोग करने का प्रदर्शन करता है

# सेटअप

इस नोटबुक को चलाने के लिए, आपको एक [Predibase खाता](https://predibase.com/free-trial/?utm_source=langchain) और एक [API कुंजी](https://docs.predibase.com/sdk-guide/intro) की आवश्यकता होगी।

आपको Predibase Python पैकेज भी स्थापित करना होगा:

```python
%pip install --upgrade --quiet  predibase
import os

os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"
```

## प्रारंभिक कॉल

```python
from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
)
```

```python
from langchain_community.llms import Predibase

# With a fine-tuned adapter hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
)
```

```python
from langchain_community.llms import Predibase

# With a fine-tuned adapter hosted at HuggingFace (adapter_version does not apply and will be ignored).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
)
```

```python
response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

## श्रृंखला कॉल सेटअप

```python
from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
)
```

```python
# With a fine-tuned adapter hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
)
```

```python
# With a fine-tuned adapter hosted at HuggingFace (adapter_version does not apply and will be ignored).
llm = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
)
```

## SequentialChain

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
# This is an LLMChain to write a synopsis given a title of a play.
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.

Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template)
```

```python
# This is an LLMChain to write a review of a play given a synopsis.
template = """You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.

Play Synopsis:
{synopsis}
Review from a New York Times play critic of the above play:"""
prompt_template = PromptTemplate(input_variables=["synopsis"], template=template)
review_chain = LLMChain(llm=llm, prompt=prompt_template)
```

```python
# This is the overall chain where we run these two chains in sequence.
from langchain.chains import SimpleSequentialChain

overall_chain = SimpleSequentialChain(
    chains=[synopsis_chain, review_chain], verbose=True
)
```

```python
review = overall_chain.run("Tragedy at sunset on the beach")
```

## फाइन-ट्यून LLM (अपने स्वयं के फाइन-ट्यून LLM का उपयोग करें Predibase से)

```python
from langchain_community.llms import Predibase

model = Predibase(
    model="my-base-LLM",
    predibase_api_key=os.environ.get(
        "PREDIBASE_API_TOKEN"
    ),  # Adapter argument is optional.
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="my-finetuned-adapter-id",  # Supports both, Predibase-hosted and HuggingFace-hosted adapter repositories.
    adapter_version=1,  # required for Predibase-hosted adapters (ignored for HuggingFace-hosted adapters)
)
# replace my-base-LLM with the name of your choice of a serverless base model in Predibase
```

```python
# response = model.invoke("Can you help categorize the following emails into positive, negative, and neutral?")
```
