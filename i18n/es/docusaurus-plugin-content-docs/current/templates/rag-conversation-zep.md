---
translated: true
---

# rag-conversation-zep

Esta plantilla demuestra la construcción de una aplicación de conversación RAG utilizando Zep.

Incluido en esta plantilla:
- Poblar una [Colección de documentos Zep](https://docs.getzep.com/sdk/documents/) con un conjunto de documentos (una Colección es análoga a un índice en otras Bases de datos de vectores).
- Usar la funcionalidad de [incrustación integrada](https://docs.getzep.com/deployment/embeddings/) de Zep para incrustar los documentos como vectores.
- Configurar un [Recuperador de almacén de vectores ZepVectorStore](https://docs.getzep.com/sdk/documents/) de LangChain para recuperar documentos utilizando el reordenamiento de [Relevancia Marginal Máxima](https://docs.getzep.com/sdk/search_query/) (MMR) integrado y acelerado por hardware de Zep.
- Indicaciones, una estructura de datos de historial de chat simple y otros componentes necesarios para construir una aplicación de conversación RAG.
- La cadena de conversación RAG.

## Acerca de [Zep - Bloques de construcción rápidos y escalables para aplicaciones LLM](https://www.getzep.com/)

Zep es una plataforma de código abierto para producir aplicaciones LLM. Pasa de un prototipo construido en LangChain o LlamaIndex, o una aplicación personalizada, a la producción en minutos sin reescribir código.

Características clave:

- ¡Rápido! Los extractores asíncronos de Zep operan de forma independiente de su bucle de chat, asegurando una experiencia de usuario ágil.
- Persistencia de memoria a largo plazo, con acceso a mensajes históricos independientemente de su estrategia de resumen.
- Resumen automático de mensajes de memoria basado en una ventana de mensajes configurable. Se almacenan una serie de resúmenes, proporcionando flexibilidad para futuras estrategias de resumen.
- Búsqueda híbrida sobre memorias y metadatos, con mensajes incrustados automáticamente en la creación.
- Extractor de entidades que extrae automáticamente entidades nombradas de los mensajes y las almacena en los metadatos del mensaje.
- Recuento automático de tokens de memorias y resúmenes, permitiendo un control más detallado sobre el ensamblaje de indicaciones.
- SDK de Python y JavaScript.

Proyecto Zep: https://github.com/getzep/zep | Documentación: https://docs.getzep.com/

## Configuración del entorno

Configura un servicio Zep siguiendo la [Guía de inicio rápido](https://docs.getzep.com/deployment/quickstart/).

## Ingestión de documentos en una Colección Zep

Ejecuta `python ingest.py` para ingerir los documentos de prueba en una Colección Zep. Revisa el archivo para modificar el nombre de la Colección y la fuente de los documentos.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-conversation-zep
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-conversation-zep
```

Y agregar el siguiente código a su archivo `server.py`:

```python
from rag_conversation_zep import chain as rag_conversation_zep_chain

add_routes(app, rag_conversation_zep_chain, path="/rag-conversation-zep")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-conversation-zep/playground](http://127.0.0.1:8000/rag-conversation-zep/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-conversation-zep")
```
