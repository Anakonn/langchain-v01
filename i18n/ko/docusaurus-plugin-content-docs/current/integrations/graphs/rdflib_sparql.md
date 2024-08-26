---
translated: true
---

# RDFLib

>[RDFLib](https://rdflib.readthedocs.io/)는 RDF(Resource Description Framework)를 다루기 위한 순수 Python 패키지입니다. `RDFLib`에는 RDF를 다루는 데 필요한 대부분의 것들이 포함되어 있습니다:
>- RDF/XML, N3, NTriples, N-Quads, Turtle, TriX, Trig 및 JSON-LD의 파서와 직렬화기
>- 다양한 Store 구현으로 지원되는 Graph 인터페이스
>- 메모리 내, 디스크 상의 영구 저장(Berkeley DB) 및 원격 SPARQL 엔드포인트에 대한 저장소 구현
>- SPARQL 1.1 구현 - SPARQL 1.1 쿼리 및 업데이트 문 지원
>- SPARQL 함수 확장 메커니즘

그래프 데이터베이스는 네트워크 모델 기반 애플리케이션에 매우 적합한 선택입니다. 이러한 그래프의 구문과 의미를 표준화하기 위해 W3C는 시맨틱 웹 기술을 권장합니다.

[SPARQL](https://www.w3.org/TR/sparql11-query/)은 SQL이나 Cypher와 유사하게 이러한 그래프에 대한 쿼리 언어로 사용됩니다. 이 노트북은 LLM을 사용하여 그래프 데이터베이스에 대한 자연어 인터페이스를 생성하는 SPARQL 적용을 보여줍니다.

**주의:** 현재 LLM을 통한 SPARQL 쿼리 생성은 아직 다소 불안정합니다. 그래프를 변경하는 UPDATE 쿼리에 특히 주의해야 합니다.

## 설정

Python 라이브러리를 설치해야 합니다:

```python
!pip install rdflib
```

쿼리를 실행할 수 있는 소스에는 웹상의 파일, 로컬에 있는 파일, SPARQL 엔드포인트(예: [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page)), 그리고 [triple store](https://www.w3.org/wiki/LargeTripleStores)가 있습니다.

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

소스가 읽기 전용인 경우 `local_file`을 제공하여 변경 사항을 로컬에 저장할 수 있습니다.

## 그래프 스키마 정보 새로 고침

데이터베이스 스키마가 변경되면 SPARQL 쿼리 생성에 필요한 스키마 정보를 새로 고칠 수 있습니다.

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

## 그래프 쿼리

이제 그래프 SPARQL QA 체인을 사용하여 그래프에 대한 질문을 할 수 있습니다.

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

## 그래프 업데이트

마찬가지로 자연어를 사용하여 그래프를 업데이트할 수 있습니다(예: 트리플 삽입).

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

결과를 확인해 보겠습니다:

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

## SPARQL 쿼리 반환

`return_sparql_query` 매개변수를 사용하여 Sparql QA 체인의 SPARQL 쿼리 단계를 반환할 수 있습니다.

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
