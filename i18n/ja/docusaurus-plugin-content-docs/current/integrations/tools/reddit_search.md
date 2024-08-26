---
translated: true
---

# Redditの検索

このノートブックでは、Redditの検索ツールの仕組みを学びます。
まず、以下のコマンドでprawをインストールしていることを確認してください:

```python
%pip install --upgrade --quiet  praw
```

次に、適切なAPIキーと環境変数を設定する必要があります。Redditのユーザーアカウントを作成し、資格情報を取得する必要があります。https://www.reddit.comにアクセスして登録し、https://www.reddit.com/prefs/appsにアクセスしてアプリを作成してください。
アプリを作成すると、client_idとclient_secretが取得できます。それらの文字列をclient_idとclient_secretの変数に貼り付けてください。
注意: user_agentには任意の文字列を設定できます。

```python
client_id = ""
client_secret = ""
user_agent = ""
```

```python
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper

search = RedditSearchRun(
    api_wrapper=RedditSearchAPIWrapper(
        reddit_client_id=client_id,
        reddit_client_secret=client_secret,
        reddit_user_agent=user_agent,
    )
)
```

次に、検索クエリを設定します。例えば、検索するサブレディット、返されるポストの数、ソート順などを指定できます。

```python
from langchain_community.tools.reddit_search.tool import RedditSearchSchema

search_params = RedditSearchSchema(
    query="beginner", sort="new", time_filter="week", subreddit="python", limit="2"
)
```

最後に、検索を実行して結果を取得します。

```python
result = search.run(tool_input=search_params.dict())
```

```python
print(result)
```

結果の出力例は以下のとおりです。
注意: サブレディットの最新の投稿によって出力が異なる可能性がありますが、フォーマットは同様です。

> r/pythonで2件の投稿を検索しました:
> 投稿タイトル: 'Setup Github Copilot in Visual Studio Code'
> ユーザー: Feisty-Recording-715
> サブレディット: r/Python:
>                     本文: 🛠️ このチュートリアルは、バージョン管理の理解を深めたい初心者や、Visual Studio CodeでのGitHub設定に関する簡単な参考資料を求める経験豊富な開発者向けです。
>
>🎓 このビデオを視聴すれば、コードベースの管理、他者との共同作業、オープンソースプロジェクトへの貢献を自信を持って行えるようになります。
>
>
>ビデオリンク: https://youtu.be/IdT1BhrSfdo?si=mV7xVpiyuhlD8Zrw
>
>フィードバックをお待ちしています
>                     投稿URL: https://www.reddit.com/r/Python/comments/1823wr7/setup_github_copilot_in_visual_studio_code/
>                     投稿カテゴリ: N/A.
>                     スコア: 0
>
>投稿タイトル: 'A Chinese Checkers game made with pygame and PySide6, with custom bots support'
>ユーザー: HenryChess
>サブレディット: r/Python:
>                     本文: GitHubリンク: https://github.com/henrychess/pygame-chinese-checkers
>
>これが初心者向けか中級者向けかは微妙ですが、私はまだ初心者の範疇だと思うので、初心者向けにフラグを立てています。
>
>これは2~3人用の中国チェッカーズ(別名Sternhalma)ゲームです。私が書いたボットは簡単に倒せるように設計されており、主にゲームロジックのデバッグ用です。ただし、自分でカスタムボットを書くこともできます。GitHubのページにガイドがあります。
>                     投稿URL: https://www.reddit.com/r/Python/comments/181xq0u/a_chinese_checkers_game_made_with_pygame_and/
>                     投稿カテゴリ: N/A.
>                     スコア: 1

## エージェントチェーンを使ったツールの利用

Redditの検索機能は、マルチインプットツールとしても提供されています。ここでは、[ドキュメントの既存のコード](/docs/modules/memory/agent_with_memory)を適応し、ChatOpenAIを使ってメモリ付きのエージェントチェーンを作成します。このエージェントチェーンは、Redditからの情報を引き出し、その投稿を使って後続の入力に応答することができます。

例を実行するには、RedditのAPI アクセス情報と[OpenAI API](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key)からOpenAIキーを取得する必要があります。

```python
# Adapted code from /docs/modules/agents/how_to/sharedmemory_for_tools

from langchain.agents import AgentExecutor, StructuredChatAgent, Tool
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory, ReadOnlySharedMemory
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

# Provide keys for Reddit
client_id = ""
client_secret = ""
user_agent = ""
# Provide key for OpenAI
openai_api_key = ""

template = """This is a conversation between a human and a bot:

{chat_history}

Write a summary of the conversation for {input}:
"""

prompt = PromptTemplate(input_variables=["input", "chat_history"], template=template)
memory = ConversationBufferMemory(memory_key="chat_history")

prefix = """Have a conversation with a human, answering the following questions as best you can. You have access to the following tools:"""
suffix = """Begin!"

{chat_history}
Question: {input}
{agent_scratchpad}"""

tools = [
    RedditSearchRun(
        api_wrapper=RedditSearchAPIWrapper(
            reddit_client_id=client_id,
            reddit_client_secret=client_secret,
            reddit_user_agent=user_agent,
        )
    )
]

prompt = StructuredChatAgent.create_prompt(
    prefix=prefix,
    tools=tools,
    suffix=suffix,
    input_variables=["input", "chat_history", "agent_scratchpad"],
)

llm = ChatOpenAI(temperature=0, openai_api_key=openai_api_key)

llm_chain = LLMChain(llm=llm, prompt=prompt)
agent = StructuredChatAgent(llm_chain=llm_chain, verbose=True, tools=tools)
agent_chain = AgentExecutor.from_agent_and_tools(
    agent=agent, verbose=True, memory=memory, tools=tools
)

# Answering the first prompt requires usage of the Reddit search tool.
agent_chain.run(input="What is the newest post on r/langchain for the week?")
# Answering the subsequent prompt uses memory.
agent_chain.run(input="Who is the author of the post?")
```
