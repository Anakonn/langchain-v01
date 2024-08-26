---
translated: true
---

# rag_lantern

Esta plantilla realiza RAG con Lantern.

[Lantern](https://lantern.dev) es una base de datos vectorial de código abierto construida sobre [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL). Permite la búsqueda vectorial y la generación de incrustaciones dentro de tu base de datos.

## Configuración del entorno

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Para obtener tu `OPENAI_API_KEY`, navega a [API keys](https://platform.openai.com/account/api-keys) en tu cuenta de OpenAI y crea una nueva clave secreta.

Para encontrar tu `LANTERN_URL` y `LANTERN_SERVICE_KEY`, dirígete a la [configuración de API](https://lantern.dev/dashboard/project/_/settings/api) de tu proyecto Lantern.

- `LANTERN_URL` corresponde a la URL del proyecto
- `LANTERN_SERVICE_KEY` corresponde a la clave API `service_role`

```shell
export LANTERN_URL=
export LANTERN_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Configurar la base de datos de Lantern

Usa estos pasos para configurar tu base de datos de Lantern si aún no lo has hecho.

1. Ve a [https://lantern.dev](https://lantern.dev) para crear tu base de datos de Lantern.
2. En tu cliente SQL favorito, ve al editor SQL y ejecuta el siguiente script para configurar tu base de datos como un almacén vectorial:

   ```sql
   -- Crear una tabla para almacenar tus documentos
   create table
     documents (
       id uuid primary key,
       content text, -- corresponde a Document.pageContent
       metadata jsonb, -- corresponde a Document.metadata
       embedding REAL[1536] -- 1536 funciona para incrustaciones de OpenAI, cambia según sea necesario
     );

   -- Crear una función para buscar documentos
   create function match_documents (
     query_embedding REAL[1536],
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

Dado que estamos usando [`Lantern`](https://python.langchain.com/docs/integrations/vectorstores/lantern) y [`OpenAIEmbeddings`](https://python.langchain.com/docs/integrations/text_embedding/openai), necesitamos cargar sus claves API.

## Uso

Primero, instala la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-lantern
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-lantern
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_lantern.chain import chain as rag_lantern_chain

add_routes(app, rag_lantern_chain, path="/rag-lantern")
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

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-lantern/playground](http://127.0.0.1:8000/rag-lantern/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-lantern")
```
