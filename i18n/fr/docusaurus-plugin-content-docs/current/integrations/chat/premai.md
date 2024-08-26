---
sidebar_label: PremAI
translated: true
---

# ChatPremAI

>[PremAI](https://app.premai.io) est une plateforme unifiée qui vous permet de construire des applications prêtes pour la production et alimentées par GenAI avec le moins d'efforts possible, afin que vous puissiez vous concentrer davantage sur l'expérience utilisateur et la croissance globale.

Cet exemple explique comment utiliser LangChain pour interagir avec `ChatPremAI`.

### Installation et configuration

Nous commençons par installer langchain et premai-sdk. Vous pouvez taper la commande suivante pour installer :

```bash
pip install premai langchain
```

Avant de continuer, assurez-vous d'avoir créé un compte sur PremAI et démarré un projet. Sinon, voici comment vous pouvez commencer gratuitement :

1. Connectez-vous à [PremAI](https://app.premai.io/accounts/login/), si c'est votre première visite, et créez votre clé API [ici](https://app.premai.io/api_keys/).

2. Allez sur [app.premai.io](https://app.premai.io), ce qui vous amènera au tableau de bord du projet.

3. Créez un projet, ce qui générera un ID de projet (écrit comme ID). Cet ID vous aidera à interagir avec votre application déployée.

4. Rendez-vous sur LaunchPad (celui avec l'icône 🚀). Là, déployez le modèle de votre choix. Votre modèle par défaut sera `gpt-4`. Vous pouvez également définir et fixer différents paramètres de génération (comme max-tokens, température, etc.) et pré-définir votre invite système.

Félicitations pour la création de votre première application déployée sur PremAI 🎉 Maintenant, nous pouvons utiliser langchain pour interagir avec notre application.

```python
from langchain_community.chat_models import ChatPremAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## Configuration de l'instance ChatPremAI dans LangChain

Une fois que nous avons importé les modules requis, configurons notre client. Pour l'instant, supposons que notre `project_id` est 8. Mais assurez-vous d'utiliser votre propre ID de projet, sinon cela générera une erreur.

Pour utiliser langchain avec prem, vous n'avez pas besoin de passer de nom de modèle ou de définir des paramètres avec notre client de chat. Tous ces paramètres utiliseront le nom de modèle par défaut et les paramètres du modèle LaunchPad.

`REMARQUE :` Si vous modifiez le `model_name` ou tout autre paramètre comme `temperature` lors de la configuration du client, cela remplacera les configurations par défaut existantes.

```python
import getpass
import os

# First step is to set up the env variable.
# you can also pass the API key while instantiating the model but this
# comes under a best practices to set it as env variable.

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
# By default it will use the model which was deployed through the platform
# in my case it will is "claude-3-haiku"

chat = ChatPremAI(project_id=8)
```

## Appel du modèle

Vous êtes maintenant prêt. Nous pouvons maintenant commencer à interagir avec notre application. `ChatPremAI` prend en charge deux méthodes `invoke` (qui est la même que `generate`) et `stream`.

La première nous donnera un résultat statique. Tandis que la seconde diffusera les jetons un par un. Voici comment vous pouvez générer des compléments de type chat.

### Génération

```python
human_message = HumanMessage(content="Who are you?")

response = chat.invoke([human_message])
print(response.content)
```

```output
I am an artificial intelligence created by Anthropic. I'm here to help with a wide variety of tasks, from research and analysis to creative projects and open-ended conversation. I have general knowledge and capabilities, but I'm not a real person - I'm an AI assistant. Please let me know if you have any other questions!
```

Ci-dessus, cela semble intéressant, n'est-ce pas ? J'ai défini mon invite système LaunchPad par défaut comme : `Parle toujours comme un pirate` Vous pouvez également remplacer l'invite système par défaut si nécessaire. Voici comment vous pouvez le faire.

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="I am an artificial intelligence created by Anthropic. My purpose is to assist and converse with humans in a friendly and helpful way. I have a broad knowledge base that I can use to provide information, answer questions, and engage in discussions on a wide range of topics. Please let me know if you have any other questions - I'm here to help!")
```

Vous pouvez également modifier les paramètres de génération lors de l'appel du modèle. Voici comment vous pouvez procéder.

```python
chat.invoke([system_message, human_message], temperature=0.7, max_tokens=10, top_p=0.95)
```

```output
AIMessage(content='I am an artificial intelligence created by Anthropic')
```

### Remarques importantes :

Avant de continuer, veuillez noter que la version actuelle de ChatPrem ne prend pas en charge les paramètres : [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n) et [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) ne sont pas pris en charge.

Nous fournirons un support pour ces deux paramètres ci-dessus dans des versions ultérieures.

### Diffusion en continu

Et enfin, voici comment vous pouvez diffuser les jetons pour des applications de chat dynamiques.

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical state, but I'm functioning properly and ready to assist you with any questions or tasks you might have. How can I help you today?
```

Comme ci-dessus, si vous voulez remplacer l'invite système et les paramètres de génération, voici comment vous pouvez le faire.

```python
import sys

# For some experimental reasons if you want to override the system prompt then you
# can pass that here too. However it is not recommended to override system prompt
# of an already deployed model.

for chunk in chat.stream(
    "hello how are you",
    system_prompt="act like a dog",
    temperature=0.7,
    max_tokens=200,
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical form, but I'm functioning properly and ready to assist you. How can I help you today?
```
