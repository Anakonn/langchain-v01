---
sidebar_position: 5
title: Directives
translated: true
---

La qualité des résultats d'extraction dépend de nombreux facteurs.

Voici un ensemble de directives pour vous aider à obtenir les meilleures performances de vos modèles :

* Définissez la température du modèle sur `0`.
* Améliorez l'invite. L'invite doit être précise et concise.
* Documentez le schéma : assurez-vous que le schéma est documenté pour fournir plus d'informations au LLM.
* Fournissez des exemples de référence ! Des exemples diversifiés peuvent être utiles, y compris des exemples où rien ne doit être extrait.
* Si vous avez beaucoup d'exemples, utilisez un récupérateur pour récupérer les exemples les plus pertinents.
* Effectuez des tests avec le meilleur LLM/modèle de chat disponible (par exemple, gpt-4, claude-3, etc.) - vérifiez auprès du fournisseur du modèle lequel est le plus récent et le plus performant !
* Si le schéma est très volumineux, essayez de le diviser en plusieurs schémas plus petits, effectuez des extractions séparées et fusionnez les résultats.
* Assurez-vous que le schéma permet au modèle de REJETER l'extraction d'informations. Sinon, le modèle sera forcé d'inventer des informations !
* Ajoutez des étapes de vérification/correction (demandez à un LLM de corriger ou de vérifier les résultats de l'extraction).

## Benchmark

* Créez et testez des données pour votre cas d'utilisation à l'aide de [LangSmith 🦜️🛠️](https://docs.smith.langchain.com/).
* Votre LLM est-il suffisamment bon ? Utilisez [langchain-benchmarks 🦜💯 ](https://github.com/langchain-ai/langchain-benchmarks) pour tester votre LLM à l'aide de jeux de données existants.

## À garder à l'esprit ! 😶‍🌫️

* Les LLM sont formidables, mais ne sont pas nécessaires dans tous les cas ! Si vous extrayez des informations à partir d'une seule source structurée (par exemple, LinkedIn), l'utilisation d'un LLM n'est pas une bonne idée - le web-scraping traditionnel sera beaucoup moins coûteux et plus fiable.

* **Humain dans la boucle** Si vous avez besoin d'une **qualité parfaite**, vous devrez probablement prévoir d'avoir un humain dans la boucle - même les meilleurs LLM feront des erreurs lors de tâches d'extraction complexes.
