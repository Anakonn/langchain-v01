---
translated: true
---

# Eden AI

Eden AI AI परिदृश्य को पुनर्गठित कर रहा है, सर्वश्रेष्ठ AI प्रदाताओं को एकजुट करके, उपयोगकर्ताओं को असीमित संभावनाओं को खोलने और कृत्रिम बुद्धिमत्ता के वास्तविक क्षमता का लाभ उठाने में सक्षम बना रहा है। एक सर्वव्यापी व्यापक और परेशानी मुक्त प्लेटफ़ॉर्म के साथ, यह उपयोगकर्ताओं को एक एकल API के माध्यम से AI क्षमताओं की पूरी श्रृंखला तक आसान पहुंच प्रदान करते हुए उत्पादन में AI सुविधाओं को तेजी से तैनात करने की अनुमति देता है। (वेबसाइट: https://edenai.co/)

यह उदाहरण LangChain का उपयोग करके Eden AI मॉडल्स के साथ कैसे काम करें, इसके बारे में बताता है।

-----------------------------------------------------------------------------------

Eden AI के API का उपयोग करने के लिए एक API कुंजी की आवश्यकता होती है,

जिसे आप एक खाता बनाकर https://app.edenai.run/user/register और यहां जाकर प्राप्त कर सकते हैं https://app.edenai.run/admin/account/settings

एक बार जब हमारे पास कुंजी हो जाती है, तो हम इसे निम्नलिखित कमांड चलाकर एक पर्यावरण चर के रूप में सेट करना चाहेंगे:

```bash
export EDENAI_API_KEY="..."
```

यदि आप पर्यावरण चर सेट करना नहीं चाहते हैं, तो आप कुंजी को EdenAI LLM वर्ग को प्रारंभ करते समय edenai_api_key नामक पैरामीटर के माध्यम से सीधे पास कर सकते हैं:

```python
from langchain_community.llms import EdenAI
```

```python
llm = EdenAI(edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250)
```

## मॉडल को कॉल करना

Eden AI API विभिन्न प्रदाताओं को एक साथ लाता है, जिनमें से प्रत्येक कई मॉडल प्रदान करता है।

किसी विशिष्ट मॉडल तक पहुंचने के लिए, आप सरलता से 'model' का उपयोग कर सकते हैं।

उदाहरण के लिए, आइए OpenAI द्वारा प्रदान किए गए मॉडलों, जैसे GPT3.5, का अन्वेषण करें।

### पाठ उत्पादन

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

llm = EdenAI(
    feature="text",
    provider="openai",
    model="gpt-3.5-turbo-instruct",
    temperature=0.2,
    max_tokens=250,
)

prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""

llm(prompt)
```

### छवि उत्पादन

```python
import base64
from io import BytesIO

from PIL import Image


def print_base64_image(base64_string):
    # Decode the base64 string into binary data
    decoded_data = base64.b64decode(base64_string)

    # Create an in-memory stream to read the binary data
    image_stream = BytesIO(decoded_data)

    # Open the image using PIL
    image = Image.open(image_stream)

    # Display the image
    image.show()
```

```python
text2image = EdenAI(feature="image", provider="openai", resolution="512x512")
```

```python
image_output = text2image("A cat riding a motorcycle by Picasso")
```

```python
print_base64_image(image_output)
```

### कॉलबैक के साथ पाठ उत्पादन

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import EdenAI

llm = EdenAI(
    callbacks=[StreamingStdOutCallbackHandler()],
    feature="text",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
)
prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""
print(llm.invoke(prompt))
```

## कॉल्स को चेन करना

```python
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
```

```python
llm = EdenAI(feature="text", provider="openai", temperature=0.2, max_tokens=250)
text2image = EdenAI(feature="image", provider="openai", resolution="512x512")
```

```python
prompt = PromptTemplate(
    input_variables=["product"],
    template="What is a good name for a company that makes {product}?",
)

chain = LLMChain(llm=llm, prompt=prompt)
```

```python
second_prompt = PromptTemplate(
    input_variables=["company_name"],
    template="Write a description of a logo for this company: {company_name}, the logo should not contain text at all ",
)
chain_two = LLMChain(llm=llm, prompt=second_prompt)
```

```python
third_prompt = PromptTemplate(
    input_variables=["company_logo_description"],
    template="{company_logo_description}",
)
chain_three = LLMChain(llm=text2image, prompt=third_prompt)
```

```python
# Run the chain specifying only the input variable for the first chain.
overall_chain = SimpleSequentialChain(
    chains=[chain, chain_two, chain_three], verbose=True
)
output = overall_chain.run("hats")
```

```python
# print the image
print_base64_image(output)
```
