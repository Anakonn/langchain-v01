---
translated: true
---

# Marqo

Esta página cubre cómo usar el ecosistema Marqo dentro de LangChain.

### **¿Qué es Marqo?**

Marqo es un motor de búsqueda de tensores que utiliza incrustaciones almacenadas en índices HNSW en memoria para lograr velocidades de búsqueda de vanguardia. Marqo puede escalar a índices de cientos de millones de documentos con fragmentación horizontal de índices y permite la carga de datos y la búsqueda asincrónica y sin bloqueo. Marqo utiliza los últimos modelos de aprendizaje automático de PyTorch, Huggingface, OpenAI y más. Puedes comenzar con un modelo preconfigurado o traer el tuyo. El soporte ONNX incorporado y la conversión permiten una inferencia más rápida y un mayor rendimiento tanto en CPU como en GPU.

Debido a que Marqo incluye su propia inferencia, sus documentos pueden tener una mezcla de texto e imágenes, puede traer índices Marqo con datos de sus otros sistemas al ecosistema langchain sin tener que preocuparse por la compatibilidad de sus incrustaciones.

El despliegue de Marqo es flexible, ¡puedes comenzar por tu cuenta con nuestra imagen de docker o [contáctanos sobre nuestra oferta de nube administrada!](https://www.marqo.ai/pricing)

Para ejecutar Marqo localmente con nuestra imagen de docker, [consulta nuestro inicio rápido.](https://docs.marqo.ai/latest/)

## Instalación y configuración

- Instala el SDK de Python con `pip install marqo`

## Envoltorios

### VectorStore

Existe un envoltorio alrededor de los índices de Marqo, lo que le permite usarlos dentro del marco de vectorstore. Marqo le permite seleccionar entre una gama de modelos para generar incrustaciones y expone algunas configuraciones de preprocesamiento.

El vectorstore de Marqo también puede funcionar con índices multimodales existentes donde sus documentos tienen una mezcla de imágenes y texto, para obtener más información, consulte [nuestra documentación](https://docs.marqo.ai/latest/#multi-modal-and-cross-modal-search). Tenga en cuenta que instanciar el vectorstore de Marqo con un índice multimodal existente deshabilitará la capacidad de agregar nuevos documentos a él a través del método `add_texts` del vectorstore de langchain.

Para importar este vectorstore:

```python
<!--IMPORTS:[{"imported": "Marqo", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.marqo.Marqo.html", "title": "Marqo"}]-->
from langchain_community.vectorstores import Marqo
```

Para obtener una guía más detallada del envoltorio de Marqo y algunas de sus características únicas, consulte [este cuaderno](/docs/integrations/vectorstores/marqo)
