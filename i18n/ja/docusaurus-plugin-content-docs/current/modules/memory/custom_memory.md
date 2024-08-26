---
translated: true
---

# カスタムメモリ

LangChainには事前定義された数種類のメモリタイプがありますが、アプリケーションに最適なカスタムメモリタイプを追加したい可能性が高いです。このノートブックでは、それを行う方法を説明します。

このノートブックでは、`ConversationChain`にカスタムメモリタイプを追加します。カスタムメモリクラスを追加するには、ベースメモリクラスをインポートし、それを継承する必要があります。

```python
from typing import Any, Dict, List

from langchain.chains import ConversationChain
from langchain.schema import BaseMemory
from langchain_openai import OpenAI
from pydantic import BaseModel
```

この例では、spaCyを使ってエンティティを抽出し、それらについての情報をシンプルなハッシュテーブルに保存するカスタムメモリクラスを作成します。会話中は、入力テキストを見て、エンティティを抽出し、それらに関する情報をコンテキストに入れます。

* この実装はかなりシンプルで脆弱で、本番環境では使えないと思います。カスタムメモリ実装を追加する方法を示すことが目的です。

このためには、spaCyが必要です。

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

エンティティに関する情報とユーザー入力を受け取るプロンプトを定義します。

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

そして、それらを組み合わせます!

```python
llm = OpenAI(temperature=0)
conversation = ConversationChain(
    llm=llm, prompt=prompt, verbose=True, memory=SpacyEntityMemory()
)
```

最初の例では、Harrisonについての事前知識がないため、「関連するエンティティ情報」セクションが空です。

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

2番目の例では、Harrisonに関する情報が取り込まれているのがわかります。

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

繰り返しますが、この実装はかなりシンプルで脆弱で、本番環境では使えないと思います。カスタムメモリ実装を追加する方法を示すことが目的です。
