---
canonical: https://python.langchain.com/v0.1/docs/integrations/llms/sambanova
translated: false
---

# SambaNova

**[SambaNova](https://sambanova.ai/)'s** [Sambaverse](https://sambaverse.sambanova.ai/) and [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) are platforms for running your own open-source models

This example goes over how to use LangChain to interact with SambaNova models

## Sambaverse

**Sambaverse** allows you to interact with multiple open-source models. You can view the list of available models and interact with them in the [playground](https://sambaverse.sambanova.ai/playground).
 **Please note that Sambaverse's free offering is performance-limited.** Companies that are ready to evaluate the production tokens-per-second performance, volume throughput, and 10x lower total cost of ownership (TCO) of SambaNova should [contact us](https://sambaverse.sambanova.ai/contact-us) for a non-limited evaluation instance.

An API key is required to access Sambaverse models. To get a key, create an account at [sambaverse.sambanova.ai](https://sambaverse.sambanova.ai/)

The [sseclient-py](https://pypi.org/project/sseclient-py/) package is required to run streaming predictions

```python
%pip install --quiet sseclient-py==1.8.0
```

Register your API key as an environment variable:

```python
import os

sambaverse_api_key = "<Your sambaverse API key>"

# Set the environment variables
os.environ["SAMBAVERSE_API_KEY"] = sambaverse_api_key
```

Call Sambaverse models directly from LangChain!

```python
from langchain_community.llms.sambanova import Sambaverse

llm = Sambaverse(
    sambaverse_model_name="Meta/llama-2-7b-chat-hf",
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        "process_prompt": True,
        "select_expert": "llama-2-7b-chat-hf",
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```

## SambaStudio

**SambaStudio** allows you to train, run batch inference jobs, and deploy online inference endpoints to run open source models that you fine tuned yourself.

A SambaStudio environment is required to deploy a model. Get more information at [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)

The [sseclient-py](https://pypi.org/project/sseclient-py/) package is required to run streaming predictions

```python
%pip install --quiet sseclient-py==1.8.0
```

Register your environment variables:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_API_KEY"] = sambastudio_api_key
```

Call SambaStudio models directly from LangChain!

```python
from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_logprobs": {"type": "int", "value": "0"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```