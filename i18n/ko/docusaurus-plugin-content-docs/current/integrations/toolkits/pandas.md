---
translated: true
---

# Pandas 데이터프레임

이 노트북은 `Pandas DataFrame`과 상호 작용하는 방법을 보여줍니다. 주로 질문 답변에 최적화되어 있습니다.

**주의: 이 에이전트는 내부적으로 `Python` 에이전트를 호출하여 LLM이 생성한 Python 코드를 실행합니다. LLM이 생성한 Python 코드가 해로울 경우 나쁠 수 있습니다. 주의해서 사용하세요.**

```python
from langchain.agents.agent_types import AgentType
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain_openai import ChatOpenAI
```

```python
import pandas as pd
from langchain_openai import OpenAI

df = pd.read_csv(
    "https://raw.githubusercontent.com/pandas-dev/pandas/main/doc/data/titanic.csv"
)
```

## `ZERO_SHOT_REACT_DESCRIPTION` 사용하기

이것은 `ZERO_SHOT_REACT_DESCRIPTION` 에이전트 유형을 사용하여 에이전트를 초기화하는 방법을 보여줍니다.

```python
agent = create_pandas_dataframe_agent(OpenAI(temperature=0), df, verbose=True)
```

## OpenAI 함수 사용하기

이것은 OPENAI_FUNCTIONS 에이전트 유형을 사용하여 에이전트를 초기화하는 방법을 보여줍니다. 이것은 위의 방법에 대한 대안입니다.

```python
agent = create_pandas_dataframe_agent(
    ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613"),
    df,
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
```

```python
agent.invoke("how many rows are there?")
```

```output


[1m> Entering new  chain...[0m
[32;1m[1;3m
Invoking: `python_repl_ast` with `df.shape[0]`


[0m[36;1m[1;3m891[0m[32;1m[1;3mThere are 891 rows in the dataframe.[0m

[1m> Finished chain.[0m
```

```output
'There are 891 rows in the dataframe.'
```

```python
agent.invoke("how many people have more than 3 siblings")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThought: I need to count the number of people with more than 3 siblings
Action: python_repl_ast
Action Input: df[df['SibSp'] > 3].shape[0][0m
Observation: [36;1m[1;3m30[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: 30 people have more than 3 siblings.[0m

[1m> Finished chain.[0m
```

```output
'30 people have more than 3 siblings.'
```

```python
agent.invoke("whats the square root of the average age?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThought: I need to calculate the average age first
Action: python_repl_ast
Action Input: df['Age'].mean()[0m
Observation: [36;1m[1;3m29.69911764705882[0m
Thought:[32;1m[1;3m I now need to calculate the square root of the average age
Action: python_repl_ast
Action Input: math.sqrt(df['Age'].mean())[0m
Observation: [36;1m[1;3mNameError("name 'math' is not defined")[0m
Thought:[32;1m[1;3m I need to import the math library
Action: python_repl_ast
Action Input: import math[0m
Observation: [36;1m[1;3m[0m
Thought:[32;1m[1;3m I now need to calculate the square root of the average age
Action: python_repl_ast
Action Input: math.sqrt(df['Age'].mean())[0m
Observation: [36;1m[1;3m5.449689683556195[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: The square root of the average age is 5.449689683556195.[0m

[1m> Finished chain.[0m
```

```output
'The square root of the average age is 5.449689683556195.'
```

## 다중 데이터프레임 예제

다음 부분에서는 에이전트가 리스트로 전달된 여러 데이터프레임과 상호 작용하는 방법을 보여줍니다.

```python
df1 = df.copy()
df1["Age"] = df1["Age"].fillna(df1["Age"].mean())
```

```python
agent = create_pandas_dataframe_agent(OpenAI(temperature=0), [df, df1], verbose=True)
agent.invoke("how many rows in the age column are different?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThought: I need to compare the age columns in both dataframes
Action: python_repl_ast
Action Input: len(df1[df1['Age'] != df2['Age']])[0m
Observation: [36;1m[1;3m177[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: 177 rows in the age column are different.[0m

[1m> Finished chain.[0m
```

```output
'177 rows in the age column are different.'
```
