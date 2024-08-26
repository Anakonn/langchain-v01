---
sidebar_class_name: hidden
translated: true
---

# Analyse de requête

"Search" alimente de nombreux cas d'utilisation - y compris la partie "récupération" de la Génération Augmentée par Récupération. La façon la plus simple de procéder consiste à transmettre directement la question de l'utilisateur à un récupérateur. Afin d'améliorer les performances, vous pouvez également "optimiser" la requête d'une certaine manière en utilisant *l'analyse de requête*. Cela se fait traditionnellement par des techniques basées sur des règles, mais avec l'essor des LLM, il devient de plus en plus populaire et réalisable d'utiliser un LLM pour cela. Plus précisément, cela implique de transmettre la question brute (ou la liste de messages) à un LLM et de renvoyer une ou plusieurs requêtes optimisées, qui contiennent généralement une chaîne de caractères et éventuellement d'autres informations structurées.

![Analyse de requête](../../../../../../static/img/query_analysis.png)

## Problèmes résolus

L'analyse de requête aide à optimiser la requête de recherche à envoyer au récupérateur. Cela peut être le cas lorsque :

* Le récupérateur prend en charge les recherches et les filtres sur des champs spécifiques des données, et l'entrée de l'utilisateur pourrait faire référence à l'un de ces champs,
* L'entrée de l'utilisateur contient plusieurs questions distinctes,
* Pour récupérer les informations pertinentes, plusieurs requêtes sont nécessaires,
* La qualité de la recherche est sensible au libellé,
* Il existe plusieurs récupérateurs qui pourraient être recherchés, et l'entrée de l'utilisateur pourrait faire référence à l'un d'entre eux.

Notez que différents problèmes nécessiteront des solutions différentes. Afin de déterminer quelle technique d'analyse de requête vous devriez utiliser, vous voudrez comprendre exactement quel est le problème avec votre système de récupération actuel. Cela se fait le mieux en examinant les points de défaillance de votre application actuelle et en identifiant les thèmes communs. Ce n'est qu'une fois que vous connaissez vos problèmes que vous pourrez commencer à les résoudre.

## Démarrage rapide

Rendez-vous sur le [démarrage rapide](/docs/use_cases/query_analysis/quickstart) pour voir comment utiliser l'analyse de requête dans un exemple de bout en bout de base. Cela couvrira la création d'un moteur de recherche sur le contenu des vidéos YouTube de LangChain, montrera un mode de défaillance qui se produit lorsqu'on transmet une question brute d'utilisateur à cet index, puis un exemple de la façon dont l'analyse de requête peut aider à résoudre ce problème. Le démarrage rapide se concentre sur **la structuration des requêtes**. Ci-dessous se trouvent d'autres techniques d'analyse de requête qui peuvent être pertinentes en fonction de vos données et de votre cas d'utilisation.

## Techniques

Il existe plusieurs techniques que nous prenons en charge pour passer d'une question brute ou d'une liste de messages à une requête plus optimisée. Celles-ci incluent :

* [Décomposition de requête](/docs/use_cases/query_analysis/techniques/decomposition) : Si une entrée d'utilisateur contient plusieurs questions distinctes, nous pouvons décomposer l'entrée en requêtes séparées qui seront exécutées indépendamment.
* [Expansion de requête](/docs/use_cases/query_analysis/techniques/expansion) : Si un index est sensible au libellé de la requête, nous pouvons générer plusieurs versions paraphrasées de la question de l'utilisateur pour augmenter nos chances de récupérer un résultat pertinent.
* [Intégration de document hypothétique (HyDE)](/docs/use_cases/query_analysis/techniques/hyde) : Si nous travaillons avec un index basé sur la recherche de similarité, comme un magasin de vecteurs, alors la recherche sur des questions brutes peut ne pas bien fonctionner car leurs intégrations peuvent ne pas être très similaires à celles des documents pertinents. Il peut être plus utile de faire générer par le modèle un document pertinent hypothétique, puis d'utiliser celui-ci pour effectuer une recherche de similarité.
* [Routage de requête](/docs/use_cases/query_analysis/techniques/routing) : Si nous avons plusieurs index et que seule une partie d'entre eux sont utiles pour une entrée d'utilisateur donnée, nous pouvons router l'entrée pour ne récupérer les résultats que des index pertinents.
* [Retour en arrière de l'invite](/docs/use_cases/query_analysis/techniques/step_back) : Parfois, la qualité de la recherche et les générations de modèles peuvent être perturbées par les spécificités d'une question. Une façon de gérer cela est de générer d'abord une question plus abstraite, "en retrait", et de faire une requête en fonction de la question d'origine et de la question en retrait.
* [Structuration de requête](/docs/use_cases/query_analysis/techniques/structuring) : Si nos documents ont plusieurs attributs consultables/filtrables, nous pouvons déduire de toute question brute d'utilisateur quels attributs spécifiques doivent être recherchés/filtrés. Par exemple, lorsqu'une entrée d'utilisateur mentionne quelque chose de spécifique sur la date de publication d'une vidéo, cela devrait devenir un filtre sur l'attribut `publish_date` de chaque document.

## Comment faire

* [Ajouter des exemples à l'invite](/docs/use_cases/query_analysis/how_to/few_shot) : À mesure que notre analyse de requête devient plus complexe, l'ajout d'exemples à l'invite peut améliorer de manière significative les performances.
* [Gérer les catégories à haute cardinalité](/docs/use_cases/query_analysis/how_to/high_cardinality) : De nombreuses requêtes structurées que vous créerez impliqueront des variables catégorielles. Lorsqu'il y a beaucoup de valeurs potentielles, il peut être difficile de le faire correctement.
* [Construire des filtres](/docs/use_cases/query_analysis/how_to/constructing-filters) : Ce guide couvre comment passer d'un modèle Pydantic à des filtres dans le langage de requête spécifique au magasin de vecteurs avec lequel vous travaillez.
* [Gérer plusieurs requêtes](/docs/use_cases/query_analysis/how_to/multiple_queries) : Certaines techniques d'analyse de requête génèrent plusieurs requêtes. Ce guide traite de la façon de les transmettre toutes au récupérateur.
* [Gérer l'absence de requêtes](/docs/use_cases/query_analysis/how_to/no_queries) : Certaines techniques d'analyse de requête peuvent ne pas générer de requête du tout. Ce guide traite de la façon de gérer ces situations avec élégance.
* [Gérer plusieurs récupérateurs](/docs/use_cases/query_analysis/how_to/multiple_retrievers) : Certaines techniques d'analyse de requête impliquent un routage entre plusieurs récupérateurs. Ce guide couvre comment gérer cela avec élégance.
