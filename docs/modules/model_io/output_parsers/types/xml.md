---
canonical: https://python.langchain.com/v0.1/docs/modules/model_io/output_parsers/types/xml
translated: false
---

# XML parser

This output parser allows users to obtain results from LLM in the popular XML format.

Keep in mind that large language models are leaky abstractions! You'll have to use an LLM with sufficient capacity to generate well-formed XML.

In the following example we use Claude model (https://docs.anthropic.com/claude/docs) which works really well with XML tags.

```python
from langchain.output_parsers import XMLOutputParser
from langchain_community.chat_models import ChatAnthropic
from langchain_core.prompts import PromptTemplate
```

```python
model = ChatAnthropic(model="claude-2", max_tokens_to_sample=512, temperature=0.1)
```

Let's start with the simple request to the model.

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

Now we will use the XMLOutputParser in order to get the structured output.

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

Finally, let's add some tags to tailor the output to our needs.

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

Find out api documentation for [XMLOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.xml.XMLOutputParser.html#langchain_core.output_parsers.xml.XMLOutputParser).