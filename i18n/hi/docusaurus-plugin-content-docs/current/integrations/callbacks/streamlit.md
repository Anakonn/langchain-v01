---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# Streamlit

> **[Streamlit](https://streamlit.io/) डेटा ऐप्स को बनाने और साझा करने का एक तेज़ तरीका है।**
> Streamlit डेटा स्क्रिप्ट को मिनटों में साझा करने योग्य वेब ऐप्स में बदल देता है। सिर्फ पायथन में। कोई फ्रंट-एंड अनुभव की आवश्यकता नहीं।
> और उदाहरण देखें [streamlit.io/generative-ai](https://streamlit.io/generative-ai) पर।

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/langchain-ai/streamlit-agent?quickstart=1)

इस गाइड में हम दिखाएंगे कि `StreamlitCallbackHandler` का उपयोग कैसे करें ताकि एक इंटरैक्टिव Streamlit ऐप में एक एजेंट के विचारों और कार्रवाइयों को प्रदर्शित किया जा सके। MRKL एजेंट का उपयोग करके नीचे चल रहे ऐप के साथ इसे आज़माएं:

<iframe loading="lazy" src="https://langchain-mrkl.streamlit.app/?embed=true&embed_options=light_theme"
    style={{ width: 100 + '%', border: 'none', marginBottom: 1 + 'rem', height: 600 }}
    allow="camera;clipboard-read;clipboard-write;"
></iframe>

## इंस्टॉलेशन और सेटअप

```bash
pip install langchain streamlit
```

आप `streamlit hello` चला सकते हैं ताकि एक नमूना ऐप लोड हो और आपका इंस्टॉल सफल हुआ है, इसकी पुष्टि हो। Streamlit के [Getting started documentation](https://docs.streamlit.io/library/get-started) में पूरे निर्देश देखें।

## विचारों और कार्रवाइयों को प्रदर्शित करें

एक `StreamlitCallbackHandler` बनाने के लिए, आपको केवल आउटपुट को रेंडर करने के लिए एक पेरेंट कंटेनर प्रदान करना होगा।

```python
<!--IMPORTS:[{"imported": "StreamlitCallbackHandler", "source": "langchain_community.callbacks.streamlit", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.streamlit.StreamlitCallbackHandler.html", "title": "Streamlit"}]-->
from langchain_community.callbacks.streamlit import (
    StreamlitCallbackHandler,
)
import streamlit as st

st_callback = StreamlitCallbackHandler(st.container())
```

प्रदर्शन व्यवहार को अनुकूलित करने के लिए अतिरिक्त कीवर्ड तर्क [API reference](https://api.python.langchain.com/en/latest/callbacks/langchain.callbacks.streamlit.streamlit_callback_handler.StreamlitCallbackHandler.html) में वर्णित हैं।

### परिदृश्य 1: उपकरणों के साथ एक एजेंट का उपयोग करना

वर्तमान में समर्थित प्राथमिक उपयोग मामला एक एजेंट के कार्रवाइयों को दृश्यमान बनाना है (या एजेंट एक्जीक्यूटर)। आप अपने Streamlit ऐप में एक एजेंट बना सकते हैं और सिर्फ `StreamlitCallbackHandler` को `agent.run()` में पास करके अपने ऐप में विचारों और कार्रवाइयों को लाइव देख सकते हैं।

```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "Streamlit"}, {"imported": "create_react_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.react.agent.create_react_agent.html", "title": "Streamlit"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Streamlit"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Streamlit"}]-->
import streamlit as st
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0, streaming=True)
tools = load_tools(["ddg-search"])
prompt = hub.pull("hwchase17/react")
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

if prompt := st.chat_input():
    st.chat_message("user").write(prompt)
    with st.chat_message("assistant"):
        st_callback = StreamlitCallbackHandler(st.container())
        response = agent_executor.invoke(
            {"input": prompt}, {"callbacks": [st_callback]}
        )
        st.write(response["output"])
```

**नोट:** उपरोक्त ऐप कोड को सफलतापूर्वक चलाने के लिए आपको `OPENAI_API_KEY` सेट करना होगा।
ऐसा करने का सबसे आसान तरीका [Streamlit secrets.toml](https://docs.streamlit.io/library/advanced-features/secrets-management) का उपयोग करना है,
या किसी अन्य स्थानीय ENV प्रबंधन उपकरण का।

### अतिरिक्त परिदृश्य

वर्तमान में `StreamlitCallbackHandler` एक LangChain एजेंट एक्जीक्यूटर के साथ उपयोग के लिए तैयार है। अन्य एजेंट प्रकारों, श्रृंखलाओं के साथ प्रत्यक्ष उपयोग आदि के लिए समर्थन भविष्य में जोड़ा जाएगा।

आप [StreamlitChatMessageHistory](/docs/integrations/memory/streamlit_chat_message_history) का उपयोग करने में भी रुचि ले सकते हैं LangChain के लिए।
