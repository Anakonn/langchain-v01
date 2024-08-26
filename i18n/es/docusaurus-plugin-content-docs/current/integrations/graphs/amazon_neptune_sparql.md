---
translated: true
---

# Amazon Neptune con SPARQL

>[Amazon Neptune](https://aws.amazon.com/neptune/) es una base de datos de análisis de gráficos de alto rendimiento y sin servidor para una escalabilidad y disponibilidad superiores.

>Este ejemplo muestra la cadena de preguntas y respuestas que consulta los datos de [Resource Description Framework (RDF)](https://en.wikipedia.org/wiki/Resource_Description_Framework) en una base de datos de gráficos `Amazon Neptune` utilizando el lenguaje de consulta `SPARQL` y devuelve una respuesta legible por humanos.

>[SPARQL](https://en.wikipedia.org/wiki/SPARQL) es un lenguaje de consulta estándar para gráficos `RDF`.

Este ejemplo utiliza una clase `NeptuneRdfGraph` que se conecta con la base de datos Neptune y carga su esquema.
El `NeptuneSparqlQAChain` se utiliza para conectar el gráfico y el LLM para hacer preguntas en lenguaje natural.

Este cuaderno demuestra un ejemplo utilizando datos organizacionales.

Requisitos para ejecutar este cuaderno:
- Clúster Neptune 1.2.x accesible desde este cuaderno
- Kernel con Python 3.9 o superior
- Para el acceso a Bedrock, asegúrese de que el rol de IAM tenga esta política

```json
{
        "Action": [
            "bedrock:ListFoundationModels",
            "bedrock:InvokeModel"
        ],
        "Resource": "*",
        "Effect": "Allow"
}
```

- Bucket de S3 para almacenar datos de ejemplo. El bucket debe estar en la misma cuenta/región que Neptune.

## Configuración

### Sembrar los datos organizativos de W3C

Sembrar los datos organizativos de W3C, la ontología organizativa de W3C más algunas instancias.

Necesitarás un bucket de S3 en la misma región y cuenta. Establece `STAGE_BUCKET` como el nombre de ese bucket.

```python
STAGE_BUCKET = "<bucket-name>"
```

```bash
%%bash  -s "$STAGE_BUCKET"

rm -rf data
mkdir -p data
cd data
echo getting org ontology and sample org instances
wget http://www.w3.org/ns/org.ttl
wget https://raw.githubusercontent.com/aws-samples/amazon-neptune-ontology-example-blog/main/data/example_org.ttl

echo Copying org ttl to S3
aws s3 cp org.ttl s3://$1/org.ttl
aws s3 cp example_org.ttl s3://$1/example_org.ttl

```

Carga masiva el org ttl, tanto la ontología como las instancias.

```python
%load -s s3://{STAGE_BUCKET} -f turtle --store-to loadres --run
```

```python
%load_status {loadres['payload']['loadId']} --errors --details
```

### Configurar la cadena

```python
!pip install --upgrade --quiet langchain langchain-community langchain-aws
```

** Reiniciar el kernel **

### Preparar un ejemplo

```python
EXAMPLES = """

<question>
Find organizations.
</question>

<sparql>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX org: <http://www.w3.org/ns/org#>

select ?org ?orgName where {{
    ?org rdfs:label ?orgName .
}}
</sparql>

<question>
Find sites of an organization
</question>

<sparql>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX org: <http://www.w3.org/ns/org#>

select ?org ?orgName ?siteName where {{
    ?org rdfs:label ?orgName .
    ?org org:hasSite/rdfs:label ?siteName .
}}
</sparql>

<question>
Find suborganizations of an organization
</question>

<sparql>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX org: <http://www.w3.org/ns/org#>

select ?org ?orgName ?subName where {{
    ?org rdfs:label ?orgName .
    ?org org:hasSubOrganization/rdfs:label ?subName  .
}}
</sparql>

<question>
Find organizational units of an organization
</question>

<sparql>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX org: <http://www.w3.org/ns/org#>

select ?org ?orgName ?unitName where {{
    ?org rdfs:label ?orgName .
    ?org org:hasUnit/rdfs:label ?unitName .
}}
</sparql>

<question>
Find members of an organization. Also find their manager, or the member they report to.
</question>

<sparql>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

select * where {{
    ?person rdf:type foaf:Person .
    ?person  org:memberOf ?org .
    OPTIONAL {{ ?person foaf:firstName ?firstName . }}
    OPTIONAL {{ ?person foaf:family_name ?lastName . }}
    OPTIONAL {{ ?person  org:reportsTo ??manager }} .
}}
</sparql>


<question>
Find change events, such as mergers and acquisitions, of an organization
</question>

<sparql>
PREFIX org: <http://www.w3.org/ns/org#>

select ?event ?prop ?obj where {{
    ?org rdfs:label ?orgName .
    ?event rdf:type org:ChangeEvent .
    ?event org:originalOrganization ?origOrg .
    ?event org:resultingOrganization ?resultingOrg .
}}
</sparql>

"""
```

```python
import boto3
from langchain.chains.graph_qa.neptune_sparql import NeptuneSparqlQAChain
from langchain_aws import ChatBedrock
from langchain_community.graphs import NeptuneRdfGraph

host = "<your host>"
port = 8182  # change if different
region = "us-east-1"  # change if different
graph = NeptuneRdfGraph(host=host, port=port, use_iam_auth=True, region_name=region)

# Optionally change the schema
# elems = graph.get_schema_elements
# change elems ...
# graph.load_schema(elems)

MODEL_ID = "anthropic.claude-v2"
bedrock_client = boto3.client("bedrock-runtime")
llm = ChatBedrock(model_id=MODEL_ID, client=bedrock_client)

chain = NeptuneSparqlQAChain.from_llm(
    llm=llm,
    graph=graph,
    examples=EXAMPLES,
    verbose=True,
    top_K=10,
    return_intermediate_steps=True,
    return_direct=False,
)
```

## Hacer preguntas

Depende de los datos que hayamos ingresado anteriormente

```python
chain.invoke("""How many organizations are in the graph""")
```

```python
chain.invoke("""Are there any mergers or acquisitions""")
```

```python
chain.invoke("""Find organizations""")
```

```python
chain.invoke("""Find sites of MegaSystems or MegaFinancial""")
```

```python
chain.invoke("""Find a member who is manager of one or more members.""")
```

```python
chain.invoke("""Find five members and who their manager is.""")
```

```python
chain.invoke(
    """Find org units or suborganizations of The Mega Group. What are the sites of those units?"""
)
```
