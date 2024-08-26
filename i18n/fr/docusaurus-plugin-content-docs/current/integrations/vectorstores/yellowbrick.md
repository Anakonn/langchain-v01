---
translated: true
---

# Yellowbrick

[Yellowbrick](https://yellowbrick.com/yellowbrick-data-warehouse/) est une base de données SQL élastique et massivement parallèle (MPP) qui s'exécute dans le cloud et sur site, en utilisant kubernetes pour la mise à l'échelle, la résilience et la portabilité cloud. Yellowbrick est conçu pour répondre aux plus grands et aux plus complexes cas d'utilisation de l'entreposage de données critiques pour l'entreprise. L'efficacité à l'échelle que fournit Yellowbrick lui permet également d'être utilisé comme une base de données vectorielle haute performance et évolutive pour stocker et rechercher des vecteurs avec SQL.

## Utiliser Yellowbrick comme magasin de vecteurs pour ChatGpt

Ce tutoriel montre comment créer un chatbot simple alimenté par ChatGpt qui utilise Yellowbrick comme magasin de vecteurs pour prendre en charge la génération augmentée par la récupération (RAG). Ce dont vous aurez besoin :

1. Un compte sur le [bac à sable Yellowbrick](https://cloudlabs.yellowbrick.com/)
2. Une clé d'API de [OpenAI](https://platform.openai.com/)

Le tutoriel est divisé en cinq parties. Tout d'abord, nous utiliserons langchain pour créer un chatbot de base pour interagir avec ChatGpt sans magasin de vecteurs. Deuxièmement, nous créerons une table d'embeddings dans Yellowbrick qui représentera le magasin de vecteurs. Troisièmement, nous chargerons une série de documents (le chapitre Administration du manuel Yellowbrick). Quatrièmement, nous créerons la représentation vectorielle de ces documents et les stockerons dans une table Yellowbrick. Enfin, nous enverrons les mêmes requêtes au chatbot amélioré pour voir les résultats.

```python
# Install all needed libraries
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

## Configuration : Entrez les informations utilisées pour se connecter à Yellowbrick et à l'API OpenAI

Notre chatbot s'intègre à ChatGpt via la bibliothèque langchain, vous aurez donc besoin d'une clé API d'OpenAI d'abord :

Pour obtenir une clé d'API pour OpenAI :
1. Inscrivez-vous sur https://platform.openai.com/
2. Ajoutez un mode de paiement - Vous n'aurez probablement pas à dépasser le quota gratuit
3. Créez une clé d'API

Vous aurez également besoin de votre nom d'utilisateur, mot de passe et nom de base de données du courriel de bienvenue lorsque vous vous inscrivez au compte Yellowbrick Sandbox.

Les éléments suivants doivent être modifiés pour inclure les informations de votre base de données Yellowbrick et de votre clé OpenAPI

```python
# Modify these values to match your Yellowbrick Sandbox and OpenAI API Key
YBUSER = "[SANDBOX USER]"
YBPASSWORD = "[SANDBOX PASSWORD]"
YBDATABASE = "[SANDBOX_DATABASE]"
YBHOST = "trialsandbox.sandbox.aws.yellowbrickcloud.com"

OPENAI_API_KEY = "[OPENAI API KEY]"
```

```python
# Import libraries and setup keys / login info
import os
import pathlib
import re
import sys
import urllib.parse as urlparse
from getpass import getpass

import psycopg2
from IPython.display import Markdown, display
from langchain.chains import LLMChain, RetrievalQAWithSourcesChain
from langchain.schema import Document
from langchain_community.vectorstores import Yellowbrick
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Establish connection parameters to Yellowbrick.  If you've signed up for Sandbox, fill in the information from your welcome mail here:
yellowbrick_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YBDATABASE}"
)

YB_DOC_DATABASE = "sample_data"
YB_DOC_TABLE = "yellowbrick_documentation"
embedding_table = "my_embeddings"

# API Key for OpenAI.  Signup at https://platform.openai.com
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```

## Partie 1 : Création d'un chatbot de base alimenté par ChatGpt sans magasin de vecteurs

Nous utiliserons langchain pour interroger ChatGPT. Comme il n'y a pas de magasin de vecteurs, ChatGPT n'aura aucun contexte pour répondre à la question.

```python
# Set up the chat model and specific prompt
system_template = """If you don't know the answer, Make up your best guess."""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=False,
)


def print_result_simple(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['text']}
    """
    display(Markdown(output_text))


# Use the chain to query
print_result_simple("How many databases can be in a Yellowbrick Instance?")

print_result_simple("What's an easy way to add users in bulk to Yellowbrick?")
```

## Partie 2 : Se connecter à Yellowbrick et créer les tables d'embeddings

Pour charger vos embeddings de documents dans Yellowbrick, vous devez créer votre propre table pour les stocker. Notez que la base de données Yellowbrick dans laquelle la table se trouve doit être codée en UTF-8.

Créez une table dans une base de données UTF-8 avec le schéma suivant, en fournissant un nom de table de votre choix :

```python
# Establish a connection to the Yellowbrick database
try:
    conn = psycopg2.connect(yellowbrick_connection_string)
except psycopg2.Error as e:
    print(f"Error connecting to the database: {e}")
    exit(1)

# Create a cursor object using the connection
cursor = conn.cursor()

# Define the SQL statement to create a table
create_table_query = f"""
CREATE TABLE IF NOT EXISTS {embedding_table} (
    doc_id uuid NOT NULL,
    embedding_id smallint NOT NULL,
    embedding double precision NOT NULL
)
DISTRIBUTE ON (doc_id);
truncate table {embedding_table};
"""

# Execute the SQL query to create a table
try:
    cursor.execute(create_table_query)
    print(f"Table '{embedding_table}' created successfully!")
except psycopg2.Error as e:
    print(f"Error creating table: {e}")
    conn.rollback()

# Commit changes and close the cursor and connection
conn.commit()
cursor.close()
conn.close()
```

## Partie 3 : Extraire les documents à indexer à partir d'une table existante dans Yellowbrick

Extrayez les chemins d'accès aux documents et leur contenu à partir d'une table Yellowbrick existante. Nous utiliserons ces documents pour créer des embeddings à l'étape suivante.

```python
yellowbrick_doc_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YB_DOC_DATABASE}"
)

print(yellowbrick_doc_connection_string)

# Establish a connection to the Yellowbrick database
conn = psycopg2.connect(yellowbrick_doc_connection_string)

# Create a cursor object
cursor = conn.cursor()

# Query to select all documents from the table
query = f"SELECT path, document FROM {YB_DOC_TABLE}"

# Execute the query
cursor.execute(query)

# Fetch all documents
yellowbrick_documents = cursor.fetchall()

print(f"Extracted {len(yellowbrick_documents)} documents successfully!")

# Close the cursor and connection
cursor.close()
conn.close()
```

## Partie 4 : Charger le magasin de vecteurs Yellowbrick avec les documents

Parcourez les documents, divisez-les en morceaux digestibles, créez l'embedding et insérez-le dans la table Yellowbrick. Cela prend environ 5 minutes.

```python
# Split documents into chunks for conversion to embeddings
DOCUMENT_BASE_URL = "https://docs.yellowbrick.com/6.7.1/"  # Actual URL


separator = "\n## "  # This separator assumes Markdown docs from the repo uses ### as logical main header most of the time
chunk_size_limit = 2000
max_chunk_overlap = 200

documents = [
    Document(
        page_content=document[1],
        metadata={"source": DOCUMENT_BASE_URL + document[0].replace(".md", ".html")},
    )
    for document in yellowbrick_documents
]

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size_limit,
    chunk_overlap=max_chunk_overlap,
    separators=[separator, "\nn", "\n", ",", " ", ""],
)
split_docs = text_splitter.split_documents(documents)

docs_text = [doc.page_content for doc in split_docs]

embeddings = OpenAIEmbeddings()
vector_store = Yellowbrick.from_documents(
    documents=split_docs,
    embedding=embeddings,
    connection_info=yellowbrick_connection_string,
    table=embedding_table,
)

print(f"Created vector store with {len(documents)} documents")
```

## Partie 5 : Création d'un chatbot utilisant Yellowbrick comme magasin de vecteurs

Ensuite, nous ajoutons Yellowbrick comme magasin de vecteurs. Le magasin de vecteurs a été peuplé avec des embeddings représentant le chapitre administratif de la documentation produit Yellowbrick.

Nous enverrons les mêmes requêtes que ci-dessus pour voir les réponses améliorées.

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## Partie 6 : Introduction d'un index pour améliorer les performances

Yellowbrick prend également en charge l'indexation à l'aide de l'approche Locality-Sensitive Hashing. Il s'agit d'une technique de recherche des plus proches voisins approximative, qui permet de faire un compromis entre le temps de recherche de similarité et la précision. L'index introduit deux nouveaux paramètres réglables :

- Le nombre de plans hyperplans, qui est fourni en argument à `create_lsh_index(num_hyperplanes)`. Plus il y a de documents, plus il faut de plans hyperplans. LSH est une forme de réduction de dimensionnalité. Les embeddings d'origine sont transformés en vecteurs de plus faible dimension, où le nombre de composants est le même que le nombre de plans hyperplans.
- La distance de Hamming, un entier représentant l'étendue de la recherche. Des distances de Hamming plus petites entraînent une récupération plus rapide mais une précision plus faible.

Voici comment vous pouvez créer un index sur les embeddings que nous avons chargés dans Yellowbrick. Nous réexécuterons également la session de chat précédente, mais cette fois-ci, la récupération utilisera l'index. Notez que pour un si petit nombre de documents, vous ne verrez pas les avantages de l'indexation en termes de performances.

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

lsh_params = Yellowbrick.IndexParams(
    Yellowbrick.IndexType.LSH, {"num_hyperplanes": 8, "hamming_distance": 2}
)
vector_store.create_index(lsh_params)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(
        k=5, search_kwargs={"index_params": lsh_params}
    ),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## Prochaines étapes :

Ce code peut être modifié pour poser différentes questions. Vous pouvez également charger vos propres documents dans le magasin de vecteurs. Le module langchain est très flexible et peut analyser une grande variété de fichiers (y compris HTML, PDF, etc.).

Vous pouvez également le modifier pour utiliser les modèles d'embeddings Huggingface et le LLM Llama 2 de Meta pour une expérience de chatbox complètement privée.
