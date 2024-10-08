---
sidebar_label: Perplexity
translated: true
---

# ChatPerplexity

यह नोटबुक Perplexity चैट मॉडल्स का उपयोग शुरू करने के बारे में कवर करता है।

```python
from langchain_community.chat_models import ChatPerplexity
from langchain_core.prompts import ChatPromptTemplate
```

प्रदान किया गया कोड मान्यता रखता है कि आपका PPLX_API_KEY आपके पर्यावरण चर में सेट है। यदि आप मैन्युअल रूप से अपना API कुंजी निर्दिष्ट करना चाहते हैं और एक अलग मॉडल का चयन करना चाहते हैं, तो आप निम्नलिखित कोड का उपयोग कर सकते हैं:

```python
chat = ChatPerplexity(temperature=0, pplx_api_key="YOUR_API_KEY", model="pplx-70b-online")
```

आप उपलब्ध मॉडलों की सूची यहां [यहां](https://docs.perplexity.ai/docs/model-cards) देख सकते हैं। पुनरुत्पादन के लिए, हम इस नोटबुक में इनपुट के रूप में API कुंजी गतिशील रूप से लेकर सेट कर सकते हैं।

```python
import os
from getpass import getpass

PPLX_API_KEY = getpass()
os.environ["PPLX_API_KEY"] = PPLX_API_KEY
```

```python
chat = ChatPerplexity(temperature=0, model="pplx-70b-online")
```

```python
system = "You are a helpful assistant."
human = "{input}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chain = prompt | chat
response = chain.invoke({"input": "Why is the Higgs Boson important?"})
response.content
```

```output
'The Higgs Boson is an elementary subatomic particle that plays a crucial role in the Standard Model of particle physics, which accounts for three of the four fundamental forces governing the behavior of our universe: the strong and weak nuclear forces, electromagnetism, and gravity. The Higgs Boson is important for several reasons:\n\n1. **Final Elementary Particle**: The Higgs Boson is the last elementary particle waiting to be discovered under the Standard Model. Its detection helps complete the Standard Model and further our understanding of the fundamental forces in the universe.\n\n2. **Mass Generation**: The Higgs Boson is responsible for giving mass to other particles, a process that occurs through its interaction with the Higgs field. This mass generation is essential for the formation of atoms, molecules, and the visible matter we observe in the universe.\n\n3. **Implications for New Physics**: While the detection of the Higgs Boson has confirmed many aspects of the Standard Model, it also opens up new possibilities for discoveries beyond the Standard Model. Further research on the Higgs Boson could reveal insights into the nature of dark matter, supersymmetry, and other exotic phenomena.\n\n4. **Advancements in Technology**: The search for the Higgs Boson has led to significant advancements in technology, such as the development of artificial intelligence and machine learning algorithms used in particle accelerators like the Large Hadron Collider (LHC). These advancements have not only contributed to the discovery of the Higgs Boson but also have potential applications in various other fields.\n\nIn summary, the Higgs Boson is important because it completes the Standard Model, plays a crucial role in mass generation, hints at new physics phenomena beyond the Standard Model, and drives advancements in technology.\n'
```

आप प्रोम्प्ट को आमतौर पर की तरह प्रारूपित और संरचित कर सकते हैं। निम्नलिखित उदाहरण में, हम मॉडल से बिल्लियों पर एक जोक बताने के लिए कहते हैं।

```python
chat = ChatPerplexity(temperature=0, model="pplx-70b-online")
prompt = ChatPromptTemplate.from_messages([("human", "Tell me a joke about {topic}")])
chain = prompt | chat
response = chain.invoke({"topic": "cats"})
response.content
```

```output
'Here\'s a joke about cats:\n\nWhy did the cat want math lessons from a mermaid?\n\nBecause it couldn\'t find its "core purpose" in life!\n\nRemember, cats are unique and fascinating creatures, and each one has its own special traits and abilities. While some may see them as mysterious or even a bit aloof, they are still beloved pets that bring joy and companionship to their owners. So, if your cat ever seeks guidance from a mermaid, just remember that they are on their own journey to self-discovery!\n'
```

## `ChatPerplexity` स्ट्रीमिंग कार्यक्षमता का भी समर्थन करता है:

```python
chat = ChatPerplexity(temperature=0.7, model="pplx-70b-online")
prompt = ChatPromptTemplate.from_messages(
    [("human", "Give me a list of famous tourist attractions in Pakistan")]
)
chain = prompt | chat
for chunk in chain.stream({}):
    print(chunk.content, end="", flush=True)
```

```output
Here is a list of some famous tourist attractions in Pakistan:

1. **Minar-e-Pakistan**: A 62-meter high minaret in Lahore that represents the history of Pakistan.
2. **Badshahi Mosque**: A historic mosque in Lahore with a capacity of 10,000 worshippers.
3. **Shalimar Gardens**: A beautiful garden in Lahore with landscaped grounds and a series of cascading pools.
4. **Pakistan Monument**: A national monument in Islamabad representing the four provinces and three districts of Pakistan.
5. **National Museum of Pakistan**: A museum in Karachi showcasing the country's cultural history.
6. **Faisal Mosque**: A large mosque in Islamabad that can accommodate up to 300,000 worshippers.
7. **Clifton Beach**: A popular beach in Karachi offering water activities and recreational facilities.
8. **Kartarpur Corridor**: A visa-free border crossing and religious corridor connecting Gurdwara Darbar Sahib in Pakistan to Gurudwara Sri Kartarpur Sahib in India.
9. **Mohenjo-daro**: An ancient Indus Valley civilization site in Sindh, Pakistan, dating back to around 2500 BCE.
10. **Hunza Valley**: A picturesque valley in Gilgit-Baltistan known for its stunning mountain scenery and unique culture.

These attractions showcase the rich history, diverse culture, and natural beauty of Pakistan, making them popular destinations for both local and international tourists.
```
