---
translated: true
---

# Apache Doris

>[Apache Doris](https://doris.apache.org/)は、リアルタイムのデータ分析に最適な現代的なデータウェアハウスです。
高速なリアルタイムデータ分析を実現します。

>通常、`Apache Doris`はOLAPに分類されており、[ClickBench — a Benchmark For Analytical DBMS](https://benchmark.clickhouse.com/)で優れたパフォーマンスを示しています。高速なベクトル化された実行エンジンを持っているため、高速なベクトルデータベースとしても使用できます。

ここでは、Apache Dorisベクトルストアの使用方法を示します。

## セットアップ

```python
%pip install --upgrade --quiet  pymysql
```

最初に `update_vectordb = False` を設定します。ドキュメントに更新がない場合は、ドキュメントの埋め込みを再構築する必要はありません。

```python
!pip install  sqlalchemy
!pip install langchain
```

```python
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import (
    DirectoryLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.vectorstores.apache_doris import (
    ApacheDoris,
    ApacheDorisSettings,
)
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import TokenTextSplitter

update_vectordb = False
```

## ドキュメントの読み込みとトークン化

`docs`ディレクトリ以下のすべてのMarkdownファイルを読み込みます。

Apache Dorisのドキュメントの場合は、https://github.com/apache/dorisからリポジトリをクローンし、`docs`ディレクトリがあります。

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

ドキュメントをトークン化し、新しいドキュメント/トークンがあるため、`update_vectordb = True`に設定します。

```python
# load text splitter and split docs into snippets of text
text_splitter = TokenTextSplitter(chunk_size=400, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# tell vectordb to update text embeddings
update_vectordb = True
```

split_docs[-20]

print("# docs  = %d, # splits = %d" % (len(documents), len(split_docs)))

## ベクトルデータベースのインスタンス作成

### Apache Dorisをベクトルデータベースとして使用する

```python
def gen_apache_doris(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = ApacheDoris.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = ApacheDoris(embeddings, settings)
    return docsearch
```

## トークンを埋め込みに変換し、ベクトルデータベースに格納する

ここでは、Apache Dorisをベクトルデータベースとして使用しています。`ApacheDorisSettings`を使ってApache Dorisインスタンスを設定できます。

Apache Dorisインスタンスの設定は、MySQLインスタンスの設定とよく似ています。以下を指定する必要があります:
1. ホスト/ポート
2. ユーザー名(デフォルト: 'root')
3. パスワード(デフォルト: '')
4. データベース(デフォルト: 'default')
5. テーブル(デフォルト: 'langchain')

```python
import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass()
```

```python
update_vectordb = True

embeddings = OpenAIEmbeddings()

# configure Apache Doris settings(host/port/user/pw/db)
settings = ApacheDorisSettings()
settings.port = 9030
settings.host = "172.30.34.130"
settings.username = "root"
settings.password = ""
settings.database = "langchain"
docsearch = gen_apache_doris(update_vectordb, embeddings, settings)

print(docsearch)

update_vectordb = False
```

## QAを構築し、質問に答える

```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "what is apache doris"
resp = qa.run(query)
print(resp)
```
