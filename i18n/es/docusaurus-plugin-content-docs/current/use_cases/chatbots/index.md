---
sidebar_class_name: hidden
translated: true
---

# Chatbots

## Resumen

Los chatbots son uno de los casos de uso más populares para los LLM. Las características principales de los chatbots son que pueden tener conversaciones de larga duración y con estado, y pueden responder a las preguntas de los usuarios utilizando información relevante.

## Arquitecturas

El diseño de un chatbot implica considerar varias técnicas con diferentes beneficios y compensaciones, dependiendo del tipo de preguntas que se espera que maneje.

Por ejemplo, los chatbots suelen utilizar la [generación aumentada por recuperación](/docs/use_cases/question_answering/) (RAG, por sus siglas en inglés) sobre datos privados para responder mejor a preguntas específicas del dominio. También podrías optar por enrutar entre múltiples fuentes de datos para asegurarte de que solo utilice el contexto más relevante para la respuesta final a la pregunta, o elegir utilizar un tipo de historial de chat o memoria más especializado que simplemente pasar mensajes de ida y vuelta.

![Descripción de la imagen](../../../../../../static/img/chat_use_case.png)

Las optimizaciones como esta pueden hacer que tu chatbot sea más potente, pero agregan latencia y complejidad. El objetivo de esta guía es darte una visión general de cómo implementar varias funciones y ayudarte a adaptar tu chatbot a tu caso de uso particular.

## Tabla de contenidos

- [Inicio rápido](/docs/use_cases/chatbots/quickstart): Te recomendamos comenzar aquí. Muchas de las siguientes guías asumen que entiendes completamente la arquitectura que se muestra en el Inicio rápido.
- [Gestión de la memoria](/docs/use_cases/chatbots/memory_management): Esta sección cubre varias estrategias que tu chatbot puede utilizar para manejar la información de los turnos de conversación anteriores.
- [Recuperación](/docs/use_cases/chatbots/retrieval): Esta sección cubre cómo habilitar a tu chatbot para que utilice fuentes de datos externas como contexto.
- [Uso de herramientas](/docs/use_cases/chatbots/tool_usage): Esta sección cubre cómo convertir tu chatbot en un agente conversacional al agregarle la capacidad de interactuar con otros sistemas y APIs utilizando herramientas.
