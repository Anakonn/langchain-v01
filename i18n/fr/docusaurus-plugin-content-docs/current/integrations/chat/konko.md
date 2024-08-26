---
sidebar_label: Konko
translated: true
---

# ChatKonko

# Konko

>[Konko](https://www.konko.ai/) API est une API Web entièrement gérée conçue pour aider les développeurs d'applications :

1. **Sélectionner** les bons modèles de langage open source ou propriétaires pour leur application
2. **Construire** des applications plus rapidement avec des intégrations aux principaux frameworks d'application et des API entièrement gérées
3. **Affiner** les plus petits modèles de langage open source pour atteindre des performances de niveau industriel à une fraction du coût
4. **Déployer des API à l'échelle de la production** qui répondent aux exigences de sécurité, de confidentialité, de débit et de latence sans configuration ni administration d'infrastructure en utilisant l'infrastructure multi-cloud conforme SOC 2 de Konko AI

Cet exemple explique comment utiliser LangChain pour interagir avec les [modèles](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-chatcompletion) de ChatCompletion `Konko`

Pour exécuter ce notebook, vous aurez besoin d'une clé d'API Konko. Connectez-vous à notre application web pour [créer une clé d'API](https://platform.konko.ai/settings/api-keys) afin d'accéder aux modèles

```python
from langchain_community.chat_models import ChatKonko
from langchain_core.messages import HumanMessage, SystemMessage
```

#### Définir les variables d'environnement

1. Vous pouvez définir les variables d'environnement pour
   1. KONKO_API_KEY (Obligatoire)
   2. OPENAI_API_KEY (Facultatif)
2. Dans votre session shell actuelle, utilisez la commande export :

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## Appeler un modèle

Trouvez un modèle sur la [page d'aperçu de Konko](https://docs.konko.ai/docs/list-of-models)

Une autre façon de trouver la liste des modèles en cours d'exécution sur l'instance Konko est via ce [point de terminaison](https://docs.konko.ai/reference/get-models).

À partir de là, nous pouvons initialiser notre modèle :

```python
chat = ChatKonko(max_tokens=400, model="meta-llama/llama-2-13b-chat")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Explain Big Bang Theory briefly"),
]
chat(messages)
```

```output
AIMessage(content="  Sure thing! The Big Bang Theory is a scientific theory that explains the origins of the universe. In short, it suggests that the universe began as an infinitely hot and dense point around 13.8 billion years ago and expanded rapidly. This expansion continues to this day, and it's what makes the universe look the way it does.\n\nHere's a brief overview of the key points:\n\n1. The universe started as a singularity, a point of infinite density and temperature.\n2. The singularity expanded rapidly, causing the universe to cool and expand.\n3. As the universe expanded, particles began to form, including protons, neutrons, and electrons.\n4. These particles eventually came together to form atoms, and later, stars and galaxies.\n5. The universe is still expanding today, and the rate of this expansion is accelerating.\n\nThat's the Big Bang Theory in a nutshell! It's a pretty mind-blowing idea when you think about it, and it's supported by a lot of scientific evidence. Do you have any other questions about it?")
```
