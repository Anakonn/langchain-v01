---
translated: true
---

# Reddit खोज

इस नोटबुक में, हम जानते हैं कि Reddit खोज उपकरण कैसे काम करता है।
पहले यह सुनिश्चित करें कि आपने नीचे दिए गए कमांड से praw इंस्टॉल किया है:

```python
%pip install --upgrade --quiet  praw
```

फिर आपको उचित API कुंजियों और पर्यावरण चर सेट करने की आवश्यकता है। आपको एक Reddit उपयोगकर्ता खाता बनाना और क्रेडेंशियल प्राप्त करने की आवश्यकता होगी। इसलिए, https://www.reddit.com पर जाकर और साइन अप करके एक Reddit उपयोगकर्ता खाता बनाएं।
फिर https://www.reddit.com/prefs/apps पर जाकर और एक ऐप बनाकर अपने क्रेडेंशियल प्राप्त करें।
आपके पास ऐप बनाने से client_id और secret होना चाहिए। अब, आप उन स्ट्रिंग को client_id और client_secret متغير में चिपका सकते हैं।
नोट: आप user_agent के लिए कोई भी स्ट्रिंग डाल सकते हैं।

```python
client_id = ""
client_secret = ""
user_agent = ""
```

```python
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper

search = RedditSearchRun(
    api_wrapper=RedditSearchAPIWrapper(
        reddit_client_id=client_id,
        reddit_client_secret=client_secret,
        reddit_user_agent=user_agent,
    )
)
```

फिर आप अपने क्वेरी सेट कर सकते हैं, जैसे कि आप किस subreddit को क्वेरी करना चाहते हैं, कितने पोस्ट वापस लौटाए जाने चाहिए, आप परिणाम को कैसे क्रमबद्ध करना चाहते हैं आदि।

```python
from langchain_community.tools.reddit_search.tool import RedditSearchSchema

search_params = RedditSearchSchema(
    query="beginner", sort="new", time_filter="week", subreddit="python", limit="2"
)
```

अंत में खोज चलाएं और अपने परिणाम प्राप्त करें।

```python
result = search.run(tool_input=search_params.dict())
```

```python
print(result)
```

यहां परिणाम छापने का एक उदाहरण है।
नोट: आप सबरेडिट में नवीनतम पोस्ट के आधार पर अलग-अलग आउटपुट प्राप्त कर सकते हैं, लेकिन स्वरूप समान होना चाहिए।

> r/python में खोज करने से 2 पोस्ट मिले:
> पोस्ट शीर्षक: 'Setup Github Copilot in Visual Studio Code'
> उपयोगकर्ता: Feisty-Recording-715
> सबरेडिट: r/Python:
>                     पाठ शरीर: 🛠️ यह ट्यूटोरियल बिल्कुल शुरुआती लोगों के लिए है जो वर्जन नियंत्रण को मजबूत करना चाहते हैं या अनुभवी डेवलपर्स के लिए है जो Visual Studio Code में GitHub सेटअप के लिए एक त्वरित संदर्भ की तलाश कर रहे हैं।
>
>🎓 इस वीडियो के अंत तक, आप अपने कोडबेस का प्रबंधन करने, दूसरों के साथ सहयोग करने और GitHub पर ओपन-सोर्स परियोजनाओं में योगदान देने की कुशलता से लैस होंगे।
>
>
>वीडियो लिंक: https://youtu.be/IdT1BhrSfdo?si=mV7xVpiyuhlD8Zrw
>
>आपका फीडबैक स्वागत है
>                     पोस्ट यूआरएल: https://www.reddit.com/r/Python/comments/1823wr7/setup_github_copilot_in_visual_studio_code/
>                     पोस्ट श्रेणी: लागू नहीं।
>                     स्कोर: 0
>
>पोस्ट शीर्षक: 'A Chinese Checkers game made with pygame and PySide6, with custom bots support'
>उपयोगकर्ता: HenryChess
>सबरेडिट: r/Python:
>                     पाठ शरीर: GitHub लिंक: https://github.com/henrychess/pygame-chinese-checkers
>
>मुझे नहीं पता कि यह शुरुआती या मध्यम माना जाता है। मुझे लगता है कि मैं अभी भी शुरुआती क्षेत्र में हूं, इसलिए मैंने इसे शुरुआती के रूप में चिह्नित किया है।
>
>यह 2 से 3 खिलाड़ियों के लिए एक चीनी चेकर्स (या Sternhalma) गेम है। मैंने लिखे गए बॉट आसानी से हरा सकते हैं, क्योंकि वे मुख्य रूप से गेम लॉजिक के हिस्से को डिबग करने के लिए हैं। हालांकि, आप अपने खुद के कस्टम बॉट लिख सकते हैं। GitHub पृष्ठ पर एक गाइड है।
>                     पोस्ट यूआरएल: https://www.reddit.com/r/Python/comments/181xq0u/a_chinese_checkers_game_made_with_pygame_and/
>                     पोस्ट श्रेणी: लागू नहीं।
>                     स्कोर: 1

## एक एजेंट श्रृंखला के साथ उपकरण का उपयोग करना

Reddit खोज कार्यक्षमता को एक बहु-इनपुट उपकरण के रूप में भी प्रदान किया जाता है। इस उदाहरण में, हम [दस्तावेज़ों से मौजूदा कोड](/docs/modules/memory/agent_with_memory) को अनुकूलित करते हैं, और ChatOpenAI का उपयोग करके एक स्मृति के साथ एजेंट श्रृंखला बनाते हैं। यह एजेंट श्रृंखला Reddit से जानकारी खींच सकती है और इन पोस्टों का उपयोग बाद के इनपुट का जवाब देने के लिए कर सकती है।

उदाहरण चलाने के लिए, अपने Reddit API एक्सेस जानकारी जोड़ें और [OpenAI API](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key) से एक OpenAI कुंजी भी प्राप्त करें।

```python
# Adapted code from /docs/modules/agents/how_to/sharedmemory_for_tools

from langchain.agents import AgentExecutor, StructuredChatAgent, Tool
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory, ReadOnlySharedMemory
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

# Provide keys for Reddit
client_id = ""
client_secret = ""
user_agent = ""
# Provide key for OpenAI
openai_api_key = ""

template = """This is a conversation between a human and a bot:

{chat_history}

Write a summary of the conversation for {input}:
"""

prompt = PromptTemplate(input_variables=["input", "chat_history"], template=template)
memory = ConversationBufferMemory(memory_key="chat_history")

prefix = """Have a conversation with a human, answering the following questions as best you can. You have access to the following tools:"""
suffix = """Begin!"

{chat_history}
Question: {input}
{agent_scratchpad}"""

tools = [
    RedditSearchRun(
        api_wrapper=RedditSearchAPIWrapper(
            reddit_client_id=client_id,
            reddit_client_secret=client_secret,
            reddit_user_agent=user_agent,
        )
    )
]

prompt = StructuredChatAgent.create_prompt(
    prefix=prefix,
    tools=tools,
    suffix=suffix,
    input_variables=["input", "chat_history", "agent_scratchpad"],
)

llm = ChatOpenAI(temperature=0, openai_api_key=openai_api_key)

llm_chain = LLMChain(llm=llm, prompt=prompt)
agent = StructuredChatAgent(llm_chain=llm_chain, verbose=True, tools=tools)
agent_chain = AgentExecutor.from_agent_and_tools(
    agent=agent, verbose=True, memory=memory, tools=tools
)

# Answering the first prompt requires usage of the Reddit search tool.
agent_chain.run(input="What is the newest post on r/langchain for the week?")
# Answering the subsequent prompt uses memory.
agent_chain.run(input="Who is the author of the post?")
```
