---
translated: true
---

# कोनरी टूलकिट

इस टूलकिट का उपयोग करके, आप अपने LangChain एजेंट में कोनरी एक्शन को एकीकृत कर सकते हैं।

यदि आप अपने एजेंट में केवल एक विशिष्ट कोनरी एक्शन का उपयोग करना चाहते हैं,
तो [कोनरी एक्शन टूल](/docs/integrations/tools/connery) दस्तावेज़ देखें।

## कोनरी क्या है?

कोनरी एक ओपन-सोर्स प्लगइन बुनियादी ढांचा है।

कोनरी के साथ, आप आसानी से एक कस्टम प्लगइन बना सकते हैं जिसमें एक सेट एक्शन हों और उन्हें अपने LangChain एजेंट में सुचारू रूप से एकीकृत कर सकते हैं।
कोनरी रनटाइम, प्राधिकरण, गोपनीय प्रबंधन, एक्सेस प्रबंधन, ऑडिट लॉग और अन्य महत्वपूर्ण सुविधाओं जैसे महत्वपूर्ण पहलुओं का ख्याल रखेगा।

इसके अलावा, हमारे समुदाय द्वारा समर्थित कोनरी, अतिरिक्त सुविधा के लिए तैयार-उपयोग के ओपन-सोर्स प्लगइन का एक विविध संग्रह प्रदान करता है।

कोनरी के बारे में अधिक जानें:

- GitHub: https://github.com/connery-io/connery
- दस्तावेज़: https://docs.connery.io

## पूर्वापेक्षाएं

अपने LangChain एजेंट में कोनरी एक्शन का उपयोग करने के लिए, आपको कुछ तैयारी करनी होगी:

1. [त्वरित शुरुआत](https://docs.connery.io/docs/runner/quick-start/) गाइड का उपयोग करके कोनरी रनर सेट अप करें।
2. उन सभी प्लगइन को स्थापित करें जिनमें आप अपने एजेंट में उपयोग करना चाहते हैं।
3. `CONNERY_RUNNER_URL` और `CONNERY_RUNNER_API_KEY` पर्यावरण चर सेट करें ताकि टूलकिट कोनरी रनर के साथ संवाद कर सके।

## कोनरी टूलकिट का उपयोग करने का उदाहरण

नीचे दिए गए उदाहरण में, हम एक ऐसा एजेंट बनाते हैं जो सार्वजनिक वेबपेज को सारांशित करने और ईमेल द्वारा सारांश भेजने के लिए दो कोनरी एक्शन का उपयोग करता है:

1. [सारांशीकरण](https://github.com/connery-io/summarization-plugin) प्लगइन से **सार्वजनिक वेबपेज सारांशित करें** एक्शन।
2. [Gmail](https://github.com/connery-io/gmail) प्लगइन से **ईमेल भेजें** एक्शन।

आप इस उदाहरण का LangSmith ट्रेस [यहां](https://smith.langchain.com/public/4af5385a-afe9-46f6-8a53-57fe2d63c5bc/r) देख सकते हैं।

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.connery import ConneryToolkit
from langchain_community.chat_models import ChatOpenAI
from langchain_community.tools.connery import ConneryService

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the email with the summary from example below.
recepient_email = "test@example.com"

# Create a Connery Toolkit with all the available actions from the Connery Runner.
connery_service = ConneryService()
connery_toolkit = ConneryToolkit.create_instance(connery_service)

# Use OpenAI Functions agent to execute the prompt using actions from the Connery Toolkit.
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    connery_toolkit.get_tools(), llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
result = agent.run(
    f"""Make a short summary of the webpage http://www.paulgraham.com/vb.html in three sentences
and send it to {recepient_email}. Include the link to the webpage into the body of the email."""
)
print(result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CA72DFB0AB4DF6C830B43E14B0782F70` with `{'publicWebpageUrl': 'http://www.paulgraham.com/vb.html'}`


[0m[33;1m[1;3m{'summary': 'The author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.'}[0m[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Summary of the webpage', 'body': 'Here is a short summary of the webpage http://www.paulgraham.com/vb.html:\n\nThe author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.\n\nYou can find the full webpage [here](http://www.paulgraham.com/vb.html).'}`


[0m[33;1m[1;3m{'messageId': '<2f04b00e-122d-c7de-c91e-e78e0c3276d6@gmail.com>'}[0m[32;1m[1;3mI have sent the email with the summary of the webpage to test@example.com. Please check your inbox.[0m

[1m> Finished chain.[0m
I have sent the email with the summary of the webpage to test@example.com. Please check your inbox.
```

नोट: कोनरी एक्शन एक संरचित टूल है, इसलिए आप इसका उपयोग केवल संरचित टूल समर्थन करने वाले एजेंटों में कर सकते हैं।
