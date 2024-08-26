---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/)는 문서 색인 및 쿼리를 위한 사용하기 쉬운 API를 제공하는 신뢰할 수 있는 GenAI 플랫폼입니다.

Vectara는 다음을 포함하는 Retrieval Augmented Generation 또는 [RAG](https://vectara.com/grounded-generation/)를 위한 엔드 투 엔드 관리 서비스를 제공합니다:

1. 문서 파일에서 텍스트를 추출하고 문장으로 청크화하는 방법.

2. 최신 [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) 임베딩 모델. 각 텍스트 청크는 Boomerang을 사용하여 벡터 임베딩으로 인코딩되고 Vectara 내부 지식(벡터+텍스트) 저장소에 저장됩니다.

3. 쿼리를 자동으로 임베딩하고 가장 관련성 있는 텍스트 세그먼트를 검색하는 쿼리 서비스(Hybrid Search와 MMR 지원 포함).

4. 검색된 문서를 기반으로 인용을 포함하는 생성 요약을 만들 수 있는 옵션.

Vectara API 문서에서 API 사용에 대한 자세한 정보를 확인하세요.

이 노트북은 Vectara를 벡터 저장소(요약 없이)로만 사용할 때의 기본 검색 기능 사용 방법을 보여줍니다. `similarity_search` 및 `similarity_search_with_score`와 LangChain `as_retriever` 기능을 포함합니다.

# 설정

Vectara를 LangChain과 함께 사용하려면 Vectara 계정이 필요합니다. 시작하려면 다음 단계를 따르세요:

1. 아직 계정이 없다면 [가입](https://www.vectara.com/integrations/langchain)하세요. 가입을 완료하면 Vectara 고객 ID를 얻을 수 있습니다. Vectara 콘솔 창 오른쪽 상단의 이름을 클릭하면 고객 ID를 찾을 수 있습니다.

2. 계정에서 하나 이상의 코퍼스를 만들 수 있습니다. 각 코퍼스는 입력 문서에서 수집된 텍스트 데이터를 저장하는 영역을 나타냅니다. "코퍼스 생성" 버튼을 사용하여 코퍼스를 만드세요. 코퍼스 이름과 설명을 제공하세요. 필터링 속성을 정의하고 고급 옵션을 적용할 수도 있습니다. 생성된 코퍼스를 클릭하면 이름과 코퍼스 ID를 확인할 수 있습니다.

3. 다음으로 코퍼스에 액세스하기 위한 API 키를 만들어야 합니다. 코퍼스 보기의 "권한 부여" 탭을 클릭하고 "API 키 생성" 버튼을 클릭하세요. API 키에 이름을 지정하고 쿼리 전용 또는 쿼리+색인 권한을 선택하세요. "생성"을 클릭하면 활성 API 키가 생성됩니다. 이 키는 기밀로 유지해야 합니다.

LangChain에서 Vectara를 사용하려면 고객 ID, 코퍼스 ID 및 api_key의 세 가지 값이 필요합니다.
이 값들을 LangChain에 두 가지 방법으로 제공할 수 있습니다:

1. 환경에 `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` 및 `VECTARA_API_KEY` 세 가지 변수를 포함합니다.

> 예를 들어, os.environ과 getpass를 사용하여 이러한 변수를 다음과 같이 설정할 수 있습니다:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Vectara 벡터 저장소 생성자에 추가합니다:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

## LangChain에서 Vectara 연결하기

시작하려면 from_documents() 메서드를 사용하여 문서를 수집해 보겠습니다.
여기서는 VECTARA_CUSTOMER_ID, VECTARA_CORPUS_ID 및 query+indexing VECTARA_API_KEY를 환경 변수로 추가했다고 가정합니다.

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vectara = Vectara.from_documents(
    docs,
    embedding=FakeEmbeddings(size=768),
    doc_metadata={"speech": "state-of-the-union"},
)
```

Vectara의 색인 API는 파일이 Vectara에 의해 직접 처리되는 파일 업로드 API를 제공합니다 - 사전 처리, 최적으로 청크화되어 Vectara 벡터 저장소에 추가됩니다.
이를 위해 add_files() 메서드(및 from_files())를 추가했습니다.

이를 실제로 확인해 보겠습니다. 두 개의 PDF 문서를 업로드해 보겠습니다:

1. Dr. King의 "I have a dream" 연설
2. Churchill의 "We Shall Fight on the Beaches" 연설

```python
import tempfile
import urllib.request

urls = [
    [
        "https://www.gilderlehrman.org/sites/default/files/inline-pdfs/king.dreamspeech.excerpts.pdf",
        "I-have-a-dream",
    ],
    [
        "https://www.parkwayschools.net/cms/lib/MO01931486/Centricity/Domain/1578/Churchill_Beaches_Speech.pdf",
        "we shall fight on the beaches",
    ],
]
files_list = []
for url, _ in urls:
    name = tempfile.NamedTemporaryFile().name
    urllib.request.urlretrieve(url, name)
    files_list.append(name)

docsearch: Vectara = Vectara.from_files(
    files=files_list,
    embedding=FakeEmbeddings(size=768),
    metadatas=[{"url": url, "speech": title} for url, title in urls],
)
```

## 유사도 검색

Vectara를 사용하는 가장 간단한 시나리오는 유사도 검색을 수행하는 것입니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search(
    query, n_sentence_context=0, filter="doc.speech = 'state-of-the-union'"
)
```

```python
found_docs
```

```output
[Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '141', 'len': '117', 'speech': 'state-of-the-union'}),
 Document(page_content='As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '77', 'speech': 'state-of-the-union'}),
 Document(page_content='Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '122', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought he could roll into Ukraine and the world would roll over.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '664', 'len': '68', 'speech': 'state-of-the-union'}),
 Document(page_content='That’s why one of the first things I did as President was fight to pass the American Rescue Plan.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '314', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='And he thought he could divide us at home.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '160', 'len': '42', 'speech': 'state-of-the-union'}),
 Document(page_content='He met the Ukrainian people.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '788', 'len': '28', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought the West and NATO wouldn’t respond.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '113', 'len': '46', 'speech': 'state-of-the-union'}),
 Document(page_content='In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '772', 'len': '131', 'speech': 'state-of-the-union'})]
```

```python
print(found_docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.
```

## 유사도 검색과 점수

때로는 검색을 수행하고 관련성 점수를 얻어 특정 결과의 품질을 알고 싶을 수 있습니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'state-of-the-union'",
    score_threshold=0.2,
)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.

Score: 0.74179757
```

이제 업로드한 파일의 내용에 대해 유사 검색을 해 보겠습니다.

```python
query = "We must forever conduct our struggle"
min_score = 1.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 1.2 we have 0 documents
```

```python
query = "We must forever conduct our struggle"
min_score = 0.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 0.2 we have 10 documents
```

MMR은 GenAI 애플리케이션에 공급되는 검색 결과를 재정렬하여 결과의 다양성을 향상시키는 중요한 검색 기능입니다.

Vectara에서 이것이 어떻게 작동하는지 살펴보겠습니다:

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 0.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

Grow the workforce. Build the economy from the bottom up
and the middle out, not from the top down.

When we invest in our workers, when we build the economy from the bottom up and the middle out together, we can do something we haven’t done in a long time: build a better America.

Our economy grew at a rate of 5.7% last year, the strongest growth in nearly 40 years, the first step in bringing fundamental change to an economy that hasn’t worked for the working people of this nation for too long.

Economists call it “increasing the productive capacity of our economy.”
```

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 1.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

The Russian stock market has lost 40% of its value and trading remains suspended.

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century.

In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

The federal government spends about $600 Billion a year to keep the country safe and secure.
```

다음과 같이 첫 번째 예에서 diversity_bias를 0.0으로 설정했는데(다양성 재순위화가 비활성화된 것과 동일), 이로 인해 가장 관련성이 높은 상위 5개 문서가 나왔습니다. diversity_bias=1.0으로 설정하면 다양성을 최대화하고, 결과적으로 상위 문서들의 의미적 다양성이 훨씬 더 높아진 것을 볼 수 있습니다.

## Vectara as a Retriever

마지막으로 `as_retriever()` 인터페이스를 사용하여 Vectara를 사용하는 방법을 살펴보겠습니다:

```python
retriever = vectara.as_retriever()
retriever
```

```output
VectorStoreRetriever(tags=['Vectara'], vectorstore=<langchain_community.vectorstores.vectara.Vectara object at 0x109a3c760>)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'})
```
