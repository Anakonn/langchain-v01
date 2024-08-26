---
sidebar_position: 5
translated: true
---

# CSV

LLMは、さまざまなデータソースを使ってQ&Aシステムを構築するのに適しています。このセクションでは、CSVファイルに保存されたデータを使ってQ&Aシステムを構築する方法について説明します。SQLデータベースを使う場合と同様に、CSVファイルを使う際のポイントは、LLMにデータを照会したり操作したりするためのツールを提供することです。主な2つの方法は以下のとおりです:

* **推奨**: CSVをSQLデータベースにロードし、[SQLユースケースのドキュメント](/docs/use_cases/sql/)で説明されているアプローチを使う。
* LLMにPythonの環境を提供し、Pandasなどのライブラリを使ってデータを操作できるようにする。

## ⚠️ セキュリティに関する注意 ⚠️

上記の2つのアプローチには重大なリスクが伴います。SQLを使う場合は、LLMが生成したSQL問い合わせを実行する必要があります。Pandasなどのライブラリを使う場合は、LLMにPythonコードの実行を許可する必要があります。SQLの接続権限を厳密に制限し、SQL問い合わせを適切にサニタイズするのは、Pythonの実行環境をサンドボックス化するよりも容易です。したがって、**CSVデータはSQLを使って操作することを強くお勧めします**。一般的なセキュリティのベストプラクティスについては、[こちら](/docs/security)を参照してください。

## セットアップ

このガイドに必要な依存関係:

```python
%pip install -qU langchain langchain-openai langchain-community langchain-experimental pandas
```

必要な環境変数を設定します:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Using LangSmith is recommended but not required. Uncomment below lines to use.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

[Titanicデータセット](https://www.kaggle.com/datasets/yasserh/titanic-dataset)をダウンロードしていない場合はダウンロードします:

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

SQLを使ってCSVデータを操作するのが推奨されるアプローチです。SQLクエリをサニタイズするのがPythonコードを制限するよりも容易だからです。

ほとんどのSQLデータベースでは、CSVファイルをテーブルとしてロードするのが簡単です([DuckDB](https://duckdb.org/docs/data/csv/overview.html)、[SQLite](https://www.sqlite.org/csv.html)など)。これを行えば、[SQLユースケースガイド](/docs/use_cases/sql/)で説明されているチェーンやエージェントの作成手法を使うことができます。SQLiteでの簡単な例は以下のとおりです:

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

そして、それを操作する[SQLエージェント](/docs/use_cases/sql/agents)を作成します:

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

このアプローチは複数のCSVに簡単に一般化できます。各CSVをデータベースの別のテーブルとしてロードすればよいからです。詳細は[SQLガイド](/docs/use_cases/sql/)を参照してください。

## Pandas

SQLの代わりに、pandasなどのデータ分析ライブラリとLLMのコード生成機能を使ってCSVデータを操作することもできます。ただし、**この方法は、十分な安全対策がない限り、本番環境での使用には適していません**。このため、コード実行ユーティリティとコンストラクタは`langchain-experimental`パッケージにあります。

### Chain

ほとんどのLLMはPandasのPythonコードを十分に学習しているので、単に質問されるだけでそのコードを生成できます:

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

この機能とPythonを実行するツールを組み合わせて、簡単なデータ分析チェーンを作成できます。まず、CSVテーブルをデータフレームとしてロードし、そのデータフレームにツールからアクセスできるようにします:

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

Pythonツールの適切な使用を強制するために、[function calling](/docs/modules/model_io/chat/function_calling)を使います:

```python
llm_with_tools = llm.bind_tools([tool], tool_choice=tool.name)
llm_with_tools.invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_6TZsNaCqOcbP7lqWudosQTd6', 'function': {'arguments': '{\n  "query": "df[[\'Age\', \'Fare\']].corr()"\n}', 'name': 'python_repl_ast'}, 'type': 'function'}]})
```

[OpenAI tools output parser](/docs/modules/model_io/output_parsers/types/openai_tools)を追加して、関数呼び出しをdictとして抽出します:

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

プロンプトに追加して、データフレームの情報を毎回指定する必要なく質問を指定できるようにします:

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

最後に、Pythonツールを追加して、生成されたコードを実際に実行します:

```python
chain = prompt | llm_with_tools | parser | tool  # noqa
chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
0.11232863699941621
```

これで、簡単なデータ分析チェーンができました。中間ステップは、LangSmithトレースで確認できます: https://smith.langchain.com/public/b1309290-7212-49b7-bde2-75b39a32b49a/r

最後にLLMの呼び出しを追加して会話形式の応答を生成することもできます。そのためには、プロンプトにチャット履歴の`MessagesPlaceholder`を追加する必要があります:

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

このケースのLangSmithトレースは以下のとおりです: https://smith.langchain.com/public/ca689f8a-5655-4224-8bcf-982080744462/r

### Agent

複雑な質問の場合は、LLMが前の実行の入力と出力を維持しながら、コードを反復的に実行できるようにするのが役立ちます。これがエージェントの役割です。エージェントにより、LLMはツールを呼び出す回数を決定し、これまでの実行を追跡できます。[create_pandas_dataframe_agent](https://api.python.langchain.com/en/latest/agents/langchain_experimental.agents.agent_toolkits.pandas.base.create_pandas_dataframe_agent.html)は、データフレームを扱うための組み込みのエージェントです:

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

このケースのLangSmithトレースは以下のとおりです: https://smith.langchain.com/public/8e6c23cc-782c-4203-bac6-2a28c770c9f0/r

### 複数のCSV

複数のCSVファイル(またはデータフレーム)を扱うには、Pythonツールに複数のデータフレームを渡すだけでよいです。`create_pandas_dataframe_agent`コンストラクターはこれに対応しており、1つのデータフレームではなくリストを渡すことができます。チェーンを自分で構築する場合は、次のようなことができます:

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

このランの LangSmith トレースは次のリンクから確認できます: https://smith.langchain.com/public/653e499f-179c-4757-8041-f5e2a5f11fcc/r

### サンドボックス化されたコード実行

[E2B](/docs/integrations/tools/e2b_data_analysis)や[Bearly](/docs/integrations/tools/bearly)などのツールは、より安全なコード実行チェーンやエージェントを可能にするサンドボックス環境を提供しています。

## 次のステップ

より高度なデータ分析アプリケーションについては、次のリソースをご確認ください:

* [SQLユースケース](/docs/use_cases/sql/): SQLデータベースやCSVを扱う際の課題の多くは、構造化データ全般に共通するので、Pandasを使ってCSVデータを分析する場合でも、SQLのテクニックを参考にするのが有用です。
* [ツールの使用](/docs/use_cases/tool_use/): チェーンやエージェントでツールを呼び出す際のベストプラクティス
* [エージェント](/docs/modules/agents/): LLMエージェントの基本を理解する
* 統合: [E2B](/docs/integrations/tools/e2b_data_analysis)や[Bearly](/docs/integrations/tools/bearly)などのサンドボックス環境、[SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html#langchain_community.utilities.sql_database.SQLDatabase)などのユーティリティ、[Spark DataFrame agent](/docs/integrations/toolkits/spark)などの関連エージェント
