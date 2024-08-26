---
translated: true
---

यह नोटबुक एजेंट को संरचित आउटपुट वापस करने के बारे में कवर करता है।
डिफ़ॉल्ट रूप से, अधिकांश एजेंट एक एकल स्ट्रिंग वापस करते हैं।
अक्सर यह उपयोगी हो सकता है कि एजेंट कुछ अधिक संरचित वापस करे।

एक अच्छा उदाहरण इस बात का है कि एक एजेंट को कुछ स्रोतों पर प्रश्न-उत्तर करने का कार्य दिया गया है।
मान लीजिए कि हम चाहते हैं कि एजेंट न केवल उत्तर दे, बल्कि उपयोग किए गए स्रोतों की भी एक सूची दे।
हम फिर चाहते हैं कि हमारा आउटपुट लगभग नीचे दिए गए स्कीमा का पालन करे:

```python
class Response(BaseModel):
    """Final response to the question being asked"""
    answer: str = Field(description = "The final answer to respond to the user")
    sources: List[int] = Field(description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information")
```

इस नोटबुक में हम एक ऐसे एजेंट के बारे में चर्चा करेंगे जिसके पास एक रिट्रीवर टूल है और सही प्रारूप में प्रतिक्रिया देता है।

## रिट्रीवर बनाएं

इस खंड में हम कुछ मॉक डेटा, जिसमें "राज्य का संदेश" संबोधन शामिल है, के ऊपर हमारे रिट्रीवर को बनाने के लिए कुछ सेटअप कार्य करेंगे। महत्वपूर्ण बात यह है कि हम प्रत्येक दस्तावेज़ के मेटाडेटा में एक "page_chunk" टैग जोड़ेंगे। यह केवल कुछ नकली डेटा है जो स्रोत फ़ील्ड को模拟करने के लिए इरादा है। वास्तव में, यह अधिक संभावना है कि यह किसी दस्तावेज़ का URL या पथ होगा।

```python
%pip install -qU langchain langchain-community langchain-openai langchain-chroma
```

```python
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# Load in document to retrieve over
loader = TextLoader("../../state_of_the_union.txt")
documents = loader.load()

# Split document into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# Here is where we add in the fake source information
for i, doc in enumerate(texts):
    doc.metadata["page_chunk"] = i

# Create our retriever
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(texts, embeddings, collection_name="state-of-union")
retriever = vectorstore.as_retriever()
```

## टूल बनाएं

अब हम एजेंट को देने के लिए टूल बनाएंगे। इस मामले में, यह केवल एक है - हमारे रिट्रीवर को लपेटने वाला एक टूल।

```python
from langchain.tools.retriever import create_retriever_tool

retriever_tool = create_retriever_tool(
    retriever,
    "state-of-union-retriever",
    "Query a retriever to get information about state of the union address",
)
```

## प्रतिक्रिया स्कीमा बनाएं

यहां हम प्रतिक्रिया स्कीमा को परिभाषित करेंगे। इस मामले में, हम चाहते हैं कि अंतिम उत्तर में दो फ़ील्ड हों: एक `answer` के लिए और फिर एक `sources` के लिए जो एक सूची है।

```python
from typing import List

from langchain_core.pydantic_v1 import BaseModel, Field


class Response(BaseModel):
    """Final response to the question being asked"""

    answer: str = Field(description="The final answer to respond to the user")
    sources: List[int] = Field(
        description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information"
    )
```

## कस्टम पार्सिंग लॉजिक बनाएं

अब हम कुछ कस्टम पार्सिंग लॉजिक बनाते हैं।
यह कैसे काम करता है, यह है कि हम `Response` स्कीमा को OpenAI LLM को उनके `functions` पैरामीटर के माध्यम से पास करेंगे।
यह उस तरह से समान है जैसे हम एजेंट का उपयोग करने के लिए उपकरण पास करते हैं।

जब `Response` फ़ंक्शन OpenAI द्वारा कॉल किया जाता है, तो हम चाहते हैं कि इसका उपयोग उपयोगकर्ता को प्रतिक्रिया देने के संकेत के रूप में किया जाए।
इसलिए, हमारी पार्सिंग लॉजिक में निम्नलिखित ब्लॉक हैं:

- यदि कोई फ़ंक्शन कॉल नहीं किया जाता है, तो मान लें कि हमें उपयोगकर्ता को प्रतिक्रिया देनी चाहिए, और इसलिए `AgentFinish` वापस करें
- यदि `Response` फ़ंक्शन कॉल किया जाता है, तो उपयोगकर्ता को उस फ़ंक्शन के इनपुट (हमारा संरचित आउटपुट) के साथ प्रतिक्रिया दें, और इसलिए `AgentFinish` वापस करें
- यदि कोई अन्य फ़ंक्शन कॉल किया जाता है, तो उसे एक टूल इन्वोकेशन के रूप में मानें, और इसलिए `AgentActionMessageLog` वापस करें

ध्यान दें कि हम `AgentAction` के बजाय `AgentActionMessageLog` का उपयोग कर रहे हैं क्योंकि यह हमें भविष्य में उपयोग करने के लिए संदेशों का लॉग संलग्न करने देता है।

```python
import json

from langchain_core.agents import AgentActionMessageLog, AgentFinish
```

```python
def parse(output):
    # If no function was invoked, return to user
    if "function_call" not in output.additional_kwargs:
        return AgentFinish(return_values={"output": output.content}, log=output.content)

    # Parse out the function call
    function_call = output.additional_kwargs["function_call"]
    name = function_call["name"]
    inputs = json.loads(function_call["arguments"])

    # If the Response function was invoked, return to the user with the function inputs
    if name == "Response":
        return AgentFinish(return_values=inputs, log=str(function_call))
    # Otherwise, return an agent action
    else:
        return AgentActionMessageLog(
            tool=name, tool_input=inputs, log="", message_log=[output]
        )
```

## एजेंट बनाएं

अब हम इसे एक साथ रख सकते हैं! इस एजेंट के घटक हैं:

- प्रोम्प्ट: उपयोगकर्ता के प्रश्न और फिर `agent_scratchpad` (कोई मध्यवर्ती चरण) के लिए प्लेसहोल्डर के साथ एक सरल प्रोम्प्ट
- टूल: हम LLM के साथ फ़ंक्शन के रूप में टूल और `Response` प्रारूप संलग्न कर सकते हैं
- स्क्रैचपैड प्रारूप: मध्यवर्ती चरणों से `agent_scratchpad` को प्रारूपित करने के लिए, हम मानक `format_to_openai_function_messages` का उपयोग करेंगे। यह मध्यवर्ती चरणों को AIMessages और FunctionMessages के रूप में प्रारूपित करता है।
- आउटपुट पार्सर: हम ऊपर दिए गए अपने कस्टम पार्सर का उपयोग करेंगे ताकि LLM के प्रतिक्रिया को पार्स किया जा सके
- AgentExecutor: हम एजेंट-टूल-एजेंट-टूल... के लूप को चलाने के लिए मानक AgentExecutor का उपयोग करेंगे।

```python
from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

```python
llm = ChatOpenAI(temperature=0)
```

```python
llm_with_tools = llm.bind_functions([retriever_tool, Response])
```

```python
agent = (
    {
        "input": lambda x: x["input"],
        # Format agent scratchpad from intermediate steps
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | parse
)
```

```python
agent_executor = AgentExecutor(tools=[retriever_tool], agent=agent, verbose=True)
```

## एजेंट चलाएं

अब हम एजेंट को चला सकते हैं! ध्यान दें कि यह एक डिक्शनरी के साथ प्रतिक्रिया देता है जिसमें दो कुंजी हैं: `answer` और `sources`

```python
agent_executor.invoke(
    {"input": "what did the president say about ketanji brown jackson"},
    return_only_outputs=True,
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m[0m[36;1m[1;3mTonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.

Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.

Last year COVID-19 kept us apart. This year we are finally together again.

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.

With a duty to one another to the American people to the Constitution.

And with an unwavering resolve that freedom will always triumph over tyranny.

Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated.

He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined.

He met the Ukrainian people.

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.[0m[32;1m[1;3m{'arguments': '{\n"answer": "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation\'s top legal minds who will continue Justice Breyer\'s legacy of excellence.",\n"sources": [6]\n}', 'name': 'Response'}[0m

[1m> Finished chain.[0m
```

```output
{'answer': "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation's top legal minds who will continue Justice Breyer's legacy of excellence.",
 'sources': [6]}
```
