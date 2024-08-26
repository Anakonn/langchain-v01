---
translated: true
---

# rag-chroma-multi-modal-multi-vector

Los modelos de lenguaje multimodales (LLM) permiten a los asistentes visuales realizar preguntas y respuestas sobre imágenes.

Esta plantilla crea un asistente visual para presentaciones de diapositivas, que a menudo contienen elementos visuales como gráficos o figuras.

Utiliza GPT-4V para crear resúmenes de imágenes para cada diapositiva, los incrusta y los almacena en Chroma.

Dada una pregunta, se recuperan las diapositivas relevantes y se pasan a GPT-4V para la síntesis de respuestas.

## Entrada

Proporciona una presentación de diapositivas en formato pdf en el directorio `/docs`.

De forma predeterminada, esta plantilla tiene una presentación de diapositivas sobre los ingresos del tercer trimestre de DataDog, una empresa de tecnología pública.

Algunos ejemplos de preguntas que se pueden hacer son:

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

Para crear un índice de la presentación de diapositivas, ejecuta:

```shell
poetry install
python ingest.py
```

## Almacenamiento

Aquí está el proceso que utilizará la plantilla para crear un índice de las diapositivas (ver [blog](https://blog.langchain.dev/multi-modal-rag-template/))):

* Extraer las diapositivas como una colección de imágenes
* Usar GPT-4V para resumir cada imagen
* Incrustar los resúmenes de imágenes utilizando incrustaciones de texto con un enlace a las imágenes originales
* Recuperar imágenes relevantes en función de la similitud entre el resumen de la imagen y la pregunta de entrada del usuario
* Pasar esas imágenes a GPT-4V para la síntesis de respuestas

De forma predeterminada, esto utilizará [LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system) para almacenar imágenes y Chroma para almacenar resúmenes.

Para producción, puede ser deseable utilizar una opción remota como Redis.

Puedes establecer el indicador `local_file_store` en `chain.py` e `ingest.py` para cambiar entre las dos opciones.

Para Redis, la plantilla utilizará [UpstashRedisByteStore](https://python.langchain.com/docs/integrations/stores/upstash_redis).

Utilizaremos Upstash para almacenar las imágenes, que ofrece Redis con una API REST.

Simplemente inicia sesión [aquí](https://upstash.com/) y crea una base de datos.

Esto te dará una API REST con:

* `UPSTASH_URL`
* `UPSTASH_TOKEN`

Establece `UPSTASH_URL` y `UPSTASH_TOKEN` como variables de entorno para acceder a tu base de datos.

Utilizaremos Chroma para almacenar e indexar los resúmenes de imágenes, que se crearán localmente en el directorio de la plantilla.

## LLM

La aplicación recuperará imágenes en función de la similitud entre la entrada de texto y el resumen de la imagen, y pasará las imágenes a GPT-4V.

## Configuración del entorno

Establece la variable de entorno `OPENAI_API_KEY` para acceder a GPT-4V de OpenAI.

Establece `UPSTASH_URL` y `UPSTASH_TOKEN` como variables de entorno para acceder a tu base de datos si utilizas `UpstashRedisByteStore`.

## Uso

Para utilizar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-chroma-multi-modal-multi-vector
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-chroma-multi-modal-multi-vector
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_chroma_multi_modal_multi_vector import chain as rag_chroma_multi_modal_chain_mv

add_routes(app, rag_chroma_multi_modal_chain_mv, path="/rag-chroma-multi-modal-multi-vector")
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
Podemos acceder al playground en [http://127.0.0.1:8000/rag-chroma-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-chroma-multi-modal-multi-vector/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal-multi-vector")
```
