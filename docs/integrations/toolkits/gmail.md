---
canonical: https://python.langchain.com/v0.1/docs/integrations/toolkits/gmail
translated: false
---

# Gmail

This notebook walks through connecting a LangChain email to the `Gmail API`.

To use this toolkit, you will need to set up your credentials explained in the [Gmail API docs](https://developers.google.com/gmail/api/quickstart/python#authorize_credentials_for_a_desktop_application). Once you've downloaded the `credentials.json` file, you can start using the Gmail API. Once this is done, we'll install the required libraries.

```python
%pip install --upgrade --quiet  google-api-python-client > /dev/null
%pip install --upgrade --quiet  google-auth-oauthlib > /dev/null
%pip install --upgrade --quiet  google-auth-httplib2 > /dev/null
%pip install --upgrade --quiet  beautifulsoup4 > /dev/null # This is optional but is useful for parsing HTML messages
```

You also need to install the `langchain-community` package where the integration lives:

```bash
pip install -U langchain-community
```

It's also helpful (but not needed) to set up [LangSmith](https://smith.langchain.com/) for best-in-class observability

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Create the Toolkit

By default the toolkit reads the local `credentials.json` file. You can also manually provide a `Credentials` object.

```python
from langchain_community.agent_toolkits import GmailToolkit

toolkit = GmailToolkit()
```

### Customizing Authentication

Behind the scenes, a `googleapi` resource is created using the following methods.
you can manually build a `googleapi` resource for more auth control.

```python
from langchain_community.tools.gmail.utils import (
    build_resource_service,
    get_gmail_credentials,
)

# Can review scopes here https://developers.google.com/gmail/api/auth/scopes
# For instance, readonly scope is 'https://www.googleapis.com/auth/gmail.readonly'
credentials = get_gmail_credentials(
    token_file="token.json",
    scopes=["https://mail.google.com/"],
    client_secrets_file="credentials.json",
)
api_resource = build_resource_service(credentials=credentials)
toolkit = GmailToolkit(api_resource=api_resource)
```

```python
tools = toolkit.get_tools()
tools
```

```output
[GmailCreateDraft(name='create_gmail_draft', description='Use this tool to create a draft email with the provided message fields.', args_schema=<class 'langchain_community.tools.gmail.create_draft.CreateDraftSchema'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, api_resource=<googleapiclient.discovery.Resource object at 0x10e5c6d10>),
 GmailSendMessage(name='send_gmail_message', description='Use this tool to send email messages. The input is the message, recipents', args_schema=None, return_direct=False, verbose=False, callbacks=None, callback_manager=None, api_resource=<googleapiclient.discovery.Resource object at 0x10e5c6d10>),
 GmailSearch(name='search_gmail', description=('Use this tool to search for email messages or threads. The input must be a valid Gmail query. The output is a JSON list of the requested resource.',), args_schema=<class 'langchain_community.tools.gmail.search.SearchArgsSchema'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, api_resource=<googleapiclient.discovery.Resource object at 0x10e5c6d10>),
 GmailGetMessage(name='get_gmail_message', description='Use this tool to fetch an email by message ID. Returns the thread ID, snipet, body, subject, and sender.', args_schema=<class 'langchain_community.tools.gmail.get_message.SearchArgsSchema'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, api_resource=<googleapiclient.discovery.Resource object at 0x10e5c6d10>),
 GmailGetThread(name='get_gmail_thread', description=('Use this tool to search for email messages. The input must be a valid Gmail query. The output is a JSON list of messages.',), args_schema=<class 'langchain_community.tools.gmail.get_thread.GetThreadSchema'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, api_resource=<googleapiclient.discovery.Resource object at 0x10e5c6d10>)]
```

## Usage

We show here how to use it as part of an [agent](/docs/modules/agents). We use the OpenAI Functions Agent, so we will need to setup and install the required dependencies for that. We will also use [LangSmith Hub](https://smith.langchain.com/hub) to pull the prompt from, so we will need to install that.

```bash
pip install -U langchain-openai langchainhub
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
```

```python
instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
```

```python
llm = ChatOpenAI(temperature=0)
```

```python
agent = create_openai_functions_agent(llm, toolkit.get_tools(), prompt)
```

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    # This is set to False to prevent information about my email showing up on the screen
    # Normally, it is helpful to have it set to True however.
    verbose=False,
)
```

```python
agent_executor.invoke(
    {
        "input": "Create a gmail draft for me to edit of a letter from the perspective of a sentient parrot"
        " who is looking to collaborate on some research with her"
        " estranged friend, a cat. Under no circumstances may you send the message, however."
    }
)
```

```output
{'input': 'Create a gmail draft for me to edit of a letter from the perspective of a sentient parrot who is looking to collaborate on some research with her estranged friend, a cat. Under no circumstances may you send the message, however.',
 'output': 'I have created a draft email for you to edit. Please find the draft in your Gmail drafts folder. Remember, under no circumstances should you send the message.'}
```

```python
agent_executor.invoke(
    {"input": "Could you search in my drafts for the latest email? what is the title?"}
)
```

```output
{'input': 'Could you search in my drafts for the latest email? what is the title?',
 'output': 'The latest email in your drafts is titled "Collaborative Research Proposal".'}
```