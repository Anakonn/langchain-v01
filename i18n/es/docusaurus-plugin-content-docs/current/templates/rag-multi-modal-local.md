---
translated: true
---

# rag-multi-modal-local

La búsqueda visual es una aplicación familiar para muchos con iPhones o dispositivos Android. Permite al usuario buscar fotos utilizando lenguaje natural.

Con el lanzamiento de LLM multimodales de código abierto, es posible construir este tipo de aplicación por ti mismo para tu propia colección de fotos privada.

Esta plantilla demuestra cómo realizar búsqueda visual privada y respuesta a preguntas sobre una colección de tus fotos.

Utiliza incrustaciones OpenCLIP para incrustar todas las fotos y almacenarlas en Chroma.

Dada una pregunta, se recuperan las fotos relevantes y se pasan a un LLM multimodal de código abierto de tu elección para la síntesis de respuestas.

## Entrada

Proporciona un conjunto de fotos en el directorio `/docs`.

De forma predeterminada, esta plantilla tiene una colección de juguete de 3 fotos de comida.

Algunas preguntas de ejemplo que se pueden hacer son:

```text
What kind of soft serve did I have?
```

En la práctica, se puede probar un corpus más grande de imágenes.

Para crear un índice de las imágenes, ejecuta:

```shell
poetry install
python ingest.py
```

## Almacenamiento

Esta plantilla utilizará incrustaciones multimodales [OpenCLIP](https://github.com/mlfoundations/open_clip) para incrustar las imágenes.

Puedes seleccionar diferentes opciones de modelos de incrustación (ver resultados [aquí](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv))).

La primera vez que ejecutes la aplicación, se descargará automáticamente el modelo de incrustación multimodal.

De forma predeterminada, LangChain utilizará un modelo de incrustación con un rendimiento moderado pero con requisitos de memoria más bajos, `ViT-H-14`.

Puedes elegir modelos `OpenCLIPEmbeddings` alternativos en `rag_chroma_multi_modal/ingest.py`:

```python
vectorstore_mmembd = Chroma(
    collection_name="multi-modal-rag",
    persist_directory=str(re_vectorstore_path),
    embedding_function=OpenCLIPEmbeddings(
        model_name="ViT-H-14", checkpoint="laion2b_s32b_b79k"
    ),
)
```

## LLM

Esta plantilla utilizará [Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal).

Descarga la última versión de Ollama: https://ollama.ai/

Extrae un LLM multimodal de código abierto: por ejemplo, https://ollama.ai/library/bakllava

```shell
ollama pull bakllava
```

La aplicación está configurada por defecto para `bakllava`. Pero puedes cambiarla en `chain.py` e `ingest.py` para diferentes modelos descargados.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-chroma-multi-modal
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-chroma-multi-modal
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_chroma_multi_modal import chain as rag_chroma_multi_modal_chain

add_routes(app, rag_chroma_multi_modal_chain, path="/rag-chroma-multi-modal")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
