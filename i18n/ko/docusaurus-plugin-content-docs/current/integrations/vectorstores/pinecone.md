---
translated: true
---

# 소나무 열매

>[소나무 열매](https://docs.pinecone.io/docs/overview)는 광범위한 기능을 가진 벡터 데이터베이스입니다.

이 노트북은 `Pinecone` 벡터 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

Pinecone을 사용하려면 API 키가 있어야 합니다.
[설치 지침](https://docs.pinecone.io/docs/quickstart)을 참고하세요.

`Pinecone` 통합을 더 쉽게 사용하려면 다음과 같은 환경 변수를 설정하세요:

- `PINECONE_API_KEY`: Pinecone API 키
- `PINECONE_INDEX_NAME`: 사용할 인덱스의 이름

그리고 이 문서를 따라가려면 다음도 설정해야 합니다:

- `OPENAI_API_KEY`: OpenAI API 키, `OpenAIEmbeddings`를 사용하기 위해

```python
%pip install --upgrade --quiet  langchain-pinecone langchain-openai langchain
```

마이그레이션 참고: `langchain_community.vectorstores`의 Pinecone 구현에서 마이그레이션하는 경우, `pinecone-client` v2 종속성을 제거한 후 `langchain-pinecone`을 설치해야 할 수 있습니다. `langchain-pinecone`은 `pinecone-client` v3에 의존합니다.

먼저 국정 연설 문서를 청크로 나누어 `docs`로 만들어 보겠습니다.

```python
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

이제 `dimension=1536`으로 Pinecone 인덱스를 설정했다고 가정해 보겠습니다.

`PineconeVectorStore.from_documents`를 사용하여 청크된 문서를 내용으로 Pinecone 인덱스에 연결하고 삽입할 수 있습니다.

```python
from langchain_pinecone import PineconeVectorStore

index_name = "langchain-test-index"

docsearch = PineconeVectorStore.from_documents(docs, embeddings, index_name=index_name)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

### 기존 인덱스에 더 많은 텍스트 추가하기

`add_texts` 함수를 사용하여 기존 Pinecone 인덱스에 더 많은 텍스트를 임베딩하고 업서트할 수 있습니다.

```python
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

vectorstore.add_texts(["More text!"])
```

```output
['24631802-4bad-44a7-a4ba-fd71f00cc160']
```

### 최대 한계 관련성 검색

리트리버 객체에서 유사성 검색을 사용하는 것 외에도 `mmr`을 리트리버로 사용할 수 있습니다.

```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

```output

## Document 0

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

## Document 1

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers.

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.

These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming.

But I want you to know that we are going to be okay.

When the history of this era is written Putin’s war on Ukraine will have left Russia weaker and the rest of the world stronger.

While it shouldn’t have taken something so terrible for people around the world to see what’s at stake now everyone sees it clearly.

## Document 2

We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.

## Document 3

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more.

When they came home, many of the world’s fittest and best trained warriors were never the same.

Headaches. Numbness. Dizziness.

A cancer that would put them in a flag-draped coffin.

I know.

One of those soldiers was my son Major Beau Biden.

We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops.

But I’m committed to finding out everything we can.

Committed to military families like Danielle Robinson from Ohio.

The widow of Sergeant First Class Heath Robinson.

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq.

Stationed near Baghdad, just yards from burn pits the size of football fields.

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter.
```

또는 `max_marginal_relevance_search`를 직접 사용할 수 있습니다:

```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```

```output
1. Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

2. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```
