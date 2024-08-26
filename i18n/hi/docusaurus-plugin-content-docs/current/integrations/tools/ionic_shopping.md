---
translated: true
---

# आयोनिक खरीदारी उपकरण

[आयोनिक](https://www.ioniccommerce.com/) एक प्लग एंड प्ले ई-कॉमर्स मार्केटप्लेस है जो एआई सहायकों के लिए है। अपने एजेंट में [आयोनिक उपकरण](https://github.com/ioniccommerce/ionic_langchain) शामिल करके, आप अपने उपयोगकर्ताओं को सीधे अपने एजेंट के भीतर खरीदने और लेनदेन करने की क्षमता प्रदान कर रहे हैं, और आप लेनदेन का हिस्सा प्राप्त करेंगे।

यह एक बुनियादी jupyter नोटबुक है जो दिखाता है कि आयोनिक उपकरण को अपने एजेंट में कैसे एकीकृत किया जाए। आयोनिक के साथ अपने एजेंट को सेट करने के बारे में अधिक जानकारी के लिए, आयोनिक [दस्तावेज़](https://docs.ioniccommerce.com/introduction) देखें।

यह Jupyter Notebook एजेंट के साथ आयोनिक उपकरण का उपयोग करने का प्रदर्शन करता है।

**नोट: आयोनिक-langchain पैकेज आयोनिक कॉमर्स टीम द्वारा बनाया और बनाए रखा जाता है, न कि LangChain मेंटेनर्स द्वारा।**

---

## सेटअप

```python
pip install langchain langchain_openai langchainhub
```

```python
pip install ionic-langchain
```

## एजेंट सेटअप

```python
from ionic_langchain.tool import Ionic, IonicTool
from langchain import hub
from langchain.agents import AgentExecutor, Tool, create_react_agent
from langchain_openai import OpenAI

# Based on ReAct Agent
# https://python.langchain.com/docs/modules/agents/agent_types/react
# Please reach out to support@ionicapi.com for help with add'l agent types.

open_ai_key = "YOUR KEY HERE"
model = "gpt-3.5-turbo-instruct"
temperature = 0.6

llm = OpenAI(openai_api_key=open_ai_key, model_name=model, temperature=temperature)


ionic_tool = IonicTool().tool()


# The tool comes with its own prompt,
# but you may also update it directly via the description attribute:

ionic_tool.description = str(
    """
Ionic is an e-commerce shopping tool. Assistant uses the Ionic Commerce Shopping Tool to find, discover, and compare products from thousands of online retailers. Assistant should use the tool when the user is looking for a product recommendation or trying to find a specific product.

The user may specify the number of results, minimum price, and maximum price for which they want to see results.
Ionic Tool input is a comma-separated string of values:
  - query string (required, must not include commas)
  - number of results (default to 4, no more than 10)
  - minimum price in cents ($5 becomes 500)
  - maximum price in cents
For example, if looking for coffee beans between 5 and 10 dollars, the tool input would be `coffee beans, 5, 500, 1000`.

Return them as a markdown formatted list with each recommendation from tool results, being sure to include the full PDP URL. For example:

1. Product 1: [Price] -- link
2. Product 2: [Price] -- link
3. Product 3: [Price] -- link
4. Product 4: [Price] -- link
"""
)

tools = [ionic_tool]

# default prompt for create_react_agent
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(
    llm,
    tools,
    prompt=prompt,
)

agent_executor = AgentExecutor(
    agent=agent, tools=tools, handle_parsing_errors=True, verbose=True, max_iterations=5
)
```

## चलाएं

```python
input = (
    "I'm looking for a new 4k monitor can you find me some options for less than $1000"
)
agent_executor.invoke({"input": input})
```
