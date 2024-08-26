---
title: Recuperador personalizado
translated: true
---

# Recuperador personalizado

## Resumen

Muchas aplicaciones de LLM implican recuperar información de fuentes de datos externas utilizando un `Recuperador`.

Un recuperador es responsable de recuperar una lista de `Documentos` relevantes a una `consulta` de usuario dada.

Los documentos recuperados a menudo se formatean en indicaciones que se alimentan en un LLM, lo que permite que el LLM use la información en ellos para generar una respuesta apropiada (por ejemplo, responder a una pregunta de usuario basada en una base de conocimientos).

## Interfaz

Para crear tu propio recuperador, debes extender la clase `BaseRetriever` e implementar los siguientes métodos:

| Método                         | Descripción                                      | Requerido/Opcional |
|--------------------------------|--------------------------------------------------|-------------------|
| `_get_relevant_documents`      | Obtener documentos relevantes a una consulta.    | Requerido          |
| `_aget_relevant_documents`     | Implementar para proporcionar soporte nativo asíncrono. | Opcional |

La lógica dentro de `_get_relevant_documents` puede involucrar llamadas arbitrarias a una base de datos o a la web utilizando solicitudes.

:::tip
¡Al heredar de `BaseRetriever`, tu recuperador se convierte automáticamente en un [Runnable](/docs/expression_language/interface) de LangChain y obtendrá la funcionalidad estándar de `Runnable` de forma gratuita!
:::

:::info
Puedes usar un `RunnableLambda` o `RunnableGenerator` para implementar un recuperador.

El principal beneficio de implementar un recuperador como un `BaseRetriever` en lugar de un `RunnableLambda` (una [función ejecutable](/docs/expression_language/primitives/functions) personalizada) es que un `BaseRetriever` es una entidad de LangChain bien conocida, por lo que algunas herramientas de monitoreo pueden implementar un comportamiento especializado para los recuperadores. Otra diferencia es que un `BaseRetriever` se comportará ligeramente diferente a un `RunnableLambda` en algunas API; por ejemplo, el evento `start` en la API `astream_events` será `on_retriever_start` en lugar de `on_chain_start`.
:::

## Ejemplo

Implementemos un recuperador de juguete que devuelva todos los documentos cuyo texto contenga el texto de la consulta del usuario.

```python
from typing import List

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever


class ToyRetriever(BaseRetriever):
    """A toy retriever that contains the top k documents that contain the user query.

    This retriever only implements the sync method _get_relevant_documents.

    If the retriever were to involve file access or network access, it could benefit
    from a native async implementation of `_aget_relevant_documents`.

    As usual, with Runnables, there's a default async implementation that's provided
    that delegates to the sync implementation running on another thread.
    """

    documents: List[Document]
    """List of documents to retrieve from."""
    k: int
    """Number of top results to return"""

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        """Sync implementations for retriever."""
        matching_documents = []
        for document in self.documents:
            if len(matching_documents) > self.k:
                return matching_documents

            if query.lower() in document.page_content.lower():
                matching_documents.append(document)
        return matching_documents

    # Optional: Provide a more efficient native implementation by overriding
    # _aget_relevant_documents
    # async def _aget_relevant_documents(
    #     self, query: str, *, run_manager: AsyncCallbackManagerForRetrieverRun
    # ) -> List[Document]:
    #     """Asynchronously get documents relevant to a query.

    #     Args:
    #         query: String to find relevant documents for
    #         run_manager: The callbacks handler to use

    #     Returns:
    #         List of relevant documents
    #     """
```

## Pruébalo 🧪

```python
documents = [
    Document(
        page_content="Dogs are great companions, known for their loyalty and friendliness.",
        metadata={"type": "dog", "trait": "loyalty"},
    ),
    Document(
        page_content="Cats are independent pets that often enjoy their own space.",
        metadata={"type": "cat", "trait": "independence"},
    ),
    Document(
        page_content="Goldfish are popular pets for beginners, requiring relatively simple care.",
        metadata={"type": "fish", "trait": "low maintenance"},
    ),
    Document(
        page_content="Parrots are intelligent birds capable of mimicking human speech.",
        metadata={"type": "bird", "trait": "intelligence"},
    ),
    Document(
        page_content="Rabbits are social animals that need plenty of space to hop around.",
        metadata={"type": "rabbit", "trait": "social"},
    ),
]
retriever = ToyRetriever(documents=documents, k=3)
```

```python
retriever.invoke("that")
```

```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'type': 'rabbit', 'trait': 'social'})]
```

¡Es un **ejecutable**, así que se beneficiará de la Interfaz Ejecutable estándar! 🤩

```python
await retriever.ainvoke("that")
```

```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'type': 'rabbit', 'trait': 'social'})]
```

```python
retriever.batch(["dog", "cat"])
```

```output
[[Document(page_content='Dogs are great companions, known for their loyalty and friendliness.', metadata={'type': 'dog', 'trait': 'loyalty'})],
 [Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'})]]
```

```python
async for event in retriever.astream_events("bar", version="v1"):
    print(event)
```

```output
{'event': 'on_retriever_start', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'name': 'ToyRetriever', 'tags': [], 'metadata': {}, 'data': {'input': 'bar'}}
{'event': 'on_retriever_stream', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'tags': [], 'metadata': {}, 'name': 'ToyRetriever', 'data': {'chunk': []}}
{'event': 'on_retriever_end', 'name': 'ToyRetriever', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'tags': [], 'metadata': {}, 'data': {'output': []}}
```

## Contribución

¡Apreciamos las contribuciones de recuperadores interesantes!

Aquí hay una lista de verificación para ayudar a asegurarse de que tu contribución se agregue a LangChain:

Documentación:

* El recuperador contiene cadenas de documentación para todos los argumentos de inicialización, ya que estos se mostrarán en la [Referencia de API](https://api.python.langchain.com/en/stable/langchain_api_reference.html).
* La cadena de documentación de la clase para el modelo contiene un enlace a cualquier API relevante utilizada para el recuperador (por ejemplo, si el recuperador está recuperando de Wikipedia, sería bueno enlazar a la API de Wikipedia).

Pruebas:

* [ ] Agrega pruebas unitarias o de integración para verificar que `invoke` y `ainvoke` funcionen.

Optimizaciones:

Si el recuperador se conecta a fuentes de datos externas (por ejemplo, una API o un archivo), ¡casi con toda seguridad se beneficiará de una optimización nativa asíncrona!

* [ ] Proporciona una implementación asíncrona nativa de `_aget_relevant_documents` (utilizada por `ainvoke`)
