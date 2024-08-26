---
translated: true
---

# StarRocks

>[StarRocks](https://www.starrocks.io/)は高性能な分析データベースです。
`StarRocks`は、マルチディメンション分析、リアルタイム分析、アドホック クエリなどのフル分析シナリオに対応する次世代のサブセカンド MPP データベースです。

>通常、`StarRocks`はOLAPに分類されており、[ClickBench — a Benchmark For Analytical DBMS](https://benchmark.clickhouse.com/)で優れたパフォーマンスを示しています。ベクトル化された高速な実行エンジンを持っているため、高速なベクトルデータベースとしても使用できます。

ここでは、StarRocksベクトルストアの使用方法を示します。

## セットアップ

```python
%pip install --upgrade --quiet  pymysql
```

最初に `update_vectordb = False` を設定します。ドキュメントに更新がない場合は、ドキュメントの埋め込みを再構築する必要はありません。

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

## ドキュメントの読み込みとトークン化

`docs`ディレクトリ内のすべてのMarkdownファイルを読み込みます。

StarRocksのドキュメントの場合は、https://github.com/StarRocks/starrocks からリポジトリをクローンし、`docs`ディレクトリがあります。

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

ドキュメントをトークン化し、新しいドキュメント/トークンがあるため `update_vectordb = True` に設定します。

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

## ベクトルデータベースのインスタンス作成

### StarRocksをベクトルデータベースとして使用する

```python
def gen_starrocks(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = StarRocks.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = StarRocks(embeddings, settings)
    return docsearch
```

## トークンを埋め込みに変換し、ベクトルデータベースに格納する

ここでは StarRocks をベクトルデータベースとして使用しています。`StarRocksSettings`を使ってStarRocksインスタンスを構成できます。

StarRocksインスタンスの構成は、MySQLインスタンスの構成とよく似ています。以下を指定する必要があります:
1. ホスト/ポート
2. ユーザー名(デフォルト: 'root')
3. パスワード(デフォルト: '')
4. データベース(デフォルト: 'default')
5. テーブル(デフォルト: 'langchain')

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

## QAを構築し、質問に答える

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
