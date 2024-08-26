---
canonical: https://python.langchain.com/v0.1/docs/integrations/toolkits/slack
translated: false
---

# Slack

This notebook walks through connecting LangChain to your `Slack` account.

To use this toolkit, you will need to get a token explained in the [Slack API docs](https://api.slack.com/tutorials/tracks/getting-a-token). Once you've received a SLACK_USER_TOKEN, you can input it as an environmental variable below.

```python
%pip install --upgrade --quiet  slack_sdk > /dev/null
%pip install --upgrade --quiet  beautifulsoup4 > /dev/null # This is optional but is useful for parsing HTML messages
%pip install --upgrade --quiet  python-dotenv > /dev/null # This is for loading environmental variables from a .env file
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

## Set Environmental Variables

The toolkit will read the SLACK_USER_TOKEN environmental variable to authenticate the user so you need to set them here. You will also need to set your OPENAI_API_KEY to use the agent later.

```python
# Set environmental variables here
# In this example, you set environmental variables by loading a .env file.
import dotenv

dotenv.load_dotenv()
```

```output
True
```

## Create the Toolkit and Get Tools

To start, you need to create the toolkit, so you can access its tools later.

```python
from langchain_community.agent_toolkits import SlackToolkit

toolkit = SlackToolkit()
tools = toolkit.get_tools()
tools
```

```output
[SlackGetChannel(client=<slack_sdk.web.client.WebClient object at 0x11eba6a00>),
 SlackGetMessage(client=<slack_sdk.web.client.WebClient object at 0x11eba69d0>),
 SlackScheduleMessage(client=<slack_sdk.web.client.WebClient object at 0x11eba65b0>),
 SlackSendMessage(client=<slack_sdk.web.client.WebClient object at 0x11eba6790>)]
```

## Use within an ReAct Agent

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
```

```python
llm = ChatOpenAI(temperature=0, model="gpt-4")
prompt = hub.pull("hwchase17/openai-tools-agent")
agent = create_openai_tools_agent(
    tools=toolkit.get_tools(),
    llm=llm,
    prompt=prompt,
)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke(
    {
        "input": "Send a greeting to my coworkers in the #general channel. Note use `channel` as key of channel id, and `message` as key of content to sent in the channel."
    }
)
```

```python
agent_executor.invoke(
    {"input": "How many channels are in the workspace? Please list out their names."}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mI need to get the list of channels in the workspace.
Action: get_channelid_name_dict
Action Input: {}[0m[36;1m[1;3m[{"id": "C052SCUP4UD", "name": "general", "created": 1681297313, "num_members": 1}, {"id": "C052VBBU4M8", "name": "test-bots", "created": 1681297343, "num_members": 2}, {"id": "C053805TNUR", "name": "random", "created": 1681297313, "num_members": 2}][0m[32;1m[1;3mI now have the list of channels and their names.
Final Answer: There are 3 channels in the workspace. Their names are "general", "test-bots", and "random".[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many channels are in the workspace? Please list out their names.',
 'output': 'There are 3 channels in the workspace. Their names are "general", "test-bots", and "random".'}
```

```python
agent_executor.invoke(
    {
        "input": "Tell me the number of messages sent in the #introductions channel from the past month."
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mFirst, I need to identify the channel ID for the #introductions channel.
Action: get_channelid_name_dict
Action Input: None[0m[36;1m[1;3m[{"id": "C052SCUP4UD", "name": "general", "created": 1681297313, "num_members": 1}, {"id": "C052VBBU4M8", "name": "test-bots", "created": 1681297343, "num_members": 2}, {"id": "C053805TNUR", "name": "random", "created": 1681297313, "num_members": 2}][0m[32;1m[1;3mThe #introductions channel is not listed in the observed channels. I need to inform the user that the #introductions channel does not exist or is not accessible.
Final Answer: The #introductions channel does not exist or is not accessible.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Tell me the number of messages sent in the #introductions channel from the past month.',
 'output': 'The #introductions channel does not exist or is not accessible.'}
```