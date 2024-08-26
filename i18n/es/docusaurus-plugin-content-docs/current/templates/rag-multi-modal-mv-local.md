---
translated: true
---

# rag-multi-modal-mv-local

La búsqueda visual es una aplicación familiar para muchos con iPhones o dispositivos Android. Permite al usuario buscar fotos utilizando lenguaje natural.

Con el lanzamiento de LLMs multimodales de código abierto, es posible construir este tipo de aplicación por ti mismo para tu propia colección de fotos privada.

Esta plantilla demuestra cómo realizar una búsqueda visual privada y responder preguntas sobre una colección de tus fotos.

Utiliza un LLM multimodal de código abierto de tu elección para crear resúmenes de imágenes para cada foto, incrusta los resúmenes y los almacena en Chroma.

Dada una pregunta, se recuperan las fotos relevantes y se pasan al LLM multimodal para la síntesis de respuestas.

## Entrada

Proporciona un conjunto de fotos en el directorio `/docs`.

De forma predeterminada, esta plantilla tiene una colección de 3 fotos de comida.

La aplicación buscará y resumirá las fotos en función de las palabras clave o preguntas proporcionadas:

```text
What kind of ice cream did I have?
```

En la práctica, se puede probar un corpus de imágenes más grande.

Para crear un índice de las imágenes, ejecuta:

```shell
poetry install
python ingest.py
```

## Almacenamiento

Aquí está el proceso que utilizará la plantilla para crear un índice de las diapositivas (ver [blog](https://blog.langchain.dev/multi-modal-rag-template/))):

* Dado un conjunto de imágenes
* Utiliza un LLM multimodal local ([bakllava](https://ollama.ai/library/bakllava))) para resumir cada imagen
* Incrusta los resúmenes de las imágenes con un enlace a las imágenes originales
* Dada una pregunta del usuario, buscará la(s) imagen(es) relevante(s) en función de la similitud entre el resumen de la imagen y la entrada del usuario (utilizando los incrustaciones de Ollama)
* Pasará esas imágenes a bakllava para la síntesis de respuestas

De forma predeterminada, esto utilizará [LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system) para almacenar imágenes y Chroma para almacenar resúmenes.

## Modelos de LLM y Embedding

Utilizaremos [Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal) para generar resúmenes de imágenes, incrustaciones y la respuesta final a la pregunta de la imagen.

Descarga la última versión de Ollama: https://ollama.ai/

Obtén un LLM multimodal de código abierto: p. ej., https://ollama.ai/library/bakllava

Obtén un modelo de incrustación de código abierto: p. ej., https://ollama.ai/library/llama2:7b

```shell
ollama pull bakllava
ollama pull llama2:7b
```

La aplicación está configurada por defecto para `bakllava`. Pero puedes cambiar esto en `chain.py` e `ingest.py` para diferentes modelos descargados.

La aplicación recuperará imágenes en función de la similitud entre la entrada de texto y el resumen de la imagen, y pasará las imágenes a `bakllava`.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-multi-modal-mv-local
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-multi-modal-mv-local
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_multi_modal_mv_local import chain as rag_multi_modal_mv_local_chain

add_routes(app, rag_multi_modal_mv_local_chain, path="/rag-multi-modal-mv-local")
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
Podemos acceder al playground en [http://127.0.0.1:8000/rag-multi-modal-mv-local/playground](http://127.0.0.1:8000/rag-multi-modal-mv-local/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-modal-mv-local")
```
