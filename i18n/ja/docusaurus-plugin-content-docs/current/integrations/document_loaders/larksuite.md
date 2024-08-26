---
translated: true
---

# LarkSuite (FeiShu)

>[LarkSuite](https://www.larksuite.com/)は ByteDance が開発したエンタープライズ コラボレーション プラットフォームです。

このノートブックでは、LangChain に取り込むことができる形式でデータを `LarkSuite` REST API から読み込む方法と、テキスト要約の使用例について説明します。

LarkSuite API を使用するには、アクセス トークン (tenant_access_token または user_access_token) が必要です。API の詳細については、[LarkSuite オープン プラットフォーム ドキュメント](https://open.larksuite.com/document)を参照してください。

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

## ドキュメントから読み込む

```python
from pprint import pprint

larksuite_loader = LarkSuiteDocLoader(DOMAIN, ACCESS_TOKEN, DOCUMENT_ID)
docs = larksuite_loader.load()

pprint(docs)
```

```output
[Document(page_content='Test Doc\nThis is a Test Doc\n\n1\n2\n3\n\n', metadata={'document_id': 'V76kdbd2HoBbYJxdiNNccajunPf', 'revision_id': 11, 'title': 'Test Doc'})]
```

## Wikiから読み込む

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
