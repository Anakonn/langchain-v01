---
translated: true
---

# RDFLib

>[RDFLib](https://rdflib.readthedocs.io/) es un paquete de Python puro para trabajar con [RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework). `RDFLib` contiene la mayoría de las cosas que necesitas para trabajar con `RDF`, incluyendo:
>- analizadores y serializadores para RDF/XML, N3, NTriples, N-Quads, Turtle, TriX, Trig y JSON-LD
>- una interfaz de gráfico que puede respaldarse por cualquiera de una serie de implementaciones de almacenamiento
>- implementaciones de almacenamiento para memoria, disco persistente (Berkeley DB) y puntos finales SPARQL remotos
>- una implementación de SPARQL 1.1 - compatible con consultas SPARQL 1.1 y declaraciones de actualización
>- mecanismos de extensión de funciones SPARQL

Las bases de datos de gráficos son una excelente opción para aplicaciones basadas en modelos tipo red. Para estandarizar la sintaxis y la semántica de dichos gráficos, el W3C recomienda `Tecnologías de la Web Semántica`, cf. [Semantic Web](https://www.w3.org/standards/semanticweb/).

[SPARQL](https://www.w3.org/TR/sparql11-query/) sirve como un lenguaje de consulta de manera análoga a `SQL` o `Cypher` para estos gráficos. Este cuaderno demuestra la aplicación de LLM como una interfaz de lenguaje natural a una base de datos de gráficos mediante la generación de `SPARQL`.

**Descargo de responsabilidad:** Hasta la fecha, la generación de consultas `SPARQL` a través de LLM sigue siendo un poco inestable. Tenga especial cuidado con las consultas `UPDATE`, que alteran el gráfico.

## Configuración

Tenemos que instalar una biblioteca de python:

```python
!pip install rdflib
```

Hay varias fuentes contra las que puede ejecutar consultas, incluidos archivos en la web, archivos que tiene disponibles localmente, puntos finales SPARQL, p. ej., [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page), y [almacenes de triple](https://www.w3.org/wiki/LargeTripleStores).

```python
from langchain.chains import GraphSparqlQAChain
from langchain_community.graphs import RdfGraph
from langchain_openai import ChatOpenAI
```

```python
graph = RdfGraph(
    source_file="http://www.w3.org/People/Berners-Lee/card",
    standard="rdf",
    local_copy="test.ttl",
)
```

Tenga en cuenta que proporcionar un `local_file` es necesario para almacenar los cambios localmente si la fuente es de solo lectura.

## Actualizar la información del esquema del gráfico

Si el esquema de la base de datos cambia, puede actualizar la información del esquema necesaria para generar consultas SPARQL.

```python
graph.load_schema()
```

```python
graph.get_schema
```

```output
In the following, each IRI is followed by the local name and optionally its description in parentheses.
The RDF graph supports the following node types:
<http://xmlns.com/foaf/0.1/PersonalProfileDocument> (PersonalProfileDocument, None), <http://www.w3.org/ns/auth/cert#RSAPublicKey> (RSAPublicKey, None), <http://www.w3.org/2000/10/swap/pim/contact#Male> (Male, None), <http://xmlns.com/foaf/0.1/Person> (Person, None), <http://www.w3.org/2006/vcard/ns#Work> (Work, None)
The RDF graph supports the following relationships:
<http://www.w3.org/2000/01/rdf-schema#seeAlso> (seeAlso, None), <http://purl.org/dc/elements/1.1/title> (title, None), <http://xmlns.com/foaf/0.1/mbox_sha1sum> (mbox_sha1sum, None), <http://xmlns.com/foaf/0.1/maker> (maker, None), <http://www.w3.org/ns/solid/terms#oidcIssuer> (oidcIssuer, None), <http://www.w3.org/2000/10/swap/pim/contact#publicHomePage> (publicHomePage, None), <http://xmlns.com/foaf/0.1/openid> (openid, None), <http://www.w3.org/ns/pim/space#storage> (storage, None), <http://xmlns.com/foaf/0.1/name> (name, None), <http://www.w3.org/2000/10/swap/pim/contact#country> (country, None), <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> (type, None), <http://www.w3.org/ns/solid/terms#profileHighlightColor> (profileHighlightColor, None), <http://www.w3.org/ns/pim/space#preferencesFile> (preferencesFile, None), <http://www.w3.org/2000/01/rdf-schema#label> (label, None), <http://www.w3.org/ns/auth/cert#modulus> (modulus, None), <http://www.w3.org/2000/10/swap/pim/contact#participant> (participant, None), <http://www.w3.org/2000/10/swap/pim/contact#street2> (street2, None), <http://www.w3.org/2006/vcard/ns#locality> (locality, None), <http://xmlns.com/foaf/0.1/nick> (nick, None), <http://xmlns.com/foaf/0.1/homepage> (homepage, None), <http://creativecommons.org/ns#license> (license, None), <http://xmlns.com/foaf/0.1/givenname> (givenname, None), <http://www.w3.org/2006/vcard/ns#street-address> (street-address, None), <http://www.w3.org/2006/vcard/ns#postal-code> (postal-code, None), <http://www.w3.org/2000/10/swap/pim/contact#street> (street, None), <http://www.w3.org/2003/01/geo/wgs84_pos#lat> (lat, None), <http://xmlns.com/foaf/0.1/primaryTopic> (primaryTopic, None), <http://www.w3.org/2006/vcard/ns#fn> (fn, None), <http://www.w3.org/2003/01/geo/wgs84_pos#location> (location, None), <http://usefulinc.com/ns/doap#developer> (developer, None), <http://www.w3.org/2000/10/swap/pim/contact#city> (city, None), <http://www.w3.org/2006/vcard/ns#region> (region, None), <http://xmlns.com/foaf/0.1/member> (member, None), <http://www.w3.org/2003/01/geo/wgs84_pos#long> (long, None), <http://www.w3.org/2000/10/swap/pim/contact#address> (address, None), <http://xmlns.com/foaf/0.1/family_name> (family_name, None), <http://xmlns.com/foaf/0.1/account> (account, None), <http://xmlns.com/foaf/0.1/workplaceHomepage> (workplaceHomepage, None), <http://purl.org/dc/terms/title> (title, None), <http://www.w3.org/ns/solid/terms#publicTypeIndex> (publicTypeIndex, None), <http://www.w3.org/2000/10/swap/pim/contact#office> (office, None), <http://www.w3.org/2000/10/swap/pim/contact#homePage> (homePage, None), <http://xmlns.com/foaf/0.1/mbox> (mbox, None), <http://www.w3.org/2000/10/swap/pim/contact#preferredURI> (preferredURI, None), <http://www.w3.org/ns/solid/terms#profileBackgroundColor> (profileBackgroundColor, None), <http://schema.org/owns> (owns, None), <http://xmlns.com/foaf/0.1/based_near> (based_near, None), <http://www.w3.org/2006/vcard/ns#hasAddress> (hasAddress, None), <http://xmlns.com/foaf/0.1/img> (img, None), <http://www.w3.org/2000/10/swap/pim/contact#assistant> (assistant, None), <http://xmlns.com/foaf/0.1/title> (title, None), <http://www.w3.org/ns/auth/cert#key> (key, None), <http://www.w3.org/ns/ldp#inbox> (inbox, None), <http://www.w3.org/ns/solid/terms#editableProfile> (editableProfile, None), <http://www.w3.org/2000/10/swap/pim/contact#postalCode> (postalCode, None), <http://xmlns.com/foaf/0.1/weblog> (weblog, None), <http://www.w3.org/ns/auth/cert#exponent> (exponent, None), <http://rdfs.org/sioc/ns#avatar> (avatar, None)
```

## Consultar el gráfico

Ahora puede usar la cadena de consulta SPARQL QA para hacer preguntas sobre el gráfico.

```python
chain = GraphSparqlQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.run("What is Tim Berners-Lee's work homepage?")
```

```output


[1m> Entering new GraphSparqlQAChain chain...[0m
Identified intent:
[32;1m[1;3mSELECT[0m
Generated SPARQL:
[32;1m[1;3mPREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?homepage
WHERE {
    ?person foaf:name "Tim Berners-Lee" .
    ?person foaf:workplaceHomepage ?homepage .
}[0m
Full Context:
[32;1m[1;3m[][0m

[1m> Finished chain.[0m
```

```output
"Tim Berners-Lee's work homepage is http://www.w3.org/People/Berners-Lee/."
```

## Actualizar el gráfico

De manera análoga, puede actualizar el gráfico, es decir, insertar triples, usando lenguaje natural.

```python
chain.run(
    "Save that the person with the name 'Timothy Berners-Lee' has a work homepage at 'http://www.w3.org/foo/bar/'"
)
```

```output


[1m> Entering new GraphSparqlQAChain chain...[0m
Identified intent:
[32;1m[1;3mUPDATE[0m
Generated SPARQL:
[32;1m[1;3mPREFIX foaf: <http://xmlns.com/foaf/0.1/>
INSERT {
    ?person foaf:workplaceHomepage <http://www.w3.org/foo/bar/> .
}
WHERE {
    ?person foaf:name "Timothy Berners-Lee" .
}[0m

[1m> Finished chain.[0m
```

```output
'Successfully inserted triples into the graph.'
```

Verifiquemos los resultados:

```python
query = (
    """PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"""
    """SELECT ?hp\n"""
    """WHERE {\n"""
    """    ?person foaf:name "Timothy Berners-Lee" . \n"""
    """    ?person foaf:workplaceHomepage ?hp .\n"""
    """}"""
)
graph.query(query)
```

```output
[(rdflib.term.URIRef('https://www.w3.org/'),),
 (rdflib.term.URIRef('http://www.w3.org/foo/bar/'),)]
```

## Devolver la consulta SQARQL

Puede devolver el paso de consulta SPARQL de la cadena de consulta SPARQL QA usando el parámetro `return_sparql_query`

```python
chain = GraphSparqlQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_sparql_query=True
)
```

```python
result = chain("What is Tim Berners-Lee's work homepage?")
print(f"SQARQL query: {result['sparql_query']}")
print(f"Final answer: {result['result']}")
```

```output


[1m> Entering new GraphSparqlQAChain chain...[0m
Identified intent:
[32;1m[1;3mSELECT[0m
Generated SPARQL:
[32;1m[1;3mPREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?workHomepage
WHERE {
    ?person foaf:name "Tim Berners-Lee" .
    ?person foaf:workplaceHomepage ?workHomepage .
}[0m
Full Context:
[32;1m[1;3m[][0m

[1m> Finished chain.[0m
SQARQL query: PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?workHomepage
WHERE {
    ?person foaf:name "Tim Berners-Lee" .
    ?person foaf:workplaceHomepage ?workHomepage .
}
Final answer: Tim Berners-Lee's work homepage is http://www.w3.org/People/Berners-Lee/.
```

```python
print(result["sparql_query"])
```

```output
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?workHomepage
WHERE {
    ?person foaf:name "Tim Berners-Lee" .
    ?person foaf:workplaceHomepage ?workHomepage .
}
```
