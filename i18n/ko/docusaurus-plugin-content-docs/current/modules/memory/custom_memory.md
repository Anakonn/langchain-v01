---
translated: true
---

# 사용자 정의 메모리

LangChain에는 몇 가지 미리 정의된 메모리 유형이 있지만, 애플리케이션에 최적화된 자체 메모리 유형을 추가하고 싶을 가능성이 높습니다. 이 노트북에서는 그 방법을 다룹니다.

이 노트북에서는 `ConversationChain`에 사용자 정의 메모리 유형을 추가합니다. 사용자 정의 메모리 클래스를 추가하려면 기본 메모리 클래스를 가져와서 하위 클래스화해야 합니다.

```python
from typing import Any, Dict, List

from langchain.chains import ConversationChain
from langchain.schema import BaseMemory
from langchain_openai import OpenAI
from pydantic import BaseModel
```

이 예에서는 spaCy를 사용하여 엔티티를 추출하고 간단한 해시 테이블에 해당 정보를 저장하는 사용자 정의 메모리 클래스를 작성합니다. 그런 다음 대화 중에 입력 텍스트를 살펴보고 모든 엔티티를 추출하며 컨텍스트에 해당 정보를 넣습니다.

* 이 구현은 매우 단순하고 취약하며 프로덕션 환경에서 유용하지 않을 수 있습니다. 이 목적은 사용자 정의 메모리 구현을 추가할 수 있다는 것을 보여주는 것입니다.

이를 위해 spaCy가 필요합니다.

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

이제 엔티티 정보와 사용자 입력을 받는 프롬프트를 정의합니다.

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

그리고 이제 모든 것을 종합합니다!

```python
llm = OpenAI(temperature=0)
conversation = ConversationChain(
    llm=llm, prompt=prompt, verbose=True, memory=SpacyEntityMemory()
)
```

첫 번째 예에서는 Harrison에 대한 사전 지식이 없으므로 "관련 엔티티 정보" 섹션이 비어 있습니다.

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

이제 두 번째 예에서는 Harrison에 대한 정보를 가져올 수 있습니다.

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

다시 말하지만, 이 구현은 매우 단순하고 취약하며 프로덕션 환경에서 유용하지 않을 수 있습니다. 이 목적은 사용자 정의 메모리 구현을 추가할 수 있다는 것을 보여주는 것입니다.
