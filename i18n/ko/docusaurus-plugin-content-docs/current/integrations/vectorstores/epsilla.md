---
translated: true
---

# 엡실라

>[엡실라](https://www.epsilla.com)는 벡터 인덱싱을 위한 고급 병렬 그래프 탐색 기술을 활용하는 오픈 소스 벡터 데이터베이스입니다. 엡실라는 GPL-3.0 라이선스 하에 배포됩니다.

이 노트북은 `엡실라` 벡터 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

전제 조건으로, 실행 중인 엡실라 벡터 데이터베이스(예: 우리의 Docker 이미지를 통해)와 `pyepsilla` 패키지가 설치되어 있어야 합니다. 전체 문서는 [docs](https://epsilla-inc.gitbook.io/epsilladb/quick-start)에서 확인할 수 있습니다.

```python
!pip/pip3 install pyepsilla
```

OpenAIEmbeddings를 사용하려면 OpenAI API 키가 필요합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

OpenAI API 키: ········

```python
from langchain_community.vectorstores import Epsilla
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0).split_documents(
    documents
)

embeddings = OpenAIEmbeddings()
```

엡실라 벡터 데이터베이스는 기본 호스트 "localhost"와 포트 "8888"으로 실행 중입니다. 기본 경로, 데이터베이스 이름 및 컬렉션 이름 대신 사용자 지정 경로, 데이터베이스 이름 및 컬렉션 이름을 사용합니다.

```python
from pyepsilla import vectordb

client = vectordb.Client()
vector_store = Epsilla.from_documents(
    documents,
    embeddings,
    client,
    db_path="/tmp/mypath",
    db_name="MyDB",
    collection_name="MyCollection",
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```

주 마다 새로운 법률이 통과되어 투표를 억압하고 전체 선거를 왜곡하고 있습니다.

우리는 이것을 허용할 수 없습니다.

오늘 밤, 나는 상원에 다음을 요청합니다: 투표의 자유법을 통과시키십시오. 존 루이스 투표권법을 통과시키십시오. 그리고 그 사이에 공개법을 통과시켜 미국인들이 우리 선거에 자금을 지원하는 사람들을 알 수 있게 하십시오.

오늘 밤, 나는 이 나라를 위해 평생 헌신해 온 한 분을 기리고 싶습니다: 스티븐 브레이어 대법관 - 육군 참전용사, 헌법 학자, 그리고 미국 대법원의 퇴임하는 대법관. 브레이어 대법관, 당신의 봉사에 감사드립니다.

대통령이 가진 가장 중요한 헌법적 책임 중 하나는 대법관 후보를 지명하는 것입니다.

그리고 나는 4일 전에 그렇게 했습니다. 연방항소법원 판사 케타니 브라운 잭슨을 지명했습니다. 그녀는 우리 나라의 최고 법률 전문가 중 한 명으로, 브레이어 대법관의 탁월한 유산을 이어갈 것입니다.
