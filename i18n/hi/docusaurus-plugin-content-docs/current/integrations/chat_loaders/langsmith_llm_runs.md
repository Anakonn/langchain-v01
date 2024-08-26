---
translated: true
---

# LangSmith LLM रन

यह नोटबुक दिखाता है कि LangSmith के LLM रन से डेटा को सीधे कैसे लोड किया जाए और उस डेटा पर मॉडल को कैसे फाइन-ट्यून किया जाए।
प्रक्रिया सरल है और 3 चरणों से मिलती है।

1. प्रशिक्षण के लिए LLM रन का चयन करें।
2. LangSmithRunChatLoader का उपयोग करके रन को चैट सत्रों के रूप में लोड करें।
3. अपने मॉडल को फाइन-ट्यून करें।

फिर आप अपने LangChain ऐप में फाइन-ट्यून किए गए मॉडल का उपयोग कर सकते हैं।

शुरू करने से पहले, आइए अपने पूर्वापेक्षाओं को स्थापित करें।

## पूर्वापेक्षाएं

सुनिश्चित करें कि आपने langchain >= 0.0.311 स्थापित किया है और अपने माहौल को अपने LangSmith API कुंजी के साथ कॉन्फ़िगर किया है।

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
import os
import uuid

uid = uuid.uuid4().hex[:6]
project_name = f"Run Fine-tuning Walkthrough {uid}"
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "YOUR API KEY"
os.environ["LANGCHAIN_PROJECT"] = project_name
```

## 1. रन का चयन करें

पहला कदम उन रन का चयन करना है जिन पर फाइन-ट्यून किया जाएगा। एक आम मामला यह होगा कि सकारात्मक उपयोगकर्ता प्रतिक्रिया प्राप्त करने वाले ट्रेस के भीतर LLM रन का चयन किया जाए। आप इसके उदाहरण [LangSmith Cookbook](https://github.com/langchain-ai/langsmith-cookbook/blob/main/exploratory-data-analysis/exporting-llm-runs-and-feedback/llm_run_etl.md) और [docs](https://docs.smith.langchain.com/tracing/use-cases/export-runs/local) में पा सकते हैं।

इस ट्यूटोरियल के लिए, हम आपके लिए कुछ रन उत्पन्न करेंगे। चलो एक सरल फ़ंक्शन-कॉलिंग श्रृंखला पर फाइन-ट्यून करते हैं।

```python
from enum import Enum

from langchain_core.pydantic_v1 import BaseModel, Field


class Operation(Enum):
    add = "+"
    subtract = "-"
    multiply = "*"
    divide = "/"


class Calculator(BaseModel):
    """A calculator function"""

    num1: float
    num2: float
    operation: Operation = Field(..., description="+,-,*,/")

    def calculate(self):
        if self.operation == Operation.add:
            return self.num1 + self.num2
        elif self.operation == Operation.subtract:
            return self.num1 - self.num2
        elif self.operation == Operation.multiply:
            return self.num1 * self.num2
        elif self.operation == Operation.divide:
            if self.num2 != 0:
                return self.num1 / self.num2
            else:
                return "Cannot divide by zero"
```

```python
from pprint import pprint

from langchain.utils.openai_functions import convert_pydantic_to_openai_function
from langchain_core.pydantic_v1 import BaseModel

openai_function_def = convert_pydantic_to_openai_function(Calculator)
pprint(openai_function_def)
```

```output
{'description': 'A calculator function',
 'name': 'Calculator',
 'parameters': {'description': 'A calculator function',
                'properties': {'num1': {'title': 'Num1', 'type': 'number'},
                               'num2': {'title': 'Num2', 'type': 'number'},
                               'operation': {'allOf': [{'description': 'An '
                                                                       'enumeration.',
                                                        'enum': ['+',
                                                                 '-',
                                                                 '*',
                                                                 '/'],
                                                        'title': 'Operation'}],
                                             'description': '+,-,*,/'}},
                'required': ['num1', 'num2', 'operation'],
                'title': 'Calculator',
                'type': 'object'}}
```

```python
from langchain.output_parsers.openai_functions import PydanticOutputFunctionsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an accounting assistant."),
        ("user", "{input}"),
    ]
)
chain = (
    prompt
    | ChatOpenAI().bind(functions=[openai_function_def])
    | PydanticOutputFunctionsParser(pydantic_schema=Calculator)
    | (lambda x: x.calculate())
)
```

```python
math_questions = [
    "What's 45/9?",
    "What's 81/9?",
    "What's 72/8?",
    "What's 56/7?",
    "What's 36/6?",
    "What's 64/8?",
    "What's 12*6?",
    "What's 8*8?",
    "What's 10*10?",
    "What's 11*11?",
    "What's 13*13?",
    "What's 45+30?",
    "What's 72+28?",
    "What's 56+44?",
    "What's 63+37?",
    "What's 70-35?",
    "What's 60-30?",
    "What's 50-25?",
    "What's 40-20?",
    "What's 30-15?",
]
results = chain.batch([{"input": q} for q in math_questions], return_exceptions=True)
```

#### त्रुटि नहीं करने वाले रन लोड करें

अब हम फाइन-ट्यून करने के लिए सफल रन का चयन कर सकते हैं।

```python
from langsmith.client import Client

client = Client()
```

```python
successful_traces = {
    run.trace_id
    for run in client.list_runs(
        project_name=project_name,
        execution_order=1,
        error=False,
    )
}

llm_runs = [
    run
    for run in client.list_runs(
        project_name=project_name,
        run_type="llm",
    )
    if run.trace_id in successful_traces
]
```

## 2. डेटा तैयार करें

अब हम LangSmithRunChatLoader का एक उदाहरण बना सकते हैं और lazy_load() विधि का उपयोग करके चैट सत्रों को लोड कर सकते हैं।

```python
from langchain_community.chat_loaders.langsmith import LangSmithRunChatLoader

loader = LangSmithRunChatLoader(runs=llm_runs)

chat_sessions = loader.lazy_load()
```

#### चैट सत्रों को लोड करने के साथ, उन्हें फाइन-ट्यूनिंग के लिए उपयुक्त प्रारूप में परिवर्तित करें।

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning

training_data = convert_messages_for_finetuning(chat_sessions)
```

## 3. मॉडल को फाइन-ट्यून करें

अब, OpenAI लाइब्रेरी का उपयोग करके फाइन-ट्यूनिंग प्रक्रिया शुरू करें।

```python
import json
import time
from io import BytesIO

import openai

my_file = BytesIO()
for dialog in training_data:
    my_file.write((json.dumps({"messages": dialog}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)

# Wait for the fine-tuning to complete (this may take some time)
status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.fine_tuning.jobs.retrieve(job.id).status

# Now your model is fine-tuned!
```

```output
Status=[running]... 349.84s. 17.72s
```

## 4. LangChain में उपयोग करें

फाइन-ट्यूनिंग के बाद, अपने LangChain ऐप में ChatOpenAI मॉडल क्लास के साथ प्राप्त मॉडल ID का उपयोग करें।

```python
# Get the fine-tuned model ID
job = openai.fine_tuning.jobs.retrieve(job.id)
model_id = job.fine_tuned_model

# Use the fine-tuned model in LangChain
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=model_id,
    temperature=1,
)
```

```python
(prompt | model).invoke({"input": "What's 56/7?"})
```

```output
AIMessage(content='Let me calculate that for you.')
```

अब आपने LangSmith LLM रन के डेटा का उपयोग करके एक मॉडल को सफलतापूर्वक फाइन-ट्यून किया है!
