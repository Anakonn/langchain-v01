---
translated: true
---

# XML पार्सर

यह आउटपुट पार्सर उपयोगकर्ताओं को लोकप्रिय XML प्रारूप में एलएलएम के परिणाम प्राप्त करने की अनुमति देता है।

ध्यान रखें कि बड़े भाषा मॉडल रिसाव अवरोध हैं! आप को अच्छी तरह से गठित XML उत्पन्न करने के लिए पर्याप्त क्षमता वाले एक एलएलएम का उपयोग करना होगा।

निम्नलिखित उदाहरण में हम क्लॉड मॉडल (https://docs.anthropic.com/claude/docs) का उपयोग करते हैं जो XML टैग के साथ वास्तव में अच्छा काम करता है।

```python
from langchain.output_parsers import XMLOutputParser
from langchain_community.chat_models import ChatAnthropic
from langchain_core.prompts import PromptTemplate
```

```python
model = ChatAnthropic(model="claude-2", max_tokens_to_sample=512, temperature=0.1)
```

मॉडल को सरल अनुरोध से शुरू करते हैं।

```python
actor_query = "Generate the shortened filmography for Tom Hanks."
output = model.invoke(
    f"""{actor_query}
Please enclose the movies in <movie></movie> tags"""
)
print(output.content)
```

```output
 Here is the shortened filmography for Tom Hanks, enclosed in XML tags:

<movie>Splash</movie>
<movie>Big</movie>
<movie>A League of Their Own</movie>
<movie>Sleepless in Seattle</movie>
<movie>Forrest Gump</movie>
<movie>Toy Story</movie>
<movie>Apollo 13</movie>
<movie>Saving Private Ryan</movie>
<movie>Cast Away</movie>
<movie>The Da Vinci Code</movie>
<movie>Captain Phillips</movie>
```

अब हम संरचित आउटपुट प्राप्त करने के लिए XMLOutputParser का उपयोग करेंगे।

```python
parser = XMLOutputParser()

prompt = PromptTemplate(
    template="""{query}\n{format_instructions}""",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

output = chain.invoke({"query": actor_query})
print(output)
```

```output
{'filmography': [{'movie': [{'title': 'Big'}, {'year': '1988'}]}, {'movie': [{'title': 'Forrest Gump'}, {'year': '1994'}]}, {'movie': [{'title': 'Toy Story'}, {'year': '1995'}]}, {'movie': [{'title': 'Saving Private Ryan'}, {'year': '1998'}]}, {'movie': [{'title': 'Cast Away'}, {'year': '2000'}]}]}
```

अंत में, आइए अपनी जरूरतों के अनुकूल आउटपुट प्राप्त करने के लिए कुछ टैग जोड़ें।

```python
parser = XMLOutputParser(tags=["movies", "actor", "film", "name", "genre"])
prompt = PromptTemplate(
    template="""{query}\n{format_instructions}""",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)


chain = prompt | model | parser

output = chain.invoke({"query": actor_query})

print(output)
```

```output
{'movies': [{'actor': [{'name': 'Tom Hanks'}, {'film': [{'name': 'Forrest Gump'}, {'genre': 'Drama'}]}, {'film': [{'name': 'Cast Away'}, {'genre': 'Adventure'}]}, {'film': [{'name': 'Saving Private Ryan'}, {'genre': 'War'}]}]}]}
```

```python
for s in chain.stream({"query": actor_query}):
    print(s)
```

```output
{'movies': [{'actor': [{'name': 'Tom Hanks'}]}]}
{'movies': [{'actor': [{'film': [{'name': 'Forrest Gump'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': 'Drama'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': 'Cast Away'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': 'Adventure'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': 'Saving Private Ryan'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': 'War'}]}]}]}
```

[XMLOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.xml.XMLOutputParser.html#langchain_core.output_parsers.xml.XMLOutputParser) के लिए API दस्तावेज़ीकरण का पता लगाएं।
