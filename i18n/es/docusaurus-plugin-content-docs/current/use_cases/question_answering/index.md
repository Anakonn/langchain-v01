---
sidebar_class_name: hidden
translated: true
---

# Preguntas y respuestas con RAG

## Resumen

Una de las aplicaciones más poderosas habilitadas por los LLM es la de los chatbots sofisticados de preguntas y respuestas (Q&A). Estas son aplicaciones que pueden responder preguntas sobre información de fuentes específicas. Estas aplicaciones utilizan una técnica conocida como Retrieval Augmented Generation, o RAG.

### ¿Qué es RAG?

RAG es una técnica para aumentar el conocimiento de los LLM con datos adicionales.

Los LLM pueden razonar sobre una amplia gama de temas, pero su conocimiento se limita a los datos públicos hasta un punto específico en el tiempo en el que fueron entrenados. Si desea crear aplicaciones de IA que puedan razonar sobre datos privados o datos introducidos después de la fecha de corte de un modelo, necesita aumentar el conocimiento del modelo con la información específica que necesita. El proceso de traer la información apropiada e insertarla en el prompt del modelo se conoce como Retrieval Augmented Generation (RAG).

LangChain tiene una serie de componentes diseñados para ayudar a construir aplicaciones de Q&A y aplicaciones de RAG en general.

**Nota**: Aquí nos centramos en la Q&A para datos no estructurados. Dos casos de uso de RAG que cubrimos en otro lugar son:

- [Q&A sobre datos SQL](/docs/use_cases/sql/)
- [Q&A sobre código](/docs/use_cases/code_understanding) (por ejemplo, Python)

## Arquitectura RAG

Una aplicación RAG típica tiene dos componentes principales:

**Indexación**: una canalización para ingerir datos de una fuente e indexarlos. *Esto suele ocurrir fuera de línea.*

**Recuperación y generación**: la cadena RAG real, que toma la consulta del usuario en tiempo de ejecución, recupera los datos relevantes del índice y luego los pasa al modelo.

La secuencia completa más común desde los datos sin procesar hasta la respuesta se ve así:

#### Indexación

1. **Cargar**: Primero necesitamos cargar nuestros datos. Esto se hace con [DocumentLoaders](/docs/modules/data_connection/document_loaders/).
2. **Dividir**: [Text splitters](/docs/modules/data_connection/document_transformers/) dividen los `Documents` grandes en trozos más pequeños. Esto es útil tanto para indexar datos como para pasarlos a un modelo, ya que los trozos grandes son más difíciles de buscar y no cabrán en la ventana de contexto finita de un modelo.
3. **Almacenar**: Necesitamos un lugar para almacenar e indexar nuestros splits, para que luego puedan ser buscados. Esto a menudo se hace usando un [VectorStore](/docs/modules/data_connection/vectorstores/) y un modelo de [Embeddings](/docs/modules/data_connection/text_embedding/).

![index_diagram](../../../../../../static/img/rag_indexing.png)

#### Recuperación y generación

4. **Recuperar**: Dada una entrada de usuario, los splits relevantes se recuperan del almacenamiento utilizando un [Retriever](/docs/modules/data_connection/retrievers/).
5. **Generar**: Un [ChatModel](/docs/modules/model_io/chat) / [LLM](/docs/modules/model_io/llms/) produce una respuesta utilizando un prompt que incluye la pregunta y los datos recuperados.

![retrieval_diagram](../../../../../../static/img/rag_retrieval_generation.png)

## Tabla de contenidos

- [Inicio rápido](/docs/use_cases/question_answering/quickstart): Le recomendamos que comience por aquí. Muchas de las siguientes guías asumen que usted entiende completamente la arquitectura que se muestra en el Inicio rápido.
- [Devolver fuentes](/docs/use_cases/question_answering/sources): Cómo devolver los documentos fuente utilizados en una generación particular.
- [Transmisión](/docs/use_cases/question_answering/streaming): Cómo transmitir las respuestas finales y los pasos intermedios.
- [Agregar historial de chat](/docs/use_cases/question_answering/chat_history): Cómo agregar el historial de chat a una aplicación de Q&A.
- [Búsqueda híbrida](/docs/use_cases/question_answering/hybrid): Cómo hacer una búsqueda híbrida.
- [Recuperación por usuario](/docs/use_cases/question_answering/per_user): Cómo hacer la recuperación cuando cada usuario tiene sus propios datos privados.
- [Uso de agentes](/docs/use_cases/question_answering/conversational_retrieval_agents): Cómo usar agentes para Q&A.
- [Uso de modelos locales](/docs/use_cases/question_answering/local_retrieval_qa): Cómo usar modelos locales para Q&A.
