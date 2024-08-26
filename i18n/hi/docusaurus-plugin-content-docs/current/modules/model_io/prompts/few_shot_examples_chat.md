---
sidebar_position: 2
translated: true
---

# चैट मॉडल के लिए कुछ उदाहरण

यह नोटबुक चैट मॉडल में कुछ उदाहरण का उपयोग करने के बारे में कवर करता है। कुछ उदाहरण प्रोम्प्टिंग को सबसे अच्छा करने के बारे में कोई मजबूत सहमति नहीं प्रतीत होती है, और आदर्श प्रोम्प्ट संकलन मॉडल के अनुसार भिन्न होगा। इस कारण से, हम [FewShotChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html?highlight=fewshot#langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate) जैसे कुछ उदाहरण प्रोम्प्ट टेम्पलेट एक लचीला आरंभिक बिंदु के रूप में प्रदान करते हैं, और आप उन्हें अपनी इच्छानुसार संशोधित या प्रतिस्थापित कर सकते हैं।

कुछ उदाहरण प्रोम्प्ट टेम्पलेट का लक्ष्य एक इनपुट के आधार पर उदाहरण को गतिशील रूप से चुनना और फिर मॉडल के लिए अंतिम प्रोम्प्ट में उदाहरण को प्रारूपित करना है।

**नोट:** निम्नलिखित कोड उदाहरण चैट मॉडल के लिए हैं। पूर्णता मॉडल (एलएलएम) के लिए कुछ उदाहरण प्रोम्प्ट उदाहरण के लिए, [कुछ उदाहरण प्रोम्प्ट टेम्पलेट](/docs/modules/model_io/prompts/few_shot_examples/) गाइड देखें।

### स्थिर उदाहरण

कुछ उदाहरण प्रोम्प्टिंग का सबसे मूलभूत (और आम) तकनीक एक स्थिर प्रोम्प्ट उदाहरण का उपयोग करना है। इस तरह आप एक श्रृंखला का चयन कर सकते हैं, इसका मूल्यांकन कर सकते हैं और उत्पादन में अतिरिक्त गतिशील भागों के बारे में चिंता नहीं कर सकते हैं।

टेम्पलेट के मूलभूत घटक हैं:
- `examples`: अंतिम प्रोम्प्ट में शामिल करने के लिए एक डिक्शनरी उदाहरणों की सूची।
- `example_prompt`: अपने [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=format_messages#langchain_core.prompts.chat.ChatPromptTemplate.format_messages) विधि के माध्यम से प्रत्येक उदाहरण को 1 या अधिक संदेशों में परिवर्तित करता है। एक सामान्य उदाहरण यह होगा कि प्रत्येक उदाहरण को एक मानव संदेश और एक एआई संदेश प्रतिक्रिया में या एक मानव संदेश के बाद एक कार्य कॉल संदेश में परिवर्तित करना।

नीचे एक सरल प्रदर्शन है। पहले, इस उदाहरण के लिए मॉड्यूल आयात करें:

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)
```

फिर, शामिल करने के लिए उदाहरण परिभाषित करें।

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]
```

अगला, उन्हें कुछ उदाहरण प्रोम्प्ट टेम्पलेट में एकत्रित करें।

```python
# This is a prompt template used to format each individual example.
example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)
few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

print(few_shot_prompt.format())
```

```output
Human: 2+2
AI: 4
Human: 2+3
AI: 5
```

अंत में, अपना अंतिम प्रोम्प्ट एकत्रित करें और इसका उपयोग एक मॉडल के साथ करें।

```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's the square of a triangle?"})
```

```output
AIMessage(content=' Triangles do not have a "square". A square refers to a shape with 4 equal sides and 4 right angles. Triangles have 3 sides and 3 angles.\n\nThe area of a triangle can be calculated using the formula:\n\nA = 1/2 * b * h\n\nWhere:\n\nA is the area \nb is the base (the length of one of the sides)\nh is the height (the length from the base to the opposite vertex)\n\nSo the area depends on the specific dimensions of the triangle. There is no single "square of a triangle". The area can vary greatly depending on the base and height measurements.', additional_kwargs={}, example=False)
```

## गतिशील कुछ उदाहरण प्रोम्प्टिंग

कभी-कभी आप इनपुट के आधार पर दिखाए जाने वाले उदाहरणों को शर्त दे सकते हैं। इसके लिए, आप `examples` को `example_selector` से प्रतिस्थापित कर सकते हैं। अन्य घटक ऊपर की तरह ही रहते हैं! समीक्षा करने के लिए, गतिशील कुछ उदाहरण प्रोम्प्ट टेम्पलेट इस प्रकार दिखेगा:

- `example_selector`: दिए गए इनपुट के लिए कुछ उदाहरण (और उनके क्रम) का चयन करने के लिए जिम्मेदार है। ये [BaseExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.base.BaseExampleSelector.html?highlight=baseexampleselector#langchain_core.example_selectors.base.BaseExampleSelector) इंटरफ़ेस को लागू करते हैं। एक सामान्य उदाहरण वेक्टर स्टोर-बैक्ड [SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html?highlight=semanticsimilarityexampleselector#langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector) है।
- `example_prompt`: अपने [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate#langchain_core.prompts.chat.ChatPromptTemplate.format_messages) विधि के माध्यम से प्रत्येक उदाहरण को 1 या अधिक संदेशों में परिवर्तित करता है। एक सामान्य उदाहरण यह होगा कि प्रत्येक उदाहरण को एक मानव संदेश और एक एआई संदेश प्रतिक्रिया में या एक मानव संदेश के बाद एक कार्य कॉल संदेश में परिवर्तित करना।

ये एक बार फिर अन्य संदेशों और चैट टेम्पलेट के साथ संयोजित हो सकते हैं ताकि आपका अंतिम प्रोम्प्ट तैयार हो।

```python
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings
```

क्योंकि हम उदाहरणों का चयन करने के लिए वेक्टर स्टोर का उपयोग कर रहे हैं, हमें पहले स्टोर को भरना होगा।

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
    {"input": "2+4", "output": "6"},
    {"input": "What did the cow say to the moon?", "output": "nothing at all"},
    {
        "input": "Write me a poem about the moon",
        "output": "One for the moon, and one for me, who are we to talk about the moon?",
    },
]

to_vectorize = [" ".join(example.values()) for example in examples]
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(to_vectorize, embeddings, metadatas=examples)
```

#### `example_selector` बनाएं

एक वेक्टर स्टोर बनाने के साथ, आप `example_selector` बना सकते हैं। यहां हम केवल शीर्ष 2 उदाहरण प्राप्त करने का निर्देश देंगे।

```python
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=2,
)

# The prompt template will load examples by passing the input do the `select_examples` method
example_selector.select_examples({"input": "horse"})
```

```output
[{'input': 'What did the cow say to the moon?', 'output': 'nothing at all'},
 {'input': '2+4', 'output': '6'}]
```

#### प्रोम्प्ट टेम्पलेट बनाएं

ऊपर बनाए गए `example_selector` का उपयोग करके प्रोम्प्ट टेम्पलेट एकत्रित करें।

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

# Define the few-shot prompt.
few_shot_prompt = FewShotChatMessagePromptTemplate(
    # The input variables select the values to pass to the example_selector
    input_variables=["input"],
    example_selector=example_selector,
    # Define how each example will be formatted.
    # In this case, each example will become 2 messages:
    # 1 human, and 1 AI
    example_prompt=ChatPromptTemplate.from_messages(
        [("human", "{input}"), ("ai", "{output}")]
    ),
)
```

नीचे इसका एक उदाहरण दिया गया है।

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

अंतिम प्रोम्प्ट टेम्पलेट एकत्रित करें:

```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

#### एक एलएलएम के साथ उपयोग करें

अब, आप अपने मॉडल को कुछ उदाहरण प्रोम्प्ट से जोड़ सकते हैं।

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's 3+3?"})
```

```output
AIMessage(content=' 3 + 3 = 6', additional_kwargs={}, example=False)
```
