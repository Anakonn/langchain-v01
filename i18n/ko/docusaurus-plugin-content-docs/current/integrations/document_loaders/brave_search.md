---
translated: true
---

# 브레이브 검색

>[브레이브 검색](https://en.wikipedia.org/wiki/Brave_Search)은 브레이브 소프트웨어가 개발한 검색 엔진입니다.
> - `브레이브 검색`은 자체 웹 인덱스를 사용합니다. 2022년 5월 기준, 100억 페이지 이상을 다루고 있으며 92%의 검색 결과를 제3자에 의존하지 않고 제공하고 있습니다. 나머지 결과는 Bing API 또는 (선택적으로) Google에서 가져옵니다. 브레이브에 따르면 인덱스 크기를 Google이나 Bing보다 작게 유지하여 스팸 및 기타 저품질 콘텐츠를 방지하고자 했지만, 그 결과 "긴 꼬리 쿼리를 복구하는 데 있어 Google만큼 좋지 않습니다."
>- `브레이브 검색 프리미엄`: 2023년 4월 현재 브레이브 검색은 광고 없는 웹사이트이지만, 향후 광고가 포함되는 새로운 모델로 전환될 예정입니다. 프리미엄 사용자는 광고 없는 경험을 제공받게 됩니다. 사용자의 IP 주소를 포함한 사용자 데이터는 기본적으로 수집되지 않습니다. 데이터 수집을 위해서는 프리미엄 계정이 필요합니다.

## 설치 및 설정

브레이브 검색 API에 액세스하려면 [계정을 만들고 API 키를 받아야 합니다](https://api.search.brave.com/app/dashboard).

```python
api_key = "..."
```

```python
from langchain_community.document_loaders import BraveSearchLoader
```

## 예시

```python
loader = BraveSearchLoader(
  query="obama middle name", api_key=api_key, search_kwargs={"count": 3}
)
docs = loader.load()
len(docs)
```

```output
3
```

```python
[doc.metadata for doc in docs]
```

```output
[{'title': "Obama's Middle Name -- My Last Name -- is 'Hussein.' So?",
'link': 'https://www.cair.com/cair_in_the_news/obamas-middle-name-my-last-name-is-hussein-so/'},
{'title': "What's up with Obama's middle name? - Quora",
'link': 'https://www.quora.com/Whats-up-with-Obamas-middle-name'},
{'title': 'Barack Obama | Biography, Parents, Education, Presidency, Books, ...',
'link': 'https://www.britannica.com/biography/Barack-Obama'}]
```

```python
[doc.page_content for doc in docs]
```

```output
['I wasn’t sure whether to laugh or cry a few days back listening to radio talk show host Bill Cunningham repeatedly scream Barack <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong> — my last <strong>name</strong> — as if he had anti-Muslim Tourette’s. “Hussein,” Cunningham hissed like he was beckoning Satan when shouting the ...',
'Answer (1 of 15): A better question would be, “What’s up with <strong>Obama</strong>’s first <strong>name</strong>?” President Barack Hussein <strong>Obama</strong>’s father’s <strong>name</strong> was Barack Hussein <strong>Obama</strong>. He was <strong>named</strong> after his father. Hussein, <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong>, is a very common Arabic <strong>name</strong>, meaning &quot;good,&quot; &quot;handsome,&quot; or ...',
'Barack <strong>Obama</strong>, in full Barack Hussein <strong>Obama</strong> II, (born August 4, 1961, Honolulu, Hawaii, U.S.), 44th president of the United States (2009–17) and the first African American to hold the office. Before winning the presidency, <strong>Obama</strong> represented Illinois in the U.S.']
```

