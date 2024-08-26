---
translated: true
---

यह API 2023-11-17 को समाप्त हो जाएगा: https://nla.zapier.com/start/

>[Zapier Natural Language Actions](https://nla.zapier.com/start/) आपको Zapier के प्लेटफॉर्म पर मौजूद 5k+ ऐप्स, 20k+ एक्शन तक प्राकृतिक भाषा API इंटरफ़ेस के माध्यम से पहुंच प्रदान करता है।

>NLA `Gmail`, `Salesforce`, `Trello`, `Slack`, `Asana`, `HubSpot`, `Google Sheets`, `Microsoft Teams` जैसे ऐप्स और हजारों अन्य ऐप्स का समर्थन करता है: https://zapier.com/apps
>`Zapier NLA` सभी अंतर्निहित API प्रमाणीकरण और प्राकृतिक भाषा --> अंतर्निहित API कॉल --> LLM के लिए सरलीकृत आउटपुट को संभालता है। मुख्य विचार यह है कि आप या आपके उपयोगकर्ता, एक oauth-जैसी सेटअप विंडो के माध्यम से एक सेट कार्रवाइयों को एक्सपोज़ कर सकते हैं, जिन्हें आप एक REST API के माध्यम से क्वेरी और निष्पादित कर सकते हैं।

NLA API कुंजी और OAuth दोनों के माध्यम से NLA API अनुरोध करने की अनुमति देता है।

1. सर्वर-साइड (API कुंजी): जल्दी शुरू करने, परीक्षण और उत्पादन परिदृश्यों के लिए, जहां LangChain केवल डेवलपर के Zapier खाते में एक्सपोज़ की गई कार्रवाइयों का उपयोग करेगा (और डेवलपर के Zapier.com पर कनेक्ट किए गए खातों का उपयोग करेगा)

2. उपयोगकर्ता-मुखी (Oauth): उत्पादन परिदृश्यों के लिए, जहां आप एक अंत-उपयोगकर्ता-मुखी एप्लिकेशन तैनात कर रहे हैं और LangChain को अंत-उपयोगकर्ता के एक्सपोज़ की गई कार्रवाइयों और Zapier.com पर कनेक्ट किए गए खातों तक पहुंच की आवश्यकता है

यह त्वरित शुरुआत मुख्य रूप से सर्वर-साइड उपयोग मामले पर केंद्रित है। [OAuth Access Token का उपयोग करके उदाहरण](#oauth) देखने के लिए जाएं ताकि उपयोगकर्ता-मुखी स्थितियों में Zapier को सेट अप करने का एक छोटा उदाहरण देख सकें। [पूर्ण दस्तावेज़](https://nla.zapier.com/start/) देखें उपयोगकर्ता-मुखी oauth डेवलपर समर्थन के लिए।

यह उदाहरण `SimpleSequentialChain` के साथ Zapier एकीकरण का उपयोग करने और फिर एक `Agent` का उपयोग करने के बारे में बताता है।
कोड में, नीचे:

```python
import os

# get from https://platform.openai.com/
os.environ["OPENAI_API_KEY"] = os.environ.get("OPENAI_API_KEY", "")

# get from https://nla.zapier.com/docs/authentication/ after logging in):
os.environ["ZAPIER_NLA_API_KEY"] = os.environ.get("ZAPIER_NLA_API_KEY", "")
```

## एजेंट के साथ उदाहरण

Zapier उपकरणों का उपयोग एक एजेंट के साथ किया जा सकता है। नीचे दिए गए उदाहरण देखें।

```python
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits import ZapierToolkit
from langchain_community.utilities.zapier import ZapierNLAWrapper
from langchain_openai import OpenAI
```

```python
## step 0. expose gmail 'find email' and slack 'send channel message' actions

# first go here, log in, expose (enable) the two actions: https://nla.zapier.com/demo/start -- for this example, can leave all fields "Have AI guess"
# in an oauth scenario, you'd get your own <provider> id (instead of 'demo') which you route your users through first
```

```python
llm = OpenAI(temperature=0)
zapier = ZapierNLAWrapper()
toolkit = ZapierToolkit.from_zapier_nla_wrapper(zapier)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

```python
agent.run(
    "Summarize the last email I received regarding Silicon Valley Bank. Send the summary to the #test-zapier channel in slack."
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find the email and summarize it.
Action: Gmail: Find Email
Action Input: Find the latest email from Silicon Valley Bank[0m
Observation: [31;1m[1;3m{"from__name": "Silicon Valley Bridge Bank, N.A.", "from__email": "sreply@svb.com", "body_plain": "Dear Clients, After chaotic, tumultuous & stressful days, we have clarity on path for SVB, FDIC is fully insuring all deposits & have an ask for clients & partners as we rebuild. Tim Mayopoulos <https://eml.svb.com/NjEwLUtBSy0yNjYAAAGKgoxUeBCLAyF_NxON97X4rKEaNBLG", "reply_to__email": "sreply@svb.com", "subject": "Meet the new CEO Tim Mayopoulos", "date": "Tue, 14 Mar 2023 23:42:29 -0500 (CDT)", "message_url": "https://mail.google.com/mail/u/0/#inbox/186e393b13cfdf0a", "attachment_count": "0", "to__emails": "ankush@langchain.dev", "message_id": "186e393b13cfdf0a", "labels": "IMPORTANT, CATEGORY_UPDATES, INBOX"}[0m
Thought:[32;1m[1;3m I need to summarize the email and send it to the #test-zapier channel in Slack.
Action: Slack: Send Channel Message
Action Input: Send a slack message to the #test-zapier channel with the text "Silicon Valley Bank has announced that Tim Mayopoulos is the new CEO. FDIC is fully insuring all deposits and they have an ask for clients and partners as they rebuild."[0m
Observation: [36;1m[1;3m{"message__text": "Silicon Valley Bank has announced that Tim Mayopoulos is the new CEO. FDIC is fully insuring all deposits and they have an ask for clients and partners as they rebuild.", "message__permalink": "https://langchain.slack.com/archives/C04TSGU0RA7/p1678859932375259", "channel": "C04TSGU0RA7", "message__bot_profile__name": "Zapier", "message__team": "T04F8K3FZB5", "message__bot_id": "B04TRV4R74K", "message__bot_profile__deleted": "false", "message__bot_profile__app_id": "A024R9PQM", "ts_time": "2023-03-15T05:58:52Z", "message__bot_profile__icons__image_36": "https://avatars.slack-edge.com/2022-08-02/3888649620612_f864dc1bb794cf7d82b0_36.png", "message__blocks[]block_id": "kdZZ", "message__blocks[]elements[]type": "['rich_text_section']"}[0m
Thought:[32;1m[1;3m I now know the final answer.
Final Answer: I have sent a summary of the last email from Silicon Valley Bank to the #test-zapier channel in Slack.[0m

[1m> Finished chain.[0m
```

```output
'I have sent a summary of the last email from Silicon Valley Bank to the #test-zapier channel in Slack.'
```

## `SimpleSequentialChain` के साथ उदाहरण

यदि आपको अधिक स्पष्ट नियंत्रण की आवश्यकता है, तो नीचे दिए गए तरीके से एक श्रृंखला का उपयोग करें।

```python
from langchain.chains import LLMChain, SimpleSequentialChain, TransformChain
from langchain_community.tools.zapier.tool import ZapierNLARunAction
from langchain_community.utilities.zapier import ZapierNLAWrapper
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
## step 0. expose gmail 'find email' and slack 'send direct message' actions

# first go here, log in, expose (enable) the two actions: https://nla.zapier.com/demo/start -- for this example, can leave all fields "Have AI guess"
# in an oauth scenario, you'd get your own <provider> id (instead of 'demo') which you route your users through first

actions = ZapierNLAWrapper().list()
```

```python
## step 1. gmail find email

GMAIL_SEARCH_INSTRUCTIONS = "Grab the latest email from Silicon Valley Bank"


def nla_gmail(inputs):
    action = next(
        (a for a in actions if a["description"].startswith("Gmail: Find Email")), None
    )
    return {
        "email_data": ZapierNLARunAction(
            action_id=action["id"],
            zapier_description=action["description"],
            params_schema=action["params"],
        ).run(inputs["instructions"])
    }


gmail_chain = TransformChain(
    input_variables=["instructions"],
    output_variables=["email_data"],
    transform=nla_gmail,
)
```

```python
## step 2. generate draft reply

template = """You are an assisstant who drafts replies to an incoming email. Output draft reply in plain text (not JSON).

Incoming email:
{email_data}

Draft email reply:"""

prompt_template = PromptTemplate(input_variables=["email_data"], template=template)
reply_chain = LLMChain(llm=OpenAI(temperature=0.7), prompt=prompt_template)
```

```python
## step 3. send draft reply via a slack direct message

SLACK_HANDLE = "@Ankush Gola"


def nla_slack(inputs):
    action = next(
        (
            a
            for a in actions
            if a["description"].startswith("Slack: Send Direct Message")
        ),
        None,
    )
    instructions = f'Send this to {SLACK_HANDLE} in Slack: {inputs["draft_reply"]}'
    return {
        "slack_data": ZapierNLARunAction(
            action_id=action["id"],
            zapier_description=action["description"],
            params_schema=action["params"],
        ).run(instructions)
    }


slack_chain = TransformChain(
    input_variables=["draft_reply"],
    output_variables=["slack_data"],
    transform=nla_slack,
)
```

```python
## finally, execute

overall_chain = SimpleSequentialChain(
    chains=[gmail_chain, reply_chain, slack_chain], verbose=True
)
overall_chain.run(GMAIL_SEARCH_INSTRUCTIONS)
```

```output


[1m> Entering new SimpleSequentialChain chain...[0m
[36;1m[1;3m{"from__name": "Silicon Valley Bridge Bank, N.A.", "from__email": "sreply@svb.com", "body_plain": "Dear Clients, After chaotic, tumultuous & stressful days, we have clarity on path for SVB, FDIC is fully insuring all deposits & have an ask for clients & partners as we rebuild. Tim Mayopoulos <https://eml.svb.com/NjEwLUtBSy0yNjYAAAGKgoxUeBCLAyF_NxON97X4rKEaNBLG", "reply_to__email": "sreply@svb.com", "subject": "Meet the new CEO Tim Mayopoulos", "date": "Tue, 14 Mar 2023 23:42:29 -0500 (CDT)", "message_url": "https://mail.google.com/mail/u/0/#inbox/186e393b13cfdf0a", "attachment_count": "0", "to__emails": "ankush@langchain.dev", "message_id": "186e393b13cfdf0a", "labels": "IMPORTANT, CATEGORY_UPDATES, INBOX"}[0m
[33;1m[1;3m
Dear Silicon Valley Bridge Bank,

Thank you for your email and the update regarding your new CEO Tim Mayopoulos. We appreciate your dedication to keeping your clients and partners informed and we look forward to continuing our relationship with you.

Best regards,
[Your Name][0m
[38;5;200m[1;3m{"message__text": "Dear Silicon Valley Bridge Bank, \n\nThank you for your email and the update regarding your new CEO Tim Mayopoulos. We appreciate your dedication to keeping your clients and partners informed and we look forward to continuing our relationship with you. \n\nBest regards, \n[Your Name]", "message__permalink": "https://langchain.slack.com/archives/D04TKF5BBHU/p1678859968241629", "channel": "D04TKF5BBHU", "message__bot_profile__name": "Zapier", "message__team": "T04F8K3FZB5", "message__bot_id": "B04TRV4R74K", "message__bot_profile__deleted": "false", "message__bot_profile__app_id": "A024R9PQM", "ts_time": "2023-03-15T05:59:28Z", "message__blocks[]block_id": "p7i", "message__blocks[]elements[]elements[]type": "[['text']]", "message__blocks[]elements[]type": "['rich_text_section']"}[0m

[1m> Finished chain.[0m
```

```output
'{"message__text": "Dear Silicon Valley Bridge Bank, \\n\\nThank you for your email and the update regarding your new CEO Tim Mayopoulos. We appreciate your dedication to keeping your clients and partners informed and we look forward to continuing our relationship with you. \\n\\nBest regards, \\n[Your Name]", "message__permalink": "https://langchain.slack.com/archives/D04TKF5BBHU/p1678859968241629", "channel": "D04TKF5BBHU", "message__bot_profile__name": "Zapier", "message__team": "T04F8K3FZB5", "message__bot_id": "B04TRV4R74K", "message__bot_profile__deleted": "false", "message__bot_profile__app_id": "A024R9PQM", "ts_time": "2023-03-15T05:59:28Z", "message__blocks[]block_id": "p7i", "message__blocks[]elements[]elements[]type": "[[\'text\']]", "message__blocks[]elements[]type": "[\'rich_text_section\']"}'
```

## <a id="oauth">OAuth Access Token का उपयोग करके उदाहरण</a>

नीचे दिया गया स्निपेट दिखाता है कि किस प्रकार प्राप्त किए गए OAuth एक्सेस टोकन के साथ रैपर को इनिशियलाइज़ किया जाए। ध्यान दें कि पर्यावरण चर सेट करने के बजाय इस तर्क को पास किया जा रहा है। [प्रमाणीकरण दस्तावेज़](https://nla.zapier.com/docs/authentication/#oauth-credentials) देखें उपयोगकर्ता-मुखी oauth डेवलपर समर्थन के लिए पूरी जानकारी।

डेवलपर को OAuth हैंडशेकिंग को संभालने और एक्सेस टोकन को प्राप्त और ताज़ा करने की जिम्मेदारी है।

```python
llm = OpenAI(temperature=0)
zapier = ZapierNLAWrapper(zapier_nla_oauth_access_token="<fill in access token here>")
toolkit = ZapierToolkit.from_zapier_nla_wrapper(zapier)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run(
    "Summarize the last email I received regarding Silicon Valley Bank. Send the summary to the #test-zapier channel in slack."
)
```
