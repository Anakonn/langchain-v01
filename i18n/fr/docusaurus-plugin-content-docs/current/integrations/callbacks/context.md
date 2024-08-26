---
translated: true
---

# Contexte

>[Contexte](https://context.ai/) fournit des analyses d'utilisateurs pour les produits et fonctionnalités alimentés par LLM.

Avec `Contexte`, vous pouvez commencer à comprendre vos utilisateurs et à améliorer leurs expériences en moins de 30 minutes.

Dans ce guide, nous vous montrerons comment vous intégrer à Contexte.

## Installation et configuration

```python
%pip install --upgrade --quiet  langchain langchain-openai context-python
```

### Obtenir les identifiants de l'API

Pour obtenir votre jeton d'API Contexte :

1. Allez sur la page des paramètres de votre compte Contexte (https://with.context.ai/settings).
2. Générez un nouveau jeton d'API.
3. Conservez ce jeton en lieu sûr.

### Configuration de Contexte

Pour utiliser le `ContextCallbackHandler`, importez le gestionnaire de rappel de Langchain et instanciez-le avec votre jeton d'API Contexte.

Assurez-vous d'avoir installé le package `context-python` avant d'utiliser le gestionnaire.

```python
from langchain_community.callbacks.context_callback import ContextCallbackHandler
```

```python
import os

token = os.environ["CONTEXT_API_TOKEN"]

context_callback = ContextCallbackHandler(token)
```

## Utilisation

### Rappel de contexte dans un modèle de chat

Le gestionnaire de rappel de contexte peut être utilisé pour enregistrer directement les transcriptions entre les utilisateurs et les assistants IA.

```python
import os

from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

chat = ChatOpenAI(
    headers={"user_id": "123"}, temperature=0, callbacks=[ContextCallbackHandler(token)]
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]

print(chat(messages))
```

### Rappel de contexte dans les chaînes

Le gestionnaire de rappel de contexte peut également être utilisé pour enregistrer les entrées et les sorties des chaînes. Notez que les étapes intermédiaires de la chaîne ne sont pas enregistrées - seules les entrées de départ et les sorties finales le sont.

__Remarque :__ Assurez-vous de transmettre le même objet de contexte au modèle de chat et à la chaîne.

Incorrect :
> ```python
> chat = ChatOpenAI(temperature=0.9, callbacks=[ContextCallbackHandler(token)])
> chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[ContextCallbackHandler(token)])
> ```

Correct :
>```python
>handler = ContextCallbackHandler(token)
>chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
>chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
>```

```python
import os

from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

human_message_prompt = HumanMessagePromptTemplate(
    prompt=PromptTemplate(
        template="What is a good name for a company that makes {product}?",
        input_variables=["product"],
    )
)
chat_prompt_template = ChatPromptTemplate.from_messages([human_message_prompt])
callback = ContextCallbackHandler(token)
chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
print(chain.run("colorful socks"))
```
