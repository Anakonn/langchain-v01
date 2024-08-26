---
translated: true
---

# TiDB 벡터

> [TiDB Cloud](https://tidbcloud.com/)는 전용 및 서버리스 옵션을 제공하는 포괄적인 데이터베이스 서비스(DBaaS) 솔루션입니다. TiDB Serverless는 이제 MySQL 환경에 내장된 벡터 검색을 통합하고 있습니다. 이 향상을 통해 새로운 데이터베이스나 추가 기술 스택 없이도 TiDB Serverless를 사용하여 AI 애플리케이션을 seamlessly 개발할 수 있습니다. 프라이빗 베타 대기자 명단에 가입하여 이를 먼저 경험해 보세요 https://tidb.cloud/ai.

이 노트북은 TiDB 벡터 기능을 활용하는 방법에 대한 자세한 가이드를 제공하며, 그 기능과 실용적인 응용 프로그램을 보여줍니다.

## 환경 설정

필요한 패키지를 설치하는 것으로 시작합니다.

```python
%pip install langchain
%pip install langchain-openai
%pip install pymysql
%pip install tidb-vector
```

사용할 OpenAI 및 TiDB 호스트 설정을 구성합니다. 이 노트북에서는 TiDB Cloud에서 제공하는 표준 연결 방법을 따라 안전하고 효율적인 데이터베이스 연결을 설정할 것입니다.

```python
# Here we useimport getpass
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
# copy from tidb cloud console
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
# tidb_connection_string_template = "mysql+pymysql://root:<PASSWORD>@34.212.137.91:4000/test"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

다음 데이터를 준비합니다.

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import TiDBVectorStore
from langchain_openai import OpenAIEmbeddings
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## 의미론적 유사성 검색

TiDB는 코사인 및 유클리드 거리('cosine', 'l2')를 지원하며, 'cosine'이 기본 선택입니다.

아래 코드 스니펫은 벡터 검색에 최적화된 `TABLE_NAME`이라는 테이블을 TiDB에 생성합니다. 이 코드를 성공적으로 실행하면 `TABLE_NAME` 테이블을 직접 TiDB 데이터베이스에서 볼 수 있고 액세스할 수 있습니다.

```python
TABLE_NAME = "semantic_embeddings"
db = TiDBVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    table_name=TABLE_NAME,
    connection_string=tidb_connection_string,
    distance_strategy="cosine",  # default, another option is "l2"
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query, k=3)
```

코사인 거리가 낮을수록 유사성이 높습니다.

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.18459301498220004
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.2172729943284636
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.2262166799003692
And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.
--------------------------------------------------------------------------------
```

또한 similarity_search_with_relevance_scores 메서드를 사용하여 관련성 점수를 얻을 수 있으며, 점수가 높을수록 유사성이 더 큽니다.

```python
docs_with_relevance_score = db.similarity_search_with_relevance_scores(query, k=2)
for doc, score in docs_with_relevance_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.8154069850178
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.7827270056715364
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```

# 메타데이터로 필터링

적용된 필터와 일치하는 최근접 이웃 결과의 특정 수를 검색하려면 메타데이터 필터를 사용하여 검색을 수행합니다.

## 지원되는 메타데이터 유형

TiDB 벡터 스토어의 각 벡터는 JSON 객체 내의 키-값 쌍으로 구성된 메타데이터와 연결될 수 있습니다. 키는 문자열이며, 값은 다음 유형 중 하나일 수 있습니다:

- 문자열
- 숫자(정수 또는 부동 소수점)
- 부울(true, false)

예를 들어 다음과 같은 유효한 메타데이터 페이로드를 고려해 보세요:

```json
{
    "page": 12,
    "book_tile": "Siddhartha"
}
```

## 메타데이터 필터 구문

사용 가능한 필터에는 다음이 포함됩니다:

- $or - 주어진 조건 중 하나라도 충족하는 벡터를 선택합니다.
- $and - 주어진 모든 조건을 충족하는 벡터를 선택합니다.
- $eq - 같음
- $ne - 같지 않음
- $gt - 보다 큼
- $gte - 크거나 같음
- $lt - 보다 작음
- $lte - 작거나 같음
- $in - 배열에 포함됨
- $nin - 배열에 포함되지 않음

메타데이터가 있는 한 벡터를 가정하면:

```json
{
    "page": 12,
    "book_tile": "Siddhartha"
}
```

다음 메타데이터 필터가 벡터와 일치합니다.

```json
{"page": 12}

{"page":{"$eq": 12}}

{"page":{"$in": [11, 12, 13]}}

{"page":{"$nin": [13]}}

{"page":{"$lt": 11}}

{
    "$or": [{"page": 11}, {"page": 12}],
    "$and": [{"page": 12}, {"page": 13}],
}
```

각 키-값 쌍의 메타데이터 필터가 별도의 필터 절로 처리되며, 이 절은 AND 논리 연산자를 사용하여 결합됩니다.

```python
db.add_texts(
    texts=[
        "TiDB Vector offers advanced, high-speed vector processing capabilities, enhancing AI workflows with efficient data handling and analytics support.",
        "TiDB Vector, starting as low as $10 per month for basic usage",
    ],
    metadatas=[
        {"title": "TiDB Vector functionality"},
        {"title": "TiDB Vector Pricing"},
    ],
)
```

```output
[UUID('c782cb02-8eec-45be-a31f-fdb78914f0a7'),
 UUID('08dcd2ba-9f16-4f29-a9b7-18141f8edae3')]
```

```python
docs_with_score = db.similarity_search_with_score(
    "Introduction to TiDB Vector", filter={"title": "TiDB Vector functionality"}, k=4
)
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.12761409169211535
TiDB Vector offers advanced, high-speed vector processing capabilities, enhancing AI workflows with efficient data handling and analytics support.
--------------------------------------------------------------------------------
```

### Retriever로 사용

Langchain에서 retriever는 구조화되지 않은 쿼리에 대한 문서를 검색하는 인터페이스로, 벡터 스토어보다 더 광범위한 기능을 제공합니다. 아래 코드는 TiDB 벡터를 retriever로 사용하는 방법을 보여줍니다.

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 3, "score_threshold": 0.8},
)
docs_retrieved = retriever.invoke(query)
for doc in docs_retrieved:
    print("-" * 80)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
```

## 고급 사용 사례 시나리오

깨끗한 라운지와 채식 옵션과 같은 특정 편의 시설을 갖춘 공항을 찾고자 하는 고객을 위해 여행사가 맞춤형 여행 보고서를 작성하는 고급 사용 사례를 살펴보겠습니다. 이 프로세스에는 다음이 포함됩니다:
- 공항 리뷰에서 이러한 편의 시설을 충족하는 공항 코드를 추출하기 위한 의미론적 검색.
- 이 코드와 고객 선호도에 맞는 항공편 및 목적지 정보를 결합하는 후속 SQL 쿼리.

먼저 공항 관련 데이터를 준비해 보겠습니다.

```python
# create table to store airplan data
db.tidb_vector_client.execute(
    """CREATE TABLE airplan_routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        airport_code VARCHAR(10),
        airline_code VARCHAR(10),
        destination_code VARCHAR(10),
        route_details TEXT,
        duration TIME,
        frequency INT,
        airplane_type VARCHAR(50),
        price DECIMAL(10, 2),
        layover TEXT
    );"""
)

# insert some data into Routes and our vector table
db.tidb_vector_client.execute(
    """INSERT INTO airplan_routes (
        airport_code,
        airline_code,
        destination_code,
        route_details,
        duration,
        frequency,
        airplane_type,
        price,
        layover
    ) VALUES
    ('JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', '06:00:00', 5, 'Boeing 777', 299.99, 'None'),
    ('LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', '04:00:00', 3, 'Airbus A320', 149.99, 'None'),
    ('EFGH', 'UA', 'SEA', 'Daily flights from SFO to SEA.', '02:30:00', 7, 'Boeing 737', 129.99, 'None');
    """
)
db.add_texts(
    texts=[
        "Clean lounges and excellent vegetarian dining options. Highly recommended.",
        "Comfortable seating in lounge areas and diverse food selections, including vegetarian.",
        "Small airport with basic facilities.",
    ],
    metadatas=[
        {"airport_code": "JFK"},
        {"airport_code": "LAX"},
        {"airport_code": "EFGH"},
    ],
)
```

```output
[UUID('6dab390f-acd9-4c7d-b252-616606fbc89b'),
 UUID('9e811801-0e6b-4893-8886-60f4fb67ce69'),
 UUID('f426747c-0f7b-4c62-97ed-3eeb7c8dd76e')]
```

벡터 검색을 통해 깨끗한 시설과 채식 옵션이 있는 공항 찾기

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 3, "score_threshold": 0.85},
)
semantic_query = "Could you recommend a US airport with clean lounges and good vegetarian dining options?"
reviews = retriever.invoke(semantic_query)
for r in reviews:
    print("-" * 80)
    print(r.page_content)
    print(r.metadata)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Clean lounges and excellent vegetarian dining options. Highly recommended.
{'airport_code': 'JFK'}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Comfortable seating in lounge areas and diverse food selections, including vegetarian.
{'airport_code': 'LAX'}
--------------------------------------------------------------------------------
```

```python
# Extracting airport codes from the metadata
airport_codes = [review.metadata["airport_code"] for review in reviews]

# Executing a query to get the airport details
search_query = "SELECT * FROM airplan_routes WHERE airport_code IN :codes"
params = {"codes": tuple(airport_codes)}

airport_details = db.tidb_vector_client.execute(search_query, params)
airport_details.get("result")
```

```output
[(1, 'JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', datetime.timedelta(seconds=21600), 5, 'Boeing 777', Decimal('299.99'), 'None'),
 (2, 'LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', datetime.timedelta(seconds=14400), 3, 'Airbus A320', Decimal('149.99'), 'None')]
```

또는 단일 SQL 쿼리를 사용하여 이 검색을 한 단계로 간소화할 수 있습니다.

```python
search_query = f"""
    SELECT
        VEC_Cosine_Distance(se.embedding, :query_vector) as distance,
        ar.*,
        se.document as airport_review
    FROM
        airplan_routes ar
    JOIN
        {TABLE_NAME} se ON ar.airport_code = JSON_UNQUOTE(JSON_EXTRACT(se.meta, '$.airport_code'))
    ORDER BY distance ASC
    LIMIT 5;
"""
query_vector = embeddings.embed_query(semantic_query)
params = {"query_vector": str(query_vector)}
airport_details = db.tidb_vector_client.execute(search_query, params)
airport_details.get("result")
```

```output
[(0.1219207353407008, 1, 'JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', datetime.timedelta(seconds=21600), 5, 'Boeing 777', Decimal('299.99'), 'None', 'Clean lounges and excellent vegetarian dining options. Highly recommended.'),
 (0.14613754359804654, 2, 'LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', datetime.timedelta(seconds=14400), 3, 'Airbus A320', Decimal('149.99'), 'None', 'Comfortable seating in lounge areas and diverse food selections, including vegetarian.'),
 (0.19840519342700513, 3, 'EFGH', 'UA', 'SEA', 'Daily flights from SFO to SEA.', datetime.timedelta(seconds=9000), 7, 'Boeing 737', Decimal('129.99'), 'None', 'Small airport with basic facilities.')]
```

```python
# clean up
db.tidb_vector_client.execute("DROP TABLE airplan_routes")
```

```output
{'success': True, 'result': 0, 'error': None}
```

# 삭제

`.drop_vectorstore()` 메서드를 사용하여 TiDB 벡터 스토어를 제거할 수 있습니다.

```python
db.drop_vectorstore()
```
