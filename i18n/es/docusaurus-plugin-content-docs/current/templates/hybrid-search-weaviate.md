---
translated: true
---

# Búsqueda híbrida en Weaviate

Esta plantilla le muestra cómo usar la función de búsqueda híbrida en Weaviate. La búsqueda híbrida combina varios algoritmos de búsqueda para mejorar la precisión y relevancia de los resultados de búsqueda.

Weaviate utiliza vectores dispersos y densos para representar el significado y el contexto de las consultas de búsqueda y los documentos. Los resultados utilizan una combinación de `bm25` y clasificación de búsqueda de vectores para devolver los mejores resultados.

##  Configuraciones

Conéctese a su Vectorstore Weaviate alojado estableciendo algunas variables de entorno en `chain.py`:

* `WEAVIATE_ENVIRONMENT`
* `WEAVIATE_API_KEY`

También deberá establecer su `OPENAI_API_KEY` para usar los modelos de OpenAI.

## Empezar

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package hybrid-search-weaviate
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add hybrid-search-weaviate
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from hybrid_search_weaviate import chain as hybrid_search_weaviate_chain

add_routes(app, hybrid_search_weaviate_chain, path="/hybrid-search-weaviate")
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

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/hybrid-search-weaviate/playground](http://127.0.0.1:8000/hybrid-search-weaviate/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hybrid-search-weaviate")
```
