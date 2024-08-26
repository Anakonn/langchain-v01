---
sidebar_position: 3
translated: true
---

# Sortie structurée

Il est souvent crucial d'avoir des LLM (modèles de langage de grande taille) qui renvoient une sortie structurée. C'est parce que souvent, les sorties des LLM sont utilisées dans des applications en aval, où des arguments spécifiques sont requis. Avoir le LLM qui renvoie une sortie structurée de manière fiable est nécessaire pour cela.

Il existe quelques stratégies de haut niveau différentes qui sont utilisées pour faire cela :

- Prompt : C'est quand vous demandez (très gentiment) au LLM de renvoyer la sortie dans le format souhaité (JSON, XML). C'est agréable parce que ça fonctionne avec tous les LLM. Ce n'est pas agréable parce qu'il n'y a aucune garantie que le LLM renvoie la sortie dans le bon format.
- Appel de fonction : C'est quand le LLM est affiné pour être capable non seulement de générer une complétion, mais aussi de générer un appel de fonction. Les fonctions que le LLM peut appeler sont généralement passées en paramètres supplémentaires à l'API du modèle. Les noms et descriptions des fonctions doivent être traités comme faisant partie du prompt (ils comptent généralement dans le nombre de jetons, et sont utilisés par le LLM pour décider de ce qu'il faut faire).
- Appel d'outil : Une technique similaire à l'appel de fonction, mais elle permet au LLM d'appeler plusieurs fonctions en même temps.
- Mode JSON : C'est quand le LLM est garanti de renvoyer du JSON.

Différents modèles peuvent prendre en charge différentes variantes de ces options, avec des paramètres légèrement différents. Afin de faciliter l'obtention d'une sortie structurée des LLM, nous avons ajouté une interface commune aux modèles LangChain : `.with_structured_output`.

En invoquant cette méthode (et en passant un schéma JSON ou un modèle Pydantic), le modèle ajoutera les paramètres du modèle et les analyseurs de sortie nécessaires pour obtenir la sortie structurée. Il peut y avoir plus d'une façon de faire cela (par exemple, appel de fonction vs mode JSON) - vous pouvez configurer la méthode à utiliser en la passant à cette méthode.

Examinons quelques exemples de cela en action !

Nous utiliserons Pydantic pour structurer facilement le schéma de réponse.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class Joke(BaseModel):
    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline to the joke")
```

## OpenAI

OpenAI expose plusieurs moyens différents d'obtenir des sorties structurées.

[Référence de l'API](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.with_structured_output)

```python
from langchain_openai import ChatOpenAI
```

#### Appel d'outil/de fonction

Par défaut, nous utiliserons `function_calling`

```python
model = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='To keep an eye on the mouse!')
```

#### Mode JSON

Nous prenons également en charge le mode JSON. Notez que nous devons spécifier dans le prompt le format dans lequel il doit répondre.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='Because it wanted to keep an eye on the mouse!')
```

## Fireworks

[Fireworks](https://fireworks.ai/) prend également en charge l'appel de fonction et le mode JSON pour certains modèles.

[Référence de l'API](https://api.python.langchain.com/en/latest/chat_models/langchain_fireworks.chat_models.ChatFireworks.html#langchain_fireworks.chat_models.ChatFireworks.with_structured_output)

```python
from langchain_fireworks import ChatFireworks
```

#### Appel d'outil/de fonction

Par défaut, nous utiliserons `function_calling`

```python
model = ChatFireworks(model="accounts/fireworks/models/firefunction-v1")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### Mode JSON

Nous prenons également en charge le mode JSON. Notez que nous devons spécifier dans le prompt le format dans lequel il doit répondre.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about dogs, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why did the dog sit in the shade?', punchline='To avoid getting burned.')
```

## Mistral

Nous prenons également en charge la sortie structurée avec les modèles Mistral, bien que nous ne prenions en charge que l'appel de fonction.

[Référence de l'API](https://api.python.langchain.com/en/latest/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html#langchain_mistralai.chat_models.ChatMistralAI.with_structured_output)

```python
from langchain_mistralai import ChatMistralAI
```

```python
model = ChatMistralAI(model="mistral-large-latest")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Together

Puisque [TogetherAI](https://www.together.ai/) est juste un remplacement direct pour OpenAI, nous pouvons simplement utiliser l'intégration OpenAI

```python
import os

from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.environ["TOGETHER_API_KEY"],
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the cat sit on the computer?', punchline='To keep an eye on the mouse!')
```

## Groq

Groq fournit une API d'appel de fonction compatible avec OpenAI.

[Référence de l'API](https://api.python.langchain.com/en/latest/chat_models/langchain_groq.chat_models.ChatGroq.html#langchain_groq.chat_models.ChatGroq.with_structured_output)

```python
from langchain_groq import ChatGroq
```

#### Appel d'outil/de fonction

Par défaut, nous utiliserons `function_calling`

```python
model = ChatGroq()
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### Mode JSON

Nous prenons également en charge le mode JSON. Notez que nous devons spécifier dans le prompt le format dans lequel il doit répondre.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Anthropic

L'API d'appel d'outil d'Anthropic peut être utilisée pour structurer les sorties. Notez qu'il n'y a actuellement aucun moyen de forcer un appel d'outil via l'API, donc le fait de promouvoir correctement le modèle est toujours important.

[Référence de l'API](https://api.python.langchain.com/en/latest/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html#langchain_anthropic.chat_models.ChatAnthropic.with_structured_output)

```python
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-3-opus-20240229", temperature=0)
structured_llm = model.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats. Make sure to call the Joke function.")
```

```output
Joke(setup='What do you call a cat that loves to bowl?', punchline='An alley cat!')
```

## Google Vertex AI

Les modèles Gemini de Google prennent en charge [l'appel de fonction](https://ai.google.dev/docs/function_calling), que nous pouvons accéder via Vertex AI et utiliser pour structurer les sorties.

[Référence de l'API](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html#langchain_google_vertexai.chat_models.ChatVertexAI.with_structured_output)

```python
from langchain_google_vertexai import ChatVertexAI

llm = ChatVertexAI(model="gemini-pro", temperature=0)
structured_llm = llm.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the scarecrow win an award?', punchline='Why did the scarecrow win an award? Because he was outstanding in his field.')
```
