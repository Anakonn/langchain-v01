---
translated: true
---

# Upstash Vector

> [Upstash Vector](https://upstash.com/docs/vector/overall/whatisvector)는 벡터 임베딩 작업을 위해 설계된 서버리스 벡터 데이터베이스입니다.
>
> 벡터 langchain 통합은 [upstash-vector](https://github.com/upstash/vector-py) 패키지를 래핑한 것입니다.
>
> 파이썬 패키지는 내부적으로 [벡터 REST API](https://upstash.com/docs/vector/api/get-started)를 사용합니다.

## 설치

[upstash 콘솔](https://console.upstash.com/vector)에서 원하는 차원과 거리 메트릭으로 무료 벡터 데이터베이스를 생성하세요.

그런 다음 `UpstashVectorStore` 인스턴스를 다음과 같이 생성할 수 있습니다:

- `UPSTASH_VECTOR_URL`과 `UPSTASH_VECTOR_TOKEN` 환경 변수 제공

- 생성자에 매개변수로 전달

- 생성자에 Upstash Vector `Index` 인스턴스 전달

또한 주어진 텍스트를 임베딩으로 변환하기 위해 `Embeddings` 인스턴스가 필요합니다. 여기서는 `OpenAIEmbeddings`를 예로 사용합니다.

```python
%pip install langchain-openai langchain upstash-vector
```

```python
import os

from langchain_community.vectorstores.upstash import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings

os.environ["OPENAI_API_KEY"] = "<YOUR_OPENAI_KEY>"
os.environ["UPSTASH_VECTOR_REST_URL"] = "<YOUR_UPSTASH_VECTOR_URL>"
os.environ["UPSTASH_VECTOR_REST_TOKEN"] = "<YOUR_UPSTASH_VECTOR_TOKEN>"

# Create an embeddings instance
embeddings = OpenAIEmbeddings()

# Create a vector store instance
store = UpstashVectorStore(embedding=embeddings)
```

`UpstashVectorStore`를 생성하는 다른 방법은 [모델을 선택하여 Upstash Vector 인덱스를 생성](https://upstash.com/docs/vector/features/embeddingmodels#using-a-model)하고 `embedding=True`를 전달하는 것입니다. 이 구성에서는 문서 또는 쿼리가 텍스트로 Upstash에 전송되어 임베딩됩니다.

```python
store = UpstashVectorStore(embedding=True)
```

이 접근 방식을 시도해보고 싶다면 위와 같이 `store` 초기화를 업데이트하고 나머지 튜토리얼을 실행할 수 있습니다.

## 문서 로드

예제 텍스트 파일을 로드하고 벡터 임베딩으로 변환할 수 있는 청크로 분할합니다.

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

docs[:3]
```

```output
[Document(page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  \n\nLast year COVID-19 kept us apart. This year we are finally together again. \n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. \n\nWith a duty to one another to the American people to the Constitution. \n\nAnd with an unwavering resolve that freedom will always triumph over tyranny. \n\nSix days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. \n\nHe thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. \n\nHe met the Ukrainian people. \n\nFrom President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 Document(page_content='Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. \n\nIn this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. \n\nLet each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. \n\nPlease rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. \n\nThroughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.   \n\nThey keep moving.   \n\nAnd the costs and the threats to America and the world keep rising.   \n\nThat’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2. \n\nThe United States is a member along with 29 other nations. \n\nIt matters. American diplomacy matters. American resolve matters.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. \n\nHe rejected repeated efforts at diplomacy. \n\nHe thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   \n\nWe prepared extensively and carefully. \n\nWe spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. \n\nI spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  \n\nWe countered Russia’s lies with truth.   \n\nAnd now that he has acted the free world is holding him accountable. \n\nAlong with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland.', metadata={'source': '../../modules/state_of_the_union.txt'})]
```

## 문서 삽입

벡터 저장소는 임베딩 객체를 사용하여 텍스트 청크를 임베딩하고 데이터베이스에 일괄 삽입합니다. 이는 삽입된 벡터의 ID 배열을 반환합니다.

```python
inserted_vectors = store.add_documents(docs)

inserted_vectors[:5]
```

```output
['82b3781b-817c-4a4d-8f8b-cbd07c1d005a',
 'a20e0a49-29d8-465e-8eae-0bc5ac3d24dc',
 'c19f4108-b652-4890-873e-d4cad00f1b1a',
 '23d1fcf9-6ee1-4638-8c70-0f5030762301',
 '2d775784-825d-4627-97a3-fee4539d8f58']
```

store

```python
store.add_texts(
    [
        "A timeless tale set in the Jazz Age, this novel delves into the lives of affluent socialites, their pursuits of wealth, love, and the elusive American Dream. Amidst extravagant parties and glittering opulence, the story unravels the complexities of desire, ambition, and the consequences of obsession.",
        "Set in a small Southern town during the 1930s, this novel explores themes of racial injustice, moral growth, and empathy through the eyes of a young girl. It follows her father, a principled lawyer, as he defends a black man accused of assaulting a white woman, confronting deep-seated prejudices and challenging societal norms along the way.",
        "A chilling portrayal of a totalitarian regime, this dystopian novel offers a bleak vision of a future world dominated by surveillance, propaganda, and thought control. Through the eyes of a disillusioned protagonist, it explores the dangers of totalitarianism and the erosion of individual freedom in a society ruled by fear and oppression.",
        "Set in the English countryside during the early 19th century, this novel follows the lives of the Bennet sisters as they navigate the intricate social hierarchy of their time. Focusing on themes of marriage, class, and societal expectations, the story offers a witty and insightful commentary on the complexities of romantic relationships and the pursuit of happiness.",
        "Narrated by a disillusioned teenager, this novel follows his journey of self-discovery and rebellion against the phoniness of the adult world. Through a series of encounters and reflections, it explores themes of alienation, identity, and the search for authenticity in a society marked by conformity and hypocrisy.",
        "In a society where emotion is suppressed and individuality is forbidden, one man dares to defy the oppressive regime. Through acts of rebellion and forbidden love, he discovers the power of human connection and the importance of free will.",
        "Set in a future world devastated by environmental collapse, this novel follows a group of survivors as they struggle to survive in a harsh, unforgiving landscape. Amidst scarcity and desperation, they must confront moral dilemmas and question the nature of humanity itself.",
    ],
    [
        {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "year": 1925},
        {"title": "To Kill a Mockingbird", "author": "Harper Lee", "year": 1960},
        {"title": "1984", "author": "George Orwell", "year": 1949},
        {"title": "Pride and Prejudice", "author": "Jane Austen", "year": 1813},
        {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "year": 1951},
        {"title": "Brave New World", "author": "Aldous Huxley", "year": 1932},
        {"title": "The Road", "author": "Cormac McCarthy", "year": 2006},
    ],
)
```

```output
['fe1f7a7b-42e2-4828-88b0-5b449c49fe86',
 '154a0021-a99c-427e-befb-f0b2b18ed83c',
 'a8218226-18a9-4ab5-ade5-5a71b19a7831',
 '62b7ef97-83bf-4b6d-8c93-f471796244dc',
 'ab43fd2e-13df-46d4-8cf7-e6e16506e4bb',
 '6841e7f9-adaa-41d9-af3d-0813ee52443f',
 '45dda5a1-f0c1-4ac7-9acb-50253e4ee493']
```

## 쿼리

데이터베이스는 벡터 또는 텍스트 프롬프트를 사용하여 쿼리할 수 있습니다.
텍스트 프롬프트를 사용하는 경우 먼저 임베딩으로 변환한 다음 쿼리합니다.

`k` 매개변수는 쿼리에서 반환할 결과 수를 지정합니다.

```python
result = store.similarity_search("The United States of America", k=5)
result
```

```output
[Document(page_content='And my report is this: the State of the Union is strong—because you, the American people, are strong. \n\nWe are stronger today than we were a year ago. \n\nAnd we will be stronger a year from now than we are today. \n\nNow is our moment to meet and overcome the challenges of our time. \n\nAnd we will, as one people. \n\nOne America. \n\nThe United States of America. \n\nMay God bless you all. May God protect our troops.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 Document(page_content='And built the strongest, freest, and most prosperous nation the world has ever known. \n\nNow is the hour. \n\nOur moment of responsibility. \n\nOur test of resolve and conscience, of history itself. \n\nIt is in this moment that our character is formed. Our purpose is found. Our future is forged. \n\nWell I know this nation.  \n\nWe will meet the test. \n\nTo protect freedom and liberty, to expand fairness and opportunity. \n\nWe will save democracy. \n\nAs hard as these times have been, I am more optimistic about America today than I have been my whole life. \n\nBecause I see the future that is within our grasp. \n\nBecause I know there is simply nothing beyond our capacity. \n\nWe are the only nation on Earth that has always turned every crisis we have faced into an opportunity. \n\nThe only nation that can be defined by a single word: possibilities. \n\nSo on this night, in our 245th year as a nation, I have come to report on the State of the Union.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 Document(page_content='Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. \n\nIn this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. \n\nLet each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. \n\nPlease rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. \n\nThroughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.   \n\nThey keep moving.   \n\nAnd the costs and the threats to America and the world keep rising.   \n\nThat’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2. \n\nThe United States is a member along with 29 other nations. \n\nIt matters. American diplomacy matters. American resolve matters.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 Document(page_content='When we use taxpayer dollars to rebuild America – we are going to Buy American: buy American products to support American jobs. \n\nThe federal government spends about $600 Billion a year to keep the country safe and secure. \n\nThere’s been a law on the books for almost a century \nto make sure taxpayers’ dollars support American jobs and businesses. \n\nEvery Administration says they’ll do it, but we are actually doing it. \n\nWe will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. \n\nBut to compete for the best jobs of the future, we also need to level the playing field with China and other competitors. \n\nThat’s why it is so important to pass the Bipartisan Innovation Act sitting in Congress that will make record investments in emerging technologies and American manufacturing. \n\nLet me give you one example of why it’s so important to pass it.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 Document(page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  \n\nLast year COVID-19 kept us apart. This year we are finally together again. \n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. \n\nWith a duty to one another to the American people to the Constitution. \n\nAnd with an unwavering resolve that freedom will always triumph over tyranny. \n\nSix days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. \n\nHe thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. \n\nHe met the Ukrainian people. \n\nFrom President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.', metadata={'source': '../../modules/state_of_the_union.txt'})]
```

```python
result = store.similarity_search("dystopia", k=3, filter="year < 2000")
result
```

```output
[Document(page_content='A chilling portrayal of a totalitarian regime, this dystopian novel offers a bleak vision of a future world dominated by surveillance, propaganda, and thought control. Through the eyes of a disillusioned protagonist, it explores the dangers of totalitarianism and the erosion of individual freedom in a society ruled by fear and oppression.', metadata={'title': '1984', 'author': 'George Orwell', 'year': 1949}),
 Document(page_content='Narrated by a disillusioned teenager, this novel follows his journey of self-discovery and rebellion against the phoniness of the adult world. Through a series of encounters and reflections, it explores themes of alienation, identity, and the search for authenticity in a society marked by conformity and hypocrisy.', metadata={'title': 'The Catcher in the Rye', 'author': 'J.D. Salinger', 'year': 1951}),
 Document(page_content='Set in the English countryside during the early 19th century, this novel follows the lives of the Bennet sisters as they navigate the intricate social hierarchy of their time. Focusing on themes of marriage, class, and societal expectations, the story offers a witty and insightful commentary on the complexities of romantic relationships and the pursuit of happiness.', metadata={'title': 'Pride and Prejudice', 'author': 'Jane Austen', 'year': 1813})]
```

## 점수와 함께 쿼리

쿼리 결과에 점수를 포함할 수 있습니다.

> 쿼리 요청에서 반환되는 점수는 0과 1 사이의 정규화된 값으로, 1은 가장 높은 유사성을, 0은 가장 낮은 유사성을 나타냅니다. 자세한 내용은 [문서](https://upstash.com/docs/vector/overall/features#vector-similarity-functions)를 참조하세요.

```python
result = store.similarity_search_with_score("The United States of America", k=5)

for doc, score in result:
    print(f"{doc.metadata} - {score}")
```

```output
{'source': '../../modules/state_of_the_union.txt'} - 0.87391514
{'source': '../../modules/state_of_the_union.txt'} - 0.8549463
{'source': '../../modules/state_of_the_union.txt'} - 0.847913
{'source': '../../modules/state_of_the_union.txt'} - 0.84328896
{'source': '../../modules/state_of_the_union.txt'} - 0.832347
```

## 벡터 삭제

ID로 벡터를 삭제할 수 있습니다.

```python
store.delete(inserted_vectors)
```

## 벡터 데이터베이스 지우기

이렇게 하면 벡터 데이터베이스가 지워집니다.

```python
store.delete(delete_all=True)
```

## 벡터 데이터베이스 정보 가져오기

`info` 함수를 사용하여 데이터베이스에 대한 정보(거리 메트릭, 차원 등)를 가져올 수 있습니다.

> 삽입이 발생하면 데이터베이스 인덱싱이 진행됩니다. 이 과정 중에는 새 벡터를 쿼리할 수 없습니다. `pendingVectorCount`는 현재 인덱싱 중인 벡터 수를 나타냅니다.

```python
store.info()
```

```output
InfoResult(vector_count=42, pending_vector_count=0, index_size=6470, dimension=384, similarity_function='COSINE')
```
