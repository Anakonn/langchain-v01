---
sidebar_position: 3
translated: true
---

# Validation des requêtes

La partie la plus sujette aux erreurs de toute chaîne SQL ou agent est peut-être la rédaction de requêtes SQL valides et sûres. Dans ce guide, nous examinerons quelques stratégies pour valider nos requêtes et gérer les requêtes non valides.

## Configuration

Tout d'abord, obtenez les packages requis et définissez les variables d'environnement :

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

Nous utilisons par défaut les modèles OpenAI dans ce guide, mais vous pouvez les remplacer par le fournisseur de modèle de votre choix.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

L'exemple ci-dessous utilisera une connexion SQLite avec la base de données Chinook. Suivez [ces étapes d'installation](https://database.guide/2-sample-databases-sqlite/) pour créer `Chinook.db` dans le même répertoire que ce notebook :

* Enregistrez [ce fichier](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) sous le nom `Chinook_Sqlite.sql`
* Exécutez `sqlite3 Chinook.db`
* Exécutez `.read Chinook_Sqlite.sql`
* Testez `SELECT * FROM Artist LIMIT 10;`

Maintenant, `Chinhook.db` est dans notre répertoire et nous pouvons l'utiliser avec la classe `SQLDatabase` pilotée par SQLAlchemy :

```python
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
print(db.dialect)
print(db.get_usable_table_names())
db.run("SELECT * FROM Artist LIMIT 10;")
```

```output
sqlite
['Album', 'Artist', 'Customer', 'Employee', 'Genre', 'Invoice', 'InvoiceLine', 'MediaType', 'Playlist', 'PlaylistTrack', 'Track']
```

```output
"[(1, 'AC/DC'), (2, 'Accept'), (3, 'Aerosmith'), (4, 'Alanis Morissette'), (5, 'Alice In Chains'), (6, 'Antônio Carlos Jobim'), (7, 'Apocalyptica'), (8, 'Audioslave'), (9, 'BackBeat'), (10, 'Billy Cobham')]"
```

## Vérificateur de requête

La stratégie la plus simple est de demander au modèle lui-même de vérifier la requête SQL d'origine pour détecter les erreurs courantes. Supposons que nous ayons la chaîne de requêtes SQL suivante :

```python
from langchain.chains import create_sql_query_chain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = create_sql_query_chain(llm, db)
```

Et nous voulons valider ses sorties. Nous pouvons le faire en étendant la chaîne avec un deuxième invite et un appel de modèle :

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

system = """Double check the user's {dialect} query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

If there are any of the above mistakes, rewrite the query. If there are no mistakes, just reproduce the original query.

Output the final SQL query only."""
prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{query}")]
).partial(dialect=db.dialect)
validation_chain = prompt | llm | StrOutputParser()

full_chain = {"query": chain} | validation_chain
```

```python
query = full_chain.invoke(
    {
        "question": "What's the average Invoice from an American customer whose Fax is missing since 2003 but before 2010"
    }
)
query
```

```output
"SELECT AVG(Invoice.Total) AS AverageInvoice\nFROM Invoice\nJOIN Customer ON Invoice.CustomerId = Customer.CustomerId\nWHERE Customer.Country = 'USA'\nAND Customer.Fax IS NULL\nAND Invoice.InvoiceDate >= '2003-01-01'\nAND Invoice.InvoiceDate < '2010-01-01'"
```

```python
db.run(query)
```

```output
'[(6.632999999999998,)]'
```

L'inconvénient évident de cette approche est que nous devons faire deux appels de modèle au lieu d'un seul pour générer notre requête. Pour contourner cela, nous pouvons essayer d'effectuer la génération de requête et la vérification de requête dans un seul appel de modèle :

```python
system = """You are a {dialect} expert. Given an input question, creat a syntactically correct {dialect} query to run.
Unless the user specifies in the question a specific number of examples to obtain, query for at most {top_k} results using the LIMIT clause as per {dialect}. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Only use the following tables:
{table_info}

Write an initial draft of the query. Then double check the {dialect} query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

Use format:

First draft: <<FIRST_DRAFT_QUERY>>
Final answer: <<FINAL_ANSWER_QUERY>>
"""
prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{input}")]
).partial(dialect=db.dialect)


def parse_final_answer(output: str) -> str:
    return output.split("Final answer: ")[1]


chain = create_sql_query_chain(llm, db, prompt=prompt) | parse_final_answer
prompt.pretty_print()
```

```output
================================[1m System Message [0m================================

You are a [33;1m[1;3m{dialect}[0m expert. Given an input question, creat a syntactically correct [33;1m[1;3m{dialect}[0m query to run.
Unless the user specifies in the question a specific number of examples to obtain, query for at most [33;1m[1;3m{top_k}[0m results using the LIMIT clause as per [33;1m[1;3m{dialect}[0m. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Only use the following tables:
[33;1m[1;3m{table_info}[0m

Write an initial draft of the query. Then double check the [33;1m[1;3m{dialect}[0m query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

Use format:

First draft: <<FIRST_DRAFT_QUERY>>
Final answer: <<FINAL_ANSWER_QUERY>>


================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```

```python
query = chain.invoke(
    {
        "question": "What's the average Invoice from an American customer whose Fax is missing since 2003 but before 2010"
    }
)
query
```

```output
"\nSELECT AVG(i.Total) AS AverageInvoice\nFROM Invoice i\nJOIN Customer c ON i.CustomerId = c.CustomerId\nWHERE c.Country = 'USA' AND c.Fax IS NULL AND i.InvoiceDate >= date('2003-01-01') AND i.InvoiceDate < date('2010-01-01')"
```

```python
db.run(query)
```

```output
'[(6.632999999999998,)]'
```

## Humain dans la boucle

Dans certains cas, nos données sont suffisamment sensibles pour que nous ne voulions jamais exécuter une requête SQL sans qu'un humain l'approuve d'abord. Rendez-vous sur la page [Utilisation des outils : Humain dans la boucle](/docs/use_cases/tool_use/human_in_the_loop) pour apprendre à ajouter un humain dans la boucle à n'importe quel outil, chaîne ou agent.

## Gestion des erreurs

À un moment donné, le modèle fera une erreur et créera une requête SQL non valide. Ou un problème surgira avec notre base de données. Ou l'API du modèle tombera en panne. Nous voudrons ajouter un comportement de gestion des erreurs à nos chaînes et agents afin de pouvoir échouer de manière gracieuse dans ces situations, et peut-être même de se remettre automatiquement. Pour en savoir plus sur la gestion des erreurs avec les outils, rendez-vous sur la page [Utilisation des outils : Gestion des erreurs](/docs/use_cases/tool_use/tool_error_handling).
