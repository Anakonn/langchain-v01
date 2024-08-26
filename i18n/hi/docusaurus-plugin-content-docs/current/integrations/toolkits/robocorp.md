---
translated: true
---

# रोबोकॉर्प

यह नोटबुक [रोबोकॉर्प एक्शन सर्वर](https://github.com/robocorp/robocorp) एक्शन टूलकिट और LangChain के साथ शुरू करने के बारे में कवर करता है।

रोबोकॉर्प एआई एजेंटों, सहायकों और कोपायलट की क्षमताओं को कस्टम एक्शन के साथ विस्तारित करने का सबसे आसान तरीका है।

## इंस्टॉलेशन

पहले, [रोबोकॉर्प त्वरित शुरुआत](https://github.com/robocorp/robocorp#quickstart) देखें कि कैसे `एक्शन सर्वर` सेट करें और अपने एक्शन बनाएं।

अपने LangChain एप्लिकेशन में, `langchain-robocorp` पैकेज इंस्टॉल करें:

```python
# Install package
%pip install --upgrade --quiet langchain-robocorp
```

जब आप उपरोक्त त्वरित शुरुआत का पालन करके नया `एक्शन सर्वर` बनाते हैं।

यह एक निर्देशिका बनाएगा जिसमें फ़ाइलें शामिल हैं, जिसमें `action.py` भी शामिल है।

हम [यहाँ](https://github.com/robocorp/robocorp/tree/master/actions#describe-your-action) दिखाए गए तरीके से एक्शन के रूप में पायथन फ़ंक्शन जोड़ सकते हैं।

```python
@action
def get_weather_forecast(city: str, days: int, scale: str = "celsius") -> str:
    """
    Returns weather conditions forecast for a given city.

    Args:
        city (str): Target city to get the weather conditions for
        days: How many day forecast to return
        scale (str): Temperature scale to use, should be one of "celsius" or "fahrenheit"

    Returns:
        str: The requested weather conditions forecast
    """
    return "75F and sunny :)"
```

फिर हम सर्वर शुरू करते हैं:

```bash
action-server start
```

और हम देख सकते हैं:

```text
Found new action: get_weather_forecast

```

स्थानीय रूप से परीक्षण करने के लिए `http://localhost:8080` पर चल रहे सर्वर पर जाएं और फ़ंक्शन चलाने के लिए UI का उपयोग करें।

## पर्यावरण सेटअप

वैकल्पिक रूप से आप निम्नलिखित पर्यावरण चर सेट कर सकते हैं:

- `LANGCHAIN_TRACING_V2=true`: LangSmith लॉग रन ट्रेसिंग को सक्षम करने के लिए जो कि संबंधित एक्शन सर्वर एक्शन रन लॉग से भी बाइंड किया जा सकता है। अधिक जानकारी के लिए [LangSmith दस्तावेज़](https://docs.smith.langchain.com/tracing#log-runs) देखें।

## उपयोग

हमने उपर स्थानीय एक्शन सर्वर शुरू किया, `http://localhost:8080` पर चल रहा है।

```python
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain_robocorp import ActionServerToolkit

# Initialize LLM chat model
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Initialize Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080", report_trace=True)
tools = toolkit.get_tools()

# Initialize Agent
system_message = SystemMessage(content="You are a helpful assistant")
prompt = OpenAIFunctionsAgent.create_prompt(system_message)
agent = OpenAIFunctionsAgent(llm=llm, prompt=prompt, tools=tools)

executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

executor.invoke("What is the current weather today in San Francisco in fahrenheit?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `robocorp_action_server_get_weather_forecast` with `{'city': 'San Francisco', 'days': 1, 'scale': 'fahrenheit'}`


[0m[33;1m[1;3m"75F and sunny :)"[0m[32;1m[1;3mThe current weather today in San Francisco is 75F and sunny.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What is the current weather today in San Francisco in fahrenheit?',
 'output': 'The current weather today in San Francisco is 75F and sunny.'}
```

### एकल इनपुट टूल

डिफ़ॉल्ट रूप से `toolkit.get_tools()` संरचित टूल के रूप में एक्शन वापस करेगा।

एकल इनपुट टूल वापस करने के लिए, प्रोसेसिंग इनपुट के लिए उपयोग किए जाने वाले चैट मॉडल को पास करें।

```python
# Initialize single input Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080")
tools = toolkit.get_tools(llm=llm)
```
