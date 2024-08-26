---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# मॉडल

[मॉडल क्लाउड प्लेटफॉर्म](https://modal.com/docs/guide) आपके स्थानीय कंप्यूटर पर पायथन स्क्रिप्ट से सर्वरलेस क्लाउड कंप्यूट तक सुविधाजनक, ऑन-डिमांड पहुंच प्रदान करता है।
एलएलएम एपीआई पर निर्भर रहने के बजाय अपने खुद के कस्टम एलएलएम मॉडल चलाने के लिए `मॉडल` का उपयोग करें।

यह उदाहरण बताता है कि `मॉडल` HTTPS [वेब एंडपॉइंट](https://modal.com/docs/guide/webhooks) के साथ इंटरैक्ट करने के लिए लैंगचेन का कैसे उपयोग किया जाए।

[_लैंगचेन के साथ प्रश्न-उत्तर_](https://modal.com/docs/guide/ex/potus_speech_qanda) एक और उदाहरण है कि कैसे लैंगचेन का उपयोग `मॉडल` के साथ किया जा सकता है। उस उदाहरण में, मॉडल लैंगचेन एप्लिकेशन को एंड-टू-एंड चलाता है और अपने एलएलएम एपीआई के रूप में OpenAI का उपयोग करता है।

```python
%pip install --upgrade --quiet  modal
```

```python
# Register an account with Modal and get a new token.

!modal token new
```

```output
Launching login page in your browser window...
If this is not showing up, please copy this URL into your web browser manually:
https://modal.com/token-flow/tf-Dzm3Y01234mqmm1234Vcu3
```

[`langchain.llms.modal.Modal`](https://github.com/langchain-ai/langchain/blame/master/langchain/llms/modal.py) एकीकरण क्लास के लिए आवश्यक है कि आप एक मॉडल एप्लिकेशन को तैनात करें जिसमें निम्नलिखित JSON इंटरफ़ेस के अनुरूप एक वेब एंडपॉइंट हो:

1. एलएलएम प्रॉम्प्ट को `"prompt"` कुंजी के तहत एक `str` मान के रूप में स्वीकार किया जाता है
2. एलएलएम प्रतिक्रिया को `"prompt"` कुंजी के तहत एक `str` मान के रूप में वापस किया जाता है

**उदाहरण अनुरोध JSON:**

```json
{
    "prompt": "Identify yourself, bot!",
    "extra": "args are allowed",
}
```

**उदाहरण प्रतिक्रिया JSON:**

```json
{
    "prompt": "This is the LLM speaking",
}
```

इस इंटरफ़ेस को पूरा करने वाले एक उदाहरण 'डमी' मॉडल वेब एंडपॉइंट फ़ंक्शन होगा

```python
...
...

class Request(BaseModel):
    prompt: str

@stub.function()
@modal.web_endpoint(method="POST")
def web(request: Request):
    _ = request  # ignore input
    return {"prompt": "hello world"}
```

* मॉडल के [वेब एंडपॉइंट](https://modal.com/docs/guide/webhooks#passing-arguments-to-web-endpoints) गाइड देखें कि इस इंटरफ़ेस को पूरा करने वाला एक एंडपॉइंट कैसे सेट अप किया जाए।
* मॉडल के ['AutoGPTQ के साथ Falcon-40B चलाएं'](https://modal.com/docs/guide/ex/falcon_gptq) ओपन-सोर्स एलएलएम उदाहरण को अपने कस्टम एलएलएम के लिए एक शुरुआती बिंदु के रूप में देखें!

एक तैनात मॉडल वेब एंडपॉइंट होने के बाद, आप इसका URL को `langchain.llms.modal.Modal` एलएलएम क्लास में पास कर सकते हैं। यह क्लास फिर अपनी श्रृंखला में एक बिल्डिंग ब्लॉक के रूप में कार्य कर सकता है।

```python
from langchain.chains import LLMChain
from langchain_community.llms import Modal
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
endpoint_url = "https://ecorp--custom-llm-endpoint.modal.run"  # REPLACE ME with your deployed Modal web endpoint's URL
llm = Modal(endpoint_url=endpoint_url)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
