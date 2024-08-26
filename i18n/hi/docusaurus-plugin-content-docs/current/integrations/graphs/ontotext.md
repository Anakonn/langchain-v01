---
translated: true
---

# Ontotext GraphDB

>[Ontotext GraphDB](https://graphdb.ontotext.com/) एक ग्राफ डेटाबेस और [RDF](https://www.w3.org/RDF/) और [SPARQL](https://www.w3.org/TR/sparql11-query/) के अनुरूप ज्ञान खोज उपकरण है।

>यह नोटबुक दिखाता है कि कैसे LLM का उपयोग करके प्राकृतिक भाषा क्वेरी (NLQ to SPARQL, जिसे `text2sparql` भी कहा जाता है) का उपयोग `Ontotext GraphDB` के लिए किया जा सकता है।

## GraphDB LLM कार्यक्षमताएं

`GraphDB` कुछ LLM एकीकरण कार्यक्षमताएं समर्थित करता है जैसा कि [यहां](https://github.com/w3c/sparql-dev/issues/193) वर्णित है:

[gpt-queries](https://graphdb.ontotext.com/documentation/10.5/gpt-queries.html)

* अपने ज्ञान ग्राफ (KG) से डेटा का उपयोग करके किसी LLM से पाठ, सूची या तालिका पूछने के लिए जादुई प्रेडिकेट
* क्वेरी व्याख्या
* परिणाम व्याख्या, सारांश, पुनर्प्रारूपण, अनुवाद

[retrieval-graphdb-connector](https://graphdb.ontotext.com/documentation/10.5/retrieval-graphdb-connector.html)

* एक वेक्टर डेटाबेस में KG प्रकृतियों का अनुक्रमण
* किसी भी पाठ एम्बेडिंग एल्गोरिदम और वेक्टर डेटाबेस का समर्थन करता है
* GraphDB द्वारा Elastic, Solr, Lucene के लिए उपयोग किए जाने वाले शक्तिशाली कनेक्टर (अनुक्रमण) भाषा का उपयोग करता है
* RDF डेटा में परिवर्तनों का KG प्रकृति सूचकांक में स्वचालित समन्वयन
* अवस्थित वस्तुओं का समर्थन करता है (GraphDB संस्करण 10.5 में UI समर्थन नहीं)
* KG प्रकृतियों को इस तरह से पाठ में सीरियलाइज़ करता है (उदाहरण के लिए एक Wines डेटासेट के लिए):

```text
Franvino:
- is a RedWine.
- made from grape Merlo.
- made from grape Cabernet Franc.
- has sugar dry.
- has year 2012.
```

[talk-to-graph](https://graphdb.ontotext.com/documentation/10.5/talk-to-graph.html)

* एक परिभाषित KG प्रकृति सूचकांक का उपयोग करके एक सरल चैटबॉट

इस ट्यूटोरियल के लिए, हम GraphDB LLM एकीकरण का उपयोग नहीं करेंगे, बल्कि NLQ से SPARQL उत्पादन का उपयोग करेंगे। हम `Star Wars API` (`SWAPI`) ऑंटोलॉजी और डेटासेट का उपयोग करेंगे जिसका परीक्षण [यहां](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo/blob/main/starwars-data.trig) किया जा सकता है।

## सेटअप करना

आपको एक चल रहा GraphDB इंस्टेंस की आवश्यकता है। यह ट्यूटोरियल दिखाता है कि [GraphDB Docker छवि](https://hub.docker.com/r/ontotext/graphdb) का उपयोग करके स्थानीय रूप से डेटाबेस कैसे चलाया जाए। यह एक docker compose सेट-अप प्रदान करता है, जो GraphDB को Star Wars डेटासेट से भर देता है। सभी आवश्यक फ़ाइलें, इस नोटबुक सहित, [langchain-graphdb-qa-chain-demo GitHub रिपॉजिटरी](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo) से डाउनलोड की जा सकती हैं।

* [Docker](https://docs.docker.com/get-docker/) इंस्टॉल करें। यह ट्यूटोरियल [Docker Compose](https://docs.docker.com/compose/) के साथ बंडल किए गए Docker संस्करण `24.0.7` का उपयोग करके बनाया गया है। पुराने Docker संस्करणों के लिए आपको Docker Compose अलग से इंस्टॉल करना पड़ सकता है।
* [langchain-graphdb-qa-chain-demo GitHub रिपॉजिटरी](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo) को अपने मशीन पर स्थानीय फ़ोल्डर में क्लोन करें।
* निम्नलिखित स्क्रिप्ट को उसी फ़ोल्डर से निष्पादित करके GraphDB शुरू करें।

```bash
docker build --tag graphdb .
docker compose up -d graphdb
```

  डेटाबेस `http://localhost:7200/` पर शुरू होने के लिए कुछ सेकंड प्रतीक्षा करनी होगी। स्टार वार्स डेटासेट `starwars-data.trig` स्वचालित रूप से `langchain` रिपॉजिटरी में लोड किया जाता है। स्थानीय SPARQL एंडपॉइंट `http://localhost:7200/repositories/langchain` का उपयोग क्वेरी चलाने के लिए किया जा सकता है। आप अपने पसंदीदा वेब ब्राउज़र `http://localhost:7200/sparql` से GraphDB वर्कबेंच भी खोल सकते हैं जहां आप इंटरैक्टिव रूप से क्वेरी कर सकते हैं।
* कार्यशील वातावरण सेट करें

यदि आप `conda` का उपयोग करते हैं, तो एक नया conda env बनाएं और सक्रिय करें (उदाहरण के लिए `conda create -n graph_ontotext_graphdb_qa python=3.9.18`)।

निम्नलिखित लाइब्रेरियों को इंस्टॉल करें:

```bash
pip install jupyter==1.0.0
pip install openai==1.6.1
pip install rdflib==7.0.0
pip install langchain-openai==0.0.2
pip install langchain>=0.1.5
```

Jupyter को निम्नानुसार चलाएं:

```bash
jupyter notebook
```

## विशेषता करना

जिस प्रकार से एलएलएम को एसपीएआरक्यूएल उत्पन्न करने में सक्षम होना चाहिए, उसके लिए उसे ज्ञान ग्राफ़ स्कीमा (विशेषता) का ज्ञान होना चाहिए। इसे `OntotextGraphDBGraph` वर्ग पर निम्नलिखित दो पैरामीटरों में से एक का उपयोग करके प्रदान किया जा सकता है:

* `query_ontology`: एक `CONSTRUCT` क्वेरी जो एसपीएआरक्यूएल एंडपॉइंट पर निष्पादित की जाती है और केजी स्कीमा बयानों को वापस लौटाती है। हम सिफारिश करते हैं कि आप विशेषता को अपने खुद के नामित ग्राफ में संग्रहीत करें, जिससे केवल प्रासंगिक बयानों को प्राप्त करना आसान हो जाएगा (जैसा कि नीचे उदाहरण में है)। `DESCRIBE` क्वेरियों का समर्थन नहीं है, क्योंकि `DESCRIBE` सिमेट्रिक कंसाइस बाउंडेड डिस्क्रिप्शन (SCBD) वापस करता है, यानी वर्ग लिंक भी। बड़े ग्राफों में, जहां मिलियन इंस्टेंस हों, यह कुशल नहीं है। https://github.com/eclipse-rdf4j/rdf4j/issues/4857 पर जाँच करें
* `local_file`: एक स्थानीय आरडीएफ विशेषता फ़ाइल। समर्थित आरडीएफ प्रारूप `Turtle`, `RDF/XML`, `JSON-LD`, `N-Triples`, `Notation-3`, `Trig`, `Trix`, `N-Quads` हैं।

किसी भी मामले में, विशेषता डंप में निम्नलिखित होना चाहिए:

* वर्गों, गुणों, वर्गों पर गुण संलग्नता (rdfs:domain, schema:domainIncludes या OWL प्रतिबंधों का उपयोग करके) और वर्गीकरण (महत्वपूर्ण व्यक्ति) के बारे में पर्याप्त जानकारी शामिल हो।
* अत्यधिक विस्तृत और अप्रासंगिक परिभाषाओं और उदाहरणों को शामिल न करें जो एसपीएआरक्यूएल निर्माण में मदद नहीं करते हैं।

```python
from langchain_community.graphs import OntotextGraphDBGraph

# feeding the schema using a user construct query

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    query_ontology="CONSTRUCT {?s ?p ?o} FROM <https://swapi.co/ontology/> WHERE {?s ?p ?o}",
)
```

```python
# feeding the schema using a local RDF file

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    local_file="/path/to/langchain_graphdb_tutorial/starwars-ontology.nt",  # change the path here
)
```

किसी भी तरह से, विशेषता (स्कीमा) को `Turtle` के रूप में एलएलएम को फ़ीड किया जाता है क्योंकि उपयुक्त उपसर्गों के साथ `Turtle` सबसे संक्षिप्त और एलएलएम के लिए सबसे आसान है।

स्टार वॉर्स विशेषता थोड़ी असामान्य है क्योंकि इसमें वर्गों के बारे में कई विशिष्ट त्रिपल शामिल हैं, जैसे कि प्रजाति `:Aleena` `<planet/38>` पर रहती हैं, वे `:Reptile` की उपप्रजाति हैं, उनके कुछ प्रतिनिधि लक्षण (औसत ऊंचाई, औसत आयु, त्वचा रंग) हैं, और विशिष्ट व्यक्ति (चरित्र) उस वर्ग के प्रतिनिधि हैं:

```output
@prefix : <https://swapi.co/vocabulary/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:Aleena a owl:Class, :Species ;
    rdfs:label "Aleena" ;
    rdfs:isDefinedBy <https://swapi.co/ontology/> ;
    rdfs:subClassOf :Reptile, :Sentient ;
    :averageHeight 80.0 ;
    :averageLifespan "79" ;
    :character <https://swapi.co/resource/aleena/47> ;
    :film <https://swapi.co/resource/film/4> ;
    :language "Aleena" ;
    :planet <https://swapi.co/resource/planet/38> ;
    :skinColor "blue", "gray" .

    ...

```

इस ट्यूटोरियल को सरल रखने के लिए, हम असुरक्षित GraphDB का उपयोग करते हैं। यदि GraphDB सुरक्षित है, तो `OntotextGraphDBGraph` के प्रारंभीकरण से पहले आपको 'GRAPHDB_USERNAME' और 'GRAPHDB_PASSWORD' पर्यावरण चर सेट करने चाहिए।

```python
os.environ["GRAPHDB_USERNAME"] = "graphdb-user"
os.environ["GRAPHDB_PASSWORD"] = "graphdb-password"

graph = OntotextGraphDBGraph(
    query_endpoint=...,
    query_ontology=...
)
```

## स्टार वॉर्स डेटासेट के खिलाफ प्रश्न उत्तर

अब हम `OntotextGraphDBQAChain` का उपयोग कर कुछ प्रश्न पूछ सकते हैं।

```python
import os

from langchain.chains import OntotextGraphDBQAChain
from langchain_openai import ChatOpenAI

# We'll be using an OpenAI model which requires an OpenAI API Key.
# However, other models are available as well:
# https://python.langchain.com/docs/integrations/chat/

# Set the environment variable `OPENAI_API_KEY` to your OpenAI API key
os.environ["OPENAI_API_KEY"] = "sk-***"

# Any available OpenAI model can be used here.
# We use 'gpt-4-1106-preview' because of the bigger context window.
# The 'gpt-4-1106-preview' model_name will deprecate in the future and will change to 'gpt-4-turbo' or similar,
# so be sure to consult with the OpenAI API https://platform.openai.com/docs/models for the correct naming.

chain = OntotextGraphDBQAChain.from_llm(
    ChatOpenAI(temperature=0, model_name="gpt-4-1106-preview"),
    graph=graph,
    verbose=True,
)
```

चलो एक सरल प्रश्न पूछते हैं।

```python
chain.invoke({chain.input_key: "What is the climate on Tatooine?"})[chain.output_key]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?planet rdfs:label "Tatooine" ;
          :climate ?climate .
}[0m

[1m> Finished chain.[0m
```

```output
'The climate on Tatooine is arid.'
```

और थोड़ा अधिक जटिल।

```python
chain.invoke({chain.input_key: "What is the climate on Luke Skywalker's home planet?"})[
    chain.output_key
]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?character rdfs:label "Luke Skywalker" .
  ?character :homeworld ?planet .
  ?planet :climate ?climate .
}[0m

[1m> Finished chain.[0m
```

```output
"The climate on Luke Skywalker's home planet is arid."
```

हम और भी जटिल प्रश्न पूछ सकते हैं जैसे कि

```python
chain.invoke(
    {
        chain.input_key: "What is the average box office revenue for all the Star Wars movies?"
    }
)[chain.output_key]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT (AVG(?boxOffice) AS ?averageBoxOffice)
WHERE {
  ?film a :Film .
  ?film :boxOffice ?boxOfficeValue .
  BIND(xsd:decimal(?boxOfficeValue) AS ?boxOffice)
}
[0m

[1m> Finished chain.[0m
```

```output
'The average box office revenue for all the Star Wars movies is approximately 754.1 million dollars.'
```

## श्रृंखला संशोधक

Ontotext GraphDB QA श्रृंखला आपके QA श्रृंखला को और अधिक सुधारने और आपके ऐप के समग्र उपयोगकर्ता अनुभव को बेहतर बनाने के लिए प्रॉम्प्ट रिफाइनमेंट की अनुमति देती है।

### "SPARQL Generation" प्रॉम्प्ट

प्रॉम्प्ट का उपयोग उपयोगकर्ता के प्रश्न और केजी स्कीमा के आधार पर एसपीएआरक्यूएल क्वेरी जनरेशन के लिए किया जाता है।

- `sparql_generation_prompt`

    डिफ़ॉल्ट मान:
  ````python
    GRAPHDB_SPARQL_GENERATION_TEMPLATE = """
    ग्राफ़ डेटाबेस को क्वेरी करने के लिए एक SPARQL SELECT क्वेरी लिखें।
    त्रिपल बैकटिक्स द्वारा सीमित टर्टल प्रारूप में विशेषता स्कीमा है:
    ```
    {schema}
    ```
    केवल स्कीमा में प्रदान किए गए वर्गों और गुणों का उपयोग करके SPARQL क्वेरी का निर्माण करें।
    स्कीमा में स्पष्ट रूप से प्रदान न किए गए किसी भी वर्ग या गुण का उपयोग न करें।
    सभी आवश्यक उपसर्गों को शामिल करें।
    अपने उत्तरों में कोई भी व्याख्या या माफी शामिल न करें।
    क्वेरी को बैकटिक्स में न लपेटें।
    केवल उत्पन्न किए गए SPARQL क्वेरी को छोड़कर कोई अन्य पाठ न शामिल करें।
    त्रिपल बैकटिक्स द्वारा सीमित प्रश्न है:
    ```
    {prompt}
    ```
    """
    GRAPHDB_SPARQL_GENERATION_PROMPT = PromptTemplate(
        input_variables=["schema", "prompt"],
        template=GRAPHDB_SPARQL_GENERATION_TEMPLATE,
    )
  ````

### "SPARQL Fix" प्रॉम्प्ट

कभी-कभी, एलएलएम एक SPARQL क्वेरी उत्पन्न कर सकता है जिसमें व्याकरणिक त्रुटियां या उपसर्गों की कमी हो सकती है। श्रृंखला इसे सुधारने का प्रयास करेगी एक निश्चित संख्या में बार प्रॉम्प्ट करके।

- `sparql_fix_prompt`

    डिफ़ॉल्ट मान:
  ````python
    GRAPHDB_SPARQL_FIX_TEMPLATE = """
    यह निम्नलिखित SPARQL क्वेरी जो त्रिपल बैकटिक्स द्वारा सीमित है
    ```
    {generated_sparql}
    ```
    मान्य नहीं है।
    त्रुटि जो त्रिपल बैकटिक्स द्वारा सीमित है
    ```
    {error_message}
    ```
    मुझे SPARQL क्वेरी का सही संस्करण दें।
    क्वेरी के तर्क को न बदलें।
    अपने उत्तरों में कोई भी व्याख्या या माफी शामिल न करें।
    क्वेरी को बैकटिक्स में न लपेटें।
    केवल उत्पन्न किए गए SPARQL क्वेरी को छोड़कर कोई अन्य पाठ न शामिल करें।
    त्रिपल बैकटिक्स द्वारा सीमित टर्टल प्रारूप में विशेषता स्कीमा है:
    ```
    {schema}
    ```
    """

    GRAPHDB_SPARQL_FIX_PROMPT = PromptTemplate(
        input_variables=["error_message", "generated_sparql", "schema"],
        template=GRAPHDB_SPARQL_FIX_TEMPLATE,
    )
  ````

- `max_fix_retries`

    डिफ़ॉल्ट मान: `5`

### "उत्तर देने" प्रॉम्प्ट

प्रॉम्प्ट का उपयोग डेटाबेस से प्राप्त परिणामों और प्रारंभिक उपयोगकर्ता प्रश्न के आधार पर प्रश्न का उत्तर देने के लिए किया जाता है। डिफ़ॉल्ट रूप से, एलएलएम को केवल वापस आए परिणाम(ों) से जानकारी का उपयोग करने के लिए निर्देशित किया जाता है। यदि परिणाम सेट खाली है, तो एलएलएम को बताना चाहिए कि वह प्रश्न का उत्तर नहीं दे सकता।

- `qa_prompt`

  डिफ़ॉल्ट मान:
  ````python
    GRAPHDB_QA_TEMPLATE = """Task: Generate a natural language response from the results of a SPARQL query.
    You are an assistant that creates well-written and human understandable answers.
    The information part contains the information provided, which you can use to construct an answer.
    The information provided is authoritative, you must never doubt it or try to use your internal knowledge to correct it.
    Make your response sound like the information is coming from an AI assistant, but don't add any information.
    Don't use internal knowledge to answer the question, just say you don't know if no information is available.
    Information:
    {context}

    Question: {prompt}
    Helpful Answer:"""
    GRAPHDB_QA_PROMPT = PromptTemplate(
        input_variables=["context", "prompt"], template=GRAPHDB_QA_TEMPLATE
    )
  ````

एक बार जब आप GraphDB के साथ QA के साथ खेल चुके हों, तो आप
``
docker compose down -v --remove-orphans
``
Docker compose फ़ाइल वाले निर्देशिका से चलाकर Docker पर्यावरण को बंद कर सकते हैं।
