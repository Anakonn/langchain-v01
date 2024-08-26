---
translated: true
---

# संरचित आउटपुट पार्सर

यह आउटपुट पार्सर तब उपयोगी हो सकता है जब आप कई फ़ील्ड वापस करना चाहते हैं। जबकि Pydantic/JSON पार्सर अधिक शक्तिशाली है, यह कम शक्तिशाली मॉडलों के लिए उपयोगी है।

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

अब हमें एक स्ट्रिंग मिलती है जो प्रतिक्रिया को प्रारूपित करने के लिए निर्देश शामिल करती है, और फिर हम उसे अपने प्रॉम्प्ट में डालते हैं।

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

[StructuredOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.structured.StructuredOutputParser.html#langchain.output_parsers.structured.StructuredOutputParser) के लिए API प्रलेखन देखें।
