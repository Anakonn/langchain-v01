---
translated: true
---

# NebulaGraph

>[NebulaGraph](https://www.nebula-graph.io/) es una base de datos de gráficos de código abierto, distribuida, escalable y ultrarrápida construida para gráficos a gran escala con latencia de milisegundos. Utiliza el lenguaje de consulta de gráficos `nGQL`.
>
>[nGQL](https://docs.nebula-graph.io/3.0.0/3.ngql-guide/1.nGQL-overview/1.overview/) es un lenguaje de consulta de gráficos declarativo para `NebulaGraph`. Permite patrones de consulta de gráficos expresivos y eficientes. `nGQL` está diseñado tanto para desarrolladores como para profesionales de operaciones. `nGQL` es un lenguaje de consulta similar a SQL.

Este cuaderno muestra cómo usar LLM para proporcionar una interfaz de lenguaje natural a la base de datos `NebulaGraph`.

## Configuración

Puede iniciar el clúster `NebulaGraph` como un contenedor Docker ejecutando el siguiente script:

```bash
curl -fsSL nebula-up.siwei.io/install.sh | bash
```

Otras opciones son:
- Instalar como una [Extensión de Docker Desktop](https://www.docker.com/blog/distributed-cloud-native-graph-database-nebulagraph-docker-extension/). Ver [aquí](https://docs.nebula-graph.io/3.5.0/2.quick-start/1.quick-start-workflow/)
- Servicio de nube NebulaGraph. Ver [aquí](https://www.nebula-graph.io/cloud)
- Implementar desde paquete, código fuente o a través de Kubernetes. Ver [aquí](https://docs.nebula-graph.io/)

Una vez que el clúster esté en ejecución, podríamos crear el `ESPACIO` y el `ESQUEMA` para la base de datos.

```python
%pip install --upgrade --quiet  ipython-ngql
%load_ext ngql

# connect ngql jupyter extension to nebulagraph
%ngql --address 127.0.0.1 --port 9669 --user root --password nebula
# create a new space
%ngql CREATE SPACE IF NOT EXISTS langchain(partition_num=1, replica_factor=1, vid_type=fixed_string(128));
```

```python
# Wait for a few seconds for the space to be created.
%ngql USE langchain;
```

Crea el esquema, para el conjunto de datos completo, consulta [aquí](https://www.siwei.io/en/nebulagraph-etl-dbt/).

```python
%%ngql
CREATE TAG IF NOT EXISTS movie(name string);
CREATE TAG IF NOT EXISTS person(name string, birthdate string);
CREATE EDGE IF NOT EXISTS acted_in();
CREATE TAG INDEX IF NOT EXISTS person_index ON person(name(128));
CREATE TAG INDEX IF NOT EXISTS movie_index ON movie(name(128));
```

Espera a que se complete la creación del esquema, luego podemos insertar algunos datos.

```python
%%ngql
INSERT VERTEX person(name, birthdate) VALUES "Al Pacino":("Al Pacino", "1940-04-25");
INSERT VERTEX movie(name) VALUES "The Godfather II":("The Godfather II");
INSERT VERTEX movie(name) VALUES "The Godfather Coda: The Death of Michael Corleone":("The Godfather Coda: The Death of Michael Corleone");
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather II":();
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather Coda: The Death of Michael Corleone":();
```

```python
from langchain.chains import NebulaGraphQAChain
from langchain_community.graphs import NebulaGraph
from langchain_openai import ChatOpenAI
```

```python
graph = NebulaGraph(
    space="langchain",
    username="root",
    password="nebula",
    address="127.0.0.1",
    port=9669,
    session_pool_size=30,
)
```

## Actualizar la información del esquema del gráfico

Si el esquema de la base de datos cambia, puede actualizar la información del esquema necesaria para generar declaraciones nGQL.

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'tag': 'movie', 'properties': [('name', 'string')]}, {'tag': 'person', 'properties': [('name', 'string'), ('birthdate', 'string')]}]
Edge properties: [{'edge': 'acted_in', 'properties': []}]
Relationships: ['(:person)-[:acted_in]->(:movie)']
```

## Consultar el gráfico

Ahora podemos usar la cadena de consulta de gráficos de Cypher para hacer preguntas sobre el gráfico

```python
chain = NebulaGraphQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.run("Who played in The Godfather II?")
```

```output


[1m> Entering new NebulaGraphQAChain chain...[0m
Generated nGQL:
[32;1m[1;3mMATCH (p:`person`)-[:acted_in]->(m:`movie`) WHERE m.`movie`.`name` == 'The Godfather II'
RETURN p.`person`.`name`[0m
Full Context:
[32;1m[1;3m{'p.person.name': ['Al Pacino']}[0m

[1m> Finished chain.[0m
```

```output
'Al Pacino played in The Godfather II.'
```
