---
translated: true
---

# rag_supabase

Esta plantilla realiza RAG con Supabase.

[Supabase](https://supabase.com/docs) es una alternativa de código abierto a Firebase. Está construido sobre [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), un sistema de gestión de bases de datos relacionales (RDBMS) gratuito y de código abierto, y utiliza [pgvector](https://github.com/pgvector/pgvector) para almacenar incrustaciones dentro de sus tablas.

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Para obtener su `OPENAI_API_KEY`, navegue a [API keys](https://platform.openai.com/account/api-keys) en su cuenta de OpenAI y cree una nueva clave secreta.

Para encontrar su `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`, vaya a la [configuración de API](https://supabase.com/dashboard/project/_/settings/api) de su proyecto Supabase.

- `SUPABASE_URL` corresponde a la URL del proyecto
- `SUPABASE_SERVICE_KEY` corresponde a la clave API `service_role`

```shell
export SUPABASE_URL=
export SUPABASE_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Configurar la base de datos Supabase

Utilice estos pasos para configurar su base de datos Supabase si aún no lo ha hecho.

1. Vaya a https://database.new para aprovisionar su base de datos Supabase.
2. En el estudio, vaya al [editor SQL](https://supabase.com/dashboard/project/_/sql/new) y ejecute el siguiente script para habilitar `pgvector` y configurar su base de datos como un almacén de vectores:

   ```sql
   -- Habilitar la extensión pgvector para trabajar con vectores de incrustación
   create extension if not exists vector;

   -- Crear una tabla para almacenar sus documentos
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

## Configurar variables de entorno

Dado que estamos utilizando [`SupabaseVectorStore`](https://python.langchain.com/docs/integrations/vectorstores/supabase) y [`OpenAIEmbeddings`](https://python.langchain.com/docs/integrations/text_embedding/openai), necesitamos cargar sus claves API.

## Uso

Primero, instale la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalarlo como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-supabase
```

Si desea agregarlo a un proyecto existente, puede ejecutar:

```shell
langchain app add rag-supabase
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_supabase.chain import chain as rag_supabase_chain

add_routes(app, rag_supabase_chain, path="/rag-supabase")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-supabase/playground](http://127.0.0.1:8000/rag-supabase/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-supabase")
```

TODO: Agregar detalles sobre la configuración de la base de datos Supabase
