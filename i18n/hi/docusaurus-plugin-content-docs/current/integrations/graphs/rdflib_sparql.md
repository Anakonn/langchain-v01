---
translated: true
---

# RDFLib

>[RDFLib](https://rdflib.readthedocs.io/) एक शुद्ध पायथन पैकेज है जो [RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework) के साथ काम करने के लिए है। `RDFLib` में वह सब कुछ शामिल है जिसकी आपको `RDF` के साथ काम करने की आवश्यकता होती है, जिसमें शामिल हैं:
>- RDF/XML, N3, NTriples, N-Quads, Turtle, TriX, Trig और JSON-LD के लिए पार्सर्स और सीरियलाइज़र
>- एक ग्राफ़ इंटरफ़ेस जिसे किसी भी स्टोर कार्यान्वयन में से किसी एक द्वारा समर्थित किया जा सकता है
>- इन-मेमोरी, डिस्क पर स्थायी (Berkeley DB) और रिमोट SPARQL एंडपॉइंट्स के लिए स्टोर कार्यान्वयन
>- SPARQL 1.1 कार्यान्वयन - SPARQL 1.1 क्वेरीज़ और अपडेट स्टेटमेंट्स का समर्थन करते हुए
>- SPARQL फ़ंक्शन एक्सटेंशन मेकेनिज्म

नेटवर्क-जैसे मॉडल पर आधारित अनुप्रयोगों के लिए ग्राफ़ डेटाबेस एक उत्कृष्ट विकल्प हैं। ऐसे ग्राफ़ की सिंटैक्स और अर्थ को मानकीकृत करने के लिए, W3C `Semantic Web Technologies` की सिफारिश करता है, देखें [Semantic Web](https://www.w3.org/standards/semanticweb/)।

[SPARQL](https://www.w3.org/TR/sparql11-query/) इन ग्राफ़्स के लिए एक क्वेरी भाषा के रूप में कार्य करता है, जैसे कि `SQL` या `Cypher`। यह नोटबुक LLMs को एक प्राकृतिक भाषा इंटरफ़ेस के रूप में एक ग्राफ़ डेटाबेस के लिए SPARQL उत्पन्न करके उनके अनुप्रयोग को दर्शाता है।

**अस्वीकरण:** आज तक, LLMs के माध्यम से `SPARQL` क्वेरी उत्पन्न करना अभी भी थोड़ा अस्थिर है। विशेष रूप से `UPDATE` क्वेरीज़ के साथ सावधान रहें, जो ग्राफ़ को बदलते हैं।

## सेटअप करना

हमें एक पायथन लाइब्रेरी स्थापित करनी होगी:

```python
!pip install rdflib
```

ऐसे कई स्रोत हैं जिनके विरुद्ध आप क्वेरी चला सकते हैं, जिनमें वेब पर फाइलें, स्थानीय रूप से उपलब्ध फाइलें, SPARQL एंडपॉइंट्स, जैसे [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page), और [ट्रिपल स्टोर्स](https://www.w3.org/wiki/LargeTripleStores) शामिल हैं।

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

ध्यान दें कि यदि स्रोत केवल-पढ़ने वाला है, तो स्थानीय रूप से परिवर्तन संग्रहीत करने के लिए `local_file` प्रदान करना आवश्यक है।

## ग्राफ स्कीमा जानकारी को रीफ्रेश करना

यदि डेटाबेस का स्कीमा बदलता है, तो आप SPARQL क्वेरी उत्पन्न करने के लिए आवश्यक स्कीमा जानकारी को रीफ्रेश कर सकते हैं।

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

## ग्राफ़ को क्वेरी करना

अब, आप ग्राफ़ SPARQL QA चेन का उपयोग करके ग्राफ़ के बारे में प्रश्न पूछ सकते हैं।

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

## ग्राफ़ को अपडेट करना

इसी तरह, आप प्राकृतिक भाषा का उपयोग करके ग्राफ़ को अपडेट कर सकते हैं, अर्थात ट्रिपल्स को सम्मिलित कर सकते हैं।

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

आइए परिणामों को सत्यापित करें:

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

## SPARQL क्वेरी लौटाएं

आप `return_sparql_query` पैरामीटर का उपयोग करके Sparql QA चेन से SPARQL क्वेरी चरण को लौटा सकते हैं।

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
