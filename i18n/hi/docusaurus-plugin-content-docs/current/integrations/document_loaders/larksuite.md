---
translated: true
---

# LarkSuite (FeiShu)

>[LarkSuite](https://www.larksuite.com/) एक ByteDance द्वारा विकसित एक उद्यम सहयोग प्लेटफ़ॉर्म है।

यह नोटबुक `LarkSuite` REST API से डेटा को लोड करने और उसे LangChain में इंजेस्ट करने के लिए प्रारूप में लाने, साथ ही पाठ सारांशीकरण के लिए उदाहरण उपयोग को कवर करता है।

LarkSuite API को एक एक्सेस टोकन (tenant_access_token या user_access_token) की आवश्यकता होती है, API विवरण के लिए [LarkSuite खुला प्लेटफ़ॉर्म दस्तावेज](https://open.larksuite.com/document) देखें।

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

## दस्तावेज से लोड करें

```python
from pprint import pprint

larksuite_loader = LarkSuiteDocLoader(DOMAIN, ACCESS_TOKEN, DOCUMENT_ID)
docs = larksuite_loader.load()

pprint(docs)
```

```output
[Document(page_content='Test Doc\nThis is a Test Doc\n\n1\n2\n3\n\n', metadata={'document_id': 'V76kdbd2HoBbYJxdiNNccajunPf', 'revision_id': 11, 'title': 'Test Doc'})]
```

## विकि से लोड करें

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
