---
translated: true
---

# Dappier AI

**Dappier : Alimenter l'IA avec des modèles de données dynamiques et en temps réel**

Dappier offre une plateforme de pointe qui donne aux développeurs un accès immédiat à une large gamme de modèles de données en temps réel couvrant l'actualité, le divertissement, la finance, les données de marché, la météo et bien plus encore. Avec nos modèles de données pré-entraînés, vous pouvez booster vos applications d'IA, en vous assurant qu'elles fournissent des réponses précises et à jour, et en minimisant les inexactitudes.

Les modèles de données Dappier vous aident à construire des applications LLM de nouvelle génération avec un contenu fiable et à jour des plus grandes marques mondiales. Libérez votre créativité et améliorez n'importe quelle application GPT ou flux de travail d'IA avec des données propriétaires et exploitables via une API simple. Augmenter votre IA avec des données propriétaires provenant de sources de confiance est le meilleur moyen d'assurer des réponses factuelles, à jour, quelle que soit la question.

Pour les développeurs, par les développeurs
Conçu avec les développeurs à l'esprit, Dappier simplifie le parcours de l'intégration des données à la monétisation, en offrant des voies claires et directes pour déployer et gagner de l'argent avec vos modèles d'IA. Découvrez l'avenir de l'infrastructure de monétisation pour le nouvel internet sur **https://dappier.com/**.

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles d'IA Dappier

-----------------------------------------------------------------------------------

Pour utiliser l'un de nos modèles de données d'IA Dappier, vous aurez besoin d'une clé API. Veuillez visiter le Dappier Platform (https://platform.dappier.com/) pour vous connecter et créer une clé API dans votre profil.

Vous pouvez trouver plus de détails sur la référence de l'API : https://docs.dappier.com/introduction

Pour travailler avec notre modèle de chat Dappier, vous pouvez transmettre la clé directement via le paramètre nommé dappier_api_key lors de l'initialisation de la classe ou la définir en tant que variable d'environnement.

```bash
export DAPPIER_API_KEY="..."
```

```python
from langchain_community.chat_models.dappier import ChatDappierAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatDappierAI(
    dappier_endpoint="https://api.dappier.com/app/datamodelconversation",
    dappier_model="dm_01hpsxyfm2fwdt2zet9cg6fdxt",
    dappier_api_key="...",
)
```

```python
messages = [HumanMessage(content="Who won the super bowl in 2024?")]
chat.invoke(messages)
```

```output
AIMessage(content='Hey there! The Kansas City Chiefs won Super Bowl LVIII in 2024. They beat the San Francisco 49ers in overtime with a final score of 25-22. It was quite the game! 🏈')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='The Kansas City Chiefs won Super Bowl LVIII in 2024! 🏈')
```
