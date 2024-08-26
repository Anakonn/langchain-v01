---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io) est une plateforme unifiée qui vous permet de construire des applications prêtes pour la production et alimentées par GenAI avec le moins d'efforts possible, afin que vous puissiez vous concentrer davantage sur l'expérience utilisateur et la croissance globale.

## ChatPremAI

Cet exemple explique comment utiliser LangChain pour interagir avec différents modèles de chat avec `ChatPremAI`.

### Installation et configuration

Nous commençons par installer langchain et premai-sdk. Vous pouvez taper la commande suivante pour installer :

```bash
pip install premai langchain
```

Avant de continuer, assurez-vous d'avoir créé un compte sur PremAI et démarré un projet. Sinon, voici comment vous pouvez commencer gratuitement :

1. Connectez-vous à [PremAI](https://app.premai.io/accounts/login/), si c'est la première fois, et créez votre clé API [ici](https://app.premai.io/api_keys/).

2. Allez sur [app.premai.io](https://app.premai.io) et cela vous amènera au tableau de bord du projet.

3. Créez un projet et cela générera un ID de projet (écrit sous forme d'ID). Cet ID vous aidera à interagir avec votre application déployée.

4. Rendez-vous sur LaunchPad (celui avec l'icône 🚀). Et là, déployez le modèle de votre choix. Votre modèle par défaut sera `gpt-4`. Vous pouvez également définir et fixer différents paramètres de génération (comme max-tokens, température, etc.) et pré-définir votre invite système.

Félicitations pour avoir créé votre première application déployée sur PremAI 🎉 Maintenant, nous pouvons utiliser langchain pour interagir avec notre application.

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "PremAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "PremAI"}, {"imported": "ChatPremAI", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.premai.ChatPremAI.html", "title": "PremAI"}]-->
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_models import ChatPremAI
```

### Configuration de l'instance ChatPrem dans LangChain

Une fois que nous avons importé nos modules requis, configurons notre client. Pour l'instant, supposons que notre `project_id` est 8. Mais assurez-vous d'utiliser votre ID de projet, sinon, cela générera une erreur.

Pour utiliser langchain avec prem, vous n'avez pas besoin de passer de nom de modèle ou de définir des paramètres avec notre client de chat. Tous ces paramètres utiliseront le nom de modèle par défaut et les paramètres du modèle LaunchPad.

`REMARQUE :` Si vous modifiez le `model_name` ou tout autre paramètre comme `temperature` lors de la configuration du client, cela remplacera les configurations par défaut existantes.

```python
import os
import getpass

if "PREMAI_API_KEY" not in os.environ:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

chat = ChatPremAI(project_id=8)
```

### Appel du modèle

Maintenant, vous êtes prêt. Nous pouvons maintenant commencer à interagir avec notre application. `ChatPremAI` prend en charge deux méthodes `invoke` (qui est la même que `generate`) et `stream`.

La première nous donnera un résultat statique. Tandis que la seconde diffusera les jetons un par un. Voici comment vous pouvez générer des compléments de type chat.

### Génération

```python
human_message = HumanMessage(content="Who are you?")

chat.invoke([human_message])
```

Cela a l'air intéressant, n'est-ce pas ? J'ai défini mon invite système LaunchPad par défaut comme : `Parle toujours comme un pirate` Vous pouvez également remplacer l'invite système par défaut si nécessaire. Voici comment vous pouvez le faire.

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

Vous pouvez également modifier les paramètres de génération lors de l'appel du modèle. Voici comment vous pouvez procéder :

```python
chat.invoke(
    [system_message, human_message],
    temperature = 0.7, max_tokens = 20, top_p = 0.95
)
```

### Remarques importantes :

Avant de continuer, veuillez noter que la version actuelle de ChatPrem ne prend pas en charge les paramètres : [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n) et [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) ne sont pas pris en charge.

Nous fournirons un support pour ces deux paramètres ci-dessus dans les versions ultérieures.

### Diffusion en continu

Et enfin, voici comment vous pouvez diffuser les jetons pour des applications de chat dynamiques.

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

Comme ci-dessus, si vous voulez remplacer l'invite système et les paramètres de génération, voici comment vous pouvez le faire.

```python
import sys

for chunk in chat.stream(
    "hello how are you",
    system_prompt = "You are an helpful assistant", temperature = 0.7, max_tokens = 20
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

## Intégration

Dans cette section, nous allons discuter de la façon dont nous pouvons accéder à différents modèles d'intégration à l'aide de `PremEmbeddings`. Commençons par faire quelques importations et définir notre objet d'intégration.

```python
from langchain_community.embeddings import PremEmbeddings
```

Une fois que nous avons importé nos modules requis, configurons notre client. Pour l'instant, supposons que notre `project_id` est 8. Mais assurez-vous d'utiliser votre ID de projet, sinon, cela générera une erreur.

```python

import os
import getpass

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

# Define a model as a required parameter here since there is no default embedding model

model = "text-embedding-3-large"
embedder = PremEmbeddings(project_id=8, model=model)
```

Nous avons défini notre modèle d'intégration. Nous prenons en charge de nombreux modèles d'intégration. Voici un tableau qui montre le nombre de modèles d'intégration que nous prenons en charge.

| Fournisseur | Slug                                     | Jetons de contexte |
|-------------|------------------------------------------|-------------------|
| cohere      | embed-english-v3.0                       | N/A               |
| openai      | text-embedding-3-small                   | 8191              |
| openai      | text-embedding-3-large                   | 8191              |
| openai      | text-embedding-ada-002                   | 8191              |
| replicate   | replicate/all-mpnet-base-v2              | N/A               |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A               |
| mistralai   | mistral-embed                            | 4096              |

Pour changer de modèle, vous n'avez qu'à copier le `slug` et accéder à votre modèle d'intégration. Maintenant, commençons à utiliser notre modèle d'intégration avec une seule requête suivie de plusieurs requêtes (également appelées document).

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

Enfin, intégrons un document.

```python
documents = [
    "This is document1",
    "This is document2",
    "This is document3"
]

doc_result = embedder.embed_documents(documents)

# Similar to the previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```
