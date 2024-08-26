---
translated: true
---

# Remembrall

Cette page couvre comment utiliser l'écosystème [Remembrall](https://remembrall.dev) dans LangChain.

## Qu'est-ce que Remembrall ?

Remembrall donne à votre modèle de langage une mémoire à long terme, une génération augmentée par la récupération et une observabilité complète avec seulement quelques lignes de code.

![Capture d'écran du tableau de bord Remembrall montrant les statistiques des requêtes et les interactions avec le modèle.](/img/RemembrallDashboard.png "Interface du tableau de bord Remembrall")

Il fonctionne comme un proxy léger au-dessus de vos appels OpenAI et augmente simplement le contexte des appels de chat à l'exécution avec les faits pertinents qui ont été collectés.

## Configuration

Pour commencer, [connectez-vous avec Github sur la plateforme Remembrall](https://remembrall.dev/login) et copiez votre [clé API dans la page des paramètres](https://remembrall.dev/dashboard/settings).

Toute requête que vous envoyez avec l'`openai_api_base` modifié (voir ci-dessous) et la clé API Remembrall sera automatiquement suivie dans le tableau de bord Remembrall. Vous **ne devez jamais** partager votre clé OpenAI avec notre plateforme et ces informations ne sont **jamais** stockées par les systèmes Remembrall.

Pour ce faire, nous devons installer les dépendances suivantes :

```bash
pip install -U langchain-openai
```

### Activer la mémoire à long terme

En plus de définir l'`openai_api_base` et la clé API Remembrall via `x-gp-api-key`, vous devez spécifier un UID pour maintenir la mémoire. Ce sera généralement un identifiant unique d'utilisateur (comme l'e-mail).

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Remembrall"}]-->
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-remember": "user@email.com",
                            }
                        })

chat_model.predict("My favorite color is blue.")
import time; time.sleep(5)  # wait for system to save fact via auto save
print(chat_model.predict("What is my favorite color?"))
```

### Activer la génération augmentée par la récupération

Tout d'abord, créez un contexte de document dans le [tableau de bord Remembrall](https://remembrall.dev/dashboard/spells). Collez les textes des documents ou téléchargez des documents au format PDF pour qu'ils soient traités. Enregistrez l'ID du contexte du document et insérez-le comme indiqué ci-dessous.

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Remembrall"}]-->
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-context": "document-context-id-goes-here",
                            }
                        })

print(chat_model.predict("This is a question that can be answered with my document."))
```
