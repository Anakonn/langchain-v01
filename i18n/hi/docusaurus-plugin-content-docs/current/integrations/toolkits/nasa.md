---
translated: true
---

# नासा

यह नोटबुक दिखाता है कि एजेंटों का उपयोग कैसे नासा टूलकिट के साथ करें। टूलकिट नासा छवि और वीडियो लाइब्रेरी एपीआई तक पहुंच प्रदान करता है, भविष्य की कड़ियों में अन्य सुलभ नासा एपीआई शामिल करने की क्षमता के साथ।

**नोट: नासा छवि और वीडियो लाइब्रेरी खोज क्वेरी मीडिया परिणामों की वांछित संख्या निर्दिष्ट नहीं होने पर बड़े प्रतिक्रिया में परिणाम दे सकती हैं। एलएलएम टोकन क्रेडिट का उपयोग करते समय इस पर विचार करें।**

## उदाहरण उपयोग:

---

### एजेंट को प्रारंभ करना

```python
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.nasa.toolkit import NasaToolkit
from langchain_community.utilities.nasa import NasaAPIWrapper
from langchain_openai import OpenAI

llm = OpenAI(temperature=0, openai_api_key="")
nasa = NasaAPIWrapper()
toolkit = NasaToolkit.from_nasa_api_wrapper(nasa)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

### मीडिया संपत्तियों की क्वेरी करना

```python
agent.run(
    "Can you find three pictures of the moon published between the years 2014 and 2020?"
)
```

### मीडिया संपत्तियों के बारे में विवरण क्वेरी करना

```python
output = agent.run(
    "I've just queried an image of the moon with the NASA id NHQ_2019_0311_Go Forward to the Moon."
    " Where can I find the metadata manifest for this asset?"
)
```
