---
translated: true
---

# Gmail

이 노트북은 `Gmail API`를 사용하여 LangChain 이메일을 연결하는 과정을 안내합니다.

이 도구를 사용하려면 [Gmail API 문서](https://developers.google.com/gmail/api/quickstart/python#authorize_credentials_for_a_desktop_application)에 설명된 대로 자격 증명을 설정해야 합니다. `credentials.json` 파일을 다운로드한 후에는 Gmail API를 사용할 수 있습니다. 이 작업이 완료되면 필요한 라이브러리를 설치할 수 있습니다.

```python
%pip install --upgrade --quiet  google-api-python-client > /dev/null
%pip install --upgrade --quiet  google-auth-oauthlib > /dev/null
%pip install --upgrade --quiet  google-auth-httplib2 > /dev/null
%pip install --upgrade --quiet  beautifulsoup4 > /dev/null # This is optional but is useful for parsing HTML messages
```

또한 통합이 포함된 `langchain-community` 패키지를 설치해야 합니다:

```bash
pip install -U langchain-community
```

[LangSmith](https://smith.langchain.com/)를 설정하면 최고 수준의 관찰 기능을 사용할 수 있습니다(필수는 아님).

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 도구 생성

기본적으로 도구는 로컬 `credentials.json` 파일을 읽습니다. `Credentials` 객체를 수동으로 제공할 수도 있습니다.

```python
from langchain_community.agent_toolkits import GmailToolkit

toolkit = GmailToolkit()
```

### 인증 사용자 정의

내부적으로 다음 메서드를 사용하여 `googleapi` 리소스가 생성됩니다.
더 많은 인증 제어를 위해 수동으로 `googleapi` 리소스를 구축할 수 있습니다.

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

## 사용법

[agent](/docs/modules/agents)의 일부로 사용하는 방법을 보여줍니다. OpenAI Functions Agent를 사용할 것이므로 해당 종속성을 설정하고 설치해야 합니다. 또한 [LangSmith Hub](https://smith.langchain.com/hub)를 사용하여 프롬프트를 가져올 것이므로 이를 설치해야 합니다.

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
