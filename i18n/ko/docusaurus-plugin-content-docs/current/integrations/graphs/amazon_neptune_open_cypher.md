---
translated: true
---

# Amazon Neptune와 Cypher

>[Amazon Neptune](https://aws.amazon.com/neptune/)은 뛰어난 확장성과 가용성을 제공하는 고성능 그래프 분석 및 서버리스 데이터베이스입니다.
>
>이 예제는 `openCypher`를 사용하여 `Neptune` 그래프 데이터베이스를 쿼리하고 사람이 읽을 수 있는 응답을 반환하는 QA 체인을 보여줍니다.
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language))는 속성 그래프에서 표현력 있고 효율적인 데이터 쿼리를 허용하는 선언적 그래프 쿼리 언어입니다.
>
>[openCypher](https://opencypher.org/)는 Cypher의 오픈 소스 구현입니다.# Neptune Open Cypher QA Chain
이 QA 체인은 openCypher를 사용하여 Amazon Neptune을 쿼리하고 사람이 읽을 수 있는 응답을 반환합니다.

LangChain은 `NeptuneOpenCypherQAChain`을 통해 [Neptune Database](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html) 및 [Neptune Analytics](https://docs.aws.amazon.com/neptune-analytics/latest/userguide/what-is-neptune-analytics.html)를 지원합니다.

Neptune Database는 최적의 확장성과 가용성을 위해 설계된 서버리스 그래프 데이터베이스입니다. 초당 10만 건의 쿼리, 다중 AZ 고가용성, 다중 리전 배포 등 그래프 데이터베이스 워크로드에 적합한 솔루션을 제공합니다. 소셜 네트워킹, 사기 경보, 고객 360 애플리케이션 등에 Neptune Database를 사용할 수 있습니다.

Neptune Analytics는 메모리 내에서 대량의 그래프 데이터를 신속하게 분석하여 통찰력을 얻고 트렌드를 찾을 수 있는 분석 데이터베이스 엔진입니다. Neptune Analytics는 기존 그래프 데이터베이스 또는 데이터 레이크에 저장된 그래프 데이터세트를 신속하게 분석하는 솔루션입니다. 널리 사용되는 그래프 분석 알고리즘과 저지연 분석 쿼리를 사용합니다.

## Neptune Database 사용하기

```python
from langchain_community.graphs import NeptuneGraph

host = "<neptune-host>"
port = 8182
use_https = True

graph = NeptuneGraph(host=host, port=port, use_https=use_https)
```

### Neptune Analytics 사용하기

```python
from langchain_community.graphs import NeptuneAnalyticsGraph

graph = NeptuneAnalyticsGraph(graph_identifier="<neptune-analytics-graph-id>")
```

## NeptuneOpenCypherQAChain 사용하기

이 QA 체인은 openCypher를 사용하여 Neptune 그래프 데이터베이스를 쿼리하고 사람이 읽을 수 있는 응답을 반환합니다.

```python
from langchain.chains import NeptuneOpenCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model="gpt-4")

chain = NeptuneOpenCypherQAChain.from_llm(llm=llm, graph=graph)

chain.invoke("how many outgoing routes does the Austin airport have?")
```

```output
'The Austin airport has 98 outgoing routes.'
```
