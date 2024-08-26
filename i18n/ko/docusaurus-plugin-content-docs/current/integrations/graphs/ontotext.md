---
translated: true
---

---
어떤 경우든, 온톨로지(스키마)는 적절한 접두사와 함께 가장 간단하고 LLM이 기억하기 쉬운 `Turtle` 형식으로 LLM에 제공됩니다.

스타워즈 온톨로지는 클래스에 대한 많은 특정 트리플을 포함하고 있다는 점에서 약간 특이합니다. 예를 들어 `:Aleena` 종은 `<planet/38>`에 살고, `:Reptile`의 하위 클래스이며, 특정 특성(평균 키, 평균 수명, 피부색)을 가지고 있고, 특정 개체(캐릭터)가 그 클래스의 대표자입니다.

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

이 튜토리얼을 단순하게 유지하기 위해 보안되지 않은 GraphDB를 사용합니다. GraphDB가 보안되어 있는 경우 `OntotextGraphDBGraph`를 초기화하기 전에 'GRAPHDB_USERNAME'과 'GRAPHDB_PASSWORD' 환경 변수를 설정해야 합니다.

```python
os.environ["GRAPHDB_USERNAME"] = "graphdb-user"
os.environ["GRAPHDB_PASSWORD"] = "graphdb-password"

graph = OntotextGraphDBGraph(
    query_endpoint=...,
    query_ontology=...
)
```

## StarWars 데이터셋에 대한 질문 답변

이제 `OntotextGraphDBQAChain`을 사용하여 몇 가지 질문을 할 수 있습니다.

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

간단한 질문을 해보겠습니다.

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

그리고 좀 더 복잡한 질문을 해보겠습니다.

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

더 복잡한 질문도 할 수 있습니다.

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

## 체인 수정자

Ontotext GraphDB QA 체인은 프롬프트 정제를 통해 QA 체인을 더 개선하고 앱의 전반적인 사용자 경험을 향상시킬 수 있습니다.

### "SPARQL 생성" 프롬프트

이 프롬프트는 사용자 질문과 KG 스키마를 기반으로 SPARQL 쿼리를 생성하는 데 사용됩니다.

- `sparql_generation_prompt`

    기본값:

```python
  GRAPHDB_SPARQL_GENERATION_TEMPLATE = """
  Write a SPARQL SELECT query for querying a graph database.
  The ontology schema delimited by triple backticks in Turtle format is:
    ```
    {schema}
    ```
  Use only the classes and properties provided in the schema to construct the SPARQL query.
  Do not use any classes or properties that are not explicitly provided in the SPARQL query.
  Include all necessary prefixes.
  Do not include any explanations or apologies in your responses.
  Do not wrap the query in backticks.
  Do not include any text except the SPARQL query generated.
  The question delimited by triple backticks is:
    ```
    {prompt}
    ```
  """
  GRAPHDB_SPARQL_GENERATION_PROMPT = PromptTemplate(
      input_variables=["schema", "prompt"],
      template=GRAPHDB_SPARQL_GENERATION_TEMPLATE,
  )
```

### "SPARQL 수정" 프롬프트

때때로 LLM이 구문 오류나 접두사 누락 등이 있는 SPARQL 쿼리를 생성할 수 있습니다. 체인은 LLM에게 이를 수정하도록 프롬프팅하여 일정 횟수 동안 수정을 시도합니다.

- `sparql_fix_prompt`

    기본값:

```python
  GRAPHDB_SPARQL_FIX_TEMPLATE = """
  This following SPARQL query delimited by triple backticks
    ```
    {generated_sparql}
    ```
  is not valid.
  The error delimited by triple backticks is
    ```
    {error_message}
    ```
  Give me a correct version of the SPARQL query.
  Do not change the logic of the query.
  Do not include any explanations or apologies in your responses.
  Do not wrap the query in backticks.
  Do not include any text except the SPARQL query generated.
  The ontology schema delimited by triple backticks in Turtle format is:
    ```
    {schema}
    ```
  """

  GRAPHDB_SPARQL_FIX_PROMPT = PromptTemplate(
      input_variables=["error_message", "generated_sparql", "schema"],
      template=GRAPHDB_SPARQL_FIX_TEMPLATE,
  )
```

- `max_fix_retries`

    기본값: `5`

### "답변" 프롬프트

이 프롬프트는 데이터베이스에서 반환된 결과와 초기 사용자 질문을 기반으로 질문에 답변하는 데 사용됩니다. 기본적으로 LLM은 반환된 결과 정보만 사용하도록 지시됩니다. 결과 집합이 비어 있는 경우 LLM은 질문에 답변할 수 없음을 알려야 합니다.

- `qa_prompt`

  기본값:

```python
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
```

GraphDB로 QA 작업을 마치면 Docker 환경을 종료할 수 있습니다.

```shell
docker compose down -v --remove-orphans
```

Docker 구성 파일이 있는 디렉토리에서 실행하면 됩니다.
