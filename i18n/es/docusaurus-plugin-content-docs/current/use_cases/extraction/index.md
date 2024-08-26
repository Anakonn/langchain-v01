---
sidebar_class_name: hidden
title: Extracción de salida estructurada
translated: true
---

## Resumen

Los Modelos de Lenguaje de Gran Tamaño (LLMs) están emergiendo como una tecnología extremadamente capaz para impulsar aplicaciones de extracción de información.

Las soluciones clásicas a la extracción de información se basan en una combinación de personas, (muchas) reglas creadas a mano (por ejemplo, expresiones regulares) y modelos de ML personalizados y ajustados.

Estos sistemas tienden a volverse complejos con el tiempo y se vuelven progresivamente más costosos de mantener y más difíciles de mejorar.

Los LLM se pueden adaptar rápidamente a tareas de extracción específicas simplemente proporcionando instrucciones apropiadas y ejemplos de referencia adecuados.

¡Esta guía le mostrará cómo usar LLM para aplicaciones de extracción!

## Enfoques

Hay 3 enfoques generales para la extracción de información utilizando LLM:

- **Modo de Llamada de Herramienta/Función**: Algunos LLM admiten un modo de *llamada de herramienta o función*. Estos LLM pueden estructurar la salida de acuerdo con un **esquema** dado. En general, este enfoque es el más fácil de trabajar y se espera que produzca buenos resultados.

- **Modo JSON**: Algunos LLM pueden forzarse a generar JSON válido. Esto es similar al enfoque de **Llamada de Herramienta/Función**, excepto que el esquema se proporciona como parte del mensaje. En general, nuestra intuición es que esto se desempeña peor que un enfoque de **Llamada de Herramienta/Función**, pero no nos creas y ¡verifica por ti mismo tu caso de uso!

- **Basado en Mensajes**: Los LLM que pueden seguir instrucciones bien pueden recibir instrucciones para generar texto en un formato deseado. El texto generado se puede analizar posteriormente usando [Analizadores de Salida](/docs/modules/model_io/output_parsers/) existentes o usando [analizadores personalizados](/docs/modules/model_io/output_parsers/custom) en un formato estructurado como JSON. Este enfoque se puede usar con LLM que **no admitan** el modo JSON o los modos de llamada de herramienta/función. Este enfoque es más ampliamente aplicable, aunque puede dar peores resultados que los modelos que se han ajustado finamente para la extracción o la llamada de funciones.

## Inicio rápido

Dirígete al [inicio rápido](/docs/use_cases/extraction/quickstart) para ver cómo extraer información usando LLM mediante un ejemplo básico de principio a fin.

El inicio rápido se centra en la extracción de información utilizando el enfoque de **Llamada de Herramienta/Función**.

## Guías prácticas

- [Usar Ejemplos de Referencia](/docs/use_cases/extraction/how_to/examples): Aprende a usar **ejemplos de referencia** para mejorar el rendimiento.
- [Manejar Texto Largo](/docs/use_cases/extraction/how_to/handle_long_text): ¿Qué debes hacer si el texto no cabe en la ventana de contexto del LLM?
- [Manejar Archivos](/docs/use_cases/extraction/how_to/handle_files): Ejemplos de uso de cargadores y analizadores de documentos de LangChain para extraer de archivos como PDF.
- [Usar un Enfoque de Análisis](/docs/use_cases/extraction/how_to/parse): Usa un enfoque basado en mensajes para extraer con modelos que no admiten **Llamada de Herramienta/Función**.

## Pautas

Dirígete a la página de [Pautas](/docs/use_cases/extraction/guidelines) para ver una lista de pautas con opiniones sobre cómo obtener el mejor rendimiento para casos de uso de extracción.

## Acelerador de Caso de Uso

[langchain-extract](https://github.com/langchain-ai/langchain-extract) es un repositorio inicial que implementa un servidor web simple para la extracción de información de texto y archivos utilizando LLM. Está construido usando **FastAPI**, **LangChain** y **Postgresql**. Siéntete libre de adaptarlo a tus propios casos de uso.

## Otros Recursos

* La documentación del [analizador de salida](/docs/modules/model_io/output_parsers/) incluye varios ejemplos de analizadores para tipos específicos (por ejemplo, listas, fechas y horas, enumeraciones, etc.).
* Cargadores de documentos [LangChain](/docs/modules/data_connection/document_loaders/) para cargar contenido de archivos. Consulta la lista de [integraciones](/docs/integrations/document_loaders).
* El soporte experimental de [Llamada de Función de Anthropic](/docs/integrations/chat/anthropic_functions) proporciona una funcionalidad similar a los modelos de chat de Anthropic.
* [LlamaCPP](/docs/integrations/llms/llamacpp#grammars) admite decodificación restringida utilizando gramáticas personalizadas, lo que facilita la generación de contenido estructurado utilizando LLM locales.
* [JSONFormer](/docs/integrations/llms/jsonformer_experimental) ofrece otra forma de decodificación estructurada de un subconjunto del Esquema JSON.
* [Kor](https://eyurtsev.github.io/kor/) es otra biblioteca para extracción donde se puede proporcionar el esquema y los ejemplos al LLM. Kor está optimizado para trabajar con un enfoque de análisis.
* [Llamada de Función y Herramienta de OpenAI](https://platform.openai.com/docs/guides/function-calling)
* Por ejemplo, consulta [el modo JSON de OpenAI](https://platform.openai.com/docs/guides/text-generation/json-mode).
