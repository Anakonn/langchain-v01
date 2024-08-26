---
translated: true
---

# XML 파서

이 출력 파서를 사용하면 사용자가 인기 있는 XML 형식으로 LLM의 결과를 얻을 수 있습니다.

대규모 언어 모델은 누출 추상화라는 점을 명심하세요! 잘 구성된 XML을 생성하려면 충분한 용량의 LLM을 사용해야 합니다.

다음 예에서는 XML 태그와 매우 잘 작동하는 Claude 모델(https://docs.anthropic.com/claude/docs)을 사용합니다.

```python
from langchain.output_parsers import XMLOutputParser
from langchain_community.chat_models import ChatAnthropic
from langchain_core.prompts import PromptTemplate
```

```python
model = ChatAnthropic(model="claude-2", max_tokens_to_sample=512, temperature=0.1)
```

모델에 대한 간단한 요청으로 시작해 보겠습니다.

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

이제 XMLOutputParser를 사용하여 구조화된 출력을 얻겠습니다.

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

마지막으로 태그를 추가하여 출력을 우리의 요구에 맞게 조정해 보겠습니다.

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

[XMLOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.xml.XMLOutputParser.html#langchain_core.output_parsers.xml.XMLOutputParser)의 API 문서를 확인하세요.
