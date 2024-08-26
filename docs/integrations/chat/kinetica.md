---
canonical: https://python.langchain.com/v0.1/docs/integrations/chat/kinetica
sidebar_label: Kinetica
translated: false
---

# Kinetica SqlAssist LLM Demo

This notebook demonstrates how to use Kinetica to transform natural language into SQL
and simplify the process of data retrieval. This demo is intended to show the mechanics
of creating and using a chain as opposed to the capabilities of the LLM.

## Overview

With the Kinetica LLM workflow you create an LLM context in the database that provides
information needed for infefencing that includes tables, annotations, rules, and
samples. Invoking ``ChatKinetica.load_messages_from_context()`` will retrieve the
context information from the database so that it can be used to create a chat prompt.

The chat prompt consists of a ``SystemMessage`` and pairs of
``HumanMessage``/``AIMessage`` that contain the samples which are question/SQL
pairs. You can append pairs samples to this list but it is not intended to
facilitate a typical natural language conversation.

When you create a chain from the chat prompt and execute it, the Kinetica LLM will
generate SQL from the input. Optionally you can use ``KineticaSqlOutputParser`` to
execute the SQL and return the result as a dataframe.

Currently, 2 LLM's are supported for SQL generation:

1. **Kinetica SQL-GPT**: This LLM is based on OpenAI ChatGPT API.
2. **Kinetica SqlAssist**: This LLM is purpose built to integrate with the Kinetica
   database and it can run in a secure customer premise.

For this demo we will be using **SqlAssist**. See the [Kinetica Documentation
site](https://docs.kinetica.com/7.1/sql-gpt/concepts/) for more information.

## Prerequisites

To get started you will need a Kinetica DB instance. If you don't have one you can
obtain a [free development instance](https://cloud.kinetica.com/trynow).

You will need to install the following packages...

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

## Database Connection

You must set the database connection in the following environment variables. If you are using a virtual environment you can set them in the `.env` file of the project:
* `KINETICA_URL`: Database connection URL
* `KINETICA_USER`: Database user
* `KINETICA_PASSWD`: Secure password.

If you can create an instance of `KineticaChatLLM` then you are successfully connected.

```python
from langchain_community.chat_models.kinetica import ChatKinetica

kinetica_llm = ChatKinetica()

# Test table we will create
table_name = "demo.user_profiles"

# LLM Context we will create
kinetica_ctx = "demo.test_llm_ctx"
```

## Create test data

Before we can generate SQL we will need to create a Kinetica table and an LLM context that can inference the table.

### Create some fake user profiles

We will use the `faker` package to create a dataframe with 100 fake profiles.

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

### Create a Kinetica table from the Dataframe

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

### Create the LLM context

You can create an LLM Context using the Kinetica Workbench UI or you can manually create it with the `CREATE OR REPLACE CONTEXT` syntax.

Here we create a context from the SQL syntax referencing the table we created.

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

## Use Langchain for inferencing

In the example below we will create a chain from the previously created table and LLM context. This chain will generate SQL and return the resulting data as a dataframe.

### Load the chat prompt from the Kinetica DB

The `load_messages_from_context()` function will retrieve a context from the DB and convert it into a list of chat messages that we use to create a ``ChatPromptTemplate``.

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

### Create the chain

The last element of this chain is `KineticaSqlOutputParser` that will execute the SQL and return a dataframe. This is optional and if we left it out then only SQL would be returned.

```python
from langchain_community.chat_models.kinetica import (
    KineticaSqlOutputParser,
    KineticaSqlResponse,
)

chain = prompt_template | kinetica_llm | KineticaSqlOutputParser(kdbc=kinetica_llm.kdbc)
```

### Generate the SQL

The chain we created will take a question as input and return a ``KineticaSqlResponse`` containing the generated SQL and data. The question must be relevant to the to LLM context we used to create the prompt.

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