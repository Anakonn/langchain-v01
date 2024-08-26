---
translated: true
---

यह नोटबुक फेसबुक मैसेंजर से डेटा लोड करने और उसे फाइन-ट्यून करने के लिए उपयोग किया जा सकता है। कुल मिलाकर, यह निम्नलिखित चरणों को दर्शाता है:

1. अपने मैसेंजर डेटा को डिस्क पर डाउनलोड करें।
2. `ChatLoader` बनाएं और `loader.load()` (या `loader.lazy_load()`) कॉल करें ताकि रूपांतरण किया जा सके।
3. वैकल्पिक रूप से, `merge_chat_runs` का उपयोग करें ताकि एक ही भेजने वाले से संदेशों को क्रमिक रूप से जोड़ा जा सके, और/या `map_ai_messages` का उपयोग करें ताकि निर्दिष्ट भेजने वाले के संदेशों को "AIMessage" वर्ग में परिवर्तित किया जा सके। एक बार ऐसा करने के बाद, `convert_messages_for_finetuning` कॉल करें ताकि आपका डेटा फाइन-ट्यूनिंग के लिए तैयार हो जाए।

इसके बाद, आप अपने मॉडल को फाइन-ट्यून कर सकते हैं। ऐसा करने के लिए, आपको निम्नलिखित चरणों को पूरा करना होगा:

4. अपने संदेशों को OpenAI पर अपलोड करें और एक फाइन-ट्यूनिंग जॉब चलाएं।
6. अपने LangChain ऐप में प्राप्त मॉडल का उपयोग करें!

चलो शुरू करते हैं।

## 1. डेटा डाउनलोड करें

अपने स्वयं के मैसेंजर डेटा को डाउनलोड करने के लिए, [यहां](https://www.zapptales.com/en/download-facebook-messenger-chat-history-how-to/) दिए गए निर्देशों का पालन करें। महत्वपूर्ण - सुनिश्चित करें कि आप उन्हें JSON प्रारूप में (HTML नहीं) डाउनलोड करते हैं।

हम [इस Google ड्राइव लिंक](https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing) पर एक उदाहरण डंप होस्ट कर रहे हैं जिसका इस वॉकथ्रू में उपयोग किया जाएगा।

```python
# This uses some example data
import zipfile

import requests


def download_and_unzip(url: str, output_path: str = "file.zip") -> None:
    file_id = url.split("/")[-2]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = requests.get(download_url)
    if response.status_code != 200:
        print("Failed to download the file.")
        return

    with open(output_path, "wb") as file:
        file.write(response.content)
        print(f"File {output_path} downloaded.")

    with zipfile.ZipFile(output_path, "r") as zip_ref:
        zip_ref.extractall()
        print(f"File {output_path} has been unzipped.")


# URL of the file to download
url = (
    "https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing"
)

# Download and unzip
download_and_unzip(url)
```

```output
File file.zip downloaded.
File file.zip has been unzipped.
```

## 2. Chat Loader बनाएं

हमारे पास 2 अलग-अलग `FacebookMessengerChatLoader` वर्ग हैं, एक पूरे चैट डायरेक्टरी के लिए और एक व्यक्तिगत फ़ाइलों को लोड करने के लिए। हम

```python
directory_path = "./hogwarts"
```

```python
from langchain_community.chat_loaders.facebook_messenger import (
    FolderFacebookMessengerChatLoader,
    SingleFileFacebookMessengerChatLoader,
)
```

```python
loader = SingleFileFacebookMessengerChatLoader(
    path="./hogwarts/inbox/HermioneGranger/messages_Hermione_Granger.json",
)
```

```python
chat_session = loader.load()[0]
chat_session["messages"][:3]
```

```output
[HumanMessage(content="Hi Hermione! How's your summer going so far?", additional_kwargs={'sender': 'Harry Potter'}),
 HumanMessage(content="Harry! Lovely to hear from you. My summer is going well, though I do miss everyone. I'm spending most of my time going through my books and researching fascinating new topics. How about you?", additional_kwargs={'sender': 'Hermione Granger'}),
 HumanMessage(content="I miss you all too. The Dursleys are being their usual unpleasant selves but I'm getting by. At least I can practice some spells in my room without them knowing. Let me know if you find anything good in your researching!", additional_kwargs={'sender': 'Harry Potter'})]
```

```python
loader = FolderFacebookMessengerChatLoader(
    path="./hogwarts",
)
```

```python
chat_sessions = loader.load()
len(chat_sessions)
```

```output
9
```

## 3. फाइन-ट्यूनिंग के लिए तैयार करें

`load()` कॉल करने से हमें वह सभी चैट संदेश मिलते हैं जिन्हें हम मानव संदेशों के रूप में निकाल सकते हैं। चैटबॉट के साथ वार्तालाप करते समय, वार्तालाप आमतौर पर वास्तविक वार्तालाप की तुलना में एक अधिक सख्त वैकल्पिक संवाद पैटर्न का पालन करते हैं।

आप संदेश "रन" (एक ही भेजने वाले से लगातार संदेश) को मर्ज करने और "AI" को प्रतिनिधित्व करने वाले भेजने वाले का चयन करने का विकल्प चुन सकते हैं। फाइन-ट्यून किया गया LLM इन AI संदेशों को जनरेट करना सीखेगा।

```python
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
```

```python
merged_sessions = merge_chat_runs(chat_sessions)
alternating_sessions = list(map_ai_messages(merged_sessions, "Harry Potter"))
```

```python
# Now all of Harry Potter's messages will take the AI message class
# which maps to the 'assistant' role in OpenAI's training format
alternating_sessions[0]["messages"][:3]
```

```output
[AIMessage(content="Professor Snape, I was hoping I could speak with you for a moment about something that's been concerning me lately.", additional_kwargs={'sender': 'Harry Potter'}),
 HumanMessage(content="What is it, Potter? I'm quite busy at the moment.", additional_kwargs={'sender': 'Severus Snape'}),
 AIMessage(content="I apologize for the interruption, sir. I'll be brief. I've noticed some strange activity around the school grounds at night. I saw a cloaked figure lurking near the Forbidden Forest last night. I'm worried someone may be plotting something sinister.", additional_kwargs={'sender': 'Harry Potter'})]
```

#### अब हम OpenAI प्रारूप डिक्शनरी में परिवर्तित कर सकते हैं

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning
```

```python
training_data = convert_messages_for_finetuning(alternating_sessions)
print(f"Prepared {len(training_data)} dialogues for training")
```

```output
Prepared 9 dialogues for training
```

```python
training_data[0][:3]
```

```output
[{'role': 'assistant',
  'content': "Professor Snape, I was hoping I could speak with you for a moment about something that's been concerning me lately."},
 {'role': 'user',
  'content': "What is it, Potter? I'm quite busy at the moment."},
 {'role': 'assistant',
  'content': "I apologize for the interruption, sir. I'll be brief. I've noticed some strange activity around the school grounds at night. I saw a cloaked figure lurking near the Forbidden Forest last night. I'm worried someone may be plotting something sinister."}]
```

OpenAI वर्तमान में किसी भी फाइन-ट्यूनिंग जॉब के लिए कम से कम 10 प्रशिक्षण उदाहरण आवश्यक करता है, हालांकि वे अधिकांश कार्यों के लिए 50-100 के बीच की सिफारिश करते हैं। चूंकि हमारे पास केवल 9 चैट सत्र हैं, हम उन्हें विभाजित कर सकते हैं (वैकल्पिक रूप से कुछ ओवरलैप के साथ) ताकि प्रत्येक प्रशिक्षण उदाहरण एक पूरी वार्तालाप का एक हिस्सा हो।

फेसबुक चैट सत्र (प्रत्येक व्यक्ति के लिए 1) अक्सर कई दिनों और वार्तालापों में फैले होते हैं,
इसलिए दीर्घकालिक निर्भरताओं को मॉडल करना उतना महत्वपूर्ण भी नहीं हो सकता है।

```python
# Our chat is alternating, we will make each datapoint a group of 8 messages,
# with 2 messages overlapping
chunk_size = 8
overlap = 2

training_examples = [
    conversation_messages[i : i + chunk_size]
    for conversation_messages in training_data
    for i in range(0, len(conversation_messages) - chunk_size + 1, chunk_size - overlap)
]

len(training_examples)
```

```output
100
```

## 4. मॉडल को फाइन-ट्यून करें

अब मॉडल को फाइन-ट्यून करने का समय है। सुनिश्चित करें कि आपके पास `openai` स्थापित है
और आपने अपना `OPENAI_API_KEY` सही ढंग से सेट किया है

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
for m in training_examples:
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
File file-ULumAXLEFw3vB6bb9uy6DNVC ready after 0.00 seconds.
```

फ़ाइल तैयार होने के बाद, अब प्रशिक्षण जॉब शुरू करने का समय है।

```python
job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)
```

एक कप चाय पीते हुए अपने मॉडल की तैयारी का इंतजार करें। यह कुछ समय ले सकता है!

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
Status=[running]... 874.29s. 56.93s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::8QnAzWMr
```

## 5. LangChain में उपयोग करें

आप प्राप्त मॉडल ID को सीधे `ChatOpenAI` मॉडल क्लास में उपयोग कर सकते हैं।

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
        ("human", "{input}"),
    ]
)

chain = prompt | model | StrOutputParser()
```

```python
for tok in chain.stream({"input": "What classes are you taking?"}):
    print(tok, end="", flush=True)
```

```output
I'm taking Charms, Defense Against the Dark Arts, Herbology, Potions, Transfiguration, and Ancient Runes. How about you?
```
