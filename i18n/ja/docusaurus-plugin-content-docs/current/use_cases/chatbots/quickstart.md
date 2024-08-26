---
sidebar_position: 0
translated: true
---

# クイックスタート

[![](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/chatbots.ipynb)

## 概要

LLMを利用したチャットボットの設計と実装の例を紹介します。以下は主なコンポーネントです：

- `チャットモデル`。チャットボットのインターフェースは生のテキストではなくメッセージを中心に構築されており、テキストLLMよりもチャットモデルに適しています。チャットモデルの統合リストは[こちら](/docs/integrations/chat)をご覧ください。LangChainにおけるチャットモデルインターフェースのドキュメントは[こちら](/docs/modules/model_io/chat)をご覧ください。チャットボットには`LLMs`（[こちら](/docs/modules/model_io/llms)参照）も使用できますが、チャットモデルの方が会話のトーンがあり、メッセージインターフェースをネイティブにサポートしています。
- `プロンプトテンプレート`。デフォルトのメッセージ、ユーザー入力、チャット履歴、および（オプションで）追加の取得したコンテキストを組み合わせるプロンプトの作成を簡素化します。
- `チャット履歴`。チャットボットが過去のやり取りを「覚えていて」、フォローアップの質問に答えるときに考慮に入れることができます。詳細は[こちら](/docs/modules/memory/chat_messages/)をご覧ください。
- `リトリーバー`（オプション）。ドメイン固有の最新知識をコンテキストとして使用して応答を強化するチャットボットを作成する場合に役立ちます。取得システムの詳細なドキュメントは[こちら](/docs/modules/data_connection/retrievers)をご覧ください。

これらのコンポーネントをどのように組み合わせて強力な会話型チャットボットを作成するかを説明します。

## クイックスタート

まず、依存関係をインストールし、必要なクレデンシャルを設定しましょう：

```python
%pip install --upgrade --quiet langchain langchain-openai langchain-chroma

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

チャットボットの頭脳となるチャットモデルを初期化しましょう：

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0.2)
```

チャットモデルを呼び出すと、出力は`AIMessage`になります：

```python
from langchain_core.messages import HumanMessage

chat.invoke(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'adore programmer.")
```

モデル自体には状態の概念がありません。例えば、フォローアップの質問をすると：

```python
chat.invoke([HumanMessage(content="What did you just say?")])
```

```output
AIMessage(content='I said, "What did you just say?"')
```

以前の会話のターンを考慮に入れていないため、質問に答えることができません。

これを解決するために、全会話履歴をモデルに渡す必要があります。試してみましょう：

```python
from langchain_core.messages import AIMessage

chat.invoke(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        ),
        AIMessage(content="J'adore la programmation."),
        HumanMessage(content="What did you just say?"),
    ]
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

これで良い応答が得られることがわかります！

これがチャットボットが会話形式でやり取りできる基本的なアイデアです。

## プロンプトテンプレート

フォーマットを少し簡単にするためにプロンプトテンプレートを定義しましょう。これをモデルにパイプで繋ぐことでチェーンを作成できます：

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat
```

上記の`MessagesPlaceholder`は、チェーンの入力として渡されたチャットメッセージを`chat_history`としてプロンプトに直接挿入します。そして、次のようにチェーンを呼び出すことができます：

```python
chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

## メッセージ履歴

チャット履歴を管理するショートカットとして、[`MessageHistory`](/docs/modules/memory/chat_messages/)クラスを使用できます。これはチャットメッセージの保存と読み込みを担当します。多くの内蔵メッセージ履歴統合があり、さまざまなデータベースにメッセージを保存できますが、このクイックスタートではメモリ内のデモメッセージ履歴である`ChatMessageHistory`を使用します。

直接使用する例を示します：

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("hi!")

demo_ephemeral_chat_history.add_ai_message("whats up?")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

これを行うと、保存されたメッセージをチェーンのパラメータとして直接渡すことができます：

```python
demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

response = chain.invoke({"messages": demo_ephemeral_chat_history.messages})

response
```

```output
AIMessage(content='The translation of "I love programming" in French is "J\'adore la programmation."')
```

```python
demo_ephemeral_chat_history.add_ai_message(response)

demo_ephemeral_chat_history.add_user_message("What did you just say?")

chain.invoke({"messages": demo_ephemeral_chat_history.messages})
```

```output
AIMessage(content='I said "J\'adore la programmation," which is the French translation for "I love programming."')
```

これで基本的なチャットボットが完成しました！

このチェーンはモデルの内部知識だけで役立つチャットボットとして機能しますが、ドメイン固有の知識を利用してチャットボットをより焦点を当てたものにするために`retrieval-augmented generation`（RAG）を導入することがよくあります。次にこれを説明します。

## リトリーバー

チャットボットのためにドメイン固有の知識を引き出すために[`Retriever`](/docs/modules/data_connection/retrievers/)を設定して使用できます。これを示すために、上で作成したシンプルなチャットボットを拡張してLangSmithに関する質問に答えられるようにします。

[LangSmithのドキュメント](https://docs.smith.langchain.com/overview)を素材として使用し、後で取得するためにベクトルストアに保存します。この例ではデータソースの解析と保存に関する詳細は省略しますが、[取得システムの作成に関する詳細なドキュメントはこちら](/docs/use_cases/question_answering/)で確認できます。

リトリーバーを設定しましょう。まず、必要なデペンデンシーをインストールします：

```python
%pip install --upgrade --quiet langchain-chroma beautifulsoup4
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

次に、ドキュメントローダーを使用してウェブページからデータを取得します：

```python
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://docs.smith.langchain.com/overview")
data = loader.load()
```

次に、それをLLMのコンテキストウィンドウが処理できる小さなチャンクに分割し、ベクトルデータベースに保存します：

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

次に、それらのチャンクを埋め込み、ベクトルデータベースに保存します：

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
```

最後に、初期化されたベクトルストアからリトリーバーを作成します：

```python
# k is the number of chunks to retrieve
retriever = vectorstore.as_retriever(k=4)

docs = retriever.invoke("how can langsmith help with testing?")

docs
```

```output
[Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

上記のリトリーバーを呼び出すと、LangSmithのドキュメントの一部が返され、チャットボットが質問に答えるためのコンテキストとして使用できる情報が含まれています。

### ドキュメントの扱い

前のプロンプトを修正して、コンテキストとしてドキュメントを受け入れるようにしましょう。[`create_stuff_documents_chain`](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html#langchain.chains.combine_documents.stuff.create_stuff_documents_chain)ヘルパー関数を使用して、入力ドキュメントをすべてプロンプトに「詰め込み」、フォーマットを便利に処理します。[`ChatPromptTemplate.from_messages`](/docs/modules/model_io/prompts/quick_start#chatprompttemplate)メソッドを使用して、チャット履歴メッセージを直接注入する[`MessagesPlaceholder`](/docs/modules/model_io/prompts/quick_start#messagesplaceholder)を含む、モデルに渡したいメッセージ入力をフォーマットします：

```python
from langchain.chains.combine_documents import create_stuff_documents_chain

chat = ChatOpenAI(model="gpt-3.5-turbo-1106")

question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user's questions based on the below context:\n\n{context}",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

document_chain = create_stuff_documents_chain(chat, question_answering_prompt)
```

上記で取得した生のドキュメントを使用してこの`document_chain`を呼び出すことができます：

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("how can langsmith help with testing?")

document_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
        "context": docs,
    }
)
```

```output
'LangSmith can assist with testing by providing the capability to quickly edit examples and add them to datasets. This allows for the expansion of evaluation sets or fine-tuning of a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in the application.'
```

素晴らしい！入力ドキュメントの情報から合成された回答が得られました。

### リトリーバルチェーンの作成

次に、リトリーバーをチェーンに統合しましょう。リトリーバーはユーザーから渡された最後のメッセージに関連する情報を取得する必要があるので、それを抽出して関連するドキュメントを取得し、それを`context`として現在のチェーンに追加します。`context`と以前の`messages`をドキュメントチェーンに渡して最終的な回答を生成します。

また、[`RunnablePassthrough.assign()`](/docs/expression_language/primitives/assign)メソッドを使用して、各呼び出し時に中間ステップを通過させます。以下のようになります：

```python
from typing import Dict

from langchain_core.runnables import RunnablePassthrough


def parse_retriever_input(params: Dict):
    return params["messages"][-1].content


retrieval_chain = RunnablePassthrough.assign(
    context=parse_retriever_input | retriever,
).assign(
    answer=document_chain,
)
```

```python
response = retrieval_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

response
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?')],
 'context': [Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'LangSmith can help with testing in several ways:\n\n1. Dataset Expansion: LangSmith enables quick editing of examples and adding them to datasets, which expands the surface area of evaluation sets. This allows for more comprehensive testing of models and applications.\n\n2. Fine-Tuning Models: LangSmith facilitates the fine-tuning of models for improved quality or reduced costs. This is beneficial for optimizing the performance of models during testing.\n\n3. Monitoring: LangSmith can be used to monitor applications, log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise during testing. This monitoring helps in ensuring the reliability and performance of the application during testing phases.\n\nOverall, LangSmith helps in making testing more rigorous and comprehensive, whether by expanding datasets, fine-tuning models, or monitoring application performance.'}
```

```python
demo_ephemeral_chat_history.add_ai_message(response["answer"])

demo_ephemeral_chat_history.add_user_message("tell me more about that!")

retrieval_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    },
)
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith can help with testing in several ways:\n\n1. Dataset Expansion: LangSmith enables quick editing of examples and adding them to datasets, which expands the surface area of evaluation sets. This allows for more comprehensive testing of models and applications.\n\n2. Fine-Tuning Models: LangSmith facilitates the fine-tuning of models for improved quality or reduced costs. This is beneficial for optimizing the performance of models during testing.\n\n3. Monitoring: LangSmith can be used to monitor applications, log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise during testing. This monitoring helps in ensuring the reliability and performance of the application during testing phases.\n\nOverall, LangSmith helps in making testing more rigorous and comprehensive, whether by expanding datasets, fine-tuning models, or monitoring application performance.'),
  HumanMessage(content='tell me more about that!')],
 'context': [Document(page_content='however, there is still no complete substitute for human review to get the utmost quality and reliability from your application.', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content="against these known issues.Why is this so impactful? When building LLM applications, it’s often common to start without a dataset of any kind. This is part of the power of LLMs! They are amazing zero-shot learners, making it possible to get started as easily as possible. But this can also be a curse -- as you adjust the prompt, you're wandering blind. You don’t have any examples to benchmark your changes against.LangSmith addresses this problem by including an “Add to Dataset” button for each", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='playground. Here, you can modify the prompt and re-run it to observe the resulting changes to the output - as many times as needed!Currently, this feature supports only OpenAI and Anthropic models and works for LLM and Chat Model calls. We plan to extend its functionality to more LLM types, chains, agents, and retrievers in the future.What is the exact sequence of events?\u200bIn complicated chains and agents, it can often be hard to understand what is going on under the hood. What calls are being', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Certainly! LangSmith offers the following capabilities to aid in testing:\n\n1. Dataset Expansion: By allowing quick editing of examples and adding them to datasets, LangSmith enables the expansion of evaluation sets. This is crucial for thorough testing of models and applications, as it broadens the range of scenarios and inputs that can be used to assess performance.\n\n2. Fine-Tuning Models: LangSmith supports the fine-tuning of models to enhance their quality and reduce operational costs. This capability is valuable during testing as it enables the optimization of model performance based on specific testing requirements and objectives.\n\n3. Monitoring: LangSmith provides monitoring features that allow for the logging of traces, visualization of latency and token usage statistics, and troubleshooting of issues as they occur during testing. This real-time monitoring helps in identifying and addressing any issues that may impact the reliability and performance of the application during testing.\n\nBy leveraging these features, LangSmith enhances the testing process by enabling comprehensive dataset expansion, model fine-tuning, and real-time monitoring to ensure the quality and reliability of applications and models.'}
```

良いですね！これでチャットボットは会話形式でドメイン固有の質問に答えることができます。

ちなみに、すべての中間ステップを返したくない場合は、最終的な`.assign()`呼び出しの代わりにパイプで直接ドキュメントチェーンに接続して、次のようにリトリーバルチェーンを定義することができます：

```python
retrieval_chain_with_only_answer = (
    RunnablePassthrough.assign(
        context=parse_retriever_input | retriever,
    )
    | document_chain
)

retrieval_chain_with_only_answer.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    },
)
```

```output
"LangSmith offers the capability to quickly edit examples and add them to datasets, thereby enhancing the scope of evaluation sets. This feature is particularly valuable for testing as it allows for a more thorough assessment of model performance and application behavior.\n\nFurthermore, LangSmith enables the fine-tuning of models to enhance quality and reduce costs, which can significantly impact testing outcomes. By adjusting and refining models, developers can ensure that they are thoroughly tested and optimized for various scenarios and use cases.\n\nAdditionally, LangSmith provides monitoring functionality, allowing users to log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they encounter them during testing. This real-time monitoring and troubleshooting capability contribute to the overall effectiveness and reliability of the testing process.\n\nIn essence, LangSmith's features are designed to improve the quality and reliability of testing by expanding evaluation sets, fine-tuning models, and providing comprehensive monitoring capabilities. These aspects collectively contribute to a more robust and thorough testing process for applications and models."
```

## クエリ変換

ここで最後の最適化について説明します。上記の例では、フォローアップの質問として「それについてもっと教えて！」と尋ねたとき、取得したドキュメントにテストに関する情報が直接含まれていないことに気付くかもしれません。これは「それについてもっと教えて！」をそのままリトリーバーにクエリとして渡しているためです。取得チェーンの出力はまだ問題ありませんが、ドキュメントチェーンの取得チェーンはチャット履歴に基づいて回答を生成できますが、より豊かで情報豊富なドキュメントを取得することができます：

```python
retriever.invoke("how can langsmith help with testing?")
```

```output
[Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

```python
retriever.invoke("tell me more about that!")
```

```output
[Document(page_content='however, there is still no complete substitute for human review to get the utmost quality and reliability from your application.', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content="against these known issues.Why is this so impactful? When building LLM applications, it’s often common to start without a dataset of any kind. This is part of the power of LLMs! They are amazing zero-shot learners, making it possible to get started as easily as possible. But this can also be a curse -- as you adjust the prompt, you're wandering blind. You don’t have any examples to benchmark your changes against.LangSmith addresses this problem by including an “Add to Dataset” button for each", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='playground. Here, you can modify the prompt and re-run it to observe the resulting changes to the output - as many times as needed!Currently, this feature supports only OpenAI and Anthropic models and works for LLM and Chat Model calls. We plan to extend its functionality to more LLM types, chains, agents, and retrievers in the future.What is the exact sequence of events?\u200bIn complicated chains and agents, it can often be hard to understand what is going on under the hood. What calls are being', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

この一般的な問題を解決するために、入力から参照を削除する`クエリ変換`ステップを追加しましょう。次のように古いリトリーバーをラップします：

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableBranch

# We need a prompt that we can pass into an LLM to generate a transformed search query

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0.2)

query_transform_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="messages"),
        (
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
        ),
    ]
)

query_transforming_retriever_chain = RunnableBranch(
    (
        lambda x: len(x.get("messages", [])) == 1,
        # If only one message, then we just pass that message's content to retriever
        (lambda x: x["messages"][-1].content) | retriever,
    ),
    # If messages, then we pass inputs to LLM chain to transform the query, then pass to retriever
    query_transform_prompt | chat | StrOutputParser() | retriever,
).with_config(run_name="chat_retriever_chain")
```

次に、この新しい`query_transforming_retriever_chain`を使用して先ほどのチェーンを再作成します。この新しいチェーンは入力としてdictを受け入れ、リトリーバーに渡す文字列を解析するため、トップレベルで追加の解析を行う必要はありません：

```python
document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

conversational_retrieval_chain = RunnablePassthrough.assign(
    context=query_transforming_retriever_chain,
).assign(
    answer=document_chain,
)

demo_ephemeral_chat_history = ChatMessageHistory()
```

最後に、それを呼び出しましょう！

```python
demo_ephemeral_chat_history.add_user_message("how can langsmith help with testing?")

response = conversational_retrieval_chain.invoke(
    {"messages": demo_ephemeral_chat_history.messages},
)

demo_ephemeral_chat_history.add_ai_message(response["answer"])

response
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith can assist with testing in several ways. It allows you to quickly edit examples and add them to datasets, expanding the range of evaluation sets. This can help in fine-tuning a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in your application. Furthermore, it enables monitoring of your application by logging all traces, visualizing latency and token usage statistics, and troubleshooting specific issues as they arise.')],
 'context': [Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'LangSmith can assist with testing in several ways. It allows you to quickly edit examples and add them to datasets, expanding the range of evaluation sets. This can help in fine-tuning a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in your application. Furthermore, it enables monitoring of your application by logging all traces, visualizing latency and token usage statistics, and troubleshooting specific issues as they arise.'}
```

```python
demo_ephemeral_chat_history.add_user_message("tell me more about that!")

conversational_retrieval_chain.invoke(
    {"messages": demo_ephemeral_chat_history.messages}
)
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith can assist with testing in several ways. It allows you to quickly edit examples and add them to datasets, expanding the range of evaluation sets. This can help in fine-tuning a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in your application. Furthermore, it enables monitoring of your application by logging all traces, visualizing latency and token usage statistics, and troubleshooting specific issues as they arise.'),
  HumanMessage(content='tell me more about that!')],
 'context': [Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Certainly! LangSmith simplifies the process of constructing and editing datasets, which is essential for testing and fine-tuning models. By quickly editing examples and adding them to datasets, you can expand the surface area of your evaluation sets, leading to improved model quality and potentially reduced costs. Additionally, LangSmith provides monitoring capabilities for your application, allowing you to log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. This comprehensive monitoring functionality helps ensure the reliability and performance of your application in production.'}
```

内部で何が起こっているのかを理解するために、[このLangSmithトレース](https://smith.langchain.com/public/42f8993b-7d19-42d3-990a-6608a73c5824/r)は最初の呼び出しを示しています。ユーザーの最初のクエリがリトリーバーに直接渡され、適切なドキュメントが返されることがわかります。

フォローアップの質問に対する呼び出しは、[このLangSmithトレース](https://smith.langchain.com/public/7b463791-868b-42bd-8035-17b471e9c7cd/r)で示されているように、ユーザーの最初の質問をLangSmithでのテストに関連するものに言い換え、より高品質なドキュメントを取得します。

これで会話型の取得が可能なチャットボットが完成しました！

## 次のステップ

あなたは過去のメッセージやドメイン固有の知識を統合して生成できる会話型チャットボットを構築する方法を学びました。これに関して他にも多くの最適化が可能です。詳細については、以下のページを参照してください:

- [メモリ管理](/docs/use_cases/chatbots/memory_management): チャット履歴を自動的に更新するガイドや、長い会話を要約、トリミング、またはその他の方法で修正してボットを集中させる方法を含みます。
- [リトリーバル](/docs/use_cases/chatbots/retrieval): チャットボットで異なるタイプのリトリーバルを使用する方法についての詳細な解説
- [ツールの使用](/docs/use_cases/chatbots/tool_usage): 他のAPIやシステムと連携するツールをチャットボットに使用させる方法
