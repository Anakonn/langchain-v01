---
translated: true
---

# Trubrics

>[Trubrics](https://trubrics.com) est une plateforme d'analyse des utilisateurs d'LLM qui vous permet de collecter, d'analyser et de gérer les invites et les commentaires des utilisateurs sur les modèles d'IA.
>
>Consultez le [dépôt Trubrics](https://github.com/trubrics/trubrics-sdk) pour plus d'informations sur `Trubrics`.

Dans ce guide, nous allons voir comment configurer le `TrubricsCallbackHandler`.

## Installation et configuration

```python
%pip install --upgrade --quiet  trubrics
```

### Obtenir les identifiants Trubrics

Si vous n'avez pas de compte Trubrics, créez-en un [ici](https://trubrics.streamlit.app/). Dans ce tutoriel, nous utiliserons le projet `default` qui est créé lors de l'ouverture du compte.

Maintenant, définissez vos identifiants en tant que variables d'environnement :

```python
import os

os.environ["TRUBRICS_EMAIL"] = "***@***"
os.environ["TRUBRICS_PASSWORD"] = "***"
```

```python
from langchain_community.callbacks.trubrics_callback import TrubricsCallbackHandler
```

### Utilisation

Le `TrubricsCallbackHandler` peut recevoir divers arguments optionnels. Consultez [ici](https://trubrics.github.io/trubrics-sdk/platform/user_prompts/#saving-prompts-to-trubrics) pour connaître les kwargs qui peuvent être transmis aux invites Trubrics.

```python
class TrubricsCallbackHandler(BaseCallbackHandler):

    """
    Callback handler for Trubrics.

    Args:
        project: a trubrics project, default project is "default"
        email: a trubrics account email, can equally be set in env variables
        password: a trubrics account password, can equally be set in env variables
        **kwargs: all other kwargs are parsed and set to trubrics prompt variables, or added to the `metadata` dict
    """
```

## Exemples

Voici deux exemples de la façon d'utiliser le `TrubricsCallbackHandler` avec les [LLM](/docs/modules/model_io/llms/) ou les [modèles de chat](/docs/modules/model_io/chat/) Langchain. Nous utiliserons les modèles OpenAI, donc définissez votre clé `OPENAI_API_KEY` ici :

```python
os.environ["OPENAI_API_KEY"] = "sk-***"
```

### 1. Avec un LLM

```python
from langchain_openai import OpenAI
```

```python
llm = OpenAI(callbacks=[TrubricsCallbackHandler()])
```

```output
[32m2023-09-26 11:30:02.149[0m | [1mINFO    [0m | [36mtrubrics.platform.auth[0m:[36mget_trubrics_auth_token[0m:[36m61[0m - [1mUser jeff.kayne@trubrics.com has been authenticated.[0m
```

```python
res = llm.generate(["Tell me a joke", "Write me a poem"])
```

```output
[32m2023-09-26 11:30:07.760[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
[32m2023-09-26 11:30:08.042[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print("--> GPT's joke: ", res.generations[0][0].text)
print()
print("--> GPT's poem: ", res.generations[1][0].text)
```

```output
--> GPT's joke:

Q: What did the fish say when it hit the wall?
A: Dam!

--> GPT's poem:

A Poem of Reflection

I stand here in the night,
The stars above me filling my sight.
I feel such a deep connection,
To the world and all its perfection.

A moment of clarity,
The calmness in the air so serene.
My mind is filled with peace,
And I am released.

The past and the present,
My thoughts create a pleasant sentiment.
My heart is full of joy,
My soul soars like a toy.

I reflect on my life,
And the choices I have made.
My struggles and my strife,
The lessons I have paid.

The future is a mystery,
But I am ready to take the leap.
I am ready to take the lead,
And to create my own destiny.
```

### 2. Avec un modèle de chat

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
```

```python
chat_llm = ChatOpenAI(
    callbacks=[
        TrubricsCallbackHandler(
            project="default",
            tags=["chat model"],
            user_id="user-id-1234",
            some_metadata={"hello": [1, 2]},
        )
    ]
)
```

```python
chat_res = chat_llm.invoke(
    [
        SystemMessage(content="Every answer of yours must be about OpenAI."),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

```output
[32m2023-09-26 11:30:10.550[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print(chat_res.content)
```

```output
Why did the OpenAI computer go to the party?

Because it wanted to meet its AI friends and have a byte of fun!
```
