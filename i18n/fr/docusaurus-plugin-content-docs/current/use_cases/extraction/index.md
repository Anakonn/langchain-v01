---
sidebar_class_name: hidden
title: Extraction de sortie structurée
translated: true
---

## Aperçu

Les modèles de langage à grande échelle (LLM) émergent comme une technologie extrêmement capable pour alimenter les applications d'extraction d'informations.

Les solutions classiques d'extraction d'informations s'appuient sur une combinaison de personnes, de règles (souvent) manuelles (par exemple, des expressions régulières) et de modèles d'apprentissage automatique personnalisés.

Ces systèmes ont tendance à devenir complexes au fil du temps et à devenir progressivement plus coûteux à maintenir et plus difficiles à améliorer.

Les LLM peuvent être adaptés rapidement à des tâches d'extraction spécifiques en fournissant simplement des instructions appropriées et des exemples de référence appropriés.

Ce guide vous montrera comment utiliser les LLM pour les applications d'extraction !

## Approches

Il existe 3 grandes approches pour l'extraction d'informations à l'aide de LLM :

- Mode **Appel d'outil/Fonction** : Certains LLM prennent en charge un mode *d'appel d'outil ou de fonction*. Ces LLM peuvent structurer la sortie selon un **schéma** donné. Généralement, cette approche est la plus facile à utiliser et devrait donner de bons résultats.

- Mode **JSON** : Certains LLM peuvent être forcés à produire du JSON valide. C'est similaire à l'approche **Appel d'outil/Fonction**, sauf que le schéma est fourni dans l'invite. Généralement, notre intuition est que cela fonctionne moins bien que l'approche **Appel d'outil/Fonction**, mais ne nous faites pas confiance et vérifiez pour votre propre cas d'utilisation !

- Approche par **Invite** : Les LLM qui peuvent bien suivre les instructions peuvent être chargés de générer du texte dans un format souhaité. Le texte généré peut être analysé en aval à l'aide d'[analyseurs de sortie](/docs/modules/model_io/output_parsers/) existants ou à l'aide d'[analyseurs personnalisés](/docs/modules/model_io/output_parsers/custom) pour le convertir en un format structuré comme le JSON. Cette approche peut être utilisée avec des LLM qui **ne prennent pas en charge** les modes JSON ou Appel d'outil/Fonction. Cette approche est plus largement applicable, bien qu'elle puisse donner de moins bons résultats que les modèles qui ont été affinés pour l'extraction ou l'appel de fonction.

## Démarrage rapide

Rendez-vous sur le [démarrage rapide](/docs/use_cases/extraction/quickstart) pour voir comment extraire des informations à l'aide de LLM en utilisant un exemple de bout en bout de base.

Le démarrage rapide se concentre sur l'extraction d'informations à l'aide de l'approche **Appel d'outil/Fonction**.

## Guides pratiques

- [Utiliser des exemples de référence](/docs/use_cases/extraction/how_to/examples) : Apprenez à utiliser des **exemples de référence** pour améliorer les performances.
- [Gérer les longs textes](/docs/use_cases/extraction/how_to/handle_long_text) : Que faire si le texte ne rentre pas dans la fenêtre de contexte du LLM ?
- [Gérer les fichiers](/docs/use_cases/extraction/how_to/handle_files) : Exemples d'utilisation des chargeurs et analyseurs de documents LangChain pour extraire à partir de fichiers comme les PDF.
- [Utiliser une approche d'analyse](/docs/use_cases/extraction/how_to/parse) : Utilisez une approche basée sur l'invite pour extraire avec des modèles qui ne prennent pas en charge **l'appel d'outil/fonction**.

## Lignes directrices

Rendez-vous sur la page [Lignes directrices](/docs/use_cases/extraction/guidelines) pour voir une liste de lignes directrices d'opinion sur la façon d'obtenir les meilleures performances pour les cas d'utilisation d'extraction.

## Accélérateur de cas d'utilisation

[langchain-extract](https://github.com/langchain-ai/langchain-extract) est un dépôt de démarrage qui implémente un serveur web simple pour l'extraction d'informations à partir de texte et de fichiers à l'aide de LLM. Il est construit à l'aide de **FastAPI**, **LangChain** et **Postgresql**. N'hésitez pas à l'adapter à vos propres cas d'utilisation.

## Autres ressources

* La documentation des [analyseurs de sortie](/docs/modules/model_io/output_parsers/) inclut divers exemples d'analyseurs pour des types spécifiques (par exemple, listes, date/heure, enum, etc.).
* Les [chargeurs de documents](/docs/modules/data_connection/document_loaders/) LangChain pour charger le contenu à partir de fichiers. Veuillez consulter la liste des [intégrations](/docs/integrations/document_loaders).
* La prise en charge expérimentale de [l'appel de fonction Anthropic](/docs/integrations/chat/anthropic_functions) offre une fonctionnalité similaire aux modèles de chat Anthropic.
* [LlamaCPP](/docs/integrations/llms/llamacpp#grammars) prend en charge nativement le décodage contraint à l'aide de grammaires personnalisées, ce qui facilite la production de contenu structuré à l'aide de LLM locaux.
* [JSONFormer](/docs/integrations/llms/jsonformer_experimental) offre une autre façon de décoder de manière structurée un sous-ensemble du schéma JSON.
* [Kor](https://eyurtsev.github.io/kor/) est une autre bibliothèque pour l'extraction où le schéma et les exemples peuvent être fournis au LLM. Kor est optimisé pour fonctionner avec une approche d'analyse.
* [L'appel d'outil et de fonction d'OpenAI](https://platform.openai.com/docs/guides/function-calling)
* Par exemple, voir [le mode JSON d'OpenAI](https://platform.openai.com/docs/guides/text-generation/json-mode).
