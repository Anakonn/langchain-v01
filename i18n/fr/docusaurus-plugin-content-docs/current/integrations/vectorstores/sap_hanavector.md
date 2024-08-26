---
translated: true
---

# Moteur vectoriel SAP HANA Cloud

>[Moteur vectoriel SAP HANA Cloud](https://www.sap.com/events/teched/news-guide/ai.html#article8) est un magasin vectoriel entièrement intégré à la base de données `SAP HANA Cloud`.

## Configuration

Installation du pilote de base de données HANA.

```python
# Pip install necessary package
%pip install --upgrade --quiet  hdbcli
```

Pour `OpenAIEmbeddings`, nous utilisons la clé d'API OpenAI de l'environnement.

```python
import os
# Use OPENAI_API_KEY env variable
# os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
```

Créez une connexion de base de données à une instance HANA Cloud.

```python
from hdbcli import dbapi

# Use connection settings from the environment
connection = dbapi.connect(
    address=os.environ.get("HANA_DB_ADDRESS"),
    port=os.environ.get("HANA_DB_PORT"),
    user=os.environ.get("HANA_DB_USER"),
    password=os.environ.get("HANA_DB_PASSWORD"),
    autocommit=True,
    sslValidateCertificate=False,
)
```

## Exemple

Chargez le document d'exemple "state_of_the_union.txt" et créez des fragments à partir de celui-ci.

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hanavector import HanaDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
text_chunks = text_splitter.split_documents(text_documents)
print(f"Number of document chunks: {len(text_chunks)}")

embeddings = OpenAIEmbeddings()
```

Créez une interface de magasin vectoriel LangChain pour la base de données HANA et spécifiez la table (collection) à utiliser pour accéder aux vecteurs d'intégration.

```python
db = HanaDB(
    embedding=embeddings, connection=connection, table_name="STATE_OF_THE_UNION"
)
```

Ajoutez les fragments de document chargés à la table. Pour cet exemple, nous supprimons tout contenu précédent de la table qui pourrait exister à partir d'exécutions précédentes.

```python
# Delete already existing documents from the table
db.delete(filter={})

# add the loaded document chunks
db.add_documents(text_chunks)
```

Effectuez une requête pour obtenir les deux fragments de document les mieux correspondants parmi ceux qui ont été ajoutés à l'étape précédente.
Par défaut, la "similarité cosinus" est utilisée pour la recherche.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)

for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

Interrogez le même contenu avec la "distance euclidienne". Les résultats devraient être les mêmes qu'avec la "similarité cosinus".

```python
from langchain_community.vectorstores.utils import DistanceStrategy

db = HanaDB(
    embedding=embeddings,
    connection=connection,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
    table_name="STATE_OF_THE_UNION",
)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## Recherche de pertinence marginale maximale (MMR)

`Pertinence marginale maximale` optimise la similarité avec la requête ET la diversité parmi les documents sélectionnés. Les 20 premiers (fetch_k) éléments seront récupérés de la base de données. L'algorithme MMR trouvera ensuite les 2 (k) meilleures correspondances.

```python
docs = db.max_marginal_relevance_search(query, k=2, fetch_k=20)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## Opérations de base du magasin vectoriel

```python
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_BASIC"
)

# Delete already existing documents from the table
db.delete(filter={})
```

Nous pouvons ajouter de simples documents texte à la table existante.

```python
docs = [Document(page_content="Some text"), Document(page_content="Other docs")]
db.add_documents(docs)
```

Ajoutez des documents avec des métadonnées.

```python
docs = [
    Document(
        page_content="foo",
        metadata={"start": 100, "end": 150, "doc_name": "foo.txt", "quality": "bad"},
    ),
    Document(
        page_content="bar",
        metadata={"start": 200, "end": 250, "doc_name": "bar.txt", "quality": "good"},
    ),
]
db.add_documents(docs)
```

Interroger des documents avec des métadonnées spécifiques.

```python
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
# With filtering on "quality"=="bad", only one document should be returned
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

Supprimer des documents avec des métadonnées spécifiques.

```python
db.delete(filter={"quality": "bad"})

# Now the similarity search with the same filter will return no results
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
print(len(docs))
```

## Filtrage avancé

En plus des capacités de filtrage de base basées sur les valeurs, il est possible d'utiliser un filtrage plus avancé.
Le tableau ci-dessous montre les opérateurs de filtre disponibles.

| Opérateur | Sémantique                 |
|----------|-------------------------|
| `$eq`    | Égalité (==)           |
| `$ne`    | Inégalité (!=)         |
| `$lt`    | Inférieur à (<)           |
| `$lte`   | Inférieur ou égal à (<=) |
| `$gt`    | Supérieur à (>)        |
| `$gte`   | Supérieur ou égal à (>=) |
| `$in`    | Contenu dans un ensemble de valeurs données  (in)    |
| `$nin`   | Non contenu dans un ensemble de valeurs données  (not in)  |
| `$between` | Entre la plage de deux valeurs limites |
| `$like`  | Égalité de texte basée sur la sémantique "LIKE" en SQL (en utilisant "%" comme caractère générique)  |
| `$and`   | "Et" logique, prenant en charge 2 opérandes ou plus |
| `$or`    | "Ou" logique, prenant en charge 2 opérandes ou plus |

```python
# Prepare some test documents
docs = [
    Document(
        page_content="First",
        metadata={"name": "adam", "is_active": True, "id": 1, "height": 10.0},
    ),
    Document(
        page_content="Second",
        metadata={"name": "bob", "is_active": False, "id": 2, "height": 5.7},
    ),
    Document(
        page_content="Third",
        metadata={"name": "jane", "is_active": True, "id": 3, "height": 2.4},
    ),
]

db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_ADVANCED_FILTER",
)

# Delete already existing documents from the table
db.delete(filter={})
db.add_documents(docs)


# Helper function for printing filter results
def print_filter_result(result):
    if len(result) == 0:
        print("<empty result>")
    for doc in result:
        print(doc.metadata)
```

Filtrage avec `$ne`, `$gt`, `$gte`, `$lt`, `$lte`

```python
advanced_filter = {"id": {"$ne": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$gt": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$gte": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$lt": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$lte": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

Filtrage avec `$between`, `$in`, `$nin`

```python
advanced_filter = {"id": {"$between": (1, 2)}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$in": ["adam", "bob"]}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$nin": ["adam", "bob"]}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

Filtrage de texte avec `$like`

```python
advanced_filter = {"name": {"$like": "a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$like": "%a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

Filtrage combiné avec `$and`, `$or`

```python
advanced_filter = {"$or": [{"id": 1}, {"name": "bob"}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"$and": [{"id": 1}, {"id": 2}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"$or": [{"id": 1}, {"id": 2}, {"id": 3}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

## Utilisation d'un VectorStore comme récupérateur dans les chaînes pour la génération augmentée par la récupération (RAG)

```python
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI

# Access the vector DB with a new table
db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_RETRIEVAL_CHAIN",
)

# Delete already existing entries from the table
db.delete(filter={})

# add the loaded document chunks from the "State Of The Union" file
db.add_documents(text_chunks)

# Create a retriever instance of the vector store
retriever = db.as_retriever()
```

Définir l'invite.

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """
You are an expert in state of the union topics. You are provided multiple context items that are related to the prompt you have to answer.
Use the following pieces of context to answer the question at the end.

\```

{context}

\```

Question: {question}
"""

PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
chain_type_kwargs = {"prompt": PROMPT}
```

Créer la ConversationalRetrievalChain, qui gère l'historique de la conversation et la récupération des fragments de documents similaires à ajouter à l'invite.

```python
from langchain.chains import ConversationalRetrievalChain

llm = ChatOpenAI(model="gpt-3.5-turbo")
memory = ConversationBufferMemory(
    memory_key="chat_history", output_key="answer", return_messages=True
)
qa_chain = ConversationalRetrievalChain.from_llm(
    llm,
    db.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    memory=memory,
    verbose=False,
    combine_docs_chain_kwargs={"prompt": PROMPT},
)
```

Poser la première question (et vérifier combien de fragments de texte ont été utilisés).

```python
question = "What about Mexico and Guatemala?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])

source_docs = result["source_documents"]
print("================")
print(f"Number of used source document chunks: {len(source_docs)}")
```

Examiner en détail les fragments utilisés de la chaîne. Vérifier si le fragment le mieux classé contient des informations sur "le Mexique et le Guatemala" comme mentionné dans la question.

```python
for doc in source_docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

Poser une autre question sur la même chaîne conversationnelle. La réponse devrait être liée à la réponse précédente donnée.

```python
question = "What about other countries?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])
```

## Tables standard vs. tables "personnalisées" avec des données vectorielles

Par défaut, la table pour les intégrations est créée avec 3 colonnes :

- Une colonne `VEC_TEXT`, qui contient le texte du document
- Une colonne `VEC_META`, qui contient les métadonnées du document
- Une colonne `VEC_VECTOR`, qui contient le vecteur d'intégration du texte du document

```python
# Access the vector DB with a new table
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_NEW_TABLE"
)

# Delete already existing entries from the table
db.delete(filter={})

# Add a simple document with some metadata
docs = [
    Document(
        page_content="A simple document",
        metadata={"start": 100, "end": 150, "doc_name": "simple.txt"},
    )
]
db.add_documents(docs)
```

Afficher les colonnes dans la table "LANGCHAIN_DEMO_NEW_TABLE"

```python
cur = connection.cursor()
cur.execute(
    "SELECT COLUMN_NAME, DATA_TYPE_NAME FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = CURRENT_SCHEMA AND TABLE_NAME = 'LANGCHAIN_DEMO_NEW_TABLE'"
)
rows = cur.fetchall()
for row in rows:
    print(row)
cur.close()
```

Afficher la valeur du document inséré dans les trois colonnes

```python
cur = connection.cursor()
cur.execute(
    "SELECT VEC_TEXT, VEC_META, TO_NVARCHAR(VEC_VECTOR) FROM LANGCHAIN_DEMO_NEW_TABLE LIMIT 1"
)
rows = cur.fetchall()
print(rows[0][0])  # The text
print(rows[0][1])  # The metadata
print(rows[0][2])  # The vector
cur.close()
```

Les tables personnalisées doivent avoir au moins trois colonnes qui correspondent à la sémantique d'une table standard

- Une colonne de type `NCLOB` ou `NVARCHAR` pour le texte/contexte des intégrations
- Une colonne de type `NCLOB` ou `NVARCHAR` pour les métadonnées
- Une colonne de type `REAL_VECTOR` pour le vecteur d'intégration

La table peut contenir des colonnes supplémentaires. Lorsque de nouveaux documents sont insérés dans la table, ces colonnes supplémentaires doivent autoriser les valeurs NULL.

```python
# Create a new table "MY_OWN_TABLE" with three "standard" columns and one additional column
my_own_table_name = "MY_OWN_TABLE"
cur = connection.cursor()
cur.execute(
    (
        f"CREATE TABLE {my_own_table_name} ("
        "SOME_OTHER_COLUMN NVARCHAR(42), "
        "MY_TEXT NVARCHAR(2048), "
        "MY_METADATA NVARCHAR(1024), "
        "MY_VECTOR REAL_VECTOR )"
    )
)

# Create a HanaDB instance with the own table
db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name=my_own_table_name,
    content_column="MY_TEXT",
    metadata_column="MY_METADATA",
    vector_column="MY_VECTOR",
)

# Add a simple document with some metadata
docs = [
    Document(
        page_content="Some other text",
        metadata={"start": 400, "end": 450, "doc_name": "other.txt"},
    )
]
db.add_documents(docs)

# Check if data has been inserted into our own table
cur.execute(f"SELECT * FROM {my_own_table_name} LIMIT 1")
rows = cur.fetchall()
print(rows[0][0])  # Value of column "SOME_OTHER_DATA". Should be NULL/None
print(rows[0][1])  # The text
print(rows[0][2])  # The metadata
print(rows[0][3])  # The vector

cur.close()
```

Ajoutez un autre document et effectuez une recherche de similarité sur la table personnalisée.

```python
docs = [
    Document(
        page_content="Some more text",
        metadata={"start": 800, "end": 950, "doc_name": "more.txt"},
    )
]
db.add_documents(docs)

query = "What's up?"
docs = db.similarity_search(query, k=2)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```
