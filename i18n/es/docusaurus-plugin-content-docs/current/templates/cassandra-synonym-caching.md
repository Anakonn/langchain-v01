---
translated: true
---

# cassandra-synonym-caching

Esta plantilla proporciona una plantilla de cadena simple que muestra el uso del almacenamiento en caché de LLM respaldado por Apache Cassandra® o Astra DB a través de CQL.

## Configuración del entorno

Para configurar tu entorno, necesitarás lo siguiente:

- una [base de datos vectorial Astra](https://astra.datastax.com) (¡el nivel gratuito está bien!). **Necesitas un [token de administrador de base de datos](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure)**, en particular la cadena que comienza con `AstraCS:...`;
- asimismo, prepara tu [ID de base de datos](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier), tendrás que ingresarlo a continuación;
- una **clave API de OpenAI**. (Más información [aquí](https://cassio.org/start_here/#llm-access), ten en cuenta que de forma predeterminada esta demostración admite OpenAI a menos que modifiques el código).

_Nota:_ también puedes usar un clúster Cassandra regular: para hacerlo, asegúrate de proporcionar la entrada `USE_CASSANDRA_CLUSTER` como se muestra en `.env.template` y las variables de entorno posteriores para especificar cómo conectarte a él.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package cassandra-synonym-caching
```

Si quieres agregarlo a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add cassandra-synonym-caching
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from cassandra_synonym_caching import chain as cassandra_synonym_caching_chain

add_routes(app, cassandra_synonym_caching_chain, path="/cassandra-synonym-caching")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/cassandra-synonym-caching/playground](http://127.0.0.1:8000/cassandra-synonym-caching/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-synonym-caching")
```

## Referencia

Repositorio de plantilla LangServe independiente: [aquí](https://github.com/hemidactylus/langserve_cassandra_synonym_caching).
