---
translated: true
---

# Argilla

>[Argilla](https://argilla.io/) एक ओपन-सोर्स डेटा क्यूरेशन प्लेटफॉर्म है जो LLM के लिए है।
> Argilla का उपयोग करके, हर कोई मानव और मशीन फीडबैक का उपयोग करके तेजी से डेटा क्यूरेशन के माध्यम से मजबूत भाषा मॉडल बना सकता है। हम MLOps चक्र में प्रत्येक चरण में समर्थन प्रदान करते हैं, डेटा लेबलिंग से लेकर मॉडल मॉनिटरिंग तक।

<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/argilla.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

इस गाइड में हम `ArgillaCallbackHandler` का उपयोग करके अपने LLM के इनपुट और प्रतिक्रियाओं को ट्रैक करके Argilla में एक डेटासेट कैसे बनाएं, यह दिखाएंगे।

अपने LLM के इनपुट और आउटपुट को ट्रैक करना भविष्य में फाइन-ट्यूनिंग के लिए डेटासेट बनाने के लिए उपयोगी है। यह विशेष रूप से तब उपयोगी है जब आप किसी विशिष्ट कार्य जैसे प्रश्न-उत्तर, सारांश या अनुवाद के लिए LLM का उपयोग कर रहे हैं।

## स्थापना और सेटअप

```python
%pip install --upgrade --quiet  langchain langchain-openai argilla
```

### API credentials प्राप्त करना

Argilla API credentials प्राप्त करने के लिए, निम्न चरणों का पालन करें:

1. अपने Argilla UI पर जाएं।
2. अपने प्रोफ़ाइल चित्र पर क्लिक करें और "My settings" पर जाएं।
3. फिर API Key कॉपी करें।

Argilla में API URL आपके Argilla UI के URL के समान होगा।

OpenAI API credentials प्राप्त करने के लिए, कृपया https://platform.openai.com/account/api-keys पर जाएं।

```python
import os

os.environ["ARGILLA_API_URL"] = "..."
os.environ["ARGILLA_API_KEY"] = "..."

os.environ["OPENAI_API_KEY"] = "..."
```

### Argilla सेट करना

`ArgillaCallbackHandler` का उपयोग करने के लिए, हमें अपने LLM प्रयोगों को ट्रैक करने के लिए Argilla में एक नया `FeedbackDataset` बनाना होगा। ऐसा करने के लिए, कृपया निम्न कोड का उपयोग करें:

```python
import argilla as rg
```

```python
from packaging.version import parse as parse_version

if parse_version(rg.__version__) < parse_version("1.8.0"):
    raise RuntimeError(
        "`FeedbackDataset` is only available in Argilla v1.8.0 or higher, please "
        "upgrade `argilla` as `pip install argilla --upgrade`."
    )
```

```python
dataset = rg.FeedbackDataset(
    fields=[
        rg.TextField(name="prompt"),
        rg.TextField(name="response"),
    ],
    questions=[
        rg.RatingQuestion(
            name="response-rating",
            description="How would you rate the quality of the response?",
            values=[1, 2, 3, 4, 5],
            required=True,
        ),
        rg.TextQuestion(
            name="response-feedback",
            description="What feedback do you have for the response?",
            required=False,
        ),
    ],
    guidelines="You're asked to rate the quality of the response and provide feedback.",
)

rg.init(
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)

dataset.push_to_argilla("langchain-dataset")
```

> 📌 नोट: वर्तमान में, केवल प्रॉम्प्ट-प्रतिक्रिया युग्म `FeedbackDataset.fields` के रूप में समर्थित हैं, इसलिए `ArgillaCallbackHandler` केवल प्रॉम्प्ट यानी LLM इनपुट और प्रतिक्रिया यानी LLM आउटपुट को ट्रैक करेगा।

## ट्रैकिंग

`ArgillaCallbackHandler` का उपयोग करने के लिए आप या तो निम्न कोड का उपयोग कर सकते हैं, या फिर निम्न अनुभागों में प्रस्तुत उदाहरणों में से किसी एक को दोहरा सकते हैं।

```python
from langchain_community.callbacks.argilla_callback import ArgillaCallbackHandler

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
```

### पहला दृश्य: एक LLM को ट्रैक करना

पहले, आइए कुछ बार एक LLM चलाएं और प्राप्त प्रॉम्प्ट-प्रतिक्रिया युग्मों को Argilla में कैप्चर करें।

```python
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]

llm = OpenAI(temperature=0.9, callbacks=callbacks)
llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

![Argilla UI with LangChain LLM input-response](https://docs.argilla.io/en/latest/_images/llm.png)

### दूसरा दृश्य: एक श्रृंखला में LLM को ट्रैक करना

फिर हम एक प्रॉम्प्ट टेम्प्लेट का उपयोग करके एक श्रृंखला बना सकते हैं, और फिर Argilla में प्रारंभिक प्रॉम्प्ट और अंतिम प्रतिक्रिया को ट्रैक कर सकते हैं।

```python
from langchain.chains import LLMChain
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [{"title": "Documentary about Bigfoot in Paris"}]
synopsis_chain.apply(test_prompts)
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: Documentary about Bigfoot in Paris
Playwright: This is a synopsis for the above play:[0m

[1m> Finished chain.[0m
```

```output
[{'text': "\n\nDocumentary about Bigfoot in Paris focuses on the story of a documentary filmmaker and their search for evidence of the legendary Bigfoot creature in the city of Paris. The play follows the filmmaker as they explore the city, meeting people from all walks of life who have had encounters with the mysterious creature. Through their conversations, the filmmaker unravels the story of Bigfoot and finds out the truth about the creature's presence in Paris. As the story progresses, the filmmaker learns more and more about the mysterious creature, as well as the different perspectives of the people living in the city, and what they think of the creature. In the end, the filmmaker's findings lead them to some surprising and heartwarming conclusions about the creature's existence and the importance it holds in the lives of the people in Paris."}]
```

![Argilla UI with LangChain Chain input-response](https://docs.argilla.io/en/latest/_images/chain.png)

### तीसरा दृश्य: उपकरणों के साथ एक एजेंट का उपयोग करना

अंत में, एक अधिक उन्नत कार्यप्रवाह के रूप में, आप कुछ उपकरणों का उपयोग करने वाले एक एजेंट बना सकते हैं। इस प्रकार `ArgillaCallbackHandler` मूल प्रॉम्प्ट और उस प्रॉम्प्ट के लिए अंतिम प्रतिक्रिया को लॉग करेगा, लेकिन मध्यवर्ती चरणों/विचारों के बारे में नहीं।

> ध्यान दें कि इस दृश्य के लिए हम Google Search API (Serp API) का उपयोग करेंगे, इसलिए आपको `google-search-results` को `pip install google-search-results` के रूप में स्थापित करना होगा, और Serp API Key को `os.environ["SERPAPI_API_KEY"] = "..."` के रूप में सेट करना होगा (आप https://serpapi.com/dashboard पर इसे पा सकते हैं), अन्यथा नीचे दिया गया उदाहरण काम नहीं करेगा।

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

tools = load_tools(["serpapi"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=callbacks,
)
agent.run("Who was the first president of the United States of America?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to answer a historical question
Action: Search
Action Input: "who was the first president of the United States of America" [0m
Observation: [36;1m[1;3mGeorge Washington[0m
Thought:[32;1m[1;3m George Washington was the first president
Final Answer: George Washington was the first president of the United States of America.[0m

[1m> Finished chain.[0m
```

```output
'George Washington was the first president of the United States of America.'
```

![Argilla UI with LangChain Agent input-response](https://docs.argilla.io/en/latest/_images/agent.png)
