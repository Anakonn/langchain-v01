---
translated: true
---

# iMessage

यह नोटबुक iMessage चैट लोडर का उपयोग करने का तरीका दिखाता है। यह वर्ग iMessage वार्तालापों को LangChain चैट संदेशों में परिवर्तित करने में मदद करता है।

MacOS पर, iMessage वार्तालापों को `~/Library/Messages/chat.db` (कम से कम macOS Ventura 13.4 के लिए) पर एक sqlite डेटाबेस में संग्रहीत करता है।
`IMessageChatLoader` इस डेटाबेस फ़ाइल से लोड करता है।

1. `IMessageChatLoader` को `chat.db` डेटाबेस फ़ाइल पथ के साथ बनाएं जिसे आप प्रक्रिया करना चाहते हैं।
2. `loader.load()` (या `loader.lazy_load()`) कॉल करें ताकि परिवर्तन किया जा सके। वैकल्पिक रूप से `merge_chat_runs` का उपयोग करें ताकि एक ही भेजने वाले से क्रमिक संदेशों को संयुक्त किया जा सके, और/या `map_ai_messages` का उपयोग करें ताकि निर्दिष्ट भेजने वाले से संदेशों को "AIMessage" वर्ग में परिवर्तित किया जा सके।

## 1. चैट DB तक पहुंच

संभावना है कि आपका टर्मिनल `~/Library/Messages` तक पहुंच से वंचित है। इस वर्ग का उपयोग करने के लिए, आप डेटाबेस को एक सुलभ निर्देशिका (उदा., दस्तावेज़) में कॉपी कर सकते हैं और वहां से लोड कर सकते हैं। वैकल्पिक रूप से (और अनुशंसित नहीं), आप सिस्टम सेटिंग्स > सुरक्षा और गोपनीयता > पूर्ण डिस्क एक्सेस में अपने टर्मिनल इमुलेटर के लिए पूर्ण डिस्क एक्सेस प्रदान कर सकते हैं।

हमने एक उदाहरण डेटाबेस बनाया है जिसका उपयोग आप [इस लिंक ड्राइव फ़ाइल](https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing) पर कर सकते हैं।

```python
# This uses some example data
import requests


def download_drive_file(url: str, output_path: str = "chat.db") -> None:
    file_id = url.split("/")[-2]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = requests.get(download_url)
    if response.status_code != 200:
        print("Failed to download the file.")
        return

    with open(output_path, "wb") as file:
        file.write(response.content)
        print(f"File {output_path} downloaded.")


url = (
    "https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing"
)

# Download file to chat.db
download_drive_file(url)
```

```output
File chat.db downloaded.
```

## 2. चैट लोडर बनाएं

लोडर को ज़िप निर्देशिका का फ़ाइल पथ प्रदान करें। आप वैकल्पिक रूप से एक AI संदेश को मैप करने वाले उपयोगकर्ता आईडी को भी निर्दिष्ट कर सकते हैं और संदेश रन को मर्ज करने के लिए कॉन्फ़िगर कर सकते हैं।

```python
from langchain_community.chat_loaders.imessage import IMessageChatLoader
```

```python
loader = IMessageChatLoader(
    path="./chat.db",
)
```

## 3. संदेश लोड करें

`load()` (या `lazy_load`) विधियां "ChatSessions" की एक सूची लौटाती हैं जो वर्तमान में लोड की गई प्रत्येक वार्तालाप के संदेशों की एक सूची केवल सामग्री करती हैं। सभी संदेश "HumanMessage" वस्तुओं में मैप किए जाते हैं।

आप वैकल्पिक रूप से संदेश "रन" (एक ही भेजने वाले से लगातार संदेश) को मर्ज करने और "AI" को प्रतिनिधित्व करने वाले भेजने वाले का चयन करने का विकल्प चुन सकते हैं। अंतिम रूप से प्रशिक्षित LLM इन AI संदेशों को जनरेट करना सीखेगा।

```python
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# Merge consecutive messages from the same sender into a single message
merged_messages = merge_chat_runs(raw_messages)
# Convert messages from "Tortoise" to AI messages. Do you have a guess who these conversations are between?
chat_sessions: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Tortoise")
)
```

```python
# Now all of the Tortoise's messages will take the AI message class
# which maps to the 'assistant' role in OpenAI's training format
chat_sessions[0]["messages"][:3]
```

```output
[AIMessage(content="Slow and steady, that's my motto.", additional_kwargs={'message_time': 1693182723, 'sender': 'Tortoise'}, example=False),
 HumanMessage(content='Speed is key!', additional_kwargs={'message_time': 1693182753, 'sender': 'Hare'}, example=False),
 AIMessage(content='A balanced approach is more reliable.', additional_kwargs={'message_time': 1693182783, 'sender': 'Tortoise'}, example=False)]
```

## 3. फ़ाइन-ट्यूनिंग के लिए तैयार करें

अब समय है कि हम अपने चैट संदेशों को OpenAI डिक्शनरी में परिवर्तित करें। हम `convert_messages_for_finetuning` उपयोगिता का उपयोग कर सकते हैं।

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning
```

```python
training_data = convert_messages_for_finetuning(chat_sessions)
print(f"Prepared {len(training_data)} dialogues for training")
```

```output
Prepared 10 dialogues for training
```

## 4. मॉडल को फ़ाइन-ट्यून करें

मॉडल को फ़ाइन-ट्यून करने का समय आ गया है। सुनिश्चित करें कि आपके पास `openai` स्थापित है और आपने अपना `OPENAI_API_KEY` उचित रूप से सेट किया है।

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import json
import time
from io import BytesIO

import openai

# We will write the jsonl file in memory
my_file = BytesIO()
for m in training_data:
    my_file.write((json.dumps({"messages": m}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

# OpenAI audits each training file for compliance reasons.
# This make take a few minutes
status = openai.files.retrieve(training_file.id).status
start_time = time.time()
while status != "processed":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.files.retrieve(training_file.id).status
print(f"File {training_file.id} ready after {time.time() - start_time:.2f} seconds.")
```

```output
File file-zHIgf4r8LltZG3RFpkGd4Sjf ready after 10.19 seconds.
```

फ़ाइल तैयार होने के साथ, प्रशिक्षण कार्य शुरू करने का समय आ गया है।

```python
job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)
```

अपने मॉडल को तैयार होते हुए देखते हुए एक कप चाय पीएं। यह कुछ समय ले सकता है!

```python
status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    job = openai.fine_tuning.jobs.retrieve(job.id)
    status = job.status
```

```output
Status=[running]... 524.95s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::7sKoRdlz
```

## 5. LangChain में उपयोग करें

आप प्राप्त मॉडल आईडी को सीधे `ChatOpenAI` मॉडल वर्ग में उपयोग कर सकते हैं।

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=job.fine_tuned_model,
    temperature=1,
)
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are speaking to hare."),
        ("human", "{input}"),
    ]
)

chain = prompt | model | StrOutputParser()
```

```python
for tok in chain.stream({"input": "What's the golden thread?"}):
    print(tok, end="", flush=True)
```

```output
A symbol of interconnectedness.
```
