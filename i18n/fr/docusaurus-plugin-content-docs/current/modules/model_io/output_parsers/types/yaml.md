---
translated: true
---

# Analyseur YAML

Cet analyseur de sortie permet aux utilisateurs de spécifier un schéma arbitraire et d'interroger les LLM pour obtenir des sorties conformes à ce schéma, en utilisant YAML pour formatter leur réponse.

Gardez à l'esprit que les modèles de langage de grande taille sont des abstractions perméables ! Vous devrez utiliser un LLM avec une capacité suffisante pour générer du YAML bien formé. Dans la famille OpenAI, DaVinci peut le faire de manière fiable, mais les capacités de Curie diminuent déjà de manière dramatique.

Vous pouvez éventuellement utiliser Pydantic pour déclarer votre modèle de données.

```python
from typing import List

from langchain.output_parsers import YamlOutputParser
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
parser = YamlOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')
```

Trouvez la documentation de l'API pour [YamlOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.yaml.YamlOutputParser.html#langchain.output_parsers.yaml.YamlOutputParser).
