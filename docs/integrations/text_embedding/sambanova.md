---
canonical: https://python.langchain.com/v0.1/docs/integrations/text_embedding/sambanova
translated: false
---

# SambaNova

**[SambaNova](https://sambanova.ai/)'s** [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) is a platform for running your own open-source models

This example goes over how to use LangChain to interact with SambaNova embedding models

## SambaStudio

**SambaStudio** allows you to train, run batch inference jobs, and deploy online inference endpoints to run open source models that you fine tuned yourself.

A SambaStudio environment is required to deploy a model. Get more information at [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)

Register your environment variables:

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

Call SambaStudio hosted embeddings directly from LangChain!

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