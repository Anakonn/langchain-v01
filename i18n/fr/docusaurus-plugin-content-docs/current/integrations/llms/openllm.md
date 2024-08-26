---
translated: true
---

# OpenLLM

[🦾 OpenLLM](https://github.com/bentoml/OpenLLM) est une plateforme ouverte pour faire fonctionner des modèles de langage à grande échelle (LLM) en production. Elle permet aux développeurs d'exécuter facilement l'inférence avec n'importe quel LLM open source, de les déployer sur le cloud ou sur site, et de construire des applications IA puissantes.

## Installation

Installez `openllm` via [PyPI](https://pypi.org/project/openllm/)

```python
%pip install --upgrade --quiet  openllm
```

## Lancer le serveur OpenLLM localement

Pour démarrer un serveur LLM, utilisez la commande `openllm start`. Par exemple, pour démarrer un serveur dolly-v2, exécutez la commande suivante depuis un terminal :

```bash
openllm start dolly-v2
```

## Wrapper

```python
from langchain_community.llms import OpenLLM

server_url = "http://localhost:3000"  # Replace with remote host if you are running on a remote server
llm = OpenLLM(server_url=server_url)
```

### Facultatif : Inférence LLM locale

Vous pouvez également choisir d'initialiser un LLM géré par OpenLLM localement à partir du processus actuel. Cela est utile pour le développement et permet aux développeurs d'essayer rapidement différents types de LLM.

Lors du passage des applications LLM en production, nous vous recommandons de déployer le serveur OpenLLM séparément et d'y accéder via l'option `server_url` présentée ci-dessus.

Pour charger un LLM localement via le wrapper LangChain :

```python
from langchain_community.llms import OpenLLM

llm = OpenLLM(
    model_name="dolly-v2",
    model_id="databricks/dolly-v2-3b",
    temperature=0.94,
    repetition_penalty=1.2,
)
```

### Intégrer avec un LLMChain

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "What is a good name for a company that makes {product}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(product="mechanical keyboard")
print(generated)
```

```output
iLkb
```
