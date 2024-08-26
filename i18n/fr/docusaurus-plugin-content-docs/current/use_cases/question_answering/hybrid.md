---
translated: true
---

# Recherche hybride

La recherche standard dans LangChain se fait par similarité vectorielle. Cependant, un certain nombre d'implémentations de vectorstores (Astra DB, ElasticSearch, Neo4J, AzureSearch, ...) prennent également en charge des techniques de recherche plus avancées combinant la recherche par similarité vectorielle et d'autres techniques de recherche (texte intégral, BM25, etc.). Cela est généralement appelé recherche "hybride".

**Étape 1 : Assurez-vous que le vectorstore que vous utilisez prend en charge la recherche hybride**

À l'heure actuelle, il n'y a pas de moyen unifié de réaliser une recherche hybride dans LangChain. Chaque vectorstore peut avoir sa propre manière de le faire. Cela est généralement exposé comme un argument de mot-clé qui est passé lors de `similarity_search`. En lisant la documentation ou le code source, découvrez si le vectorstore que vous utilisez prend en charge la recherche hybride et, le cas échéant, comment l'utiliser.

**Étape 2 : Ajoutez ce paramètre comme un champ configurable pour la chaîne**

Cela vous permettra d'appeler facilement la chaîne et de configurer tous les drapeaux pertinents au moment de l'exécution. Consultez [cette documentation](/docs/expression_language/primitives/configure) pour plus d'informations sur la configuration.

**Étape 3 : Appelez la chaîne avec ce champ configurable**

Maintenant, au moment de l'exécution, vous pouvez appeler cette chaîne avec le champ configurable.

## Exemple de code

Voyons un exemple concret de ce à quoi cela ressemble dans le code. Nous utiliserons l'interface Cassandra/CQL d'Astra DB pour cet exemple.

Installez le package Python suivant :

```python
!pip install "cassio>=0.1.7"
```

Obtenez les [secrets de connexion](https://docs.datastax.com/en/astra/astra-db-vector/get-started/quickstart.html).

Initialisez cassio :

```python
import cassio

cassio.init(
    database_id="Your database ID",
    token="Your application token",
    keyspace="Your key space",
)
```

Créez le VectorStore Cassandra avec un [index analyzer](https://docs.datastax.com/en/astra/astra-db-vector/cql/use-analyzers-with-cql.html) standard. L'index analyzer est nécessaire pour activer la correspondance de termes.

```python
from cassio.table.cql import STANDARD_ANALYZER
from langchain_community.vectorstores import Cassandra
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vectorstore = Cassandra(
    embedding=embeddings,
    table_name="test_hybrid",
    body_index_options=[STANDARD_ANALYZER],
    session=None,
    keyspace=None,
)

vectorstore.add_texts(
    [
        "In 2023, I visited Paris",
        "In 2022, I visited New York",
        "In 2021, I visited New Orleans",
    ]
)
```

Si nous effectuons une recherche de similarité standard, nous obtenons tous les documents :

```python
vectorstore.as_retriever().invoke("What city did I visit last?")
```

```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2023, I visited Paris'),
Document(page_content='In 2021, I visited New Orleans')]
```

L'argument `body_search` du vectorstore Astra DB peut être utilisé pour filtrer la recherche sur le terme `new`.

```python
vectorstore.as_retriever(search_kwargs={"body_search": "new"}).invoke(
    "What city did I visit last?"
)
```

```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2021, I visited New Orleans')]
```

Nous pouvons maintenant créer la chaîne que nous utiliserons pour faire de la question-réponse

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI
```

Il s'agit d'une chaîne de question-réponse de base.

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

Ici, nous marquons le récupérateur comme ayant un champ configurable. Tous les récupérateurs de vectorstore ont `search_kwargs` comme champ. Il s'agit simplement d'un dictionnaire, avec des champs spécifiques au vectorstore.

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

Nous pouvons maintenant créer la chaîne en utilisant notre récupérateur configurable.

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

```python
chain.invoke("What city did I visit last?")
```

```output
Paris
```

Nous pouvons maintenant invoquer la chaîne avec des options configurables. `search_kwargs` est l'identifiant du champ configurable. La valeur est les paramètres de recherche à utiliser pour Astra DB.

```python
chain.invoke(
    "What city did I visit last?",
    config={"configurable": {"search_kwargs": {"body_search": "new"}}},
)
```

```output
New York
```
