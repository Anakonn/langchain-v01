---
translated: true
---

# CSV

이 노트북은 `CSV` 형식의 데이터와 상호 작용하는 방법을 보여줍니다. 주로 질문 답변에 최적화되어 있습니다.

**주의: 이 에이전트는 내부적으로 Pandas DataFrame 에이전트를 호출하며, 이는 다시 Python 에이전트를 호출하여 LLM이 생성한 Python 코드를 실행합니다. LLM이 생성한 Python 코드가 해로울 경우 문제가 될 수 있습니다. 주의해서 사용하세요.**

```python
from langchain.agents.agent_types import AgentType
from langchain_experimental.agents.agent_toolkits import create_csv_agent
from langchain_openai import ChatOpenAI, OpenAI
```

## `ZERO_SHOT_REACT_DESCRIPTION` 사용하기

이 섹션에서는 `ZERO_SHOT_REACT_DESCRIPTION` 에이전트 유형을 사용하여 에이전트를 초기화하는 방법을 보여줍니다.

```python
agent = create_csv_agent(
    OpenAI(temperature=0),
    "titanic.csv",
    verbose=True,
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
)
```

## OpenAI 함수 사용하기

이 섹션에서는 OPENAI_FUNCTIONS 에이전트 유형을 사용하여 에이전트를 초기화하는 방법을 보여줍니다. 이는 위의 방법에 대한 대안입니다.

```python
agent = create_csv_agent(
    ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613"),
    "titanic.csv",
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
```

```python
agent.run("how many rows are there?")
```

```output
Error in on_chain_start callback: 'name'

[32;1m[1;3m
Invoking: `python_repl_ast` with `df.shape[0]`


[0m[36;1m[1;3m891[0m[32;1m[1;3mThere are 891 rows in the dataframe.[0m

[1m> Finished chain.[0m
```

```output
'There are 891 rows in the dataframe.'
```

```python
agent.run("how many people have more than 3 siblings")
```

```output
Error in on_chain_start callback: 'name'

[32;1m[1;3m
Invoking: `python_repl_ast` with `df[df['SibSp'] > 3]['PassengerId'].count()`


[0m[36;1m[1;3m30[0m[32;1m[1;3mThere are 30 people in the dataframe who have more than 3 siblings.[0m

[1m> Finished chain.[0m
```

```output
'There are 30 people in the dataframe who have more than 3 siblings.'
```

```python
agent.run("whats the square root of the average age?")
```

```output
Error in on_chain_start callback: 'name'

[32;1m[1;3m
Invoking: `python_repl_ast` with `import pandas as pd
import math

# Create a dataframe
data = {'Age': [22, 38, 26, 35, 35]}
df = pd.DataFrame(data)

# Calculate the average age
average_age = df['Age'].mean()

# Calculate the square root of the average age
square_root = math.sqrt(average_age)

square_root`


[0m[36;1m[1;3m5.585696017507576[0m[32;1m[1;3mThe square root of the average age is approximately 5.59.[0m

[1m> Finished chain.[0m
```

```output
'The square root of the average age is approximately 5.59.'
```

### 다중 CSV 예제

다음 부분에서는 에이전트가 리스트로 전달된 여러 CSV 파일과 상호 작용하는 방법을 보여줍니다.

```python
agent = create_csv_agent(
    ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613"),
    ["titanic.csv", "titanic_age_fillna.csv"],
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
agent.run("how many rows in the age column are different between the two dfs?")
```

```output
Error in on_chain_start callback: 'name'

[32;1m[1;3m
Invoking: `python_repl_ast` with `df1['Age'].nunique() - df2['Age'].nunique()`


[0m[36;1m[1;3m-1[0m[32;1m[1;3mThere is 1 row in the age column that is different between the two dataframes.[0m

[1m> Finished chain.[0m
```

```output
'There is 1 row in the age column that is different between the two dataframes.'
```
