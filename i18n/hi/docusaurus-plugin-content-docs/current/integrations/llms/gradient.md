---
translated: true
---

# ग्रेडिएंट

`ग्रेडिएंट` एक सरल वेब API के साथ LLM को फाइन-ट्यून और पूर्णता प्राप्त करने की अनुमति देता है।

यह नोटबुक [ग्रेडिएंट](https://gradient.ai/) के साथ Langchain का उपयोग करने के बारे में बताता है।

## आयात

```python
from langchain.chains import LLMChain
from langchain_community.llms import GradientLLM
from langchain_core.prompts import PromptTemplate
```

## वातावरण API कुंजी सेट करें

सुनिश्चित करें कि आप अपनी API कुंजी ग्रेडिएंट AI से प्राप्त करें। आपको विभिन्न मॉडल को परीक्षण और फाइन-ट्यून करने के लिए $10 मुक्त क्रेडिट दिए जाते हैं।

```python
import os
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
```

वैकल्पिक: वर्तमान में तैनात मॉडल प्राप्त करने के लिए `gradientai` Python पैकेज का उपयोग करके `GRADIENT_ACCESS_TOKEN` और `GRADIENT_WORKSPACE_ID` वातावरण चर को सत्यापित करें।

```python
%pip install --upgrade --quiet  gradientai
```

```output
Requirement already satisfied: gradientai in /home/michi/.venv/lib/python3.10/site-packages (1.0.0)
Requirement already satisfied: aenum>=3.1.11 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (3.1.15)
Requirement already satisfied: pydantic<2.0.0,>=1.10.5 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (1.10.12)
Requirement already satisfied: python-dateutil>=2.8.2 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (2.8.2)
Requirement already satisfied: urllib3>=1.25.3 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (1.26.16)
Requirement already satisfied: typing-extensions>=4.2.0 in /home/michi/.venv/lib/python3.10/site-packages (from pydantic<2.0.0,>=1.10.5->gradientai) (4.5.0)
Requirement already satisfied: six>=1.5 in /home/michi/.venv/lib/python3.10/site-packages (from python-dateutil>=2.8.2->gradientai) (1.16.0)
```

```python
import gradientai

client = gradientai.Gradient()

models = client.list_models(only_base=True)
for model in models:
    print(model.id)
```

```output
99148c6d-c2a0-4fbe-a4a7-e7c05bdb8a09_base_ml_model
f0b97d96-51a8-4040-8b22-7940ee1fa24e_base_ml_model
cc2dafce-9e6e-4a23-a918-cad6ba89e42e_base_ml_model
```

```python
new_model = models[-1].create_model_adapter(name="my_model_adapter")
new_model.id, new_model.name
```

```output
('674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter', 'my_model_adapter')
```

## ग्रेडिएंट इंस्टेंस बनाएं

आप मॉडल, max_tokens उत्पन्न, तापमान आदि जैसे विभिन्न पैरामीटर निर्दिष्ट कर सकते हैं।

जैसा कि हम बाद में अपने मॉडल को फाइन-ट्यून करना चाहते हैं, हम `674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter` आईडी के साथ model_adapter का चयन करते हैं, लेकिन आप किसी भी आधार या फाइन-ट्यूनेबल मॉडल का उपयोग कर सकते हैं।

```python
llm = GradientLLM(
    # `ID` listed in `$ gradient model list`
    model="674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter",
    # # optional: set new credentials, they default to environment variables
    # gradient_workspace_id=os.environ["GRADIENT_WORKSPACE_ID"],
    # gradient_access_token=os.environ["GRADIENT_ACCESS_TOKEN"],
    model_kwargs=dict(max_generated_token_count=128),
)
```

## एक प्रॉम्प्ट टेम्प्लेट बनाएं

हम प्रश्न और उत्तर के लिए एक प्रॉम्प्ट टेम्प्लेट बनाएंगे।

```python
template = """Question: {question}

Answer: """

prompt = PromptTemplate.from_template(template)
```

## LLMChain प्रारंभ करें

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## LLMChain चलाएं

एक प्रश्न प्रदान करें और LLMChain चलाएं।

```python
question = "What NFL team won the Super Bowl in 1994?"

llm_chain.run(question=question)
```

```output
'\nThe San Francisco 49ers won the Super Bowl in 1994.'
```

# फाइन-ट्यूनिंग द्वारा परिणामों को बेहतर बनाएं (वैकल्पिक)

अच्छा - यह गलत है - San Francisco 49ers ने नहीं जीता।
प्रश्न का सही उत्तर `Dallas Cowboys!` होगा।

PromptTemplate का उपयोग करके सही उत्तर के लिए ओड्स को बढ़ाने के लिए, चलो फाइन-ट्यून करते हैं।

```python
dataset = [
    {
        "inputs": template.format(question="What NFL team won the Super Bowl in 1994?")
        + " The Dallas Cowboys!"
    }
]
dataset
```

```output
[{'inputs': 'Question: What NFL team won the Super Bowl in 1994?\n\nAnswer:  The Dallas Cowboys!'}]
```

```python
new_model.fine_tune(samples=dataset)
```

```output
FineTuneResponse(number_of_trainable_tokens=27, sum_loss=78.17996)
```

```python
# we can keep the llm_chain, as the registered model just got refreshed on the gradient.ai servers.
llm_chain.run(question=question)
```

```output
'The Dallas Cowboys'
```
