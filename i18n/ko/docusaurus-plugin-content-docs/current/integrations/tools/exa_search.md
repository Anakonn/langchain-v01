---
translated: true
---

# Exa 검색

Exa(이전 Metaphor Search)는 LLM(Large Language Model)에 의해 사용되도록 완전히 설계된 검색 엔진입니다. **자연어 쿼리**를 사용하여 인터넷에서 문서를 검색한 다음 원하는 문서의 **정리된 HTML 콘텐츠**를 검색할 수 있습니다.

키워드 기반 검색(Google)과 달리, Exa의 신경망 검색 기능을 통해 쿼리를 의미론적으로 이해하고 관련 문서를 반환할 수 있습니다. 예를 들어 `"fascinating article about cats"`를 검색하고 [Google](https://www.google.com/search?q=fascinating+article+about+cats)와 [Exa](https://search.exa.ai/search?q=fascinating%20article%20about%20cats&autopromptString=Here%20is%20a%20fascinating%20article%20about%20cats%3A)의 검색 결과를 비교할 수 있습니다. Google은 "fascinating"이라는 키워드를 기반으로 SEO 최적화된 목록을 제공하지만, Exa는 그냥 작동합니다.

이 노트북에서는 LangChain을 사용하여 Exa 검색을 사용하는 방법을 설명합니다.

먼저 Exa API 키를 얻고 환경 변수로 추가하세요. [여기에서 가입](https://dashboard.exa.ai/)하면 월 1000회 무료 검색을 받을 수 있습니다.

```python
import os

os.environ["EXA_API_KEY"] = "..."
```

그리고 통합 패키지를 설치합니다.

```python
%pip install --upgrade --quiet langchain-exa

# and some deps for this notebook
%pip install --upgrade --quiet langchain langchain-openai
```

## ExaSearchRetriever 사용하기

ExaSearchRetriever는 Exa 검색을 사용하여 관련 문서를 검색하는 retriever입니다.

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_exa import ExaSearchRetriever, TextContentsOptions
from langchain_openai import ChatOpenAI

# retrieve 5 documents, with content truncated at 1000 characters
retriever = ExaSearchRetriever(
    k=5, text_contents_options=TextContentsOptions(max_length=200)
)

prompt = PromptTemplate.from_template(
    """Answer the following query based on the following context:
query: {query}
<context>
{context}
</context"""
)

llm = ChatOpenAI()

chain = (
    RunnableParallel({"context": retriever, "query": RunnablePassthrough()})
    | prompt
    | llm
)

chain.invoke("When is the best time to visit japan?")
```

```output
[Result(title='Find Us:', url='https://travelila.com/best-time-to-visit-japan/', id='UFLQGtanQffaDErhngnzgA', score=0.1865834891796112, published_date='2021-01-05', author=None, text='If you are planning to spend your next vacation in Japan, then hold your excitement a bit. It would help if you planned which places you will visit in Japan and the country’s best things. It’s entirel', highlights=None, highlight_scores=None), Result(title='When Is The Best Time of Year To Visit Japan?', url='https://boutiquejapan.com/when-is-the-best-time-of-year-to-visit-japan/', id='70b0IMuaQpshjpBpnwsfUg', score=0.17796635627746582, published_date='2022-09-26', author='Andres Zuleta', text='The good news for travelers is that there is no single best time of year to travel to Japan — yet this makes it hard to decide when to visit, as each season has its own special highlights.When plannin', highlights=None, highlight_scores=None), Result(title='Here is the Best Time to Visit Japan - Cooking Sun', url='https://www.cooking-sun.com/best-time-to-visit-japan/', id='2mh-xvoqGPT-ZRvX9GezNQ', score=0.17497511208057404, published_date='2018-12-17', author='Cooking Sun', text='Japan is a diverse and beautiful country that’s brimming with culture. For some travelers, visiting Japan is a dream come true, since it grazes bucket lists across the globe. One of the best parts abo', highlights=None, highlight_scores=None), Result(title='When to Visit Japan? Bests Times and 2023 Travel Tips', url='https://www.jrailpass.com/blog/when-visit-japan-times', id='KqCnY8fF-nc76n1wNpIo1Q', score=0.17359933257102966, published_date='2020-02-18', author='JRailPass', text='When is the best time to visit Japan? This is a question without a simple answer. Japan is a year-round destination, with interesting activities, attractions, and festivities throughout the year.Your ', highlights=None, highlight_scores=None), Result(title='Complete Guide To Visiting Japan In February 2023: Weather, What To See & Do | LIVE JAPAN travel guide', url='https://livejapan.com/en/article-a0002948/', id='i3nmekOdM8_VBxPfcJmxng', score=0.17215865850448608, published_date='2019-11-13', author='Lucio Maurizi', text='\n \n \n HOME\n Complete Guide To Visiting Japan In February 2023: Weather, What To See & Do\n \n \n \n \n \n \n Date published: 13 November 2019 \n Last updated: 26 January 2021 \n \n \n So you’re planning your tra', highlights=None, highlight_scores=None)]
```

```output
AIMessage(content='Based on the given context, there is no specific best time mentioned to visit Japan. Each season has its own special highlights, and Japan is a year-round destination with interesting activities, attractions, and festivities throughout the year. Therefore, the best time to visit Japan depends on personal preferences and the specific activities or events one wants to experience.')
```

## LangChain Agent Tools로 Exa SDK 사용하기

[Exa SDK](https://docs.exa.ai/)는 Exa API를 사용하여 다음 세 가지 기능을 수행할 수 있는 클라이언트를 만듭니다:
- `search`: 자연어 검색 쿼리를 입력하면 검색 결과 목록을 반환합니다.
- `find_similar`: URL을 입력하면 해당 문서와 유사한 웹페이지의 검색 결과 목록을 반환합니다.
- `get_content`: `search` 또는 `find_similar`에서 가져온 문서 ID 목록을 입력하면 각 문서의 정리된 HTML 콘텐츠를 반환합니다.

`@tool` 데코레이터와 docstring을 사용하여 LangChain Tool 래퍼를 만들어 LLM 에이전트가 Exa를 사용하는 방법을 알려줄 수 있습니다.

```python
%pip install --upgrade --quiet  langchain-exa
```

```python
from exa_py import Exa
from langchain.agents import tool

exa = Exa(api_key=os.environ["EXA_API_KEY"])


@tool
def search(query: str):
    """Search for a webpage based on the query."""
    return exa.search(f"{query}", use_autoprompt=True, num_results=5)


@tool
def find_similar(url: str):
    """Search for webpages similar to a given URL.
    The url passed in should be a URL returned from `search`.
    """
    return exa.find_similar(url, num_results=5)


@tool
def get_contents(ids: list[str]):
    """Get the contents of a webpage.
    The ids passed in should be a list of ids returned from `search`.
    """
    return exa.get_contents(ids)


tools = [search, get_contents, find_similar]
```

### 에이전트에 Exa Tools 제공하기

방금 만든 Exa tools를 LangChain `OpenAIFunctionsAgent`에 제공할 수 있습니다. "고양이에 관한 흥미로운 기사를 요약해 주세요"라고 요청하면 에이전트는 `search` 도구를 사용하여 적절한 검색 쿼리로 Exa 검색을 수행하고, `get_contents` 도구를 사용하여 Exa 콘텐츠 검색을 수행한 다음 검색된 콘텐츠의 요약을 반환합니다.

```python
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

system_message = SystemMessage(
    content="You are a web researcher who answers user questions by looking up information on the internet and retrieving contents of helpful documents. Cite your sources."
)

agent_prompt = OpenAIFunctionsAgent.create_prompt(system_message)
agent = OpenAIFunctionsAgent(llm=llm, tools=tools, prompt=agent_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.run("Summarize for me a fascinating article about cats.")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `search` with `{'query': 'fascinating article about cats'}`


[0m[36;1m[1;3mTitle: How Much Would You Pay to Save Your Cat’s Life?
URL: https://www.theatlantic.com/magazine/archive/2022/12/paying-for-pet-critical-care-cost-health-insurance/671896/
ID: 8uIICapOJD68i8iKEaRfPg
Score: 0.17565323412418365
Published Date: 2022-11-20
Author: Sarah Zhang
Extract: None

Title: How Your Cat Is Making You Crazy
URL: https://www.theatlantic.com/magazine/archive/2012/03/how-your-cat-is-making-you-crazy/308873/
ID: tqgaWIm4JkU9wfINfE-52Q
Score: 0.1744839996099472
Published Date: 2012-02-06
Author: Kathleen McAuliffe
Extract: None

Title: The Feline Mystique
URL: https://www.mcsweeneys.net/articles/the-feline-mystique
ID: wq8uMC5BEjSmvA-NBSCTvQ
Score: 0.17415249347686768
Published Date: 2022-07-19
Author: Kathryn Baecht
Extract: None

Title: How Much Would You Pay to Save Your Cat’s Life?
URL: https://www.theatlantic.com/magazine/archive/2022/12/paying-for-pet-critical-care-cost-health-insurance/671896/?utm%5C_source=pocket-newtab-global-en-GB
ID: wpT7Ee9vkcJyDUHgOelD_w
Score: 0.17202475666999817
Published Date: 2022-11-20
Author: Sarah Zhang
Extract: None

Title: How Much Would You Pay to Save Your Cat’s Life?
URL: https://www.theatlantic.com/magazine/archive/2022/12/paying-for-pet-critical-care-cost-health-insurance/671896/?src=longreads
ID: IkNF5fN0F8B0W_-Boh567A
Score: 0.16996535658836365
Published Date: 2022-11-20
Author: Sarah Zhang
Extract: None

Autoprompt String: Here is a fascinating article about cats:[0m[32;1m[1;3m
Invoking: `get_contents` with `{'ids': ['8uIICapOJD68i8iKEaRfPg']}`


[0m[33;1m[1;3mID: 8uIICapOJD68i8iKEaRfPg
URL: https://www.theatlantic.com/magazine/archive/2022/12/paying-for-pet-critical-care-cost-health-insurance/671896/
Title: How Much Would You Pay to Save Your Cat’s Life?
Extract: <div><article><header><div><div><p>For $15,000, you can get your pet a new kidney.</p><div><address>By <a href="https://www.theatlantic.com/author/sarah-zhang/">Sarah Zhang</a><p>Photographs by Caroline Tompkins for <i>The Atlantic</i></p></address></div></div><div><figure><div></div><figcaption>Sherlock donated a kidney in 2019. (Caroline Tompkins for The Atlantic)</figcaption></figure></div></div></header><section><figure></figure><p><small><i>This article was featured in One Story to Read Today, a newsletter in which our editors recommend a single must-read from </i>The Atlantic<i>, Monday through Friday. </i><a href="https://www.theatlantic.com/newsletters/sign-up/one-story-to-read-today/"><i>Sign up for it here.</i></a><i>      </i></small></p><p>When I first met Strawberry, age 16, she was lying on her back, paws akimbo. Her cat belly was shaved bare, and black stitches ran several inches down her naked pink skin.</p><p>A radiologist squirted ultrasound goop on her abdomen while two veterinary students in dark-blue scrubs gently held down her legs—not that this was really necessary. Strawberry was too tired, too drugged, or simply too out of it from her surgery the previous day to protest. In the dim light of the radiology room, her pupils were dilated into deep black pools. She slowly turned her head toward me. She turned away. She looked around at the small crowd of doctors and students surrounding her, as if to wonder what on God’s green earth had happened for her to end up like this.</p><section><figure><a href="https://www.theatlantic.com/magazine/toc/2022/12/"></a></figure><div><h2>Explore the December 2022 Issue</h2><p>Check out more from this issue and find your next story to read.</p></div><a href="https://www.theatlantic.com/magazine/toc/2022/12/">View More</a></section><p>What had happened was that Strawberry had received a kidney transplant. A surgical team at the University of Georgia had shaved off patches of her long ginger fur, inserting catheters in her leg and neck to deliver the cocktail of drugs she would need during her hospital stay: anesthesia, painkillers, antibiotics, blood thinners, and immunosuppressants. Then a surgeon named Chad Schmiedt carefully cut down the midline of her belly—past the two shriveled kidneys that were no longer doing their job and almost to her groin. Next, he stitched into place a healthy new kidney, freshly retrieved from a living donor just hours earlier.</p><p>Schmiedt is one of only a few surgeons who perform transplants on cats, and is therefore one of the world’s foremost experts at connecting cat kidneys. When he first greeted me with a broad smile and a handshake, I was struck by how his large, callused hand engulfed mine. In the operating room, though, his hands work with microscopic precision, stitching up arteries and veins only millimeters wide. This is the hardest part, he told me, like sewing “wet rice paper.” Once the donor kidney was in place, it flushed pink and Schmiedt closed Strawberry back up. (As in human transplants, the old kidneys can stay in place.) It was then a matter of waiting for her to wake up and pee. She had done both by the time of her ultrasound.</p><p>Not that Strawberry could understand any of this—or that any cat understands why we humans insist on bringing them to vet offices to be poked and prodded by strangers. But without the transplant, she would die of kidney failure, an affliction akin to being gradually poisoned from within. Other treatments could slow her kidney disease, which is common in older cats, but they could not stop it. This is why Strawberry’s owner decided to spend $15,000 on a kidney—a last resort to save her life, or at least extend it.</p><p>I didn’t meet her owner in the hospital that day. Strawberry would need to be hospitalized for at least a week afterAuthor: None[0m[32;1m[1;3mHere is a fascinating article about cats titled "How Much Would You Pay to Save Your Cat’s Life?" by Sarah Zhang. The article discusses the cost of critical care for pets and the lengths that some owners are willing to go to save their cat's life. It highlights a case of a cat named Strawberry who underwent a kidney transplant, a procedure performed by one of the few surgeons who specialize in cat transplants. The article explores the emotional and financial decisions involved in providing life-saving treatments for pets. You can read the full article [here](https://www.theatlantic.com/magazine/archive/2022/12/paying-for-pet-critical-care-cost-health-insurance/671896/).[0m

[1m> Finished chain.[0m
```

```output
'Here is a fascinating article about cats titled "How Much Would You Pay to Save Your Cat’s Life?" by Sarah Zhang. The article discusses the cost of critical care for pets and the lengths that some owners are willing to go to save their cat\'s life. It highlights a case of a cat named Strawberry who underwent a kidney transplant, a procedure performed by one of the few surgeons who specialize in cat transplants. The article explores the emotional and financial decisions involved in providing life-saving treatments for pets. You can read the full article [here](https://www.theatlantic.com/magazine/archive/2022/12/paying-for-pet-critical-care-cost-health-insurance/671896/).'
```

## 고급 Exa 기능

Exa는 도메인과 날짜별 강력한 필터링을 지원합니다. 목적에 따라 필터를 적용하는 것이 유용한 경우 에이전트가 결정할 수 있도록 더 강력한 `search` 도구를 제공할 수 있습니다. Exa의 모든 검색 기능은 [여기](https://github.com/metaphorsystems/metaphor-python/)에서 확인할 수 있습니다.

[//]: # "TODO(erick): switch metaphor github link to exa github link when sdk published"

```python
from exa_py import Exa
from langchain.agents import tool

exa = Exa(api_key=os.environ["Exa_API_KEY"])


@tool
def search(query: str, include_domains=None, start_published_date=None):
    """Search for a webpage based on the query.
    Set the optional include_domains (list[str]) parameter to restrict the search to a list of domains.
    Set the optional start_published_date (str) parameter to restrict the search to documents published after the date (YYYY-MM-DD).
    """
    return exa.search_and_contents(
        f"{query}",
        use_autoprompt=True,
        num_results=5,
        include_domains=include_domains,
        start_published_date=start_published_date,
    )


@tool
def find_similar(url: str):
    """Search for webpages similar to a given URL.
    The url passed in should be a URL returned from `search`.
    """
    return exa.find_similar_and_contents(url, num_results=5)


@tool
def get_contents(ids: list[str]):
    """Get the contents of a webpage.
    The ids passed in should be a list of ids returned from `search`.
    """
    return exa.get_contents(ids)


tools = [search, get_contents, find_similar]
```

이제 에이전트에게 도메인과 게시 날짜 제약 조건으로 기사를 요약하라고 요청합니다. 더 복잡한 도구 사용을 지원하기 위해 GPT-4 에이전트를 사용할 것입니다.

에이전트는 검색 필터를 올바르게 사용하여 원하는 제약 조건을 충족하는 기사를 찾고, 다시 콘텐츠를 검색하여 요약을 반환합니다.

```python
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model="gpt-4")

system_message = SystemMessage(
    content="You are a web researcher who answers user questions by looking up information on the internet and retrieving contents of helpful documents. Cite your sources."
)

agent_prompt = OpenAIFunctionsAgent.create_prompt(system_message)
agent = OpenAIFunctionsAgent(llm=llm, tools=tools, prompt=agent_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.run(
    "Summarize for me an interesting article about AI from lesswrong.com published after October 2023."
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `search` with `{'query': 'AI article', 'include_domains': ['lesswrong.com'], 'start_published_date': '2023-10-01'}`


[0m[36;1m[1;3mTitle: A dialectical view of the history of AI, Part 1: We’re only in the antithesis phase. [A synthesis is in the future.]
URL: https://www.lesswrong.com/posts/K9GP2ZSsugRAGfFns/a-dialectical-view-of-the-history-of-ai-part-1-we-re-only-in
ID: 45-Cs6bdV4_HB8epTO0utg
Score: 0.14216266572475433
Published Date: 2023-11-16
Author: Bill Benzon
Extract: None

Title: Possible OpenAI's Q* breakthrough and DeepMind's AlphaGo-type systems plus LLMs
URL: https://www.lesswrong.com/posts/JnM3EHegiBePeKkLc/possible-openai-s-q-breakthrough-and-deepmind-s-alphago-type
ID: BPJkDFi_bcpo7T19zlj0Ag
Score: 0.13007280230522156
Published Date: 2023-11-23
Author: Burny
Extract: None

Title: Architects of Our Own Demise: We Should Stop Developing AI
URL: https://www.lesswrong.com/posts/bHHrdXwrCj2LRa2sW/architects-of-our-own-demise-we-should-stop-developing-ai
ID: IMLGjczHCLOuoB6w_vemkA
Score: 0.12803198397159576
Published Date: 2023-10-26
Author: Roko
Extract: None

Title: "Benevolent [ie, Ruler] AI is a bad idea" and a suggested alternative
URL: https://www.lesswrong.com/posts/bwL63TrCo4RaHc3WJ/benevolent-ie-ruler-ai-is-a-bad-idea-and-a-suggested
ID: RvRnTH2cpV186d98SFbb9w
Score: 0.12487411499023438
Published Date: 2023-11-19
Author: The Gears
Extract: None

Title: "Benevolent [Ruler] AI is a bad idea" and a suggested alternative
URL: https://www.lesswrong.com/posts/bwL63TrCo4RaHc3WJ/benevolent-ruler-ai-is-a-bad-idea-and-a-suggested
ID: PjwqS66am-duoo_2ueRpQw
Score: 0.12358281761407852
Published Date: 2023-11-19
Author: The Gears
Extract: None

Autoprompt String: Here is an interesting article about AI:[0m[32;1m[1;3m
Invoking: `get_contents` with `{'ids': ['45-Cs6bdV4_HB8epTO0utg']}`


[0m[33;1m[1;3mID: 45-Cs6bdV4_HB8epTO0utg
URL: https://www.lesswrong.com/posts/K9GP2ZSsugRAGfFns/a-dialectical-view-of-the-history-of-ai-part-1-we-re-only-in
Title: A dialectical view of the history of AI, Part 1: We’re only in the antithesis phase. [A synthesis is in the future.]
Extract: <div><div><p><i>Cross-posted </i><a href="https://new-savanna.blogspot.com/2023/11/a-dialectical-view-of-history-of-ai.html"><i>from New Savanna</i></a><i>.</i></p><p>The idea that <a href="https://www.britannica.com/topic/philosophy-of-history/History-as-a-process-of-dialectical-change-Hegel-and-Marx">history proceeds by way of dialectical change</a> is due primarily to Hegel and Marx. While I read bit of both early in my career, I haven’t been deeply influenced by either of them. Nonetheless I find the notion of dialectical change working out through history to be a useful way of thinking about the history of AI. Because it implies that that history is more than just one thing of another.</p><p>This dialectical process is generally schematized as a movement from a thesis, to an antithesis, and finally, to a synthesis on a “higher level,” whatever that is. The technical term is <i>Aufhebung</i>. Wikipedia:</p><blockquote><p>In Hegel, the term <i>Aufhebung</i> has the apparently contradictory implications of both preserving and changing, and eventually advancement (the German verb <i>aufheben</i> means "to cancel", "to keep" and "to pick up"). The tension between these senses suits what Hegel is trying to talk about. In sublation, a term or concept is both preserved and changed through its dialectical interplay with another term or concept. Sublation is the motor by which the dialectic functions.</p></blockquote><p>So, why do I think the history of AI is best conceived in this way? The first era, THESIS, running from the 1950s up through and into the 1980s, was based on top-down deductive <i>symbolic</i> methods. The second era, ANTITHESIS, which began its ascent in the 1990s and now reigns, is based on bottom-up <i>statistical</i> methods. These are conceptually and computationally quite different, opposite, if you will. As for the third era, SYNTHESIS, well, we don’t even know if there will be a third era. Perhaps the second, the current, era will take us <i>all the way</i>, whatever that means. Color me skeptical. I believe there will be a third era, and that it will involve a synthesis of conceptual ideas computational techniques from the previous eras.</p><p>Note, though, that I will be concentrating on efforts to model language. In the first place, that’s what I know best. More importantly, however, it is the work on language that is currently evoking the most fevered speculations about the future of AI.</p><p>Let’s take a look. Find a comfortable chair, adjust the lighting, pour yourself a drink, sit back, relax, and read. This is going to take a while.</p><p><strong>Symbolic AI: Thesis</strong></p><p>The pursuit of artificial intelligence started back in the 1950s it began with certain ideas and certain computational capabilities. The latter were crude and radically underpowered by today’s standards. As for the ideas, we need two more or less independent starting points. One gives us the term “artificial intelligence” (AI), which John McCarthy coined in connection with a conference held at Dartmouth in 1956. The other is associated with the pursuit of machine translation (MT) which, in the United States, meant translating Russian technical documents into English. MT was funded primarily by the Defense Department.</p><p>The goal of MT was practical, relentlessly practical. There was no talk of intelligence and Turing tests and the like. The only thing that mattered was being able to take a Russian text, feed it into a computer, and get out a competent English translation of that text. Promises was made, but little was delivered. The Defense Department pulled the plug on that work in the mid-1960s. Researchers in MT then proceeded to rebrand themselves as investigators ofAuthor: None[0m[32;1m[1;3mThe article titled "A dialectical view of the history of AI, Part 1: We’re only in the antithesis phase. [A synthesis is in the future.]" on LessWrong provides a unique perspective on the evolution of AI. The author, Bill Benzon, uses the concept of dialectical change, primarily attributed to Hegel and Marx, to explain the history of AI.

The dialectical process is described as a movement from a thesis, to an antithesis, and finally, to a synthesis on a higher level. The author applies this concept to AI by identifying three eras. The first era, the THESIS, ran from the 1950s to the 1980s and was based on top-down deductive symbolic methods. The second era, the ANTITHESIS, began in the 1990s and is based on bottom-up statistical methods. These two eras are conceptually and computationally quite different.

As for the third era, the SYNTHESIS, the author speculates that it will involve a synthesis of conceptual ideas and computational techniques from the previous eras. However, it is unclear if this era will occur or if the current era will take us "all the way".

The author also notes that the focus of the article is on efforts to model language, as it is the work on language that is currently evoking the most speculation about the future of AI. The article then delves into the history of symbolic AI, starting from the 1950s when the term "artificial intelligence" was coined by John McCarthy.

The article provides a comprehensive and thought-provoking view on the history and potential future of AI, particularly in the context of language modeling.

Source: [LessWrong](https://www.lesswrong.com/posts/K9GP2ZSsugRAGfFns/a-dialectical-view-of-the-history-of-ai-part-1-we-re-only-in)[0m

[1m> Finished chain.[0m
```

```output
'The article titled "A dialectical view of the history of AI, Part 1: We’re only in the antithesis phase. [A synthesis is in the future.]" on LessWrong provides a unique perspective on the evolution of AI. The author, Bill Benzon, uses the concept of dialectical change, primarily attributed to Hegel and Marx, to explain the history of AI. \n\nThe dialectical process is described as a movement from a thesis, to an antithesis, and finally, to a synthesis on a higher level. The author applies this concept to AI by identifying three eras. The first era, the THESIS, ran from the 1950s to the 1980s and was based on top-down deductive symbolic methods. The second era, the ANTITHESIS, began in the 1990s and is based on bottom-up statistical methods. These two eras are conceptually and computationally quite different. \n\nAs for the third era, the SYNTHESIS, the author speculates that it will involve a synthesis of conceptual ideas and computational techniques from the previous eras. However, it is unclear if this era will occur or if the current era will take us "all the way". \n\nThe author also notes that the focus of the article is on efforts to model language, as it is the work on language that is currently evoking the most speculation about the future of AI. The article then delves into the history of symbolic AI, starting from the 1950s when the term "artificial intelligence" was coined by John McCarthy. \n\nThe article provides a comprehensive and thought-provoking view on the history and potential future of AI, particularly in the context of language modeling. \n\nSource: [LessWrong](https://www.lesswrong.com/posts/K9GP2ZSsugRAGfFns/a-dialectical-view-of-the-history-of-ai-part-1-we-re-only-in)'
```
