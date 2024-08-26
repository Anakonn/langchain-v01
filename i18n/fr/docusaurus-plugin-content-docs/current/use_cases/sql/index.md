---
sidebar_class_name: hidden
translated: true
---

# SQL

L'un des types de bases de données les plus courants pour lesquels nous pouvons construire des systèmes de questions-réponses sont les bases de données SQL. LangChain dispose d'un certain nombre de chaînes et d'agents intégrés compatibles avec tous les dialectes SQL pris en charge par SQLAlchemy (par exemple, MySQL, PostgreSQL, Oracle SQL, Databricks, SQLite). Ils permettent des cas d'utilisation tels que :

* Générer des requêtes qui seront exécutées en fonction de questions en langage naturel,
* Créer des chatbots qui peuvent répondre à des questions basées sur les données de la base de données,
* Construire des tableaux de bord personnalisés basés sur les informations qu'un utilisateur souhaite analyser,

et bien plus encore.

## ⚠️ Note de sécurité ⚠️

La construction de systèmes de questions-réponses sur des bases de données SQL nécessite l'exécution de requêtes SQL générées par des modèles. Il y a des risques inhérents à cette pratique. Assurez-vous que les autorisations de connexion à votre base de données sont toujours aussi restreintes que possible pour les besoins de votre chaîne/agent. Cela atténuera, sans toutefois l'éliminer, les risques de construire un système piloté par un modèle. Pour plus d'informations sur les meilleures pratiques de sécurité en général, [voir ici](/docs/security).

![sql_usecase.png](../../../../../../static/img/sql_usecase.png)

## Démarrage rapide

Rendez-vous sur la page **[Démarrage rapide](/docs/use_cases/sql/quickstart)** pour commencer.

## Avancé

Une fois que vous vous serez familiarisé avec les bases, vous pourrez consulter les guides avancés :

* [Agents](/docs/use_cases/sql/agents) : Construire des agents capables d'interagir avec des bases de données SQL.
* [Stratégies de prompt](/docs/use_cases/sql/prompting) : Stratégies pour améliorer la génération de requêtes SQL.
* [Validation des requêtes](/docs/use_cases/sql/query_checking) : Comment valider les requêtes SQL.
* [Grandes bases de données](/docs/use_cases/sql/large_db) : Comment interagir avec des bases de données comportant de nombreuses tables et des colonnes à cardinalité élevée.
