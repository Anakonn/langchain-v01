---
translated: true
---

# SerpAPI

यह नोटबुक SerpAPI घटक का उपयोग करके वेब खोजने के बारे में चर्चा करता है।

```python
from langchain_community.utilities import SerpAPIWrapper
```

```python
search = SerpAPIWrapper()
```

```python
search.run("Obama's first name?")
```

```output
'Barack Hussein Obama II'
```

## कस्टम पैरामीटर

आप SerpAPI रैपर को भी मनमाने पैरामीटर के साथ अनुकूलित कर सकते हैं। उदाहरण के लिए, नीचे दिए गए उदाहरण में हम `google` के बजाय `bing` का उपयोग करेंगे।

```python
params = {
    "engine": "bing",
    "gl": "us",
    "hl": "en",
}
search = SerpAPIWrapper(params=params)
```

```python
search.run("Obama's first name?")
```

```output
'Barack Hussein Obama II is an American politician who served as the 44th president of the United States from 2009 to 2017. A member of the Democratic Party, Obama was the first African-American presi…New content will be added above the current area of focus upon selectionBarack Hussein Obama II is an American politician who served as the 44th president of the United States from 2009 to 2017. A member of the Democratic Party, Obama was the first African-American president of the United States. He previously served as a U.S. senator from Illinois from 2005 to 2008 and as an Illinois state senator from 1997 to 2004, and previously worked as a civil rights lawyer before entering politics.Wikipediabarackobama.com'
```

```python
from langchain.agents import Tool

# You can create the tool to pass to an agent
repl_tool = Tool(
    name="python_repl",
    description="A Python shell. Use this to execute python commands. Input should be a valid python command. If you want to see the output of a value, you should print it out with `print(...)`.",
    func=search.run,
)
```
