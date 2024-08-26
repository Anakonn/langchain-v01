---
translated: true
---

# पैंडास डेटाफ्रेम

यह नोटबुक दिखाता है कि `पैंडास डेटाफ्रेम` के साथ एजेंटों का उपयोग कैसे किया जाता है। यह अधिकांश प्रश्न उत्तर के लिए अनुकूलित है।

**नोट: यह एजेंट `Python` एजेंट को नीचे से कॉल करता है, जो LLM जनरेट किए गए Python कोड को निष्पादित करता है - यह खराब हो सकता है अगर LLM जनरेट किया गया Python कोड हानिकारक है। सावधानी से उपयोग करें।**

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

## `ZERO_SHOT_REACT_DESCRIPTION` का उपयोग करना

यह दिखाता है कि `ZERO_SHOT_REACT_DESCRIPTION` एजेंट प्रकार का उपयोग करके एजेंट को कैसे प्रारंभ किया जाए।

```python
agent = create_pandas_dataframe_agent(OpenAI(temperature=0), df, verbose=True)
```

## OpenAI फ़ंक्शन का उपयोग करना

यह दिखाता है कि OPENAI_FUNCTIONS एजेंट प्रकार का उपयोग करके एजेंट को कैसे प्रारंभ किया जाए। ध्यान दें कि यह उपरोक्त का एक वैकल्पिक है।

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

## बहु डेटाफ्रेम उदाहरण

यह अगला भाग दिखाता है कि एजेंट सूची में पारित किए गए एक से अधिक डेटाफ्रेम के साथ कैसे संवाद कर सकता है।

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
