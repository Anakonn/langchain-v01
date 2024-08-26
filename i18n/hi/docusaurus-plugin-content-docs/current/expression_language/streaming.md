---
sidebar_position: 1.5
title: स्ट्रीमिंग
translated: true
---

# LangChain के साथ स्ट्रीमिंग

LLMs पर आधारित अनुप्रयोगों को उपयोगकर्ताओं के लिए उत्तरदायी महसूस कराने में स्ट्रीमिंग महत्वपूर्ण है।

महत्वपूर्ण LangChain प्राथमिकताएँ जैसे LLMs, पार्सर्स, प्रॉम्प्ट्स, रिट्रीवर्स, और एजेंट्स LangChain [Runnable Interface](/docs/expression_language/interface) को लागू करते हैं।

यह इंटरफ़ेस सामग्री को स्ट्रीम करने के दो सामान्य दृष्टिकोण प्रदान करता है:

1. सिंक `stream` और असिंक `astream`: श्रृंखला से **अंतिम आउटपुट** को स्ट्रीम करने का एक **डिफ़ॉल्ट कार्यान्वयन**।
2. असिंक `astream_events` और असिंक `astream_log`: ये श्रृंखला से **मध्यवर्ती चरणों** और **अंतिम आउटपुट** दोनों को स्ट्रीम करने का एक तरीका प्रदान करते हैं।

आइए दोनों दृष्टिकोणों पर एक नज़र डालें, और यह समझने की कोशिश करें कि उनका उपयोग कैसे किया जाए। 🥷

## स्ट्रीम का उपयोग करना

सभी `Runnable` ऑब्जेक्ट्स `stream` नामक एक सिंक मेथड और `astream` नामक एक असिंक वेरिएंट को लागू करते हैं।

ये विधियाँ अंतिम आउटपुट को टुकड़ों में स्ट्रीम करने के लिए डिज़ाइन की गई हैं, प्रत्येक टुकड़े को जैसे ही यह उपलब्ध होता है, प्रदान करते हैं।

स्ट्रीमिंग केवल तभी संभव है जब प्रोग्राम के सभी चरण यह जानें कि **इनपुट स्ट्रीम** को कैसे संसाधित किया जाए; यानी, एक समय में एक इनपुट टुकड़े को संसाधित करें, और एक संबंधित आउटपुट टुकड़ा प्रदान करें।

इस प्रसंस्करण की जटिलता भिन्न हो सकती है, जैसे LLM द्वारा उत्पन्न टोकन को उत्सर्जित करना जैसे सीधे कार्य, या संपूर्ण JSON पूर्ण होने से पहले JSON परिणामों के भागों को स्ट्रीम करना जैसे चुनौतीपूर्ण कार्य।

स्ट्रीमिंग का पता लगाने के लिए सबसे अच्छी जगह LLM ऐप्स में सबसे महत्वपूर्ण घटकों के साथ शुरू करना है - स्वयं LLMs!

### LLMs और चैट मॉडल

बड़े भाषा मॉडल और उनके चैट वेरिएंट LLM आधारित ऐप्स में प्राथमिक बाधा हैं। 🙊

बड़े भाषा मॉडल किसी क्वेरी के लिए पूर्ण प्रतिक्रिया उत्पन्न करने में **कई सेकंड** ले सकते हैं। यह **~200-300 ms** सीमा से कहीं अधिक धीमा है जिस पर एक एप्लिकेशन उपयोगकर्ता के लिए प्रतिक्रियाशील महसूस करता है।

एप्लिकेशन को अधिक प्रतिक्रियाशील महसूस कराने की मुख्य रणनीति मध्यवर्ती प्रगति दिखाना है; अर्थात, मॉडल से आउटपुट को **टोकन दर टोकन** स्ट्रीम करना।

हम [Anthropic](/docs/integrations/platforms/anthropic) से चैट मॉडल का उपयोग करके स्ट्रीमिंग के उदाहरण दिखाएंगे। मॉडल का उपयोग करने के लिए, आपको `langchain-anthropic` पैकेज इंस्टॉल करना होगा। आप इसे निम्नलिखित कमांड के साथ कर सकते हैं:

```python
pip install -qU langchain-anthropic
```

```python
# Showing the example using anthropic, but you can use
# your favorite chat model!
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic()

chunks = []
async for chunk in model.astream("hello. tell me something about yourself"):
    chunks.append(chunk)
    print(chunk.content, end="|", flush=True)
```

```output
 Hello|!| My| name| is| Claude|.| I|'m| an| AI| assistant| created| by| An|throp|ic| to| be| helpful|,| harmless|,| and| honest|.||
```

आइए एक टुकड़े का निरीक्षण करें

```python
chunks[0]
```

```output
AIMessageChunk(content=' Hello')
```

हमें कुछ मिला जिसे `AIMessageChunk` कहा जाता है। यह टुकड़ा एक `AIMessage` का एक हिस्सा दर्शाता है।

संदेश टुकड़े डिज़ाइन द्वारा योगात्मक होते हैं -- केवल उन्हें जोड़कर अब तक की प्रतिक्रिया की स्थिति प्राप्त की जा सकती है!

```python
chunks[0] + chunks[1] + chunks[2] + chunks[3] + chunks[4]
```

```output
AIMessageChunk(content=' Hello! My name is')
```

### चेन

लगभग सभी LLM अनुप्रयोगों में एक भाषा मॉडल को कॉल करने के अलावा और भी कदम शामिल होते हैं।

आइए `LangChain Expression Language` (`LCEL`) का उपयोग करके एक सरल श्रृंखला बनाते हैं जो एक प्रॉम्प्ट, मॉडल और एक पार्सर को जोड़ती है और सत्यापित करती है कि स्ट्रीमिंग काम करती है।

हम मॉडल से आउटपुट पार्स करने के लिए `StrOutputParser` का उपयोग करेंगे। यह एक सरल पार्सर है जो `AIMessageChunk` से `सामग्री` फ़ील्ड को निकालता है, जिससे हमें मॉडल द्वारा लौटाए गए `टोकन` मिलते हैं।

:::tip
LCEL एक *घोषणात्मक* तरीका है "कार्यक्रम" को निर्दिष्ट करने का, विभिन्न LangChain प्राथमिकताओं को एक साथ जोड़कर। LCEL का उपयोग करके बनाई गई चेन `stream` और `astream` का स्वचालित कार्यान्वयन प्रदान करती हैं जो अंतिम आउटपुट की स्ट्रीमिंग की अनुमति देती हैं। वास्तव में, LCEL का उपयोग करके बनाई गई चेन पूरे मानक Runnable इंटरफ़ेस को लागू करती हैं।
:::

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
parser = StrOutputParser()
chain = prompt | model | parser

async for chunk in chain.astream({"topic": "parrot"}):
    print(chunk, end="|", flush=True)
```

```output
 Here|'s| a| silly| joke| about| a| par|rot|:|

What| kind| of| teacher| gives| good| advice|?| An| ap|-|parent| (|app|arent|)| one|!||
```

ऊपर आप देख सकते हैं कि `parser` वास्तव में मॉडल से स्ट्रीमिंग आउटपुट को अवरुद्ध नहीं करता है, बल्कि प्रत्येक टुकड़े को व्यक्तिगत रूप से संसाधित करता है। कई [LCEL प्राथमिकताएं](/docs/expression_language/primitives) इस प्रकार के ट्रांसफॉर्म-स्टाइल पासथ्रू स्ट्रीमिंग का समर्थन करती हैं, जो ऐप्स बनाने में बहुत सुविधाजनक हो सकता है।

कुछ रननेबल्स, जैसे [प्रॉम्प्ट टेम्पलेट्स](/docs/modules/model_io/prompts) और [चैट मॉडल](/docs/modules/model_io/chat), व्यक्तिगत टुकड़ों को संसाधित नहीं कर सकते और इसके बजाय सभी पिछले चरणों को एकत्रित करते हैं। यह स्ट्रीमिंग प्रक्रिया को बाधित करेगा। कस्टम कार्य [जनरेटर्स को लौटाने के लिए डिज़ाइन किए जा सकते हैं](/docs/expression_language/primitives/functions#streaming), जो

:::note
यदि उपरोक्त कार्यक्षमता आपके निर्माण से संबंधित नहीं है, तो आपको LangChain का उपयोग करने के लिए `LangChain Expression Language` का उपयोग करने की आवश्यकता नहीं है और इसके बजाय मानक **आवश्यक** प्रोग्रामिंग दृष्टिकोण पर भरोसा कर सकते हैं
प्रत्येक घटक पर `invoke`, `batch` या `stream` को कॉल करके, परिणामों को वेरिएबल्स को असाइन करके और फिर उन्हें आगे उपयोग के लिए उपयोग करके।

यदि यह आपकी आवश्यकताओं के लिए काम करता है, तो यह हमारे लिए ठीक है 👌!
:::

### इनपुट स्ट्रीम के साथ काम करना

क्या होगा यदि आप JSON को आउटपुट से स्ट्रीम करना चाहते थे जैसा कि यह उत्पन्न हो रहा था?

यदि आप आंशिक JSON को पार्स करने के लिए `json.loads` पर निर्भर होते, तो पार्सिंग विफल हो जाती क्योंकि आंशिक JSON मान्य JSON नहीं होता।

आप पूरी तरह से यह सोचकर भ्रमित हो जाते कि JSON को स्ट्रीम करना संभव नहीं था।

खैर, यह पता चलता है कि इसे करने का एक तरीका है -- पार्सर को **इनपुट स्ट्रीम** पर काम करना चाहिए, और आंशिक JSON को मान्य स्थिति में "स्वतः पूर्ण" करने का प्रयास करना चाहिए।

आइए ऐसे पार्सर को क्रिया में देखें ताकि यह समझ सकें कि इसका क्या मतलब है।

```python
from langchain_core.output_parsers import JsonOutputParser

chain = (
    model | JsonOutputParser()
)  # Due to a bug in older versions of Langchain, JsonOutputParser did not stream results from some models
async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, flush=True)
```

```output
{}
{'countries': []}
{'countries': [{}]}
{'countries': [{'name': ''}]}
{'countries': [{'name': 'France'}]}
{'countries': [{'name': 'France', 'population': 67}]}
{'countries': [{'name': 'France', 'population': 6739}]}
{'countries': [{'name': 'France', 'population': 673915}]}
{'countries': [{'name': 'France', 'population': 67391582}]}
{'countries': [{'name': 'France', 'population': 67391582}, {}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Sp'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 4675}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 467547}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 12}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 12647}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 1264764}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 126476461}]}
```

अब, आइए स्ट्रीमिंग को **तोड़ें**। हम पिछले उदाहरण का उपयोग करेंगे और एक निष्कर्षण फ़ंक्शन जोड़ेंगे जो अंतिम JSON से देश के नाम निकालता है।

:::warning
श्रृंखला में कोई भी चरण जो **अंतिम इनपुट** पर काम करता है, न कि **इनपुट स्ट्रीम्स** पर, `stream` या `astream` के माध्यम से स्ट्रीमिंग कार्यक्षमता को तोड़ सकता है।
:::

:::tip
बाद में, हम `astream_events` API पर चर्चा करेंगे जो मध्यवर्ती चरणों से परिणामों को स्ट्रीम करता है। यह API मध्यवर्ती चरणों से परिणामों को स्ट्रीम करेगा भले ही श्रृंखला में ऐसे चरण शामिल हों जो केवल **अंतिम इनपुट** पर काम करते हैं।
:::

```python
from langchain_core.output_parsers import (
    JsonOutputParser,
)


# A function that operates on finalized inputs
# rather than on an input_stream
def _extract_country_names(inputs):
    """A function that does not operates on input streams and breaks streaming."""
    if not isinstance(inputs, dict):
        return ""

    if "countries" not in inputs:
        return ""

    countries = inputs["countries"]

    if not isinstance(countries, list):
        return ""

    country_names = [
        country.get("name") for country in countries if isinstance(country, dict)
    ]
    return country_names


chain = model | JsonOutputParser() | _extract_country_names

async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, end="|", flush=True)
```

```output
['France', 'Spain', 'Japan']|
```

#### जनरेटर फंक्शंस

आइए स्ट्रीमिंग को ठीक करें एक जनरेटर फ़ंक्शन का उपयोग करके जो **इनपुट स्ट्रीम** पर काम कर सकता है।

:::tip
एक जनरेटर फ़ंक्शन (एक फ़ंक्शन जो `yield` का उपयोग करता है) **इनपुट स्ट्रीम्स** पर काम करने वाला कोड लिखने की अनुमति देता है
:::

```python
from langchain_core.output_parsers import JsonOutputParser


async def _extract_country_names_streaming(input_stream):
    """A function that operates on input streams."""
    country_names_so_far = set()

    async for input in input_stream:
        if not isinstance(input, dict):
            continue

        if "countries" not in input:
            continue

        countries = input["countries"]

        if not isinstance(countries, list):
            continue

        for country in countries:
            name = country.get("name")
            if not name:
                continue
            if name not in country_names_so_far:
                yield name
                country_names_so_far.add(name)


chain = model | JsonOutputParser() | _extract_country_names_streaming

async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, end="|", flush=True)
```

```output
France|Sp|Spain|Japan|
```

:::note
चूंकि उपरोक्त कोड JSON ऑटो-पूर्णता पर निर्भर है, आप देशों के आंशिक नाम देख सकते हैं (उदाहरण के लिए, `Sp` और `Spain`), जो निष्कर्षण परिणाम के लिए कोई नहीं चाहेगा!

हम स्ट्रीमिंग अवधारणाओं पर ध्यान केंद्रित कर रहे हैं, न कि आवश्यक रूप से श्रृंखलाओं के परिणामों पर।
:::

### गैर-स्ट्रीमिंग घटक

कुछ निर्मित घटक जैसे रिट्रीवर्स कोई `स्ट्रीमिंग` पेश नहीं करते हैं। अगर हम उन्हें `stream` करने की कोशिश करें तो क्या होगा? 🤨

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho", "harrison likes spicy food"],
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()

chunks = [chunk for chunk in retriever.stream("where did harrison work?")]
chunks
```

```output
[[Document(page_content='harrison worked at kensho'),
  Document(page_content='harrison likes spicy food')]]
```

स्ट्रीम ने उस घटक से अंतिम परिणाम को ही प्रदान किया।

यह ठीक है 🥹! सभी घटकों को स्ट्रीमिंग लागू करने की आवश्यकता नहीं है -- कुछ मामलों में स्ट्रीमिंग या तो अनावश्यक है, कठिन है, या बस समझ में नहीं आती है।

:::tip
गैर-स्ट्रीमिंग घटकों का उपयोग करके बनाई गई एक LCEL श्रृंखला, कई मामलों में अभी भी स्ट्रीम करने में सक्षम होगी, श्रृंखला में अंतिम गैर-स्ट्रीमिंग चरण के बाद आंशिक आउटपुट की स्ट्रीमिंग शुरू होगी।
:::

```python
retrieval_chain = (
    {
        "context": retriever.with_config(run_name="Docs"),
        "question": RunnablePassthrough(),
    }
    | prompt
    | model
    | StrOutputParser()
)
```

```python
for chunk in retrieval_chain.stream(
    "Where did harrison work? " "Write 3 made up sentences about this place."
):
    print(chunk, end="|", flush=True)
```

```output
 Based| on| the| given| context|,| the| only| information| provided| about| where| Harrison| worked| is| that| he| worked| at| Ken|sh|o|.| Since| there| are| no| other| details| provided| about| Ken|sh|o|,| I| do| not| have| enough| information| to| write| 3| additional| made| up| sentences| about| this| place|.| I| can| only| state| that| Harrison| worked| at| Ken|sh|o|.||
```

अब जब हमने देखा कि `stream` और `astream` कैसे काम करते हैं, तो आइए स्ट्रीमिंग घटनाओं की दुनिया में प्रवेश करें। 🏞️

## स्ट्रीम इवेंट्स का उपयोग करना

इवेंट स्ट्रीमिंग एक **बीटा** API है। यह API फीडबैक के आधार पर थोड़ा बदल सकता है।

:::note
langchain-core **0.1.14** में पेश किया गया।
:::

```python
import langchain_core

langchain_core.__version__
```

```output
'0.1.18'
```

`astream_events` API को ठीक से काम करने के लिए:

* कोड में यथासंभव `async` का उपयोग करें (उदाहरण के लिए, असिंक उपकरण आदि)
* कस्टम कार्य / रननेबल्स को परिभाषित करते समय कॉलबैक्स को प्रचारित करें
* जब भी LCEL के बिना रननेबल्स का उपयोग करें, LLMs पर `.ainvoke` के बजाय `.astream()` को कॉल करना सुनिश्चित करें ताकि LLM को टोकन स्ट्रीम करने के लिए मजबूर किया जा सके।
* यदि कुछ अपेक्षित रूप से काम नहीं करता है तो हमें बताएं! :)

### इवेंट संदर्भ

नीचे एक संदर्भ तालिका दी गई है जो विभिन्न Runnable ऑब्जेक्ट्स द्वारा उत्पन्न होने वाले कुछ इवेंट्स को दिखाती है।

:::note
जब स्ट्रीमिंग को सही तरीके से लागू किया जाता है, तो किसी runnable के इनपुट तब तक ज्ञात नहीं होंगे जब तक कि इनपुट स्ट्रीम पूरी तरह से उपभोग नहीं हो जाती। इसका मतलब है कि `inputs` अक्सर केवल `end` इवेंट्स के लिए शामिल किए जाएंगे, न कि `start` इवेंट्स के लिए।
:::

| event                | name             | chunk                           | input                                         | output                                          |
|----------------------|------------------|---------------------------------|-----------------------------------------------|-------------------------------------------------|
| on_chat_model_start  | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]} |                                                 |
| on_chat_model_stream | [model name]     | AIMessageChunk(content="hello") |                                               |                                                 |
| on_chat_model_end    | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]} | {"generations": [...], "llm_output": None, ...} |
| on_llm_start         | [model name]     |                                 | {'input': 'hello'}                            |                                                 |
| on_llm_stream        | [model name]     | 'Hello'                         |                                               |                                                 |
| on_llm_end           | [model name]     |                                 | 'Hello human!'                                |
| on_chain_start       | format_docs      |                                 |                                               |                                                 |
| on_chain_stream      | format_docs      | "hello world!, goodbye world!"  |                                               |                                                 |
| on_chain_end         | format_docs      |                                 | [Document(...)]                               | "hello world!, goodbye world!"                  |
| on_tool_start        | some_tool        |                                 | {"x": 1, "y": "2"}                            |                                                 |
| on_tool_stream       | some_tool        | {"x": 1, "y": "2"}              |                                               |                                                 |
| on_tool_end          | some_tool        |                                 |                                               | {"x": 1, "y": "2"}                              |
| on_retriever_start   | [retriever name] |                                 | {"query": "hello"}                            |                                                 |
| on_retriever_chunk   | [retriever name] | {documents: [...]}              |                                               |                                                 |
| on_retriever_end     | [retriever name] |                                 | {"query": "hello"}                            | {documents: [...]}                              |
| on_prompt_start      | [template_name]  |                                 | {"question": "hello"}                         |                                                 |
| on_prompt_end        | [template_name]  |                                 | {"question": "hello"}                         | ChatPromptValue(messages: [SystemMessage, ...]) |

### चैट मॉडल

आइए चैट मॉडल द्वारा उत्पन्न इवेंट्स पर नज़र डालें।

```python
events = []
async for event in model.astream_events("hello", version="v1"):
    events.append(event)
```

```output
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

:::note

अरे यह API में version="v1" पैरामीटर क्या मजेदार है?! 😾

यह एक **बीटा API** है, और हम निश्चित रूप से इसमें कुछ बदलाव करने जा रहे हैं।

यह संस्करण पैरामीटर हमें आपके कोड में इस तरह के तोड़फोड़ वाले परिवर्तनों को न्यूनतम करने की अनुमति देगा।

संक्षेप में, हम अभी आपको परेशान कर रहे हैं, ताकि हमें बाद में आपको परेशान न करना पड़े।
:::

आइए कुछ स्टार्ट इवेंट्स और कुछ एंड इवेंट्स पर नजर डालते हैं।

```python
events[:3]
```

```output
[{'event': 'on_chat_model_start',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'name': 'ChatAnthropic',
  'tags': [],
  'metadata': {},
  'data': {'input': 'hello'}},
 {'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content=' Hello')}},
 {'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content='!')}}]
```

```python
events[-2:]
```

```output
[{'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content='')}},
 {'event': 'on_chat_model_end',
  'name': 'ChatAnthropic',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'data': {'output': AIMessageChunk(content=' Hello!')}}]
```

### चेन

आइए उस उदाहरण चेन पर पुनः विचार करें जिसने स्ट्रीमिंग JSON को पार्स किया था ताकि स्ट्रीमिंग इवेंट्स API का पता लगाया जा सके।

```python
chain = (
    model | JsonOutputParser()
)  # Due to a bug in older versions of Langchain, JsonOutputParser did not stream results from some models

events = [
    event
    async for event in chain.astream_events(
        'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
        version="v1",
    )
]
```

यदि आप पहले कुछ इवेंट्स का निरीक्षण करते हैं, तो आप देखेंगे कि **2** स्टार्ट इवेंट्स के बजाय **3** विभिन्न स्टार्ट इवेंट्स हैं।

ये तीन स्टार्ट इवेंट्स निम्नलिखित के अनुरूप हैं:

1. चेन (मॉडल + पार्सर)
2. मॉडल
3. पार्सर

```python
events[:3]
```

```output
[{'event': 'on_chain_start',
  'run_id': 'b1074bff-2a17-458b-9e7b-625211710df4',
  'name': 'RunnableSequence',
  'tags': [],
  'metadata': {},
  'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}},
 {'event': 'on_chat_model_start',
  'name': 'ChatAnthropic',
  'run_id': '6072be59-1f43-4f1c-9470-3b92e8406a99',
  'tags': ['seq:step:1'],
  'metadata': {},
  'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}},
 {'event': 'on_parser_start',
  'name': 'JsonOutputParser',
  'run_id': 'bf978194-0eda-4494-ad15-3a5bfe69cd59',
  'tags': ['seq:step:2'],
  'metadata': {},
  'data': {}}]
```

आपको क्या लगता है कि यदि आप अंतिम 3 इवेंट्स को देखें तो आप क्या देखेंगे? और बीच के बारे में क्या?

आइए इस API का उपयोग करें ताकि मॉडल और पार्सर से स्ट्रीम इवेंट्स को आउटपुट किया जा सके। हम स्टार्ट इवेंट्स, एंड इवेंट्स और चेन से इवेंट्स को नजरअंदाज कर रहे हैं।

```python
num_events = 0

async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(
            f"Chat model chunk: {repr(event['data']['chunk'].content)}",
            flush=True,
        )
    if kind == "on_parser_stream":
        print(f"Parser chunk: {event['data']['chunk']}", flush=True)
    num_events += 1
    if num_events > 30:
        # Truncate the output
        print("...")
        break
```

```output
Chat model chunk: ' Here'
Chat model chunk: ' is'
Chat model chunk: ' the'
Chat model chunk: ' JSON'
Chat model chunk: ' with'
Chat model chunk: ' the'
Chat model chunk: ' requested'
Chat model chunk: ' countries'
Chat model chunk: ' and'
Chat model chunk: ' their'
Chat model chunk: ' populations'
Chat model chunk: ':'
Chat model chunk: '\n\n```'
Chat model chunk: 'json'
Parser chunk: {}
Chat model chunk: '\n{'
Chat model chunk: '\n '
Chat model chunk: ' "'
Chat model chunk: 'countries'
Chat model chunk: '":'
Parser chunk: {'countries': []}
Chat model chunk: ' ['
Chat model chunk: '\n   '
Parser chunk: {'countries': [{}]}
Chat model chunk: ' {'
...
```

क्योंकि दोनों मॉडल और पार्सर स्ट्रीमिंग का समर्थन करते हैं, हम दोनों घटकों से वास्तविक समय में स्ट्रीमिंग इवेंट्स देखते हैं! यह कुछ हद तक कूल है, है न? 🦜

### इवेंट्स को फ़िल्टर करना

क्योंकि यह API बहुत सारे इवेंट्स उत्पन्न करता है, इसलिए इवेंट्स पर फ़िल्टर करना उपयोगी होता है।

आप घटक `name`, घटक `tags` या घटक `type` द्वारा फ़िल्टर कर सकते हैं।

#### नाम द्वारा

```python
chain = model.with_config({"run_name": "model"}) | JsonOutputParser().with_config(
    {"run_name": "my_parser"}
)

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_names=["my_parser"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_parser_start', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': []}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': ''}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France'}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 6739}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 673915}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67391582}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67391582}, {}]}}}
...
```

#### प्रकार द्वारा

```python
chain = model.with_config({"run_name": "model"}) | JsonOutputParser().with_config(
    {"run_name": "my_parser"}
)

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_types=["chat_model"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_chat_model_start', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' Here')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' is')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' JSON')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' with')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' requested')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' countries')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' and')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' their')}}
...
```

#### टैग्स द्वारा

:::caution

टैग्स एक दिए गए runnable के चाइल्ड घटकों द्वारा विरासत में मिलते हैं।

यदि आप फ़िल्टर करने के लिए टैग्स का उपयोग कर रहे हैं, तो सुनिश्चित करें कि यह वही है जो आप चाहते हैं।
:::

```python
chain = (model | JsonOutputParser()).with_config({"tags": ["my_chain"]})

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_tags=["my_chain"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_chain_start', 'run_id': '190875f3-3fb7-49ad-9b6e-f49da22f3e49', 'name': 'RunnableSequence', 'tags': ['my_chain'], 'metadata': {}, 'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}}
{'event': 'on_chat_model_start', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}}
{'event': 'on_parser_start', 'name': 'JsonOutputParser', 'run_id': '3b5e4ca1-40fe-4a02-9a19-ba2a43a6115c', 'tags': ['seq:step:2', 'my_chain'], 'metadata': {}, 'data': {}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' Here')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' is')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' JSON')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' with')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' requested')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' countries')}}
...
```

### गैर-स्ट्रीमिंग घटक

याद रखें कि कुछ घटक स्ट्रीमिंग में अच्छा प्रदर्शन नहीं करते क्योंकि वे **इनपुट स्ट्रीम्स** पर कार्य नहीं करते?

जबकि ऐसे घटक `astream` का उपयोग करते समय अंतिम आउटपुट की स्ट्रीमिंग को तोड़ सकते हैं, `astream_events` अभी भी उन मध्यवर्ती चरणों से स्ट्रीमिंग इवेंट्स उत्पन्न करेगा जो स्ट्रीमिंग का समर्थन करते हैं!

```python
# Function that does not support streaming.
# It operates on the finalizes inputs rather than
# operating on the input stream.
def _extract_country_names(inputs):
    """A function that does not operates on input streams and breaks streaming."""
    if not isinstance(inputs, dict):
        return ""

    if "countries" not in inputs:
        return ""

    countries = inputs["countries"]

    if not isinstance(countries, list):
        return ""

    country_names = [
        country.get("name") for country in countries if isinstance(country, dict)
    ]
    return country_names


chain = (
    model | JsonOutputParser() | _extract_country_names
)  # This parser only works with OpenAI right now
```

जैसा की अपेक्षित था, `astream` API सही से काम नहीं करता क्योंकि `_extract_country_names` स्ट्रीम्स पर कार्य नहीं करता।

```python
async for chunk in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
):
    print(chunk, flush=True)
```

```output
['France', 'Spain', 'Japan']
```

अब, आइए पुष्टि करें कि astream_events के साथ हम अभी भी मॉडल और पार्सर से स्ट्रीमिंग आउटपुट देख रहे हैं।

```python
num_events = 0

async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(
            f"Chat model chunk: {repr(event['data']['chunk'].content)}",
            flush=True,
        )
    if kind == "on_parser_stream":
        print(f"Parser chunk: {event['data']['chunk']}", flush=True)
    num_events += 1
    if num_events > 30:
        # Truncate the output
        print("...")
        break
```

```output
Chat model chunk: ' Here'
Chat model chunk: ' is'
Chat model chunk: ' the'
Chat model chunk: ' JSON'
Chat model chunk: ' with'
Chat model chunk: ' the'
Chat model chunk: ' requested'
Chat model chunk: ' countries'
Chat model chunk: ' and'
Chat model chunk: ' their'
Chat model chunk: ' populations'
Chat model chunk: ':'
Chat model chunk: '\n\n```'
Chat model chunk: 'json'
Parser chunk: {}
Chat model chunk: '\n{'
Chat model chunk: '\n '
Chat model chunk: ' "'
Chat model chunk: 'countries'
Chat model chunk: '":'
Parser chunk: {'countries': []}
Chat model chunk: ' ['
Chat model chunk: '\n   '
Parser chunk: {'countries': [{}]}
Chat model chunk: ' {'
Chat model chunk: '\n     '
Chat model chunk: ' "'
...
```

### कॉलबैक्स को प्रचारित करना

:::caution
यदि आप अपने टूल्स के अंदर runnables को बुला रहे हैं, तो आपको runnable को कॉलबैक्स को प्रचारित करना होगा; अन्यथा, कोई स्ट्रीम इवेंट्स उत्पन्न नहीं होंगे।
:::

:::note
जब RunnableLambdas या @chain डेकोरेटर का उपयोग करते हैं, तो कॉलबैक्स स्वचालित रूप से पर्दे के पीछे प्रचारित हो जाते हैं।
:::

```python
from langchain_core.runnables import RunnableLambda
from langchain_core.tools import tool


def reverse_word(word: str):
    return word[::-1]


reverse_word = RunnableLambda(reverse_word)


@tool
def bad_tool(word: str):
    """Custom tool that doesn't propagate callbacks."""
    return reverse_word.invoke(word)


async for event in bad_tool.astream_events("hello", version="v1"):
    print(event)
```

```output
{'event': 'on_tool_start', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'name': 'bad_tool', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_tool_stream', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'tags': [], 'metadata': {}, 'name': 'bad_tool', 'data': {'chunk': 'olleh'}}
{'event': 'on_tool_end', 'name': 'bad_tool', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'tags': [], 'metadata': {}, 'data': {'output': 'olleh'}}
```

यहाँ एक पुन: कार्यान्वयन है जो कॉलबैक्स को सही ढंग से प्रचारित करता है। आप देखेंगे कि अब हम `reverse_word` runnable से भी इवेंट्स प्राप्त कर रहे हैं।

```python
@tool
def correct_tool(word: str, callbacks):
    """A tool that correctly propagates callbacks."""
    return reverse_word.invoke(word, {"callbacks": callbacks})


async for event in correct_tool.astream_events("hello", version="v1"):
    print(event)
```

```output
{'event': 'on_tool_start', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'name': 'correct_tool', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': 'c4882303-8867-4dff-b031-7d9499b39dda', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': 'c4882303-8867-4dff-b031-7d9499b39dda', 'tags': [], 'metadata': {}, 'data': {'input': 'hello', 'output': 'olleh'}}
{'event': 'on_tool_stream', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'tags': [], 'metadata': {}, 'name': 'correct_tool', 'data': {'chunk': 'olleh'}}
{'event': 'on_tool_end', 'name': 'correct_tool', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'tags': [], 'metadata': {}, 'data': {'output': 'olleh'}}
```

यदि आप Runnable Lambdas या @chains के भीतर से runnables को बुला रहे हैं, तो कॉलबैक्स स्वचालित रूप से आपकी ओर से पारित हो जाएंगे।

```python
from langchain_core.runnables import RunnableLambda


async def reverse_and_double(word: str):
    return await reverse_word.ainvoke(word) * 2


reverse_and_double = RunnableLambda(reverse_and_double)

await reverse_and_double.ainvoke("1234")

async for event in reverse_and_double.astream_events("1234", version="v1"):
    print(event)
```

```output
{'event': 'on_chain_start', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': '335fe781-8944-4464-8d2e-81f61d1f85f5', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': '335fe781-8944-4464-8d2e-81f61d1f85f5', 'tags': [], 'metadata': {}, 'data': {'input': '1234', 'output': '4321'}}
{'event': 'on_chain_stream', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'tags': [], 'metadata': {}, 'name': 'reverse_and_double', 'data': {'chunk': '43214321'}}
{'event': 'on_chain_end', 'name': 'reverse_and_double', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'tags': [], 'metadata': {}, 'data': {'output': '43214321'}}
```

और @chain डेकोरेटर के साथ:

```python
from langchain_core.runnables import chain


@chain
async def reverse_and_double(word: str):
    return await reverse_word.ainvoke(word) * 2


await reverse_and_double.ainvoke("1234")

async for event in reverse_and_double.astream_events("1234", version="v1"):
    print(event)
```

```output
{'event': 'on_chain_start', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': 'e7cddab2-9b95-4e80-abaf-4b2429117835', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': 'e7cddab2-9b95-4e80-abaf-4b2429117835', 'tags': [], 'metadata': {}, 'data': {'input': '1234', 'output': '4321'}}
{'event': 'on_chain_stream', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'tags': [], 'metadata': {}, 'name': 'reverse_and_double', 'data': {'chunk': '43214321'}}
{'event': 'on_chain_end', 'name': 'reverse_and_double', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'tags': [], 'metadata': {}, 'data': {'output': '43214321'}}
```
