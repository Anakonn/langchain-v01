---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)** का [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) अपने खुद के ओपन-सोर्स मॉडल चलाने के लिए एक प्लेटफ़ॉर्म है

यह उदाहरण LangChain का उपयोग करके SambaNova एम्बेडिंग मॉडल के साथ कैसे काम करें, इस बारे में बताता है

## SambaStudio

**SambaStudio** आपको ट्रेन करने, बैच इन्फ़ेरेंस जॉब्स चलाने और खुद के फ़ाइन-ट्यून किए गए ओपन सोर्स मॉडल को चलाने के लिए ऑनलाइन इन्फ़ेरेंस एंडपॉइंट्स को तैनात करने की अनुमति देता है।

एक मॉडल को तैनात करने के लिए एक SambaStudio पर्यावरण की आवश्यकता होती है। [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite) पर अधिक जानकारी प्राप्त करें

अपने पर्यावरण चर रजिस्टर करें:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_EMBEDDINGS_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_EMBEDDINGS_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_EMBEDDINGS_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_EMBEDDINGS_API_KEY"] = sambastudio_api_key
```

LangChain से सीधे SambaStudio होस्टेड एम्बेडिंग्स को कॉल करें!

```python
from langchain_community.embeddings.sambanova import SambaStudioEmbeddings

embeddings = SambaStudioEmbeddings()

text = "Hello, this is a test"
result = embeddings.embed_query(text)
print(result)

texts = ["Hello, this is a test", "Hello, this is another test"]
results = embeddings.embed_documents(texts)
print(results)
```
