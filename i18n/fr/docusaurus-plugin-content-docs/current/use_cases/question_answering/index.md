---
sidebar_class_name: hidden
translated: true
---

# Questions-réponses avec RAG

## Aperçu

L'une des applications les plus puissantes permises par les LLM est les chatbots sophistiqués de questions-réponses (Q&A). Il s'agit d'applications qui peuvent répondre à des questions sur des informations sources spécifiques. Ces applications utilisent une technique connue sous le nom de Retrieval Augmented Generation, ou RAG.

### Qu'est-ce que RAG ?

RAG est une technique pour augmenter les connaissances des LLM avec des données supplémentaires.

Les LLM peuvent raisonner sur une grande variété de sujets, mais leurs connaissances se limitent aux données publiques jusqu'à une date spécifique à laquelle ils ont été formés. Si vous voulez construire des applications d'IA qui peuvent raisonner sur des données privées ou des données introduites après la date limite d'un modèle, vous devez augmenter les connaissances du modèle avec les informations spécifiques dont il a besoin. Le processus de rassembler les informations appropriées et de les insérer dans l'invite du modèle est connu sous le nom de Retrieval Augmented Generation (RAG).

LangChain a un certain nombre de composants conçus pour aider à construire des applications de Q&A, et des applications RAG plus généralement.

**Remarque** : Ici, nous nous concentrons sur la Q&A pour les données non structurées. Deux cas d'utilisation de RAG que nous couvrons ailleurs sont :

- [Q&A sur les données SQL](/docs/use_cases/sql/)
- [Q&A sur le code](/docs/use_cases/code_understanding) (par exemple, Python)

## Architecture RAG

Une application RAG typique a deux composants principaux :

**Indexation** : un pipeline pour ingérer des données à partir d'une source et les indexer. *Cela se produit généralement hors ligne.*

**Récupération et génération** : la chaîne RAG proprement dite, qui prend la requête de l'utilisateur au moment de l'exécution, récupère les données pertinentes à partir de l'index, puis les transmet au modèle.

La séquence complète la plus courante des données brutes à la réponse ressemble à :

#### Indexation

1. **Charger** : Tout d'abord, nous devons charger nos données. Cela se fait avec les [DocumentLoaders](/docs/modules/data_connection/document_loaders/).
2. **Diviser** : Les [Text splitters](/docs/modules/data_connection/document_transformers/) divisent les grands `Documents` en plus petits morceaux. Cela est utile à la fois pour indexer les données et pour les transmettre à un modèle, car les gros morceaux sont plus difficiles à rechercher et ne tiendront pas dans la fenêtre de contexte finie d'un modèle.
3. **Stocker** : Nous avons besoin d'un endroit pour stocker et indexer nos divisions, afin qu'elles puissent être recherchées plus tard. Cela se fait souvent à l'aide d'un [VectorStore](/docs/modules/data_connection/vectorstores/) et d'un modèle [Embeddings](/docs/modules/data_connection/text_embedding/).

![index_diagram](../../../../../../static/img/rag_indexing.png)

#### Récupération et génération

4. **Récupérer** : Étant donné une entrée d'utilisateur, les divisions pertinentes sont récupérées à partir du stockage à l'aide d'un [Retriever](/docs/modules/data_connection/retrievers/).
5. **Générer** : Un [ChatModel](/docs/modules/model_io/chat) / [LLM](/docs/modules/model_io/llms/) produit une réponse en utilisant une invite qui inclut la question et les données récupérées.

![retrieval_diagram](../../../../../../static/img/rag_retrieval_generation.png)

## Table des matières

- [Démarrage rapide](/docs/use_cases/question_answering/quickstart) : Nous vous recommandons de commencer par là. De nombreux guides suivants supposent que vous comprenez parfaitement l'architecture présentée dans le démarrage rapide.
- [Retourner les sources](/docs/use_cases/question_answering/sources) : Comment retourner les documents sources utilisés dans une génération particulière.
- [Diffusion en continu](/docs/use_cases/question_answering/streaming) : Comment diffuser les réponses finales ainsi que les étapes intermédiaires.
- [Ajouter l'historique de la conversation](/docs/use_cases/question_answering/chat_history) : Comment ajouter l'historique de la conversation à une application de Q&A.
- [Recherche hybride](/docs/use_cases/question_answering/hybrid) : Comment effectuer une recherche hybride.
- [Récupération par utilisateur](/docs/use_cases/question_answering/per_user) : Comment effectuer la récupération lorsque chaque utilisateur a ses propres données privées.
- [Utiliser des agents](/docs/use_cases/question_answering/conversational_retrieval_agents) : Comment utiliser des agents pour la Q&A.
- [Utiliser des modèles locaux](/docs/use_cases/question_answering/local_retrieval_qa) : Comment utiliser des modèles locaux pour la Q&A.
