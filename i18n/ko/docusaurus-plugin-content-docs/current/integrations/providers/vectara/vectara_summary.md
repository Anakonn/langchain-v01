---
translated: true
---

# 벡타라

>[Vectara](https://vectara.com/)는 문서 색인 및 쿼리를 위한 사용하기 쉬운 API를 제공하는 신뢰할 수 있는 GenAI 플랫폼입니다.

Vectara는 Retrieval Augmented Generation 또는 [RAG](https://vectara.com/grounded-generation/)에 대한 종합 관리 서비스를 제공합니다. 여기에는 다음이 포함됩니다:

1. 문서 파일에서 텍스트를 추출하고 이를 문장으로 나누는 방법.

2. 최첨단 [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) 임베딩 모델. 각 텍스트 덩어리는 Boomerang을 사용하여 벡터 임베딩으로 인코딩되고, Vectara 내부 지식(벡터+텍스트) 저장소에 저장됩니다.

3. 쿼리를 자동으로 임베딩으로 인코딩하고 가장 관련성 높은 텍스트 세그먼트를 검색하는 쿼리 서비스 (여기에는 [Hybrid Search](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) 및 [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/) 지원 포함).

4. 인용을 포함한 검색된 문서를 기반으로 [생성 요약](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview)을 생성하는 옵션.

API 사용 방법에 대한 자세한 내용은 [Vectara API 문서](https://docs.vectara.com/docs/)를 참조하십시오.

이 노트북은 `Vectara`의 langchain 통합과 관련된 기능을 사용하는 방법을 보여줍니다.
특히 [LangChain의 표현 언어](/docs/expression_language/)를 사용한 체이닝과 Vectara의 통합 요약 기능을 사용하는 방법을 시연합니다.

# 설정

LangChain과 함께 Vectara를 사용하려면 Vectara 계정이 필요합니다. 시작하려면 다음 단계를 따르세요:

1. Vectara 계정이 없다면 [가입](https://www.vectara.com/integrations/langchain)하세요. 가입이 완료되면 Vectara 고객 ID를 받게 됩니다. Vectara 콘솔 창의 오른쪽 상단에 있는 이름을 클릭하면 고객 ID를 확인할 수 있습니다.

2. 계정 내에서 하나 이상의 코퍼스를 생성할 수 있습니다. 각 코퍼스는 입력 문서에서 텍스트 데이터를 저장하는 영역을 나타냅니다. 코퍼스를 생성하려면 **"Create Corpus"** 버튼을 사용하십시오. 그런 다음 코퍼스에 이름과 설명을 제공하십시오. 선택적으로 필터링 속성을 정의하고 일부 고급 옵션을 적용할 수 있습니다. 생성된 코퍼스를 클릭하면 상단에 이름과 코퍼스 ID가 표시됩니다.

3. 다음으로 코퍼스에 액세스하기 위한 API 키를 생성해야 합니다. 코퍼스 보기에서 **"Authorization"** 탭을 클릭한 다음 **"Create API Key"** 버튼을 클릭하십시오. 키 이름을 지정하고 쿼리 전용 또는 쿼리+색인을 선택하십시오. "Create"를 클릭하면 활성 API 키가 생성됩니다. 이 키를 비공개로 유지하십시오.

LangChain과 함께 Vectara를 사용하려면 이 세 가지 값: customer ID, corpus ID 및 api_key가 필요합니다.
이 값을 LangChain에 제공하는 방법은 두 가지입니다:

1. 환경 변수에 이 세 가지 변수: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID`, `VECTARA_API_KEY`를 포함하십시오.

> 예를 들어, os.environ과 getpass를 사용하여 다음과 같이 변수를 설정할 수 있습니다:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Vectara 벡터스토어 생성자에 추가하십시오:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

```python
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
```

먼저 state-of-the-union 텍스트를 Vectara에 로드합니다. 여기서 우리는 로컬 처리나 청킹이 필요 없는 `from_files` 인터페이스를 사용합니다 - Vectara는 파일 내용을 받아 필요한 모든 전처리, 청킹 및 임베딩을 지식 저장소에 수행합니다.

```python
vectara = Vectara.from_files(["state_of_the_union.txt"])
```

이제 Vectara 검색기를 생성하고 다음을 지정합니다:
* 상위 3개의 문서 일치 항목만 반환해야 합니다.
* 요약을 위해 상위 5개 결과를 사용하고 응답은 영어로 해야 합니다.

```python
summary_config = {"is_enabled": True, "max_results": 5, "response_lang": "eng"}
retriever = vectara.as_retriever(
    search_kwargs={"k": 3, "summary_config": summary_config}
)
```

Vectara를 사용하여 요약을 사용할 때, 검색기는 `Document` 객체 목록으로 응답합니다:
1. 처음 `k` 문서는 쿼리와 일치하는 문서들입니다 (표준 벡터 저장소와 동일).
2. 요약이 활성화된 경우 추가 `Document` 객체가 추가되며, 이 객체에는 요약 텍스트가 포함됩니다. 이 Document는 메타데이터 필드 `summary`가 True로 설정되어 있습니다.

이를 분리하기 위한 두 가지 유틸리티 함수를 정의해봅시다:

```python
def get_sources(documents):
    return documents[:-1]


def get_summary(documents):
    return documents[-1].page_content


query_str = "what did Biden say?"
```

이제 쿼리에 대한 요약 응답을 시도해볼 수 있습니다:

```python
(retriever | get_summary).invoke(query_str)
```

```output
'The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.'
```

이 요약에 사용된 Vectara에서 검색된 출처(인용)를 보고 싶다면:

```python
(retriever | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully.', metadata={'lang': 'eng', 'section': '1', 'offset': '2100', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```

Vectara의 "RAG as a service"는 질문 응답 또는 챗봇 체인을 만드는 데 많은 수고를 덜어줍니다. LangChain과의 통합은 `SelfQueryRetriever` 또는 `MultiQueryRetriever`와 같은 쿼리 전처리 기능을 추가로 사용할 수 있는 옵션을 제공합니다. [MultiQueryRetriever](/docs/modules/data_connection/retrievers/MultiQueryRetriever)를 사용하는 예제를 살펴보겠습니다.

MQR은 LLM을 사용하므로 설정해야 합니다 - 여기서는 `ChatOpenAI`를 선택합니다:

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
mqr = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

(mqr | get_summary).invoke(query_str)
```

```output
"President Biden has made several notable quotes and comments. He expressed a commitment to investigate the potential impact of burn pits on soldiers' health, referencing his son's brain cancer [1]. He emphasized the importance of unity among Americans, urging us to see each other as fellow citizens rather than enemies [2]. Biden also highlighted the need for schools to use funds from the American Rescue Plan to hire teachers and address learning loss, while encouraging community involvement in supporting education [3]."
```

```python
(mqr | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='And, if Congress provides the funds we need, we’ll have new stockpiles of tests, masks, and pills ready if needed. I cannot promise a new variant won’t come. But I can promise you we’ll do everything within our power to be ready if it does. Third – we can end the shutdown of schools and businesses. We have the tools we need.', metadata={'lang': 'eng', 'section': '1', 'offset': '24753', 'len': '82', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.', metadata={'summary': True}),
 Document(page_content='Danielle says Heath was a fighter to the very end. He didn’t know how to stop fighting, and neither did she. Through her pain she found purpose to demand we do better. Tonight, Danielle—we are. The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits.', metadata={'lang': 'eng', 'section': '1', 'offset': '35502', 'len': '58', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='Let’s stop seeing each other as enemies, and start seeing each other for who we really are: Fellow Americans. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together. I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.', metadata={'lang': 'eng', 'section': '1', 'offset': '26312', 'len': '89', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The American Rescue Plan gave schools money to hire teachers and help students make up for lost learning. I urge every parent to make sure your school does just that. And we can all play a part—sign up to be a tutor or a mentor. Children were also struggling before the pandemic. Bullying, violence, trauma, and the harms of social media.', metadata={'lang': 'eng', 'section': '1', 'offset': '33227', 'len': '61', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```
