---
translated: true
---

# Jira

このノートブックでは、`Jira`ツールキットの使用方法について説明します。

`Jira`ツールキットを使うと、エージェントは特定のJiraインスタンスと対話し、課題の検索や課題の作成などのアクションを実行できます。このツールは、atlassian-python-apiライブラリをラップしています。詳細については、https://atlassian-python-api.readthedocs.io/jira.htmlを参照してください。

このツールを使用するには、まず次の環境変数を設定する必要があります:
    JIRA_API_TOKEN
    JIRA_USERNAME
    JIRA_INSTANCE_URL

```python
%pip install --upgrade --quiet  atlassian-python-api
```

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.jira.toolkit import JiraToolkit
from langchain_community.utilities.jira import JiraAPIWrapper
from langchain_openai import OpenAI
```

```python
os.environ["JIRA_API_TOKEN"] = "abc"
os.environ["JIRA_USERNAME"] = "123"
os.environ["JIRA_INSTANCE_URL"] = "https://jira.atlassian.com"
os.environ["OPENAI_API_KEY"] = "xyz"
```

```python
llm = OpenAI(temperature=0)
jira = JiraAPIWrapper()
toolkit = JiraToolkit.from_jira_api_wrapper(jira)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

```python
agent.run("make a new issue in project PW to remind me to make more fried rice")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to create an issue in project PW
Action: Create Issue
Action Input: {"summary": "Make more fried rice", "description": "Reminder to make more fried rice", "issuetype": {"name": "Task"}, "priority": {"name": "Low"}, "project": {"key": "PW"}}[0m
Observation: [38;5;200m[1;3mNone[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: A new issue has been created in project PW with the summary "Make more fried rice" and description "Reminder to make more fried rice".[0m

[1m> Finished chain.[0m
```

```output
'A new issue has been created in project PW with the summary "Make more fried rice" and description "Reminder to make more fried rice".'
```
