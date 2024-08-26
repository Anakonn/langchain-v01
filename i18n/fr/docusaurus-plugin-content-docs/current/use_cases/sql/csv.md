---
sidebar_position: 5
translated: true
---

# CSV

Les LLM sont excellents pour construire des systèmes de questions-réponses sur différents types de sources de données. Dans cette section, nous verrons comment construire des systèmes de Q&A sur des données stockées dans un ou plusieurs fichiers CSV. Comme pour travailler avec des bases de données SQL, la clé pour travailler avec des fichiers CSV est de donner à un LLM l'accès aux outils permettant d'interroger et d'interagir avec les données. Les deux principales façons de procéder sont :

* **RECOMMANDÉ** : Charger le(s) CSV dans une base de données SQL et utiliser les approches décrites dans les [documents sur le cas d'utilisation SQL](/docs/use_cases/sql/).
* Donner à l'LLM l'accès à un environnement Python où il peut utiliser des bibliothèques comme Pandas pour interagir avec les données.

## ⚠️ Note de sécurité ⚠️

Les deux approches mentionnées ci-dessus comportent des risques importants. L'utilisation de SQL nécessite l'exécution de requêtes SQL générées par le modèle. L'utilisation d'une bibliothèque comme Pandas nécessite de laisser le modèle exécuter du code Python. Étant donné qu'il est plus facile de limiter strictement les autorisations de connexion SQL et de sanitiser les requêtes SQL que de sandbox les environnements Python, **nous vous recommandons FORTEMENT d'interagir avec les données CSV via SQL.** Pour plus d'informations sur les meilleures pratiques de sécurité en général, [voir ici](/docs/security).

## Configuration

Dépendances pour ce guide :

```python
%pip install -qU langchain langchain-openai langchain-community langchain-experimental pandas
```

Définir les variables d'environnement requises :

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Using LangSmith is recommended but not required. Uncomment below lines to use.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

Télécharger le [jeu de données Titanic](https://www.kaggle.com/datasets/yasserh/titanic-dataset) si vous ne l'avez pas déjà :

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

L'utilisation de SQL pour interagir avec les données CSV est l'approche recommandée car il est plus facile de limiter les autorisations et de sanitiser les requêtes que dans le cas d'un code Python arbitraire.

La plupart des bases de données SQL facilitent le chargement d'un fichier CSV en tant que table ([DuckDB](https://duckdb.org/docs/data/csv/overview.html), [SQLite](https://www.sqlite.org/csv.html), etc.). Une fois que vous l'avez fait, vous pouvez utiliser toutes les techniques de chaîne et de création d'agents décrites dans le [guide d'utilisation SQL](/docs/use_cases/sql/). Voici un exemple rapide de la façon dont nous pourrions procéder avec SQLite :

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

Et créer un [agent SQL](/docs/use_cases/sql/agents) pour interagir avec lui :

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

Cette approche se généralise facilement à plusieurs CSV, car nous pouvons simplement charger chacun d'eux dans notre base de données en tant que table. Rendez-vous dans le [guide SQL](/docs/use_cases/sql/) pour en savoir plus.

## Pandas

Au lieu de SQL, nous pouvons également utiliser des bibliothèques d'analyse de données comme pandas et les capacités de génération de code des LLM pour interagir avec les données CSV. Là encore, **cette approche n'est pas adaptée aux cas d'utilisation de production à moins que vous n'ayez mis en place des garde-fous importants**. Pour cette raison, nos utilitaires et constructeurs d'exécution de code se trouvent dans le package `langchain-experimental`.

### Chaîne

La plupart des LLM ont été formés sur suffisamment de code Python pandas pour pouvoir le générer simplement en leur demandant :

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

Nous pouvons combiner cette capacité avec un outil d'exécution de Python pour créer une simple chaîne d'analyse de données. Nous voudrons d'abord charger notre table CSV en tant que dataframe et donner à l'outil l'accès à ce dataframe :

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

Pour aider à faire respecter l'utilisation correcte de notre outil Python, nous utiliserons [l'appel de fonction](/docs/modules/model_io/chat/function_calling) :

```python
llm_with_tools = llm.bind_tools([tool], tool_choice=tool.name)
llm_with_tools.invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_6TZsNaCqOcbP7lqWudosQTd6', 'function': {'arguments': '{\n  "query": "df[[\'Age\', \'Fare\']].corr()"\n}', 'name': 'python_repl_ast'}, 'type': 'function'}]})
```

Nous ajouterons un [analyseur de sortie d'outils OpenAI](/docs/modules/model_io/output_parsers/types/openai_tools) pour extraire l'appel de fonction sous forme de dictionnaire :

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

Et nous le combinerons avec une invite pour que nous puissions simplement spécifier une question sans avoir besoin de spécifier les informations du dataframe à chaque invocation :

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

Enfin, nous ajouterons notre outil Python afin que le code généré soit réellement exécuté :

```python
chain = prompt | llm_with_tools | parser | tool  # noqa
chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
0.11232863699941621
```

Et voilà, nous avons une simple chaîne d'analyse de données. Nous pouvons jeter un coup d'œil aux étapes intermédiaires en examinant la trace LangSmith : https://smith.langchain.com/public/b1309290-7212-49b7-bde2-75b39a32b49a/r

Nous pourrions ajouter un appel LLM supplémentaire à la fin pour générer une réponse conversationnelle, afin de ne pas répondre uniquement avec la sortie de l'outil. Pour cela, nous voudrons ajouter un historique de discussion `MessagesPlaceholder` à notre invite :

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

Voici la trace LangSmith pour cette exécution : https://smith.langchain.com/public/ca689f8a-5655-4224-8bcf-982080744462/r

### Agent

Pour les questions complexes, il peut être utile qu'un LLM puisse exécuter du code de manière itérative tout en conservant les entrées et les sorties de ses exécutions précédentes. C'est là qu'interviennent les agents. Ils permettent à un LLM de décider combien de fois un outil doit être invoqué et de garder une trace des exécutions qu'il a effectuées jusqu'à présent. L'[agent create_pandas_dataframe_agent](https://api.python.langchain.com/en/latest/agents/langchain_experimental.agents.agent_toolkits.pandas.base.create_pandas_dataframe_agent.html) est un agent intégré qui facilite le travail avec les dataframes :

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

Voici la trace LangSmith pour cette exécution : https://smith.langchain.com/public/8e6c23cc-782c-4203-bac6-2a28c770c9f0/r

### Plusieurs CSV

Pour gérer plusieurs CSV (ou dataframes), nous devons simplement passer plusieurs dataframes à notre outil Python. Notre constructeur `create_pandas_dataframe_agent` peut le faire directement, nous pouvons passer une liste de dataframes au lieu d'un seul. Si nous construisons une chaîne nous-mêmes, nous pouvons faire quelque chose comme :

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

Voici la trace LangSmith pour cette exécution : https://smith.langchain.com/public/653e499f-179c-4757-8041-f5e2a5f11fcc/r

### Exécution de code en bac à sable

Il existe un certain nombre d'outils comme [E2B](/docs/integrations/tools/e2b_data_analysis) et [Bearly](/docs/integrations/tools/bearly) qui fournissent des environnements en bac à sable pour l'exécution de code Python, afin de permettre des chaînes et des agents d'exécution de code plus sûrs.

## Prochaines étapes

Pour des applications d'analyse de données plus avancées, nous vous recommandons de consulter :

* [Cas d'utilisation SQL](/docs/use_cases/sql/) : de nombreux défis liés au travail avec les bases de données SQL et les CSV sont génériques à tout type de données structurées, il est donc utile de lire les techniques SQL même si vous utilisez Pandas pour l'analyse de données CSV.
* [Utilisation des outils](/docs/use_cases/tool_use/) : guides sur les meilleures pratiques générales lors du travail avec des chaînes et des agents qui invoquent des outils
* [Agents](/docs/modules/agents/) : comprendre les fondamentaux de la construction d'agents LLM.
* Intégrations : environnements en bac à sable comme [E2B](/docs/integrations/tools/e2b_data_analysis) et [Bearly](/docs/integrations/tools/bearly), utilitaires comme [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html#langchain_community.utilities.sql_database.SQLDatabase), agents connexes comme [l'agent Spark DataFrame](/docs/integrations/toolkits/spark).
