---
translated: true
---

# rag-redis

Esta plantilla realiza RAG utilizando Redis (base de datos de vectores) y OpenAI (LLM) en documentos de informes financieros de 10k de Nike.

Se basa en el transformador de oraciones `all-MiniLM-L6-v2` para incrustar fragmentos del pdf y las preguntas del usuario.

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de [OpenAI](https://platform.openai.com):

```bash
export OPENAI_API_KEY= <YOUR OPENAI API KEY>
```

Establezca las siguientes variables de entorno de [Redis](https://redis.com/try-free):

```bash
export REDIS_HOST = <YOUR REDIS HOST>
export REDIS_PORT = <YOUR REDIS PORT>
export REDIS_USER = <YOUR REDIS USER NAME>
export REDIS_PASSWORD = <YOUR REDIS PASSWORD>
```

## Configuraciones compatibles

Utilizamos una variedad de variables de entorno para configurar esta aplicación

| Variable de entorno | Descripción                       | Valor predeterminado |
|----------------------|-----------------------------------|---------------|
| `DEBUG`            | Habilitar o deshabilitar los registros de depuración de Langchain       | True         |
| `REDIS_HOST`           | Nombre de host para el servidor Redis     | "localhost"   |
| `REDIS_PORT`           | Puerto para el servidor Redis         | 6379          |
| `REDIS_USER`           | Usuario para el servidor Redis         | "" |
| `REDIS_PASSWORD`       | Contraseña para el servidor Redis     | "" |
| `REDIS_URL`            | URL completa para conectarse a Redis  | `None`, Se construye a partir del usuario, la contraseña, el host y el puerto si no se proporciona |
| `INDEX_NAME`           | Nombre del índice de vectores          | "rag-redis"   |

## Uso

Para usar este paquete, primero debe tener instalados CLI de LangChain y Pydantic en un entorno virtual de Python:

```shell
pip install -U langchain-cli pydantic==1.10.13
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-redis
```

Si desea agregar esto a un proyecto existente, puede ejecutar:

```shell
langchain app add rag-redis
```

Y agregue el siguiente fragmento de código a su archivo `app/server.py`:

```python
from rag_redis.chain import chain as rag_redis_chain

add_routes(app, rag_redis_chain, path="/rag-redis")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-redis/playground](http://127.0.0.1:8000/rag-redis/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis")
```
