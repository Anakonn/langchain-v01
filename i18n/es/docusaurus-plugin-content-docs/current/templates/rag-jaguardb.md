---
translated: true
---

# rag-jaguardb

Esta plantilla realiza RAG utilizando JaguarDB y OpenAI.

## Configuración del entorno

Debe exportar dos variables de entorno, una siendo su URI de Jaguar, la otra siendo su CLAVE API de OpenAI.
Si no tiene JaguarDB configurado, consulte la sección `Configurar Jaguar` al final para obtener instrucciones sobre cómo hacerlo.

```shell
export JAGUAR_API_KEY=...
export OPENAI_API_KEY=...
```

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-jaguardb
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-jagaurdb
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_jaguardb import chain as rag_jaguardb

add_routes(app, rag_jaguardb_chain, path="/rag-jaguardb")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-jaguardb/playground](http://127.0.0.1:8000/rag-jaguardb/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-jaguardb")
```

## Configuración de JaguarDB

Para utilizar JaguarDB, puede usar los comandos docker pull y docker run para configurar rápidamente JaguarDB.

```shell
docker pull jaguardb/jaguardb
docker run -d -p 8888:8888 --name jaguardb jaguardb/jaguardb
```

Para iniciar el terminal del cliente JaguarDB para interactuar con el servidor JaguarDB:

```shell
docker exec -it jaguardb /home/jaguar/jaguar/bin/jag

```

Otra opción es descargar un paquete binario de JaguarDB ya construido en Linux y implementar la base de datos en un solo nodo o en un clúster de nodos. El proceso simplificado le permite comenzar a usar JaguarDB rápidamente y aprovechar sus poderosas características y funcionalidades. [aquí](http://www.jaguardb.com/download.html).
