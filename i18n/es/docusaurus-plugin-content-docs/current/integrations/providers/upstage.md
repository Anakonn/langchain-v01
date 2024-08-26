---
traducido: falso
translated: true
---

# Upstage

[Upstage](https://upstage.ai) es una empresa líder de inteligencia artificial (IA) especializada en ofrecer componentes LLM de rendimiento superior al humano.

## Solar LLM

**Solar Mini Chat** es un modelo de lenguaje avanzado y poderoso, pero rápido, que se enfoca en inglés y coreano. Ha sido específicamente ajustado para propósitos de chat de varios turnos, mostrando un mejor rendimiento en una amplia gama de tareas de procesamiento de lenguaje natural, como conversaciones de varios turnos o tareas que requieren una comprensión de contextos largos, como RAG (Generación Aumentada por Recuperación), en comparación con otros modelos de tamaño similar. Este ajuste fino le otorga la capacidad de manejar conversaciones más largas de manera más efectiva, lo que lo hace particularmente apto para aplicaciones interactivas.

Además de Solar, Upstage también ofrece funciones para RAG (generación aumentada por recuperación) del mundo real, como **Groundedness Check** y **Layout Analysis**.

## Instalación y configuración

Instala el paquete `langchain-upstage`:

```bash
pip install -qU langchain-core langchain-upstage
```

Obtén [Claves API](https://console.upstage.ai) y establece la variable de entorno `UPSTAGE_API_KEY`.

## Integraciones de Upstage con LangChain

| API | Descripción | Importación | Ejemplo de uso |
| --- | --- | --- | --- |
| Chat | Construye asistentes usando Solar Mini Chat | `from langchain_upstage import ChatUpstage` | [Ir](../../chat/upstage) |
| Incrustación de texto | Incrustar cadenas en vectores | `from langchain_upstage import UpstageEmbeddings` | [Ir](../../text_embedding/upstage) |
| Verificación de Groundedness | Verificar la solidez de la respuesta del asistente | `from langchain_upstage import UpstageGroundednessCheck` | [Ir](../../tools/upstage_groundedness_check) |
| Análisis de diseño | Serializar documentos con tablas y figuras | `from langchain_upstage import UpstageLayoutAnalysisLoader` | [Ir](../../document_loaders/upstage) |

Consulta la [documentación](https://developers.upstage.ai/) para obtener más detalles sobre las funciones.

## Ejemplos rápidos

### Configuración del entorno

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

### Chat

```python
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
response = chat.invoke("Hello, how are you?")
print(response)
```

### Incrustación de texto

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)

query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

### Verificación de Groundedness

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()

request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawaii. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}
response = groundedness_check.invoke(request_input)
print(response)
```

### Análisis de diseño

```python
from langchain_upstage import UpstageLayoutAnalysisLoader

file_path = "/PATH/TO/YOUR/FILE.pdf"
layzer = UpstageLayoutAnalysisLoader(file_path, split="page")

# For improved memory efficiency, consider using the lazy_load method to load documents page by page.
docs = layzer.load()  # or layzer.lazy_load()

for doc in docs[:3]:
    print(doc)
```
