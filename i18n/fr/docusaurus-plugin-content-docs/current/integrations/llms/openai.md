---
translated: true
---

# OpenAI

[OpenAI](https://platform.openai.com/docs/introduction) offre un spectre de modèles avec différents niveaux de puissance adaptés à différentes tâches.

Cet exemple explique comment utiliser LangChain pour interagir avec les [modèles](https://platform.openai.com/docs/models) `OpenAI`

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

Si vous devez spécifier votre ID d'organisation, vous pouvez utiliser la cellule suivante. Cependant, ce n'est pas nécessaire si vous ne faites partie que d'une seule organisation ou si vous avez l'intention d'utiliser votre organisation par défaut. Vous pouvez vérifier votre organisation par défaut [ici](https://platform.openai.com/account/api-keys).

Pour spécifier votre organisation, vous pouvez utiliser ceci :

```python
OPENAI_ORGANIZATION = getpass()

os.environ["OPENAI_ORGANIZATION"] = OPENAI_ORGANIZATION
```

```python
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = OpenAI()
```

Si vous voulez manuellement spécifier votre clé API OpenAI et/ou votre ID d'organisation, vous pouvez utiliser ce qui suit :

```python
llm = OpenAI(openai_api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

Supprimez le paramètre openai_organization s'il ne s'applique pas à vous.

```python
llm_chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.invoke(question)
```

```output
' Justin Bieber was born on March 1, 1994. The Super Bowl is typically played in late January or early February. So, we need to look at the Super Bowl from 1994. In 1994, the Super Bowl was Super Bowl XXVIII, played on January 30, 1994. The winning team of that Super Bowl was the Dallas Cowboys.'
```

Si vous êtes derrière un proxy explicite, vous pouvez spécifier le http_client pour passer à travers

```python
pip install httpx

import httpx

openai = OpenAI(model_name="gpt-3.5-turbo-instruct", http_client=httpx.Client(proxies="http://proxy.yourcompany.com:8080"))
```
