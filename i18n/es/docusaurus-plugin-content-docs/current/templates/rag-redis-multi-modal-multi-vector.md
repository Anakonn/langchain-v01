---
translated: true
---

# rag-redis-multi-modal-multi-vector

Los LLM multimodales permiten a los asistentes visuales realizar preguntas y respuestas sobre imágenes.

Esta plantilla crea un asistente visual para presentaciones de diapositivas, que a menudo contienen visuales como gráficos o figuras.

Utiliza GPT-4V para crear resúmenes de imágenes para cada diapositiva, los incrusta y los almacena en Redis.

Dada una pregunta, se recuperan las diapositivas relevantes y se pasan a GPT-4V para la síntesis de respuestas.

## Entrada

Proporcione una presentación de diapositivas en formato PDF en el directorio `/docs`.

De forma predeterminada, esta plantilla tiene una presentación de diapositivas sobre los últimos ingresos de NVIDIA.

Algunos ejemplos de preguntas que se pueden hacer son:

```text
1/ how much can H100 TensorRT improve LLama2 inference performance?
2/ what is the % change in GPU accelerated applications from 2020 to 2023?
```

Para crear un índice de la presentación de diapositivas, ejecute:

```shell
poetry install
poetry shell
python ingest.py
```

## Almacenamiento

Aquí está el proceso que utilizará la plantilla para crear un índice de las diapositivas (ver [blog](https://blog.langchain.dev/multi-modal-rag-template/))):

* Extraer las diapositivas como una colección de imágenes
* Usar GPT-4V para resumir cada imagen
* Incrustar los resúmenes de imágenes utilizando incrustaciones de texto con un enlace a las imágenes originales
* Recuperar imágenes relevantes en función de la similitud entre el resumen de la imagen y la pregunta de entrada del usuario
* Pasar esas imágenes a GPT-4V para la síntesis de respuestas

### Redis

Esta plantilla utiliza [Redis](https://redis.com) para alimentar el [MultiVectorRetriever](https://python.langchain.com/docs/modules/data_connection/retrievers/multi_vector), incluyendo:
- Redis como [VectorStore](https://python.langchain.com/docs/integrations/vectorstores/redis) (para almacenar + indexar incrustaciones de resúmenes de imágenes)
- Redis como [ByteStore](https://python.langchain.com/docs/integrations/stores/redis) (para almacenar imágenes)

Asegúrese de implementar una instancia de Redis ya sea en la [nube](https://redis.com/try-free) (gratis) o localmente con [docker](https://redis.io/docs/install/install-stack/docker/).

Esto le proporcionará un punto final de Redis accesible que puede utilizar como URL. Si se implementa localmente, simplemente use `redis://localhost:6379`.

## LLM

La aplicación recuperará imágenes en función de la similitud entre la entrada de texto y el resumen de la imagen (texto), y pasará las imágenes a GPT-4V para la síntesis de respuestas.

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a OpenAI GPT-4V.

Establezca la variable de entorno `REDIS_URL` para acceder a su base de datos Redis.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-redis-multi-modal-multi-vector
```

Si desea agregar esto a un proyecto existente, puede ejecutar:

```shell
langchain app add rag-redis-multi-modal-multi-vector
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_redis_multi_modal_multi_vector import chain as rag_redis_multi_modal_chain_mv

add_routes(app, rag_redis_multi_modal_chain_mv, path="/rag-redis-multi-modal-multi-vector")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis-multi-modal-multi-vector")
```
