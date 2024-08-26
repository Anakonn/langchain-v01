---
translated: true
---

# Oracle AI 벡터 검색: 문서 처리

Oracle AI 벡터 검색은 키워드가 아닌 의미에 기반하여 데이터를 쿼리할 수 있는 인공 지능(AI) 워크로드를 위해 설계되었습니다. Oracle AI 벡터 검색의 가장 큰 장점 중 하나는 비정형 데이터에 대한 의미 검색을 기업 데이터에 대한 관계형 검색과 단일 시스템에서 결합할 수 있다는 것입니다. 이는 강력할 뿐만 아니라 여러 시스템 간의 데이터 분절화 문제를 해결하여 훨씬 더 효과적입니다.

이 가이드는 Oracle AI 벡터 검색의 문서 처리 기능을 사용하여 OracleDocLoader와 OracleTextSplitter를 각각 사용하여 문서를 로드하고 청크화하는 방법을 보여줍니다.

### 사전 요구 사항

Oracle AI 벡터 검색과 함께 Langchain을 사용하려면 Oracle Python Client 드라이버를 설치해야 합니다.

```python
# pip install oracledb
```

### Oracle 데이터베이스에 연결하기

다음 샘플 코드는 Oracle 데이터베이스에 연결하는 방법을 보여줍니다.

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

이제 테이블을 만들고 테스트용 샘플 문서를 삽입해 보겠습니다.

```python
try:
    cursor = conn.cursor()

    drop_table_sql = """drop table if exists demo_tab"""
    cursor.execute(drop_table_sql)

    create_table_sql = """create table demo_tab (id number, data clob)"""
    cursor.execute(create_table_sql)

    insert_row_sql = """insert into demo_tab values (:1, :2)"""
    rows_to_insert = [
        (
            1,
            "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        ),
        (
            2,
            "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        ),
        (
            3,
            "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        ),
    ]
    cursor.executemany(insert_row_sql, rows_to_insert)

    conn.commit()

    print("Table created and populated.")
    cursor.close()
except Exception as e:
    print("Table creation failed.")
    cursor.close()
    conn.close()
    sys.exit(1)
```

### 문서 로드하기

사용자는 Oracle 데이터베이스, 파일 시스템 또는 둘 다에서 문서를 로드할 수 있습니다. 로더 매개변수를 적절히 설정하면 됩니다. 이러한 매개변수에 대한 전체 정보는 Oracle AI 벡터 검색 가이드북을 참조하십시오.

OracleDocLoader를 사용하는 주요 장점은 150개 이상의 다양한 파일 형식을 처리할 수 있다는 것입니다. 다양한 파일 형식에 대해 다른 유형의 로더를 사용할 필요가 없습니다. 지원되는 형식 목록은 다음과 같습니다: [Oracle Text 지원 문서 형식](https://docs.oracle.com/en/database/oracle/oracle-database/23/ccref/oracle-text-supported-document-formats.html)

다음 샘플 코드는 이를 수행하는 방법을 보여줍니다:

```python
from langchain_community.document_loaders.oracleai import OracleDocLoader
from langchain_core.documents import Document

"""
# loading a local file
loader_params = {}
loader_params["file"] = "<file>"

# loading from a local directory
loader_params = {}
loader_params["dir"] = "<directory>"
"""

# loading from Oracle Database table
loader_params = {
    "owner": "<owner>",
    "tablename": "demo_tab",
    "colname": "data",
}

""" load the docs """
loader = OracleDocLoader(conn=conn, params=loader_params)
docs = loader.load()

""" verify """
print(f"Number of docs loaded: {len(docs)}")
# print(f"Document-0: {docs[0].page_content}") # content
```

### 문서 분할하기

문서 크기는 작음, 중간, 큼 또는 매우 큼일 수 있습니다. 사용자는 임베딩을 생성하기 위해 문서를 더 작은 조각으로 분할/청크화하고 싶어 합니다. 사용자는 다양한 분할 사용자 정의를 수행할 수 있습니다. 이러한 매개변수에 대한 전체 정보는 Oracle AI 벡터 검색 가이드북을 참조하십시오.

다음 샘플 코드는 이를 수행하는 방법을 보여줍니다:

```python
from langchain_community.document_loaders.oracleai import OracleTextSplitter
from langchain_core.documents import Document

"""
# Some examples
# split by chars, max 500 chars
splitter_params = {"split": "chars", "max": 500, "normalize": "all"}

# split by words, max 100 words
splitter_params = {"split": "words", "max": 100, "normalize": "all"}

# split by sentence, max 20 sentences
splitter_params = {"split": "sentence", "max": 20, "normalize": "all"}
"""

# split by default parameters
splitter_params = {"normalize": "all"}

# get the splitter instance
splitter = OracleTextSplitter(conn=conn, params=splitter_params)

list_chunks = []
for doc in docs:
    chunks = splitter.split_text(doc.page_content)
    list_chunks.extend(chunks)

""" verify """
print(f"Number of Chunks: {len(list_chunks)}")
# print(f"Chunk-0: {list_chunks[0]}") # content
```

### 엔드 투 엔드 데모

Oracle AI 벡터 검색을 사용하여 RAG 파이프라인을 구축하는 완전한 데모 가이드는 [Oracle AI 벡터 검색 엔드 투 엔드 데모 가이드](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md)를 참조하십시오.
