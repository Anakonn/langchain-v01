---
translated: true
---

# CSV

Ce cahier montre comment utiliser des agents pour interagir avec des données au format `CSV`. Il est principalement optimisé pour la réponse aux questions.

**REMARQUE : cet agent appelle l'agent Pandas DataFrame sous le capot, qui à son tour appelle l'agent Python, qui exécute du code Python généré par LLM - cela peut être mauvais si le code Python généré par LLM est nuisible. Utilisez avec prudence.**

```python
from langchain.agents.agent_types import AgentType
from langchain_experimental.agents.agent_toolkits import create_csv_agent
from langchain_openai import ChatOpenAI, OpenAI
```

## Utilisation de `ZERO_SHOT_REACT_DESCRIPTION`

Ceci montre comment initialiser l'agent en utilisant le type d'agent `ZERO_SHOT_REACT_DESCRIPTION`.

```python
agent = create_csv_agent(
    OpenAI(temperature=0),
    "titanic.csv",
    verbose=True,
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
)
```

## Utilisation des fonctions OpenAI

Ceci montre comment initialiser l'agent en utilisant le type d'agent OPENAI_FUNCTIONS. Notez qu'il s'agit d'une alternative à ce qui précède.

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

### Exemple multi CSV

Cette partie suivante montre comment l'agent peut interagir avec plusieurs fichiers CSV passés sous forme de liste.

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
