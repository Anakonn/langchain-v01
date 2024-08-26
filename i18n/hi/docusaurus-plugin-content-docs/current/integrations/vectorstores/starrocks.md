---
translated: true
---

# StarRocks

>[StarRocks](https://www.starrocks.io/) एक उच्च-प्रदर्शन विश्लेषणात्मक डेटाबेस है।
`StarRocks` एक अगली पीढ़ी का उप-सेकंड MPP डेटाबेस है जो पूर्ण विश्लेषण परिदृश्यों, बहु-आयामी विश्लेषण, रियल-टाइम विश्लेषण और एड-हॉक क्वेरी के लिए है।

>आमतौर पर `StarRocks` को OLAP में वर्गीकृत किया जाता है, और इसने [ClickBench — एक विश्लेषणात्मक DBMS के लिए बेंचमार्क](https://benchmark.clickhouse.com/) में उत्कृष्ट प्रदर्शन दिखाया है। चूंकि इसमें एक सुपर-तेज़ वेक्टराइज्ड कार्यान्वयन इंजन है, इसका उपयोग एक तेज़ वेक्टरडीबी के रूप में भी किया जा सकता है।

यहां हम StarRocks वेक्टर स्टोर का उपयोग करने का प्रदर्शन करेंगे।

## सेटअप

```python
%pip install --upgrade --quiet  pymysql
```

शुरू में `update_vectordb = False` सेट करें। यदि कोई नए दस्तावेज़ अपडेट नहीं हुए हैं, तो हमें दस्तावेज़ों के embeddings को फिर से बनाने की आवश्यकता नहीं है।

```python
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import (
    DirectoryLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.vectorstores import StarRocks
from langchain_community.vectorstores.starrocks import StarRocksSettings
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import TokenTextSplitter

update_vectordb = False
```

```output
/Users/dirlt/utils/py3env/lib/python3.9/site-packages/requests/__init__.py:102: RequestsDependencyWarning: urllib3 (1.26.7) or chardet (5.1.0)/charset_normalizer (2.0.9) doesn't match a supported version!
  warnings.warn("urllib3 ({}) or chardet ({})/charset_normalizer ({}) doesn't match a supported "
```

## दस्तावेज़ लोड करें और उन्हें टोकन में विभाजित करें

`docs` निर्देशिका के तहत सभी मार्कडाउन फ़ाइलों को लोड करें

StarRocks दस्तावेज़ों के लिए, आप https://github.com/StarRocks/starrocks से रेपो क्लोन कर सकते हैं, और इसमें `docs` निर्देशिका है।

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

दस्तावेज़ों को टोकन में विभाजित करें, और `update_vectordb = True` सेट करें क्योंकि नए दस्तावेज़/टोकन हैं।

```python
# load text splitter and split docs into snippets of text
text_splitter = TokenTextSplitter(chunk_size=400, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# tell vectordb to update text embeddings
update_vectordb = True
```

```python
split_docs[-20]
```

```output
Document(page_content='Compile StarRocks with Docker\n\nThis topic describes how to compile StarRocks using Docker.\n\nOverview\n\nStarRocks provides development environment images for both Ubuntu 22.04 and CentOS 7.9. With the image, you can launch a Docker container and compile StarRocks in the container.\n\nStarRocks version and DEV ENV image\n\nDifferent branches of StarRocks correspond to different development environment images provided on StarRocks Docker Hub.\n\nFor Ubuntu 22.04:\n\n| Branch name | Image name              |\n  | --------------- | ----------------------------------- |\n  | main            | starrocks/dev-env-ubuntu:latest     |\n  | branch-3.0      | starrocks/dev-env-ubuntu:3.0-latest |\n  | branch-2.5      | starrocks/dev-env-ubuntu:2.5-latest |\n\nFor CentOS 7.9:\n\n| Branch name | Image name                       |\n  | --------------- | ------------------------------------ |\n  | main            | starrocks/dev-env-centos7:latest     |\n  | branch-3.0      | starrocks/dev-env-centos7:3.0-latest |\n  | branch-2.5      | starrocks/dev-env-centos7:2.5-latest |\n\nPrerequisites\n\nBefore compiling StarRocks, make sure the following requirements are satisfied:\n\nHardware\n\n', metadata={'source': 'docs/developers/build-starrocks/Build_in_docker.md'})
```

```python
print("# docs  = %d, # splits = %d" % (len(documents), len(split_docs)))
```

```output
# docs  = 657, # splits = 2802
```

## वेक्टरडीबी इंस्टेंस बनाएं

### StarRocks को वेक्टरडीबी के रूप में उपयोग करें

```python
def gen_starrocks(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = StarRocks.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = StarRocks(embeddings, settings)
    return docsearch
```

## टोकन को embeddings में रूपांतरित करें और उन्हें वेक्टरडीबी में रखें

यहां हम StarRocks को वेक्टरडीबी के रूप में उपयोग कर रहे हैं, आप `StarRocksSettings` के माध्यम से StarRocks इंस्टेंस को कॉन्फ़िगर कर सकते हैं।

StarRocks इंस्टेंस को कॉन्फ़िगर करना mysql इंस्टेंस को कॉन्फ़िगर करने जैसा है। आपको निम्नलिखित को निर्दिष्ट करना होगा:
1. होस्ट/पोर्ट
2. उपयोगकर्ता नाम (डिफ़ॉल्ट: 'root')
3. पासवर्ड (डिफ़ॉल्ट: '')
4. डेटाबेस (डिफ़ॉल्ट: 'default')
5. टेबल (डिफ़ॉल्ट: 'langchain')

```python
embeddings = OpenAIEmbeddings()

# configure starrocks settings(host/port/user/pw/db)
settings = StarRocksSettings()
settings.port = 41003
settings.host = "127.0.0.1"
settings.username = "root"
settings.password = ""
settings.database = "zya"
docsearch = gen_starrocks(update_vectordb, embeddings, settings)

print(docsearch)

update_vectordb = False
```

```output
Inserting data...: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 2802/2802 [02:26<00:00, 19.11it/s]

[92m[1mzya.langchain @ 127.0.0.1:41003[0m

[1musername: root[0m

Table Schema:
----------------------------------------------------------------------------
|[94mname                    [0m|[96mtype                    [0m|[96mkey                     [0m|
----------------------------------------------------------------------------
|[94mid                      [0m|[96mvarchar(65533)          [0m|[96mtrue                    [0m|
|[94mdocument                [0m|[96mvarchar(65533)          [0m|[96mfalse                   [0m|
|[94membedding               [0m|[96marray<float>            [0m|[96mfalse                   [0m|
|[94mmetadata                [0m|[96mvarchar(65533)          [0m|[96mfalse                   [0m|
----------------------------------------------------------------------------
```

## QA बनाएं और उससे प्रश्न पूछें

```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "is profile enabled by default? if not, how to enable profile?"
resp = qa.run(query)
print(resp)
```

```output
 No, profile is not enabled by default. To enable profile, set the variable `enable_profile` to `true` using the command `set enable_profile = true;`
```
