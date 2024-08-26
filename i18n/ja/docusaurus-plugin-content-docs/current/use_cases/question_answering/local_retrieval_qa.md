---
translated: true
---

# ローカルモデルの使用

[PrivateGPT](https://github.com/imartinez/privateGPT)、[llama.cpp](https://github.com/ggerganov/llama.cpp)、[GPT4All](https://github.com/nomic-ai/gpt4all)、[llamafile](https://github.com/Mozilla-Ocho/llamafile) などのプロジェクトの人気は、LLM をローカルで実行することの重要性を強調しています。

LangChain には、ローカルで実行できる多くのオープンソース LLM との [統合](https://integrations.langchain.com/) があります。

これらの LLM のセットアップ方法については、[こちら](/docs/guides/development/local_llms) を参照してください。

たとえば、ここではローカルの埋め込みとローカルの LLM を使用して `GPT4All` または `LLaMA2` をローカル（例：ラップトップ）で実行する方法を示します。

## ドキュメントの読み込み

まず、ローカルの埋め込みとベクトルストレージに必要なパッケージをインストールします。

```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub gpt4all langchain-chroma
```

例としてドキュメントを読み込み、分割します。

エージェントに関するブログ記事を例として使用します。

```python
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

次に、以下の手順に従って `GPT4All` の埋め込みをローカルにダウンロードします（まだ持っていない場合）。

```python
from langchain_chroma import Chroma
from langchain_community.embeddings import GPT4AllEmbeddings

vectorstore = Chroma.from_documents(documents=all_splits, embedding=GPT4AllEmbeddings())
```

テストの類似性検索がローカルの埋め込みで動作していることを確認します。

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

## モデル

### LLaMA2

注: 新しいバージョンの `llama-cpp-python` は GGUF モデルファイルを使用します（詳細は [こちら](https://github.com/abetlen/llama-cpp-python/pull/633)) を参照）。

既存の GGML モデルがある場合は、GGUF への変換手順について [こちら](/docs/integrations/llms/llamacpp) を参照してください。

または、GGUF 変換モデルをダウンロードすることもできます（例：[こちら](https://huggingface.co/TheBloke))）。

最後に、詳細は [こちら](/docs/guides/development/local_llms) に記載されているように `llama-cpp-python` をインストールします。

```python
%pip install --upgrade --quiet  llama-cpp-python
```

Apple Silicon で GPU を使用するには、[こちら](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md) の手順に従って Metal サポート付きの Python バインディングを使用します。

特に、`conda` が作成した正しい仮想環境（`miniforge3`）を使用していることを確認してください。

例：私の場合：

```shell
conda activate /Users/rlm/miniforge3/envs/llama
```

これが確認できたら：

```python
! CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 /Users/rlm/miniforge3/envs/llama/bin/pip install -U llama-cpp-python --no-cache-dir
```

```python
from langchain_community.llms import LlamaCpp
```

モデルパラメータを [llama.cpp docs](/docs/integrations/llms/llamacpp) に記載されているように設定します。

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

これらは [Metal が適切に有効化された](/docs/integrations/llms/llamacpp) ことを示しています：

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

同様に、`GPT4All` を使用できます。

[GPT4All モデルバイナリをダウンロード](/docs/integrations/llms/gpt4all) します。

[GPT4All](https://gpt4all.io/index.html) の Model Explorer は、モデルを選択してダウンロードするのに最適な方法です。

次に、ダウンロードしたパスを指定します。

例：私の場合、モデルはここにあります：

`/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin`

```python
from langchain_community.llms import GPT4All

gpt4all = GPT4All(
    model="/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin",
    max_tokens=2048,
)
```

### llamafile

ローカルで LLM を実行する最も簡単な方法の 1 つは、[llamafile](https://github.com/Mozilla-Ocho/llamafile) を使用することです。必要なのは次の 3 つの手順だけです：

1) [HuggingFace](https://huggingface.co/models?other=llamafile) から llamafile をダウンロードする
2) ファイルを実行可能にする
3) ファイルを実行する

llamafile は、モデルの重みと [特別にコンパイルされた](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#technical-details) [`llama.cpp`](https://github.com/ggerganov/llama.cpp) のバージョンを 1 つのファイルにバンドルしており、追加の依存関係なしでほとんどのコンピュータで実行できます。また、埋め込み推論サーバーが付属しており、モデルと対話するための [API](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints) を提供します。

以下は、3 つのセットアップ手順すべてを示すシンプルな bash スクリプトです：

```bash
# Download a llamafile from HuggingFace
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Make the file executable. On Windows, instead just rename the file to end in ".exe".
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Start the model server. Listens at http://localhost:8080 by default.
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

上記のセットアップ手順を実行した後、LangChain 経由でモデルと対話できます：

```python
from langchain_community.llms.llamafile import Llamafile

llamafile = Llamafile()

llamafile.invoke("Here is my grandmother's beloved recipe for spaghetti and meatballs:")
```

```output
'\n-1 1/2 (8 oz. Pounds) ground beef, browned and cooked until no longer pink\n-3 cups whole wheat spaghetti\n-4 (10 oz) cans diced tomatoes with garlic and basil\n-2 eggs, beaten\n-1 cup grated parmesan cheese\n-1/2 teaspoon salt\n-1/4 teaspoon black pepper\n-1 cup breadcrumbs (16 oz)\n-2 tablespoons olive oil\n\nInstructions:\n1. Cook spaghetti according to package directions. Drain and set aside.\n2. In a large skillet, brown ground beef over medium heat until no longer pink. Drain any excess grease.\n3. Stir in diced tomatoes with garlic and basil, and season with salt and pepper. Cook for 5 to 7 minutes or until sauce is heated through. Set aside.\n4. In a large bowl, beat eggs with a fork or whisk until fluffy. Add cheese, salt, and black pepper. Set aside.\n5. In another bowl, combine breadcrumbs and olive oil. Dip each spaghetti into the egg mixture and then coat in the breadcrumb mixture. Place on baking sheet lined with parchment paper to prevent sticking. Repeat until all spaghetti are coated.\n6. Heat oven to 375 degrees. Bake for 18 to 20 minutes, or until lightly golden brown.\n7. Serve hot with meatballs and sauce on the side. Enjoy!'
```

## チェーンでの使用

取得したドキュメントとシンプルなプロンプトを渡して、どちらのモデルでも要約チェーンを作成できます。

提供された入力キーの値を使用してプロンプトテンプレートをフォーマットし、フォーマットされた文字列を `GPT4All`、`LLama-V2`、または指定された他の LLM に渡します。

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

## Q&A

LangChain Prompt Hub を使用して、モデル固有のプロンプトを保存および取得することもできます。

デフォルトの RAG プロンプトで試してみましょう。[こちら](https://smith.langchain.com/hub/rlm/rag-prompt)。

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

次に、[LLaMA 用の特定のプロンプト](https://smith.langchain.com/hub/rlm/rag-prompt-llama) で試してみましょう。これには [特別なトークンが含まれています](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)。

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

## 取得による Q&A

ドキュメントを手動で渡す代わりに、ユーザーの質問に基づいてベクトルストアから自動的に取得できます。

これは、QA デフォルトのプロンプト（[こちら](https://github.com/langchain-ai/langchain/blob/275b926cf745b5668d3ea30236635e20e7866442/langchain/chains/retrieval_qa/prompt.py#L4)) に表示）を使用し、vectorDB から取得します。

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
