---
translated: true
---

# Agent Fonctions OpenAI - Gmail

Vous avez déjà eu du mal à atteindre zéro inbox ?

En utilisant ce modèle, vous pouvez créer et personnaliser votre propre assistant IA pour gérer votre compte Gmail. En utilisant les outils Gmail par défaut, il peut lire, rechercher et rédiger des emails pour répondre en votre nom. Il a également accès à un moteur de recherche Tavily afin de rechercher des informations pertinentes sur n'importe quel sujet ou personne dans la conversation avant d'écrire, garantissant que les brouillons incluent toutes les informations nécessaires pour paraître bien informé.

## Les détails

Cet assistant utilise le support [fonction calling](https://python.langchain.com/docs/modules/chains/how_to/openai_functions) d'OpenAI pour sélectionner et invoquer de manière fiable les outils que vous avez fournis.

Ce modèle importe également directement depuis [langchain-core](https://pypi.org/project/langchain-core/) et [`langchain-community`](https://pypi.org/project/langchain-community/) lorsque cela est approprié. Nous avons restructuré LangChain pour vous permettre de sélectionner les intégrations spécifiques nécessaires à votre cas d'utilisation. Bien que vous puissiez toujours importer depuis `langchain` (nous rendons cette transition rétrocompatible), nous avons séparé les foyers de la plupart des classes pour refléter la propriété et alléger vos listes de dépendances. La plupart des intégrations dont vous avez besoin se trouvent dans le package `langchain-community`, et si vous utilisez uniquement les API de langage d'expression de base, vous pouvez même construire uniquement sur `langchain-core`.

## Configuration de l'environnement

Les variables d'environnement suivantes doivent être définies :

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Définissez la variable d'environnement `TAVILY_API_KEY` pour accéder à la recherche Tavily.

Créez un fichier [`credentials.json`](https://developers.google.com/gmail/api/quickstart/python#authorize_credentials_for_a_desktop_application) contenant votre ID client OAuth de Gmail. Pour personnaliser l'authentification, consultez la section [Personnaliser Auth](#customize-auth) ci-dessous.

_*Remarque:* La première fois que vous exécutez cette application, elle vous obligera à suivre un flux d'authentification utilisateur._

(Facultatif) : Définissez `GMAIL_AGENT_ENABLE_SEND` sur `true` (ou modifiez le fichier `agent.py` dans ce modèle) pour lui donner accès à l'outil "Envoyer". Cela donnera à votre assistant la permission d'envoyer des emails en votre nom sans votre examen explicite, ce qui n'est pas recommandé.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir le CLI LangChain installé :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer ceci comme le seul package, vous pouvez faire :

```shell
langchain app new my-app --package openai-functions-agent-gmail
```

Si vous souhaitez ajouter ceci à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add openai-functions-agent-gmail
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from openai_functions_agent import agent_executor as openai_functions_agent_chain

add_routes(app, openai_functions_agent_chain, path="/openai-functions-agent-gmail")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez ignorer cette section

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur fonctionnant localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/openai-functions-agent-gmail/playground](http://127.0.0.1:8000/openai-functions-agent/playground)

Nous pouvons accéder au modèle depuis le code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-agent-gmail")
```

## Personnaliser Auth

```python
from langchain_community.tools.gmail.utils import build_resource_service, get_gmail_credentials

# Can review scopes here https://developers.google.com/gmail/api/auth/scopes
# For instance, readonly scope is 'https://www.googleapis.com/auth/gmail.readonly'
credentials = get_gmail_credentials(
    token_file="token.json",
    scopes=["https://mail.google.com/"],
    client_secrets_file="credentials.json",
)
api_resource = build_resource_service(credentials=credentials)
toolkit = GmailToolkit(api_resource=api_resource)
```
