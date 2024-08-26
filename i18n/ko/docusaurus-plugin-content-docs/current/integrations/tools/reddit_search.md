---
translated: true
---

# Reddit 검색

이 노트북에서는 Reddit 검색 도구의 작동 방식을 배웁니다.
먼저 아래 명령어로 praw를 설치했는지 확인하세요:

```python
%pip install --upgrade --quiet  praw
```

그런 다음 적절한 API 키와 환경 변수를 설정해야 합니다. Reddit 사용자 계정을 만들고 자격 증명을 받아야 합니다. 따라서 https://www.reddit.com에 가서 가입하세요.
그런 다음 https://www.reddit.com/prefs/apps에 가서 앱을 만들어 자격 증명을 받으세요.
앱을 만들면 client_id와 secret을 얻을 수 있습니다. 이제 그 문자열을 client_id와 client_secret 변수에 붙여넣을 수 있습니다.
참고: user_agent에는 아무 문자열이나 입력할 수 있습니다.

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

그런 다음 쿼리를 설정할 수 있습니다. 예를 들어 어떤 subreddit을 쿼리할지, 몇 개의 게시물을 반환할지, 결과를 어떻게 정렬할지 등을 설정할 수 있습니다.

```python
from langchain_community.tools.reddit_search.tool import RedditSearchSchema

search_params = RedditSearchSchema(
    query="beginner", sort="new", time_filter="week", subreddit="python", limit="2"
)
```

마지막으로 검색을 실행하고 결과를 얻습니다.

```python
result = search.run(tool_input=search_params.dict())
```

```python
print(result)
```

결과를 출력하는 예시입니다.
참고: subreddit의 최신 게시물에 따라 출력이 다를 수 있지만 형식은 유사할 것입니다.

> r/python에서 2개의 게시물을 찾았습니다:
> 게시물 제목: 'Setup Github Copilot in Visual Studio Code'
> 사용자: Feisty-Recording-715
> Subreddit: r/Python:
>                     본문: 🛠️ 이 튜토리얼은 버전 관리에 대한 이해를 높이고자 하는 초보자나 Visual Studio Code에서 GitHub 설정에 대한 빠른 참조를 찾는 경험 많은 개발자에게 적합합니다.
>
>🎓 이 동영상을 시청하면 코드베이스를 자신 있게 관리하고, 다른 사람과 협업하며, GitHub의 오픈 소스 프로젝트에 기여할 수 있는 기술을 갖출 수 있습니다.
>
>
>동영상 링크: https://youtu.be/IdT1BhrSfdo?si=mV7xVpiyuhlD8Zrw
>
>피드백은 언제나 환영합니다.
>                     게시물 URL: https://www.reddit.com/r/Python/comments/1823wr7/setup_github_copilot_in_visual_studio_code/
>                     게시물 카테고리: N/A.
>                     점수: 0
>
>게시물 제목: 'A Chinese Checkers game made with pygame and PySide6, with custom bots support'
>사용자: HenryChess
>Subreddit: r/Python:
>                     본문: GitHub 링크: https://github.com/henrychess/pygame-chinese-checkers
>
>이것이 초보자 수준인지 중급자 수준인지 확실하지 않습니다. 아직 초보자 단계라고 생각하므로 초보자 플레이어로 분류했습니다.
>
>이 게임은 2-3명이 즐길 수 있는 Chinese Checkers(또는 Sternhalma)입니다. 제가 작성한 봇은 쉽게 이길 수 있는 수준이며, 주로 게임 로직 부분을 디버깅하기 위해 만들었습니다. 하지만 사용자가 직접 커스텀 봇을 작성할 수 있습니다. GitHub 페이지에 가이드가 있습니다.
>                     게시물 URL: https://www.reddit.com/r/Python/comments/181xq0u/a_chinese_checkers_game_made_with_pygame_and/
>                     게시물 카테고리: N/A.
>                     점수: 1

## 에이전트 체인을 사용한 도구

Reddit 검색 기능은 다중 입력 도구로도 제공됩니다. 이 예에서는 [기존 문서](/docs/modules/memory/agent_with_memory)의 코드를 수정하여 ChatOpenAI를 사용하여 메모리가 있는 에이전트 체인을 만듭니다. 이 에이전트 체인은 Reddit에서 정보를 가져와 이후 입력에 대응할 수 있습니다.

예제를 실행하려면 Reddit API 액세스 정보와 [OpenAI API](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key)에서 받은 OpenAI 키를 추가하세요.

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
