---
translated: true
---

# कस्टम मेमोरी

हालांकि LangChain में मेमोरी के कुछ पूर्व-परिभाषित प्रकार हैं, यह बहुत संभव है कि आप अपने अनुप्रयोग के लिए अनुकूल एक अपना मेमोरी प्रकार जोड़ना चाहेंगे। यह नोटबुक बताता है कि आप ऐसा कैसे कर सकते हैं।

इस नोटबुक के लिए, हम `ConversationChain` में एक कस्टम मेमोरी प्रकार जोड़ेंगे। एक कस्टम मेमोरी क्लास जोड़ने के लिए, हमें आधारभूत मेमोरी क्लास आयात करना और उसका उपवर्ग बनाना होगा।

```python
from typing import Any, Dict, List

from langchain.chains import ConversationChain
from langchain.schema import BaseMemory
from langchain_openai import OpenAI
from pydantic import BaseModel
```

इस उदाहरण में, हम एक कस्टम मेमोरी क्लास लिखेंगे जो spaCy का उपयोग करके एंटिटीज़ को निकालती है और उनके बारे में जानकारी को एक सरल हैश टेबल में सहेजती है। फिर, वार्तालाप के दौरान, हम इनपुट पाठ्य पर नज़र डालेंगे, किसी भी एंटिटी को निकालेंगे, और उनके बारे में कोई भी जानकारी संदर्भ में डालेंगे।

* कृपया ध्यान दें कि यह कार्यान्वयन काफी सरल और नाजुक है और शायद उत्पादन सेटिंग में उपयोगी नहीं होगा। इसका उद्देश्य यह दर्शाना है कि आप कस्टम मेमोरी कार्यान्वयन जोड़ सकते हैं।

इसके लिए, हमें spaCy की आवश्यकता होगी।

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

अब हम एंटिटी के बारे में जानकारी के साथ-साथ उपयोगकर्ता इनपुट को लेने वाले प्रॉम्प्ट को परिभाषित करते हैं।

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

और अब हम इसे एक साथ रखते हैं!

```python
llm = OpenAI(temperature=0)
conversation = ConversationChain(
    llm=llm, prompt=prompt, verbose=True, memory=SpacyEntityMemory()
)
```

पहले उदाहरण में, Harrison के बारे में कोई पूर्व ज्ञान नहीं होने पर, "प्रासंगिक एंटिटी जानकारी" खंड खाली है।

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

अब दूसरे उदाहरण में, हम देख सकते हैं कि यह Harrison के बारे में जानकारी को लेता है।

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

फिर से, कृपया ध्यान दें कि यह कार्यान्वयन काफी सरल और नाजुक है और शायद उत्पादन सेटिंग में उपयोगी नहीं होगा। इसका उद्देश्य यह दर्शाना है कि आप कस्टम मेमोरी कार्यान्वयन जोड़ सकते हैं।
