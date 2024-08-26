---
translated: true
---

# रे सर्व

[रे सर्व](https://docs.ray.io/en/latest/serve/index.html) एक स्केलेबल मॉडल सर्विंग लाइब्रेरी है जो ऑनलाइन अनुमान एपीआई बनाने के लिए उपयोगी है। सर्व विशेष रूप से सिस्टम संयोजन के लिए उपयुक्त है, जिससे आप पायथन कोड में एक जटिल अनुमान सेवा बना सकते हैं जिसमें कई श्रृंखला और व्यावसायिक तर्क शामिल हैं।

## इस नोटबुक का लक्ष्य

यह नोटबुक OpenAI श्रृंखला को उत्पादन में तैनात करने का एक सरल उदाहरण दिखाता है। आप इसे अपने स्वयं के होस्ट किए गए मॉडल को तैनात करने के लिए विस्तारित कर सकते हैं, जहां आप अपने मॉडल को उत्पादन में कुशलतापूर्वक चलाने के लिए आवश्यक हार्डवेयर संसाधनों (जीपीयू और सीपीयू) को आसानी से परिभाषित कर सकते हैं। रे सर्व [दस्तावेज़](https://docs.ray.io/en/latest/serve/getting_started.html) में उपलब्ध विकल्पों के बारे में और अधिक पढ़ें, जिसमें ऑटोस्केलिंग भी शामिल है।

## रे सर्व सेटअप करें

`pip install ray[serve]` के साथ रे इंस्टॉल करें।

## सामान्य स्केलेटन

एक सेवा को तैनात करने के लिए सामान्य स्केलेटन निम्नानुसार है:

```python
# 0: Import ray serve and request from starlette
from ray import serve
from starlette.requests import Request


# 1: Define a Ray Serve deployment.
@serve.deployment
class LLMServe:
    def __init__(self) -> None:
        # All the initialization code goes here
        pass

    async def __call__(self, request: Request) -> str:
        # You can parse the request here
        # and return a response
        return "Hello World"


# 2: Bind the model to deployment
deployment = LLMServe.bind()

# 3: Run the deployment
serve.api.run(deployment)
```

```python
# Shutdown the deployment
serve.api.shutdown()
```

## OpenAI श्रृंखला को कस्टम प्रॉम्प्ट के साथ तैनात करने का उदाहरण

[यहाँ](https://platform.openai.com/account/api-keys) से OpenAI API कुंजी प्राप्त करें। निम्नलिखित कोड चलाकर, आपसे अपनी API कुंजी प्रदान करने के लिए कहा जाएगा।

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
@serve.deployment
class DeployLLM:
    def __init__(self):
        # We initialize the LLM, template and the chain here
        llm = OpenAI(openai_api_key=OPENAI_API_KEY)
        template = "Question: {question}\n\nAnswer: Let's think step by step."
        prompt = PromptTemplate.from_template(template)
        self.chain = LLMChain(llm=llm, prompt=prompt)

    def _run_chain(self, text: str):
        return self.chain(text)

    async def __call__(self, request: Request):
        # 1. Parse the request
        text = request.query_params["text"]
        # 2. Run the chain
        resp = self._run_chain(text)
        # 3. Return the response
        return resp["text"]
```

अब हम तैनाती को बाइंड कर सकते हैं।

```python
# Bind the model to deployment
deployment = DeployLLM.bind()
```

हम तैनाती को चलाने के लिए पोर्ट नंबर और होस्ट का आवंटन कर सकते हैं।

```python
# Example port number
PORT_NUMBER = 8282
# Run the deployment
serve.api.run(deployment, port=PORT_NUMBER)
```

अब जब सेवा `localhost:8282` पर तैनात हो गई है, तो हम परिणाम प्राप्त करने के लिए पोस्ट अनुरोध भेज सकते हैं।

```python
import requests

text = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
response = requests.post(f"http://localhost:{PORT_NUMBER}/?text={text}")
print(response.content.decode())
```
