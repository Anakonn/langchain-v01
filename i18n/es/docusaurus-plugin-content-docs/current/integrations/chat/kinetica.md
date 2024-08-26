---
sidebar_label: Kinetica
translated: true
---

# Demostración de Kinetica SqlAssist LLM

Este cuaderno demuestra cómo usar Kinetica para transformar el lenguaje natural en SQL y simplificar el proceso de recuperación de datos. Esta demostración tiene como objetivo mostrar la mecánica de crear y usar una cadena, en lugar de las capacidades del LLM.

## Resumen

Con el flujo de trabajo de Kinetica LLM, creas un contexto LLM en la base de datos que proporciona la información necesaria para la inferencia, que incluye tablas, anotaciones, reglas y muestras. Invocar ``ChatKinetica.load_messages_from_context()`` recuperará la información de contexto de la base de datos para que se pueda usar para crear un mensaje de chat.

El mensaje de chat consta de un ``SystemMessage`` y pares de ``HumanMessage``/``AIMessage`` que contienen las muestras que son pares de preguntas/SQL. Puedes agregar pares de muestras a esta lista, pero no está diseñado para facilitar una conversación natural típica.

Cuando creas una cadena a partir del mensaje de chat y la ejecutas, el LLM de Kinetica generará SQL a partir de la entrada. Opcionalmente, puedes usar ``KineticaSqlOutputParser`` para ejecutar el SQL y devolver el resultado como un dataframe.

Actualmente, se admiten 2 LLM para la generación de SQL:

1. **Kinetica SQL-GPT**: Este LLM se basa en la API de OpenAI ChatGPT.
2. **Kinetica SqlAssist**: Este LLM está diseñado específicamente para integrarse con la base de datos Kinetica y puede ejecutarse en las instalaciones del cliente de manera segura.

Para esta demostración, usaremos **SqlAssist**. Consulta el [sitio de documentación de Kinetica](https://docs.kinetica.com/7.1/sql-gpt/concepts/) para obtener más información.

## Requisitos previos

Para comenzar, necesitarás una instancia de Kinetica DB. Si no tienes una, puedes obtener una [instancia de desarrollo gratuita](https://cloud.kinetica.com/trynow).

Deberás instalar los siguientes paquetes...

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

## Conexión a la base de datos

Debes establecer la conexión a la base de datos en las siguientes variables de entorno. Si estás usando un entorno virtual, puedes establecerlas en el archivo `.env` del proyecto:
* `KINETICA_URL`: URL de conexión a la base de datos
* `KINETICA_USER`: Usuario de la base de datos
* `KINETICA_PASSWD`: Contraseña segura.

Si puedes crear una instancia de `KineticaChatLLM`, entonces te has conectado con éxito.

```python
from langchain_community.chat_models.kinetica import ChatKinetica

kinetica_llm = ChatKinetica()

# Test table we will create
table_name = "demo.user_profiles"

# LLM Context we will create
kinetica_ctx = "demo.test_llm_ctx"
```

## Crear datos de prueba

Antes de poder generar SQL, necesitaremos crear una tabla Kinetica y un contexto LLM que pueda inferir la tabla.

### Crear algunos perfiles de usuario ficticios

Usaremos el paquete `faker` para crear un dataframe con 100 perfiles ficticios.

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

### Crear una tabla Kinetica a partir del Dataframe

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

### Crear el contexto LLM

Puedes crear un contexto LLM usando la interfaz de usuario de Kinetica Workbench o puedes crearlo manualmente con la sintaxis `CREATE OR REPLACE CONTEXT`.

Aquí creamos un contexto a partir de la sintaxis SQL que hace referencia a la tabla que creamos.

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

## Usar Langchain para inferencia

En el ejemplo a continuación, crearemos una cadena a partir de la tabla y el contexto LLM creados anteriormente. Esta cadena generará SQL y devolverá los datos resultantes como un dataframe.

### Cargar el mensaje de chat desde la base de datos de Kinetica

La función `load_messages_from_context()` recuperará un contexto de la base de datos y lo convertirá en una lista de mensajes de chat que usaremos para crear un ``ChatPromptTemplate``.

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

### Crear la cadena

El último elemento de esta cadena es `KineticaSqlOutputParser` que ejecutará el SQL y devolverá un dataframe. Esto es opcional y si lo omitimos, solo se devolverá el SQL.

```python
from langchain_community.chat_models.kinetica import (
    KineticaSqlOutputParser,
    KineticaSqlResponse,
)

chain = prompt_template | kinetica_llm | KineticaSqlOutputParser(kdbc=kinetica_llm.kdbc)
```

### Generar el SQL

La cadena que creamos tomará una pregunta como entrada y devolverá un ``KineticaSqlResponse`` que contiene el SQL generado y los datos. La pregunta debe ser relevante para el contexto LLM que usamos para crear el mensaje.

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
