---
translated: true
---

# vertexai-chuck-norris

Esta plantilla hace bromas sobre Chuck Norris usando Vertex AI PaLM2.

## Configuración del entorno

Primero, asegúrate de tener un proyecto de Google Cloud con
una cuenta de facturación activa y haber instalado la [CLI de gcloud](https://cloud.google.com/sdk/docs/install).

Configura las [credenciales predeterminadas de la aplicación](https://cloud.google.com/docs/authentication/provide-credentials-adc):

```shell
gcloud auth application-default login
```

Para establecer un proyecto de Google Cloud predeterminado que usar, ejecuta este comando y establece el [ID del proyecto](https://support.google.com/googleapi/answer/7014113?hl=en) del proyecto que quieres usar:

```shell
gcloud config set project [PROJECT-ID]
```

Habilita la [API de Vertex AI](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com) para el proyecto:

```shell
gcloud services enable aiplatform.googleapis.com
```

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package pirate-speak
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add vertexai-chuck-norris
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from vertexai_chuck_norris.chain import chain as vertexai_chuck_norris_chain

add_routes(app, vertexai_chuck_norris_chain, path="/vertexai-chuck-norris")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/vertexai-chuck-norris/playground](http://127.0.0.1:8000/vertexai-chuck-norris/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/vertexai-chuck-norris")
```
