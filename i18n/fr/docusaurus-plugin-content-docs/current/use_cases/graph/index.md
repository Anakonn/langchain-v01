---
sidebar_class_name: hidden
translated: true
---

# Graphes

Un des types de bases de données courants pour lesquels nous pouvons construire des systèmes de questions-réponses sont les bases de données de graphes. LangChain dispose d'un certain nombre de chaînes et d'agents intégrés compatibles avec des dialectes de langage de requête de graphe comme Cypher, SparQL et d'autres (par exemple, Neo4j, MemGraph, Amazon Neptune, Kùzu, OntoText, Tigergraph). Ils permettent des cas d'utilisation tels que :

* Générer des requêtes qui seront exécutées en fonction de questions en langage naturel,
* Créer des chatbots qui peuvent répondre à des questions basées sur les données de la base de données,
* Construire des tableaux de bord personnalisés basés sur les informations qu'un utilisateur souhaite analyser,

et bien plus encore.

## ⚠️ Note de sécurité ⚠️

La construction de systèmes de questions-réponses sur des bases de données de graphes peut nécessiter l'exécution de requêtes de base de données générées par des modèles. Il y a des risques inhérents à faire cela. Assurez-vous que les autorisations de connexion à votre base de données sont toujours aussi restreintes que possible pour les besoins de votre chaîne/agent. Cela atténuera, sans toutefois l'éliminer, les risques de construire un système piloté par un modèle. Pour plus d'informations sur les meilleures pratiques de sécurité en général, [voir ici](/docs/security).

![graphgrag_usecase.png](../../../../../../static/img/graph_usecase.png)

> L'utilisation de modèles de requêtes de base de données dans une couche sémantique offre l'avantage de contourner le besoin de génération de requêtes de base de données. Cette approche élimine efficacement les vulnérabilités de sécurité liées à la génération de requêtes de base de données.

## Démarrage rapide

Rendez-vous sur la page **[Démarrage rapide](/docs/use_cases/graph/quickstart)** pour commencer.

## Avancé

Une fois que vous vous serez familiarisé avec les bases, vous pourrez consulter les guides avancés :

* [Stratégies d'invite](/docs/use_cases/graph/prompting) : Techniques avancées d'ingénierie d'invite.
* [Mappage des valeurs](/docs/use_cases/graph/mapping) : Techniques de mappage des valeurs des questions à la base de données.
* [Couche sémantique](/docs/use_cases/graph/semantic) : Techniques de mise en œuvre de couches sémantiques.
* [Construction de graphes](/docs/use_cases/graph/constructing) : Techniques de construction de graphes de connaissances.
