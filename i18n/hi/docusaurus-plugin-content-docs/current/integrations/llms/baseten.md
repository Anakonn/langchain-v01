---
translated: true
---

# बेसेटेन

[बेसेटेन](https://baseten.co) एक [प्रदाता](/docs/integrations/providers/baseten) है जो LangChain पारिस्थितिकी तंत्र में LLMs घटक को लागू करता है।

यह उदाहरण LangChain के साथ बेसेटेन पर होस्ट किए गए Mistral 7B जैसे एक LLM का उपयोग करने का प्रदर्शन करता है।

# सेटअप

इस उदाहरण को चलाने के लिए आपको निम्नलिखित की आवश्यकता होगी:

* एक [बेसेटेन खाता](https://baseten.co)
* एक [API कुंजी](https://docs.baseten.co/observability/api-keys)

अपनी API कुंजी को `BASETEN_API_KEY` नामक एक पर्यावरण चर के रूप में निर्यात करें।

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

# एकल मॉडल कॉल

पहले, आपको बेसेटेन पर एक मॉडल तैनात करना होगा।

आप [बेसेटेन मॉडल लाइब्रेरी](https://app.baseten.co/explore/) से Mistral और Llama 2 जैसे फाउंडेशन मॉडल एक क्लिक से तैनात कर सकते हैं या अगर आपके पास अपना ही मॉडल है, तो [Truss के साथ इसे तैनात करें](https://truss.baseten.co/welcome)।

इस उदाहरण में, हम Mistral 7B के साथ काम करेंगे। [यहां Mistral 7B तैनात करें](https://app.baseten.co/explore/mistral_7b_instruct) और मॉडल डैशबोर्ड में मिलने वाले तैनात मॉडल की ID के साथ आगे बढ़ें।

```python
from langchain_community.llms import Baseten
```

```python
# Load the model
mistral = Baseten(model="MODEL_ID", deployment="production")
```

```python
# Prompt the model
mistral("What is the Mistral wind?")
```

# श्रृंखलित मॉडल कॉल

हम एक या एक से अधिक मॉडल को एक साथ कॉल कर सकते हैं, जो LangChain का मूल उद्देश्य है!

उदाहरण के लिए, हम इस टर्मिनल एमुलेशन डेमो में GPT को Mistral से बदल सकते हैं।

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.prompts import PromptTemplate

template = """Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

{history}
Human: {human_input}
Assistant:"""

prompt = PromptTemplate(input_variables=["history", "human_input"], template=template)


chatgpt_chain = LLMChain(
    llm=mistral,
    llm_kwargs={"max_length": 4096},
    prompt=prompt,
    verbose=True,
    memory=ConversationBufferWindowMemory(k=2),
)

output = chatgpt_chain.predict(
    human_input="I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English I will do so by putting text inside curly brackets {like this}. My first command is pwd."
)
print(output)
```

```python
output = chatgpt_chain.predict(human_input="ls ~")
print(output)
```

```python
output = chatgpt_chain.predict(human_input="cd ~")
print(output)
```

```python
output = chatgpt_chain.predict(
    human_input="""echo -e "x=lambda y:y*5+3;print('Result:' + str(x(6)))" > run.py && python3 run.py"""
)
print(output)
```

जैसा कि हम अंतिम उदाहरण से देख सकते हैं, जो एक संख्या उत्पन्न कर सकता है जो सही हो या नहीं, मॉडल केवल संभावित टर्मिनल आउटपुट का अनुमान लगा रहा है, प्रदान किए गए कमांड को वास्तव में निष्पादित नहीं कर रहा है। फिर भी, उदाहरण Mistral की पर्याप्त संदर्भ विंडो, कोड जनन क्षमताओं और संवादात्मक अनुक्रमों में भी विषय पर बने रहने की क्षमता का प्रदर्शन करता है।
