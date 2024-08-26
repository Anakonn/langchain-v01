---
translated: true
---

# एजेंटों का उपयोग करना

यह एक ऐसा एजेंट है जो विशेष रूप से पुनर्प्राप्ति करने के लिए अनुकूलित किया गया है और साथ ही एक वार्तालाप भी कर सकता है।

शुरू करने के लिए, हम उपयोग करना चाहते हैं रिट्रीवर को सेट करेंगे, और फिर इसे एक रिट्रीवर उपकरण में बदल देंगे। अगला, हम इस प्रकार के एजेंट के लिए उच्च स्तरीय निर्माता का उपयोग करेंगे। अंत में, हम घटकों से एक वार्तालाप पुनर्प्राप्ति एजेंट कैसे बनाएं, इसके बारे में चर्चा करेंगे।

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai faiss-cpu
```

## रिट्रीवर

शुरू करने के लिए, हमें एक रिट्रीवर की आवश्यकता है! यहां का कोड मुख्य रूप से केवल उदाहरण कोड है। अपने रिट्रीवर का उपयोग करने और रिट्रीवर उपकरण बनाने के खंड पर जाने के लिए स्वतंत्र महसूस करें।

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
```

```python
retriever = db.as_retriever()
```

## रिट्रीवर उपकरण

अब हमें अपने रिट्रीवर के लिए एक उपकरण बनाना है। मुख्य चीजें जो हमें पास करनी हैं वह रिट्रीवर के लिए एक नाम और एक विवरण हैं। ये दोनों भाषा मॉडल द्वारा उपयोग किए जाएंगे, इसलिए इन्हें सूचनात्मक होना चाहिए।

```python
from langchain.tools.retriever import create_retriever_tool

tool = create_retriever_tool(
    retriever,
    "search_state_of_union",
    "Searches and returns excerpts from the 2022 State of the Union.",
)
tools = [tool]
```

## एजेंट निर्माता

यहां, हम `create_openai_tools_agent` उच्च स्तरीय एपीआई का उपयोग करेंगे एजेंट को बनाने के लिए।

ध्यान दें कि उपकरणों की सूची के अलावा, हमें केवल उपयोग करने के लिए एक भाषा मॉडल पास करने की आवश्यकता है।
इसके तहत, यह एजेंट OpenAI उपकरण-कॉलिंग क्षमताओं का उपयोग कर रहा है, इसलिए हमें एक ChatOpenAI मॉडल का उपयोग करना होगा।

```python
from langchain import hub

prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
```

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

अब हम इसे आज़मा सकते हैं!

```python
result = agent_executor.invoke({"input": "hi, im bob"})
```

```python
result["output"]
```

```output
'Hello Bob! How can I assist you today?'
```

ध्यान दें कि अब यह पुनर्प्राप्ति कर रहा है

```python
result = agent_executor.invoke(
    {
        "input": "what did the president say about ketanji brown jackson in the most recent state of the union?"
    }
)
```

```python
result["output"]
```

```output
"In the most recent state of the union, the President mentioned Kentaji Brown Jackson. The President nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court. The President described Judge Ketanji Brown Jackson as one of our nation's top legal minds who will continue Justice Breyer's legacy of excellence."
```

ध्यान दें कि अनुवर्ती प्रश्न पहले से पुनर्प्राप्त जानकारी के बारे में पूछता है, इसलिए किसी और पुनर्प्राप्ति की आवश्यकता नहीं है।

```python
result = agent_executor.invoke(
    {"input": "how long ago did the president nominate ketanji brown jackson?"}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThe President nominated Judge Ketanji Brown Jackson four days ago.[0m

[1m> Finished chain.[0m
```

```python
result["output"]
```

```output
'The President nominated Judge Ketanji Brown Jackson four days ago.'
```

रिट्रीवर और अन्य उपकरणों के साथ एजेंटों का उपयोग करने के बारे में अधिक जानने के लिए, [एजेंट](/docs/modules/agents) खंड पर जाएं।
