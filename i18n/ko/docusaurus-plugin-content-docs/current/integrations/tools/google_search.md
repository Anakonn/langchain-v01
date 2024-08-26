---
translated: true
---

# Google 검색

이 노트북은 Google 검색 구성 요소 사용 방법을 다룹니다.

먼저 적절한 API 키와 환경 변수를 설정해야 합니다. 설정하려면 Google Cloud 자격 증명 콘솔(https://console.cloud.google.com/apis/credentials)에서 GOOGLE_API_KEY를 만들고 Programmable Search Engine(https://programmablesearchengine.google.com/controlpanel/create)을 사용하여 GOOGLE_CSE_ID를 만듭니다. 그 다음 [여기](https://stackoverflow.com/questions/37083058/programmatically-searching-google-in-python-using-custom-search)에서 찾을 수 있는 지침을 따르는 것이 좋습니다.

그런 다음 몇 가지 환경 변수를 설정해야 합니다.

```python
import os

os.environ["GOOGLE_CSE_ID"] = ""
os.environ["GOOGLE_API_KEY"] = ""
```

```python
from langchain_community.utilities import GoogleSearchAPIWrapper
from langchain_core.tools import Tool

search = GoogleSearchAPIWrapper()

tool = Tool(
    name="google_search",
    description="Search Google for recent results.",
    func=search.run,
)
```

```python
tool.run("Obama's first name?")
```

```output
"STATE OF HAWAII. 1 Child's First Name. (Type or print). 2. Sex. BARACK. 3. This Birth. CERTIFICATE OF LIVE BIRTH. FILE. NUMBER 151 le. lb. Middle Name. Barack Hussein Obama II is an American former politician who served as the 44th president of the United States from 2009 to 2017. A member of the Democratic\xa0... When Barack Obama was elected president in 2008, he became the first African American to hold ... The Middle East remained a key foreign policy challenge. Jan 19, 2017 ... Jordan Barack Treasure, New York City, born in 2008 ... Jordan Barack Treasure made national news when he was the focus of a New York newspaper\xa0... Portrait of George Washington, the 1st President of the United States ... Portrait of Barack Obama, the 44th President of the United States\xa0... His full name is Barack Hussein Obama II. Since the “II” is simply because he was named for his father, his last name is Obama. Mar 22, 2008 ... Barry Obama decided that he didn't like his nickname. A few of his friends at Occidental College had already begun to call him Barack (his\xa0... Aug 18, 2017 ... It took him several seconds and multiple clues to remember former President Barack Obama's first name. Miller knew that every answer had to\xa0... Feb 9, 2015 ... Michael Jordan misspelled Barack Obama's first name on 50th-birthday gift ... Knowing Obama is a Chicagoan and huge basketball fan,\xa0... 4 days ago ... Barack Obama, in full Barack Hussein Obama II, (born August 4, 1961, Honolulu, Hawaii, U.S.), 44th president of the United States (2009–17) and\xa0..."
```

## 결과 수

`k` 매개변수를 사용하여 결과 수를 설정할 수 있습니다.

```python
search = GoogleSearchAPIWrapper(k=1)

tool = Tool(
    name="I'm Feeling Lucky",
    description="Search Google and return the first result.",
    func=search.run,
)
```

```python
tool.run("python")
```

```output
'The official home of the Python Programming Language.'
```

'The official home of the Python Programming Language.'

## 메타데이터 결과

GoogleSearch를 통해 쿼리를 실행하고 스니펫, 제목 및 링크 메타데이터를 반환합니다.

- 스니펫: 결과에 대한 설명입니다.
- 제목: 결과의 제목입니다.
- 링크: 결과에 대한 링크입니다.

```python
search = GoogleSearchAPIWrapper()


def top5_results(query):
    return search.results(query, 5)


tool = Tool(
    name="Google Search Snippets",
    description="Search Google for recent results.",
    func=top5_results,
)
```
