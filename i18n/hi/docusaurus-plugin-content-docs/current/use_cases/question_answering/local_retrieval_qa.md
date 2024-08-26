---
translated: true
---

# स्थानीय मॉडलों का उपयोग करना

[PrivateGPT](https://github.com/imartinez/privateGPT), [llama.cpp](https://github.com/ggerganov/llama.cpp), [GPT4All](https://github.com/nomic-ai/gpt4all), और [llamafile](https://github.com/Mozilla-Ocho/llamafile) जैसे प्रोजेक्ट्स की लोकप्रियता स्थानीय रूप से LLMs चलाने के महत्व को रेखांकित करती है।

LangChain में कई ओपन-सोर्स LLMs के साथ [इंटीग्रेशन](https://integrations.langchain.com/) हैं जिन्हें स्थानीय रूप से चलाया जा सकता है।

इन LLMs के सेटअप निर्देशों के लिए [यहाँ](/docs/guides/development/local_llms) देखें।

उदाहरण के लिए, यहाँ हम दिखाते हैं कि स्थानीय एम्बेडिंग्स और एक स्थानीय LLM का उपयोग करके `GPT4All` या `LLaMA2` को कैसे स्थानीय रूप से चलाना है (उदा., आपके लैपटॉप पर)।

## दस्तावेज़ लोड करना

पहले, स्थानीय एम्बेडिंग्स और वेक्टर स्टोरेज के लिए आवश्यक पैकेज इंस्टॉल करें।

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub gpt4all langchain-chroma
```

एक उदाहरण दस्तावेज़ लोड करें और विभाजित करें।

हम एजेंट्स पर एक ब्लॉग पोस्ट का उदाहरण के रूप में उपयोग करेंगे।

```python
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

आगे, नीचे दिए गए चरण `GPT4All` एम्बेडिंग्स को स्थानीय रूप से डाउनलोड करेंगे (यदि आपके पास पहले से नहीं हैं)।

```python
from langchain_chroma import Chroma
from langchain_community.embeddings import GPT4AllEmbeddings

vectorstore = Chroma.from_documents(documents=all_splits, embedding=GPT4AllEmbeddings())
```

हमारी स्थानीय एम्बेडिंग्स के साथ समानता खोज का परीक्षण करें।

```python
question = "What are the approaches to Task Decomposition?"
docs = vectorstore.similarity_search(question)
len(docs)
```

```output
4
```

```python
docs[0]
```

```output
Document(page_content='Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', metadata={'description': 'Building agents with LLM (large language model) as its core controller is a cool concept. Several proof-of-concepts demos, such as AutoGPT, GPT-Engineer and BabyAGI, serve as inspiring examples. The potentiality of LLM extends beyond generating well-written copies, stories, essays and programs; it can be framed as a powerful general problem solver.\nAgent System Overview In a LLM-powered autonomous agent system, LLM functions as the agent’s brain, complemented by several key components:', 'language': 'en', 'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'title': "LLM Powered Autonomous Agents | Lil'Log"})
```

## मॉडल

### LLaMA2

नोट: `llama-cpp-python` के नए संस्करण GGUF मॉडल फाइलों का उपयोग करते हैं (देखें [यहाँ](https://github.com/abetlen/llama-cpp-python/pull/633))।

यदि आपके पास एक मौजूदा GGML मॉडल है, तो GGUF में कनवर्जन के लिए निर्देशों के लिए [यहाँ](/docs/integrations/llms/llamacpp) देखें।

और/या, आप एक GGUF कनवर्टेड मॉडल डाउनलोड कर सकते हैं (उदा., [यहाँ से](https://huggingface.co/TheBloke))।

अंत में, जैसा कि विस्तार से [यहाँ](/docs/guides/development/local_llms) नोट किया गया है, `llama-cpp-python` इंस्टॉल करें

```python
%pip install --upgrade --quiet  llama-cpp-python
```

Apple Silicon पर GPU के उपयोग को सक्षम करने के लिए, Python बाइंडिंग का उपयोग करने के लिए [यहाँ](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md) के चरणों का पालन करें `Metal समर्थन के साथ`।

विशेष रूप से, सुनिश्चित करें कि `conda` सही वर्चुअल एनवायरनमेंट का उपयोग कर रहा है जिसे आपने बनाया (`miniforge3`)।

उदाहरण के लिए, मेरे लिए:

```shell
conda activate /Users/rlm/miniforge3/envs/llama
```

इसके पुष्टि के साथ:

```python
! CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 /Users/rlm/miniforge3/envs/llama/bin/pip install -U llama-cpp-python --no-cache-dir
```

```python
from langchain_community.llms import LlamaCpp
```

[llama.cpp डॉक्स](/docs/integrations/llms/llamacpp) में नोट किए गए मॉडल पैरामीटर्स सेट करें।

```python
n_gpu_layers = 1  # Metal set to 1 is enough.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.

# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/llama-2-13b-chat.ggufv3.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    n_ctx=2048,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    verbose=True,
)
```

ध्यान दें कि ये संकेत देते हैं कि [Metal को ठीक से सक्षम किया गया था](/docs/integrations/llms/llamacpp):

```text
ggml_metal_init: allocating
ggml_metal_init: using MPS
```

```python
llm.invoke("Simulate a rap battle between Stephen Colbert and John Oliver")
```

```output
Llama.generate: prefix-match hit

by jonathan

Here's the hypothetical rap battle:

[Stephen Colbert]: Yo, this is Stephen Colbert, known for my comedy show. I'm here to put some sense in your mind, like an enema do-go. Your opponent? A man of laughter and witty quips, John Oliver! Now let's see who gets the most laughs while taking shots at each other

[John Oliver]: Yo, this is John Oliver, known for my own comedy show. I'm here to take your mind on an adventure through wit and humor. But first, allow me to you to our contestant: Stephen Colbert! His show has been around since the '90s, but it's time to see who can out-rap whom

[Stephen Colbert]: You claim to be a witty man, John Oliver, with your British charm and clever remarks. But my knows that I'm America's funnyman! Who's the one taking you? Nobody!

[John Oliver]: Hey Stephen Colbert, don't get too cocky. You may


llama_print_timings:        load time =  4481.74 ms
llama_print_timings:      sample time =   183.05 ms /   256 runs   (    0.72 ms per token,  1398.53 tokens per second)
llama_print_timings: prompt eval time =   456.05 ms /    13 tokens (   35.08 ms per token,    28.51 tokens per second)
llama_print_timings:        eval time =  7375.20 ms /   255 runs   (   28.92 ms per token,    34.58 tokens per second)
llama_print_timings:       total time =  8388.92 ms
```

```output
"by jonathan \n\nHere's the hypothetical rap battle:\n\n[Stephen Colbert]: Yo, this is Stephen Colbert, known for my comedy show. I'm here to put some sense in your mind, like an enema do-go. Your opponent? A man of laughter and witty quips, John Oliver! Now let's see who gets the most laughs while taking shots at each other\n\n[John Oliver]: Yo, this is John Oliver, known for my own comedy show. I'm here to take your mind on an adventure through wit and humor. But first, allow me to you to our contestant: Stephen Colbert! His show has been around since the '90s, but it's time to see who can out-rap whom\n\n[Stephen Colbert]: You claim to be a witty man, John Oliver, with your British charm and clever remarks. But my knows that I'm America's funnyman! Who's the one taking you? Nobody!\n\n[John Oliver]: Hey Stephen Colbert, don't get too cocky. You may"
```

### GPT4All

इसी तरह, हम `GPT4All` का उपयोग कर सकते हैं।

[GPT4All मॉडल बाइनरी डाउनलोड करें](/docs/integrations/llms/gpt4all)।

[GPT4All](https://gpt4all.io/index.html) पर मॉडल एक्सप्लोरर एक मॉडल चुनने और डाउनलोड करने का एक शानदार तरीका है।

फिर, उस पथ को निर्दिष्ट करें जहाँ आपने डाउनलोड किया है।

उदाहरण के लिए, मेरे लिए, मॉडल यहाँ स्थित है:

`/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin`

```python
from langchain_community.llms import GPT4All

gpt4all = GPT4All(
    model="/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin",
    max_tokens=2048,
)
```

### llamafile

स्थानीय रूप से एक LLM चलाने के सबसे सरल तरीकों में से एक है [llamafile](https://github.com/Mozilla-Ocho/llamafile) का उपयोग करना। आपको बस इतना करना है:

1) [HuggingFace](https://huggingface.co/models?other=llamafile) से एक llamafile डाउनलोड करें
2) फ़ाइल को निष्पादन योग्य बनाएं
3) फ़ाइल चलाएं

llamafiles मॉडल वेट्स और [`llama.cpp`](https://github.com/ggerganov/llama.cpp) के एक [विशेष रूप से संकलित](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#technical-details) संस्करण को एकल फ़ाइल में संकलित करते हैं जो बिना किसी अतिरिक्त निर्भरता के अधिकांश कंप्यूटरों पर चल सकती है। वे एक एम्बेडेड इन्फरेंस सर्वर के साथ भी आते हैं जो आपके मॉडल के साथ इंटरैक्ट करने के लिए एक [API](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints) प्रदान करता है।

यहाँ एक सरल बैश स्क्रिप्ट है जो सभी 3 सेटअप चरणों को दिखाती है:

```bash
# Download a llamafile from HuggingFace
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Make the file executable. On Windows, instead just rename the file to end in ".exe".
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Start the model server. Listens at http://localhost:8080 by default.
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

उपरोक्त सेटअप चरणों को चलाने के बाद, आप LangChain के माध्यम से मॉडल के साथ इंटरैक्ट कर सकते हैं:

```python
from langchain_community.llms.llamafile import Llamafile

llamafile = Llamafile()

llamafile.invoke("Here is my grandmother's beloved recipe for spaghetti and meatballs:")
```

```output
'\n-1 1/2 (8 oz. Pounds) ground beef, browned and cooked until no longer pink\n-3 cups whole wheat spaghetti\n-4 (10 oz) cans diced tomatoes with garlic and basil\n-2 eggs, beaten\n-1 cup grated parmesan cheese\n-1/2 teaspoon salt\n-1/4 teaspoon black pepper\n-1 cup breadcrumbs (16 oz)\n-2 tablespoons olive oil\n\nInstructions:\n1. Cook spaghetti according to package directions. Drain and set aside.\n2. In a large skillet, brown ground beef over medium heat until no longer pink. Drain any excess grease.\n3. Stir in diced tomatoes with garlic and basil, and season with salt and pepper. Cook for 5 to 7 minutes or until sauce is heated through. Set aside.\n4. In a large bowl, beat eggs with a fork or whisk until fluffy. Add cheese, salt, and black pepper. Set aside.\n5. In another bowl, combine breadcrumbs and olive oil. Dip each spaghetti into the egg mixture and then coat in the breadcrumb mixture. Place on baking sheet lined with parchment paper to prevent sticking. Repeat until all spaghetti are coated.\n6. Heat oven to 375 degrees. Bake for 18 to 20 minutes, or until lightly golden brown.\n7. Serve hot with meatballs and sauce on the side. Enjoy!'
```

## एक श्रृंखला में उपयोग करना

हम पुनर्प्राप्त किए गए दस्तावेजों और एक सरल प्रॉम्प्ट को पास करके किसी भी मॉडल के साथ एक समरीकरण श्रृंखला बना सकते हैं।

यह प्रॉम्प्ट टेम्प्लेट को प्रदान की गई इनपुट कुंजी मानों का उपयोग करके प्रारूपित करता है और फ़ॉर्मेटेड स्ट्रिंग को `GPT4All`, `LLama-V2`, या किसी अन्य निर्दिष्ट LLM को पास करता है।

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

# Prompt
prompt = PromptTemplate.from_template(
    "Summarize the main themes in these retrieved docs: {docs}"
)


# Chain
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


chain = {"docs": format_docs} | prompt | llm | StrOutputParser()

# Run
question = "What are the approaches to Task Decomposition?"
docs = vectorstore.similarity_search(question)
chain.invoke(docs)
```

```output
Llama.generate: prefix-match hit


Based on the retrieved documents, the main themes are:
1. Task decomposition: The ability to break down complex tasks into smaller subtasks, which can be handled by an LLM or other components of the agent system.
2. LLM as the core controller: The use of a large language model (LLM) as the primary controller of an autonomous agent system, complemented by other key components such as a knowledge graph and a planner.
3. Potentiality of LLM: The idea that LLMs have the potential to be used as powerful general problem solvers, not just for generating well-written copies but also for solving complex tasks and achieving human-like intelligence.
4. Challenges in long-term planning: The challenges in planning over a lengthy history and effectively exploring the solution space, which are important limitations of current LLM-based autonomous agent systems.


llama_print_timings:        load time =  1191.88 ms
llama_print_timings:      sample time =   134.47 ms /   193 runs   (    0.70 ms per token,  1435.25 tokens per second)
llama_print_timings: prompt eval time = 39470.18 ms /  1055 tokens (   37.41 ms per token,    26.73 tokens per second)
llama_print_timings:        eval time =  8090.85 ms /   192 runs   (   42.14 ms per token,    23.73 tokens per second)
llama_print_timings:       total time = 47943.12 ms
```

```output
'\nBased on the retrieved documents, the main themes are:\n1. Task decomposition: The ability to break down complex tasks into smaller subtasks, which can be handled by an LLM or other components of the agent system.\n2. LLM as the core controller: The use of a large language model (LLM) as the primary controller of an autonomous agent system, complemented by other key components such as a knowledge graph and a planner.\n3. Potentiality of LLM: The idea that LLMs have the potential to be used as powerful general problem solvers, not just for generating well-written copies but also for solving complex tasks and achieving human-like intelligence.\n4. Challenges in long-term planning: The challenges in planning over a lengthy history and effectively exploring the solution space, which are important limitations of current LLM-based autonomous agent systems.'
```

## प्रश्न और उत्तर

हम मॉडल-विशिष्ट प्रॉम्प्ट्स को स्टोर और फ़ेच करने के लिए LangChain प्रॉम्प्ट हब का भी उपयोग कर सकते हैं।

चलो एक डिफ़ॉल्ट RAG प्रॉम्प्ट के साथ प्रयास करें, [यहाँ](https://smith.langchain.com/hub/rlm/rag-prompt)।

```python
from langchain import hub

rag_prompt = hub.pull("rlm/rag-prompt")
rag_prompt.messages
```

```output
[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template="You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\nQuestion: {question} \nContext: {context} \nAnswer:"))]
```

```python
from langchain_core.runnables import RunnablePassthrough, RunnablePick

# Chain
chain = (
    RunnablePassthrough.assign(context=RunnablePick("context") | format_docs)
    | rag_prompt
    | llm
    | StrOutputParser()
)

# Run
chain.invoke({"context": docs, "question": question})
```

```output
Llama.generate: prefix-match hit


Task can be done by down a task into smaller subtasks, using simple prompting like "Steps for XYZ." or task-specific like "Write a story outline" for writing a novel.


llama_print_timings:        load time = 11326.20 ms
llama_print_timings:      sample time =    33.03 ms /    47 runs   (    0.70 ms per token,  1422.86 tokens per second)
llama_print_timings: prompt eval time =  1387.31 ms /   242 tokens (    5.73 ms per token,   174.44 tokens per second)
llama_print_timings:        eval time =  1321.62 ms /    46 runs   (   28.73 ms per token,    34.81 tokens per second)
llama_print_timings:       total time =  2801.08 ms
```

```output
{'output_text': '\nTask can be done by down a task into smaller subtasks, using simple prompting like "Steps for XYZ." or task-specific like "Write a story outline" for writing a novel.'}
```

अब, चलो [LLaMA के लिए विशेष रूप से एक प्रॉम्प्ट](https://smith.langchain.com/hub/rlm/rag-prompt-llama) के साथ प्रयास करें, जिसमें [विशेष टोकन्स शामिल हैं](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)।

```python
# Prompt
rag_prompt_llama = hub.pull("rlm/rag-prompt-llama")
rag_prompt_llama.messages
```

```output
ChatPromptTemplate(input_variables=['question', 'context'], output_parser=None, partial_variables={}, messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['question', 'context'], output_parser=None, partial_variables={}, template="[INST]<<SYS>> You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.<</SYS>> \nQuestion: {question} \nContext: {context} \nAnswer: [/INST]", template_format='f-string', validate_template=True), additional_kwargs={})])
```

```python
# Chain
chain = (
    RunnablePassthrough.assign(context=RunnablePick("context") | format_docs)
    | rag_prompt_llama
    | llm
    | StrOutputParser()
)

# Run
chain.invoke({"context": docs, "question": question})
```

```output
Llama.generate: prefix-match hit

  Sure, I'd be happy to help! Based on the context, here are some to task:

1. LLM with simple prompting: This using a large model (LLM) with simple prompts like "Steps for XYZ" or "What are the subgoals for achieving XYZ?" to decompose tasks into smaller steps.
2. Task-specific: Another is to use task-specific, such as "Write a story outline" for writing a novel, to guide the of tasks.
3. Human inputs:, human inputs can be used to supplement the process, in cases where the task a high degree of creativity or expertise.

As fores in long-term and task, one major is that LLMs to adjust plans when faced with errors, making them less robust to humans who learn from trial and error.


llama_print_timings:        load time = 11326.20 ms
llama_print_timings:      sample time =   144.81 ms /   207 runs   (    0.70 ms per token,  1429.47 tokens per second)
llama_print_timings: prompt eval time =  1506.13 ms /   258 tokens (    5.84 ms per token,   171.30 tokens per second)
llama_print_timings:        eval time =  6231.92 ms /   206 runs   (   30.25 ms per token,    33.06 tokens per second)
llama_print_timings:       total time =  8158.41 ms
```

```output
{'output_text': '  Sure, I\'d be happy to help! Based on the context, here are some to task:\n\n1. LLM with simple prompting: This using a large model (LLM) with simple prompts like "Steps for XYZ" or "What are the subgoals for achieving XYZ?" to decompose tasks into smaller steps.\n2. Task-specific: Another is to use task-specific, such as "Write a story outline" for writing a novel, to guide the of tasks.\n3. Human inputs:, human inputs can be used to supplement the process, in cases where the task a high degree of creativity or expertise.\n\nAs fores in long-term and task, one major is that LLMs to adjust plans when faced with errors, making them less robust to humans who learn from trial and error.'}
```

## पुनर्प्राप्ति के साथ प्रश्न और उत्तर

दस्तावेजों को मैन्युअली पास करने के बजाय, हम उपयोगकर्ता प्रश्न के आधार पर उन्हें हमारे वेक्टर स्टोर से स्वचालित रूप से पुनः प्राप्त कर सकते हैं।

यह एक QA डिफ़ॉल्ट प्रॉम्प्ट का उपयोग करेगा (दिखाया गया [यहाँ](https://github.com/langchain-ai/langchain/blob/275b926cf745b5668d3ea30236635e20e7866442/langchain/chains/retrieval_qa/prompt.py#L4))) और वेक्टरDB से पुनः प्राप्त करेगा।

```python
retriever = vectorstore.as_retriever()
qa_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt
    | llm
    | StrOutputParser()
)
```

```python
qa_chain.invoke(question)
```

```output
Llama.generate: prefix-match hit

  Sure! Based on the context, here's my answer to your:

There are several to task,:

1. LLM-based with simple prompting, such as "Steps for XYZ" or "What are the subgoals for achieving XYZ?"
2. Task-specific, like "Write a story outline" for writing a novel.
3. Human inputs to guide the process.

These can be used to decompose complex tasks into smaller, more manageable subtasks, which can help improve the and effectiveness of task. However, long-term and task can being due to the need to plan over a lengthy history and explore the space., LLMs may to adjust plans when faced with errors, making them less robust to human learners who can learn from trial and error.


llama_print_timings:        load time = 11326.20 ms
llama_print_timings:      sample time =   139.20 ms /   200 runs   (    0.70 ms per token,  1436.76 tokens per second)
llama_print_timings: prompt eval time =  1532.26 ms /   258 tokens (    5.94 ms per token,   168.38 tokens per second)
llama_print_timings:        eval time =  5977.62 ms /   199 runs   (   30.04 ms per token,    33.29 tokens per second)
llama_print_timings:       total time =  7916.21 ms
```

```output
{'query': 'What are the approaches to Task Decomposition?',
 'result': '  Sure! Based on the context, here\'s my answer to your:\n\nThere are several to task,:\n\n1. LLM-based with simple prompting, such as "Steps for XYZ" or "What are the subgoals for achieving XYZ?"\n2. Task-specific, like "Write a story outline" for writing a novel.\n3. Human inputs to guide the process.\n\nThese can be used to decompose complex tasks into smaller, more manageable subtasks, which can help improve the and effectiveness of task. However, long-term and task can being due to the need to plan over a lengthy history and explore the space., LLMs may to adjust plans when faced with errors, making them less robust to human learners who can learn from trial and error.'}
```
