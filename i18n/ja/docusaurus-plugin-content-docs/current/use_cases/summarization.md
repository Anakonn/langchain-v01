---
sidebar_class_name: hidden
title: 要約
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/summarization.ipynb)

## ユースケース

文書(PDFs、Notion ページ、顧客の質問など)のセットがあり、その内容を要約したいとします。

LLMはテキストを理解し、合成する能力に長けているため、この目的に最適なツールです。

このチュートリアルでは、LLMを使用してドキュメントの要約を行う方法を説明します。

![Image description](../../../../../static/img/summarization_use_case_1.png)

## 概要

要約器を構築する際の中心的な問題は、ドキュメントをLLMのコンテキストウィンドウにどのように渡すかということです。一般的なアプローチには以下の2つがあります:

1. `Stuff`: すべてのドキュメントを単一のプロンプトに「詰め込む」方法です。これが最も単純なアプローチです(詳細は[こちら](/docs/modules/chains#lcel-chains)の`create_stuff_documents_chain`コンストラクターを参照してください)。

2. `Map-reduce`: 各ドキュメントを個別に要約する「マップ」ステップと、それらの要約をまとめる「リデュース」ステップを行う方法です(詳細は[こちら](/docs/modules/chains#legacy-chains)の`MapReduceDocumentsChain`を参照してください)。

![Image description](../../../../../static/img/summarization_use_case_2.png)

## クイックスタート

ご紹介したいのは、これらのパイプラインを単一のオブジェクトにラップした`load_summarize_chain`です。

ブログ記事を要約したいとしましょう。数行のコードで実現できます。

まずは環境変数の設定とパッケージのインストールから始めましょう:

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

`chain_type="stuff"`を使うのが特に便利なのは、以下のようなより大きなコンテキストウィンドウを持つモデルを使う場合です:

* 16k トークンの OpenAI `gpt-3.5-turbo-1106`
* 100k トークンの Anthropic [Claude-2](https://www.anthropic.com/index/claude-2)

`chain_type="map_reduce"`や`chain_type="refine"`も指定できます。

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

## オプション1. Stuff

`load_summarize_chain`を`chain_type="stuff"`で使うと、[StuffDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html#langchain.chains.combine_documents.stuff.StuffDocumentsChain)を使用します。

このチェーンはドキュメントのリストを受け取り、それらをすべてプロンプトに挿入し、そのプロンプトをLLMに渡します:

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

素晴らしい! `load_summarize_chain`を使って、先ほどの結果を再現できました。

### さらに深く

* プロンプトをカスタマイズするのは簡単です。
* `llm`パラメーターを使って、さまざまなLLM(例えば[Claude](/docs/integrations/chat/anthropic))を試すこともできます。

## オプション2. Map-Reduce

マップリデュース方式を詳しく見ていきましょう。まず、`LLMChain`を使って各ドキュメントを個別の要約にマッピングします。次に、`ReduceDocumentsChain`を使ってそれらの要約をまとめて単一の全体的な要約を作ります。

まず、各ドキュメントを個別の要約にマッピングするために使用する`LLMChain`を指定します:

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

Prompt Hubを使ってプロンプトを保存・取得することもできます。

これには[LangSmith APIキー](https://docs.smith.langchain.com/)が必要です。

マッピングプロンプトの例は[こちら](https://smith.langchain.com/hub/rlm/map-prompt)にあります。

```python
from langchain import hub

map_prompt = hub.pull("rlm/map-prompt")
map_chain = LLMChain(llm=llm, prompt=map_prompt)
```

`ReduceDocumentsChain`は、ドキュメントのマッピング結果を取り、それらを単一の出力にまとめます。一般的な`CombineDocumentsChain`(例えば`StuffDocumentsChain`)をラップしますが、累積サイズが`token_max`を超えた場合にドキュメントをまとめる機能を追加しています。この例では、ドキュメントの結合にも使用したチェーンを再利用できます。

マッピングされたドキュメントの累積トークン数が4000トークンを超えた場合、`StuffDocumentsChain`に4000トークン未満のバッチでドキュメントを再帰的に渡して、バッチ要約を作成します。そして、それらのバッチ要約の累積が4000トークン未満になったら、最終的な要約を作成するために`StuffDocumentsChain`に渡します。

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

マップとリデュースのチェーンを1つにまとめると:

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

### さらに深く

**カスタマイズ**

* 上記のように、マップとリデュースの段階でLLMやプロンプトをカスタマイズできます。

**実用的なユースケース**

* [このブログ記事](https://blog.langchain.dev/llms-to-improve-documentation/)のケーススタディでは、ユーザーとのやり取り(LangChainドキュメントに関する質問)を分析しています!
* ブログ記事と関連[リポジトリ](https://github.com/mendableai/QA_clustering)では、クラスタリングによる要約方法も紹介しています。
* これにより、`stuff`や`map-reduce`以外の第3の道が検討に値するものになります。

![Image description](../../../../../static/img/summarization_use_case_3.png)

## オプション3. 洗練

[RefineDocumentsChain](/docs/modules/chains#legacy-chains)はマップ・リデュースに似ています:

> リファイン文書チェーンは、入力文書をループし、中間答案を逐次更新することで応答を構築します。各文書について、非文書入力、現在の文書、および最新の中間答案をLLMチェーンに渡して、新しい答案を取得します。

これは、`chain_type="refine"`を指定して簡単に実行できます。

```python
chain = load_summarize_chain(llm, chain_type="refine")
chain.run(split_docs)
```

```output
'The article explores the concept of building autonomous agents powered by large language models (LLMs) and their potential as problem solvers. It discusses different approaches to task decomposition, the integration of self-reflection into LLM-based agents, and the use of external classical planners for long-horizon planning. The new context introduces the Chain of Hindsight (CoH) approach and Algorithm Distillation (AD) for training models to produce better outputs. It also discusses different types of memory and the use of external memory for fast retrieval. The article explores the concept of tool use and introduces the MRKL system and experiments on fine-tuning LLMs to use external tools. It introduces HuggingGPT, a framework that uses ChatGPT as a task planner, and discusses the challenges of using LLM-powered agents in real-world scenarios. The article concludes with case studies on scientific discovery agents and the use of LLM-powered agents in anticancer drug discovery. It also introduces the concept of generative agents that combine LLM with memory, planning, and reflection mechanisms. The conversation samples provided discuss the implementation of a game architecture and the challenges in building LLM-centered agents. The article provides references to related research papers and resources for further exploration.'
```

プロンプトを提供し、中間ステップを返すこともできます。

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

## 単一のチェーンでの分割と要約

便宜上、長文書の文章分割と要約を単一の`AnalyzeDocumentsChain`でラップできます。

```python
from langchain.chains import AnalyzeDocumentChain

summarize_document_chain = AnalyzeDocumentChain(
    combine_docs_chain=chain, text_splitter=text_splitter
)
summarize_document_chain.run(docs[0].page_content)
```
