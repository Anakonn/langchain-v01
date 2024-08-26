---
translated: true
---

# क्लेरिफाई

>[क्लेरिफाई](https://www.clarifai.com/) एक एआई प्लेटफॉर्म है जो डेटा एक्सप्लोरेशन, डेटा लेबलिंग, मॉडल ट्रेनिंग, मूल्यांकन और अनुमान के पूरे एआई लाइफसाइकिल को प्रदान करता है।

यह उदाहरण `क्लेरिफाई` [मॉडल](https://clarifai.com/explore/models) के साथ LangChain का उपयोग करने के बारे में बताता है। विशेष रूप से, पाठ एम्बेडिंग मॉडल यहां [पाए जा सकते हैं](https://clarifai.com/explore/models?page=1&perPage=24&filterData=%5B%7B%22field%22%3A%22model_type_id%22%2C%22value%22%3A%5B%22text-embedder%22%5D%7D%5D)।

क्लेरिफाई का उपयोग करने के लिए, आपके पास एक खाता और एक व्यक्तिगत एक्सेस टोकन (PAT) कुंजी होनी चाहिए।
[यहां](https://clarifai.com/settings/security) जाकर PAT प्राप्त या बनाएं।

# निर्भरताएं

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# आयात

यहां हम व्यक्तिगत एक्सेस टोकन सेट करेंगे। आप अपने क्लेरिफाई खाते में [सेटिंग्स/सुरक्षा](https://clarifai.com/settings/security) में अपना PAT पा सकते हैं।

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```python
# Import the required modules
from langchain.chains import LLMChain
from langchain_community.embeddings import ClarifaiEmbeddings
from langchain_core.prompts import PromptTemplate
```

# इनपुट

LLM श्रृंखला के साथ उपयोग करने के लिए एक प्रॉम्प्ट टेम्प्लेट बनाएं:

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

# सेटअप

उस एप्लिकेशन का उपयोगकर्ता आईडी और ऐप आईडी सेट करें जिसमें मॉडल मौजूद है। आप https://clarifai.com/explore/models पर सार्वजनिक मॉडलों की एक सूची पा सकते हैं।

आपको मॉडल आईडी और यदि आवश्यक हो तो मॉडल संस्करण आईडी भी प्रारंभ करना होगा। कुछ मॉडलों के कई संस्करण हैं, आप अपने कार्य के लिए उचित एक का चयन कर सकते हैं।

```python
USER_ID = "clarifai"
APP_ID = "main"
MODEL_ID = "BAAI-bge-base-en-v15"
MODEL_URL = "https://clarifai.com/clarifai/main/models/BAAI-bge-base-en-v15"

# Further you can also provide a specific model version as the model_version_id arg.
# MODEL_VERSION_ID = "MODEL_VERSION_ID"
```

```python
# Initialize a Clarifai embedding model
embeddings = ClarifaiEmbeddings(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)

# Initialize a clarifai embedding model using model URL
embeddings = ClarifaiEmbeddings(model_url=MODEL_URL)

# Alternatively you can initialize clarifai class with pat argument.
```

```python
text = "roses are red violets are blue."
text2 = "Make hay while the sun shines."
```

आप embed_query फ़ंक्शन का उपयोग करके अपने पाठ की एक पंक्ति को एम्बेड कर सकते हैं!

```python
query_result = embeddings.embed_query(text)
```

इसके अलावा, embed_documents फ़ंक्शन का उपयोग करके पाठ/दस्तावेजों की सूची को एम्बेड करें।

```python
doc_result = embeddings.embed_documents([text, text2])
```
