---
sidebar_position: 1
translated: true
---

यदि आपके पास उदाहरणों की एक बड़ी संख्या है, तो आपको शामिल करने के लिए कौन से उदाहरण चुनने की आवश्यकता हो सकती है। उदाहरण चयनकर्ता वह वर्ग है जो ऐसा करने के लिए जिम्मेदार है।

आधारभूत इंटरफ़ेस को नीचे परिभाषित किया गया है:

```python
class BaseExampleSelector(ABC):
    """Interface for selecting examples to include in prompts."""

    @abstractmethod
    def select_examples(self, input_variables: Dict[str, str]) -> List[dict]:
        """Select which examples to use based on the inputs."""

    @abstractmethod
    def add_example(self, example: Dict[str, str]) -> Any:
        """Add new example to store."""
```

इसे परिभाषित करने की एकमात्र आवश्यकता है `select_examples` विधि। यह इनपुट चरों को लेता है और फिर उदाहरणों की एक सूची लौटाता है। यह प्रत्येक विशिष्ट कार्यान्वयन पर निर्भर करता है कि वे उदाहरण कैसे चुने जाते हैं।

LangChain के पास उदाहरण चयनकर्ताओं के कुछ अलग-अलग प्रकार हैं। इन सभी प्रकारों का एक अवलोकन देखने के लिए, नीचे की तालिका देखें।

इस गाइड में, हम एक कस्टम उदाहरण चयनकर्ता बनाने के बारे में चर्चा करेंगे।

## उदाहरण

उदाहरण चयनकर्ता का उपयोग करने के लिए, हमें उदाहरणों की एक सूची बनानी होगी। इन्हें आमतौर पर उदाहरण इनपुट और आउटपुट होने चाहिए। इस डेमो उद्देश्य के लिए, हम अंग्रेजी से इतालवी में अनुवाद करने के उदाहरण चुनने की कल्पना करते हैं।

```python
examples = [
    {"input": "hi", "output": "ciao"},
    {"input": "bye", "output": "arrivaderci"},
    {"input": "soccer", "output": "calcio"},
]
```

## कस्टम उदाहरण चयनकर्ता

चलो एक उदाहरण चयनकर्ता लिखते हैं जो शब्द की लंबाई के आधार पर उदाहरण चुनता है।

```python
from langchain_core.example_selectors.base import BaseExampleSelector


class CustomExampleSelector(BaseExampleSelector):
    def __init__(self, examples):
        self.examples = examples

    def add_example(self, example):
        self.examples.append(example)

    def select_examples(self, input_variables):
        # This assumes knowledge that part of the input will be a 'text' key
        new_word = input_variables["input"]
        new_word_length = len(new_word)

        # Initialize variables to store the best match and its length difference
        best_match = None
        smallest_diff = float("inf")

        # Iterate through each example
        for example in self.examples:
            # Calculate the length difference with the first word of the example
            current_diff = abs(len(example["input"]) - new_word_length)

            # Update the best match if the current one is closer in length
            if current_diff < smallest_diff:
                smallest_diff = current_diff
                best_match = example

        return [best_match]
```

```python
example_selector = CustomExampleSelector(examples)
```

```python
example_selector.select_examples({"input": "okay"})
```

```output
[{'input': 'bye', 'output': 'arrivaderci'}]
```

```python
example_selector.add_example({"input": "hand", "output": "mano"})
```

```python
example_selector.select_examples({"input": "okay"})
```

```output
[{'input': 'hand', 'output': 'mano'}]
```

## प्रॉम्प्ट में उपयोग

अब हम इस उदाहरण चयनकर्ता का उपयोग प्रॉम्प्ट में कर सकते हैं

```python
from langchain_core.prompts.few_shot import FewShotPromptTemplate
from langchain_core.prompts.prompt import PromptTemplate

example_prompt = PromptTemplate.from_template("Input: {input} -> Output: {output}")
```

```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    suffix="Input: {input} -> Output:",
    prefix="Translate the following words from English to Italain:",
    input_variables=["input"],
)

print(prompt.format(input="word"))
```

```output
Translate the following words from English to Italain:

Input: hand -> Output: mano

Input: word -> Output:
```

## उदाहरण चयनकर्ता प्रकार

| नाम       | विवरण                                                                                 |
|------------|---------------------------------------------------------------------------------------------|
| समानता | इनपुट और उदाहरणों के बीच语义समानता का उपयोग करके तय करता है कि कौन से उदाहरण चुने जाएं।    |
| MMR        | इनपुट और उदाहरणों के बीच अधिकतम सीमांत प्रासंगिकता का उपयोग करके तय करता है कि कौन से उदाहरण चुने जाएं। |
| लंबाई     | एक निश्चित लंबाई के भीतर कितने उदाहरण फिट सकते हैं, इसके आधार पर उदाहरण चुनता है।                          |
| Ngram      | इनपुट और उदाहरणों के बीच Ngram ओवरलैप का उपयोग करके तय करता है कि कौन से उदाहरण चुने जाएं।          |
