---
translated: true
---

# Agent Citron

>[Agent Citron](https://github.com/felixbrock/lemon-agent) vous aide à construire de puissants assistants IA en quelques minutes et à automatiser les workflows en permettant des opérations de lecture et d'écriture précises et fiables dans des outils comme `Airtable`, `Hubspot`, `Discord`, `Notion`, `Slack` et `Github`.

Voir [la documentation complète ici](https://github.com/felixbrock/lemonai-py-client).

La plupart des connecteurs disponibles aujourd'hui se concentrent sur les opérations en lecture seule, limitant le potentiel des LLM. D'un autre côté, les agents ont tendance à avoir des hallucinations de temps en temps en raison d'un manque de contexte ou d'instructions.

Avec `Lemon AI`, il est possible de donner à vos agents l'accès à des API bien définies pour des opérations de lecture et d'écriture fiables. De plus, les fonctions `Lemon AI` vous permettent de réduire davantage le risque d'hallucinations en fournissant un moyen de définir de manière statique des workflows sur lesquels le modèle peut s'appuyer en cas d'incertitude.

## Démarrage rapide

Le démarrage rapide suivant montre comment utiliser Lemon AI en combinaison avec des agents pour automatiser les workflows impliquant une interaction avec les outils internes.

### 1. Installer Lemon AI

Nécessite Python 3.8.1 et supérieur.

Pour utiliser Lemon AI dans votre projet Python, exécutez `pip install lemonai`

Cela installera le client Lemon AI correspondant que vous pourrez ensuite importer dans votre script.

L'outil utilise les packages Python langchain et loguru. En cas d'erreurs d'installation avec Lemon AI, installez d'abord ces deux packages, puis installez le package Lemon AI.

### 2. Lancer le serveur

L'interaction de vos agents et de tous les outils fournis par Lemon AI est gérée par le [serveur Lemon AI](https://github.com/felixbrock/lemonai-server). Pour utiliser Lemon AI, vous devez exécuter le serveur sur votre machine locale afin que le client Python Lemon AI puisse s'y connecter.

### 3. Utiliser Lemon AI avec Langchain

Lemon AI résout automatiquement les tâches données en trouvant la bonne combinaison d'outils pertinents ou en utilisant les fonctions Lemon AI comme alternative. L'exemple suivant montre comment récupérer un utilisateur de Hackernews et l'écrire dans une table Airtable :

#### (Facultatif) Définir vos fonctions Lemon AI

Similaire aux [fonctions OpenAI](https://openai.com/blog/function-calling-and-other-api-updates), Lemon AI offre la possibilité de définir des workflows en tant que fonctions réutilisables. Ces fonctions peuvent être définies pour les cas d'utilisation où il est particulièrement important de se rapprocher d'un comportement quasi déterministe. Les workflows spécifiques peuvent être définis dans un fichier lemonai.json distinct :

```json
[
  {
    "name": "Hackernews Airtable User Workflow",
    "description": "retrieves user data from Hackernews and appends it to a table in Airtable",
    "tools": ["hackernews-get-user", "airtable-append-data"]
  }
]
```

Votre modèle aura accès à ces fonctions et les préférera à l'auto-sélection d'outils pour résoudre une tâche donnée. Tout ce que vous avez à faire est de faire savoir à l'agent qu'il doit utiliser une fonction donnée en incluant le nom de la fonction dans l'invite.

#### Inclure Lemon AI dans votre projet Langchain

```python
import os

from langchain_openai import OpenAI
from lemonai import execute_workflow
```

#### Charger les clés API et les jetons d'accès

Pour utiliser des outils nécessitant une authentification, vous devez stocker les informations d'identification d'accès correspondantes dans votre environnement au format "{nom de l'outil}_{chaîne d'authentification}" où la chaîne d'authentification est l'un des ["API_KEY", "SECRET_KEY", "SUBSCRIPTION_KEY", "ACCESS_KEY"] pour les clés API ou ["ACCESS_TOKEN", "SECRET_TOKEN"] pour les jetons d'authentification. Exemples : "OPENAI_API_KEY", "BING_SUBSCRIPTION_KEY", "AIRTABLE_ACCESS_TOKEN".

```python
""" Load all relevant API Keys and Access Tokens into your environment variables """
os.environ["OPENAI_API_KEY"] = "*INSERT OPENAI API KEY HERE*"
os.environ["AIRTABLE_ACCESS_TOKEN"] = "*INSERT AIRTABLE TOKEN HERE*"
```

```python
hackernews_username = "*INSERT HACKERNEWS USERNAME HERE*"
airtable_base_id = "*INSERT BASE ID HERE*"
airtable_table_id = "*INSERT TABLE ID HERE*"

""" Define your instruction to be given to your LLM """
prompt = f"""Read information from Hackernews for user {hackernews_username} and then write the results to
Airtable (baseId: {airtable_base_id}, tableId: {airtable_table_id}). Only write the fields "username", "karma"
and "created_at_i". Please make sure that Airtable does NOT automatically convert the field types.
"""

"""
Use the Lemon AI execute_workflow wrapper
to run your Langchain agent in combination with Lemon AI
"""
model = OpenAI(temperature=0)

execute_workflow(llm=model, prompt_string=prompt)
```

### 4. Gagner en transparence sur la prise de décision de votre agent

Pour gagner en transparence sur la façon dont votre agent interagit avec les outils Lemon AI pour résoudre une tâche donnée, toutes les décisions prises, les outils utilisés et les opérations effectuées sont enregistrés dans un fichier `lemonai.log` local. Chaque fois que votre agent LLM interagit avec la pile d'outils Lemon AI, une entrée de journal correspondante est créée.

```log
2023-06-26T11:50:27.708785+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - hackernews-get-user
2023-06-26T11:50:39.624035+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - airtable-append-data
2023-06-26T11:58:32.925228+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - hackernews-get-user
2023-06-26T11:58:43.988788+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - airtable-append-data
```

En utilisant les [Lemon AI Analytics](https://github.com/felixbrock/lemon-agent/blob/main/apps/analytics/README.md), vous pouvez facilement mieux comprendre à quelle fréquence et dans quel ordre les outils sont utilisés. En conséquence, vous pouvez identifier les points faibles dans les capacités de prise de décision de votre agent et passer à un comportement plus déterministe en définissant des fonctions Lemon AI.
