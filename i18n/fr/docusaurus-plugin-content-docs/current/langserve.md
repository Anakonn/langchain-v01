---
fixed: true
translated: true
---

# 🦜️🏓 LangServe

[![Release Notes](https://img.shields.io/github/release/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/releases)
[![Downloads](https://static.pepy.tech/badge/langserve/month)](https://pepy.tech/project/langserve)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)

🚩 Nous allons lancer une version hébergée de LangServe pour des déploiements en un clic des
applications LangChain. [Inscrivez-vous ici](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm)
pour vous inscrire sur la liste d'attente.

## Vue d'ensemble

[LangServe](https://github.com/langchain-ai/langserve) aide les développeurs
à déployer `LangChain` [runnables et chaînes](https://python.langchain.com/docs/expression_language/)
en tant qu'API REST.

Cette bibliothèque est intégrée avec [FastAPI](https://fastapi.tiangolo.com/) et
utilise [pydantic](https://docs.pydantic.dev/latest/) pour la validation des données.

De plus, elle fournit un client qui peut être utilisé pour appeler des runnables déployés sur un
serveur.
Un client JavaScript est disponible
dans [LangChain.js](https://js.langchain.com/docs/ecosystem/langserve).

## Fonctionnalités

- Schémas d'entrée et de sortie automatiquement inférés de votre objet LangChain, et
  appliqués à chaque appel d'API, avec des messages d'erreur riches
- Page de documentation de l'API avec JSONSchema et Swagger (insérer un lien d'exemple)
- Endpoints efficaces `/invoke`, `/batch` et `/stream` avec support pour de nombreuses
  requêtes concurrentes sur un seul serveur
- Endpoint `/stream_log` pour streamer toutes (ou certaines) étapes intermédiaires de votre
  chaîne/agent
- **nouveau** depuis la version 0.0.40, supporte `/stream_events` pour faciliter le streaming sans besoin d'analyser la sortie de `/stream_log`.
- Page de playground à `/playground/` avec sortie de streaming et étapes intermédiaires
- Traçage intégré (optionnel) vers [LangSmith](https://www.langchain.com/langsmith), il suffit
  d'ajouter votre clé API (voir [Instructions](https://docs.smith.langchain.com/)))
- Tout est construit avec des bibliothèques Python open-source éprouvées comme FastAPI, Pydantic,
  uvloop et asyncio.
- Utilisez le SDK client pour appeler un serveur LangServe comme s'il s'agissait d'un Runnable fonctionnant
  localement (ou appeler directement l'API HTTP)
- [LangServe Hub](https://github.com/langchain-ai/langchain/blob/master/templates/README.md)

## Limitations

- Les callbacks clients ne sont pas encore supportés pour les événements qui proviennent du serveur
- Les documents OpenAPI ne seront pas générés lors de l'utilisation de Pydantic V2. Fast API ne supporte pas
  [le mélange des namespaces pydantic v1 et v2](https://github.com/tiangolo/fastapi/issues/10360).
  Voir la section ci-dessous pour plus de détails.

## LangServe hébergé

Nous allons lancer une version hébergée de LangServe pour des déploiements en un clic des
applications LangChain. [Inscrivez-vous ici](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm)
pour vous inscrire sur la liste d'attente.

## Sécurité

- Vulnérabilité dans les versions 0.0.13 - 0.0.15 -- le endpoint playground permet d'accéder
  à des fichiers arbitraires sur
  le serveur. [Résolu dans la version 0.0.16](https://github.com/langchain-ai/langserve/pull/98).

## Installation

Pour les deux, client et serveur :

```bash
pip install "langserve[all]"
```

ou `pip install "langserve[client]"` pour le code client,
et `pip install "langserve[server]"` pour le code serveur.

## LangChain CLI 🛠️

Utilisez le CLI `LangChain` pour démarrer rapidement un projet `LangServe`.

Pour utiliser le CLI langchain assurez-vous d'avoir une version récente de `langchain-cli`
installée. Vous pouvez l'installer avec `pip install -U langchain-cli`.

## Configuration

**Remarque**: Nous utilisons `poetry` pour la gestion des dépendances. Veuillez suivre la [documentation](https://python-poetry.org/docs/) de poetry pour en savoir plus.

### 1. Créez une nouvelle application en utilisant la commande CLI langchain

```sh
langchain app new my-app
```

### 2. Définissez le runnable dans add_routes. Allez dans server.py et éditez

```sh
add_routes(app. NotImplemented)
```

### 3. Utilisez `poetry` pour ajouter des packages tiers (par exemple, langchain-openai, langchain-anthropic, langchain-mistral etc).

```sh
poetry add [package-name] // e.g `poetry add langchain-openai`
```

### 4. Configurez les variables d'environnement pertinentes. Par exemple,

```sh
export OPENAI_API_KEY="sk-..."
```

### 5. Servez votre application

```sh
poetry run langchain serve --port=8100
```

## Exemples

Démarrez rapidement votre instance LangServe avec
[LangChain Templates](https://github.com/langchain-ai/langchain/blob/master/templates/README.md).

Pour plus d'exemples, voir les templates
[index](https://github.com/langchain-ai/langchain/blob/master/templates/docs/INDEX.md)
ou le [répertoire d'exemples](https://github.com/langchain-ai/langserve/tree/main/examples).

| Description                                                                                                                                                                                                                                                        | Liens                                                                                                                                                                                                                               |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLMs** Exemple minimal qui réserve les modèles de chat OpenAI et Anthropic. Utilise async, supporte le batching et le streaming.                                                                                                                                              | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/llm/server.py), [client](https://github.com/langchain-ai/langserve/blob/main/examples/llm/client.ipynb)                                                       |
| **Retriever** Serveur simple qui expose un retriever en tant que runnable.                                                                                                                                                                                                | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/client.ipynb)                                           |
| **Conversational Retriever** Un [Conversational Retriever](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) exposé via LangServe                                                                           | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/client.ipynb) |
| **Agent** sans **historique de conversation** basé sur [OpenAI tools](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent)                                                                                                            | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/agent/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/agent/client.ipynb)                                                   |
| **Agent** avec **historique de conversation** basé sur [OpenAI tools](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent)                                                                                                               | [serveur](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/server.py), [client](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/client.ipynb)                         |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history) pour implémenter un chat persisté sur le backend, basé sur un `session_id` fourni par le client.                                                                    | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/client.ipynb)                   |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history) pour implémenter un chat persisté sur le backend, basé sur un `conversation_id` fourni par le client, et `user_id` (voir Auth pour implémenter correctement `user_id`). | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/client.ipynb) |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure) pour créer un retriever qui supporte la configuration du nom de l'index au moment de l'exécution.                                                                                      | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/client.ipynb)                 |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure) qui montre les champs configurables et les alternatives configurables.                                                                                                      | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/client.ipynb)                         |
| **APIHandler** Montre comment utiliser `APIHandler` au lieu de `add_routes`. Cela offre plus de flexibilité aux développeurs pour définir des endpoints. Fonctionne bien avec tous les patterns FastAPI, mais nécessite un peu plus d'effort.                                                        | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py)                                                                                                                               |
| **LCEL Example** Exemple utilisant LCEL pour manipuler une entrée de dictionnaire.                                                                                                                                                                                          | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/client.ipynb)                             |
| **Auth** avec `add_routes`: Authentification simple qui peut être appliquée à tous les endpoints associés à l'application. (Pas utile en soi pour implémenter une logique par utilisateur.)                                                                                           | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                                   |
| **Auth** avec `add_routes`: Mécanisme d'authentification simple basé sur les dépendances de chemin. (Pas utile en soi pour implémenter une logique par utilisateur.)                                                                                                                    | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                             |
| **Auth** avec `add_routes`: Implémenter une logique par utilisateur et une authentification pour les endpoints utilisant un modificateur de configuration par requête. (**Remarque**: Pour le moment, ne s'intègre pas avec les documents OpenAPI.)                                                                                 | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb)     |
| **Auth** avec `APIHandler`: Implémenter une logique par utilisateur et une authentification montrant comment rechercher uniquement dans les documents possédés par l'utilisateur.                                                                                                                                           | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)                             |
| **Widgets** Différents widgets pouvant être utilisés avec le playground (upload de fichiers et chat)                                                                                                                                                                              | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py)                                                                                                                                |
| **Widgets** Widget d'upload de fichiers utilisé pour le playground LangServe.                                                                                                                                                                                                      | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb)                               |

## Application Exemple

### Serveur

Voici un serveur qui déploie un modèle de chat OpenAI, un modèle de chat Anthropic, et une chaîne
qui utilise
le modèle Anthropic pour raconter une blague sur un sujet.

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatAnthropic", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.anthropic.ChatAnthropic.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatOpenAI", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.openai.ChatOpenAI.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
#!/usr/bin/env python
from fastapi import FastAPI
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatAnthropic, ChatOpenAI
from langserve import add_routes

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using Langchain's Runnable interfaces",
)

add_routes(
    app,
    ChatOpenAI(),
    path="/openai",
)

add_routes(
    app,
    ChatAnthropic(),
    path="/anthropic",
)

model = ChatAnthropic()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
add_routes(
    app,
    prompt | model,
    path="/joke",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
```

Si vous avez l'intention d'appeler votre endpoint depuis le navigateur, vous devrez également définir les en-têtes CORS.
Vous pouvez utiliser le middleware intégré de FastAPI pour cela :

```python
from fastapi.middleware.cors import CORSMiddleware

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

### Documentation

Si vous avez déployé le serveur ci-dessus, vous pouvez consulter les documents OpenAPI générés en utilisant :

> ⚠️ Si vous utilisez pydantic v2, les documents ne seront pas générés pour _invoke_, _batch_, _stream_,
> _stream_log_. Voir la section [Pydantic](#pydantic) ci-dessous pour plus de détails.

```sh
curl localhost:8000/docs
```

assurez-vous d'**ajouter** le suffixe `/docs`.

> ⚠️ La page d'index `/` n'est pas définie par **conception**, donc `curl localhost:8000` ou visiter
> l'URL
> retournera un 404. Si vous souhaitez du contenu à `/` définissez un endpoint `@app.get("/")`.

### Client

SDK Python

```python
<!--IMPORTS:[{"imported": "SystemMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "HumanMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "RunnableMap", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableMap.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->

from langchain.schema import SystemMessage, HumanMessage
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableMap
from langserve import RemoteRunnable

openai = RemoteRunnable("http://localhost:8000/openai/")
anthropic = RemoteRunnable("http://localhost:8000/anthropic/")
joke_chain = RemoteRunnable("http://localhost:8000/joke/")

joke_chain.invoke({"topic": "parrots"})

# or async
await joke_chain.ainvoke({"topic": "parrots"})

prompt = [
    SystemMessage(content='Act like either a cat or a parrot.'),
    HumanMessage(content='Hello!')
]

# Supports astream
async for msg in anthropic.astream(prompt):
    print(msg, end="", flush=True)

prompt = ChatPromptTemplate.from_messages(
    [("system", "Tell me a long story about {topic}")]
)

# Can define custom chains
chain = prompt | RunnableMap({
    "openai": openai,
    "anthropic": anthropic,
})

chain.batch([{"topic": "parrots"}, {"topic": "cats"}])
```

En TypeScript (nécessite LangChain.js version 0.0.166 ou ultérieure):

```typescript
import { RemoteRunnable } from "@langchain/core/runnables/remote";

const chain = new RemoteRunnable({
  url: `http://localhost:8000/joke/`,
});
const result = await chain.invoke({
  topic: "cats",
});
```

Python utilisant `requests`:

```python
import requests

response = requests.post(
    "http://localhost:8000/joke/invoke",
    json={'input': {'topic': 'cats'}}
)
response.json()
```

Vous pouvez également utiliser `curl`:

```sh
curl --location --request POST 'http://localhost:8000/joke/invoke' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "input": {
            "topic": "cats"
        }
    }'
```

## Endpoints

Le code suivant:

```python
...
add_routes(
    app,
    runnable,
    path="/my_runnable",
)
```

ajoute ces endpoints au serveur :

- `POST /my_runnable/invoke` - invoquer le runnable sur une seule entrée
- `POST /my_runnable/batch` - invoquer le runnable sur un lot d'entrées
- `POST /my_runnable/stream` - invoquer sur une seule entrée et diffuser la sortie
- `POST /my_runnable/stream_log` - invoquer sur une seule entrée et diffuser la sortie, y compris la sortie des étapes intermédiaires au fur et à mesure qu'elles sont générées
- `POST /my_runnable/astream_events` - invoquer sur une seule entrée et diffuser des événements au fur et à mesure qu'ils sont générés, y compris à partir d'étapes intermédiaires.
- `GET /my_runnable/input_schema` - schéma json pour l'entrée du runnable
- `GET /my_runnable/output_schema` - schéma json pour la sortie du runnable
- `GET /my_runnable/config_schema` - schéma json pour la configuration du runnable

Ces endpoints correspondent à
l'[interface LangChain Expression Language](https://python.langchain.com/docs/expression_language/interface) -- veuillez vous référer à cette documentation pour plus de détails.

## Playground

Vous pouvez trouver une page de playground pour votre runnable à `/my_runnable/playground/`. Cela
expose une interface utilisateur simple pour [configurer](https://python.langchain.com/docs/expression_language/how_to/configure) et invoquer votre runnable avec une sortie en flux et des étapes intermédiaires.

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/5ca56e29-f1bb-40f4-84b5-15916384a276" width="50%"/>
</p>

### Widgets

Le playground prend en charge les [widgets](#playground-widgets) et peut être utilisé pour tester votre runnable avec différentes entrées. Voir la section [widgets](#widgets) ci-dessous pour plus de détails.

### Partage

De plus, pour les runnables configurables, le playground vous permettra de configurer le runnable et de partager un lien avec la configuration :

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/86ce9c59-f8e4-4d08-9fa3-62030e0f521d" width="50%"/>
</p>

## Chat playground

LangServe prend également en charge un playground axé sur le chat que vous pouvez activer et utiliser sous `/my_runnable/playground/`.
Contrairement au playground général, seuls certains types de runnables sont pris en charge - le schéma d'entrée du runnable doit
être un `dict` avec soit :

- une seule clé, et la valeur de cette clé doit être une liste de messages de chat.
- deux clés, dont l'une des valeurs est une liste de messages, et l'autre représentant le message le plus récent.

Nous vous recommandons d'utiliser le premier format.

Le runnable doit également renvoyer soit un `AIMessage` soit une chaîne de caractères.

Pour l'activer, vous devez définir `playground_type="chat",` lors de l'ajout de votre route. Voici un exemple :

```python
# Declare a chain
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful, professional assistant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class InputChat(BaseModel):
    """Input for the chat endpoint."""

    messages: List[Union[HumanMessage, AIMessage, SystemMessage]] = Field(
        ...,
        description="The chat messages representing the current conversation.",
    )


add_routes(
    app,
    chain.with_types(input_type=InputChat),
    enable_feedback_endpoint=True,
    enable_public_trace_link_endpoint=True,
    playground_type="chat",
)
```

Si vous utilisez LangSmith, vous pouvez également définir `enable_feedback_endpoint=True` sur votre route pour activer les boutons de pouce vers le haut/pouce vers le bas après chaque message, et `enable_public_trace_link_endpoint=True` pour ajouter un bouton qui crée des traces publiques pour les exécutions.
Notez que vous devrez également définir les variables d'environnement suivantes :

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_PROJECT="YOUR_PROJECT_NAME"
export LANGCHAIN_API_KEY="YOUR_API_KEY"
```

Voici un exemple avec les deux options ci-dessus activées :

<p align="center">
<img src="./.github/img/chat_playground.png" width="50%"/>
</p>

Remarque : Si vous activez les liens de traces publiques, les internes de votre chaîne seront exposés. Nous recommandons d'utiliser ce paramètre uniquement pour des démos ou des tests.

## Legacy Chains

LangServe fonctionne avec les Runnables (construits via [LangChain Expression Language](https://python.langchain.com/docs/expression_language/)) et les chaînes héritées (héritant de `Chain`). Cependant, certains des schémas d'entrée pour les chaînes héritées peuvent être incomplets/incorrects, entraînant des erreurs.
Cela peut être corrigé en mettant à jour la propriété `input_schema` de ces chaînes dans LangChain. Si vous rencontrez des erreurs, veuillez ouvrir un problème sur CE dépôt, et nous travaillerons pour y remédier.

## Déploiement

### Déployer sur AWS

Vous pouvez déployer sur AWS en utilisant le [AWS Copilot CLI](https://aws.github.io/copilot-cli/)

```bash
copilot init --app [application-name] --name [service-name] --type 'Load Balanced Web Service' --dockerfile './Dockerfile' --deploy
```

Cliquez [ici](https://aws.amazon.com/containers/copilot/) pour en savoir plus.

### Déployer sur Azure

Vous pouvez déployer sur Azure en utilisant Azure Container Apps (Serverless) :

```shell
az containerapp up --name [container-app-name] --source . --resource-group [resource-group-name] --environment  [environment-name] --ingress external --target-port 8001 --env-vars=OPENAI_API_KEY=your_key
```

Vous pouvez trouver plus d'informations [ici](https://learn.microsoft.com/en-us/azure/container-apps/containerapp-up)

### Déployer sur GCP

Vous pouvez déployer sur GCP Cloud Run en utilisant la commande suivante :

```shell
gcloud run deploy [your-service-name] --source . --port 8001 --allow-unauthenticated --region us-central1 --set-env-vars=OPENAI_API_KEY=your_key
```

### Contribution de la communauté

#### Déployer sur Railway

[Exemple de dépôt Railway](https://github.com/PaulLockett/LangServe-Railway/tree/main)

[![Déployer sur Railway](https://railway.app/button.svg)](https://railway.app/template/pW9tXP?referralCode=c-aq4K)

## Pydantic

LangServe prend en charge Pydantic 2 avec certaines limitations.

1. Les documents OpenAPI ne seront pas générés pour invoke/batch/stream/stream_log lors de l'utilisation de Pydantic V2. Fast API ne prend pas en charge [le mélange des namespaces pydantic v1 et v2].
2. LangChain utilise le namespace v1 dans Pydantic v2. Veuillez lire les [directives suivantes pour assurer la compatibilité avec LangChain](https://github.com/langchain-ai/langchain/discussions/9337)

À l'exception de ces limitations, nous nous attendons à ce que les endpoints API, le playground et toutes les autres fonctionnalités fonctionnent comme prévu.

## Avancé

### Gestion de l'authentification

Si vous avez besoin d'ajouter de l'authentification à votre serveur, veuillez lire la documentation de Fast API sur les [dépendances](https://fastapi.tiangolo.com/tutorial/dependencies/) et la [sécurité](https://fastapi.tiangolo.com/tutorial/security/).

Les exemples ci-dessous montrent comment connecter la logique d'authentification aux endpoints LangServe en utilisant les primitives FastAPI.

Vous êtes responsable de fournir la logique d'authentification réelle, la table des utilisateurs, etc.

Si vous n'êtes pas sûr de ce que vous faites, vous pouvez essayer d'utiliser une solution existante [Auth0](https://auth0.com/).

#### Utilisation de add_routes

Si vous utilisez `add_routes`, consultez les exemples [ici](https://github.com/langchain-ai/langserve/tree/main/examples/auth).

| Description                                                                                                                                                                        | Liens                                                                                                                                                                                                                           |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** avec `add_routes` : Authentification simple pouvant être appliquée à tous les endpoints associés à l'application. (Pas utile en soi pour implémenter une logique par utilisateur.)           | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                               |
| **Auth** avec `add_routes` : Mécanisme d'authentification simple basé sur les dépendances de chemin. (Pas utile en soi pour implémenter une logique par utilisateur.)                                    | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                         |
| **Auth** avec `add_routes` : Implémenter une logique par utilisateur et une authentification pour les endpoints qui utilisent un modificateur de configuration par requête. (**Remarque** : Pour le moment, ne s'intègre pas avec les documents OpenAPI.) | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb) |

Alternativement, vous pouvez utiliser le [middleware](https://fastapi.tiangolo.com/tutorial/middleware/) de FastAPI.

Utiliser des dépendances globales et des dépendances de chemin a l'avantage que l'auth sera correctement prise en charge dans la page de documentation OpenAPI, mais ces options ne sont pas suffisantes pour implémenter une logique par utilisateur (par exemple, créer une application qui ne peut rechercher que dans les documents appartenant à l'utilisateur).

Si vous devez implémenter une logique par utilisateur, vous pouvez utiliser le `per_req_config_modifier` ou `APIHandler` (ci-dessous) pour implémenter cette logique.

**Par utilisateur**

Si vous avez besoin d'une autorisation ou d'une logique dépendant de l'utilisateur, spécifiez `per_req_config_modifier` lors de l'utilisation de `add_routes`. Utilisez un callable qui reçoit l'objet `Request` brut et peut en extraire les informations pertinentes pour l'authentification et les autorisations.

#### Utilisation de APIHandler

Si vous vous sentez à l'aise avec FastAPI et python, vous pouvez utiliser le [APIHandler](https://github.com/langchain-ai/langserve/blob/main/examples/api_handler_examples/server.py) de LangServe.

| Description                                                                                                                                                                                                 | Liens                                                                                                                                                                                                           |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** avec `APIHandler` : Implémenter une logique par utilisateur et une authentification montrant comment rechercher uniquement dans les documents appartenant à l'utilisateur.                                                                                    | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)         |
| **APIHandler** Montre comment utiliser `APIHandler` au lieu de `add_routes`. Cela fournit plus de flexibilité aux développeurs pour définir des endpoints. Fonctionne bien avec tous les modèles FastAPI, mais demande un peu plus d'effort. | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/client.ipynb) |

C'est un peu plus de travail, mais cela vous donne un contrôle total sur la définition des endpoints, vous pouvez donc faire toute la logique personnalisée dont vous avez besoin pour l'authentification.

### Fichiers

Les applications LLM traitent souvent des fichiers. Il existe différentes architectures
qui peuvent être mises en place pour implémenter le traitement des fichiers ; à un niveau élevé :

1. Le fichier peut être téléchargé sur le serveur via un point de terminaison dédié et traité en utilisant un
   point de terminaison séparé
2. Le fichier peut être téléchargé soit par valeur (octets du fichier) soit par référence (par exemple, URL s3
   pour le contenu du fichier)
3. Le point de terminaison de traitement peut être bloquant ou non bloquant
4. Si un traitement significatif est requis, le traitement peut être délégué à un pool de processus dédié

Vous devez déterminer quelle est l'architecture appropriée pour votre application.

Actuellement, pour télécharger des fichiers par valeur vers un runnable, utilisez l'encodage base64 pour le
fichier (`multipart/form-data` n'est pas encore supporté).

Voici
un [exemple](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing)
qui montre
comment utiliser l'encodage base64 pour envoyer un fichier à un runnable distant.

N'oubliez pas que vous pouvez toujours télécharger des fichiers par référence (par exemple, URL s3) ou les télécharger en tant que
multipart/form-data vers un point de terminaison dédié.

### Types d'Entrée et de Sortie Personnalisés

Les types d'entrée et de sortie sont définis sur tous les runnables.

Vous pouvez y accéder via les propriétés `input_schema` et `output_schema`.

`LangServe` utilise ces types pour la validation et la documentation.

Si vous souhaitez remplacer les types déduits par défaut, vous pouvez utiliser la méthode `with_types`.

Voici un exemple simple pour illustrer l'idée :

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from typing import Any

from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

app = FastAPI()


def func(x: Any) -> int:
    """Mistyped function that should accept an int but accepts anything."""
    return x + 1


runnable = RunnableLambda(func).with_types(
    input_type=int,
)

add_routes(app, runnable)
```

### Types d'Utilisateurs Personnalisés

Héritez de `CustomUserType` si vous souhaitez que les données se désérialisent dans un
modèle pydantic plutôt que l'équivalent de la représentation dict.

Pour le moment, ce type ne fonctionne que côté _serveur_ et est utilisé
pour spécifier le comportement de _décodage_ souhaité. Si vous héritez de ce type,
le serveur conservera le type décodé en tant que modèle pydantic au lieu de le convertir en dict.

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

from langserve import add_routes
from langserve.schema import CustomUserType

app = FastAPI()


class Foo(CustomUserType):
    bar: int


def func(foo: Foo) -> int:
    """Sample function that expects a Foo type which is a pydantic model"""
    assert isinstance(foo, Foo)
    return foo.bar


# Note that the input and output type are automatically inferred!
# You do not need to specify them.
# runnable = RunnableLambda(func).with_types( # <-- Not needed in this case
#     input_type=Foo,
#     output_type=int,
#
add_routes(app, RunnableLambda(func), path="/foo")
```

### Widgets du Terrain de Jeu

Le terrain de jeu vous permet de définir des widgets personnalisés pour votre runnable depuis le backend.

Voici quelques exemples :

| Description                                                                           | Liens                                                                                                                                                                                                 |
| :------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Widgets** Différents widgets qui peuvent être utilisés avec le terrain de jeu (téléchargement de fichiers et chat) | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/client.ipynb)     |
| **Widgets** Widget de téléchargement de fichiers utilisé pour le terrain de jeu LangServe.                         | [serveur](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb) |

#### Schéma

- Un widget est spécifié au niveau du champ et expédié dans le cadre du schéma JSON du
  type d'entrée
- Un widget doit contenir une clé appelée `type` avec la valeur étant l'un d'une liste bien connue
  de widgets
- Les autres clés de widget seront associées à des valeurs décrivant des chemins dans un objet JSON

```typescript
type JsonPath = number | string | (number | string)[];
type NameSpacedPath = { title: string; path: JsonPath }; // Using title to mimick json schema, but can use namespace
type OneOfPath = { oneOf: JsonPath[] };

type Widget = {
  type: string; // Some well known type (e.g., base64file, chat etc.)
  [key: string]: JsonPath | NameSpacedPath | OneOfPath;
};
```

### Widgets Disponibles

Il n'y a que deux widgets que l'utilisateur peut spécifier manuellement pour le moment :

1. Widget de Téléchargement de Fichiers
2. Widget d'Historique de Chat

Voir ci-dessous plus d'informations sur ces widgets.

Tous les autres widgets sur l'interface utilisateur du terrain de jeu sont créés et gérés automatiquement par l'interface utilisateur
basée sur le schéma de configuration du Runnable. Lorsque vous créez des Runnables Configurables,
le terrain de jeu devrait créer des widgets appropriés pour vous permettre de contrôler le comportement.

#### Widget de Téléchargement de Fichiers

Permet la création d'une entrée de téléchargement de fichiers dans l'interface utilisateur du terrain de jeu pour les fichiers
qui sont téléchargés sous forme de chaînes encodées en base64. Voici le
[exemple complet](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing).

Extrait :

```python
try:
    from pydantic.v1 import Field
except ImportError:
    from pydantic import Field

from langserve import CustomUserType


# ATTENTION: Inherit from CustomUserType instead of BaseModel otherwise
#            the server will decode it into a dict instead of a pydantic model.
class FileProcessingRequest(CustomUserType):
    """Request including a base64 encoded file."""

    # The extra field is used to specify a widget for the playground UI.
    file: str = Field(..., extra={"widget": {"type": "base64file"}})
    num_chars: int = 100

```

Exemple de widget :

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/52199e46-9464-4c2e-8be8-222250e08c3f" width="50%"/>
</p>

### Widget de Chat

Regardez
l'[exemple de widget](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py).

Pour définir un widget de chat, assurez-vous de passer "type": "chat".

- "input" est JSONPath vers le champ dans la _Requête_ qui contient le nouveau message d'entrée.
- "output" est JSONPath vers le champ dans la _Réponse_ qui contient le(s) nouveau(x) message(s) de sortie.
- Ne spécifiez pas ces champs si l'entrée ou la sortie entière doit être utilisée telle quelle (
  par exemple, si la sortie est une liste de messages de chat.)

Voici un extrait :

```python
class ChatHistory(CustomUserType):
    chat_history: List[Tuple[str, str]] = Field(
        ...,
        examples=[[("human input", "ai response")]],
        extra={"widget": {"type": "chat", "input": "question", "output": "answer"}},
    )
    question: str


def _format_to_messages(input: ChatHistory) -> List[BaseMessage]:
    """Format the input to a list of messages."""
    history = input.chat_history
    user_input = input.question

    messages = []

    for human, ai in history:
        messages.append(HumanMessage(content=human))
        messages.append(AIMessage(content=ai))
    messages.append(HumanMessage(content=user_input))
    return messages


model = ChatOpenAI()
chat_model = RunnableParallel({"answer": (RunnableLambda(_format_to_messages) | model)})
add_routes(
    app,
    chat_model.with_types(input_type=ChatHistory),
    config_keys=["configurable"],
    path="/chat",
)
```

Exemple de widget :

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/a71ff37b-a6a9-4857-a376-cf27c41d3ca4" width="50%"/>
</p>

Vous pouvez également spécifier une liste de messages en tant que paramètre directement, comme montré dans cet extrait :

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assisstant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class MessageListInput(BaseModel):
    """Input for the chat endpoint."""
    messages: List[Union[HumanMessage, AIMessage]] = Field(
        ...,
        description="The chat messages representing the current conversation.",
        extra={"widget": {"type": "chat", "input": "messages"}},
    )


add_routes(
    app,
    chain.with_types(input_type=MessageListInput),
    path="/chat",
)
```

Voir [ce fichier d'exemple](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/message_list/server.py) pour un exemple.

### Activation / Désactivation des Points de Terminaison (LangServe >=0.0.33)

Vous pouvez activer / désactiver les points de terminaison qui sont exposés lors de l'ajout de routes pour une chaîne donnée.

Utilisez `enabled_endpoints` si vous voulez vous assurer de ne jamais obtenir un nouveau point de terminaison lors de la mise à niveau de langserve à une version plus récente.

Activer : Le code ci-dessous n'activera que `invoke`, `batch` et les
variantes correspondantes du point de terminaison `config_hash`.

```python
add_routes(app, chain, enabled_endpoints=["invoke", "batch", "config_hashes"], path="/mychain")
```

Désactiver : Le code ci-dessous désactivera le terrain de jeu pour la chaîne

```python
add_routes(app, chain, disabled_endpoints=["playground"], path="/mychain")
```
