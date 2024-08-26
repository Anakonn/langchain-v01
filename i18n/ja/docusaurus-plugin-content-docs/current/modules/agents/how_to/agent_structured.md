---
translated: true
---

# 構造化された出力の返却

このノートブックでは、エージェントが構造化された出力を返す方法について説明します。
デフォルトでは、ほとんどのエージェントは単一の文字列を返します。
ソースに基づいて質問に答える際に、答えとともに使用したソースのリストを返すことが便利な場合があります。

出力は以下のスキーマに従うものとします:

```python
class Response(BaseModel):
    """Final response to the question being asked"""
    answer: str = Field(description = "The final answer to respond to the user")
    sources: List[int] = Field(description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information")
```

このノートブックでは、リトリーバーツールを持ち、正しい形式で応答するエージェントについて説明します。

## リトリーバーの作成

このセクションでは、「State of the Union」アドレスを含むモックデータ上でリトリーバーを作成するための設定作業を行います。重要なのは、各ドキュメントのメタデータに「page_chunk」タグを追加することです。これは単なるダミーデータで、実際にはドキュメントのURLやパスが使用されます。

```python
%pip install -qU langchain langchain-community langchain-openai langchain-chroma
```

```python
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# Load in document to retrieve over
loader = TextLoader("../../state_of_the_union.txt")
documents = loader.load()

# Split document into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# Here is where we add in the fake source information
for i, doc in enumerate(texts):
    doc.metadata["page_chunk"] = i

# Create our retriever
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(texts, embeddings, collection_name="state-of-union")
retriever = vectorstore.as_retriever()
```

## ツールの作成

次に、エージェントに提供するツールを作成します。今回は1つのツールのみ、リトリーバーをラップしたものです。

```python
from langchain.tools.retriever import create_retriever_tool

retriever_tool = create_retriever_tool(
    retriever,
    "state-of-union-retriever",
    "Query a retriever to get information about state of the union address",
)
```

## レスポンススキーマの作成

ここでは、レスポンススキーマを定義します。今回は、最終的な答えに2つのフィールド、`answer`と`sources`のリストを含めたいと思います。

```python
from typing import List

from langchain_core.pydantic_v1 import BaseModel, Field


class Response(BaseModel):
    """Final response to the question being asked"""

    answer: str = Field(description="The final answer to respond to the user")
    sources: List[int] = Field(
        description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information"
    )
```

## カスタムパーシングロジックの作成

次に、カスタムパーシングロジックを作成します。
これは、OpenAIのLLMに`functions`パラメーターを介して`Response`スキーマを渡すことで機能します。
これは、エージェントが使用するツールを渡す方法と同様です。

`Response`関数が呼び出されたら、ユーザーに応答するためにそれを使用したいと思います。
その他の関数が呼び出された場合は、それをツールの呼び出しとして扱います。

したがって、パーシングロジックには以下のブロックが含まれます:

- 関数が呼び出されない場合は、ユーザーに応答するために使用するレスポンスを返す(`AgentFinish`)
- `Response`関数が呼び出された場合は、その関数への入力(構造化された出力)でユーザーに応答する(`AgentFinish`)
- その他の関数が呼び出された場合は、それをツールの呼び出しとして扱う(`AgentActionMessageLog`)

`AgentActionMessageLog`を使用する理由は、将来的にエージェントプロンプトに再度渡すことができるメッセージログを添付できるためです。

```python
import json

from langchain_core.agents import AgentActionMessageLog, AgentFinish
```

```python
def parse(output):
    # If no function was invoked, return to user
    if "function_call" not in output.additional_kwargs:
        return AgentFinish(return_values={"output": output.content}, log=output.content)

    # Parse out the function call
    function_call = output.additional_kwargs["function_call"]
    name = function_call["name"]
    inputs = json.loads(function_call["arguments"])

    # If the Response function was invoked, return to the user with the function inputs
    if name == "Response":
        return AgentFinish(return_values=inputs, log=str(function_call))
    # Otherwise, return an agent action
    else:
        return AgentActionMessageLog(
            tool=name, tool_input=inputs, log="", message_log=[output]
        )
```

## エージェントの作成

これらのコンポーネントを組み合わせることで、エージェントを作成できます。

- prompt: ユーザーの質問とエージェントのスクラッチパッドを含む簡単なプロンプト
- tools: LLMに関数として添付するツールと`Response`フォーマット
- format scratchpad: 中間ステップの`agent_scratchpad`をフォーマットするために、標準の`format_to_openai_function_messages`を使用
- output parser: 上記のカスタムパーサーを使用してLLMの応答を解析
- AgentExecutor: 標準のAgentExecutorを使用してエージェント-ツール-エージェント-ツールのループを実行

```python
from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

```python
llm = ChatOpenAI(temperature=0)
```

```python
llm_with_tools = llm.bind_functions([retriever_tool, Response])
```

```python
agent = (
    {
        "input": lambda x: x["input"],
        # Format agent scratchpad from intermediate steps
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | parse
)
```

```python
agent_executor = AgentExecutor(tools=[retriever_tool], agent=agent, verbose=True)
```

## エージェントの実行

これでエージェントを実行できます。`answer`と`sources`の2つのキーを持つ辞書が返されることに注目してください。

```python
agent_executor.invoke(
    {"input": "what did the president say about ketanji brown jackson"},
    return_only_outputs=True,
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m[0m[36;1m[1;3mTonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.

Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.

Last year COVID-19 kept us apart. This year we are finally together again.

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.

With a duty to one another to the American people to the Constitution.

And with an unwavering resolve that freedom will always triumph over tyranny.

Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated.

He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined.

He met the Ukrainian people.

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.[0m[32;1m[1;3m{'arguments': '{\n"answer": "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation\'s top legal minds who will continue Justice Breyer\'s legacy of excellence.",\n"sources": [6]\n}', 'name': 'Response'}[0m

[1m> Finished chain.[0m
```

```output
{'answer': "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation's top legal minds who will continue Justice Breyer's legacy of excellence.",
 'sources': [6]}
```
