---
translated: true
---

# Google Finance

यह नोटबुक Google Finance Tool का उपयोग करके Google Finance पेज से जानकारी प्राप्त करने के बारे में चर्चा करता है।

SerpApi कुंजी प्राप्त करने के लिए, यहां साइन अप करें: https://serpapi.com/users/sign_up।

फिर google-search-results को निम्न कमांड से इंस्टॉल करें:

pip install google-search-results

फिर SERPAPI_API_KEY पर्यावरण चर को अपने SerpApi कुंजी से सेट करें।

या कि wrapper में कुंजी को तर्क के रूप में पारित करें serp_api_key="your secret key"

उपकरण का उपयोग करें।

```python
%pip install --upgrade --quiet  google-search-results
```

```python
import os

from langchain_community.tools.google_finance import GoogleFinanceQueryRun
from langchain_community.utilities.google_finance import GoogleFinanceAPIWrapper

os.environ["SERPAPI_API_KEY"] = ""
tool = GoogleFinanceQueryRun(api_wrapper=GoogleFinanceAPIWrapper())
```

```python
tool.run("Google")
```

Langchain के साथ इसका उपयोग करना

```python
import os

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

os.environ["OPENAI_API_KEY"] = ""
os.environ["SERP_API_KEY"] = ""
llm = OpenAI()
tools = load_tools(["google-scholar", "google-finance"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
agent.run("what is google's stock")
```
