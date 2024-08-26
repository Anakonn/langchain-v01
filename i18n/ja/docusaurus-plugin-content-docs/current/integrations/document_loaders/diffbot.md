---
translated: true
---

# Diffbot

>従来のウェブスクレイピングツールとは異なり、[Diffbot](https://docs.diffbot.com/docs)はページの内容を読み取るためのルールを必要としません。
>コンピュータービジョンから始まり、ページを20種類の可能なタイプのいずれかに分類します。その後、ページのタイプに基づいて主要な属性を識別するよう訓練されたマシンラーニングモデルによって内容が解釈されます。
>その結果、ウェブサイトがアプリケーションで使用できるきれいな構造化データ(JSONやCSVなど)に変換されます。

これは、[Diffbot extract API](https://www.diffbot.com/products/extract/)を使用して一連のURLからHTMLドキュメントを抽出し、後続で使用できるドキュメント形式にする方法について説明しています。

```python
urls = [
    "https://python.langchain.com/en/latest/index.html",
]
```

Diffbot Extract APIにはAPIトークンが必要です。トークンを取得したら、データを抽出できます。

Diffbot APIトークンの取得方法については[instructions](https://docs.diffbot.com/reference/authentication)をお読みください。

```python
import os

from langchain_community.document_loaders import DiffbotLoader

loader = DiffbotLoader(urls=urls, api_token=os.environ.get("DIFFBOT_API_TOKEN"))
```

`.load()`メソッドを使うと、ロードされたドキュメントを確認できます。

```python
loader.load()
```

```output
[Document(page_content='LangChain is a framework for developing applications powered by language models. We believe that the most powerful and differentiated applications will not only call out to a language model via an API, but will also:\nBe data-aware: connect a language model to other sources of data\nBe agentic: allow a language model to interact with its environment\nThe LangChain framework is designed with the above principles in mind.\nThis is the Python specific portion of the documentation. For a purely conceptual guide to LangChain, see here. For the JavaScript documentation, see here.\nGetting Started\nCheckout the below guide for a walkthrough of how to get started using LangChain to create an Language Model application.\nGetting Started Documentation\nModules\nThere are several main modules that LangChain provides support for. For each module we provide some examples to get started, how-to guides, reference docs, and conceptual guides. These modules are, in increasing order of complexity:\nModels: The various model types and model integrations LangChain supports.\nPrompts: This includes prompt management, prompt optimization, and prompt serialization.\nMemory: Memory is the concept of persisting state between calls of a chain/agent. LangChain provides a standard interface for memory, a collection of memory implementations, and examples of chains/agents that use memory.\nIndexes: Language models are often more powerful when combined with your own text data - this module covers best practices for doing exactly that.\nChains: Chains go beyond just a single LLM call, and are sequences of calls (whether to an LLM or a different utility). LangChain provides a standard interface for chains, lots of integrations with other tools, and end-to-end chains for common applications.\nAgents: Agents involve an LLM making decisions about which Actions to take, taking that Action, seeing an Observation, and repeating that until done. LangChain provides a standard interface for agents, a selection of agents to choose from, and examples of end to end agents.\nUse Cases\nThe above modules can be used in a variety of ways. LangChain also provides guidance and assistance in this. Below are some of the common use cases LangChain supports.\nPersonal Assistants: The main LangChain use case. Personal assistants need to take actions, remember interactions, and have knowledge about your data.\nQuestion Answering: The second big LangChain use case. Answering questions over specific documents, only utilizing the information in those documents to construct an answer.\nChatbots: Since language models are good at producing text, that makes them ideal for creating chatbots.\nQuerying Tabular Data: If you want to understand how to use LLMs to query data that is stored in a tabular format (csvs, SQL, dataframes, etc) you should read this page.\nInteracting with APIs: Enabling LLMs to interact with APIs is extremely powerful in order to give them more up-to-date information and allow them to take actions.\nExtraction: Extract structured information from text.\nSummarization: Summarizing longer documents into shorter, more condensed chunks of information. A type of Data Augmented Generation.\nEvaluation: Generative models are notoriously hard to evaluate with traditional metrics. One new way of evaluating them is using language models themselves to do the evaluation. LangChain provides some prompts/chains for assisting in this.\nReference Docs\nAll of LangChain’s reference documentation, in one place. Full documentation on all methods, classes, installation methods, and integration setups for LangChain.\nReference Documentation\nLangChain Ecosystem\nGuides for how other companies/products can be used with LangChain\nLangChain Ecosystem\nAdditional Resources\nAdditional collection of resources we think may be useful as you develop your application!\nLangChainHub: The LangChainHub is a place to share and explore other prompts, chains, and agents.\nGlossary: A glossary of all related terms, papers, methods, etc. Whether implemented in LangChain or not!\nGallery: A collection of our favorite projects that use LangChain. Useful for finding inspiration or seeing how things were done in other applications.\nDeployments: A collection of instructions, code snippets, and template repositories for deploying LangChain apps.\nTracing: A guide on using tracing in LangChain to visualize the execution of chains and agents.\nModel Laboratory: Experimenting with different prompts, models, and chains is a big part of developing the best possible application. The ModelLaboratory makes it easy to do so.\nDiscord: Join us on our Discord to discuss all things LangChain!\nProduction Support: As you move your LangChains into production, we’d love to offer more comprehensive support. Please fill out this form and we’ll set up a dedicated support Slack channel.', metadata={'source': 'https://python.langchain.com/en/latest/index.html'})]
```
