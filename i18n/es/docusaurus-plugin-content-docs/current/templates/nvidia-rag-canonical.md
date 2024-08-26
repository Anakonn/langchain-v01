---
translated: true
---

# nvidia-rag-canonical

Esta plantilla realiza RAG utilizando Milvus Vector Store y modelos NVIDIA (Embedding y Chat).

## Configuración del entorno

Debe exportar su clave API de NVIDIA como una variable de entorno.
Si no tiene una clave API de NVIDIA, puede crear una siguiendo estos pasos:
1. Cree una cuenta gratuita con el servicio [NVIDIA GPU Cloud](https://catalog.ngc.nvidia.com/), que alberga catálogos de soluciones de IA, contenedores, modelos, etc.
2. Navegue a `Catálogo > Modelos de Fundación de IA > (Modelo con punto final de API)`.
3. Seleccione la opción `API` y haga clic en `Generar clave`.
4. Guarde la clave generada como `NVIDIA_API_KEY`. A partir de ahí, debería tener acceso a los puntos finales.

```shell
export NVIDIA_API_KEY=...
```

Para obtener instrucciones sobre cómo alojar el Milvus Vector Store, consulte la sección al final.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para usar los modelos NVIDIA, instale el paquete de puntos finales de IA NVIDIA de Langchain:

```shell
pip install -U langchain_nvidia_aiplay
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package nvidia-rag-canonical
```

Si desea agregar esto a un proyecto existente, puede ejecutar:

```shell
langchain app add nvidia-rag-canonical
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from nvidia_rag_canonical import chain as nvidia_rag_canonical_chain

add_routes(app, nvidia_rag_canonical_chain, path="/nvidia-rag-canonical")
```

Si desea configurar una canalización de ingesta, puede agregar el siguiente código a su archivo `server.py`:

```python
from nvidia_rag_canonical import ingest as nvidia_rag_ingest

add_routes(app, nvidia_rag_ingest, path="/nvidia-rag-ingest")
```

Tenga en cuenta que para los archivos ingresados por la API de ingesta, el servidor deberá reiniciarse para que los archivos recién ingresados sean accesibles para el recuperador.

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si NO tiene un Milvus Vector Store al que desee conectarse, consulte la sección `Configuración de Milvus` a continuación antes de continuar.

Si tiene un Milvus Vector Store al que desea conectarse, edite los detalles de conexión en `nvidia_rag_canonical/chain.py`.

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/nvidia-rag-canonical/playground](http://127.0.0.1:8000/nvidia-rag-canonical/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/nvidia-rag-canonical")
```

## Configuración de Milvus

Utilice este paso si necesita crear un Milvus Vector Store e ingerir datos.
Primero seguiremos las instrucciones de configuración estándar de Milvus [aquí](https://milvus.io/docs/install_standalone-docker.md).

1. Descargue el archivo YAML de Docker Compose.
    ```shell
    wget https://github.com/milvus-io/milvus/releases/download/v2.3.3/milvus-standalone-docker-compose.yml -O docker-compose.yml
    ```
2. Inicie el contenedor Milvus Vector Store
    ```shell
    sudo docker compose up -d
    ```
3. Instale el paquete PyMilvus para interactuar con el contenedor Milvus.
    ```shell
    pip install pymilvus
    ```
4. ¡Ahora ingresemos algunos datos! Podemos hacer eso moviéndonos a este directorio y ejecutando el código en `ingest.py`, por ejemplo:

    ```shell
    python ingest.py
    ```

    Tenga en cuenta que puede (¡y debe!) cambiar esto para ingerir datos de su elección.
