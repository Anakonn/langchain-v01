---
translated: true
---

# Plantillas

Destacando algunas categorías diferentes de plantillas

## ⭐ Populares

Estas son algunas de las plantillas más populares para empezar.

- [Chatbot de Generación Aumentada por Recuperación](/docs/templates/rag-conversation): Construye un chatbot sobre tus datos. Por defecto usa OpenAI y PineconeVectorStore.
- [Extracción con Funciones de OpenAI](/docs/templates/extraction-openai-functions): Realiza la extracción de datos estructurados a partir de datos no estructurados. Utiliza la llamada a funciones de OpenAI.
- [Generación Aumentada por Recuperación Local](/docs/templates/rag-chroma-private): Construye un chatbot sobre tus datos. Utiliza solo herramientas locales: Ollama, GPT4all, Chroma.
- [Agente de Funciones de OpenAI](/docs/templates/openai-functions-agent): Construye un chatbot que puede realizar acciones. Utiliza la llamada a funciones de OpenAI y Tavily.
- [Agente XML](/docs/templates/xml-agent): Construye un chatbot que puede realizar acciones. Utiliza Anthropic y You.com.

## 📥 Recuperación Avanzada

Estas plantillas cubren técnicas de recuperación avanzadas, que se pueden utilizar para chat y preguntas y respuestas sobre bases de datos o documentos.

- [Reordenación](/docs/templates/rag-pinecone-rerank): Esta técnica de recuperación utiliza el punto final de reordenación de Cohere para reordenar los documentos de un paso de recuperación inicial.
- [Búsqueda Iterativa de Anthropic](/docs/templates/anthropic-iterative-search): Esta técnica de recuperación utiliza el prompting iterativo para determinar qué recuperar y si los documentos recuperados son lo suficientemente buenos.
- **Recuperación de Documentos Principales** usando [Neo4j](/docs/templates/neo4j-parent) o [MongoDB](/docs/templates/mongo-parent-document-retrieval): Esta técnica de recuperación almacena incrustaciones para trozos más pequeños, pero luego devuelve trozos más grandes para pasarlos al modelo para la generación.
- [RAG Semi-Estructurado](/docs/templates/rag-semi-structured): La plantilla muestra cómo hacer la recuperación sobre datos semi-estructurados (por ejemplo, datos que involucran tanto texto como tablas).
- [RAG Temporal](/docs/templates/rag-timescale-hybrid-search-time): La plantilla muestra cómo hacer una búsqueda híbrida sobre datos con un componente basado en el tiempo utilizando [Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral).

## 🔍Recuperación Avanzada - Transformación de Consultas

Una selección de métodos de recuperación avanzados que implican transformar la consulta original del usuario, lo que puede mejorar la calidad de la recuperación.

- [Incrustaciones de Documentos Hipotéticos](/docs/templates/hyde): Una técnica de recuperación que genera un documento hipotético para una consulta dada, y luego utiliza la incrustación de ese documento para hacer una búsqueda semántica. [Artículo](https://arxiv.org/abs/2212.10496).
- [Reescribir-Recuperar-Leer](/docs/templates/rewrite-retrieve-read): Una técnica de recuperación que reescribe una consulta dada antes de pasarla a un motor de búsqueda. [Artículo](https://arxiv.org/abs/2305.14283).
- [Prompting de Preguntas y Respuestas con Paso Atrás](/docs/templates/stepback-qa-prompting): Una técnica de recuperación que genera una pregunta de "paso atrás" y luego recupera documentos relevantes tanto para esa pregunta como para la pregunta original. [Artículo](https://arxiv.org/abs//2310.06117).
- [RAG-Fusion](/docs/templates/rag-fusion): Una técnica de recuperación que genera múltiples consultas y luego reordena los documentos recuperados utilizando la fusión de clasificación recíproca. [Artículo](https://towardsdatascience.com/forget-rag-the-future-is-rag-fusion-1147298d8ad1).
- [Recuperador de Múltiples Consultas](/docs/templates/rag-pinecone-multi-query): Esta técnica de recuperación utiliza un LLM para generar múltiples consultas y luego obtiene documentos para todas las consultas.

## 🧠Recuperación Avanzada - Construcción de Consultas

Una selección de métodos de recuperación avanzados que implican construir una consulta en un DSL separado del lenguaje natural, lo que permite el chat en lenguaje natural sobre varias bases de datos estructuradas.

- [Generador de Consultas Elásticas](/docs/templates/elastic-query-generator): Generar consultas de búsqueda elástica a partir de lenguaje natural.
- [Generación de Cypher de Neo4j](/docs/templates/neo4j-cypher): Generar declaraciones Cypher a partir de lenguaje natural. También disponible con una opción de ["texto completo"](/docs/templates/neo4j-cypher-ft).
- [Autoconsula de Supabase](/docs/templates/self-query-supabase): Analizar una consulta en lenguaje natural en una consulta semántica, así como un filtro de metadatos para Supabase.

## 🦙 Modelos OSS

Estas plantillas utilizan modelos OSS, lo que permite la privacidad de los datos sensibles.

- [Generación Aumentada por Recuperación Local](/docs/templates/rag-chroma-private): Construye un chatbot sobre tus datos. Utiliza solo herramientas locales: Ollama, GPT4all, Chroma.
- [Preguntas y Respuestas SQL (Replicate)](/docs/templates/sql-llama2): Preguntas y respuestas sobre una base de datos SQL, utilizando Llama2 alojado en [Replicate](https://replicate.com/).
- [Preguntas y Respuestas SQL (LlamaCpp)](/docs/templates/sql-llamacpp): Preguntas y respuestas sobre una base de datos SQL, utilizando Llama2 a través de [LlamaCpp](https://github.com/ggerganov/llama.cpp).
- [Preguntas y Respuestas SQL (Ollama)](/docs/templates/sql-ollama): Preguntas y respuestas sobre una base de datos SQL, utilizando Llama2 a través de [Ollama](https://github.com/jmorganca/ollama).

## ⛏️ Extracción

Estas plantillas extraen datos en un formato estructurado en función de un esquema especificado por el usuario.

- [Extracción Utilizando Funciones de OpenAI](/docs/templates/extraction-openai-functions): Extraer información de texto utilizando la Llamada a Funciones de OpenAI.
- [Extracción Utilizando Funciones de Anthropic](/docs/templates/extraction-anthropic-functions): Extraer información de texto utilizando un wrapper de LangChain alrededor de los puntos finales de Anthropic destinados a simular la llamada a funciones.
- [Extraer Datos de Placas Biotecnológicas](/docs/templates/plate-chain): Extraer datos de microplacas de hojas de cálculo de Excel desordenadas en un formato más normalizado.

## ⛏️Resumen y etiquetado

Estas plantillas resumen o categorizan documentos y texto.

- [Resumen utilizando Anthropic](/docs/templates/summarize-anthropic): Utiliza Claude2 de Anthropic para resumir documentos largos.

## 🤖 Agentes

Estas plantillas construyen chatbots que pueden tomar acciones, ayudando a automatizar tareas.

- [Agente de funciones de OpenAI](/docs/templates/openai-functions-agent): Construye un chatbot que puede tomar acciones. Utiliza la llamada de funciones de OpenAI y Tavily.
- [Agente XML](/docs/templates/xml-agent): Construye un chatbot que puede tomar acciones. Utiliza Anthropic y You.com.

## :rotating_light: Seguridad y evaluación

Estas plantillas permiten la moderación o evaluación de las salidas de LLM.

- [Analizador de salida de Guardrails](/docs/templates/guardrails-output-parser): Utiliza guardrails-ai para validar la salida de LLM.
- [Comentarios del chatbot](/docs/templates/chat-bot-feedback): Utiliza LangSmith para evaluar las respuestas del chatbot.
