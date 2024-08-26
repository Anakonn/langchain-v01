---
sidebar_class_name: hidden
translated: true
---

# Chatbots

## Aperçu

Les chatbots sont l'un des cas d'utilisation les plus populaires pour les LLM. Les principales caractéristiques des chatbots sont qu'ils peuvent avoir des conversations de longue durée et avec un état, et peuvent répondre aux questions des utilisateurs en utilisant des informations pertinentes.

## Architectures

La conception d'un chatbot implique de prendre en compte diverses techniques avec différents avantages et compromis selon le type de questions auxquelles vous vous attendez à ce qu'il réponde.

Par exemple, les chatbots utilisent couramment la [génération augmentée par la recherche](/docs/use_cases/question_answering/), ou RAG, sur des données privées pour mieux répondre à des questions spécifiques à un domaine. Vous pouvez également choisir d'aiguiller entre plusieurs sources de données pour vous assurer qu'il n'utilise que le contexte le plus pertinent pour la réponse finale à la question, ou choisir d'utiliser un type de historique de conversation ou de mémoire plus spécialisé que de simplement passer des messages d'un côté à l'autre.

![Description de l'image](../../../../../../static/img/chat_use_case.png)

Des optimisations comme celle-ci peuvent rendre votre chatbot plus puissant, mais ajoutent de la latence et de la complexité. L'objectif de ce guide est de vous donner un aperçu de la façon d'implémenter diverses fonctionnalités et de vous aider à adapter votre chatbot à votre cas d'utilisation particulier.

## Table des matières

- [Démarrage rapide](/docs/use_cases/chatbots/quickstart) : Nous vous recommandons de commencer par là. De nombreux guides suivants supposent que vous comprenez parfaitement l'architecture présentée dans le démarrage rapide.
- [Gestion de la mémoire](/docs/use_cases/chatbots/memory_management) : Cette section couvre diverses stratégies que votre chatbot peut utiliser pour gérer les informations des tours de conversation précédents.
- [Recherche](/docs/use_cases/chatbots/retrieval) : Cette section couvre comment permettre à votre chatbot d'utiliser des sources de données externes comme contexte.
- [Utilisation des outils](/docs/use_cases/chatbots/tool_usage) : Cette section couvre comment transformer votre chatbot en agent conversationnel en lui ajoutant la capacité d'interagir avec d'autres systèmes et API à l'aide d'outils.
