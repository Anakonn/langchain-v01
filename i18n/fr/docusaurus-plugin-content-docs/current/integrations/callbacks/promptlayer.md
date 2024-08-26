---
translated: true
---

# PromptLayer

>[PromptLayer](https://docs.promptlayer.com/introduction) est une plateforme pour l'ingénierie des invites. Elle aide également à l'observabilité des LLM pour visualiser les requêtes, les versions d'invites et suivre l'utilisation.
>
>Bien que `PromptLayer` ait des LLM qui s'intègrent directement à LangChain (par exemple [`PromptLayerOpenAI`](/docs/integrations/llms/promptlayer_openai)), l'utilisation d'un rappel est le moyen recommandé pour intégrer `PromptLayer` à LangChain.

Dans ce guide, nous allons voir comment configurer le `PromptLayerCallbackHandler`.

Voir [la documentation PromptLayer](https://docs.promptlayer.com/languages/langchain) pour plus d'informations.

## Installation et configuration

```python
%pip install --upgrade --quiet  promptlayer --upgrade
```

### Obtenir les identifiants de l'API

Si vous n'avez pas de compte PromptLayer, créez-en un sur [promptlayer.com](https://www.promptlayer.com). Ensuite, obtenez une clé d'API en cliquant sur l'icône des paramètres dans la barre de navigation et définissez-la en tant que variable d'environnement appelée `PROMPTLAYER_API_KEY`.

## Utilisation

Commencer avec `PromptLayerCallbackHandler` est assez simple, il prend deux arguments optionnels :
1. `pl_tags` - une liste facultative de chaînes de caractères qui seront suivies en tant qu'étiquettes sur PromptLayer.
2. `pl_id_callback` - une fonction facultative qui prendra `promptlayer_request_id` comme argument. Cet identifiant peut être utilisé avec toutes les fonctionnalités de suivi de PromptLayer pour suivre les métadonnées, les scores et l'utilisation des invites.

## Exemple simple avec OpenAI

Dans cet exemple simple, nous utilisons `PromptLayerCallbackHandler` avec `ChatOpenAI`. Nous ajoutons une étiquette PromptLayer nommée `chatopenai`.

```python
import promptlayer  # Don't forget this 🍰
from langchain_community.callbacks.promptlayer_callback import (
    PromptLayerCallbackHandler,
)
```

```python
from langchain.schema import (
    HumanMessage,
)
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    temperature=0,
    callbacks=[PromptLayerCallbackHandler(pl_tags=["chatopenai"])],
)
llm_results = chat_llm.invoke(
    [
        HumanMessage(content="What comes after 1,2,3 ?"),
        HumanMessage(content="Tell me another joke?"),
    ]
)
print(llm_results)
```

## Exemple avec GPT4All

```python
from langchain_community.llms import GPT4All

model = GPT4All(model="./models/gpt4all-model.bin", n_ctx=512, n_threads=8)
callbacks = [PromptLayerCallbackHandler(pl_tags=["langchain", "gpt4all"])]

response = model.invoke(
    "Once upon a time, ",
    config={"callbacks": callbacks},
)
```

## Exemple complet

Dans cet exemple, nous exploitons davantage la puissance de `PromptLayer`.

PromptLayer vous permet de créer, de versionner et de suivre visuellement les modèles d'invite. En utilisant le [Prompt Registry](https://docs.promptlayer.com/features/prompt-registry), nous pouvons récupérer par programmation le modèle d'invite appelé `example`.

Nous définissons également une fonction `pl_id_callback` qui prend le `promptlayer_request_id` et enregistre un score, des métadonnées et lie le modèle d'invite utilisé. Lisez-en plus sur le suivi dans [notre documentation](https://docs.promptlayer.com/features/prompt-history/request-id).

```python
from langchain_openai import OpenAI


def pl_id_callback(promptlayer_request_id):
    print("prompt layer id ", promptlayer_request_id)
    promptlayer.track.score(
        request_id=promptlayer_request_id, score=100
    )  # score is an integer 0-100
    promptlayer.track.metadata(
        request_id=promptlayer_request_id, metadata={"foo": "bar"}
    )  # metadata is a dictionary of key value pairs that is tracked on PromptLayer
    promptlayer.track.prompt(
        request_id=promptlayer_request_id,
        prompt_name="example",
        prompt_input_variables={"product": "toasters"},
        version=1,
    )  # link the request to a prompt template


openai_llm = OpenAI(
    model_name="gpt-3.5-turbo-instruct",
    callbacks=[PromptLayerCallbackHandler(pl_id_callback=pl_id_callback)],
)

example_prompt = promptlayer.prompts.get("example", version=1, langchain=True)
openai_llm.invoke(example_prompt.format(product="toasters"))
```

C'est tout ce qu'il faut ! Après la configuration, toutes vos requêtes apparaîtront sur le tableau de bord PromptLayer.
Ce rappel fonctionne également avec n'importe quel LLM implémenté sur LangChain.
