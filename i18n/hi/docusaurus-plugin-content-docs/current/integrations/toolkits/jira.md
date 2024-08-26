---
translated: true
---

# जिरा

यह नोटबुक `जिरा` टूलकिट का उपयोग करने के बारे में चर्चा करता है।

`जिरा` टूलकिट एजेंटों को दिए गए जिरा इंस्टेंस के साथ बातचीत करने की अनुमति देता है, जैसे मुद्दों की खोज करना और मुद्दे बनाना, यह टूल atlassian-python-api लाइब्रेरी को लपेटता है, अधिक जानकारी के लिए देखें: https://atlassian-python-api.readthedocs.io/jira.html

इस टूल का उपयोग करने के लिए, आपको पहले निम्नलिखित को पर्यावरण चर के रूप में सेट करना होगा:
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
