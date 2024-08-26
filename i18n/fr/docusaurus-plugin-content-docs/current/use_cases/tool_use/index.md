---
sidebar_class_name: hidden
translated: true
---

# Utilisation d'outils et agents

Un cas d'utilisation passionnant pour les LLM est la construction d'interfaces en langage naturel pour d'autres "outils", qu'il s'agisse d'API, de fonctions, de bases de données, etc. LangChain est idéal pour construire de telles interfaces car il dispose :

- D'un bon traitement de la sortie du modèle, ce qui facilite l'extraction de JSON, XML, d'appels de fonction OpenAI, etc. à partir des sorties du modèle.
- D'une grande collection d'[outils](/docs/integrations/tools) intégrés.
- D'une grande flexibilité dans la façon d'appeler ces outils.

Il existe deux principales façons d'utiliser les outils : les [chaînes](/docs/modules/chains) et les [agents](/docs/modules/agents/).

Les chaînes vous permettent de créer une séquence prédéfinie d'utilisation d'outils.

![chain](../../../../../../static/img/tool_chain.svg)

Les agents permettent au modèle d'utiliser les outils dans une boucle, afin qu'il puisse décider du nombre de fois où il faut les utiliser.

![agent](../../../../../../static/img/tool_agent.svg)

Pour commencer avec ces deux approches, rendez-vous sur la page [Démarrage rapide](/docs/use_cases/tool_use/quickstart).
