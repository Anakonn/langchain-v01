---
sidebar_position: 5
translated: true
---

# रचना

LangChain प्रॉम्प्ट के विभिन्न हिस्सों को एक साथ जोड़ने के लिए एक उपयोगकर्ता-अनुकूल इंटरफ़ेस प्रदान करता है। आप या तो स्ट्रिंग प्रॉम्प्ट या चैट प्रॉम्प्ट के साथ ऐसा कर सकते हैं। इस तरह से प्रॉम्प्ट बनाना घटकों के आसान पुनरुपयोग की अनुमति देता है।

## स्ट्रिंग प्रॉम्प्ट संयोजन

स्ट्रिंग प्रॉम्प्ट के साथ काम करते समय, प्रत्येक टेम्प्लेट को एक साथ जोड़ा जाता है। आप या तो प्रॉम्प्ट्स सीधे या स्ट्रिंग्स (सूची का पहला तत्व एक प्रॉम्प्ट होना चाहिए) के साथ काम कर सकते हैं।

```python
from langchain_core.prompts import PromptTemplate
```

```python
prompt = (
    PromptTemplate.from_template("Tell me a joke about {topic}")
    + ", make it funny"
    + "\n\nand in {language}"
)
```

```python
prompt
```

```output
PromptTemplate(input_variables=['language', 'topic'], template='Tell me a joke about {topic}, make it funny\n\nand in {language}')
```

```python
prompt.format(topic="sports", language="spanish")
```

```output
'Tell me a joke about sports, make it funny\n\nand in spanish'
```

आप इसे एक LLMChain में भी इस्तेमाल कर सकते हैं, जैसा कि पहले किया गया था।

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI()
```

```python
chain = LLMChain(llm=model, prompt=prompt)
```

```python
chain.run(topic="sports", language="spanish")
```

```output
'¿Por qué el futbolista llevaba un paraguas al partido?\n\nPorque pronosticaban lluvia de goles.'
```

## चैट प्रॉम्प्ट संयोजन

एक चैट प्रॉम्प्ट संदेशों की एक सूची से बना होता है। केवल डेवलपर अनुभव के लिए, हमने इन प्रॉम्प्ट बनाने का एक सुविधाजनक तरीका जोड़ा है। इस पाइपलाइन में, प्रत्येक नया तत्व अंतिम प्रॉम्प्ट में एक नया संदेश है।

```python
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

पहले, आइए एक सिस्टम संदेश के साथ आधारभूत ChatPromptTemplate को प्रारंभ करें। इसे सिस्टम से शुरू होना ज़रूरी नहीं है, लेकिन यह अच्छी प्रथा है।

```python
prompt = SystemMessage(content="You are a nice pirate")
```

फिर आप इसे अन्य संदेशों *या* संदेश टेम्प्लेट के साथ मिलाकर एक पाइपलाइन बना सकते हैं।
जब कोई चर फ़ॉर्मेट करने के लिए नहीं हैं, तो एक `Message` का उपयोग करें, जब चर हैं तो एक `MessageTemplate` का उपयोग करें। आप केवल एक स्ट्रिंग भी उपयोग कर सकते हैं (ध्यान दें: यह स्वचालित रूप से एक HumanMessagePromptTemplate के रूप में अनुमान लगाया जाएगा।)

```python
new_prompt = (
    prompt + HumanMessage(content="hi") + AIMessage(content="what?") + "{input}"
)
```

इसके तहत, यह ChatPromptTemplate क्लास का एक उदाहरण बनाता है, इसलिए आप इसका उपयोग पहले की तरह कर सकते हैं!

```python
new_prompt.format_messages(input="i said hi")
```

```output
[SystemMessage(content='You are a nice pirate', additional_kwargs={}),
 HumanMessage(content='hi', additional_kwargs={}, example=False),
 AIMessage(content='what?', additional_kwargs={}, example=False),
 HumanMessage(content='i said hi', additional_kwargs={}, example=False)]
```

आप इसे एक LLMChain में भी उपयोग कर सकते हैं, जैसा कि पहले किया गया था।

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI()
```

```python
chain = LLMChain(llm=model, prompt=new_prompt)
```

```python
chain.run("i said hi")
```

```output
'Oh, hello! How can I assist you today?'
```

## PipelinePrompt का उपयोग करना

LangChain एक अमूर्त [PipelinePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.pipeline.PipelinePromptTemplate.html) शामिल करता है, जो तब उपयोगी हो सकता है जब आप प्रॉम्प्ट के हिस्सों को पुनः उपयोग करना चाहते हैं। एक PipelinePrompt के दो मुख्य हिस्से हैं:

- अंतिम प्रॉम्प्ट: वह अंतिम प्रॉम्प्ट जो वापस किया जाता है
- पाइपलाइन प्रॉम्प्ट: एक स्ट्रिंग नाम और एक प्रॉम्प्ट टेम्प्लेट का एक टुकड़ा। प्रत्येक प्रॉम्प्ट टेम्प्लेट को स्वरूपित किया जाएगा और फिर उसी नाम के साथ एक चर के रूप में भविष्य के प्रॉम्प्ट टेम्प्लेट को पारित किया जाएगा।

```python
from langchain_core.prompts.pipeline import PipelinePromptTemplate
from langchain_core.prompts.prompt import PromptTemplate
```

```python
full_template = """{introduction}

{example}

{start}"""
full_prompt = PromptTemplate.from_template(full_template)
```

```python
introduction_template = """You are impersonating {person}."""
introduction_prompt = PromptTemplate.from_template(introduction_template)
```

```python
example_template = """Here's an example of an interaction:

Q: {example_q}
A: {example_a}"""
example_prompt = PromptTemplate.from_template(example_template)
```

```python
start_template = """Now, do this for real!

Q: {input}
A:"""
start_prompt = PromptTemplate.from_template(start_template)
```

```python
input_prompts = [
    ("introduction", introduction_prompt),
    ("example", example_prompt),
    ("start", start_prompt),
]
pipeline_prompt = PipelinePromptTemplate(
    final_prompt=full_prompt, pipeline_prompts=input_prompts
)
```

```python
pipeline_prompt.input_variables
```

```output
['example_q', 'person', 'input', 'example_a']
```

```python
print(
    pipeline_prompt.format(
        person="Elon Musk",
        example_q="What's your favorite car?",
        example_a="Tesla",
        input="What's your favorite social media site?",
    )
)
```

```output
You are impersonating Elon Musk.

Here's an example of an interaction:

Q: What's your favorite car?
A: Tesla

Now, do this for real!

Q: What's your favorite social media site?
A:
```
