---
translated: true
---

# Vectaraを使ってドキュメントでチャットする

# セットアップ

Vectaraを使用するには、Vectaraアカウントが必要です。始めるには、以下の手順に従ってください:
1. Vectaraアカウントがまだない場合は、[サインアップ](https://www.vectara.com/integrations/langchain)してください。サインアップが完了すると、VectaraのカスタマーIDが取得できます。Vectaraコンソールウィンドウの右上にある自分の名前をクリックすると、カスタマーIDを確認できます。
2. アカウント内で1つ以上のコーパスを作成できます。各コーパスは、入力ドキュメントからテキストデータをインジェストする領域を表します。コーパスを作成するには、**「Create Corpus」**ボタンを使用します。コーパスに名前とディスクリプションを付けます。必要に応じてフィルタリング属性を定義し、高度なオプションを適用することもできます。作成したコーパスをクリックすると、名前とコーパスIDが上部に表示されます。
3. 次に、コーパスにアクセスするためのAPIキーを作成する必要があります。コーパスビューの**「Authorization」**タブをクリックし、**「Create API Key」**ボタンをクリックします。キーに名前を付け、クエリのみまたはクエリ+インデックスのいずれかを選択します。「Create」をクリックすると、有効なAPIキーが作成されます。このキーは機密情報として扱ってください。

LangChainでVectaraを使用するには、以下の3つの値が必要です: customer ID、corpus ID、api_key。
これらの値をLangChainに提供する方法は2つあります:

1. 環境変数 `VECTARA_CUSTOMER_ID`、`VECTARA_CORPUS_ID`、`VECTARA_API_KEY`に設定する。

> 例えば、os.environとgetpassを使って以下のように設定できます:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Vectaraベクトルストアのコンストラクターに追加する:

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

ドキュメントをロードします。これは、ご使用のデータタイプに合わせて変更してください。

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
```

Vectaraを使用しているため、ドキュメントをチャンクする必要はありません。Vectaraプラットフォームのバックエンドで自動的に行われます。ファイルから読み込んだテキストを `from_document()` を使ってアップロードし、Vectaraに直接インジェストします:

```python
vectara = Vectara.from_documents(documents, embedding=None)
```

会話履歴を追跡し、入出力を保持するためのメモリオブジェクトを作成します。

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
```

`ConversationalRetrievalChain`を初期化します:

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

新しいボットと複数回のやり取りができます:

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

## チャット履歴を渡す

上記の例では、Memoryオブジェクトを使ってチャット履歴を追跡しました。履歴を明示的に渡すこともできます。その場合は、メモリオブジェクトを持たないチェーンを初期化する必要があります。

```python
bot = ConversationalRetrievalChain.from_llm(
    OpenAI(temperature=0), vectara.as_retriever()
)
```

チャット履歴なしで質問する例

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

チャット履歴付きで質問する例

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

## ソースドキュメントを返す

ConversationalRetrievalChainから簡単にソースドキュメントを返すこともできます。返されたドキュメントを確認したい場合に便利です。

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

## `map_reduce`を使ったConversationalRetrievalChain

LangChainでは、ドキュメントチェーンとConversationalRetrievalChainを組み合わせる方法がいくつかあります。

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

## ソース付き質問応答とConversationalRetrievalChain

このチェーンを質問応答とソース付きチェーンと組み合わせることもできます。

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

## `stdout`へのストリーミングを使ったConversationalRetrievalChain

このサンプルでは、チェーンからの出力がトークンごとに `stdout` にストリーミングされます。

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

## get_chat_history関数

`get_chat_history`関数を指定して、チャット履歴の文字列フォーマットをカスタマイズすることもできます。

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
