---
sidebar_label: Upstage
translated: true
---

# Vérification de la solidité d'Upstage

Ce cahier couvre comment se lancer avec les modèles de vérification de la solidité d'Upstage.

## Installation

Installez le package `langchain-upstage`.

```bash
pip install -U langchain-upstage
```

## Configuration de l'environnement

Assurez-vous de définir les variables d'environnement suivantes :

- `UPSTAGE_API_KEY` : Votre clé API Upstage depuis [le document des développeurs Upstage](https://developers.upstage.ai/docs/getting-started/quick-start).

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## Utilisation

Initialisez la classe `UpstageGroundednessCheck`.

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()
```

Utilisez la méthode `run` pour vérifier la solidité du texte d'entrée.

```python
request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawai'i. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}

response = groundedness_check.invoke(request_input)
print(response)
```
