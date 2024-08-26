---
sidebar_class_name: hidden
translated: true
---

# Modèles

Mise en évidence de quelques catégories différentes de modèles

## ⭐ Populaire

Voici quelques-uns des modèles les plus populaires pour commencer.

- [Chatbot à génération augmentée par récupération](/docs/templates/rag-conversation) : Construisez un chatbot sur vos données. Utilise par défaut OpenAI et PineconeVectorStore.
- [Extraction avec les fonctions OpenAI](/docs/templates/extraction-openai-functions) : Extraction de données structurées à partir de données non structurées. Utilise l'appel de fonction OpenAI.
- [Génération augmentée par récupération locale](/docs/templates/rag-chroma-private) : Construisez un chatbot sur vos données. Utilise uniquement des outils locaux : Ollama, GPT4all, Chroma.
- [Agent de fonctions OpenAI](/docs/templates/openai-functions-agent) : Construisez un chatbot qui peut prendre des mesures. Utilise l'appel de fonction OpenAI et Tavily.
- [Agent XML](/docs/templates/xml-agent) : Construisez un chatbot qui peut prendre des mesures. Utilise Anthropic et You.com.

## 📥 Récupération avancée

Ces modèles couvrent des techniques de récupération avancées, qui peuvent être utilisées pour le chat et la QA sur des bases de données ou des documents.

- [Reclassement](/docs/templates/rag-pinecone-rerank) : Cette technique de récupération utilise le point de terminaison de reclassement de Cohere pour reclasser les documents à partir d'une étape de récupération initiale.
- [Recherche itérative Anthropic](/docs/templates/anthropic-iterative-search) : Cette technique de récupération utilise un amorçage itératif pour déterminer ce qu'il faut récupérer et si les documents récupérés sont suffisants.
- **Récupération de documents parents** à l'aide de [Neo4j](/docs/templates/neo4j-parent) ou [MongoDB](/docs/templates/mongo-parent-document-retrieval) : Cette technique de récupération stocke les embeddings pour des morceaux plus petits, mais renvoie ensuite des morceaux plus importants à transmettre au modèle pour la génération.
- [RAG semi-structuré](/docs/templates/rag-semi-structured) : Le modèle montre comment effectuer une récupération sur des données semi-structurées (par exemple, des données impliquant à la fois du texte et des tableaux).
- [RAG temporel](/docs/templates/rag-timescale-hybrid-search-time) : Le modèle montre comment effectuer une recherche hybride sur des données avec une composante temporelle à l'aide de [Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral).

## 🔍Récupération avancée - Transformation de la requête

Une sélection de méthodes de récupération avancées impliquant la transformation de la requête utilisateur d'origine, ce qui peut améliorer la qualité de la récupération.

- [Embeddings de documents hypothétiques](/docs/templates/hyde) : Une technique de récupération qui génère un document hypothétique pour une requête donnée, puis utilise l'embedding de ce document pour effectuer une recherche sémantique. [Article](https://arxiv.org/abs/2212.10496).
- [Réécrire-Récupérer-Lire](/docs/templates/rewrite-retrieve-read) : Une technique de récupération qui réécrit une requête donnée avant de la transmettre à un moteur de recherche. [Article](https://arxiv.org/abs/2305.14283).
- [Amorçage de QA par étapes](/docs/templates/stepback-qa-prompting) : Une technique de récupération qui génère une question "en retrait" puis récupère les documents pertinents à la fois pour cette question et la question d'origine. [Article](https://arxiv.org/abs//2310.06117).
- [RAG-Fusion](/docs/templates/rag-fusion) : Une technique de récupération qui génère plusieurs requêtes et reclasse ensuite les documents récupérés à l'aide de la fusion du rang réciproque. [Article](https://towardsdatascience.com/forget-rag-the-future-is-rag-fusion-1147298d8ad1).
- [Récupérateur multi-requête](/docs/templates/rag-pinecone-multi-query) : Cette technique de récupération utilise un LLM pour générer plusieurs requêtes, puis récupère des documents pour toutes les requêtes.

## 🧠Récupération avancée - Construction de requête

Une sélection de méthodes de récupération avancées impliquant la construction d'une requête dans un DSL séparé du langage naturel, ce qui permet le chat en langage naturel sur diverses bases de données structurées.

- [Générateur de requêtes Elastic](/docs/templates/elastic-query-generator) : Générez des requêtes de recherche Elastic à partir du langage naturel.
- [Génération de Cypher Neo4j](/docs/templates/neo4j-cypher) : Générez des instructions Cypher à partir du langage naturel. Disponible également avec une option ["texte intégral"](/docs/templates/neo4j-cypher-ft).
- [Requête autonome Supabase](/docs/templates/self-query-supabase) : Analysez une requête en langage naturel en une requête sémantique ainsi qu'un filtre de métadonnées pour Supabase.

## 🦙 Modèles OSS

Ces modèles utilisent des modèles OSS, ce qui permet la confidentialité des données sensibles.

- [Génération augmentée par récupération locale](/docs/templates/rag-chroma-private) : Construisez un chatbot sur vos données. Utilise uniquement des outils locaux : Ollama, GPT4all, Chroma.
- [Réponse aux questions SQL (Replicate)](/docs/templates/sql-llama2) : Réponse aux questions sur une base de données SQL, en utilisant Llama2 hébergé sur [Replicate](https://replicate.com/).
- [Réponse aux questions SQL (LlamaCpp)](/docs/templates/sql-llamacpp) : Réponse aux questions sur une base de données SQL, en utilisant Llama2 via [LlamaCpp](https://github.com/ggerganov/llama.cpp).
- [Réponse aux questions SQL (Ollama)](/docs/templates/sql-ollama) : Réponse aux questions sur une base de données SQL, en utilisant Llama2 via [Ollama](https://github.com/jmorganca/ollama).

## ⛏️ Extraction

Ces modèles extraient des données dans un format structuré en fonction d'un schéma spécifié par l'utilisateur.

- [Extraction à l'aide des fonctions OpenAI](/docs/templates/extraction-openai-functions) : Extrayez des informations à partir de texte à l'aide de l'appel de fonction OpenAI.
- [Extraction à l'aide des fonctions Anthropic](/docs/templates/extraction-anthropic-functions) : Extrayez des informations à partir de texte à l'aide d'un wrapper LangChain autour des points de terminaison Anthropic destinés à simuler l'appel de fonction.
- [Extraire les données de la plaque biotechnologique](/docs/templates/plate-chain) : Extrayez les données de microplaque à partir de feuilles de calcul Excel brouillonnes dans un format plus normalisé.

## ⛏️Résumé et étiquetage

Ces modèles résument ou catégorisent les documents et les textes.

- [Résumé à l'aide d'Anthropic](/docs/templates/summarize-anthropic) : Utilise Claude2 d'Anthropic pour résumer les longs documents.

## 🤖 Agents

Ces modèles construisent des chatbots qui peuvent prendre des mesures, aidant à automatiser les tâches.

- [Agent de fonctions OpenAI](/docs/templates/openai-functions-agent) : Construisez un chatbot qui peut prendre des mesures. Utilise l'appel de fonction OpenAI et Tavily.
- [Agent XML](/docs/templates/xml-agent) : Construisez un chatbot qui peut prendre des mesures. Utilise Anthropic et You.com.

## :rotating_light: Sécurité et évaluation

Ces modèles permettent la modération ou l'évaluation des sorties LLM.

- [Analyseur de sortie des garde-fous](/docs/templates/guardrails-output-parser) : Utilisez guardrails-ai pour valider la sortie LLM.
- [Commentaires du chatbot](/docs/templates/chat-bot-feedback) : Utilisez LangSmith pour évaluer les réponses du chatbot.
