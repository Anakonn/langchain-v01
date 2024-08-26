---
translated: true
---

# Predibase

Apprenez à utiliser LangChain avec des modèles sur Predibase.

## Configuration

- Créez un compte [Predibase](https://predibase.com/) et une [clé API](https://docs.predibase.com/sdk-guide/intro).
- Installez le client Python Predibase avec `pip install predibase`
- Utilisez votre clé API pour vous authentifier

### LLM

Predibase s'intègre à LangChain en implémentant le module LLM. Vous pouvez voir un court exemple ci-dessous ou un notebook complet sous LLM > Intégrations > Predibase.

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

Predibase prend également en charge les adaptateurs hébergés par Predibase et HuggingFace qui sont affinés sur le modèle de base donné par l'argument `model` :

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

Predibase prend également en charge les adaptateurs qui sont affinés sur le modèle de base donné par l'argument `model` :

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at HuggingFace (adapter_version does not apply and will be ignored).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```
