---
translated: true
---

# Analyseur JSON

Cet analyseur de sortie permet aux utilisateurs de spécifier un schéma JSON arbitraire et d'interroger les LLM pour obtenir des sorties conformes à ce schéma.

Gardez à l'esprit que les modèles de langage de grande taille sont des abstractions imparfaites ! Vous devrez utiliser un LLM avec une capacité suffisante pour générer du JSON bien formé. Dans la famille OpenAI, DaVinci peut le faire de manière fiable, mais les capacités de Curie diminuent déjà de manière dramatique.

Vous pouvez éventuellement utiliser Pydantic pour déclarer votre modèle de données.

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(temperature=0)
```

```python
# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")
```

```python
# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = JsonOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

## Streaming

Cet analyseur de sortie prend en charge le streaming.

```python
for s in chain.stream({"query": joke_query}):
    print(s)
```

```output
{'setup': ''}
{'setup': 'Why'}
{'setup': 'Why don'}
{'setup': "Why don't"}
{'setup': "Why don't scientists"}
{'setup': "Why don't scientists trust"}
{'setup': "Why don't scientists trust atoms"}
{'setup': "Why don't scientists trust atoms?", 'punchline': ''}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}
```

## Sans Pydantic

Vous pouvez également l'utiliser sans Pydantic. Cela l'incitera à renvoyer du JSON, mais ne fournira pas d'informations spécifiques sur le schéma à utiliser.

```python
joke_query = "Tell me a joke."

parser = JsonOutputParser()

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
{'joke': "Why don't scientists trust atoms? Because they make up everything!"}
```

Trouvez la documentation de l'API pour [JsonOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.json.JsonOutputParser.html#langchain_core.output_parsers.json.JsonOutputParser).
