---
sidebar_label: Kinetica
translated: true
---

# Démonstration de Kinetica SqlAssist LLM

Ce notebook montre comment utiliser Kinetica pour transformer le langage naturel en SQL et simplifier le processus de récupération des données. Cette démonstration vise à montrer les mécanismes de création et d'utilisation d'une chaîne plutôt que les capacités du LLM.

## Aperçu

Avec le workflow LLM de Kinetica, vous créez un contexte LLM dans la base de données qui fournit les informations nécessaires à l'inférence, notamment les tables, les annotations, les règles et les exemples. L'appel de ``ChatKinetica.load_messages_from_context()`` récupérera les informations de contexte de la base de données afin qu'elles puissent être utilisées pour créer une invite de conversation.

L'invite de conversation se compose d'un ``SystemMessage`` et de paires de ``HumanMessage``/``AIMessage`` qui contiennent les exemples, qui sont des paires de questions/SQL. Vous pouvez ajouter des paires d'exemples à cette liste, mais elle n'est pas destinée à faciliter une conversation en langage naturel typique.

Lorsque vous créez une chaîne à partir de l'invite de conversation et que vous l'exécutez, le LLM de Kinetica générera du SQL à partir de l'entrée. Vous pouvez éventuellement utiliser ``KineticaSqlOutputParser`` pour exécuter le SQL et renvoyer le résultat sous forme de dataframe.

Actuellement, 2 LLM sont pris en charge pour la génération de SQL :

1. **Kinetica SQL-GPT** : Ce LLM est basé sur l'API OpenAI ChatGPT.
2. **Kinetica SqlAssist** : Ce LLM est spécialement conçu pour s'intégrer à la base de données Kinetica et peut s'exécuter dans un environnement client sécurisé.

Pour cette démonstration, nous utiliserons **SqlAssist**. Consultez le [site de documentation de Kinetica](https://docs.kinetica.com/7.1/sql-gpt/concepts/) pour plus d'informations.

## Prérequis

Pour commencer, vous aurez besoin d'une instance de base de données Kinetica. Si vous n'en avez pas, vous pouvez obtenir une [instance de développement gratuite](https://cloud.kinetica.com/trynow).

Vous devrez installer les packages suivants...

```python
# Install Langchain community and core packages
%pip install --upgrade --quiet langchain-core langchain-community

# Install Kineitca DB connection package
%pip install --upgrade --quiet gpudb typeguard

# Install packages needed for this tutorial
%pip install --upgrade --quiet faker
```

```output
Note: you may need to restart the kernel to use updated packages.
Note: you may need to restart the kernel to use updated packages.
```

## Connexion à la base de données

Vous devez définir la connexion à la base de données dans les variables d'environnement suivantes. Si vous utilisez un environnement virtuel, vous pouvez les définir dans le fichier `.env` du projet :
* `KINETICA_URL` : URL de connexion à la base de données
* `KINETICA_USER` : Utilisateur de la base de données
* `KINETICA_PASSWD` : Mot de passe sécurisé.

Si vous pouvez créer une instance de `KineticaChatLLM`, alors vous êtes connecté avec succès.

```python
from langchain_community.chat_models.kinetica import ChatKinetica

kinetica_llm = ChatKinetica()

# Test table we will create
table_name = "demo.user_profiles"

# LLM Context we will create
kinetica_ctx = "demo.test_llm_ctx"
```

## Créer des données de test

Avant de pouvoir générer du SQL, nous devrons créer une table Kinetica et un contexte LLM qui pourra inférer la table.

### Créer quelques profils d'utilisateurs fictifs

Nous utiliserons le package `faker` pour créer un dataframe avec 100 profils fictifs.

```python
from typing import Generator

import pandas as pd
from faker import Faker

Faker.seed(5467)
faker = Faker(locale="en-US")


def profile_gen(count: int) -> Generator:
    for id in range(0, count):
        rec = dict(id=id, **faker.simple_profile())
        rec["birthdate"] = pd.Timestamp(rec["birthdate"])
        yield rec


load_df = pd.DataFrame.from_records(data=profile_gen(100), index="id")
load_df.head()
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>username</th>
      <th>name</th>
      <th>sex</th>
      <th>address</th>
      <th>mail</th>
      <th>birthdate</th>
    </tr>
    <tr>
      <th>id</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>eduardo69</td>
      <td>Haley Beck</td>
      <td>F</td>
      <td>59836 Carla Causeway Suite 939\nPort Eugene, I...</td>
      <td>meltondenise@yahoo.com</td>
      <td>1997-11-23</td>
    </tr>
    <tr>
      <th>1</th>
      <td>lbarrera</td>
      <td>Joshua Stephens</td>
      <td>M</td>
      <td>3108 Christina Forges\nPort Timothychester, KY...</td>
      <td>erica80@hotmail.com</td>
      <td>1924-07-19</td>
    </tr>
    <tr>
      <th>2</th>
      <td>bburton</td>
      <td>Paula Kaiser</td>
      <td>F</td>
      <td>Unit 7405 Box 3052\nDPO AE 09858</td>
      <td>timothypotts@gmail.com</td>
      <td>1933-11-20</td>
    </tr>
    <tr>
      <th>3</th>
      <td>melissa49</td>
      <td>Wendy Reese</td>
      <td>F</td>
      <td>6408 Christopher Hill Apt. 459\nNew Benjamin, ...</td>
      <td>dadams@gmail.com</td>
      <td>1988-10-11</td>
    </tr>
    <tr>
      <th>4</th>
      <td>melissacarter</td>
      <td>Manuel Rios</td>
      <td>M</td>
      <td>2241 Bell Gardens Suite 723\nScottside, CA 38463</td>
      <td>williamayala@gmail.com</td>
      <td>1931-03-04</td>
    </tr>
  </tbody>
</table>
</div>
```

### Créer une table Kinetica à partir du dataframe

```python
from gpudb import GPUdbTable

gpudb_table = GPUdbTable.from_df(
    load_df,
    db=kinetica_llm.kdbc,
    table_name=table_name,
    clear_table=True,
    load_data=True,
)

# See the Kinetica column types
gpudb_table.type_as_df()
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>type</th>
      <th>properties</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>username</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>1</th>
      <td>name</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>2</th>
      <td>sex</td>
      <td>string</td>
      <td>[char1]</td>
    </tr>
    <tr>
      <th>3</th>
      <td>address</td>
      <td>string</td>
      <td>[char64]</td>
    </tr>
    <tr>
      <th>4</th>
      <td>mail</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>5</th>
      <td>birthdate</td>
      <td>long</td>
      <td>[timestamp]</td>
    </tr>
  </tbody>
</table>
</div>
```

### Créer le contexte LLM

Vous pouvez créer un contexte LLM à l'aide de l'interface utilisateur Kinetica Workbench ou vous pouvez le créer manuellement avec la syntaxe `CREATE OR REPLACE CONTEXT`.

Ici, nous créons un contexte à partir de la syntaxe SQL en référençant la table que nous avons créée.

```python
# create an LLM context for the table.

from gpudb import GPUdbException

sql = f"""
CREATE OR REPLACE CONTEXT {kinetica_ctx}
(
    TABLE = demo.test_profiles
    COMMENT = 'Contains user profiles.'
),
(
    SAMPLES = (
    'How many male users are there?' =
    'select count(1) as num_users
    from demo.test_profiles
    where sex = ''M'';')
)
"""


def _check_error(response: dict) -> None:
    status = response["status_info"]["status"]
    if status != "OK":
        message = response["status_info"]["message"]
        raise GPUdbException("[%s]: %s" % (status, message))


response = kinetica_llm.kdbc.execute_sql(sql)
_check_error(response)
response["status_info"]
```

```output
{'status': 'OK',
 'message': '',
 'data_type': 'execute_sql_response',
 'response_time': 0.0148}
```

## Utiliser Langchain pour l'inférence

Dans l'exemple ci-dessous, nous créerons une chaîne à partir de la table et du contexte LLM précédemment créés. Cette chaîne générera du SQL et renverra les données résultantes sous forme de dataframe.

### Charger l'invite de conversation à partir de la base de données Kinetica

La fonction `load_messages_from_context()` récupérera un contexte de la base de données et le convertira en une liste de messages de conversation que nous utiliserons pour créer un ``ChatPromptTemplate``.

```python
from langchain_core.prompts import ChatPromptTemplate

# load the context from the database
ctx_messages = kinetica_llm.load_messages_from_context(kinetica_ctx)

# Add the input prompt. This is where input question will be substituted.
ctx_messages.append(("human", "{input}"))

# Create the prompt template.
prompt_template = ChatPromptTemplate.from_messages(ctx_messages)
prompt_template.pretty_print()
```

```output
================================[1m System Message [0m================================

CREATE TABLE demo.test_profiles AS
(
   username VARCHAR (32) NOT NULL,
   name VARCHAR (32) NOT NULL,
   sex VARCHAR (1) NOT NULL,
   address VARCHAR (64) NOT NULL,
   mail VARCHAR (32) NOT NULL,
   birthdate TIMESTAMP NOT NULL
);
COMMENT ON TABLE demo.test_profiles IS 'Contains user profiles.';

================================[1m Human Message [0m=================================

How many male users are there?

==================================[1m Ai Message [0m==================================

select count(1) as num_users
    from demo.test_profiles
    where sex = 'M';

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```

### Créer la chaîne

Le dernier élément de cette chaîne est `KineticaSqlOutputParser` qui exécutera le SQL et renverra un dataframe. C'est facultatif et si nous l'omettions, seul le SQL serait renvoyé.

```python
from langchain_community.chat_models.kinetica import (
    KineticaSqlOutputParser,
    KineticaSqlResponse,
)

chain = prompt_template | kinetica_llm | KineticaSqlOutputParser(kdbc=kinetica_llm.kdbc)
```

### Générer le SQL

La chaîne que nous avons créée prendra une question en entrée et renverra un ``KineticaSqlResponse`` contenant le SQL généré et les données. La question doit être pertinente par rapport au contexte LLM que nous avons utilisé pour créer l'invite.

```python
# Here you must ask a question relevant to the LLM context provided in the prompt template.
response: KineticaSqlResponse = chain.invoke(
    {"input": "What are the female users ordered by username?"}
)

print(f"SQL: {response.sql}")
response.dataframe.head()
```

```output
SQL: SELECT username, name
    FROM demo.test_profiles
    WHERE sex = 'F'
    ORDER BY username;
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>username</th>
      <th>name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>alexander40</td>
      <td>Tina Ramirez</td>
    </tr>
    <tr>
      <th>1</th>
      <td>bburton</td>
      <td>Paula Kaiser</td>
    </tr>
    <tr>
      <th>2</th>
      <td>brian12</td>
      <td>Stefanie Williams</td>
    </tr>
    <tr>
      <th>3</th>
      <td>brownanna</td>
      <td>Jennifer Rowe</td>
    </tr>
    <tr>
      <th>4</th>
      <td>carl19</td>
      <td>Amanda Potts</td>
    </tr>
  </tbody>
</table>
</div>
```
