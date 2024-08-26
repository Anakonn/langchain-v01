---
translated: true
---

# कोनरी एक्शन टूल

इस टूल का उपयोग करके, आप अपने LangChain एजेंट में व्यक्तिगत कोनरी एक्शन को एकीकृत कर सकते हैं।

यदि आप अपने एजेंट में एक से अधिक कोनरी एक्शन का उपयोग करना चाहते हैं,
तो [कोनरी टूलकिट](/docs/integrations/toolkits/connery) दस्तावेज़ीकरण देखें।

## कोनरी क्या है?

कोनरी एक ओपन-सोर्स प्लगइन बुनियादी ढांचा है।

कोनरी के साथ, आप आसानी से एक कस्टम प्लगइन बना सकते हैं जिसमें एक सेट एक्शन हों और उन्हें अपने LangChain एजेंट में सुचारू रूप से एकीकृत कर सकते हैं।
कोनरी रनटाइम, प्राधिकरण, गोपनीय प्रबंधन, एक्सेस प्रबंधन, ऑडिट लॉग और अन्य महत्वपूर्ण सुविधाओं जैसे महत्वपूर्ण पहलुओं का ख्याल रखेगा।

इसके अलावा, कोनरी, हमारी समुदाय द्वारा समर्थित, अतिरिक्त सुविधा के लिए तैयार-उपयोग के ओपन-सोर्स प्लगइन का एक विविध संग्रह प्रदान करता है।

कोनरी के बारे में अधिक जानें:

- GitHub: https://github.com/connery-io/connery
- दस्तावेज़ीकरण: https://docs.connery.io

## पूर्वापेक्षाएं

अपने LangChain एजेंट में कोनरी एक्शन का उपयोग करने के लिए, आपको कुछ तैयारी करनी होगी:

1. [त्वरित शुरुआत](https://docs.connery.io/docs/runner/quick-start/) गाइड का उपयोग करके कोनरी रनर सेट अप करें।
2. उन सभी प्लगइन को स्थापित करें जिनमें आप अपने एजेंट में उपयोग करना चाहते हैं।
3. `CONNERY_RUNNER_URL` और `CONNERY_RUNNER_API_KEY` पर्यावरण चर सेट करें ताकि टूलकिट कोनरी रनर के साथ संवाद कर सके।

## कोनरी एक्शन टूल का उपयोग करने का उदाहरण

नीचे दिए गए उदाहरण में, हम कोनरी रनर से एक्शन को उसके ID से प्राप्त करते हैं और फिर निर्दिष्ट मापदंडों के साथ इसे कॉल करते हैं।

यहां, हम [Gmail](https://github.com/connery-io/gmail) प्लगइन से **ईमेल भेजें** एक्शन का ID उपयोग करते हैं।

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.tools.connery import ConneryService
from langchain_openai import ChatOpenAI

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the emails from examples below.
recepient_email = "test@example.com"

# Get the SendEmail action from the Connery Runner by ID.
connery_service = ConneryService()
send_email_action = connery_service.get_action("CABC80BB79C15067CA983495324AE709")
```

एक्शन को मैनुअल रूप से चलाएं।

```python
manual_run_result = send_email_action.run(
    {
        "recipient": recepient_email,
        "subject": "Test email",
        "body": "This is a test email sent from Connery.",
    }
)
print(manual_run_result)
```

OpenAI Functions एजेंट का उपयोग करके एक्शन चलाएं।

आप इस उदाहरण का LangSmith ट्रेस [यहां](https://smith.langchain.com/public/a37d216f-c121-46da-a428-0e09dc19b1dc/r) देख सकते हैं।

```python
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    [send_email_action], llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
agent_run_result = agent.run(
    f"Send an email to the {recepient_email} and say that I will be late for the meeting."
)
print(agent_run_result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Late for Meeting', 'body': 'Dear Team,\n\nI wanted to inform you that I will be late for the meeting today. I apologize for any inconvenience caused. Please proceed with the meeting without me and I will join as soon as I can.\n\nBest regards,\n[Your Name]'}`


[0m[36;1m[1;3m{'messageId': '<d34a694d-50e0-3988-25da-e86b4c51d7a7@gmail.com>'}[0m[32;1m[1;3mI have sent an email to test@example.com informing them that you will be late for the meeting.[0m

[1m> Finished chain.[0m
I have sent an email to test@example.com informing them that you will be late for the meeting.
```

नोट: कोनरी एक्शन एक संरचित टूल है, इसलिए आप इसका उपयोग केवल संरचित टूल समर्थन करने वाले एजेंटों में कर सकते हैं।
