---
fixed: true
translated: true
---

# Sécurité

LangChain dispose d'un vaste écosystème d'intégrations avec diverses ressources externes comme des systèmes de fichiers locaux et distants, des API et des bases de données. Ces intégrations permettent aux développeurs de créer des applications polyvalentes qui combinent la puissance des LLM (modèles de langage) avec la capacité d'accéder, d'interagir et de manipuler des ressources externes.

## Meilleures pratiques

Lors de la construction de telles applications, les développeurs doivent se rappeler de suivre de bonnes pratiques de sécurité :

* [**Limiter les autorisations**](https://en.wikipedia.org/wiki/Principle_of_least_privilege) : Définir des autorisations spécifiquement adaptées aux besoins de l'application. Accorder des autorisations trop larges ou excessives peut introduire des vulnérabilités de sécurité importantes. Pour éviter de telles vulnérabilités, envisagez d'utiliser des identifiants en lecture seule, d'interdire l'accès à des ressources sensibles, d'utiliser des techniques de cloisonnement (comme l'exécution dans un conteneur), etc. selon les besoins de votre application.

* **Anticiper les utilisations abusives potentielles** : Tout comme les humains peuvent se tromper, les modèles de langage (LLM) le peuvent aussi. Supposez toujours que tout accès système ou identifiants peuvent être utilisés de toute manière autorisée par les autorisations qui leur sont attribuées. Par exemple, si un jeu d'identifiants de base de données permet de supprimer des données, il est plus sûr de supposer que tout LLM capable d'utiliser ces identifiants peut en fait supprimer des données.

* [**Défense en profondeur**](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)) : Aucune technique de sécurité n'est parfaite. L'affinement et une bonne conception de la chaîne peuvent réduire, mais pas éliminer, les risques qu'un modèle de langage (LLM) fasse une erreur. Il est préférable de combiner plusieurs approches de sécurité en couches plutôt que de s'appuyer sur une seule couche de défense pour assurer la sécurité. Par exemple : utilisez à la fois des autorisations en lecture seule et un cloisonnement pour vous assurer que les LLM ne peuvent accéder qu'aux données qui leur sont explicitement destinées.

Les risques de ne pas le faire incluent, sans s'y limiter :

* Corruption ou perte de données.
* Accès non autorisé à des informations confidentielles.
* Compromission des performances ou de la disponibilité de ressources critiques.

Exemples de scénarios avec stratégies d'atténuation :

* Un utilisateur peut demander à un agent ayant accès au système de fichiers de supprimer des fichiers qui ne devraient pas l'être ou de lire le contenu de fichiers contenant des informations sensibles. Pour atténuer, limitez l'agent à n'utiliser qu'un répertoire spécifique et autorisez-le uniquement à lire ou écrire des fichiers sûrs. Envisagez un cloisonnement supplémentaire de l'agent en l'exécutant dans un conteneur.

* Un utilisateur peut demander à un agent ayant un accès en écriture à une API externe d'écrire des données malveillantes dans l'API ou de supprimer des données de cette API. Pour atténuer, donnez à l'agent des clés d'API en lecture seule ou limitez-le à n'utiliser que les points de terminaison déjà résistants à ce type d'abus.

* Un utilisateur peut demander à un agent ayant accès à une base de données de supprimer une table ou de modifier le schéma. Pour atténuer, limitez les identifiants aux seules tables dont l'agent a besoin d'accéder et envisagez d'émettre des identifiants en LECTURE SEULE.

Si vous construisez des applications qui accèdent à des ressources externes comme des systèmes de fichiers, des API ou des bases de données, envisagez de vous entretenir avec l'équipe de sécurité de votre entreprise pour déterminer comment concevoir et sécuriser au mieux vos applications.

## Signaler une vulnérabilité

Veuillez signaler les vulnérabilités de sécurité par e-mail à security@langchain.dev. Cela permettra de s'assurer que le problème soit rapidement examiné et traité si nécessaire.
