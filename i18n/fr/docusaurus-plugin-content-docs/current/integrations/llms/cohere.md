---
translated: true
---

# Cohere

>[Cohere](https://cohere.ai/about) est une startup canadienne qui fournit des modèles de traitement du langage naturel qui aident les entreprises à améliorer les interactions homme-machine.

Rendez-vous sur la [référence de l'API](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html) pour une documentation détaillée de tous les attributs et méthodes.

## Configuration

L'intégration se trouve dans le package `langchain-community`. Nous devons également installer le package `cohere` lui-même. Nous pouvons les installer avec :

```bash
pip install -U langchain-community langchain-cohere
```

Nous aurons également besoin d'obtenir une [clé API Cohere](https://cohere.com/) et de définir la variable d'environnement `COHERE_API_KEY` :

```python
import getpass
import os

os.environ["COHERE_API_KEY"] = getpass.getpass()
```

```output
 ········
```

Il est également utile (mais pas nécessaire) de configurer [LangSmith](https://smith.langchain.com/) pour une observabilité de premier ordre.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Utilisation

Cohere prend en charge toutes les fonctionnalités [LLM](/docs/modules/model_io/llms/) :

```python
from langchain_cohere import Cohere
from langchain_core.messages import HumanMessage
```

```python
model = Cohere(model="command", max_tokens=256, temperature=0.75)
```

```python
message = "Knock knock"
model.invoke(message)
```

```output
" Who's there?"
```

```python
await model.ainvoke(message)
```

```output
" Who's there?"
```

```python
for chunk in model.stream(message):
    print(chunk, end="", flush=True)
```

```output
 Who's there?
```

```python
model.batch([message])
```

```output
[" Who's there?"]
```

Vous pouvez également facilement les combiner avec un modèle de prompt pour structurer facilement l'entrée de l'utilisateur. Nous pouvons le faire en utilisant [LCEL](/docs/expression_language)

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | model
```

```python
chain.invoke({"topic": "bears"})
```

```output
' Why did the teddy bear cross the road?\nBecause he had bear crossings.\n\nWould you like to hear another joke? '
```
