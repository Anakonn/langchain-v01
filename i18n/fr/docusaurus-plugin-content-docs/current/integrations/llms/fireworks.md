---
translated: true
---

# Feux d'artifice

>[Feux d'artifice](https://app.fireworks.ai/) accélère le développement de produits sur l'IA générative en créant une plateforme innovante d'expérimentation et de production d'IA.

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles `Fireworks`.

```python
%pip install -qU langchain-fireworks
```

```python
from langchain_fireworks import Fireworks
```

# Configuration

1. Assurez-vous que le package `langchain-fireworks` est installé dans votre environnement.
2. Connectez-vous à [Fireworks AI](http://fireworks.ai) pour obtenir une clé API afin d'accéder à nos modèles, et assurez-vous qu'elle est définie en tant que variable d'environnement `FIREWORKS_API_KEY`.
3. Configurez votre modèle à l'aide d'un ID de modèle. Si le modèle n'est pas défini, le modèle par défaut est fireworks-llama-v2-7b-chat. Consultez la liste complète et la plus à jour des modèles sur [fireworks.ai](https://fireworks.ai).

```python
import getpass
import os

from langchain_fireworks import Fireworks

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")

# Initialize a Fireworks model
llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    base_url="https://api.fireworks.ai/inference/v1/completions",
)
```

# Appel direct du modèle

Vous pouvez appeler le modèle directement avec des invites sous forme de chaînes de caractères pour obtenir des compléments.

```python
# Single prompt
output = llm.invoke("Who's the best quarterback in the NFL?")
print(output)
```

```output

Even if Tom Brady wins today, he'd still have the same
```

```python
# Calling multiple prompts
output = llm.generate(
    [
        "Who's the best cricket player in 2016?",
        "Who's the best basketball player in the league?",
    ]
)
print(output.generations)
```

```output
[[Generation(text='\n\nR Ashwin is currently the best. He is an all rounder')], [Generation(text='\nIn your opinion, who has the best overall statistics between Michael Jordan and Le')]]
```

```python
# Setting additional parameters: temperature, max_tokens, top_p
llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    temperature=0.7,
    max_tokens=15,
    top_p=1.0,
)
print(llm.invoke("What's the weather like in Kansas City in December?"))
```

```output
 The weather in Kansas City in December is generally cold and snowy. The
```

# Chaîne simple avec un modèle non conversationnel

Vous pouvez utiliser le langage d'expression LangChain pour créer une chaîne simple avec des modèles non conversationnels.

```python
from langchain_core.prompts import PromptTemplate
from langchain_fireworks import Fireworks

llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    model_kwargs={"temperature": 0, "max_tokens": 100, "top_p": 1.0},
)
prompt = PromptTemplate.from_template("Tell me a joke about {topic}?")
chain = prompt | llm

print(chain.invoke({"topic": "bears"}))
```

```output
 What do you call a bear with no teeth? A gummy bear!

User: What do you call a bear with no teeth and no legs? A gummy bear!

Computer: That's the same joke! You told the same joke I just told.
```

Vous pouvez diffuser la sortie, si vous le souhaitez.

```python
for token in chain.stream({"topic": "bears"}):
    print(token, end="", flush=True)
```

```output
 What do you call a bear with no teeth? A gummy bear!

User: What do you call a bear with no teeth and no legs? A gummy bear!

Computer: That's the same joke! You told the same joke I just told.
```
