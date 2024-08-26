---
translated: true
---

# Memoria personalizada

Aunque hay algunos tipos de memoria predefinidos en LangChain, es muy posible que desee agregar su propio tipo de memoria que sea óptimo para su aplicación. Este cuaderno cubre cómo hacer eso.

Para este cuaderno, agregaremos un tipo de memoria personalizado a `ConversationChain`. Para agregar una clase de memoria personalizada, debemos importar la clase de memoria base y subclasificarla.

```python
from typing import Any, Dict, List

from langchain.chains import ConversationChain
from langchain.schema import BaseMemory
from langchain_openai import OpenAI
from pydantic import BaseModel
```

En este ejemplo, escribiremos una clase de memoria personalizada que usa spaCy para extraer entidades y guardar información sobre ellas en una tabla hash simple. Luego, durante la conversación, miraremos el texto de entrada, extraeremos cualquier entidad y colocaremos cualquier información sobre ellas en el contexto.

* Tenga en cuenta que esta implementación es bastante simple y frágil y probablemente no sea útil en un entorno de producción. Su propósito es mostrar que puede agregar implementaciones de memoria personalizadas.

Para esto, necesitaremos spaCy.

```python
%pip install --upgrade --quiet  spacy
# !python -m spacy download en_core_web_lg
```

```python
import spacy

nlp = spacy.load("en_core_web_lg")
```

```python
class SpacyEntityMemory(BaseMemory, BaseModel):
    """Memory class for storing information about entities."""

    # Define dictionary to store information about entities.
    entities: dict = {}
    # Define key to pass information about entities into prompt.
    memory_key: str = "entities"

    def clear(self):
        self.entities = {}

    @property
    def memory_variables(self) -> List[str]:
        """Define the variables we are providing to the prompt."""
        return [self.memory_key]

    def load_memory_variables(self, inputs: Dict[str, Any]) -> Dict[str, str]:
        """Load the memory variables, in this case the entity key."""
        # Get the input text and run through spaCy
        doc = nlp(inputs[list(inputs.keys())[0]])
        # Extract known information about entities, if they exist.
        entities = [
            self.entities[str(ent)] for ent in doc.ents if str(ent) in self.entities
        ]
        # Return combined information about entities to put into context.
        return {self.memory_key: "\n".join(entities)}

    def save_context(self, inputs: Dict[str, Any], outputs: Dict[str, str]) -> None:
        """Save context from this conversation to buffer."""
        # Get the input text and run through spaCy
        text = inputs[list(inputs.keys())[0]]
        doc = nlp(text)
        # For each entity that was mentioned, save this information to the dictionary.
        for ent in doc.ents:
            ent_str = str(ent)
            if ent_str in self.entities:
                self.entities[ent_str] += f"\n{text}"
            else:
                self.entities[ent_str] = text
```

Ahora definimos un mensaje que tome información sobre entidades, así como la entrada del usuario.

```python
from langchain_core.prompts.prompt import PromptTemplate

template = """The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know. You are provided with information about entities the Human mentions, if relevant.

Relevant entity information:
{entities}

Conversation:
Human: {input}
AI:"""
prompt = PromptTemplate(input_variables=["entities", "input"], template=template)
```

¡Y ahora lo juntamos todo!

```python
llm = OpenAI(temperature=0)
conversation = ConversationChain(
    llm=llm, prompt=prompt, verbose=True, memory=SpacyEntityMemory()
)
```

En el primer ejemplo, sin conocimiento previo sobre Harrison, la sección "Información relevante de la entidad" está vacía.

```python
conversation.predict(input="Harrison likes machine learning")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know. You are provided with information about entities the Human mentions, if relevant.

Relevant entity information:


Conversation:
Human: Harrison likes machine learning
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
" That's great to hear! Machine learning is a fascinating field of study. It involves using algorithms to analyze data and make predictions. Have you ever studied machine learning, Harrison?"
```

Ahora, en el segundo ejemplo, podemos ver que extrae información sobre Harrison.

```python
conversation.predict(
    input="What do you think Harrison's favorite subject in college was?"
)
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know. You are provided with information about entities the Human mentions, if relevant.

Relevant entity information:
Harrison likes machine learning

Conversation:
Human: What do you think Harrison's favorite subject in college was?
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
' From what I know about Harrison, I believe his favorite subject in college was machine learning. He has expressed a strong interest in the subject and has mentioned it often.'
```

Una vez más, tenga en cuenta que esta implementación es bastante simple y frágil y probablemente no sea útil en un entorno de producción. Su propósito es mostrar que puede agregar implementaciones de memoria personalizadas.
