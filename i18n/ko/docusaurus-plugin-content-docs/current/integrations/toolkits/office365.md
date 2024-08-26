---
translated: true
---

# Office365

>[Microsoft 365](https://www.office.com/)는 `Microsoft`가 소유한 생산성 소프트웨어, 협업 및 클라우드 기반 서비스의 제품군입니다.
>
>참고: `Office 365`는 `Microsoft 365`로 재브랜딩되었습니다.

이 노트북은 LangChain을 `Office365` 이메일 및 캘린더에 연결하는 방법을 안내합니다.

이 도구 키트를 사용하려면 [Microsoft Graph 인증 및 권한 부여 개요](https://learn.microsoft.com/en-us/graph/auth/)에 설명된 자격 증명을 설정해야 합니다. CLIENT_ID와 CLIENT_SECRET을 받으면 아래의 환경 변수에 입력할 수 있습니다.

[여기의 인증 지침](https://o365.github.io/python-o365/latest/getting_started.html#oauth-setup-pre-requisite)을 사용할 수도 있습니다.

```python
%pip install --upgrade --quiet  O365
%pip install --upgrade --quiet  beautifulsoup4  # This is optional but is useful for parsing HTML messages
```

## 환경 변수 할당

이 도구 키트는 사용자 인증을 위해 `CLIENT_ID` 및 `CLIENT_SECRET` 환경 변수를 읽을 것이므로 여기에 설정해야 합니다. 에이전트를 사용하려면 `OPENAI_API_KEY`도 설정해야 합니다.

```python
# Set environmental variables here
```

## 도구 키트 생성 및 도구 가져오기

먼저 도구 키트를 생성해야 합니다. 그러면 나중에 도구에 액세스할 수 있습니다.

```python
from langchain_community.agent_toolkits import O365Toolkit

toolkit = O365Toolkit()
tools = toolkit.get_tools()
tools
```

```output
[O365SearchEvents(name='events_search', description=" Use this tool to search for the user's calendar events. The input must be the start and end datetimes for the search query. The output is a JSON list of all the events in the user's calendar between the start and end times. You can assume that the user can  not schedule any meeting over existing meetings, and that the user is busy during meetings. Any times without events are free for the user. ", args_schema=<class 'langchain_community.tools.office365.events_search.SearchEventsInput'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, handle_tool_error=False, account=Account Client Id: f32a022c-3c4c-4d10-a9d8-f6a9a9055302),
 O365CreateDraftMessage(name='create_email_draft', description='Use this tool to create a draft email with the provided message fields.', args_schema=<class 'langchain_community.tools.office365.create_draft_message.CreateDraftMessageSchema'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, handle_tool_error=False, account=Account Client Id: f32a022c-3c4c-4d10-a9d8-f6a9a9055302),
 O365SearchEmails(name='messages_search', description='Use this tool to search for email messages. The input must be a valid Microsoft Graph v1.0 $search query. The output is a JSON list of the requested resource.', args_schema=<class 'langchain_community.tools.office365.messages_search.SearchEmailsInput'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, handle_tool_error=False, account=Account Client Id: f32a022c-3c4c-4d10-a9d8-f6a9a9055302),
 O365SendEvent(name='send_event', description='Use this tool to create and send an event with the provided event fields.', args_schema=<class 'langchain_community.tools.office365.send_event.SendEventSchema'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, handle_tool_error=False, account=Account Client Id: f32a022c-3c4c-4d10-a9d8-f6a9a9055302),
 O365SendMessage(name='send_email', description='Use this tool to send an email with the provided message fields.', args_schema=<class 'langchain_community.tools.office365.send_message.SendMessageSchema'>, return_direct=False, verbose=False, callbacks=None, callback_manager=None, handle_tool_error=False, account=Account Client Id: f32a022c-3c4c-4d10-a9d8-f6a9a9055302)]
```

## 에이전트에서 사용

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import OpenAI
```

```python
llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools=toolkit.get_tools(),
    llm=llm,
    verbose=False,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
)
```

```python
agent.run(
    "Create an email draft for me to edit of a letter from the perspective of a sentient parrot"
    " who is looking to collaborate on some research with her"
    " estranged friend, a cat. Under no circumstances may you send the message, however."
)
```

```output
'The draft email was created correctly.'
```

```python
agent.run(
    "Could you search in my drafts folder and let me know if any of them are about collaboration?"
)
```

```output
"I found one draft in your drafts folder about collaboration. It was sent on 2023-06-16T18:22:17+0000 and the subject was 'Collaboration Request'."
```

```python
agent.run(
    "Can you schedule a 30 minute meeting with a sentient parrot to discuss research collaborations on October 3, 2023 at 2 pm Easter Time?"
)
```

```output
/home/vscode/langchain-py-env/lib/python3.11/site-packages/O365/utils/windows_tz.py:639: PytzUsageWarning: The zone attribute is specific to pytz's interface; please migrate to a new time zone provider. For more details on how to do so, see https://pytz-deprecation-shim.readthedocs.io/en/latest/migration.html
  iana_tz.zone if isinstance(iana_tz, tzinfo) else iana_tz)
/home/vscode/langchain-py-env/lib/python3.11/site-packages/O365/utils/utils.py:463: PytzUsageWarning: The zone attribute is specific to pytz's interface; please migrate to a new time zone provider. For more details on how to do so, see https://pytz-deprecation-shim.readthedocs.io/en/latest/migration.html
  timezone = date_time.tzinfo.zone if date_time.tzinfo is not None else None
```

```output
'I have scheduled a meeting with a sentient parrot to discuss research collaborations on October 3, 2023 at 2 pm Easter Time. Please let me know if you need to make any changes.'
```

```python
agent.run(
    "Can you tell me if I have any events on October 3, 2023 in Eastern Time, and if so, tell me if any of them are with a sentient parrot?"
)
```

```output
"Yes, you have an event on October 3, 2023 with a sentient parrot. The event is titled 'Meeting with sentient parrot' and is scheduled from 6:00 PM to 6:30 PM."
```
