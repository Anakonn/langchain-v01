---
translated: true
---

# Amazon Neptune avec SPARQL

>[Amazon Neptune](https://aws.amazon.com/neptune/) est une base de données analytique de graphes haute performance et sans serveur pour une évolutivité et une disponibilité supérieures.
>
>Cet exemple montre la chaîne de questions-réponses qui interroge les données [Resource Description Framework (RDF)](https://en.wikipedia.org/wiki/Resource_Description_Framework) dans une base de données de graphes `Amazon Neptune` à l'aide du langage de requête `SPARQL` et renvoie une réponse lisible par l'homme.
>
>[SPARQL](https://en.wikipedia.org/wiki/SPARQL) est un langage de requête standard pour les graphes `RDF`.

Cet exemple utilise une classe `NeptuneRdfGraph` qui se connecte à la base de données Neptune et charge son schéma.
Le `NeptuneSparqlQAChain` est utilisé pour connecter le graphe et le LLM afin de poser des questions en langage naturel.

Ce notebook démontre un exemple utilisant des données organisationnelles.

Exigences pour exécuter ce notebook :
- Cluster Neptune 1.2.x accessible depuis ce notebook
- Noyau avec Python 3.9 ou supérieur
- Pour l'accès à Bedrock, assurez-vous que le rôle IAM a cette politique

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

- Compartiment S3 pour la mise en scène des données d'exemple. Le compartiment doit se trouver dans le même compte/région que Neptune.

## Configuration

### Amorcer les données organisationnelles W3C

Amorcer les données organisationnelles W3C, l'ontologie organisationnelle W3C ainsi que quelques instances.

Vous aurez besoin d'un compartiment S3 dans la même région et le même compte. Définissez `STAGE_BUCKET` comme le nom de ce compartiment.

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

Chargement en bloc du ttl org - à la fois l'ontologie et les instances

```python
%load -s s3://{STAGE_BUCKET} -f turtle --store-to loadres --run
```

```python
%load_status {loadres['payload']['loadId']} --errors --details
```

### Configuration de la chaîne

```python
!pip install --upgrade --quiet langchain langchain-community langchain-aws
```

** Redémarrez le noyau **

### Préparer un exemple

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

## Poser des questions

Dépend des données que nous avons ingérées ci-dessus

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
