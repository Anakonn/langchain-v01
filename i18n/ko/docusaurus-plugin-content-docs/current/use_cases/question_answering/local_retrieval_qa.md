---
translated: true
---

# 로컬 모델 사용하기

[PrivateGPT](https://github.com/imartinez/privateGPT), [llama.cpp](https://github.com/ggerganov/llama.cpp), [GPT4All](https://github.com/nomic-ai/gpt4all), [llamafile](https://github.com/Mozilla-Ocho/llamafile)와 같은 프로젝트의 인기는 LLM(대규모 언어 모델)을 로컬에서 실행하는 것의 중요성을 강조합니다.

LangChain은 로컬에서 실행할 수 있는 많은 오픈 소스 LLM과 [통합](https://integrations.langchain.com/)되어 있습니다.

이들 LLM에 대한 설정 지침은 [여기](/docs/guides/development/local_llms)에서 확인할 수 있습니다.

예를 들어, 여기서는 로컬 임베딩 및 로컬 LLM을 사용하여 `GPT4All` 또는 `LLaMA2`를 로컬에서 실행하는 방법을 보여줍니다(예: 노트북에서).

## 문서 로딩

먼저, 로컬 임베딩 및 벡터 저장소에 필요한 패키지를 설치합니다.

```python
%pip install --upgrade --quiet langchain langchain-community langchainhub gpt4all langchain-chroma
```

예제 문서를 로드하고 분할합니다.

여기서는 에이전트에 관한 블로그 게시물을 예제로 사용하겠습니다.

```python
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

다음 단계에서는 `GPT4All` 임베딩을 로컬에 다운로드합니다(이미 다운로드하지 않은 경우).

```python
from langchain_chroma import Chroma
from langchain_community.embeddings import GPT4AllEmbeddings

vectorstore = Chroma.from_documents(documents=all_splits, embedding=GPT4AllEmbeddings())
```

로컬 임베딩으로 유사도 검색이 작동하는지 테스트합니다.

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

## 모델

### LLaMA2

참고: 최신 버전의 `llama-cpp-python`은 GGUF 모델 파일을 사용합니다 (자세한 내용은 [여기](https://github.com/abetlen/llama-cpp-python/pull/633)를 참조하세요).

기존 GGML 모델이 있는 경우 GGUF로 변환하는 방법에 대한 지침은 [여기](/docs/integrations/llms/llamacpp)에서 확인하세요.

또는 GGUF로 변환된 모델을 다운로드할 수 있습니다 (예: [여기](https://huggingface.co/TheBloke)).

마지막으로, [여기](/docs/guides/development/local_llms)에 자세히 설명된 대로 `llama-cpp-python`을 설치하세요.

```python
%pip install --upgrade --quiet llama-cpp-python
```

Apple Silicon에서 GPU 사용을 활성화하려면 [여기](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md)에서 Python 바인딩을 `Metal 지원`으로 사용하는 단계를 따르세요.

특히, `conda`가 생성한 올바른 가상 환경(`miniforge3`)을 사용하고 있는지 확인하세요.

예를 들어, 저의 경우:

```
conda activate /Users/rlm/miniforge3/envs/llama
```

이것을 확인한 후:

```python
! CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 /Users/rlm/miniforge3/envs/llama/bin/pip install -U llama-cpp-python --no-cache-dir
```

```python
from langchain_community.llms import LlamaCpp
```

[llama.cpp 문서](/docs/integrations/llms/llamacpp)에 언급된 모델 매개변수를 설정합니다.

```python
n_gpu_layers = 1  # Metal 설정은 1이면 충분합니다.
n_batch = 512  # 1과 n_ctx 사이에서 설정해야 하며, Apple Silicon Chip의 RAM 양을 고려하세요.

# 시스템에 맞는 모델 경로가 올바른지 확인하세요!

llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/llama-2-13b-chat.ggufv3.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    n_ctx=2048,
    f16_kv=True,  # 반드시 True로 설정해야 합니다. 그렇지 않으면 몇 번 호출 후 문제가 발생합니다.
    verbose=True,
)
```

아래와 같은 메시지가 표시되면 [Metal이 제대로 활성화되었음을](docs/integrations/llms/llamacpp) 나타냅니다:

```
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

마찬가지로, `GPT4All`을 사용할 수 있습니다.

[GPT4All 모델 바이너리 다운로드](/docs/integrations/llms/gpt4all).

[GPT4All](https://gpt4all.io/index.html) 웹사이트의 모델 탐색기는 모델을 선택하고 다운로드하는 좋은 방법입니다.

그런 다음 다운로드한 경로를 지정하세요.

예를 들어, 저의 경우 모델은 다음 위치에 있습니다:

`/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin`

```python
from langchain_community.llms import GPT4All

gpt4all = GPT4All(
    model="/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin",
    max_tokens=2048,
)
```

### llamafile

LLM을 로컬에서 실행하는 가장 간단한 방법 중 하나는 [llamafile](https://github.com/Mozilla-Ocho/llamafile)을 사용하는 것입니다. 필요한 작업은 다음과 같습니다:

1. [HuggingFace](https://huggingface.co/models?other=llamafile)에서 llamafile을 다운로드합니다.
2. 파일을 실행 가능하게 만듭니다.
3. 파일을 실행합니다.

llamafiles는 모델 가중치와 [`llama.cpp`](https://github.com/ggerganov/llama.cpp)의 [특별히 컴파일된](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#technical-details) 버전을 하나의 파일로 번들링하여 추가 종속성 없이 대부분의 컴퓨터에서 실행할 수 있습니다. 또한, 모델과 상호 작용할 수 있는 [API](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints)를 제공하는 내장 추론 서버가 포함되어 있습니다.

다음은 모든 설정 단계를 보여주는 간단한 bash 스크립트입니다:

```bash
# HuggingFace에서 llamafile 다운로드

wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# 파일을 실행 가능하게 만듭니다. Windows에서는 파일 이름을 ".exe"로 끝나도록 변경하면 됩니다.

chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# 모델 서버를 시작합니다. 기본적으로 http://localhost:8080에서 대기합니다.

./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

위의 설정 단계를 실행한 후 LangChain을 통해 모델과 상호 작용할 수 있습니다:

```python
from langchain_community.llms.llamafile import Llamafile

llamafile = Llamafile()

llamafile.invoke("Here is my grandmother's beloved recipe for spaghetti and meatballs:")
```

```output
'\n-1 1/2 (8 oz. Pounds) ground beef, browned and cooked until no longer pink\n-3 cups whole wheat spaghetti\n-4 (10 oz) cans diced tomatoes with garlic and basil\n-2 eggs, beaten\n-1 cup grated parmesan cheese\n-1/2 teaspoon salt\n-1/4 teaspoon black pepper\n-1 cup breadcrumbs (16 oz)\n-2 tablespoons olive oil\n\nInstructions:\n1. Cook spaghetti according to package directions. Drain and set aside.\n2. In a large skillet, brown ground beef over medium heat until no longer pink. Drain any excess grease.\n3. Stir in diced tomatoes with garlic and basil, and season with salt and pepper. Cook for 5 to 7 minutes or until sauce is heated through. Set aside.\n4. In a large bowl, beat eggs with a fork or whisk until fluffy. Add cheese, salt, and black pepper. Set aside.\n5. In another bowl, combine breadcrumbs and olive oil. Dip each spaghetti into the egg mixture and then coat in the breadcrumb mixture. Place on baking sheet lined with parchment paper to prevent sticking. Repeat until all spaghetti are coated.\n6. Heat oven to 375 degrees. Bake for 18 to 20 minutes, or until lightly golden brown.\n7. Serve hot with meatballs and sauce on the side. Enjoy!'
```

## 체인에서 사용하기

검색된 문서와 간단한 프롬프트를 전달하여 요약 체인을 만들 수 있습니다.

프롬프트 템플릿은 제공된 입력 키 값을 사용하여 포맷하고, 포맷된 문자열을 `GPT4All`, `LLama-V2` 또는 지정된 다른 LLM에 전달합니다.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

# 프롬프트

prompt = PromptTemplate.from_template(
    "Summarize the main themes in these retrieved docs: {docs}"
)

# 체인

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

chain = {"docs": format_docs} | prompt | llm | StrOutputParser()

# 실행

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

## Q&A

LangChain Prompt Hub을 사용하여 모델별 프롬프트를 저장하고 가져올 수도 있습니다.

기본 RAG 프롬프트를 사용해 보겠습니다. [여기](https://smith.langchain.com/hub/rlm/rag-prompt)를 참조하세요.

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

# 체인

chain = (
    RunnablePassthrough.assign(context=RunnablePick("context") | format_docs)
    | rag_prompt
    | llm
    | StrOutputParser()
)

# 실행

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

이제 [LLaMA 전용 프롬프트](https://smith.langchain.com/hub/rlm/rag-prompt-llama)를 사용해 보겠습니다. 이 프롬프트는 [특수 토큰](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)을 포함하고 있습니다.

```python
# 프롬프트

rag_prompt_llama = hub.pull("rlm/rag-prompt-llama")
rag_prompt_llama.messages
```

```output
ChatPromptTemplate(input_variables=['question', 'context'], output_parser=None, partial_variables={}, messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['question', 'context'], output_parser=None, partial_variables={}, template="[INST]<<SYS>> You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.<</SYS>> \nQuestion: {question} \nContext: {context} \nAnswer: [/INST]", template_format='f-string', validate_template=True), additional_kwargs={})])
```

```python
# 체인

chain = (
    RunnablePassthrough.assign(context=RunnablePick("context") | format_docs)
    | rag_prompt_llama
    | llm
    | StrOutputParser()
)

# 실행

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

## 검색을 통한 Q&A

문서를 수동으로 전달하는 대신 사용자 질문을 기반으로 벡터 스토어에서 자동으로 검색할 수 있습니다.

이것은 QA 기본 프롬프트(여기 [링크](https://github.com/langchain-ai/langchain/blob/275b926cf745b5668d3ea30236635e20e7866442/langchain/chains/retrieval_qa/prompt.py#L4))를 사용하고 vectorDB에서 검색할 것입니다.

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