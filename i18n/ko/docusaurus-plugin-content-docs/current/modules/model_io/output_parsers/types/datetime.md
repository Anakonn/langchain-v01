---
translated: true
---

# 날짜 시간 파서

이 OutputParser는 LLM 출력을 날짜 시간 형식으로 구문 분석하는 데 사용할 수 있습니다.

```python
from langchain.output_parsers import DatetimeOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
output_parser = DatetimeOutputParser()
template = """Answer the users question:

{question}

{format_instructions}"""
prompt = PromptTemplate.from_template(
    template,
    partial_variables={"format_instructions": output_parser.get_format_instructions()},
)
```

```python
prompt
```

```output
PromptTemplate(input_variables=['question'], partial_variables={'format_instructions': "Write a datetime string that matches the following pattern: '%Y-%m-%dT%H:%M:%S.%fZ'.\n\nExamples: 0668-08-09T12:56:32.732651Z, 1213-06-23T21:01:36.868629Z, 0713-07-06T18:19:02.257488Z\n\nReturn ONLY this string, no other words!"}, template='Answer the users question:\n\n{question}\n\n{format_instructions}')
```

```python
chain = prompt | OpenAI() | output_parser
```

```python
output = chain.invoke({"question": "when was bitcoin founded?"})
```

```python
print(output)
```

```output
2009-01-03 18:15:05
```

[DatetimeOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.datetime.DatetimeOutputParser.html#langchain.output_parsers.datetime.DatetimeOutputParser)의 API 문서를 확인하세요.
