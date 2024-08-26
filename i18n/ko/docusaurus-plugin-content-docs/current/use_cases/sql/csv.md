---
sidebar_position: 5
translated: true
---

# CSV

LLMs는 다양한 데이터 소스를 대상으로 한 질문-응답 시스템을 구축하는 데 매우 유용합니다. 이 섹션에서는 CSV 파일에 저장된 데이터를 대상으로 한 Q&A 시스템을 구축하는 방법을 알아보겠습니다. SQL 데이터베이스와 작업하는 것처럼, CSV 파일과 작업할 때 중요한 점은 LLM에 데이터를 쿼리하고 상호 작용할 수 있는 도구에 대한 접근을 제공하는 것입니다. 이를 수행하는 주요 방법은 다음과 같습니다:

- **권장 방법**: CSV 파일을 SQL 데이터베이스에 로드하고, [SQL 사용 사례 문서](/docs/use_cases/sql/)에 설명된 접근 방식을 사용하는 것입니다.
- LLM에 Python 환경에 대한 접근 권한을 부여하여 Pandas와 같은 라이브러리를 사용하여 데이터와 상호 작용하도록 하는 것입니다.

## ⚠️ 보안 주의 사항 ⚠️

위에서 언급한 두 가지 접근 방식 모두 상당한 위험이 따릅니다. SQL을 사용하면 모델이 생성한 SQL 쿼리를 실행해야 합니다. Pandas와 같은 라이브러리를 사용하면 모델이 Python 코드를 실행해야 합니다. SQL 연결 권한을 엄격히 제한하고 SQL 쿼리를 세척하는 것이 Python 환경을 샌드박싱하는 것보다 더 쉽기 때문에, **CSV 데이터와 상호 작용할 때 SQL을 사용하는 것을 강력히 권장합니다.** 일반적인 보안 모범 사례에 대한 자세한 내용은 [여기](/docs/security)를 참조하십시오.

## 설정

이 가이드에 필요한 종속성:

```python
%pip install -qU langchain langchain-openai langchain-community langchain-experimental pandas
```

필수 환경 변수 설정:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# LangSmith를 사용하는 것이 권장되지만 필수는 아닙니다. 사용하려면 아래 줄의 주석 처리를 해제하십시오.

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

[Titanic 데이터셋](https://www.kaggle.com/datasets/yasserh/titanic-dataset)을 아직 다운로드하지 않았다면 다운로드하십시오:

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

CSV 데이터와 상호 작용할 때 SQL을 사용하는 것이 권장되는 접근 방식입니다. SQL을 사용하면 권한을 제한하고 쿼리를 세척하는 것이 임의의 Python 코드를 사용하는 것보다 더 쉽기 때문입니다.

대부분의 SQL 데이터베이스는 CSV 파일을 테이블로 로드하는 것을 쉽게 만듭니다([DuckDB](https://duckdb.org/docs/data/csv/overview.html), [SQLite](https://www.sqlite.org/csv.html) 등). 일단 CSV 파일을 데이터베이스 테이블로 로드한 후, [SQL 사용 사례 가이드](/docs/use_cases/sql/)에 설명된 모든 체인 및 에이전트 생성 기술을 사용할 수 있습니다. 다음은 SQLite를 사용하여 이 작업을 수행하는 간단한 예입니다:

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

[SQL 에이전트](/docs/use_cases/sql/agents)를 생성하여 상호 작용할 수 있습니다:

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

SELECT AVG(Age) AS AverageAge
FROM titanic
WHERE Survived = 1

Executing this query will give us the average age of the survivors.

[0m[36;1m[1;3m[(28.408391812865496,)][0m[32;1m[1;3mThe average age of the survivors is approximately 28.41 years.[0m

[1m> Finished chain.[0m

```

```output
{'input': "what's the average age of survivors",
 'output': 'The average age of the survivors is approximately 28.41 years.'}
```

이 접근 방식은 여러 CSV 파일에도 쉽게 일반화할 수 있습니다. 각 CSV 파일을 데이터베이스의 별도 테이블로 로드하기만 하면 됩니다. 자세한 내용은 [SQL 가이드](/docs/use_cases/sql/)를 참조하십시오.

## Pandas

SQL 대신 데이터 분석 라이브러리인 pandas와 LLM의 코드 생성 기능을 사용하여 CSV 데이터와 상호 작용할 수도 있습니다. 그러나 **이 접근 방식은 광범위한 안전 장치가 마련되지 않은 한 실제 사용 사례에는 적합하지 않습니다.** 이 때문에 우리의 코드 실행 유틸리티 및 생성자는 `langchain-experimental` 패키지에 있습니다.

### 체인

대부분의 LLM은 충분한 양의 pandas Python 코드를 학습했기 때문에 요청만 하면 코드를 생성할 수 있습니다:

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

이 능력을 Python 실행 도구와 결합하여 간단한 데이터 분석 체인을 만들 수 있습니다. 먼저 CSV 테이블을 데이터프레임으로 로드하고 이 도구가 이 데이터프레임에 접근할 수 있도록 합니다:

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

Python 도구의 올바른 사용을 보장하기 위해 [함수 호출](/docs/modules/model_io/chat/function_calling)을 사용할 것입니다:

```python
llm_with_tools = llm.bind_tools([tool], tool_choice=tool.name)
llm_with_tools.invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_6TZsNaCqOcbP7lqWudosQTd6', 'function': {'arguments': '{\n  "query": "df[[\'Age\', \'Fare\']].corr()"\n}', 'name': 'python_repl_ast'}, 'type': 'function'}]})
```

함수 호출을 dict로 추출하기 위해 [OpenAI 도구 출력 파서](/docs/modules/model_io/output_parsers/types/openai_tools)를 추가할 것입니다:

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

프롬프트와 결합하여 매번 데이터프레임 정보를 지정하지 않고 질문만 지정할 수 있도록 할 것입니다:

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

마지막으로 Python 도구를 추가하여 생성된 코드가 실제로 실행되도록 할 것입니다:

```python
chain = prompt | llm_with_tools | parser | tool  # noqa
chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
0.11232863699941621
```

이렇게 해서 간단한 데이터 분석 체인이 완성되었습니다. 중간 단계를 LangSmith 추적에서 확인할 수 있습니다: https://smith.langchain.com/public/b1309290-7212-49b7-bde2-75b39a32b49a/r

도구 출력만 응답하는 대신 대화형 응답을 생성하기 위해 추가 LLM 호출을 마지막에 추가할 수 있습니다. 이를 위해 프롬프트에 채팅 기록 `MessagesPlaceholder`를 추가할 것입니다:

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

이번 실행의 LangSmith 추적입니다: https://smith.langchain.com/public/ca689f8a-5655-4224-8bcf-982080744462/r

### 에이전트

복잡한 질문의 경우, LLM이 이전 실행의 입력과 출력을 유지하면서 코드를 반복적으로 실행할 수 있는 것이 유용할 수 있습니다. 이때 에이전트가 필요합니다. 에이전트는 LLM이 도구를 몇 번 호출해야 하는지 결정하고 지금까지 수행한 실행을 기록할 수 있게 합니다. [create_pandas_dataframe_agent](https://api.python.langchain.com/en/latest/agents/langchain_experimental.agents.agent_toolkits.pandas.base.create_pandas_dataframe_agent.html)는 데이터프레임과 쉽게 작업할 수 있게 해주는 내장 에이전트입니다:

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

이번 실행의 LangSmith 추적입니다: https://smith.langchain.com/public/8e6c23cc-782c-4203-bac6-2a28c770c9f0/r

### 여러 CSV 파일

여러 CSV 파일(또는 데이터프레임)을 처리하려면 Python 도구에 여러 데이터프레임을 전달하기만 하면 됩니다. `create_pandas_dataframe_agent` 생성자는 기본적으로 이 작업을 수행할 수 있으며, 하나의 데이터프레임 대신 여러 데이터프레임을 전달할 수 있습니다. 체인을 직접 구성하는 경우 다음과 같은 작업을 수행할 수 있습니다:

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

이번 실행의 LangSmith 추적입니다: https://smith.langchain.com/public/653e499f-179c-4757-8041-f5e2a5f11fcc/r

### 샌드박스 코드 실행

[이투비](/docs/integrations/tools/e2b_data_analysis) 및 [베얼리](/docs/integrations/tools/bearly)와 같은 여러 도구가 Python 코드 실행을 위한 샌드박스 환경을 제공하여, 더 안전한 코드 실행 체인 및 에이전트를 허용합니다.

## 다음 단계

보다 고급 데이터 분석 애플리케이션을 위해 다음을 참조하는 것이 좋습니다:

- [SQL 사용 사례](/docs/use_cases/sql/): SQL DB 및 CSV 작업의 많은 과제는 모든 구조화된 데이터 유형에 일반적이므로, CSV 데이터 분석을 위해 Pandas를 사용하는 경우에도 SQL 기술을 읽어보는 것이 유용합니다.
- [도구 사용](/docs/use_cases/tool_use/): 도구를 호출하는 체인 및 에이전트 작업 시 일반적인 모범 사례에 대한 가이드
- [에이전트](/docs/modules/agents/): LLM 에이전트를 구축하는 기본 사항 이해하기.
- 통합: [이투비](/docs/integrations/tools/e2b_data_analysis) 및 [베얼리](/docs/integrations/tools/bearly)와 같은 샌드박스 환경, [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html#langchain_community.utilities.sql_database.SQLDatabase)와 같은 유틸리티, 관련 에이전트 [스파크 데이터프레임 에이전트](/docs/integrations/toolkits/spark).