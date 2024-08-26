---
translated: true
---

# CSV

Los LLM son excelentes para construir sistemas de preguntas y respuestas sobre diversos tipos de fuentes de datos. En esta sección veremos cómo construir sistemas de Q&A sobre datos almacenados en un archivo(s) CSV. Al igual que trabajar con bases de datos SQL, la clave para trabajar con archivos CSV es dar a un LLM acceso a herramientas para consultar e interactuar con los datos. Las dos formas principales de hacer esto son:

* **RECOMENDADO**: Cargar el(los) CSV en una base de datos SQL y usar los enfoques descritos en los [documentos de casos de uso de SQL](/docs/use_cases/sql/).
* Dar al LLM acceso a un entorno de Python donde pueda usar bibliotecas como Pandas para interactuar con los datos.

## ⚠️ Nota de seguridad ⚠️

Ambos enfoques mencionados anteriormente conllevan riesgos significativos. Usar SQL requiere ejecutar consultas SQL generadas por el modelo. Usar una biblioteca como Pandas requiere permitir que el modelo ejecute código Python. Dado que es más fácil limitar estrictamente los permisos de conexión SQL y sanear las consultas SQL que es aislar entornos de Python, **recomendamos encarecidamente interactuar con los datos CSV a través de SQL.** Para más información sobre las mejores prácticas de seguridad en general, [consulta aquí](/docs/security).

## Configuración

Dependencias para esta guía:

```python
%pip install -qU langchain langchain-openai langchain-community langchain-experimental pandas
```

Establecer las variables de entorno requeridas:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Using LangSmith is recommended but not required. Uncomment below lines to use.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

Descargar el [conjunto de datos de Titanic](https://www.kaggle.com/datasets/yasserh/titanic-dataset) si aún no lo tienes:

```python
!wget https://web.stanford.edu/class/archive/cs/cs109/cs109.1166/stuff/titanic.csv -O titanic.csv
```

```python
import pandas as pd

df = pd.read_csv("titanic.csv")
print(df.shape)
print(df.columns.tolist())
```

```output
(887, 8)
['Survived', 'Pclass', 'Name', 'Sex', 'Age', 'Siblings/Spouses Aboard', 'Parents/Children Aboard', 'Fare']
```

## SQL

Usar SQL para interactuar con los datos CSV es el enfoque recomendado porque es más fácil limitar los permisos y sanear las consultas que con Python arbitrario.

La mayoría de las bases de datos SQL facilitan la carga de un archivo CSV como una tabla ([DuckDB](https://duckdb.org/docs/data/csv/overview.html), [SQLite](https://www.sqlite.org/csv.html), etc.). Una vez que hayas hecho esto, puedes usar todas las técnicas de creación de cadenas y agentes descritas en la [guía de casos de uso de SQL](/docs/use_cases/sql/). Aquí hay un ejemplo rápido de cómo podríamos hacer esto con SQLite:

```python
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine

engine = create_engine("sqlite:///titanic.db")
df.to_sql("titanic", engine, index=False)
```

```output
887
```

```python
db = SQLDatabase(engine=engine)
print(db.dialect)
print(db.get_usable_table_names())
db.run("SELECT * FROM titanic WHERE Age < 2;")
```

```output
sqlite
['titanic']
```

```output
"[(1, 2, 'Master. Alden Gates Caldwell', 'male', 0.83, 0, 2, 29.0), (0, 3, 'Master. Eino Viljami Panula', 'male', 1.0, 4, 1, 39.6875), (1, 3, 'Miss. Eleanor Ileen Johnson', 'female', 1.0, 1, 1, 11.1333), (1, 2, 'Master. Richard F Becker', 'male', 1.0, 2, 1, 39.0), (1, 1, 'Master. Hudson Trevor Allison', 'male', 0.92, 1, 2, 151.55), (1, 3, 'Miss. Maria Nakid', 'female', 1.0, 0, 2, 15.7417), (0, 3, 'Master. Sidney Leonard Goodwin', 'male', 1.0, 5, 2, 46.9), (1, 3, 'Miss. Helene Barbara Baclini', 'female', 0.75, 2, 1, 19.2583), (1, 3, 'Miss. Eugenie Baclini', 'female', 0.75, 2, 1, 19.2583), (1, 2, 'Master. Viljo Hamalainen', 'male', 0.67, 1, 1, 14.5), (1, 3, 'Master. Bertram Vere Dean', 'male', 1.0, 1, 2, 20.575), (1, 3, 'Master. Assad Alexander Thomas', 'male', 0.42, 0, 1, 8.5167), (1, 2, 'Master. Andre Mallet', 'male', 1.0, 0, 2, 37.0042), (1, 2, 'Master. George Sibley Richards', 'male', 0.83, 1, 1, 18.75)]"
```

Y crear un [agente SQL](/docs/use_cases/sql/agents) para interactuar con él:

```python
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
```

```python
agent_executor.invoke({"input": "what's the average age of survivors"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with `{}`


[0m[38;5;200m[1;3mtitanic[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `{'table_names': 'titanic'}`


[0m[33;1m[1;3m
CREATE TABLE titanic (
	"Survived" BIGINT,
	"Pclass" BIGINT,
	"Name" TEXT,
	"Sex" TEXT,
	"Age" FLOAT,
	"Siblings/Spouses Aboard" BIGINT,
	"Parents/Children Aboard" BIGINT,
	"Fare" FLOAT
)

/*
3 rows from titanic table:
Survived	Pclass	Name	Sex	Age	Siblings/Spouses Aboard	Parents/Children Aboard	Fare
0	3	Mr. Owen Harris Braund	male	22.0	1	0	7.25
1	1	Mrs. John Bradley (Florence Briggs Thayer) Cumings	female	38.0	1	0	71.2833
1	3	Miss. Laina Heikkinen	female	26.0	0	0	7.925
*/[0m[32;1m[1;3m
Invoking: `sql_db_query` with `{'query': 'SELECT AVG(Age) AS AverageAge FROM titanic WHERE Survived = 1'}`
responded: To find the average age of survivors, I will query the "titanic" table and calculate the average of the "Age" column for the rows where "Survived" is equal to 1.

Here is the SQL query:

    ```sql
    SELECT AVG(Age) AS AverageAge
    FROM titanic
    WHERE Survived = 1
    ```

Executing this query will give us the average age of the survivors.

[0m[36;1m[1;3m[(28.408391812865496,)][0m[32;1m[1;3mThe average age of the survivors is approximately 28.41 years.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's the average age of survivors",
 'output': 'The average age of the survivors is approximately 28.41 years.'}
```

Este enfoque se generaliza fácilmente a varios CSV, ya que podemos cargar cada uno de ellos en nuestra base de datos como su propia tabla. Dirígete a la [guía de SQL](/docs/use_cases/sql/) para más información.

## Pandas

En lugar de SQL, también podemos usar bibliotecas de análisis de datos como pandas y las capacidades de generación de código de los LLM para interactuar con los datos CSV. De nuevo, **este enfoque no es adecuado para casos de uso de producción a menos que tengas amplias salvaguardas en su lugar**. Por esta razón, nuestras utilidades y constructores de ejecución de código se encuentran en el paquete `langchain-experimental`.

### Cadena

La mayoría de los LLM han sido entrenados en suficiente código de Python de pandas que pueden generarlo simplemente con que se les pida:

```python
ai_msg = llm.invoke(
    "I have a pandas DataFrame 'df' with columns 'Age' and 'Fare'. Write code to compute the correlation between the two columns. Return Markdown for a Python code snippet and nothing else."
)
print(ai_msg.content)
```

```output
    ```python
    correlation = df['Age'].corr(df['Fare'])
    correlation
    ```
```

Podemos combinar esta capacidad con una herramienta de ejecución de Python para crear una cadena simple de análisis de datos. Primero querremos cargar nuestra tabla CSV como un dataframe y dar a la herramienta acceso a este dataframe:

```python
import pandas as pd
from langchain_core.prompts import ChatPromptTemplate
from langchain_experimental.tools import PythonAstREPLTool

df = pd.read_csv("titanic.csv")
tool = PythonAstREPLTool(locals={"df": df})
tool.invoke("df['Fare'].mean()")
```

```output
32.30542018038331
```

Para ayudar a hacer cumplir el uso adecuado de nuestra herramienta de Python, usaremos [llamada de función](/docs/modules/model_io/chat/function_calling):

```python
llm_with_tools = llm.bind_tools([tool], tool_choice=tool.name)
llm_with_tools.invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_6TZsNaCqOcbP7lqWudosQTd6', 'function': {'arguments': '{\n  "query": "df[[\'Age\', \'Fare\']].corr()"\n}', 'name': 'python_repl_ast'}, 'type': 'function'}]})
```

Agregaremos un [analizador de salida de herramientas de OpenAI](/docs/modules/model_io/output_parsers/types/openai_tools) para extraer la llamada de función como un diccionario:

```python
from langchain.output_parsers.openai_tools import JsonOutputKeyToolsParser

parser = JsonOutputKeyToolsParser(tool.name, first_tool_only=True)
(llm_with_tools | parser).invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
```

```output
{'query': "df[['Age', 'Fare']].corr()"}
```

Y combinaremos con un mensaje para que podamos especificar una pregunta sin necesidad de especificar la información del dataframe en cada invocación:

```python
system = f"""You have access to a pandas dataframe `df`. \
Here is the output of `df.head().to_markdown()`:

    ```
    {df.head().to_markdown()}
    ```

Given a user question, write the Python code to answer it. \
Return ONLY the valid Python code and nothing else. \
Don't assume you have access to any libraries other than built-in Python ones and pandas."""
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{question}")])
code_chain = prompt | llm_with_tools | parser
code_chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
{'query': "df[['Age', 'Fare']].corr()"}
```

Y por último, agregaremos nuestra herramienta de Python para que el código generado se ejecute realmente:

```python
chain = prompt | llm_with_tools | parser | tool  # noqa
chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
0.11232863699941621
```

¡Y así tenemos una cadena simple de análisis de datos! Podemos echar un vistazo a los pasos intermedios mirando el rastro de LangSmith: https://smith.langchain.com/public/b1309290-7212-49b7-bde2-75b39a32b49a/r

Podríamos agregar una llamada LLM adicional al final para generar una respuesta conversacional, de modo que no estemos respondiendo solo con la salida de la herramienta. Para esto, querremos agregar un historial de chat `MessagesPlaceholder` a nuestro mensaje:

```python
from operator import itemgetter

from langchain_core.messages import ToolMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough

system = f"""You have access to a pandas dataframe `df`. \
Here is the output of `df.head().to_markdown()`:

    ```
    {df.head().to_markdown()}
    ```

Given a user question, write the Python code to answer it. \
Don't assume you have access to any libraries other than built-in Python ones and pandas.
Respond directly to the question once you have enough information to answer it."""
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            system,
        ),
        ("human", "{question}"),
        # This MessagesPlaceholder allows us to optionally append an arbitrary number of messages
        # at the end of the prompt using the 'chat_history' arg.
        MessagesPlaceholder("chat_history", optional=True),
    ]
)


def _get_chat_history(x: dict) -> list:
    """Parse the chain output up to this point into a list of chat history messages to insert in the prompt."""
    ai_msg = x["ai_msg"]
    tool_call_id = x["ai_msg"].additional_kwargs["tool_calls"][0]["id"]
    tool_msg = ToolMessage(tool_call_id=tool_call_id, content=str(x["tool_output"]))
    return [ai_msg, tool_msg]


chain = (
    RunnablePassthrough.assign(ai_msg=prompt | llm_with_tools)
    .assign(tool_output=itemgetter("ai_msg") | parser | tool)
    .assign(chat_history=_get_chat_history)
    .assign(response=prompt | llm | StrOutputParser())
    .pick(["tool_output", "response"])
)
```

```python
chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
{'tool_output': 0.11232863699941621,
 'response': 'The correlation between age and fare is approximately 0.112.'}
```

Aquí está el rastro de LangSmith para esta ejecución: https://smith.langchain.com/public/ca689f8a-5655-4224-8bcf-982080744462/r

### Agente

Para preguntas complejas, puede ser útil que un LLM pueda ejecutar código de forma iterativa mientras mantiene las entradas y salidas de sus ejecuciones anteriores. Aquí es donde entran en juego los Agentes. Permiten que un LLM decida cuántas veces se debe invocar una herramienta y mantenga un seguimiento de las ejecuciones que ha realizado hasta ahora. El [create_pandas_dataframe_agent](https://api.python.langchain.com/en/latest/agents/langchain_experimental.agents.agent_toolkits.pandas.base.create_pandas_dataframe_agent.html) es un agente integrado que facilita el trabajo con dataframes:

```python
from langchain_experimental.agents import create_pandas_dataframe_agent

agent = create_pandas_dataframe_agent(llm, df, agent_type="openai-tools", verbose=True)
agent.invoke(
    {
        "input": "What's the correlation between age and fare? is that greater than the correlation between fare and survival?"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `python_repl_ast` with `{'query': "df[['Age', 'Fare']].corr()"}`


[0m[36;1m[1;3m           Age      Fare
Age   1.000000  0.112329
Fare  0.112329  1.000000[0m[32;1m[1;3m
Invoking: `python_repl_ast` with `{'query': "df[['Fare', 'Survived']].corr()"}`


[0m[36;1m[1;3m              Fare  Survived
Fare      1.000000  0.256179
Survived  0.256179  1.000000[0m[32;1m[1;3mThe correlation between age and fare is 0.112329, while the correlation between fare and survival is 0.256179. Therefore, the correlation between fare and survival is greater than the correlation between age and fare.[0m

[1m> Finished chain.[0m
```

```output
{'input': "What's the correlation between age and fare? is that greater than the correlation between fare and survival?",
 'output': 'The correlation between age and fare is 0.112329, while the correlation between fare and survival is 0.256179. Therefore, the correlation between fare and survival is greater than the correlation between age and fare.'}
```

Aquí está el rastro de LangSmith para esta ejecución: https://smith.langchain.com/public/8e6c23cc-782c-4203-bac6-2a28c770c9f0/r

### Múltiples CSVs

Para manejar múltiples CSVs (o dataframes) solo necesitamos pasar múltiples dataframes a nuestra herramienta de Python. Nuestro constructor `create_pandas_dataframe_agent` puede hacer esto de forma predeterminada, podemos pasar una lista de dataframes en lugar de solo uno. Si estamos construyendo una cadena nosotros mismos, podemos hacer algo como:

```python
df_1 = df[["Age", "Fare"]]
df_2 = df[["Fare", "Survived"]]

tool = PythonAstREPLTool(locals={"df_1": df_1, "df_2": df_2})
llm_with_tool = llm.bind_tools(tools=[tool], tool_choice=tool.name)
df_template = """```python
{df_name}.head().to_markdown()
>>> {df_head}
    ```"""
df_context = "\n\n".join(
    df_template.format(df_head=_df.head().to_markdown(), df_name=df_name)
    for _df, df_name in [(df_1, "df_1"), (df_2, "df_2")]
)

system = f"""You have access to a number of pandas dataframes. \
Here is a sample of rows from each dataframe and the python code that was used to generate the sample:

{df_context}

Given a user question about the dataframes, write the Python code to answer it. \
Don't assume you have access to any libraries other than built-in Python ones and pandas. \
Make sure to refer only to the variables mentioned above."""
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{question}")])

chain = prompt | llm_with_tool | parser | tool
chain.invoke(
    {
        "question": "return the difference in the correlation between age and fare and the correlation between fare and survival"
    }
)
```

```output
-0.14384991262954416
```

Aquí está el rastro de LangSmith para esta ejecución: https://smith.langchain.com/public/653e499f-179c-4757-8041-f5e2a5f11fcc/r

### Ejecución de código en un entorno aislado

Hay una serie de herramientas como [E2B](/docs/integrations/tools/e2b_data_analysis) y [Bearly](/docs/integrations/tools/bearly) que proporcionan entornos aislados para la ejecución de código de Python, para permitir cadenas y agentes de ejecución de código más seguros.

## Próximos pasos

Para aplicaciones de análisis de datos más avanzadas, le recomendamos que revise:

* [Caso de uso de SQL](/docs/use_cases/sql/): Muchos de los desafíos de trabajar con bases de datos SQL y CSV son genéricos para cualquier tipo de datos estructurados, por lo que es útil leer las técnicas de SQL incluso si está usando Pandas para el análisis de datos CSV.
* [Uso de herramientas](/docs/use_cases/tool_use/): Guías sobre las mejores prácticas generales al trabajar con cadenas y agentes que invocan herramientas.
* [Agentes](/docs/modules/agents/): Comprender los fundamentos de la construcción de agentes de LLM.
* Integraciones: Entornos aislados como [E2B](/docs/integrations/tools/e2b_data_analysis) y [Bearly](/docs/integrations/tools/bearly), utilidades como [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html#langchain_community.utilities.sql_database.SQLDatabase), agentes relacionados como [Spark DataFrame agent](/docs/integrations/toolkits/spark).
