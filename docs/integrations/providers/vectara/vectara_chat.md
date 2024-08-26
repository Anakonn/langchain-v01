---
canonical: https://python.langchain.com/v0.1/docs/integrations/providers/vectara/vectara_chat
translated: false
---

# Chat Over Documents with Vectara

# Setup

You will need a Vectara account to use Vectara with LangChain. To get started, use the following steps:
1. [Sign up](https://www.vectara.com/integrations/langchain) for a Vectara account if you don't already have one. Once you have completed your sign up you will have a Vectara customer ID. You can find your customer ID by clicking on your name, on the top-right of the Vectara console window.
2. Within your account you can create one or more corpora. Each corpus represents an area that stores text data upon ingest from input documents. To create a corpus, use the **"Create Corpus"** button. You then provide a name to your corpus as well as a description. Optionally you can define filtering attributes and apply some advanced options. If you click on your created corpus, you can see its name and corpus ID right on the top.
3. Next you'll need to create API keys to access the corpus. Click on the **"Authorization"** tab in the corpus view and then the **"Create API Key"** button. Give your key a name, and choose whether you want query only or query+index for your key. Click "Create" and you now have an active API key. Keep this key confidential.

To use LangChain with Vectara, you'll need to have these three values: customer ID, corpus ID and api_key.
You can provide those to LangChain in two ways:

1. Include in your environment these three variables: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` and `VECTARA_API_KEY`.

> For example, you can set these variables using os.environ and getpass as follows:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Add them to the Vectara vectorstore constructor:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

```python
import os

from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import Vectara
from langchain_openai import OpenAI
```

Load in documents. You can replace this with a loader for whatever type of data you want

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
```

Since we're using Vectara, there's no need to chunk the documents, as that is done automatically in the Vectara platform backend. We just use `from_document()` to upload the text loaded from the file, and directly ingest it into Vectara:

```python
vectara = Vectara.from_documents(documents, embedding=None)
```

We can now create a memory object, which is neccessary to track the inputs/outputs and hold a conversation.

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
```

We now initialize the `ConversationalRetrievalChain`:

```python
openai_api_key = os.environ["OPENAI_API_KEY"]
llm = OpenAI(openai_api_key=openai_api_key, temperature=0)
retriever = vectara.as_retriever()
d = retriever.invoke("What did the president say about Ketanji Brown Jackson", k=2)
print(d)
```

```output
[Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '29486', 'len': '97'}), Document(page_content='Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '1083', 'len': '117'}), Document(page_content='All told, we created 369,000 new manufacturing jobs in America just last year. Powered by people I’ve met like JoJo Burgess, from generations of union steelworkers from Pittsburgh, who’s here with us tonight. As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.” It’s time. \n\nBut with all the bright spots in our economy, record job growth and higher wages, too many families are struggling to keep up with the bills. Inflation is robbing them of the gains they might otherwise feel.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '14257', 'len': '77'}), Document(page_content='This is personal to me and Jill, to Kamala, and to so many of you. Cancer is the #2 cause of death in America–second only to heart disease. Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. Our goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases. More support for patients and families.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '36196', 'len': '122'}), Document(page_content='Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '664', 'len': '68'}), Document(page_content='I understand. \n\nI remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. That’s why one of the first things I did as President was fight to pass the American Rescue Plan. Because people were hurting. We needed to act, and we did.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '8042', 'len': '97'}), Document(page_content='He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '2100', 'len': '42'}), Document(page_content='He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people. From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. Groups of citizens blocking tanks with their bodies.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '788', 'len': '28'}), Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '2053', 'len': '46'}), Document(page_content='A unity agenda for the nation. We can do this. \n\nMy fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy. In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things. We have fought for freedom, expanded liberty, defeated totalitarianism and terror. And built the strongest, freest, and most prosperous nation the world has ever known.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '36968', 'len': '131'})]
```

```python
bot = ConversationalRetrievalChain.from_llm(
    llm, retriever, memory=memory, verbose=False
)
```

And can have a multi-turn conversation with out new bot:

```python
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```

```python
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query})
```

```python
result["answer"]
```

```output
' Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.'
```

## Pass in chat history

In the above example, we used a Memory object to track chat history. We can also just pass it in explicitly. In order to do this, we need to initialize a chain without any memory object.

```python
bot = ConversationalRetrievalChain.from_llm(
    OpenAI(temperature=0), vectara.as_retriever()
)
```

Here's an example of asking a question with no chat history

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```

Here's an example of asking a question with some chat history

```python
chat_history = [(query, result["answer"])]
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
' Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.'
```

## Return Source Documents

You can also easily return source documents from the ConversationalRetrievalChain. This is useful for when you want to inspect what documents were returned.

```python
bot = ConversationalRetrievalChain.from_llm(
    llm, vectara.as_retriever(), return_source_documents=True
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["source_documents"][0]
```

```output
Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '29486', 'len': '97'})
```

## ConversationalRetrievalChain with `map_reduce`

LangChain supports different types of ways to combine document chains with the ConversationalRetrievalChain chain.

```python
from langchain.chains import LLMChain
from langchain.chains.conversational_retrieval.prompts import CONDENSE_QUESTION_PROMPT
from langchain.chains.question_answering import load_qa_chain
```

```python
question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_chain(llm, chain_type="map_reduce")

chain = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    question_generator=question_generator,
    combine_docs_chain=doc_chain,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = chain({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson, who is one of the nation's top legal minds and a former top litigator in private practice."
```

## ConversationalRetrievalChain with Question Answering with sources

You can also use this chain with the question answering with sources chain.

```python
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
```

```python
question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_with_sources_chain(llm, chain_type="map_reduce")

chain = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    question_generator=question_generator,
    combine_docs_chain=doc_chain,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = chain({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice.\nSOURCES: langchain"
```

## ConversationalRetrievalChain with streaming to `stdout`

Output from the chain will be streamed to `stdout` token by token in this example.

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains.conversational_retrieval.prompts import (
    CONDENSE_QUESTION_PROMPT,
    QA_PROMPT,
)
from langchain.chains.llm import LLMChain
from langchain.chains.question_answering import load_qa_chain

# Construct a ConversationalRetrievalChain with a streaming llm for combine docs
# and a separate, non-streaming llm for question generation
llm = OpenAI(temperature=0, openai_api_key=openai_api_key)
streaming_llm = OpenAI(
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
    temperature=0,
    openai_api_key=openai_api_key,
)

question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_chain(streaming_llm, chain_type="stuff", prompt=QA_PROMPT)

bot = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    combine_docs_chain=doc_chain,
    question_generator=question_generator,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```output
 The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence.
```

```python
chat_history = [(query, result["answer"])]
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```output
 Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.
```

## get_chat_history Function

You can also specify a `get_chat_history` function, which can be used to format the chat_history string.

```python
def get_chat_history(inputs) -> str:
    res = []
    for human, ai in inputs:
        res.append(f"Human:{human}\nAI:{ai}")
    return "\n".join(res)


bot = ConversationalRetrievalChain.from_llm(
    llm, vectara.as_retriever(), get_chat_history=get_chat_history
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```