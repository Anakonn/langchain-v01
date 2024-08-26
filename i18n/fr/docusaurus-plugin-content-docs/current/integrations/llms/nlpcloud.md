---
translated: true
---

# NLP Cloud

Le [NLP Cloud](https://nlpcloud.io) fournit des modèles pré-entraînés ou personnalisés à haute performance pour l'extraction d'entités nommées, l'analyse des sentiments, la classification, la résumé, le paraphrasage, la correction grammaticale et orthographique, l'extraction de mots-clés et de phrases clés, les chatbots, la génération de descriptions de produits et de publicités, la classification des intentions, la génération de texte, la génération d'images, la génération d'articles de blog, la génération de code, les questions-réponses, la reconnaissance vocale automatique, la traduction automatique, la détection de langue, la recherche sémantique, la similarité sémantique, la tokenisation, l'étiquetage morphosyntaxique, les embeddings et l'analyse de dépendance. Il est prêt pour la production, accessible via une API REST.

Cet exemple explique comment utiliser LangChain pour interagir avec les [modèles](https://docs.nlpcloud.com/#models) `NLP Cloud`.

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
# get a token: https://docs.nlpcloud.com/#authentication

from getpass import getpass

NLPCLOUD_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = NLPCLOUD_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import NLPCloud
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = NLPCloud()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```

```output
' Justin Bieber was born in 1994, so the team that won the Super Bowl that year was the San Francisco 49ers.'
```
