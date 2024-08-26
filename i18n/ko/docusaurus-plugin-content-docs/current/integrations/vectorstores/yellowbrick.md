---
translated: true
---

# 옐로브릭

[옐로브릭](https://yellowbrick.com/yellowbrick-data-warehouse/)은 쿠버네티스를 사용하여 확장성, 복원력 및 클라우드 이식성을 제공하는 클라우드 및 온-프레미스에서 실행되는 탄력적이고 대규모로 병렬 처리되는 SQL 데이터베이스입니다. 옐로브릭은 가장 큰 규모와 가장 복잡한 비즈니스 핵심 데이터 웨어하우징 사용 사례를 해결하도록 설계되었습니다. 옐로브릭이 제공하는 규모 효율성으로 인해 벡터 데이터베이스로도 사용될 수 있어 SQL로 벡터를 저장하고 검색할 수 있습니다.

## ChatGpt의 벡터 저장소로 옐로브릭 사용하기

이 자습서에서는 옐로브릭을 벡터 저장소로 사용하여 ChatGpt와 통합된 간단한 채팅봇을 만드는 방법을 보여줍니다. 필요한 것:

1. [옐로브릭 샌드박스](https://cloudlabs.yellowbrick.com/)의 계정
2. [OpenAI](https://platform.openai.com/)의 API 키

이 자습서는 5부로 나뉩니다. 먼저 langchain을 사용하여 벡터 저장소 없이 ChatGpt와 상호 작용하는 기본 채팅봇을 만듭니다. 둘째, 옐로브릭에 임베딩 테이블을 만듭니다. 셋째, 문서(옐로브릭 매뉴얼의 관리 장)를 로드합니다. 넷째, 이 문서의 벡터 표현을 만들어 옐로브릭 테이블에 저장합니다. 마지막으로 동일한 쿼리를 향상된 채팅 상자에 보내 결과를 확인합니다.

```python
# Install all needed libraries
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

## 설정: 옐로브릭 및 OpenAI API 연결에 사용되는 정보 입력

우리의 채팅봇은 langchain 라이브러리를 통해 ChatGpt와 통합되므로 먼저 OpenAI에서 API 키를 받아야 합니다:

OpenAI API 키를 받는 방법:
1. https://platform.openai.com/에서 등록
2. 결제 수단 추가 - 무료 할당량을 초과할 가능성은 낮습니다.
3. API 키 생성

또한 옐로브릭 샌드박스 계정 가입 시 받은 환영 이메일의 사용자 이름, 비밀번호 및 데이터베이스 이름이 필요합니다.

다음 코드는 귀하의 옐로브릭 데이터베이스 및 OpenAPI 키 정보로 수정되어야 합니다.

```python
# Modify these values to match your Yellowbrick Sandbox and OpenAI API Key
YBUSER = "[SANDBOX USER]"
YBPASSWORD = "[SANDBOX PASSWORD]"
YBDATABASE = "[SANDBOX_DATABASE]"
YBHOST = "trialsandbox.sandbox.aws.yellowbrickcloud.com"

OPENAI_API_KEY = "[OPENAI API KEY]"
```

```python
# Import libraries and setup keys / login info
import os
import pathlib
import re
import sys
import urllib.parse as urlparse
from getpass import getpass

import psycopg2
from IPython.display import Markdown, display
from langchain.chains import LLMChain, RetrievalQAWithSourcesChain
from langchain.schema import Document
from langchain_community.vectorstores import Yellowbrick
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Establish connection parameters to Yellowbrick.  If you've signed up for Sandbox, fill in the information from your welcome mail here:
yellowbrick_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YBDATABASE}"
)

YB_DOC_DATABASE = "sample_data"
YB_DOC_TABLE = "yellowbrick_documentation"
embedding_table = "my_embeddings"

# API Key for OpenAI.  Signup at https://platform.openai.com
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```

## Part 1: 벡터 저장소 없이 ChatGpt로 백업된 기본 채팅봇 만들기

langchain을 사용하여 ChatGPT를 쿼리합니다. 벡터 저장소가 없으므로 ChatGPT는 질문에 대한 컨텍스트가 없습니다.

```python
# Set up the chat model and specific prompt
system_template = """If you don't know the answer, Make up your best guess."""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=False,
)


def print_result_simple(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['text']}
    """
    display(Markdown(output_text))


# Use the chain to query
print_result_simple("How many databases can be in a Yellowbrick Instance?")

print_result_simple("What's an easy way to add users in bulk to Yellowbrick?")
```

## Part 2: 옐로브릭에 연결하고 임베딩 테이블 만들기

문서 임베딩을 옐로브릭에 로드하려면 이를 저장할 자체 테이블을 만들어야 합니다. 테이블이 포함된 옐로브릭 데이터베이스가 UTF-8로 인코딩되어야 합니다.

다음 스키마를 사용하여 UTF-8 데이터베이스에 테이블을 만드세요. 테이블 이름은 선택하세요:

```python
# Establish a connection to the Yellowbrick database
try:
    conn = psycopg2.connect(yellowbrick_connection_string)
except psycopg2.Error as e:
    print(f"Error connecting to the database: {e}")
    exit(1)

# Create a cursor object using the connection
cursor = conn.cursor()

# Define the SQL statement to create a table
create_table_query = f"""
CREATE TABLE IF NOT EXISTS {embedding_table} (
    doc_id uuid NOT NULL,
    embedding_id smallint NOT NULL,
    embedding double precision NOT NULL
)
DISTRIBUTE ON (doc_id);
truncate table {embedding_table};
"""

# Execute the SQL query to create a table
try:
    cursor.execute(create_table_query)
    print(f"Table '{embedding_table}' created successfully!")
except psycopg2.Error as e:
    print(f"Error creating table: {e}")
    conn.rollback()

# Commit changes and close the cursor and connection
conn.commit()
cursor.close()
conn.close()
```

## Part 3: 옐로브릭의 기존 테이블에서 인덱싱할 문서 추출

기존 옐로브릭 테이블에서 문서 경로와 내용을 추출합니다. 다음 단계에서 이 문서를 사용하여 임베딩을 만듭니다.

```python
yellowbrick_doc_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YB_DOC_DATABASE}"
)

print(yellowbrick_doc_connection_string)

# Establish a connection to the Yellowbrick database
conn = psycopg2.connect(yellowbrick_doc_connection_string)

# Create a cursor object
cursor = conn.cursor()

# Query to select all documents from the table
query = f"SELECT path, document FROM {YB_DOC_TABLE}"

# Execute the query
cursor.execute(query)

# Fetch all documents
yellowbrick_documents = cursor.fetchall()

print(f"Extracted {len(yellowbrick_documents)} documents successfully!")

# Close the cursor and connection
cursor.close()
conn.close()
```

## Part 4: 옐로브릭 벡터 저장소에 문서 로드

문서를 처리 가능한 청크로 나누고, 임베딩을 만들어 옐로브릭 테이블에 삽입합니다. 이 작업에는 약 5분이 소요됩니다.

```python
# Split documents into chunks for conversion to embeddings
DOCUMENT_BASE_URL = "https://docs.yellowbrick.com/6.7.1/"  # Actual URL


separator = "\n## "  # This separator assumes Markdown docs from the repo uses ### as logical main header most of the time
chunk_size_limit = 2000
max_chunk_overlap = 200

documents = [
    Document(
        page_content=document[1],
        metadata={"source": DOCUMENT_BASE_URL + document[0].replace(".md", ".html")},
    )
    for document in yellowbrick_documents
]

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size_limit,
    chunk_overlap=max_chunk_overlap,
    separators=[separator, "\nn", "\n", ",", " ", ""],
)
split_docs = text_splitter.split_documents(documents)

docs_text = [doc.page_content for doc in split_docs]

embeddings = OpenAIEmbeddings()
vector_store = Yellowbrick.from_documents(
    documents=split_docs,
    embedding=embeddings,
    connection_info=yellowbrick_connection_string,
    table=embedding_table,
)

print(f"Created vector store with {len(documents)} documents")
```

## Part 5: 옐로브릭을 벡터 저장소로 사용하는 채팅봇 만들기

다음으로 옐로브릭을 벡터 저장소로 추가합니다. 벡터 저장소에는 옐로브릭 제품 설명서의 관리 장에 대한 임베딩이 포함되어 있습니다.

위와 동일한 쿼리를 보내 향상된 응답을 확인합니다.

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## Part 6: 성능 향상을 위한 인덱스 도입

옐로브릭은 Locality-Sensitive Hashing 접근 방식을 사용하여 인덱싱도 지원합니다. 이는 근사 최근접 이웃 검색 기술이며, 정확도를 희생하여 유사성 검색 시간을 줄일 수 있습니다. 인덱스에는 두 개의 새로운 조정 가능한 매개변수가 도입됩니다:

- 하이퍼플레인 수는 `create_lsh_index(num_hyperplanes)`의 인수로 제공됩니다. 문서 수가 많을수록 더 많은 하이퍼플레인이 필요합니다. LSH는 차원 축소의 한 형태입니다. 원래 임베딩은 하이퍼플레인 수와 동일한 구성 요소 수를 가진 더 낮은 차원 벡터로 변환됩니다.
- Hamming 거리는 검색 범위를 나타내는 정수입니다. Hamming 거리가 작을수록 검색 속도가 빨라지지만 정확도가 낮아집니다.

옐로브릭에 로드한 임베딩에 대한 인덱스를 생성하는 방법은 다음과 같습니다. 이번에는 인덱스를 사용하여 이전 채팅 세션을 다시 실행합니다. 이렇게 작은 문서 수에서는 인덱싱의 성능 이점을 보기 어려울 것입니다.

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

lsh_params = Yellowbrick.IndexParams(
    Yellowbrick.IndexType.LSH, {"num_hyperplanes": 8, "hamming_distance": 2}
)
vector_store.create_index(lsh_params)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(
        k=5, search_kwargs={"index_params": lsh_params}
    ),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## 다음 단계:

이 코드를 수정하여 다른 질문을 할 수 있습니다. 또한 자신의 문서를 벡터 저장소에 로드할 수 있습니다. langchain 모듈은 매우 유연하며 HTML, PDF 등 다양한 파일 형식을 구문 분석할 수 있습니다.

Hugging Face 임베딩 모델과 Meta의 Llama 2 LLM을 사용하여 완전히 프라이빗한 채팅 상자 경험을 만들도록 수정할 수도 있습니다.
