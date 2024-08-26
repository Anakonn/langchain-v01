---
translated: true
---

# generador de consultas elásticas

Esta plantilla permite interactuar con bases de datos analíticas de Elasticsearch en lenguaje natural utilizando LLM.

Construye consultas de búsqueda a través de la API DSL de Elasticsearch (filtros y agregaciones).

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

### Instalación de Elasticsearch

Hay varias formas de ejecutar Elasticsearch. Sin embargo, una forma recomendada es a través de Elastic Cloud.

Crea una cuenta de prueba gratuita en [Elastic Cloud](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=langserve).

Con un despliegue, actualiza la cadena de conexión.

La contraseña y la conexión (url de elasticsearch) se pueden encontrar en la consola de despliegue.

Tenga en cuenta que el cliente de Elasticsearch debe tener permisos para la lista de índices, la descripción de mapeo y las consultas de búsqueda.

### Poblar con datos

Si desea poblar la base de datos con alguna información de ejemplo, puede ejecutar `python ingest.py`.

Esto creará un índice `customers`. En este paquete, especificamos los índices para generar consultas, y especificamos `["customers"]`. Esto es específico de la configuración de su índice de Elastic.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package elastic-query-generator
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add elastic-query-generator
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from elastic_query_generator.chain import chain as elastic_query_generator_chain

add_routes(app, elastic_query_generator_chain, path="/elastic-query-generator")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain.
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
Podemos acceder al playground en [http://127.0.0.1:8000/elastic-query-generator/playground](http://127.0.0.1:8000/elastic-query-generator/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/elastic-query-generator")
```
