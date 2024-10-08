---
translated: true
---

# neo4j-semantic-ollama

Esta plantilla está diseñada para implementar un agente capaz de interactuar con una base de datos de gráficos como Neo4j a través de una capa semántica utilizando Mixtral como un agente basado en JSON.
La capa semántica equipa al agente con un conjunto de herramientas robustas, permitiéndole interactuar con la base de datos de gráficos en función de la intención del usuario.
Obtenga más información sobre la plantilla de la capa semántica en el [publicación de blog correspondiente](https://medium.com/towards-data-science/enhancing-interaction-between-language-models-and-graph-databases-via-a-semantic-layer-0a78ad3eba49) y específicamente sobre [agentes Mixtral con Ollama](https://blog.langchain.dev/json-based-agents-with-ollama-and-langchain/).

## Herramientas

El agente utiliza varias herramientas para interactuar eficazmente con la base de datos de gráficos Neo4j:

1. **Herramienta de información**:
   - Recupera datos sobre películas o personas, asegurando que el agente tenga acceso a la información más reciente y relevante.
2. **Herramienta de recomendación**:
   - Proporciona recomendaciones de películas en función de las preferencias y la entrada del usuario.
3. **Herramienta de memoria**:
   - Almacena información sobre las preferencias del usuario en el grafo de conocimiento, permitiendo una experiencia personalizada a lo largo de múltiples interacciones.
4. **Herramienta de pequeña charla**:
   - Permite que un agente se ocupe de la pequeña charla.

## Configuración del entorno

Antes de usar esta plantilla, debe configurar Ollama y la base de datos Neo4j.

1. Siga las instrucciones [aquí](https://python.langchain.com/docs/integrations/chat/ollama) para descargar Ollama.

2. Descarga tu LLM de interés:

    * Este paquete usa `mixtral`: `ollama pull mixtral`
    * Puedes elegir entre muchos LLM [aquí](https://ollama.ai/library)

Necesitas definir las siguientes variables de entorno

```shell
OLLAMA_BASE_URL=<YOUR_OLLAMA_URL>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Poblar con datos

Si desea poblar la base de datos con un conjunto de datos de películas de ejemplo, puede ejecutar `python ingest.py`.
El script importa información sobre películas y su calificación por parte de los usuarios.
Además, el script crea dos [índices de texto completo](https://neo4j.com/docs/cypher-manual/current/indexes-for-full-text-search/), que se utilizan para asignar información de la entrada del usuario a la base de datos.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package neo4j-semantic-ollama
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add neo4j-semantic-ollama
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from neo4j_semantic_layer import agent_executor as neo4j_semantic_agent

add_routes(app, neo4j_semantic_agent, path="/neo4j-semantic-ollama")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección

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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/neo4j-semantic-ollama/playground](http://127.0.0.1:8000/neo4j-semantic-ollama/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-semantic-ollama")
```
