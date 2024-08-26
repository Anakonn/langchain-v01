---
sidebar_class_name: hidden
title: सारांश
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/summarization.ipynb)

## उपयोग मामला

मान लीजिए आपके पास कुछ दस्तावेज़ (PDF, Notion पृष्ठ, ग्राहक प्रश्न आदि) हैं और आप इनका सारांश बनाना चाहते हैं।

एलएलएम इस काम के लिए बहुत उपयोगी हैं क्योंकि वे पाठ को समझने और संश्लेषित करने में माहिर हैं।

इस वॉकथ्रू में हम एलएलएम का उपयोग करके दस्तावेज़ सारांशीकरण करने के बारे में जानेंगे।

![Image description](../../../../../static/img/summarization_use_case_1.png)

## अवलोकन

एक सारकर्ता बनाने के लिए एक महत्वपूर्ण प्रश्न यह है कि आप अपने दस्तावेज़ों को एलएलएम के संदर्भ विंडो में कैसे पास करें। इसके लिए दो सामान्य दृष्टिकोण हैं:

1. `Stuff`: सभी दस्तावेज़ों को एक ही प्रोम्प्ट में "भरना"। यह सबसे सरल दृष्टिकोण है (अधिक जानकारी के लिए [यहां](/docs/modules/chains#lcel-chains) देखें, जहां `create_stuff_documents_chain` निर्माता का उपयोग किया जाता है)।

2. `Map-reduce`: प्रत्येक दस्तावेज़ का सारांश अलग-अलग "मैप" चरण में बनाएं और फिर "कम" करके अंतिम सारांश बनाएं (अधिक जानकारी के लिए [यहां](/docs/modules/chains#legacy-chains) देखें, जहां `MapReduceDocumentsChain` का उपयोग किया जाता है)।

![Image description](../../../../../static/img/summarization_use_case_2.png)

## त्वरित शुरुआत

आपको एक झलक देने के लिए, इन दोनों पाइपलाइन को एक ही वस्तु में लपेटा जा सकता है: `load_summarize_chain`।

मान लीजिए हम एक ब्लॉग पोस्ट का सारांश बनाना चाहते हैं। हम कुछ ही पंक्तियों में यह बना सकते हैं।

पहले पर्यावरण चर सेट करें और पैकेज इंस्टॉल करें:

```python
%pip install --upgrade --quiet  langchain-openai tiktoken chromadb langchain langchainhub

# Set env var OPENAI_API_KEY or load from a .env file
#
# import os
# os.environ['OPENAI_API_KEY'] = 'sk...'
#
# import dotenv
# dotenv.load_dotenv()
```

हम `chain_type="stuff"` का उपयोग कर सकते हैं, खासकर बड़े संदर्भ विंडो मॉडल का उपयोग करते समय जैसे:

* 16k टोकन OpenAI `gpt-3.5-turbo-1106`
* 100k टोकन Anthropic [Claude-2](https://www.anthropic.com/index/claude-2)

हम `chain_type="map_reduce"` या `chain_type="refine"` भी प्रदान कर सकते हैं।

```python
from langchain.chains.summarize import load_summarize_chain
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
docs = loader.load()

llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-1106")
chain = load_summarize_chain(llm, chain_type="stuff")

chain.run(docs)
```

```output
'The article discusses the concept of building autonomous agents powered by large language models (LLMs). It explores the components of such agents, including planning, memory, and tool use. The article provides case studies and proof-of-concept examples of LLM-powered agents in various domains. It also highlights the challenges and limitations of using LLMs in agent systems.'
```

## विकल्प 1. Stuff

जब हम `load_summarize_chain` का उपयोग `chain_type="stuff"` के साथ करते हैं, तो हम [StuffDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html#langchain.chains.combine_documents.stuff.StuffDocumentsChain) का उपयोग करेंगे।

श्रृंखला दस्तावेज़ों की एक सूची लेगी, उन सभी को एक प्रोम्प्ट में डालेगी, और उस प्रोम्प्ट को एक एलएलएम को पास करेगी:

```python
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain_core.prompts import PromptTemplate

# Define prompt
prompt_template = """Write a concise summary of the following:
"{text}"
CONCISE SUMMARY:"""
prompt = PromptTemplate.from_template(prompt_template)

# Define LLM chain
llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-16k")
llm_chain = LLMChain(llm=llm, prompt=prompt)

# Define StuffDocumentsChain
stuff_chain = StuffDocumentsChain(llm_chain=llm_chain, document_variable_name="text")

docs = loader.load()
print(stuff_chain.run(docs))
```

```output
The article discusses the concept of building autonomous agents powered by large language models (LLMs). It explores the components of such agents, including planning, memory, and tool use. The article provides case studies and proof-of-concept examples of LLM-powered agents in various domains, such as scientific discovery and generative agents simulation. It also highlights the challenges and limitations of using LLMs in agent systems.
```

बढ़िया! हम `load_summarize_chain` का उपयोग करके पहले के परिणाम को दोहरा सकते हैं।

### गहराई में जाएं

* आप आसानी से प्रोम्प्ट को अनुकूलित कर सकते हैं।
* आप आसानी से विभिन्न एलएलएम (उदा., [Claude](/docs/integrations/chat/anthropic)) का परीक्षण कर सकते हैं, `llm` पैरामीटर के माध्यम से।

## विकल्प 2. मैप-कम

आइए मैप-कम दृष्टिकोण को समझें। इसके लिए, हम पहले एक `LLMChain` का उपयोग करके प्रत्येक दस्तावेज़ को एक व्यक्तिगत सारांश में मैप करेंगे। फिर हम एक `ReduceDocumentsChain` का उपयोग करेंगे ताकि इन सारांशों को एक एकल वैश्विक सारांश में संयुक्त किया जा सके।

पहले, हम प्रत्येक दस्तावेज़ को एक व्यक्तिगत सारांश में मैप करने के लिए उपयोग किए जाने वाले LLMChain को निर्दिष्ट करते हैं:

```python
from langchain.chains import MapReduceDocumentsChain, ReduceDocumentsChain
from langchain_text_splitters import CharacterTextSplitter

llm = ChatOpenAI(temperature=0)

# Map
map_template = """The following is a set of documents
{docs}
Based on this list of docs, please identify the main themes
Helpful Answer:"""
map_prompt = PromptTemplate.from_template(map_template)
map_chain = LLMChain(llm=llm, prompt=map_prompt)
```

हम प्रोम्प्ट हब का भी उपयोग कर सकते हैं ताकि प्रोम्प्ट को संग्रहीत और पुनः प्राप्त किया जा सके।

यह आपके [LangSmith API कुंजी](https://docs.smith.langchain.com/) के साथ काम करेगा।

उदाहरण के लिए, मैप प्रोम्प्ट [यहां](https://smith.langchain.com/hub/rlm/map-prompt) देखें।

```python
from langchain import hub

map_prompt = hub.pull("rlm/map-prompt")
map_chain = LLMChain(llm=llm, prompt=map_prompt)
```

`ReduceDocumentsChain` दस्तावेज़ मैपिंग परिणामों को लेकर उन्हें एकल आउटपुट में संकुचित करने का काम करता है। यह एक सामान्य `CombineDocumentsChain` (जैसे `StuffDocumentsChain`) को लपेटता है, लेकिन `token_max` से अधिक होने पर दस्तावेज़ों को संकुचित करने की क्षमता जोड़ता है। इस उदाहरण में, हम अपने दस्तावेज़ों को संयुक्त करने के लिए उपयोग किए गए श्रृंखला का पुनः उपयोग कर सकते हैं।

इसलिए, यदि हमारे मैप किए गए दस्तावेज़ों में कुल टोकन संख्या 4000 टोकन से अधिक है, तो हम `StuffDocumentsChain` में < 4000 टोकन वाले दस्तावेज़ों के बैच में पुनः पास करेंगे ताकि बैच सारांश बनाए जा सकें। और जब ये बैच सारांश कुल मिलाकर 4000 टोकन से कम हो जाएं, तो हम उन्हें एक अंतिम बार `StuffDocumentsChain` में पास करेंगे ताकि अंतिम सारांश बनाया जा सके।

```python
# Reduce
reduce_template = """The following is set of summaries:
{docs}
Take these and distill it into a final, consolidated summary of the main themes.
Helpful Answer:"""
reduce_prompt = PromptTemplate.from_template(reduce_template)
```

```python
# Note we can also get this from the prompt hub, as noted above
reduce_prompt = hub.pull("rlm/map-prompt")
```

```python
reduce_prompt
```

```output
ChatPromptTemplate(input_variables=['docs'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['docs'], template='The following is a set of documents:\n{docs}\nBased on this list of docs, please identify the main themes \nHelpful Answer:'))])
```

```python
# Run chain
reduce_chain = LLMChain(llm=llm, prompt=reduce_prompt)

# Takes a list of documents, combines them into a single string, and passes this to an LLMChain
combine_documents_chain = StuffDocumentsChain(
    llm_chain=reduce_chain, document_variable_name="docs"
)

# Combines and iteratively reduces the mapped documents
reduce_documents_chain = ReduceDocumentsChain(
    # This is final chain that is called.
    combine_documents_chain=combine_documents_chain,
    # If documents exceed context for `StuffDocumentsChain`
    collapse_documents_chain=combine_documents_chain,
    # The maximum number of tokens to group documents into.
    token_max=4000,
)
```

हमारे मैप और कम श्रृंखलाओं को एक में जोड़ना:

```python
# Combining documents by mapping a chain over them, then combining results
map_reduce_chain = MapReduceDocumentsChain(
    # Map chain
    llm_chain=map_chain,
    # Reduce chain
    reduce_documents_chain=reduce_documents_chain,
    # The variable name in the llm_chain to put the documents in
    document_variable_name="docs",
    # Return the results of the map steps in the output
    return_intermediate_steps=False,
)

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=1000, chunk_overlap=0
)
split_docs = text_splitter.split_documents(docs)
```

```output
Created a chunk of size 1003, which is longer than the specified 1000
```

```python
print(map_reduce_chain.run(split_docs))
```

```output
Based on the list of documents provided, the main themes can be identified as follows:

1. LLM-powered autonomous agents: The documents discuss the concept of building agents with LLM as their core controller and highlight the potential of LLM beyond generating written content. They explore the capabilities of LLM as a general problem solver.

2. Agent system overview: The documents provide an overview of the components that make up a LLM-powered autonomous agent system, including planning, memory, and tool use. Each component is explained in detail, highlighting its role in enhancing the agent's capabilities.

3. Planning: The documents discuss how the agent breaks down large tasks into smaller subgoals and utilizes self-reflection to improve the quality of its actions and results.

4. Memory: The documents explain the importance of both short-term and long-term memory in an agent system. Short-term memory is utilized for in-context learning, while long-term memory allows the agent to retain and recall information over extended periods.

5. Tool use: The documents highlight the agent's ability to call external APIs for additional information and resources that may be missing from its pre-trained model weights. This includes accessing current information, executing code, and retrieving proprietary information.

6. Case studies and proof-of-concept examples: The documents provide examples of how LLM-powered autonomous agents can be applied in various domains, such as scientific discovery and generative agent simulations. These case studies serve as examples of the capabilities and potential applications of such agents.

7. Challenges: The documents acknowledge the challenges associated with building and utilizing LLM-powered autonomous agents, although specific challenges are not mentioned in the given set of documents.

8. Citation and references: The documents include a citation and reference section, indicating that the information presented is based on existing research and sources.

Overall, the main themes in the provided documents revolve around LLM-powered autonomous agents, their components and capabilities, planning, memory, tool use, case studies, and challenges.
```

### गहराई में जाएं

**अनुकूलन**

* ऊपर दिखाए गए तरीके से, आप मैप और कम चरणों के लिए एलएलएम और प्रोम्प्ट को अनुकूलित कर सकते हैं।

**वास्तविक उपयोग मामला**

* [इस ब्लॉग पोस्ट](https://blog.langchain.dev/llms-to-improve-documentation/) में LangChain प्रलेखन के बारे में उपयोक्ता संवादों का विश्लेषण करने का एक मामला अध्ययन देखें!
* ब्लॉग पोस्ट और संबंधित [रेपो](https://github.com/mendableai/QA_clustering) में सारांशीकरण के लिए क्लस्टरिंग का भी परिचय दिया गया है।
* यह `stuff` या `map-reduce` दृष्टिकोणों के अलावा विचारणीय एक तीसरा मार्ग खोलता है।

![Image description](../../../../../static/img/summarization_use_case_3.png)

## विकल्प 3. रिफाइन

[RefineDocumentsChain](/docs/modules/chains#legacy-chains) मैप-रिड्यूस के समान है:

> रिफाइन दस्तावेज़ श्रृंखला एक प्रतिक्रिया का निर्माण करती है जो इनपुट दस्तावेजों पर लूप चलाकर और अपने उत्तर को लगातार अपडेट करके करती है। प्रत्येक दस्तावेज़ के लिए, यह सभी गैर-दस्तावेज़ इनपुट, वर्तमान दस्तावेज़ और नवीनतम मध्यवर्ती उत्तर को एक एलएलएम श्रृंखला में पास करता है ताकि एक नया उत्तर प्राप्त किया जा सके।

इसे `chain_type="refine"` निर्दिष्ट करके आसानी से चलाया जा सकता है।

```python
chain = load_summarize_chain(llm, chain_type="refine")
chain.run(split_docs)
```

```output
'The article explores the concept of building autonomous agents powered by large language models (LLMs) and their potential as problem solvers. It discusses different approaches to task decomposition, the integration of self-reflection into LLM-based agents, and the use of external classical planners for long-horizon planning. The new context introduces the Chain of Hindsight (CoH) approach and Algorithm Distillation (AD) for training models to produce better outputs. It also discusses different types of memory and the use of external memory for fast retrieval. The article explores the concept of tool use and introduces the MRKL system and experiments on fine-tuning LLMs to use external tools. It introduces HuggingGPT, a framework that uses ChatGPT as a task planner, and discusses the challenges of using LLM-powered agents in real-world scenarios. The article concludes with case studies on scientific discovery agents and the use of LLM-powered agents in anticancer drug discovery. It also introduces the concept of generative agents that combine LLM with memory, planning, and reflection mechanisms. The conversation samples provided discuss the implementation of a game architecture and the challenges in building LLM-centered agents. The article provides references to related research papers and resources for further exploration.'
```

एक प्रॉम्प्ट प्रदान करना और मध्यवर्ती चरण वापस लौटाना भी संभव है।

```python
prompt_template = """Write a concise summary of the following:
{text}
CONCISE SUMMARY:"""
prompt = PromptTemplate.from_template(prompt_template)

refine_template = (
    "Your job is to produce a final summary\n"
    "We have provided an existing summary up to a certain point: {existing_answer}\n"
    "We have the opportunity to refine the existing summary"
    "(only if needed) with some more context below.\n"
    "------------\n"
    "{text}\n"
    "------------\n"
    "Given the new context, refine the original summary in Italian"
    "If the context isn't useful, return the original summary."
)
refine_prompt = PromptTemplate.from_template(refine_template)
chain = load_summarize_chain(
    llm=llm,
    chain_type="refine",
    question_prompt=prompt,
    refine_prompt=refine_prompt,
    return_intermediate_steps=True,
    input_key="input_documents",
    output_key="output_text",
)
result = chain({"input_documents": split_docs}, return_only_outputs=True)
```

```python
print(result["output_text"])
```

```output
Il presente articolo discute il concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. Esplora i diversi componenti di un sistema di agenti alimentato da LLM, tra cui la pianificazione, la memoria e l'uso degli strumenti. Dimostrazioni di concetto come AutoGPT mostrano il potenziale di LLM come risolutore generale di problemi. Approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorarsi iterativamente. Tuttavia, ci sono sfide da affrontare, come la limitata capacità di contesto che limita l'inclusione di informazioni storiche dettagliate e la difficoltà di pianificazione a lungo termine e decomposizione delle attività. Inoltre, l'affidabilità dell'interfaccia di linguaggio naturale tra LLM e componenti esterni come la memoria e gli strumenti è incerta, poiché i LLM possono commettere errori di formattazione e mostrare comportamenti ribelli. Nonostante ciò, il sistema AutoGPT viene menzionato come esempio di dimostrazione di concetto che utilizza LLM come controller principale per agenti autonomi. Questo articolo fa riferimento a diverse fonti che esplorano approcci e applicazioni specifiche di LLM nell'ambito degli agenti autonomi.
```

```python
print("\n\n".join(result["intermediate_steps"][:3]))
```

```output
This article discusses the concept of building autonomous agents using LLM (large language model) as the core controller. The article explores the different components of an LLM-powered agent system, including planning, memory, and tool use. It also provides examples of proof-of-concept demos and highlights the potential of LLM as a general problem solver.

Questo articolo discute del concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. L'articolo esplora i diversi componenti di un sistema di agenti alimentato da LLM, inclusa la pianificazione, la memoria e l'uso degli strumenti. Vengono forniti anche esempi di dimostrazioni di proof-of-concept e si evidenzia il potenziale di LLM come risolutore generale di problemi. Inoltre, vengono presentati approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion che consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorare iterativamente.

Questo articolo discute del concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. L'articolo esplora i diversi componenti di un sistema di agenti alimentato da LLM, inclusa la pianificazione, la memoria e l'uso degli strumenti. Vengono forniti anche esempi di dimostrazioni di proof-of-concept e si evidenzia il potenziale di LLM come risolutore generale di problemi. Inoltre, vengono presentati approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion che consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorare iterativamente. Il nuovo contesto riguarda l'approccio Chain of Hindsight (CoH) che permette al modello di migliorare autonomamente i propri output attraverso un processo di apprendimento supervisionato. Viene anche presentato l'approccio Algorithm Distillation (AD) che applica lo stesso concetto alle traiettorie di apprendimento per compiti di reinforcement learning.
```

## एक ही श्रृंखला में विभाजन और सारांश

सुविधा के लिए, हम अपने लंबे दस्तावेज़ के पाठ विभाजन और सारांश को एक ही `AnalyzeDocumentsChain` में लपेट सकते हैं।

```python
from langchain.chains import AnalyzeDocumentChain

summarize_document_chain = AnalyzeDocumentChain(
    combine_docs_chain=chain, text_splitter=text_splitter
)
summarize_document_chain.run(docs[0].page_content)
```
