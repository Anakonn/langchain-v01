---
translated: true
---

# डेटाब्रिक्स

[डेटाब्रिक्स](https://www.databricks.com/) लेकहाउस प्लेटफॉर्म एक ही प्लेटफॉर्म पर डेटा, विश्लेषण और AI को एकीकृत करता है।

यह उदाहरण नोटबुक दिखाता है कि कैसे डेटाब्रिक्स एंडपॉइंट को LangChain में LLM के रूप में लपेटा जा सकता है।
यह दो एंडपॉइंट प्रकार का समर्थन करता है:

* सर्विंग एंडपॉइंट, उत्पादन और विकास के लिए अनुशंसित,
* क्लस्टर ड्राइवर प्रॉक्सी ऐप, इंटरैक्टिव विकास के लिए अनुशंसित।

## इंस्टॉलेशन

`mlflow >= 2.9` इस नोटबुक में कोड चलाने के लिए आवश्यक है। यदि यह इंस्टॉल नहीं है, तो कृपया इस कमांड का उपयोग करके इसे इंस्टॉल करें:

```bash
pip install mlflow>=2.9
```

इसके अलावा, हमें इस उदाहरण के लिए `dbutils` की आवश्यकता है।

```bash
pip install dbutils
```

## सर्विंग एंडपॉइंट को लपेटना: बाहरी मॉडल

पूर्वापेक्षा: एक OpenAI API कुंजी को गोपनीय के रूप में पंजीकृत करें:

```bash
databricks secrets create-scope <scope>
databricks secrets put-secret <scope> openai-api-key --string-value $OPENAI_API_KEY
```

निम्नलिखित कोड OpenAI के GPT-4 मॉडल के लिए एक नया सर्विंग एंडपॉइंट बनाता है और एंडपॉइंट का उपयोग करके प्रतिक्रिया उत्पन्न करता है।

```python
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage
from mlflow.deployments import get_deploy_client

client = get_deploy_client("databricks")

secret = "secrets/<scope>/openai-api-key"  # replace `<scope>` with your scope
name = "my-chat"  # rename this if my-chat already exists
client.create_endpoint(
    name=name,
    config={
        "served_entities": [
            {
                "name": "my-chat",
                "external_model": {
                    "name": "gpt-4",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{" + secret + "}}",
                    },
                },
            }
        ],
    },
)

chat = ChatDatabricks(
    target_uri="databricks",
    endpoint=name,
    temperature=0.1,
)
chat([HumanMessage(content="hello")])
```

```output
content='Hello! How can I assist you today?'
```

## सर्विंग एंडपॉइंट को लपेटना: फाउंडेशन मॉडल

निम्नलिखित कोड `databricks-bge-large-en` सर्विंग एंडपॉइंट (कोई एंडपॉइंट सृजन आवश्यक नहीं है) का उपयोग करके इनपुट पाठ से embeddings उत्पन्न करता है।

```python
from langchain_community.embeddings import DatabricksEmbeddings

embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
embeddings.embed_query("hello")[:3]
```

```output
[0.051055908203125, 0.007221221923828125, 0.003879547119140625]
```

## सर्विंग एंडपॉइंट को लपेटना: कस्टम मॉडल

पूर्वापेक्षाएं:

* एक LLM [डेटाब्रिक्स सर्विंग एंडपॉइंट](https://docs.databricks.com/machine-learning/model-serving/index.html) पर पंजीकृत और तैनात किया गया था।
* आप एंडपॉइंट के लिए ["Can Query" अनुमति](https://docs.databricks.com/security/auth-authz/access-control/serving-endpoint-acl.html) रखते हैं।

अपेक्षित MLflow मॉडल हस्ताक्षर है:

  * इनपुट: `[{"name": "prompt", "type": "string"}, {"name": "stop", "type": "list[string]"}]`
  * आउटपुट: `[{"type": "string"}]`

यदि मॉडल हस्ताक्षर असंगत है या आप अतिरिक्त कॉन्फ़िग डालना चाहते हैं, तो आप `transform_input_fn` और `transform_output_fn` को तदनुसार सेट कर सकते हैं।

```python
from langchain_community.llms import Databricks

# If running a Databricks notebook attached to an interactive cluster in "single user"
# or "no isolation shared" mode, you only need to specify the endpoint name to create
# a `Databricks` instance to query a serving endpoint in the same workspace.
llm = Databricks(endpoint_name="dolly")

llm("How are you?")
```

```output
'I am happy to hear that you are in good health and as always, you are appreciated.'
```

```python
llm("How are you?", stop=["."])
```

```output
'Good'
```

```python
# Otherwise, you can manually specify the Databricks workspace hostname and personal access token
# or set `DATABRICKS_HOST` and `DATABRICKS_TOKEN` environment variables, respectively.
# See https://docs.databricks.com/dev-tools/auth.html#databricks-personal-access-tokens
# We strongly recommend not exposing the API token explicitly inside a notebook.
# You can use Databricks secret manager to store your API token securely.
# See https://docs.databricks.com/dev-tools/databricks-utils.html#secrets-utility-dbutilssecrets

import os

import dbutils

os.environ["DATABRICKS_TOKEN"] = dbutils.secrets.get("myworkspace", "api_token")

llm = Databricks(host="myworkspace.cloud.databricks.com", endpoint_name="dolly")

llm("How are you?")
```

```output
'I am fine. Thank you!'
```

```python
# If the serving endpoint accepts extra parameters like `temperature`,
# you can set them in `model_kwargs`.
llm = Databricks(endpoint_name="dolly", model_kwargs={"temperature": 0.1})

llm("How are you?")
```

```output
'I am fine.'
```

```python
# Use `transform_input_fn` and `transform_output_fn` if the serving endpoint
# expects a different input schema and does not return a JSON string,
# respectively, or you want to apply a prompt template on top.


def transform_input(**request):
    full_prompt = f"""{request["prompt"]}
    Be Concise.
    """
    request["prompt"] = full_prompt
    return request


llm = Databricks(endpoint_name="dolly", transform_input_fn=transform_input)

llm("How are you?")
```

```output
'I’m Excellent. You?'
```

## क्लस्टर ड्राइवर प्रॉक्सी ऐप को लपेटना

पूर्वापेक्षाएं:

* एक LLM डेटाब्रिक्स इंटरैक्टिव क्लस्टर में "एकल उपयोगकर्ता" या "कोई आइसोलेशन साझा" मोड में लोड किया गया है।
* एक स्थानीय HTTP सर्वर ड्राइवर नोड पर चल रहा है जो मॉडल को JSON इनपुट/आउटपुट का उपयोग करते हुए HTTP POST पर `"/"` पर सर्व करता है।
* यह `[3000, 8000]` के बीच एक पोर्ट नंबर का उपयोग करता है और केवल localhost के बजाय ड्राइवर IP पते या सिर्फ `0.0.0.0` पर सुनता है।
* आप क्लस्टर में "Can Attach To" अनुमति रखते हैं।

अपेक्षित सर्वर स्कीमा (JSON स्कीमा का उपयोग करके) है:

* इनपुट:
  ```json
  {"type": "object",
   "properties": {
      "prompt": {"type": "string"},
       "stop": {"type": "array", "items": {"type": "string"}}},
    "required": ["prompt"]}
  ```
* आउटपुट: `{"type": "string"}`

यदि सर्वर स्कीमा असंगत है या आप अतिरिक्त कॉन्फ़िग डालना चाहते हैं, तो आप `transform_input_fn` और `transform_output_fn` का उपयोग कर सकते हैं।

निम्नलिखित एक LLM को सर्व करने के लिए एक ड्राइवर प्रॉक्सी ऐप चलाने का न्यूनतम उदाहरण है:

```python
from flask import Flask, request, jsonify
import torch
from transformers import pipeline, AutoTokenizer, StoppingCriteria

model = "databricks/dolly-v2-3b"
tokenizer = AutoTokenizer.from_pretrained(model, padding_side="left")
dolly = pipeline(model=model, tokenizer=tokenizer, trust_remote_code=True, device_map="auto")
device = dolly.device

class CheckStop(StoppingCriteria):
    def __init__(self, stop=None):
        super().__init__()
        self.stop = stop or []
        self.matched = ""
        self.stop_ids = [tokenizer.encode(s, return_tensors='pt').to(device) for s in self.stop]
    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs):
        for i, s in enumerate(self.stop_ids):
            if torch.all((s == input_ids[0][-s.shape[1]:])).item():
                self.matched = self.stop[i]
                return True
        return False

def llm(prompt, stop=None, **kwargs):
  check_stop = CheckStop(stop)
  result = dolly(prompt, stopping_criteria=[check_stop], **kwargs)
  return result[0]["generated_text"].rstrip(check_stop.matched)

app = Flask("dolly")

@app.route('/', methods=['POST'])
def serve_llm():
  resp = llm(**request.json)
  return jsonify(resp)

app.run(host="0.0.0.0", port="7777")
```

एक बार सर्वर चल रहा हो, तो आप एक LLM के रूप में इसे लपेटने के लिए एक `Databricks` इंस्टेंस बना सकते हैं।

```python
# If running a Databricks notebook attached to the same cluster that runs the app,
# you only need to specify the driver port to create a `Databricks` instance.
llm = Databricks(cluster_driver_port="7777")

llm("How are you?")
```

```output
'Hello, thank you for asking. It is wonderful to hear that you are well.'
```

```python
# Otherwise, you can manually specify the cluster ID to use,
# as well as Databricks workspace hostname and personal access token.

llm = Databricks(cluster_id="0000-000000-xxxxxxxx", cluster_driver_port="7777")

llm("How are you?")
```

```output
'I am well. You?'
```

```python
# If the app accepts extra parameters like `temperature`,
# you can set them in `model_kwargs`.
llm = Databricks(cluster_driver_port="7777", model_kwargs={"temperature": 0.1})

llm("How are you?")
```

```output
'I am very well. It is a pleasure to meet you.'
```

```python
# Use `transform_input_fn` and `transform_output_fn` if the app
# expects a different input schema and does not return a JSON string,
# respectively, or you want to apply a prompt template on top.


def transform_input(**request):
    full_prompt = f"""{request["prompt"]}
    Be Concise.
    """
    request["prompt"] = full_prompt
    return request


def transform_output(response):
    return response.upper()


llm = Databricks(
    cluster_driver_port="7777",
    transform_input_fn=transform_input,
    transform_output_fn=transform_output,
)

llm("How are you?")
```

```output
'I AM DOING GREAT THANK YOU.'
```
