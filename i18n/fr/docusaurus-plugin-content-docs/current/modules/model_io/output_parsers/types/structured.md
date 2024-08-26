---
translated: true
---

# Analyseur de sortie structurée

Cet analyseur de sortie peut être utilisé lorsque vous voulez renvoyer plusieurs champs. Bien que l'analyseur Pydantic/JSON soit plus puissant, cela est utile pour des modèles moins puissants.

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

Nous obtenons maintenant une chaîne qui contient les instructions sur la façon dont la réponse doit être formatée, et nous l'insérons ensuite dans notre invite.

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

Trouvez la documentation de l'API pour [StructuredOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.structured.StructuredOutputParser.html#langchain.output_parsers.structured.StructuredOutputParser).
