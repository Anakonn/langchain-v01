---
translated: true
---

# Consulta automática de Supabase

Esta plantilla permite la consulta estructurada en lenguaje natural de Supabase.

[Supabase](https://supabase.com/docs) es una alternativa de código abierto a Firebase, construida sobre [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL).

Utiliza [pgvector](https://github.com/pgvector/pgvector) para almacenar incrustaciones dentro de sus tablas.

## Configuración del entorno

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Para obtener tu `OPENAI_API_KEY`, navega a [API keys](https://platform.openai.com/account/api-keys) en tu cuenta de OpenAI y crea una nueva clave secreta.

Para encontrar tu `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`, dirígete a la [configuración de API](https://supabase.com/dashboard/project/_/settings/api) del proyecto de Supabase.

- `SUPABASE_URL` corresponde a la URL del proyecto
- `SUPABASE_SERVICE_KEY` corresponde a la clave de API `service_role`

```shell
export SUPABASE_URL=
export SUPABASE_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Configurar la base de datos de Supabase

Usa estos pasos para configurar tu base de datos de Supabase si aún no lo has hecho.

1. Dirígete a https://database.new para aprovisionar tu base de datos de Supabase.
2. En el estudio, salta al [editor SQL](https://supabase.com/dashboard/project/_/sql/new) y ejecuta el siguiente script para habilitar `pgvector` y configurar tu base de datos como un almacén de vectores:

   ```sql
   -- Habilitar la extensión pgvector para trabajar con vectores de incrustación
   create extension if not exists vector;

   -- Crear una tabla para almacenar tus documentos
   create table
     documents (
       id uuid primary key,
       content text, -- corresponde a Document.pageContent
       metadata jsonb, -- corresponde a Document.metadata
       embedding vector (1536) -- 1536 funciona para incrustaciones de OpenAI, cambiar según sea necesario
     );

   -- Crear una función para buscar documentos
   create function match_documents (
     query_embedding vector (1536),
     filter jsonb default '{}'
   ) returns table (
     id uuid,
     content text,
     metadata jsonb,
     similarity float
   ) language plpgsql as $$
   #variable_conflict use_column
   begin
     return query
     select
       id,
       content,
       metadata,
       1 - (documents.embedding <=> query_embedding) as similarity
     from documents
     where metadata @> filter
     order by documents.embedding <=> query_embedding;
   end;
   $$;
   ```

## Uso

Para usar este paquete, instala primero la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Crea un nuevo proyecto de LangChain e instala este paquete como el único:

```shell
langchain app new my-app --package self-query-supabase
```

Para agregarlo a un proyecto existente, ejecuta:

```shell
langchain app add self-query-supabase
```

Agrega el siguiente código a tu archivo `server.py`:

```python
from self_query_supabase.chain import chain as self_query_supabase_chain

add_routes(app, self_query_supabase_chain, path="/self-query-supabase")
```

(Opcional) Si tienes acceso a LangSmith, configúralo para ayudar a rastrear, monitorear y depurar aplicaciones de LangChain. Si no tienes acceso, salta esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en
[http://localhost:8000](http://localhost:8000)

Puedes ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Accede al área de juegos en [http://127.0.0.1:8000/self-query-supabase/playground](http://127.0.0.1:8000/self-query-supabase/playground)

Accede a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/self-query-supabase")
```

TODO: Instrucciones para configurar la base de datos de Supabase e instalar el paquete.
