---
translated: true
---

# लक्ष्य

Aim LangChain कार्यान्वयन को देखने और डीबग करने में बहुत आसान बनाता है। Aim इनपुट और आउटपुट LLM और उपकरणों, साथ ही एजेंटों के कार्यों को ट्रैक करता है।

Aim के साथ, आप आसानी से एक व्यक्तिगत कार्यान्वयन को डीबग और परीक्षण कर सकते हैं:

![](https://user-images.githubusercontent.com/13848158/227784778-06b806c7-74a1-4d15-ab85-9ece09b458aa.png)

इसके अलावा, आपके पास कई कार्यान्वयनों को एक साथ तुलना करने का विकल्प है:

![](https://user-images.githubusercontent.com/13848158/227784994-699b24b7-e69b-48f9-9ffa-e6a6142fd719.png)

Aim पूरी तरह से ओपन सोर्स है, [अधिक जानें](https://github.com/aimhubio/aim) GitHub पर Aim के बारे में।

आइए आगे बढ़ें और देखें कि Aim कॉलबैक को कैसे सक्षम और कॉन्फ़िगर करें।

<h3>LangChain कार्यान्वयन को Aim के साथ ट्रैक करना</h3>

इस नोटबुक में हम तीन उपयोग सценारियों का अन्वेषण करेंगे। शुरू करने के लिए, हम आवश्यक पैकेज को स्थापित करेंगे और कुछ मॉड्यूल आयात करेंगे। इसके बाद, हम दो पर्यावरण चर कॉन्फ़िगर करेंगे जिन्हें या तो Python स्क्रिप्ट में या टर्मिनल के माध्यम से स्थापित किया जा सकता है।

```python
%pip install --upgrade --quiet  aim
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```

```python
import os
from datetime import datetime

from langchain.callbacks import AimCallbackHandler, StdOutCallbackHandler
from langchain_openai import OpenAI
```

हमारे उदाहरण एक GPT मॉडल का उपयोग करते हैं जो LLM है, और OpenAI इस उद्देश्य के लिए एक API प्रदान करता है। आप निम्न लिंक से कुंजी प्राप्त कर सकते हैं: https://platform.openai.com/account/api-keys ।

हम Google से खोज परिणाम प्राप्त करने के लिए SerpApi का उपयोग करेंगे। SerpApi कुंजी प्राप्त करने के लिए, कृपया https://serpapi.com/manage-api-key पर जाएं।

```python
os.environ["OPENAI_API_KEY"] = "..."
os.environ["SERPAPI_API_KEY"] = "..."
```

`AimCallbackHandler` के इवेंट मेथड LangChain मॉड्यूल या एजेंट को इनपुट के रूप में स्वीकार करते हैं और कम से कम प्रोम्प्ट और उत्पन्न परिणामों, साथ ही LangChain मॉड्यूल का सीरियलाइज़ किया हुआ संस्करण, को नामित Aim रन में लॉग करते हैं।

```python
session_group = datetime.now().strftime("%m.%d.%Y_%H.%M.%S")
aim_callback = AimCallbackHandler(
    repo=".",
    experiment_name="scenario 1: OpenAI LLM",
)

callbacks = [StdOutCallbackHandler(), aim_callback]
llm = OpenAI(temperature=0, callbacks=callbacks)
```

`flush_tracker` फ़ंक्शन का उपयोग LangChain संपत्तियों को Aim पर रिकॉर्ड करने के लिए किया जाता है। डिफ़ॉल्ट रूप से, सत्र रीसेट किया जाता है बजाय इसके कि इसे पूरी तरह से समाप्त किया जाए।

<h3>सценारियो 1</h3> पहले सценारियो में, हम OpenAI LLM का उपयोग करेंगे।

```python
# scenario 1 - LLM
llm_result = llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
aim_callback.flush_tracker(
    langchain_asset=llm,
    experiment_name="scenario 2: Chain with multiple SubChains on multiple generations",
)
```

<h3>सценारियो 2</h3> दूसरा सценारियो कई पीढ़ियों में कई SubChains के साथ श्रृंखला बनाने से संबंधित है।

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
# scenario 2 - Chain
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [
    {
        "title": "documentary about good video games that push the boundary of game design"
    },
    {"title": "the phenomenon behind the remarkable speed of cheetahs"},
    {"title": "the best in class mlops tooling"},
]
synopsis_chain.apply(test_prompts)
aim_callback.flush_tracker(
    langchain_asset=synopsis_chain, experiment_name="scenario 3: Agent with Tools"
)
```

<h3>सценारियो 3</h3> तीसरा सценारियो एक उपकरण के साथ एक एजेंट से संबंधित है।

```python
from langchain.agents import AgentType, initialize_agent, load_tools
```

```python
# scenario 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=callbacks,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
aim_callback.flush_tracker(langchain_asset=agent, reset=False, finish=True)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out who Leo DiCaprio's girlfriend is and then calculate her age raised to the 0.43 power.
Action: Search
Action Input: "Leo DiCaprio girlfriend"[0m
Observation: [36;1m[1;3mLeonardo DiCaprio seemed to prove a long-held theory about his love life right after splitting from girlfriend Camila Morrone just months ...[0m
Thought:[32;1m[1;3m I need to find out Camila Morrone's age
Action: Search
Action Input: "Camila Morrone age"[0m
Observation: [36;1m[1;3m25 years[0m
Thought:[32;1m[1;3m I need to calculate 25 raised to the 0.43 power
Action: Calculator
Action Input: 25^0.43[0m
Observation: [33;1m[1;3mAnswer: 3.991298452658078
[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: Camila Morrone is Leo DiCaprio's girlfriend and her current age raised to the 0.43 power is 3.991298452658078.[0m

[1m> Finished chain.[0m
```
