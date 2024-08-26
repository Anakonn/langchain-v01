---
translated: true
---

# Apache Doris

>[Apache Doris](https://doris.apache.org/) est un entrepôt de données moderne pour l'analyse en temps réel.
Il offre une analyse ultra-rapide sur des données en temps réel à grande échelle.

>Généralement, `Apache Doris` est classé dans la catégorie OLAP, et il a montré d'excellentes performances dans [ClickBench — un benchmark pour les SGBD analytiques](https://benchmark.clickhouse.com/). Étant donné qu'il dispose d'un moteur d'exécution vectorisé super rapide, il peut également être utilisé comme une base de données vectorielle rapide.

Nous allons vous montrer comment utiliser le Apache Doris Vector Store.

## Configuration

```python
%pip install --upgrade --quiet  pymysql
```

Définissez `update_vectordb = False` au début. S'il n'y a pas de documents mis à jour, alors nous n'avons pas besoin de reconstruire les embeddings des documents.

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

## Charger les documents et les diviser en jetons

Chargez tous les fichiers markdown du répertoire `docs`

Pour les documents Apache Doris, vous pouvez cloner le dépôt à partir de https://github.com/apache/doris, et il y a un répertoire `docs` dedans.

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

Divisez les documents en jetons, et définissez `update_vectordb = True` car il y a de nouveaux documents/jetons.

```python
# load text splitter and split docs into snippets of text
text_splitter = TokenTextSplitter(chunk_size=400, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# tell vectordb to update text embeddings
update_vectordb = True
```

split_docs[-20]

print("# docs  = %d, # splits = %d" % (len(documents), len(split_docs)))

## Créer une instance de vectordb

### Utiliser Apache Doris comme vectordb

```python
def gen_apache_doris(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = ApacheDoris.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = ApacheDoris(embeddings, settings)
    return docsearch
```

## Convertir les jetons en embeddings et les placer dans le vectordb

Ici, nous utilisons Apache Doris comme vectordb, vous pouvez configurer l'instance Apache Doris via `ApacheDorisSettings`.

La configuration d'une instance Apache Doris est assez similaire à la configuration d'une instance mysql. Vous devez spécifier :
1. hôte/port
2. nom d'utilisateur (par défaut : 'root')
3. mot de passe (par défaut : '')
4. base de données (par défaut : 'default')
5. table (par défaut : 'langchain')

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

## Construire un système de questions-réponses et poser des questions

```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "what is apache doris"
resp = qa.run(query)
print(resp)
```
