---
sidebar_position: 7
translated: true
---

# उच्च कार्डिनालिटी वर्गीय श्रेणियों से निपटना

आप किसी वर्गीय कॉलम पर फ़िल्टर बनाने के लिए क्वेरी विश्लेषण करना चाह सकते हैं। यहां एक कठिनाई यह है कि आमतौर पर आपको सटीक वर्गीय मान निर्दिष्ट करने की आवश्यकता होती है। समस्या यह है कि आपको यह सुनिश्चित करना होता है कि एलएलएम उस वर्गीय मान को बिल्कुल सही उत्पन्न करे। जब केवल कुछ मान्य मान हों तो प्रोम्प्टिंग के साथ यह सापेक्षिक रूप से आसान किया जा सकता है। जब मान्य मानों की संख्या अधिक हो तो यह अधिक कठिन हो जाता है, क्योंकि वे मान एलएलएम संदर्भ में फिट नहीं हो सकते हैं, या (यदि वे फिट हों) एलएलएम को उचित ध्यान देने के लिए बहुत अधिक हो सकते हैं।

इस नोटबुक में हम इस पर नज़र डालते हैं।

## सेटअप

#### निर्भरताएं स्थापित करें

```python
# %pip install -qU langchain langchain-community langchain-openai faker langchain-chroma
```

#### पर्यावरण चर सेट करें

हम इस उदाहरण में OpenAI का उपयोग करेंगे:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

#### डेटा सेट अप करें

हम कुछ नकली नाम उत्पन्न करेंगे

```python
from faker import Faker

fake = Faker()

names = [fake.name() for _ in range(10000)]
```

चलो कुछ नामों पर नज़र डालते हैं

```python
names[0]
```

```output
'Hayley Gonzalez'
```

```python
names[567]
```

```output
'Jesse Knight'
```

## क्वेरी विश्लेषण

अब हम एक आधारभूत क्वेरी विश्लेषण सेट कर सकते हैं

```python
from langchain_core.pydantic_v1 import BaseModel, Field
```

```python
class Search(BaseModel):
    query: str
    author: str
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """Generate a relevant search query for a library system"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

हम देख सकते हैं कि यदि हम नाम को बिल्कुल सही लिखते हैं, तो यह इसे कैसे संभाल सकता है

```python
query_analyzer.invoke("what are books about aliens by Jesse Knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

समस्या यह है कि आप फ़िल्टर करना चाहते हैं वे मान बिल्कुल सही नहीं लिखे गए हो सकते हैं

```python
query_analyzer.invoke("what are books about aliens by jess knight")
```

```output
Search(query='books about aliens', author='Jess Knight')
```

### सभी मानों को जोड़ें

इसके चारों ओर एक तरीका यह है कि आप प्रोम्प्ट में सभी संभावित मानों को जोड़ दें। यह आमतौर पर क्वेरी को सही दिशा में मार्गदर्शन करेगा

```python
system = """Generate a relevant search query for a library system.

`author` attribute MUST be one of:

{authors}

Do NOT hallucinate author name!"""
base_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
prompt = base_prompt.partial(authors=", ".join(names))
```

```python
query_analyzer_all = {"question": RunnablePassthrough()} | prompt | structured_llm
```

हालांकि... यदि वर्गीय मानों की सूची काफी लंबी है, तो यह गलती कर सकता है!

```python
try:
    res = query_analyzer_all.invoke("what are books about aliens by jess knight")
except Exception as e:
    print(e)
```

```output
Error code: 400 - {'error': {'message': "This model's maximum context length is 16385 tokens. However, your messages resulted in 33885 tokens (33855 in the messages, 30 in the functions). Please reduce the length of the messages or functions.", 'type': 'invalid_request_error', 'param': 'messages', 'code': 'context_length_exceeded'}}
```

हम एक लंबे संदर्भ विंडो का उपयोग करने का प्रयास कर सकते हैं... लेकिन उतनी जानकारी होने के कारण, यह विश्वसनीय रूप से इसे पकड़ने की गारंटी नहीं है

```python
llm_long = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)
structured_llm_long = llm_long.with_structured_output(Search)
query_analyzer_all = {"question": RunnablePassthrough()} | prompt | structured_llm_long
```

```python
query_analyzer_all.invoke("what are books about aliens by jess knight")
```

```output
Search(query='aliens', author='Kevin Knight')
```

### सभी प्रासंगिक मानों को ढूंढें और खोजें

इसके बजाय, हम एक प्रासंगिक मानों पर सूचकांक बना सकते हैं और फिर उन N सबसे प्रासंगिक मानों को क्वेरी कर सकते हैं,

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(names, embeddings, collection_name="author_names")
```

```python
def select_names(question):
    _docs = vectorstore.similarity_search(question, k=10)
    _names = [d.page_content for d in _docs]
    return ", ".join(_names)
```

```python
create_prompt = {
    "question": RunnablePassthrough(),
    "authors": select_names,
} | base_prompt
```

```python
query_analyzer_select = create_prompt | structured_llm
```

```python
create_prompt.invoke("what are books by jess knight")
```

```output
ChatPromptValue(messages=[SystemMessage(content='Generate a relevant search query for a library system.\n\n`author` attribute MUST be one of:\n\nJesse Knight, Kelly Knight, Scott Knight, Richard Knight, Andrew Knight, Katherine Knight, Erica Knight, Ashley Knight, Becky Knight, Kevin Knight\n\nDo NOT hallucinate author name!'), HumanMessage(content='what are books by jess knight')])
```

```python
query_analyzer_select.invoke("what are books about aliens by jess knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

### चयन के बाद प्रतिस्थापित करें

एक अन्य तरीका यह है कि एलएलएम को जो भी मान भरने दें, लेकिन फिर उस मान को एक मान्य मान में बदल दें।
यह वास्तव में Pydantic वर्ग के साथ किया जा सकता है!

```python
from langchain_core.pydantic_v1 import validator


class Search(BaseModel):
    query: str
    author: str

    @validator("author")
    def double(cls, v: str) -> str:
        return vectorstore.similarity_search(v, k=1)[0].page_content
```

```python
system = """Generate a relevant search query for a library system"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
corrective_structure_llm = llm.with_structured_output(Search)
corrective_query_analyzer = (
    {"question": RunnablePassthrough()} | prompt | corrective_structure_llm
)
```

```python
corrective_query_analyzer.invoke("what are books about aliens by jes knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

```python
# TODO: show trigram similarity
```
