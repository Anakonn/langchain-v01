---
sidebar_position: 1
translated: true
---

# प्रतिस्रोत लौटाना

अक्सर प्रश्न और उत्तर अनुप्रयोगों में यह महत्वपूर्ण होता है कि उपयोगकर्ताओं को वह स्रोत दिखाया जाए जिनका उपयोग उत्तर को जनरेट करने के लिए किया गया था। इसका सबसे सरल तरीका यह है कि श्रृंखला में प्रत्येक जनरेशन में पुनर्प्राप्त किए गए दस्तावेज़ लौटाए जाएं।

हम [एलएलएम पावर्ड ऑटोनोमस एजेंट](https://lilianweng.github.io/posts/2023-06-23-agent/) ब्लॉग पोस्ट द्वारा लिलियन वेंग में निर्मित क्यूएंड ए ऐप पर काम करेंगे, जो [त्वरित शुरुआत](/docs/use_cases/question_answering/quickstart) में है।

## सेटअप

### निर्भरताएं

इस वॉकथ्रू में हम OpenAI चैट मॉडल और एम्बेडिंग और Chroma वेक्टर स्टोर का उपयोग करेंगे, लेकिन यहां दिखाया गया सब कुछ किसी भी [ChatModel](/docs/modules/model_io/chat/) या [LLM](/docs/modules/model_io/llms/), [Embeddings](/docs/modules/data_connection/text_embedding/), और [VectorStore](/docs/modules/data_connection/vectorstores/) या [Retriever](/docs/modules/data_connection/retrievers/) के साथ काम करता है।

हम निम्नलिखित पैकेज का उपयोग करेंगे:

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai langchain-chroma bs4
```

हमें `OPENAI_API_KEY` पर्यावरण चर को सेट करना होगा, जो सीधे या `.env` फ़ाइल से लोड किया जा सकता है:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# import dotenv

# dotenv.load_dotenv()
```

### LangSmith

LangChain के साथ आप जो भी अनुप्रयोग बनाते हैं, उनमें कई चरण और कई LLM कॉल होंगे। जैसे-जैसे ये अनुप्रयोग और अधिक जटिल होते जाते हैं, यह महत्वपूर्ण हो जाता है कि आप अपनी श्रृंखला या एजेंट के अंदर क्या हो रहा है, उसकी जांच कर सकें। ऐसा करने का सबसे अच्छा तरीका [LangSmith](https://smith.langchain.com) है।

ध्यान दें कि LangSmith आवश्यक नहीं है, लेकिन यह उपयोगी है। यदि आप LangSmith का उपयोग करना चाहते हैं, तो लिंक पर साइन अप करने के बाद, ट्रेस लॉगिंग शुरू करने के लिए अपने पर्यावरण चर सेट करना सुनिश्चित करें:

```python
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## स्रोत के बिना श्रृंखला

यह वह क्यूएंड ए ऐप है जिसे हमने [एलएलएम पावर्ड ऑटोनोमस एजेंट](https://lilianweng.github.io/posts/2023-06-23-agent/) ब्लॉग पोस्ट द्वारा लिलियन वेंग में [त्वरित शुरुआत](/docs/use_cases/question_answering/quickstart) में बनाया था:

```python
import bs4
from langchain import hub
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# Load, chunk and index the contents of the blog.
bs_strainer = bs4.SoupStrainer(class_=("post-content", "post-title", "post-header"))
loader = WebBaseLoader(
    web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
    bs_kwargs={"parse_only": bs_strainer},
)
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())

# Retrieve and generate using the relevant snippets of the blog.
retriever = vectorstore.as_retriever()
prompt = hub.pull("rlm/rag-prompt")
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

```python
rag_chain.invoke("What is Task Decomposition?")
```

```output
'Task decomposition is a technique used to break down complex tasks into smaller and simpler steps. It can be done through prompting techniques like Chain of Thought or Tree of Thoughts, or by using task-specific instructions or human inputs. Task decomposition helps agents plan ahead and manage complicated tasks more effectively.'
```

## स्रोत जोड़ना

LCEL के साथ पुनर्प्राप्त दस्तावेज़ लौटाना आसान है:

```python
from langchain_core.runnables import RunnableParallel

rag_chain_from_docs = (
    RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain_with_source = RunnableParallel(
    {"context": retriever, "question": RunnablePassthrough()}
).assign(answer=rag_chain_from_docs)

rag_chain_with_source.invoke("What is Task Decomposition")
```

```output
{'context': [Document(page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'start_index': 1585}),
  Document(page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'start_index': 2192}),
  Document(page_content='The AI assistant can parse user input to several tasks: [{"task": task, "id", task_id, "dep": dependency_task_ids, "args": {"text": text, "image": URL, "audio": URL, "video": URL}}]. The "dep" field denotes the id of the previous task which generates a new resource that the current task relies on. A special tag "-task_id" refers to the generated text image, audio and video in the dependency task with id as task_id. The task MUST be selected from the following options: {{ Available Task List }}. There is a logical relationship between tasks, please note their order. If the user input can\'t be parsed, you need to reply empty JSON. Here are several cases for your reference: {{ Demonstrations }}. The chat history is recorded as {{ Chat History }}. From this chat history, you can find the path of the user-mentioned resources for your task planning.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'start_index': 17804}),
  Document(page_content='Fig. 11. Illustration of how HuggingGPT works. (Image source: Shen et al. 2023)\nThe system comprises of 4 stages:\n(1) Task planning: LLM works as the brain and parses the user requests into multiple tasks. There are four attributes associated with each task: task type, ID, dependencies, and arguments. They use few-shot examples to guide LLM to do task parsing and planning.\nInstruction:', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'start_index': 17414}),
  Document(page_content='Resources:\n1. Internet access for searches and information gathering.\n2. Long Term memory management.\n3. GPT-3.5 powered Agents for delegation of simple tasks.\n4. File output.\n\nPerformance Evaluation:\n1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.\n2. Constructively self-criticize your big-picture behavior constantly.\n3. Reflect on past decisions and strategies to refine your approach.\n4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'start_index': 29630}),
  Document(page_content="(3) Task execution: Expert models execute on the specific tasks and log results.\nInstruction:\n\nWith the input and the inference results, the AI assistant needs to describe the process and results. The previous stages can be formed as - User Input: {{ User Input }}, Task Planning: {{ Tasks }}, Model Selection: {{ Model Assignment }}, Task Execution: {{ Predictions }}. You must first answer the user's request in a straightforward manner. Then describe the task process and show your analysis and model inference results to the user in the first person. If inference results contain a file path, must tell the user the complete file path.", metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'start_index': 19373})],
 'question': 'What is Task Decomposition',
 'answer': 'Task decomposition is a technique used to break down complex tasks into smaller and simpler steps. It involves transforming big tasks into multiple manageable tasks, allowing for a more systematic and organized approach to problem-solving. Thanks for asking!'}
```

:::tip

[LangSmith ट्रेस](https://smith.langchain.com/public/007d7e01-cb62-4a84-8b71-b24767f953ee/r) देखें

:::
