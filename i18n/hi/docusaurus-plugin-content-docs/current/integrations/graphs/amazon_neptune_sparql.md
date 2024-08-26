---
translated: true
---

# Amazon Neptune के साथ SPARQL

>[Amazon Neptune](https://aws.amazon.com/neptune/) एक उच्च-प्रदर्शन ग्राफ़ विश्लेषण और सर्वरलेस डेटाबेस है जो उत्कृष्ट स्केलेबिलिटी और उपलब्धता प्रदान करता है।
>
>यह उदाहरण [Resource Description Framework (RDF)](https://en.wikipedia.org/wiki/Resource_Description_Framework) डेटा को `Amazon Neptune` ग्राफ़ डेटाबेस में `SPARQL` क्वेरी भाषा का उपयोग करके क्वेरी करने और एक मानव-पठनीय प्रतिक्रिया देने वाली प्रश्न-उत्तर श्रृंखला दिखाता है।
>
>[SPARQL](https://en.wikipedia.org/wiki/SPARQL) `RDF` ग्राफ़ों के लिए एक मानक क्वेरी भाषा है।

यह उदाहरण एक `NeptuneRdfGraph` क्लास का उपयोग करता है जो Neptune डेटाबेस से कनेक्ट होता है और इसका स्कीमा लोड करता है।
`NeptuneSparqlQAChain` का उपयोग ग्राफ़ और LLM को जोड़ने के लिए किया जाता है ताकि प्राकृतिक भाषा के प्रश्न पूछे जा सकें।

यह नोटबुक एक उदाहरण का प्रदर्शन करता है जिसमें संगठनात्मक डेटा का उपयोग किया गया है।

इस नोटबुक को चलाने के लिए आवश्यकताएं:
- Neptune 1.2.x क्लस्टर जो इस नोटबुक से पहुंच योग्य हो
- Python 3.9 या उच्चतर वर्शन के साथ कर्नल
- Bedrock पहुंच के लिए, सुनिश्चित करें कि IAM भूमिका में यह नीति है

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

- नमूना डेटा स्टेजिंग के लिए एक S3 बकेट। बकेट को Neptune के समान खाते/क्षेत्र में होना चाहिए।

## सेटअप करना

### W3C संगठनात्मक डेटा को बीजित करना

W3C संगठनात्मक डेटा, W3C संगठन ऑन्टोलॉजी और कुछ उदाहरण बीजित करें।

आपको उसी क्षेत्र और खाते में एक S3 बकेट की आवश्यकता होगी। `STAGE_BUCKET` को उस बकेट का नाम सेट करें।

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

org ttl को बल्क-लोड करें - दोनों ऑन्टोलॉजी और उदाहरण

```python
%load -s s3://{STAGE_BUCKET} -f turtle --store-to loadres --run
```

```python
%load_status {loadres['payload']['loadId']} --errors --details
```

### श्रृंखला सेटअप करना

```python
!pip install --upgrade --quiet langchain langchain-community langchain-aws
```

** कर्नल को पुनः प्रारंभ करें **

### एक उदाहरण तैयार करना

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

## प्रश्न पूछना

ऊपर दिए गए डेटा पर निर्भर करता है

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
