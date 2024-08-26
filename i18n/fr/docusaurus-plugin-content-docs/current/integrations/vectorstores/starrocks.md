---
translated: true
---

# StarRocks

>[StarRocks](https://www.starrocks.io/) est une base de données analytique haute performance.
`StarRocks` est une base de données MPP de nouvelle génération pour les scénarios d'analyse complète, y compris l'analyse multidimensionnelle, l'analyse en temps réel et les requêtes ad hoc.

>Généralement, `StarRocks` est classé dans la catégorie OLAP, et il a montré d'excellentes performances dans [ClickBench — un benchmark pour les SGBD analytiques](https://benchmark.clickhouse.com/). Comme il dispose d'un moteur d'exécution vectorisé super rapide, il peut également être utilisé comme une base de données vectorielle rapide.

Ici, nous allons montrer comment utiliser le stockage vectoriel de StarRocks.

## Configuration

```python
%pip install --upgrade --quiet  pymysql
```

Définissez `update_vectordb = False` au début. S'il n'y a pas de documents mis à jour, alors nous n'avons pas besoin de reconstruire les embeddings des documents.

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

## Charger les documents et les diviser en jetons

Chargez tous les fichiers markdown du répertoire `docs`

Pour les documents StarRocks, vous pouvez cloner le dépôt à partir de https://github.com/StarRocks/starrocks, et il y a un répertoire `docs` dedans.

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

Divisez les documents en jetons et définissez `update_vectordb = True` car il y a de nouveaux documents/jetons.

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

## Créer une instance de vectordb

### Utiliser StarRocks comme vectordb

```python
def gen_starrocks(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = StarRocks.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = StarRocks(embeddings, settings)
    return docsearch
```

## Convertir les jetons en embeddings et les placer dans le vectordb

Ici, nous utilisons StarRocks comme vectordb, vous pouvez configurer l'instance StarRocks via `StarRocksSettings`.

La configuration d'une instance StarRocks est assez similaire à la configuration d'une instance mysql. Vous devez spécifier :
1. hôte/port
2. nom d'utilisateur (par défaut : 'root')
3. mot de passe (par défaut : '')
4. base de données (par défaut : 'default')
5. table (par défaut : 'langchain')

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

## Construire un système de questions-réponses et poser une question

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
