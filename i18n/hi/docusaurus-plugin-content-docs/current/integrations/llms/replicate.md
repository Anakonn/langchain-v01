---
translated: true
---

# प्रतिलिपि

>[प्रतिलिपि](https://replicate.com/blog/machine-learning-needs-better-tools) क्लाउड में मशीन लर्निंग मॉडल चलाता है। हमारे पास खुले स्रोत के मॉडलों का एक पुस्तकालय है जिन्हें आप कुछ पंक्तियों में चला सकते हैं। यदि आप अपने स्वयं के मशीन लर्निंग मॉडल बना रहे हैं, तो प्रतिलिपि उन्हें पैमाने पर तैनात करना आसान बनाता है।

यह उदाहरण `LangChain` का उपयोग करके `प्रतिलिपि` [मॉडल](https://replicate.com/explore) के साथ बातचीत करने के बारे में बताता है।

## सेटअप

```python
# magics to auto-reload external modules in case you are making changes to langchain while working on this notebook
%load_ext autoreload
%autoreload 2
```

इस नोटबुक को चलाने के लिए, आपको एक [प्रतिलिपि](https://replicate.com) खाता बनाना और [प्रतिलिपि पायथन क्लाइंट](https://github.com/replicate/replicate-python) स्थापित करना होगा।

```python
!poetry run pip install replicate
```

```output
Collecting replicate
  Using cached replicate-0.25.1-py3-none-any.whl.metadata (24 kB)
Requirement already satisfied: httpx<1,>=0.21.0 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from replicate) (0.24.1)
Requirement already satisfied: packaging in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from replicate) (23.2)
Requirement already satisfied: pydantic>1.10.7 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from replicate) (1.10.14)
Requirement already satisfied: typing-extensions>=4.5.0 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from replicate) (4.10.0)
Requirement already satisfied: certifi in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpx<1,>=0.21.0->replicate) (2024.2.2)
Requirement already satisfied: httpcore<0.18.0,>=0.15.0 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpx<1,>=0.21.0->replicate) (0.17.3)
Requirement already satisfied: idna in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpx<1,>=0.21.0->replicate) (3.6)
Requirement already satisfied: sniffio in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpx<1,>=0.21.0->replicate) (1.3.1)
Requirement already satisfied: h11<0.15,>=0.13 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<1,>=0.21.0->replicate) (0.14.0)
Requirement already satisfied: anyio<5.0,>=3.0 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<1,>=0.21.0->replicate) (3.7.1)
Requirement already satisfied: exceptiongroup in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from anyio<5.0,>=3.0->httpcore<0.18.0,>=0.15.0->httpx<1,>=0.21.0->replicate) (1.2.0)
Using cached replicate-0.25.1-py3-none-any.whl (39 kB)
Installing collected packages: replicate
Successfully installed replicate-0.25.1
```

```python
# get a token: https://replicate.com/account

from getpass import getpass

REPLICATE_API_TOKEN = getpass()
```

```python
import os

os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import Replicate
from langchain_core.prompts import PromptTemplate
```

## मॉडल को कॉल करना

[प्रतिलिपि एक्सप्लोर पृष्ठ](https://replicate.com/explore) पर एक मॉडल ढूंढें, और फिर इस प्रारूप में मॉडल का नाम और संस्करण चिपकाएं: model_name/version।

उदाहरण के लिए, यह [`मेटा लामा 3`](https://replicate.com/meta/meta-llama-3-8b-instruct) है।

```python
llm = Replicate(
    model="meta/meta-llama-3-8b-instruct",
    model_kwargs={"temperature": 0.75, "max_length": 500, "top_p": 1},
)
prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""
llm(prompt)
```

```output
"Let's break this down step by step:\n\n1. A dog is a living being, specifically a mammal.\n2. Dogs do not possess the cognitive abilities or physical characteristics necessary to operate a vehicle, such as a car.\n3. Operating a car requires complex mental and physical abilities, including:\n\t* Understanding of traffic laws and rules\n\t* Ability to read and comprehend road signs\n\t* Ability to make decisions quickly and accurately\n\t* Ability to physically manipulate the vehicle's controls (e.g., steering wheel, pedals)\n4. Dogs do not possess any of these abilities. They are unable to read or comprehend written language, let alone complex traffic laws.\n5. Dogs also lack the physical dexterity and coordination to operate a vehicle's controls. Their paws and claws are not adapted for grasping or manipulating small, precise objects like a steering wheel or pedals.\n6. Therefore, it is not possible for a dog to drive a car.\n\nAnswer: No."
```

एक और उदाहरण के लिए, इस [डॉली मॉडल](https://replicate.com/replicate/dolly-v2-12b) के लिए, एपीआई टैब पर क्लिक करें। मॉडल नाम/संस्करण यह होगा: `replicate/dolly-v2-12b:ef0e1aefc61f8e096ebe4db6b2bacc297daf2ef6899f0f7e001ec445893500e5`

केवल `model` पैरामीटर आवश्यक है, लेकिन हम मॉडल को प्रारंभ करते समय अन्य मॉडल पैरामीटर जोड़ सकते हैं।

उदाहरण के लिए, यदि हम स्थिर प्रसार चला रहे थे और छवि आयाम बदलना चाहते थे:

```output
Replicate(model="stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf", input={'image_dimensions': '512x512'})
```

*ध्यान दें कि केवल मॉडल का पहला आउटपुट लौटाया जाएगा।*

```python
llm = Replicate(
    model="replicate/dolly-v2-12b:ef0e1aefc61f8e096ebe4db6b2bacc297daf2ef6899f0f7e001ec445893500e5"
)
```

```python
prompt = """
Answer the following yes/no question by reasoning step by step.
Can a dog drive a car?
"""
llm(prompt)
```

```output
'No, dogs lack some of the brain functions required to operate a motor vehicle. They cannot focus and react in time to accelerate or brake correctly. Additionally, they do not have enough muscle control to properly operate a steering wheel.\n\n'
```

हम इस वाक्यविन्यास का उपयोग करके किसी भी प्रतिलिपि मॉडल को कॉल कर सकते हैं। उदाहरण के लिए, हम स्थिर प्रसार को कॉल कर सकते हैं।

```python
text2image = Replicate(
    model="stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    model_kwargs={"image_dimensions": "512x512"},
)
```

```python
image_output = text2image("A cat riding a motorcycle by Picasso")
image_output
```

```output
'https://pbxt.replicate.delivery/bqQq4KtzwrrYL9Bub9e7NvMTDeEMm5E9VZueTXkLE7kWumIjA/out-0.png'
```

मॉडल एक यूआरएल उत्पन्न करता है। चलो इसे रेंडर करते हैं।

```python
!poetry run pip install Pillow
```

```output
Requirement already satisfied: Pillow in /Users/bagatur/langchain/.venv/lib/python3.9/site-packages (9.5.0)

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2[0m[39;49m -> [0m[32;49m23.2.1[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from io import BytesIO

import requests
from PIL import Image

response = requests.get(image_output)
img = Image.open(BytesIO(response.content))

img
```

## स्ट्रीमिंग प्रतिक्रिया

आप वैकल्पिक रूप से प्रतिक्रिया को स्ट्रीम कर सकते हैं क्योंकि यह उपयोगकर्ताओं को समय-लेने वाली पीढ़ियों के लिए इंटरैक्टिविटी दिखाने में मदद करता है। [स्ट्रीमिंग](/docs/modules/model_io/llms/streaming_llm) पर विस्तृत दस्तावेज़ देखें।

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm = Replicate(
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
    model="a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
    model_kwargs={"temperature": 0.75, "max_length": 500, "top_p": 1},
)
prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""
_ = llm.invoke(prompt)
```

```output
1. Dogs do not have the physical ability to operate a vehicle.
```

# रोक अनुक्रम

आप रोक अनुक्रम भी निर्दिष्ट कर सकते हैं। यदि आपके पास पीढ़ी के लिए एक निश्चित रोक अनुक्रम है जिसे आप वैसे ही पार्स करने वाले हैं, तो यह बेहतर है (सस्ता और तेज!) कि आप केवल तब तक पीढ़ी को रद्द कर दें जब तक कि एक या अधिक रोक अनुक्रम प्राप्त न हो जाएं, बजाय इसके कि आप मॉडल को `max_length` तक छोड़ दें। रोक अनुक्रम स्ट्रीमिंग मोड में हों या नहीं, और प्रतिलिपि केवल रोक अनुक्रम तक पीढ़ी के लिए ही शुल्क लेता है।

```python
import time

llm = Replicate(
    model="a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
    model_kwargs={"temperature": 0.01, "max_length": 500, "top_p": 1},
)

prompt = """
User: What is the best way to learn python?
Assistant:
"""
start_time = time.perf_counter()
raw_output = llm.invoke(prompt)  # raw output, no stop
end_time = time.perf_counter()
print(f"Raw output:\n {raw_output}")
print(f"Raw output runtime: {end_time - start_time} seconds")

start_time = time.perf_counter()
stopped_output = llm.invoke(prompt, stop=["\n\n"])  # stop on double newlines
end_time = time.perf_counter()
print(f"Stopped output:\n {stopped_output}")
print(f"Stopped output runtime: {end_time - start_time} seconds")
```

```output
Raw output:
 There are several ways to learn Python, and the best method for you will depend on your learning style and goals. Here are a few suggestions:

1. Online tutorials and courses: Websites such as Codecademy, Coursera, and edX offer interactive coding lessons and courses that can help you get started with Python. These courses are often designed for beginners and cover the basics of Python programming.
2. Books: There are many books available that can teach you Python, ranging from introductory texts to more advanced manuals. Some popular options include "Python Crash Course" by Eric Matthes, "Automate the Boring Stuff with Python" by Al Sweigart, and "Python for Data Analysis" by Wes McKinney.
3. Videos: YouTube and other video platforms have a wealth of tutorials and lectures on Python programming. Many of these videos are created by experienced programmers and can provide detailed explanations and examples of Python concepts.
4. Practice: One of the best ways to learn Python is to practice writing code. Start with simple programs and gradually work your way up to more complex projects. As you gain experience, you'll become more comfortable with the language and develop a better understanding of its capabilities.
5. Join a community: There are many online communities and forums dedicated to Python programming, such as Reddit's r/learnpython community. These communities can provide support, resources, and feedback as you learn.
6. Take online courses: Many universities and organizations offer online courses on Python programming. These courses can provide a structured learning experience and often include exercises and assignments to help you practice your skills.
7. Use a Python IDE: An Integrated Development Environment (IDE) is a software application that provides an interface for writing, debugging, and testing code. Popular Python IDEs include PyCharm, Visual Studio Code, and Spyder. These tools can help you write more efficient code and provide features such as code completion, debugging, and project management.


Which of the above options do you think is the best way to learn Python?
Raw output runtime: 25.27470933299992 seconds
Stopped output:
 There are several ways to learn Python, and the best method for you will depend on your learning style and goals. Here are some suggestions:
Stopped output runtime: 25.77039254200008 seconds
```

## श्रृंखला कॉल

लैंगचेन का पूरा मतलब है... श्रृंखला! यहां एक उदाहरण है कि कैसे करें।

```python
from langchain.chains import SimpleSequentialChain
```

पहले, आइए इस मॉडल के लिए एक एलएलएम को flan-5 के रूप में परिभाषित करें, और text2image को एक स्थिर प्रसार मॉडल के रूप में।

```python
dolly_llm = Replicate(
    model="replicate/dolly-v2-12b:ef0e1aefc61f8e096ebe4db6b2bacc297daf2ef6899f0f7e001ec445893500e5"
)
text2image = Replicate(
    model="stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf"
)
```

श्रृंखला में पहला प्रोम्प्ट

```python
prompt = PromptTemplate(
    input_variables=["product"],
    template="What is a good name for a company that makes {product}?",
)

chain = LLMChain(llm=dolly_llm, prompt=prompt)
```

कंपनी विवरण से लोगो प्राप्त करने के लिए दूसरा प्रोम्प्ट

```python
second_prompt = PromptTemplate(
    input_variables=["company_name"],
    template="Write a description of a logo for this company: {company_name}",
)
chain_two = LLMChain(llm=dolly_llm, prompt=second_prompt)
```

तीसरा प्रोम्प्ट, आइए प्रोम्प्ट 2 से मिले विवरण के आधार पर छवि बनाएं

```python
third_prompt = PromptTemplate(
    input_variables=["company_logo_description"],
    template="{company_logo_description}",
)
chain_three = LLMChain(llm=text2image, prompt=third_prompt)
```

अब चलो इसे चलाते हैं!

```python
# Run the chain specifying only the input variable for the first chain.
overall_chain = SimpleSequentialChain(
    chains=[chain, chain_two, chain_three], verbose=True
)
catchphrase = overall_chain.run("colorful socks")
print(catchphrase)
```

```output


[1m> Entering new SimpleSequentialChain chain...[0m
[36;1m[1;3mColorful socks could be named after a song by The Beatles or a color (yellow, blue, pink). A good combination of letters and digits would be 6399. Apple also owns the domain 6399.com so this could be reserved for the Company.

[0m
[33;1m[1;3mA colorful sock with the numbers 3, 9, and 99 screen printed in yellow, blue, and pink, respectively.

[0m
[38;5;200m[1;3mhttps://pbxt.replicate.delivery/P8Oy3pZ7DyaAC1nbJTxNw95D1A3gCPfi2arqlPGlfG9WYTkRA/out-0.png[0m

[1m> Finished chain.[0m
https://pbxt.replicate.delivery/P8Oy3pZ7DyaAC1nbJTxNw95D1A3gCPfi2arqlPGlfG9WYTkRA/out-0.png
```

```python
response = requests.get(
    "https://replicate.delivery/pbxt/682XgeUlFela7kmZgPOf39dDdGDDkwjsCIJ0aQ0AO5bTbbkiA/out-0.png"
)
img = Image.open(BytesIO(response.content))
img
```
