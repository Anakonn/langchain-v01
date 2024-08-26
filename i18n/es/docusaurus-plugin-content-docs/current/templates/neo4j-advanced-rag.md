---
translated: true
---

# neo4j-advanced-rag

Esta plantilla permite equilibrar los incrustaciones precisas y la retención de contexto mediante la implementación de estrategias de recuperación avanzadas.

## Estrategias

1. **Typical RAG**:
   - Método tradicional donde los datos indexados exactos son los datos recuperados.
2. **Parent retriever**:
   - En lugar de indexar documentos completos, los datos se dividen en trozos más pequeños, denominados documentos principales y secundarios.
   - Los documentos secundarios se indexan para una mejor representación de conceptos específicos, mientras que se recuperan los documentos principales para garantizar la retención de contexto.
3. **Hypothetical Questions**:
     - Los documentos se procesan para determinar las posibles preguntas que podrían responder.
     - Estas preguntas se indexan entonces para una mejor representación de conceptos específicos, mientras que se recuperan los documentos principales para garantizar la retención de contexto.
4. **Summaries**:
     - En lugar de indexar todo el documento, se crea y se indexa un resumen del documento.
     - Del mismo modo, se recupera el documento principal en una aplicación RAG.

## Configuración del entorno

Es necesario definir las siguientes variables de entorno

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Poblar con datos

Si desea poblar la base de datos con algunos datos de ejemplo, puede ejecutar `python ingest.py`.
El script procesa y almacena secciones del texto del archivo `dune.txt` en una base de datos de gráficos Neo4j.
Primero, el texto se divide en trozos más grandes ("padres") y luego se subdivide aún más en trozos más pequeños ("hijos"), donde tanto los trozos de padres como los de hijos se superponen ligeramente para mantener el contexto.
Después de almacenar estos trozos en la base de datos, se calculan los incrustaciones de los nodos secundarios utilizando los incrustaciones de OpenAI y se almacenan de vuelta en el gráfico para su futura recuperación o análisis.
Para cada nodo principal, se generan preguntas hipotéticas y resúmenes, se incrustan y se agregan a la base de datos.
Además, se crea un índice vectorial para cada estrategia de recuperación para una consulta eficiente de estos incrustaciones.

*Tenga en cuenta que la ingestión puede tardar un minuto o dos debido a la velocidad de los LLM para generar preguntas hipotéticas y resúmenes.*

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package neo4j-advanced-rag
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add neo4j-advanced-rag
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from neo4j_advanced_rag import chain as neo4j_advanced_chain

add_routes(app, neo4j_advanced_chain, path="/neo4j-advanced-rag")
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
Podemos acceder al playground en [http://127.0.0.1:8000/neo4j-advanced-rag/playground](http://127.0.0.1:8000/neo4j-advanced-rag/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-advanced-rag")
```
