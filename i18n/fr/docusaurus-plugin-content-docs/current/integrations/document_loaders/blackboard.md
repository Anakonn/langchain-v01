---
translated: true
---

# Tableau noir

>[Blackboard Learn](https://en.wikipedia.org/wiki/Blackboard_Learn) (anciennement le système de gestion de l'apprentissage Blackboard) est un environnement d'apprentissage virtuel et un système de gestion de l'apprentissage basé sur le Web développé par Blackboard Inc. Le logiciel comprend la gestion des cours, une architecture ouverte personnalisable et une conception évolutive permettant l'intégration avec les systèmes d'information des étudiants et les protocoles d'authentification. Il peut être installé sur des serveurs locaux, hébergé par `Blackboard ASP Solutions` ou fourni en tant que logiciel en tant que service hébergé sur Amazon Web Services. Ses principaux objectifs sont déclarés comme incluant l'ajout d'éléments en ligne aux cours traditionnellement dispensés en face à face et le développement de cours entièrement en ligne avec peu ou pas de réunions en face à face.

Cela couvre comment charger des données à partir d'une instance [Blackboard Learn](https://www.anthology.com/products/teaching-and-learning/learning-effectiveness/blackboard-learn).

Ce chargeur n'est pas compatible avec tous les cours `Blackboard`. Il n'est compatible qu'avec les cours qui utilisent la nouvelle interface `Blackboard`.
Pour utiliser ce chargeur, vous devez avoir le cookie BbRouter. Vous pouvez obtenir ce cookie en vous connectant au cours, puis en copiant la valeur du cookie BbRouter à partir des outils de développement du navigateur.

```python
from langchain_community.document_loaders import BlackboardLoader

loader = BlackboardLoader(
    blackboard_course_url="https://blackboard.example.com/webapps/blackboard/execute/announcement?method=search&context=course_entry&course_id=_123456_1",
    bbrouter="expires:12345...",
    load_all_recursively=True,
)
documents = loader.load()
```
