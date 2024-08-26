---
translated: true
---

# Protocole Shale

[Protocole Shale](https://shaleprotocol.com) fournit des API d'inférence prêtes pour la production pour les LLM open source. C'est une API Plug & Play car elle est hébergée sur une infrastructure cloud GPU hautement évolutive.

Notre niveau gratuit prend en charge jusqu'à 1 000 requêtes quotidiennes par clé, car nous voulons éliminer les obstacles pour que tout le monde puisse commencer à construire des applications genAI avec des LLM.

Avec le protocole Shale, les développeurs/chercheurs peuvent créer des applications et explorer les capacités des LLM open source sans frais.

Cette page explique comment l'API Shale-Serve peut être intégrée avec LangChain.

En juin 2023, l'API prend en charge Vicuna-13B par défaut. Nous allons prendre en charge d'autres LLM comme Falcon-40B dans les versions futures.

## Comment faire

### 1. Trouvez le lien vers notre Discord sur https://shaleprotocol.com. Générez une clé API via le "Shale Bot" sur notre Discord. Aucune carte de crédit n'est requise et il n'y a pas d'essai gratuit. C'est un niveau gratuit à vie avec une limite de 1 000 par jour par clé API.

### 2. Utilisez https://shale.live/v1 comme remplacement de l'API OpenAI

Par exemple

```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Shale Protocol"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Shale Protocol"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.llm.LLMChain.html", "title": "Shale Protocol"}]-->
from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain

import os
os.environ['OPENAI_API_BASE'] = "https://shale.live/v1"
os.environ['OPENAI_API_KEY'] = "ENTER YOUR API KEY"

llm = OpenAI()

template = """Question: {question}

# Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)

```
