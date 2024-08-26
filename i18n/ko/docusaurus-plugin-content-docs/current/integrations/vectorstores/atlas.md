---
translated: true
---

# 아틀라스

>[아틀라스](https://docs.nomic.ai/index.html)는 Nomic이 만든 플랫폼으로, 소규모 및 인터넷 규모의 비정형 데이터세트와 상호 작용할 수 있습니다. 이를 통해 누구나 브라우저에서 방대한 데이터세트를 시각화, 검색 및 공유할 수 있습니다.

이 노트북은 `AtlasDB` 벡터 저장소와 관련된 기능 사용 방법을 보여줍니다.

```python
%pip install --upgrade --quiet  spacy
```

```python
!python3 -m spacy download en_core_web_sm
```

```python
%pip install --upgrade --quiet  nomic
```

### 패키지 로드

```python
import time

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AtlasDB
from langchain_text_splitters import SpacyTextSplitter
```

```python
ATLAS_TEST_API_KEY = "7xDPkYXSYDc1_ErdTPIcoAR9RNd8YDlkS3nVNXcVoIMZ6"
```

### 데이터 준비

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = SpacyTextSplitter(separator="|")
texts = []
for doc in text_splitter.split_documents(documents):
    texts.extend(doc.page_content.split("|"))

texts = [e.strip() for e in texts]
```

### Nomic의 아틀라스를 사용하여 데이터 매핑

```python
db = AtlasDB.from_texts(
    texts=texts,
    name="test_index_" + str(time.time()),  # unique name for your vector store
    description="test_index",  # a description for your vector store
    api_key=ATLAS_TEST_API_KEY,
    index_kwargs={"build_topic_model": True},
)
```

```python
db.project.wait_for_project_lock()
```

```python
db.project
```

여기에 이 코드의 결과가 표시된 지도가 있습니다. 이 지도에는 국정 연설문의 텍스트가 표시됩니다.
https://atlas.nomic.ai/map/3e4de075-89ff-486a-845c-36c23f30bb67/d8ce2284-8edb-4050-8b9b-9bb543d7f647
