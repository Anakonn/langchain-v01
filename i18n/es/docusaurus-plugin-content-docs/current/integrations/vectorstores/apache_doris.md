---
translated: true
---

# Apache Doris

>[Apache Doris](https://doris.apache.org/) es un almacén de datos moderno para análisis en tiempo real.
Ofrece análisis ultrarrápidos en datos en tiempo real a gran escala.

>Normalmente `Apache Doris` se categoriza en OLAP y ha mostrado un rendimiento excelente en [ClickBench — a Benchmark For Analytical DBMS](https://benchmark.clickhouse.com/). Dado que tiene un motor de ejecución vectorial súper rápido, también podría usarse como un vectordb rápido.

Aquí mostraremos cómo usar el Apache Doris Vector Store.

## Configuración

```python
%pip install --upgrade --quiet  pymysql
```

Establezca `update_vectordb = False` al principio. Si no hay documentos actualizados, entonces no necesitamos reconstruir los embeddings de los documentos.

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

## Cargar documentos y dividirlos en tokens

Cargue todos los archivos markdown bajo el directorio `docs`

para los documentos de Apache Doris, puede clonar el repositorio desde https://github.com/apache/doris, y hay un directorio `docs` en él.

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

Divida los documentos en tokens, y establezca `update_vectordb = True` porque hay nuevos documentos/tokens.

```python
# load text splitter and split docs into snippets of text
text_splitter = TokenTextSplitter(chunk_size=400, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# tell vectordb to update text embeddings
update_vectordb = True
```

split_docs[-20]

print("# documentos = %d, # divisiones = %d" % (len(documents), len(split_docs)))

## Crear instancia de vectordb

### Usar Apache Doris como vectordb

```python
def gen_apache_doris(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = ApacheDoris.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = ApacheDoris(embeddings, settings)
    return docsearch
```

## Convertir tokens en embeddings y ponerlos en vectordb

Aquí usamos Apache Doris como vectordb, puede configurar la instancia de Apache Doris a través de `ApacheDorisSettings`.

Configurar la instancia de Apache Doris es muy parecido a configurar una instancia de mysql. Necesita especificar:
1. host/port
2. username(por defecto: 'root')
3. password(por defecto: '')
4. database(por defecto: 'default')
5. table(por defecto: 'langchain')

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

## Construir QA y hacerle una pregunta

```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "what is apache doris"
resp = qa.run(query)
print(resp)
```
