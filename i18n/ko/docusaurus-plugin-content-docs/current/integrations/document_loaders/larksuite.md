---
translated: true
---

# LarkSuite (FeiShu)

>[LarkSuite](https://www.larksuite.com/)는 ByteDance가 개발한 기업 협업 플랫폼입니다.

이 노트북에서는 LangChain에 데이터를 수집할 수 있는 형식으로 `LarkSuite` REST API에서 데이터를 로드하는 방법과 텍스트 요약 사용 예제를 다룹니다.

LarkSuite API를 사용하려면 액세스 토큰(tenant_access_token 또는 user_access_token)이 필요합니다. API 세부 정보는 [LarkSuite 오픈 플랫폼 문서](https://open.larksuite.com/document)를 참조하세요.

```python
from getpass import getpass

from langchain_community.document_loaders.larksuite import (
    LarkSuiteDocLoader,
    LarkSuiteWikiLoader,
)

DOMAIN = input("larksuite domain")
ACCESS_TOKEN = getpass("larksuite tenant_access_token or user_access_token")
DOCUMENT_ID = input("larksuite document id")
```

## 문서에서 로드

```python
from pprint import pprint

larksuite_loader = LarkSuiteDocLoader(DOMAIN, ACCESS_TOKEN, DOCUMENT_ID)
docs = larksuite_loader.load()

pprint(docs)
```

```output
[Document(page_content='Test Doc\nThis is a Test Doc\n\n1\n2\n3\n\n', metadata={'document_id': 'V76kdbd2HoBbYJxdiNNccajunPf', 'revision_id': 11, 'title': 'Test Doc'})]
```

## Wiki에서 로드

```python
from pprint import pprint

DOCUMENT_ID = input("larksuite wiki id")
larksuite_loader = LarkSuiteWikiLoader(DOMAIN, ACCESS_TOKEN, DOCUMENT_ID)
docs = larksuite_loader.load()

pprint(docs)
```

```output
[Document(page_content='Test doc\nThis is a test wiki doc.\n', metadata={'document_id': 'TxOKdtMWaoSTDLxYS4ZcdEI7nwc', 'revision_id': 15, 'title': 'Test doc'})]
```

```python
# see https://python.langchain.com/docs/use_cases/summarization for more details
from langchain.chains.summarize import load_summarize_chain
from langchain_community.llms.fake import FakeListLLM

llm = FakeListLLM()
chain = load_summarize_chain(llm, chain_type="map_reduce")
chain.run(docs)
```
