---
translated: true
---

# पॉलिगन आईओ टूलकिट

यह नोटबुक दिखाता है कि कैसे एजेंटों का उपयोग करके [पॉलिगन आईओ](https://polygon.io/) टूलकिट के साथ बातचीत की जा सकती है। टूलकिट पॉलिगन के स्टॉक मार्केट डेटा एपीआई तक पहुंच प्रदान करता है।

## उदाहरण उपयोग

### सेटअप

```python
%pip install --upgrade --quiet langchain-community > /dev/null
```

अपना पॉलिगन आईओ एपीआई कुंजी [यहां](https://polygon.io/) प्राप्त करें, और फिर इसे नीचे सेट करें।
ध्यान दें कि इस उदाहरण में उपयोग किए गए उपकरण को "स्टॉक्स एडवांस्ड" सदस्यता की आवश्यकता है।

```python
import getpass
import os

os.environ["POLYGON_API_KEY"] = getpass.getpass()
```

```output
········
```

[LangSmith](https://smith.langchain.com/) को सर्वश्रेष्ठ-इन-क्लास पर्यवेक्षणीयता के लिए सेट करना भी उपयोगी है (लेकिन आवश्यक नहीं है)।

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### एजेंट को प्रारंभ करना

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.agent_toolkits.polygon.toolkit import PolygonToolkit
from langchain_community.utilities.polygon import PolygonAPIWrapper
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
```

```python
polygon = PolygonAPIWrapper()
toolkit = PolygonToolkit.from_polygon_api_wrapper(polygon)
agent = create_openai_functions_agent(llm, toolkit.get_tools(), prompt)
```

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    verbose=True,
)
```

### किसी स्टॉक के लिए अंतिम मूल्य उद्धरण प्राप्त करें

```python
agent_executor.invoke({"input": "What is the latest stock price for AAPL?"})
```
