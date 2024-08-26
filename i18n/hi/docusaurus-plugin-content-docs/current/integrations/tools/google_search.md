---
translated: true
---

# Google खोज

यह नोटबुक गूगल खोज घटक का उपयोग करने के बारे में चर्चा करता है।

सबसे पहले, आपको उचित API कुंजी और पर्यावरण चर में सेट करना होगा। इसे सेट करने के लिए, गूगल क्लाउड क्रेडेंशियल कंसोल (https://console.cloud.google.com/apis/credentials) में GOOGLE_API_KEY बनाएं और प्रोग्रामेबल खोज इंजन (https://programmablesearchengine.google.com/controlpanel/create) का उपयोग करके GOOGLE_CSE_ID बनाएं। अगला कदम यह है कि आप [यहां](https://stackoverflow.com/questions/37083058/programmatically-searching-google-in-python-using-custom-search) मिलने वाले निर्देशों का पालन करें।

फिर हमें कुछ पर्यावरण चर सेट करने की आवश्यकता होगी।

```python
import os

os.environ["GOOGLE_CSE_ID"] = ""
os.environ["GOOGLE_API_KEY"] = ""
```

```python
from langchain_community.utilities import GoogleSearchAPIWrapper
from langchain_core.tools import Tool

search = GoogleSearchAPIWrapper()

tool = Tool(
    name="google_search",
    description="Search Google for recent results.",
    func=search.run,
)
```

```python
tool.run("Obama's first name?")
```

```output
"STATE OF HAWAII. 1 Child's First Name. (Type or print). 2. Sex. BARACK. 3. This Birth. CERTIFICATE OF LIVE BIRTH. FILE. NUMBER 151 le. lb. Middle Name. Barack Hussein Obama II is an American former politician who served as the 44th president of the United States from 2009 to 2017. A member of the Democratic\xa0... When Barack Obama was elected president in 2008, he became the first African American to hold ... The Middle East remained a key foreign policy challenge. Jan 19, 2017 ... Jordan Barack Treasure, New York City, born in 2008 ... Jordan Barack Treasure made national news when he was the focus of a New York newspaper\xa0... Portrait of George Washington, the 1st President of the United States ... Portrait of Barack Obama, the 44th President of the United States\xa0... His full name is Barack Hussein Obama II. Since the “II” is simply because he was named for his father, his last name is Obama. Mar 22, 2008 ... Barry Obama decided that he didn't like his nickname. A few of his friends at Occidental College had already begun to call him Barack (his\xa0... Aug 18, 2017 ... It took him several seconds and multiple clues to remember former President Barack Obama's first name. Miller knew that every answer had to\xa0... Feb 9, 2015 ... Michael Jordan misspelled Barack Obama's first name on 50th-birthday gift ... Knowing Obama is a Chicagoan and huge basketball fan,\xa0... 4 days ago ... Barack Obama, in full Barack Hussein Obama II, (born August 4, 1961, Honolulu, Hawaii, U.S.), 44th president of the United States (2009–17) and\xa0..."
```

## परिणामों की संख्या

आप `k` पैरामीटर का उपयोग करके परिणामों की संख्या सेट कर सकते हैं।

```python
search = GoogleSearchAPIWrapper(k=1)

tool = Tool(
    name="I'm Feeling Lucky",
    description="Search Google and return the first result.",
    func=search.run,
)
```

```python
tool.run("python")
```

```output
'The official home of the Python Programming Language.'
```

'पायथन प्रोग्रामिंग भाषा का आधिकारिक घर।'

## मेटाडेटा परिणाम

GoogleSearch के माध्यम से क्वेरी चलाएं और स्निपेट, शीर्षक और लिंक मेटाडेटा लौटाएं।

- स्निपेट: परिणाम का विवरण।
- शीर्षक: परिणाम का शीर्षक।
- लिंक: परिणाम का लिंक।

```python
search = GoogleSearchAPIWrapper()


def top5_results(query):
    return search.results(query, 5)


tool = Tool(
    name="Google Search Snippets",
    description="Search Google for recent results.",
    func=top5_results,
)
```
