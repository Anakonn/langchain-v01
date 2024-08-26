---
translated: true
---

# Office365

>[Microsoft 365](https://www.office.com/) एक उत्पाद परिवार है जिसमें उत्पादकता सॉफ़्टवेयर, सहयोग और क्लाउड-आधारित सेवाएँ शामिल हैं, जो `Microsoft` के स्वामित्व में हैं।
>
>नोट: `Office 365` का पुनःब्रांडिंग `Microsoft 365` के रूप में किया गया था।

यह नोटबुक `Office365` ईमेल और कैलेंडर से कनेक्ट करने के लिए LangChain का उपयोग करने की प्रक्रिया को बताता है।

इस टूलकिट का उपयोग करने के लिए, आपको अपने प्रमाणपत्र सेट अप करने की जरूरत है जैसा कि [Microsoft Graph प्रमाणीकरण और प्राधिकरण अवलोकन](https://learn.microsoft.com/en-us/graph/auth/) में समझाया गया है। एक बार जब आपको CLIENT_ID और CLIENT_SECRET प्राप्त हो जाएं, तो आप उन्हें नीचे पर्यावरणीय वेरिएबल्स के रूप में इनपुट कर सकते हैं।

आप [यहां से प्रमाणीकरण निर्देशों का भी उपयोग कर सकते हैं](https://o365.github.io/python-o365/latest/getting_started.html#oauth-setup-pre-requisite)।

```python
%pip install --upgrade --quiet  O365
%pip install --upgrade --quiet  beautifulsoup4  # This is optional but is useful for parsing HTML messages
```

## पर्यावरणीय वेरिएबल्स असाइन करें

उपयोगकर्ता को प्रमाणित करने के लिए टूलकिट `CLIENT_ID` और `CLIENT_SECRET` पर्यावरणीय वेरिएबल्स को पढ़ेगा, इसलिए आपको उन्हें यहां सेट करना होगा। बाद में एजेंट का उपयोग करने के लिए आपको अपना `OPENAI_API_KEY` भी सेट करना होगा।

```python
# Set environmental variables here
```

## टूलकिट बनाएं और टूल्स प्राप्त करें

शुरू करने के लिए, आपको टूलकिट बनाना होगा, ताकि आप बाद में इसके टूल्स का उपयोग कर सकें।

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

## एक एजेंट के भीतर उपयोग करें

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
