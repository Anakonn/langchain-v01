---
translated: true
---

# 위키백과

>[위키백과](https://wikipedia.org/)는 자원봉사자인 위키피디언들이 공동 작업하고 미디어위키라는 위키 기반 편집 시스템을 사용하여 작성하고 유지하는 다국어 무료 온라인 백과사전입니다. 위키백과는 역사상 가장 큰 규모이자 가장 많이 읽히는 참고 자료입니다.

이 노트북은 `wikipedia.org`에서 위키 페이지를 가져와 하류에서 사용되는 문서 형식으로 변환하는 방법을 보여줍니다.

## 설치

먼저 `wikipedia` 파이썬 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  wikipedia
```

`WikipediaRetriever`에는 다음과 같은 인수가 있습니다:
- 선택적 `lang`: 기본값="en". 특정 언어 버전의 위키백과에서 검색하는 데 사용합니다.
- 선택적 `load_max_docs`: 기본값=100. 다운로드할 문서 수를 제한하는 데 사용합니다. 모든 100개의 문서를 다운로드하는 데는 시간이 걸리므로 실험에는 작은 숫자를 사용하세요. 현재 300개로 제한되어 있습니다.
- 선택적 `load_all_available_meta`: 기본값=False. 기본적으로 가장 중요한 필드만 다운로드됩니다: `Published`(문서가 게시/마지막으로 업데이트된 날짜), `title`, `Summary`. True인 경우 다른 필드도 다운로드됩니다.

`get_relevant_documents()`에는 하나의 인수, `query`가 있습니다: 위키백과에서 문서를 찾는 데 사용되는 자유 텍스트

## 예제

### 리트리버 실행

```python
from langchain_community.retrievers import WikipediaRetriever
```

```python
retriever = WikipediaRetriever()
```

```python
docs = retriever.invoke("HUNTER X HUNTER")
```

```python
docs[0].metadata  # meta-information of the Document
```

```output
{'title': 'Hunter × Hunter',
 'summary': 'Hunter × Hunter (stylized as HUNTER×HUNTER and pronounced "hunter hunter") is a Japanese manga series written and illustrated by Yoshihiro Togashi. It has been serialized in Shueisha\'s shōnen manga magazine Weekly Shōnen Jump since March 1998, although the manga has frequently gone on extended hiatuses since 2006. Its chapters have been collected in 37 tankōbon volumes as of November 2022. The story focuses on a young boy named Gon Freecss who discovers that his father, who left him at a young age, is actually a world-renowned Hunter, a licensed professional who specializes in fantastical pursuits such as locating rare or unidentified animal species, treasure hunting, surveying unexplored enclaves, or hunting down lawless individuals. Gon departs on a journey to become a Hunter and eventually find his father. Along the way, Gon meets various other Hunters and encounters the paranormal.\nHunter × Hunter was adapted into a 62-episode anime television series produced by Nippon Animation and directed by Kazuhiro Furuhashi, which ran on Fuji Television from October 1999 to March 2001. Three separate original video animations (OVAs) totaling 30 episodes were subsequently produced by Nippon Animation and released in Japan from 2002 to 2004. A second anime television series by Madhouse aired on Nippon Television from October 2011 to September 2014, totaling 148 episodes, with two animated theatrical films released in 2013. There are also numerous audio albums, video games, musicals, and other media based on Hunter × Hunter.\nThe manga has been translated into English and released in North America by Viz Media since April 2005. Both television series have been also licensed by Viz Media, with the first series having aired on the Funimation Channel in 2009 and the second series broadcast on Adult Swim\'s Toonami programming block from April 2016 to June 2019.\nHunter × Hunter has been a huge critical and financial success and has become one of the best-selling manga series of all time, having over 84 million copies in circulation by July 2022.\n\n'}
```

```python
docs[0].page_content[:400]  # a content of the Document
```

```output
'Hunter × Hunter (stylized as HUNTER×HUNTER and pronounced "hunter hunter") is a Japanese manga series written and illustrated by Yoshihiro Togashi. It has been serialized in Shueisha\'s shōnen manga magazine Weekly Shōnen Jump since March 1998, although the manga has frequently gone on extended hiatuses since 2006. Its chapters have been collected in 37 tankōbon volumes as of November 2022. The sto'
```

### 사실에 대한 질문 답변

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

OPENAI_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
from langchain.chains import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo")  # switch to 'gpt-4'
qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever)
```

```python
questions = [
    "What is Apify?",
    "When the Monument to the Martyrs of the 1830 Revolution was created?",
    "What is the Abhayagiri Vihāra?",
    # "How big is Wikipédia en français?",
]
chat_history = []

for question in questions:
    result = qa({"question": question, "chat_history": chat_history})
    chat_history.append((question, result["answer"]))
    print(f"-> **Question**: {question} \n")
    print(f"**Answer**: {result['answer']} \n")
```

```output
-> **Question**: What is Apify?

**Answer**: Apify is a platform that allows you to easily automate web scraping, data extraction and web automation. It provides a cloud-based infrastructure for running web crawlers and other automation tasks, as well as a web-based tool for building and managing your crawlers. Additionally, Apify offers a marketplace for buying and selling pre-built crawlers and related services.

-> **Question**: When the Monument to the Martyrs of the 1830 Revolution was created?

**Answer**: Apify is a web scraping and automation platform that enables you to extract data from websites, turn unstructured data into structured data, and automate repetitive tasks. It provides a user-friendly interface for creating web scraping scripts without any coding knowledge. Apify can be used for various web scraping tasks such as data extraction, web monitoring, content aggregation, and much more. Additionally, it offers various features such as proxy support, scheduling, and integration with other tools to make web scraping and automation tasks easier and more efficient.

-> **Question**: What is the Abhayagiri Vihāra?

**Answer**: Abhayagiri Vihāra was a major monastery site of Theravada Buddhism that was located in Anuradhapura, Sri Lanka. It was founded in the 2nd century BCE and is considered to be one of the most important monastic complexes in Sri Lanka.
```
