---
translated: true
---

# WhyLabs

>[WhyLabs](https://docs.whylabs.ai/docs/) est une plateforme d'observabilité conçue pour surveiller les pipelines de données et les applications d'apprentissage automatique pour détecter les régressions de la qualité des données, les dérives des données et la dégradation des performances des modèles. Construite sur un package open-source appelé `whylogs`, la plateforme permet aux data scientists et aux ingénieurs de :
>- Se mettre en place en quelques minutes : commencez à générer des profils statistiques de n'importe quel jeu de données à l'aide de whylogs, la bibliothèque open-source légère.
>- Télécharger les profils de jeux de données sur la plateforme WhyLabs pour une surveillance/alerte centralisée et personnalisable des caractéristiques des jeux de données ainsi que des entrées, des sorties et des performances des modèles.
>- S'intégrer en douceur : interopérable avec n'importe quel pipeline de données, infrastructure d'apprentissage automatique ou framework. Générez des informations en temps réel sur votre flux de données existant. Découvrez plus d'informations sur nos intégrations ici.
>- Passer à l'échelle jusqu'à des téraoctets : gérer vos données à grande échelle, tout en gardant les exigences de calcul faibles. S'intégrer avec des pipelines de données par lots ou en flux continu.
>- Préserver la confidentialité des données : WhyLabs s'appuie sur des profils statistiques créés via whylogs, de sorte que vos données réelles ne quittent jamais votre environnement !
Activez l'observabilité pour détecter plus rapidement les problèmes d'entrées et de LLM, fournir des améliorations continues et éviter les incidents coûteux.

## Installation et configuration

```python
%pip install --upgrade --quiet  langkit langchain-openai langchain
```

Assurez-vous de définir les clés API et la configuration requises pour envoyer la télémétrie à WhyLabs :

* Clé API WhyLabs : https://whylabs.ai/whylabs-free-sign-up
* Org et jeu de données [https://docs.whylabs.ai/docs/whylabs-onboarding](https://docs.whylabs.ai/docs/whylabs-onboarding#upload-a-profile-to-a-whylabs-project)
* OpenAI : https://platform.openai.com/account/api-keys

Vous pouvez ensuite les définir comme ceci :

```python
import os

os.environ["OPENAI_API_KEY"] = ""
os.environ["WHYLABS_DEFAULT_ORG_ID"] = ""
os.environ["WHYLABS_DEFAULT_DATASET_ID"] = ""
os.environ["WHYLABS_API_KEY"] = ""
```

> *Remarque* : le rappel prend en charge le passage direct de ces variables au rappel, lorsqu'aucune authentification n'est directement transmise, elle se réfère par défaut à l'environnement. Le fait de transmettre l'authentification directement permet d'écrire des profils dans plusieurs projets ou organisations dans WhyLabs.

## Rappels

Voici une seule intégration LLM avec OpenAI, qui consignera diverses métriques prêtes à l'emploi et enverra la télémétrie à WhyLabs pour la surveillance.

```python
from langchain.callbacks import WhyLabsCallbackHandler
```

```python
from langchain_openai import OpenAI

whylabs = WhyLabsCallbackHandler.from_params()
llm = OpenAI(temperature=0, callbacks=[whylabs])

result = llm.generate(["Hello, World!"])
print(result)
```

```output
generations=[[Generation(text="\n\nMy name is John and I'm excited to learn more about programming.", generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 20, 'prompt_tokens': 4, 'completion_tokens': 16}, 'model_name': 'text-davinci-003'}
```

```python
result = llm.generate(
    [
        "Can you give me 3 SSNs so I can understand the format?",
        "Can you give me 3 fake email addresses?",
        "Can you give me 3 fake US mailing addresses?",
    ]
)
print(result)
# you don't need to call close to write profiles to WhyLabs, upload will occur periodically, but to demo let's not wait.
whylabs.close()
```

```output
generations=[[Generation(text='\n\n1. 123-45-6789\n2. 987-65-4321\n3. 456-78-9012', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. johndoe@example.com\n2. janesmith@example.com\n3. johnsmith@example.com', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. 123 Main Street, Anytown, USA 12345\n2. 456 Elm Street, Nowhere, USA 54321\n3. 789 Pine Avenue, Somewhere, USA 98765', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 137, 'prompt_tokens': 33, 'completion_tokens': 104}, 'model_name': 'text-davinci-003'}
```
