---
translated: true
---

# 구조화된 출력 파서

이 출력 파서는 여러 필드를 반환하고 싶을 때 사용할 수 있습니다. Pydantic/JSON 파서보다 강력하지는 않지만, 덜 강력한 모델에 유용합니다.

```python
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

```python
response_schemas = [
    ResponseSchema(name="answer", description="answer to the user's question"),
    ResponseSchema(
        name="source",
        description="source used to answer the user's question, should be a website.",
    ),
]
output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
```

이제 응답이 어떻게 형식화되어야 하는지에 대한 지침이 포함된 문자열을 얻게 되며, 이를 프롬프트에 삽입합니다.

```python
format_instructions = output_parser.get_format_instructions()
prompt = PromptTemplate(
    template="answer the users question as best as possible.\n{format_instructions}\n{question}",
    input_variables=["question"],
    partial_variables={"format_instructions": format_instructions},
)
```

```python
model = ChatOpenAI(temperature=0)
chain = prompt | model | output_parser
```

```python
chain.invoke({"question": "what's the capital of france?"})
```

```output
{'answer': 'The capital of France is Paris.',
 'source': 'https://en.wikipedia.org/wiki/Paris'}
```

```python
for s in chain.stream({"question": "what's the capital of france?"}):
    print(s)
```

```output
{'answer': 'The capital of France is Paris.', 'source': 'https://en.wikipedia.org/wiki/Paris'}
```

[StructuredOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.structured.StructuredOutputParser.html#langchain.output_parsers.structured.StructuredOutputParser)의 API 문서를 확인하세요.
