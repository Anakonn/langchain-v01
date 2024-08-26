---
sidebar_position: 5
title: Pautas
translated: true
---

La calidad de los resultados de extracción depende de muchos factores.

Aquí hay un conjunto de pautas para ayudarte a obtener el mejor rendimiento de tus modelos:

* Establece la temperatura del modelo en `0`.
* Mejora el prompt. El prompt debe ser preciso y conciso.
* Documenta el esquema: Asegúrate de que el esquema esté documentado para proporcionar más información al LLM.
* ¡Proporciona ejemplos de referencia! Los ejemplos diversos pueden ayudar, incluyendo ejemplos donde no se debe extraer nada.
* Si tienes muchos ejemplos, usa un buscador para recuperar los ejemplos más relevantes.
* Realiza pruebas de referencia con el mejor LLM/Chat Model disponible (por ejemplo, gpt-4, claude-3, etc.) -- ¡consulta con el proveedor del modelo cuál es el más reciente y mejor!
* Si el esquema es muy grande, intenta dividirlo en múltiples esquemas más pequeños, ejecuta extracciones separadas y combina los resultados.
* ¡Asegúrate de que el esquema permita que el modelo RECHACE la extracción de información! Si no lo hace, el modelo se verá obligado a inventar información.
* Agrega pasos de verificación/corrección (pide a un LLM que corrija o verifique los resultados de la extracción).

## Prueba de referencia

* Crea y realiza pruebas de referencia de datos para tu caso de uso utilizando [LangSmith 🦜️🛠️](https://docs.smith.langchain.com/).
* ¿Tu LLM es lo suficientemente bueno? Usa [langchain-benchmarks 🦜💯 ](https://github.com/langchain-ai/langchain-benchmarks) para probar tu LLM utilizando conjuntos de datos existentes.

## ¡Tén en cuenta! 😶‍🌫️

* Los LLM son excelentes, pero no son necesarios para todos los casos. Si estás extrayendo información de una sola fuente estructurada (por ejemplo, LinkedIn), usar un LLM no es una buena idea; el web-scraping tradicional será mucho más barato y confiable.

* **ser humano en el bucle** Si necesitas **calidad perfecta**, probablemente tendrás que planificar tener un ser humano en el bucle, incluso los mejores LLM cometerán errores al tratar con tareas de extracción complejas.
