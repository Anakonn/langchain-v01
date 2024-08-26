---
translated: true
---

# ClickUp

>[ClickUp](https://clickup.com/)は、さまざまな業界の小規模および大規模なチームに柔軟でカスタマイズ可能な仕事管理ソリューション、ツール、機能を提供する、オールインワンの生産性プラットフォームです。

>これは、組織目標の達成を支援するコミュニケーションおよびコラボレーションツールを備えた、あらゆるサイズのビジネス向けのクラウドベースのプロジェクト管理ソリューションです。

```python
%reload_ext autoreload
%autoreload 2
from datetime import datetime

from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.clickup.toolkit import ClickupToolkit
from langchain_community.utilities.clickup import ClickupAPIWrapper
from langchain_openai import OpenAI
```

## 初期化

### 認証を取得する

1. [ClickUp App](https://help.clickup.com/hc/en-us/articles/6303422883095-Create-your-own-app-with-the-ClickUp-API)を作成する
2. `client_id`と`client_secret`を取得するために[これらの手順](https://clickup.com/api/developer-portal/authentication/)に従ってください。
    - *提案: `redirect_uri`として`https://google.com`を使用してください。これがこのツールキットのデフォルトで想定されているものです。*
3. それらをコピー/貼り付けて、次のセルを実行して`code`を取得します。

```python
# Copilot Sandbox
oauth_client_id = "ABC..."
oauth_client_secret = "123..."
redirect_uri = "https://google.com"

print("Click this link, select your workspace, click `Connect Workspace`")
print(ClickupAPIWrapper.get_access_code_url(oauth_client_id, redirect_uri))
```

```output
Click this link, select your workspace, click `Connect Workspace`
https://app.clickup.com/api?client_id=ABC...&redirect_uri=https://google.com
```

URLは次のようなものに変わるはずです。 https://www.google.com/?code=THISISMYCODERIGHTHERE。

次に、URLで生成された`CODE`(THISISMYCODERIGHTHERE)をコピー/貼り付けてください。

```python
code = "THISISMYCODERIGHTHERE"
```

### アクセストークンを取得する

次に、以下のコードを使用して`access_token`を取得してください。

*重要*: 各コードは一回限りのコードで、使用後に期限切れになります。`access_token`は一定期間使用できます。`access_token`を取得したら、必ずコピー/貼り付けてください!

```python
access_token = ClickupAPIWrapper.get_access_token(
    oauth_client_id, oauth_client_secret, code
)
```

```output
Error: {'err': 'Code already used', 'ECODE': 'OAUTH_014'}
You already used this code once. Go back a step and generate a new code.
Our best guess for the url to get a new code is:
https://app.clickup.com/api?client_id=B5D61F8EVO04PR0JX0U73984LLS9GI6P&redirect_uri=https://google.com
```

```python
# Init toolkit
clickup_api_wrapper = ClickupAPIWrapper(access_token=access_token)
toolkit = ClickupToolkit.from_clickup_api_wrapper(clickup_api_wrapper)
print(
    f"Found team_id: {clickup_api_wrapper.team_id}.\nMost request require the team id, so we store it for you in the toolkit, we assume the first team in your list is the one you want. \nNote: If you know this is the wrong ID, you can pass it at initialization."
)
```

```output
Found team_id: 9011010153.
Most request require the team id, so we store it for you in the toolkit, we assume the first team in your list is the one you want.
Note: If you know this is the wrong ID, you can pass it at initialization.
```

### エージェントを作成する

```python
llm = OpenAI(temperature=0, openai_api_key="")

agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

## エージェントを使用する

```python
# helper function for demo
def print_and_run(command):
    print("\033[94m$ COMMAND\033[0m")
    print(command)
    print("\n\033[94m$ AGENT\033[0m")
    response = agent.run(command)
    print("".join(["-"] * 80))
    return response
```

### ナビゲーション

ユーザーがアクセスできるチーム、フォルダ、スペースを取得できます。

```python
print_and_run("Get all the teams that the user is authorized to access")
print_and_run("Get all the spaces available to the team")
print_and_run("Get all the folders for the team")
```

```output
[94m$ COMMAND[0m
Get all the teams that the user is authorized to access

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to use the Get Teams tool
Action: Get Teams
Action Input: No necessary request parameters[0m
Observation: [38;5;200m[1;3m{'teams': [{'id': '9011010153', 'name': 'Task Copilot Sandbox Workspace 1', 'members': [{'id': 61681706, 'username': 'Aiswarya ', 'email': 'asankar@clickup.com', 'initials': 'A'}, {'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'email': 'rlentini@clickup.com', 'initials': 'RL'}]}]}[0m
Thought:[32;1m[1;3m I now know the teams the user is authorized to access
Final Answer: The user is authorized to access the team 'Task Copilot Sandbox Workspace 1'.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
Get all the spaces available to the team

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to use the API to get the spaces
Action: Get Teams
Action Input: No necessary request parameters[0m
Observation: [38;5;200m[1;3m{'teams': [{'id': '9011010153', 'name': 'Task Copilot Sandbox Workspace 1', 'members': [{'id': 61681706, 'username': 'Aiswarya ', 'email': 'asankar@clickup.com', 'initials': 'A'}, {'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'email': 'rlentini@clickup.com', 'initials': 'RL'}]}]}[0m
Thought:[32;1m[1;3m I now have the list of teams
Final Answer: The list of teams available to the team is [{'id': '9011010153', 'name': 'Task Copilot Sandbox Workspace 1', 'members': [{'id': 61681706, 'username': 'Aiswarya ', 'email': 'asankar@clickup.com', 'initials': 'A'}, {'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'email': 'rlentini@clickup.com', 'initials': 'RL'}]}][0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
Get all the folders for the team

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to get all the folders for the team
Action: Get all folders in the workspace
Action Input: {"folder_id": "90130119692"}[0m
Observation: [33;1m[1;3m{'spaces': [{'id': '90110075934', 'name': 'Test Space', 'color': None, 'private': False, 'avatar': None, 'admin_can_manage': False, 'statuses': [{'id': 'p90110075934_lBKIEh3r', 'status': 'Open', 'type': 'open', 'orderindex': 0, 'color': '#d3d3d3'}, {'id': 'p90110075934_AvVAnVqy', 'status': 'in progress', 'type': 'custom', 'orderindex': 1, 'color': '#a875ff'}, {'id': 'p90110075934_SftYWzGt', 'status': 'Closed', 'type': 'closed', 'orderindex': 2, 'color': '#6bc950'}], 'multiple_assignees': True, 'features': {'due_dates': {'enabled': True, 'start_date': True, 'remap_due_dates': False, 'remap_closed_due_date': False}, 'sprints': {'enabled': False}, 'time_tracking': {'enabled': True, 'harvest': False, 'rollup': False}, 'points': {'enabled': False}, 'custom_items': {'enabled': False}, 'priorities': {'enabled': True, 'priorities': [{'color': '#f50000', 'id': '1', 'orderindex': '1', 'priority': 'urgent'}, {'color': '#ffcc00', 'id': '2', 'orderindex': '2', 'priority': 'high'}, {'color': '#6fddff', 'id': '3', 'orderindex': '3', 'priority': 'normal'}, {'color': '#d8d8d8', 'id': '4', 'orderindex': '4', 'priority': 'low'}]}, 'tags': {'enabled': True}, 'check_unresolved': {'enabled': True, 'subtasks': None, 'checklists': None, 'comments': None}, 'zoom': {'enabled': False}, 'milestones': {'enabled': False}, 'custom_fields': {'enabled': True}, 'dependency_warning': {'enabled': True}, 'status_pies': {'enabled': False}, 'multiple_assignees': {'enabled': True}}, 'archived': False}]}[0m
Thought:[32;1m[1;3m I now know the folders in the team
Final Answer: The folders in the team are listed in the observation.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
'The folders in the team are listed in the observation.'
```

### タスク操作

タスクを取得したり、質問したり、更新したりできます。

```python
task_id = "8685mb5fn"
```

#### 基本属性の取得と更新

```python
# We can get a task to inspect it's contents
print_and_run(f"Get task with id {task_id}")

# We can get a specific attribute from a task
previous_description = print_and_run(
    f"What is the description of task with id {task_id}"
)

# We can even update it!
print_and_run(
    f"For task with id {task_id}, change the description to 'A cool task descriptiont changed by AI!'"
)
print_and_run(f"What is the description of task with id {task_id}")

# Undo what we did
print_and_run(
    f"For task with id {task_id}, change the description to '{previous_description}'"
)
```

```output
[94m$ COMMAND[0m
Get task with id 8685mb5fn

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to use the Get task tool
Action: Get task
Action Input: {"task_id": "8685mb5fn"}[0m
Observation: [36;1m[1;3m{'id': '8685mb5fn', 'name': 'dummy task 1', 'text_content': 'An old, boring task description', 'description': 'An old, boring task description', 'status': 'to do', 'creator_id': 81928627, 'creator_username': 'Rodrigo Ceballos Lentini', 'creator_email': 'rlentini@clickup.com', 'assignees': [], 'watcher_username': 'Rodrigo Ceballos Lentini', 'watcher_email': 'rlentini@clickup.com', 'priority': 'high', 'due_date': '1694764800000', 'start_date': None, 'points': None, 'team_id': '9011010153', 'project_id': '90110331875'}[0m
Thought:[32;1m[1;3m I now know the task details
Final Answer: The task with id 8685mb5fn has the following details: {'id': '8685mb5fn', 'name': 'dummy task 1', 'text_content': 'An old, boring task description', 'description': 'An old, boring task description', 'status': 'to do', 'creator_id': 81928627, 'creator_username': 'Rodrigo Ceballos Lentini', 'creator_email': 'rlentini@clickup.com', 'assignees': [], 'watcher_username': 'Rodrigo Ceballos Lentini', 'watcher_email': 'rlentini@clickup.com', 'priority': 'high', 'due_date': '1694764800000', 'start_date': None, 'points': None, 'team_id': '9011010153', 'project_id': '90110331875'}[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
What is the description of task with id 8685mb5fn

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to get the description of the task
Action: Get task attribute
Action Input: {"task_id": "8685mb5fn", "attribute_name": "description"}[0m
Observation: [33;1m[1;3mAn old, boring task description[0m
Thought:[32;1m[1;3m I now know the description of the task
Final Answer: An old, boring task description[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
For task with id 8685mb5fn, change the description to 'A cool task descriptiont changed by AI!'

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to update the description of a task
Action: Update task
Action Input: {"task_id": "8685mb5fn", "attribute_name": "description", "value": "A cool task description changed by AI!"}[0m
Observation: [36;1m[1;3m<Response [200]>[0m
Thought:[32;1m[1;3m I have successfully updated the task description
Final Answer: The description of task 8685mb5fn has been successfully changed to 'A cool task description changed by AI!'[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
What is the description of task with id 8685mb5fn

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to get the description of the task
Action: Get task attribute
Action Input: {"task_id": "8685mb5fn", "attribute_name": "description"}[0m
Observation: [33;1m[1;3mA cool task description changed by AI![0m
Thought:[32;1m[1;3m I now know the description of the task
Final Answer: A cool task description changed by AI![0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
For task with id 8685mb5fn, change the description to 'An old, boring task description'

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to update the description of a task
Action: Update task
Action Input: {"task_id": "8685mb5fn", "attribute_name": "description", "value": "An old, boring task description"}[0m
Observation: [36;1m[1;3m<Response [200]>[0m
Thought:[32;1m[1;3m I now know the task description has been updated
Final Answer: The description of task 8685mb5fn has been updated to 'An old, boring task description'.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
"The description of task 8685mb5fn has been updated to 'An old, boring task description'."
```

```python
print_and_run("Change the descrition task 8685mj6cd to 'Look ma no hands'")
```

```output
[94m$ COMMAND[0m
Change the descrition task 8685mj6cd to 'Look ma no hands'

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to update the description of a task
Action: Update task
Action Input: {"task_id": "8685mj6cd", "attribute_name": "description", "value": "Look ma no hands"}[0m
Observation: [36;1m[1;3m<Response [200]>[0m
Thought:[32;1m[1;3m The task description has been successfully updated
Final Answer: The description of task 8685mj6cd has been changed to 'Look ma no hands'.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
"The description of task 8685mj6cd has been changed to 'Look ma no hands'."
```

#### 高度な属性(担当者)

タスクのほぼすべての情報を照会および更新できます!

```python
user_id = 81928627
```

```python
print_and_run(f"What are the assignees of task id {task_id}?")
print_and_run(f"Remove user {user_id} from the assignees of task id {task_id}")
print_and_run(f"What are the assignees of task id {task_id}?")
print_and_run(f"Add user {user_id} from the assignees of task id {task_id}")
```

```output
[94m$ COMMAND[0m
What are the assignees of task id 8685mb5fn?

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to get the assignees of a task
Action: Get task attribute
Action Input: {"task_id": "8685mb5fn", "attribute_name": "assignee"}[0m
Observation: [33;1m[1;3mError: attribute_name = assignee was not found in task keys dict_keys(['id', 'name', 'text_content', 'description', 'status', 'creator_id', 'creator_username', 'creator_email', 'assignees', 'watcher_username', 'watcher_email', 'priority', 'due_date', 'start_date', 'points', 'team_id', 'project_id']). Please call again with one of the key names.[0m
Thought:[32;1m[1;3m I need to get the assignees of a task
Action: Get task attribute
Action Input: {"task_id": "8685mb5fn", "attribute_name": "assignees"}[0m
Observation: [33;1m[1;3m[][0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: There are no assignees for task id 8685mb5fn.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
Remove user 81928627 from the assignees of task id 8685mb5fn

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to update the assignees of a task
Action: Update task assignees
Action Input: {"task_id": "8685mb5fn", "operation": "rem", "users": [81928627]}[0m
Observation: [33;1m[1;3m<Response [200]>[0m
Thought:[32;1m[1;3m The user has been removed from the assignees of the task
Final Answer: User 81928627 has been removed from the assignees of task id 8685mb5fn.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
What are the assignees of task id 8685mb5fn?

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to get the assignees of a task
Action: Get task attribute
Action Input: {"task_id": "8685mb5fn", "attribute_name": "assignee"}[0m
Observation: [33;1m[1;3mError: attribute_name = assignee was not found in task keys dict_keys(['id', 'name', 'text_content', 'description', 'status', 'creator_id', 'creator_username', 'creator_email', 'assignees', 'watcher_username', 'watcher_email', 'priority', 'due_date', 'start_date', 'points', 'team_id', 'project_id']). Please call again with one of the key names.[0m
Thought:[32;1m[1;3m I need to get the assignees of a task
Action: Get task attribute
Action Input: {"task_id": "8685mb5fn", "attribute_name": "assignees"}[0m
Observation: [33;1m[1;3m[][0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: There are no assignees for task id 8685mb5fn.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
[94m$ COMMAND[0m
Add user 81928627 from the assignees of task id 8685mb5fn

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to update the assignees of a task
Action: Update task assignees
Action Input: {"task_id": "8685mb5fn", "operation": "rem", "users": [81928627]}[0m
Observation: [33;1m[1;3m<Response [200]>[0m
Thought:[32;1m[1;3m The user has been removed from the assignees of the task
Final Answer: User 81928627 has been removed from the assignees of task id 8685mb5fn.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
'User 81928627 has been removed from the assignees of task id 8685mb5fn.'
```

### 作成

タスク、リスト、フォルダを作成できます。

```python
time_str = datetime.now().strftime("%d/%m/%Y-%H:%M:%S")
print_and_run(
    f"Create a task called 'Test Task - {time_str}' with description 'This is a Test'"
)
```

```output
[94m$ COMMAND[0m
Create a task called 'Test Task - 18/09/2023-10:31:22' with description 'This is a Test'

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to use the Create Task tool
Action: Create Task
Action Input: {"name": "Test Task - 18/09/2023-10:31:22", "description": "This is a Test"}[0m
Observation: [36;1m[1;3m{'id': '8685mw4wq', 'custom_id': None, 'name': 'Test Task - 18/09/2023-10:31:22', 'text_content': 'This is a Test', 'description': 'This is a Test', 'status': {'id': 'p90110061901_VlN8IJtk', 'status': 'to do', 'color': '#87909e', 'orderindex': 0, 'type': 'open'}, 'orderindex': '23.00000000000000000000000000000000', 'date_created': '1695047486396', 'date_updated': '1695047486396', 'date_closed': None, 'date_done': None, 'archived': False, 'creator': {'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'color': '#c51162', 'email': 'rlentini@clickup.com', 'profilePicture': None}, 'assignees': [], 'watchers': [{'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'color': '#c51162', 'initials': 'RL', 'email': 'rlentini@clickup.com', 'profilePicture': None}], 'checklists': [], 'tags': [], 'parent': None, 'priority': None, 'due_date': None, 'start_date': None, 'points': None, 'time_estimate': None, 'time_spent': 0, 'custom_fields': [], 'dependencies': [], 'linked_tasks': [], 'team_id': '9011010153', 'url': 'https://app.clickup.com/t/8685mw4wq', 'sharing': {'public': False, 'public_share_expires_on': None, 'public_fields': ['assignees', 'priority', 'due_date', 'content', 'comments', 'attachments', 'customFields', 'subtasks', 'tags', 'checklists', 'coverimage'], 'token': None, 'seo_optimized': False}, 'permission_level': 'create', 'list': {'id': '901100754275', 'name': 'Test List', 'access': True}, 'project': {'id': '90110336890', 'name': 'Test Folder', 'hidden': False, 'access': True}, 'folder': {'id': '90110336890', 'name': 'Test Folder', 'hidden': False, 'access': True}, 'space': {'id': '90110061901'}}[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: A task called 'Test Task - 18/09/2023-10:31:22' with description 'This is a Test' was successfully created.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
"A task called 'Test Task - 18/09/2023-10:31:22' with description 'This is a Test' was successfully created."
```

```python
time_str = datetime.now().strftime("%d/%m/%Y-%H:%M:%S")
print_and_run(f"Create a list called Test List - {time_str}")
```

```output
[94m$ COMMAND[0m
Create a list called Test List - 18/09/2023-10:32:12

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to create a list
Action: Create List
Action Input: {"name": "Test List - 18/09/2023-10:32:12"}[0m
Observation: [33;1m[1;3m{'id': '901100774700', 'name': 'Test List - 18/09/2023-10:32:12', 'deleted': False, 'orderindex': 13, 'content': '', 'priority': None, 'assignee': None, 'due_date': None, 'start_date': None, 'folder': {'id': '90110336890', 'name': 'Test Folder', 'hidden': False, 'access': True}, 'space': {'id': '90110061901', 'name': 'Space', 'access': True}, 'inbound_address': 'a.t.901100774700.u-81928627.20b87d50-eece-4721-b487-9ca500338587@tasks.clickup.com', 'archived': False, 'override_statuses': False, 'statuses': [{'id': 'p90110061901_VlN8IJtk', 'status': 'to do', 'orderindex': 0, 'color': '#87909e', 'type': 'open'}, {'id': 'p90110061901_14GpYKnM', 'status': 'complete', 'orderindex': 1, 'color': '#6bc950', 'type': 'closed'}], 'permission_level': 'create'}[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: The list "Test List - 18/09/2023-10:32:12" has been created with id 901100774700.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
'The list "Test List - 18/09/2023-10:32:12" has been created with id 901100774700.'
```

```python
time_str = datetime.now().strftime("%d/%m/%Y-%H:%M:%S")
print_and_run(f"Create a folder called 'Test Folder - {time_str}'")
```

```output
[94m$ COMMAND[0m
Create a folder called 'Test Folder - 18/09/2023-10:32:51'

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to use the Create Folder tool
Action: Create Folder
Action Input: {"name": "Test Folder - 18/09/2023-10:32:51"}[0m
Observation: [38;5;200m[1;3m{'id': '90110348711', 'name': 'Test Folder - 18/09/2023-10:32:51', 'orderindex': 12, 'override_statuses': False, 'hidden': False, 'space': {'id': '90110061901', 'name': 'Space', 'access': True}, 'task_count': '0', 'archived': False, 'statuses': [], 'lists': [], 'permission_level': 'create'}[0m
Thought:[32;1m[1;3m I have successfully created the folder
Final Answer: The folder 'Test Folder - 18/09/2023-10:32:51' has been successfully created.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
"The folder 'Test Folder - 18/09/2023-10:32:51' has been successfully created."
```

```python
time_str = datetime.now().strftime("%d/%m/%Y-%H:%M:%S")
print_and_run(
    f"Create a list called 'Test List - {time_str}' with content My test list with high priority and status red"
)
```

```output
[94m$ COMMAND[0m
Create a list called 'Test List - 18/09/2023-10:34:01' with content My test list with high priority and status red

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to create a list with the given name, content, priority and status
Action: Create List
Action Input: {"name": "Test List - 18/09/2023-10:34:01", "content": "My test list", "priority": 2, "status": "red"}[0m
Observation: [33;1m[1;3m{'id': '901100774746', 'name': 'Test List - 18/09/2023-10:34:01', 'deleted': False, 'orderindex': 15, 'content': '', 'status': {'status': 'red', 'color': '#e50000', 'hide_label': True}, 'priority': {'priority': 'high', 'color': '#ffcc00'}, 'assignee': None, 'due_date': None, 'start_date': None, 'folder': {'id': '90110336890', 'name': 'Test Folder', 'hidden': False, 'access': True}, 'space': {'id': '90110061901', 'name': 'Space', 'access': True}, 'inbound_address': 'a.t.901100774746.u-81928627.2ab87133-728e-4166-b2ae-423cc320df37@tasks.clickup.com', 'archived': False, 'override_statuses': False, 'statuses': [{'id': 'p90110061901_VlN8IJtk', 'status': 'to do', 'orderindex': 0, 'color': '#87909e', 'type': 'open'}, {'id': 'p90110061901_14GpYKnM', 'status': 'complete', 'orderindex': 1, 'color': '#6bc950', 'type': 'closed'}], 'permission_level': 'create'}[0m
Thought:[32;1m[1;3m I have successfully created the list
Final Answer: The list 'Test List - 18/09/2023-10:34:01' with content 'My test list' with high priority and status red has been successfully created.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
"The list 'Test List - 18/09/2023-10:34:01' with content 'My test list' with high priority and status red has been successfully created."
```

## 複数ステップのタスク

```python
print_and_run(
    "Figure out what user ID Rodrigo is, create a task called 'Rod's task', assign it to Rodrigo"
)
```

```output
[94m$ COMMAND[0m
Figure out what user ID Rodrigo is, create a task called 'Rod's task', assign it to Rodrigo

[94m$ AGENT[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to get the user ID of Rodrigo, create a task, and assign it to Rodrigo
Action: Get Teams
Action Input: No input necessary[0m
Observation: [38;5;200m[1;3m{'teams': [{'id': '9011010153', 'name': 'Task Copilot Sandbox Workspace 1', 'members': [{'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'email': 'rlentini@clickup.com', 'initials': 'RL'}]}]}[0m
Thought:[32;1m[1;3m I now have the user ID of Rodrigo
Action: Create Task
Action Input: {"name": "Rod's task", "assignees": [81928627]}[0m

/Users/rodrigolentini/repos/langchain-clickup/libs/langchain/langchain/utilities/clickup.py:145: UserWarning: Error encountered while trying to parse <class 'langchain_community.utilities.clickup.Task'>: 'NoneType' object is not subscriptable
 Falling back to returning input data.
  warnings.warn(f'Error encountered while trying to parse {dataclass}: {e}\n Falling back to returning input data.')


Observation: [36;1m[1;3m{'id': '8685mw6dz', 'custom_id': None, 'name': "Rod's task", 'text_content': '', 'description': '', 'status': {'id': 'p90110061901_VlN8IJtk', 'status': 'to do', 'color': '#87909e', 'orderindex': 0, 'type': 'open'}, 'orderindex': '24.00000000000000000000000000000000', 'date_created': '1695047740939', 'date_updated': '1695047740939', 'date_closed': None, 'date_done': None, 'archived': False, 'creator': {'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'color': '#c51162', 'email': 'rlentini@clickup.com', 'profilePicture': None}, 'assignees': [{'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'color': '#c51162', 'initials': 'RL', 'email': 'rlentini@clickup.com', 'profilePicture': None}], 'watchers': [{'id': 81928627, 'username': 'Rodrigo Ceballos Lentini', 'color': '#c51162', 'initials': 'RL', 'email': 'rlentini@clickup.com', 'profilePicture': None}], 'checklists': [], 'tags': [], 'parent': None, 'priority': None, 'due_date': None, 'start_date': None, 'points': None, 'time_estimate': None, 'time_spent': 0, 'custom_fields': [], 'dependencies': [], 'linked_tasks': [], 'team_id': '9011010153', 'url': 'https://app.clickup.com/t/8685mw6dz', 'sharing': {'public': False, 'public_share_expires_on': None, 'public_fields': ['assignees', 'priority', 'due_date', 'content', 'comments', 'attachments', 'customFields', 'subtasks', 'tags', 'checklists', 'coverimage'], 'token': None, 'seo_optimized': False}, 'permission_level': 'create', 'list': {'id': '901100754275', 'name': 'Test List', 'access': True}, 'project': {'id': '90110336890', 'name': 'Test Folder', 'hidden': False, 'access': True}, 'folder': {'id': '90110336890', 'name': 'Test Folder', 'hidden': False, 'access': True}, 'space': {'id': '90110061901'}}[0m
Thought:[32;1m[1;3m I now have the task created and assigned to Rodrigo
Final Answer: Rodrigo's user ID is 81928627 and a task called 'Rod's task' has been created and assigned to him.[0m

[1m> Finished chain.[0m
--------------------------------------------------------------------------------
```

```output
"Rodrigo's user ID is 81928627 and a task called 'Rod's task' has been created and assigned to him."
```
