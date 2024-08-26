---
translated: true
---

# sql-pgvector

Esta plantilla permite al usuario usar `pgvector` para combinar PostgreSQL con búsqueda semántica / RAG.

Utiliza la extensión [PGVector](https://github.com/pgvector/pgvector) como se muestra en el [RAG empowered SQL cookbook](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb)

## Configuración del entorno

Si estás usando `ChatOpenAI` como tu LLM, asegúrate de que `OPENAI_API_KEY` esté establecido en tu entorno. Puedes cambiar tanto el LLM como el modelo de incrustaciones dentro de `chain.py`

Y puedes configurar las siguientes variables de entorno
para usar por la plantilla (los valores predeterminados están entre paréntesis)

- `POSTGRES_USER` (postgres)
- `POSTGRES_PASSWORD` (test)
- `POSTGRES_DB` (vectordb)
- `POSTGRES_HOST` (localhost)
- `POSTGRES_PORT` (5432)

Si no tienes una instancia de postgres, puedes ejecutar una localmente en docker:

```bash
docker run \
  --name some-postgres \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=vectordb \
  -p 5432:5432 \
  postgres:16
```

Y para iniciar de nuevo más tarde, usa el `--name` definido anteriormente:

```bash
docker start some-postgres
```

### Configuración de la base de datos de PostgreSQL

Además de tener la extensión `pgvector` habilitada, deberás realizar algunas configuraciones antes de poder ejecutar la búsqueda semántica dentro de tus consultas SQL.

Para poder ejecutar RAG sobre tu base de datos de PostgreSQL, necesitarás generar las incrustaciones para las columnas específicas que desees.

Este proceso se cubre en el [RAG empowered SQL cookbook](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb), pero el enfoque general consiste en:
1. Consultar los valores únicos de la columna
2. Generar incrustaciones para esos valores
3. Almacenar las incrustaciones en una columna separada o en una tabla auxiliar.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package sql-pgvector
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add sql-pgvector
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from sql_pgvector import chain as sql_pgvector_chain

add_routes(app, sql_pgvector_chain, path="/sql-pgvector")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
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
Podemos acceder al playground en [http://127.0.0.1:8000/sql-pgvector/playground](http://127.0.0.1:8000/sql-pgvector/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-pgvector")
```
