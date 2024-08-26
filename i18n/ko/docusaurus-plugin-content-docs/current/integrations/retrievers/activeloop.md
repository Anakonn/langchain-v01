---
translated: true
---

# Activeloop Deep Memory

>[Activeloop Deep Memory](https://docs.activeloop.ai/performance-features/deep-memory)는 Vector Store를 사용자 사례에 맞게 최적화하고 LLM 앱의 정확도를 높일 수 있는 도구 모음입니다.

`Retrieval-Augmented Generatation`(`RAG`)은 최근 많은 관심을 받고 있습니다. 고급 RAG 기술과 에이전트가 등장하면서 RAG가 달성할 수 있는 잠재력이 확대되고 있습니다. 그러나 RAG를 프로덕션에 통합하는 데에는 몇 가지 과제가 있을 수 있습니다. RAG를 프로덕션 환경에 구현할 때 고려해야 할 주요 요인은 정확도(recall), 비용 및 대기 시간입니다. 기본 사용 사례의 경우 OpenAI의 Ada 모델과 단순한 유사성 검색으로도 만족스러운 결과를 얻을 수 있습니다. 그러나 검색 중 더 높은 정확도 또는 recall이 필요한 경우 고급 검색 기술을 사용해야 할 수 있습니다. 이러한 방법에는 데이터 청크 크기 변경, 쿼리 여러 번 다시 작성 등이 포함될 수 있으며, 이로 인해 대기 시간과 비용이 증가할 수 있습니다. `Activeloop Deep Lake` 사용자에게 제공되는 `Activeloop의 Deep Memory` 기능은 이러한 문제를 해결합니다. 사용자 쿼리와 코퍼스의 관련 데이터를 일치시키는 작은 신경망 계층을 학습시켜 검색 정확도를 최대 27%까지 높일 수 있습니다. 이 추가 기능은 검색 중 최소한의 대기 시간만 발생하며, 추가적인 고급 RAG 기술 없이도 비용 효율적이고 사용하기 쉽습니다.

이 튜토리얼에서는 `DeepLake` 문서를 구문 분석하고 문서에서 질문에 답할 수 있는 RAG 시스템을 만들 것입니다.

## 1. 데이터셋 생성

이 튜토리얼에서는 `BeautifulSoup` 라이브러리와 LangChain의 문서 파서인 `Html2TextTransformer`, `AsyncHtmlLoader`를 사용하여 Activeloop 문서를 구문 분석할 것입니다. 따라서 다음 라이브러리를 설치해야 합니다:

```python
%pip install --upgrade --quiet  tiktoken langchain-openai python-dotenv datasets langchain deeplake beautifulsoup4 html2text ragas
```

또한 [Activeloop](https://activeloop.ai) 계정을 만들어야 합니다.

```python
ORG_ID = "..."
```

```python
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import DeepLake
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API token: ")
# # activeloop token is needed if you are not signed in using CLI: `activeloop login -u <USERNAME> -p <PASSWORD>`
os.environ["ACTIVELOOP_TOKEN"] = getpass.getpass(
    "Enter your ActiveLoop API token: "
)  # Get your API token from https://app.activeloop.ai, click on your profile picture in the top right corner, and select "API Tokens"

token = os.getenv("ACTIVELOOP_TOKEN")
openai_embeddings = OpenAIEmbeddings()
```

```python
db = DeepLake(
    dataset_path=f"hub://{ORG_ID}/deeplake-docs-deepmemory",  # org_id stands for your username or organization from activeloop
    embedding=openai_embeddings,
    runtime={"tensor_db": True},
    token=token,
    # overwrite=True, # user overwrite flag if you want to overwrite the full dataset
    read_only=False,
)
```

`BeautifulSoup`를 사용하여 웹 페이지의 모든 링크를 구문 분석합니다.

```python
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


def get_all_links(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve the page: {url}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")

    # Finding all 'a' tags which typically contain href attribute for links
    links = [
        urljoin(url, a["href"]) for a in soup.find_all("a", href=True) if a["href"]
    ]

    return links


base_url = "https://docs.deeplake.ai/en/latest/"
all_links = get_all_links(base_url)
```

데이터 로드:

```python
from langchain_community.document_loaders.async_html import AsyncHtmlLoader

loader = AsyncHtmlLoader(all_links)
docs = loader.load()
```

데이터를 사용자 읽기 형식으로 변환:

```python
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
```

이제 문서를 더 작은 청크로 나누겠습니다. 일부 문서에는 너무 많은 텍스트가 포함되어 있기 때문입니다:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

chunk_size = 4096
docs_new = []

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size,
)

for doc in docs_transformed:
    if len(doc.page_content) < chunk_size:
        docs_new.append(doc)
    else:
        docs = text_splitter.create_documents([doc.page_content])
        docs_new.extend(docs)
```

VectorStore에 데이터 채우기:

```python
docs = db.add_documents(docs_new)
```

## 2. 합성 쿼리 생성 및 Deep Memory 학습

다음 단계는 사용자 쿼리를 데이터셋과 정렬하는 deep_memory 모델을 학습시키는 것입니다. 아직 사용자 쿼리가 없다면 걱정하지 마세요. LLM을 사용하여 생성하겠습니다!

#### TODO: 이미지 추가

위에서 deep_memory가 어떻게 작동하는지 전체 구조를 보여주었습니다. 학습을 위해서는 관련성, 쿼리 및 코퍼스 데이터(쿼리하려는 데이터)가 필요합니다. 코퍼스 데이터는 이전 섹션에서 이미 채웠습니다. 여기서는 질문과 관련성을 생성할 것입니다.

1. `questions` - 각 문자열이 쿼리를 나타내는 문자열 목록입니다.
2. `relevance` - 각 질문에 대한 정답 문서의 링크를 포함합니다. 하나의 질문에 여러 개의 관련 문서가 있을 수 있습니다. 따라서 `relevance`는 `List[List[tuple[str, float]]]`의 형태를 가집니다. 외부 목록은 쿼리를 나타내고, 내부 목록은 관련 문서를 나타냅니다. 튜플에는 문서 ID(데이터셋의 `id` 텐서에 해당)와 해당 문서의 관련성 점수(float)가 포함됩니다.

이제 합성 질문과 관련성을 생성해 보겠습니다:

```python
from typing import List

from langchain.chains.openai_functions import (
    create_structured_output_chain,
)
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
```

```python
# fetch dataset docs and ids if they exist (optional you can also ingest)
docs = db.vectorstore.dataset.text.data(fetch_chunks=True, aslist=True)["value"]
ids = db.vectorstore.dataset.id.data(fetch_chunks=True, aslist=True)["value"]
```

```python
# If we pass in a model explicitly, we need to make sure it supports the OpenAI function-calling API.
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


class Questions(BaseModel):
    """Identifying information about a person."""

    question: str = Field(..., description="Questions about text")


prompt_msgs = [
    SystemMessage(
        content="You are a world class expert for generating questions based on provided context. \
                You make sure the question can be answered by the text."
    ),
    HumanMessagePromptTemplate.from_template(
        "Use the given text to generate a question from the following input: {input}"
    ),
    HumanMessage(content="Tips: Make sure to answer in the correct format"),
]
prompt = ChatPromptTemplate(messages=prompt_msgs)
chain = create_structured_output_chain(Questions, llm, prompt, verbose=True)

text = "# Understanding Hallucinations and Bias ## **Introduction** In this lesson, we'll cover the concept of **hallucinations** in LLMs, highlighting their influence on AI applications and demonstrating how to mitigate them using techniques like the retriever's architectures. We'll also explore **bias** within LLMs with examples."
questions = chain.run(input=text)
print(questions)
```

```python
import random

from langchain_openai import OpenAIEmbeddings
from tqdm import tqdm


def generate_queries(docs: List[str], ids: List[str], n: int = 100):
    questions = []
    relevances = []
    pbar = tqdm(total=n)
    while len(questions) < n:
        # 1. randomly draw a piece of text and relevance id
        r = random.randint(0, len(docs) - 1)
        text, label = docs[r], ids[r]

        # 2. generate queries and assign and relevance id
        generated_qs = [chain.run(input=text).question]
        questions.extend(generated_qs)
        relevances.extend([[(label, 1)] for _ in generated_qs])
        pbar.update(len(generated_qs))
        if len(questions) % 10 == 0:
            print(f"q: {len(questions)}")
    return questions[:n], relevances[:n]


chain = create_structured_output_chain(Questions, llm, prompt, verbose=False)
questions, relevances = generate_queries(docs, ids, n=200)

train_questions, train_relevances = questions[:100], relevances[:100]
test_questions, test_relevances = questions[100:], relevances[100:]
```

이제 100개의 학습 쿼리와 100개의 테스트 쿼리를 생성했습니다. 이제 deep_memory를 학습시켜 보겠습니다:

```python
job_id = db.vectorstore.deep_memory.train(
    queries=train_questions,
    relevance=train_relevances,
)
```

학습 진행 상황을 추적해 보겠습니다:

```python
db.vectorstore.deep_memory.status("6538939ca0b69a9ca45c528c")
```

```output

--------------------------------------------------------------
|                  6538e02ecda4691033a51c5b                  |
--------------------------------------------------------------
| status                     | completed                     |
--------------------------------------------------------------
| progress                   | eta: 1.4 seconds              |
|                            | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
| results                    | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
```

## 3. Deep Memory 성능 평가

훌륭합니다! 모델 학습이 완료되었습니다. Recall이 상당히 향상되었습니다. 이제 새로운 데이터에 대해 어떻게 사용하고 평가할 수 있을까요? 이 섹션에서는 모델 평가와 추론 부분을 살펴보고 LangChain을 사용하여 검색 정확도를 높이는 방법을 알아보겠습니다.

### 3.1 Deep Memory 평가

먼저 deep_memory의 내장 평가 메서드를 사용할 수 있습니다.
여러 `recall` 지표를 계산할 수 있습니다.
몇 줄의 코드로 쉽게 수행할 수 있습니다.

```python
recall = db.vectorstore.deep_memory.evaluate(
    queries=test_questions,
    relevance=test_relevances,
)
```

```output

Embedding queries took 0.81 seconds
---- Evaluating without model ----
Recall@1:	  9.0%
Recall@3:	  19.0%
Recall@5:	  24.0%
Recall@10:	  42.0%
Recall@50:	  93.0%
Recall@100:	  98.0%
---- Evaluating with model ----
Recall@1:	  19.0%
Recall@3:	  42.0%
Recall@5:	  49.0%
Recall@10:	  69.0%
Recall@50:	  97.0%
Recall@100:	  97.0%
```

테스트 데이터셋에서도 상당한 성능 향상이 나타났습니다!!!

### 3.2 Deep Memory + RAG

```python
from ragas.langchain import RagasEvaluatorChain
from ragas.metrics import (
    context_recall,
)
```

Recall을 ground truth로 변환해 보겠습니다:

```python
def convert_relevance_to_ground_truth(docs, relevance):
    ground_truths = []

    for rel in relevance:
        ground_truth = []
        for doc_id, _ in rel:
            ground_truth.append(docs[doc_id])
        ground_truths.append(ground_truth)
    return ground_truths
```

```python
ground_truths = convert_relevance_to_ground_truth(docs, test_relevances)

for deep_memory in [False, True]:
    print("\nEvaluating with deep_memory =", deep_memory)
    print("===================================")

    retriever = db.as_retriever()
    retriever.search_kwargs["deep_memory"] = deep_memory

    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(model="gpt-3.5-turbo"),
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
    )

    metrics = {
        "context_recall_score": 0,
    }

    eval_chains = {m.name: RagasEvaluatorChain(metric=m) for m in [context_recall]}

    for question, ground_truth in zip(test_questions, ground_truths):
        result = qa_chain({"query": question})
        result["ground_truths"] = ground_truth
        for name, eval_chain in eval_chains.items():
            score_name = f"{name}_score"
            metrics[score_name] += eval_chain(result)[score_name]

    for metric in metrics:
        metrics[metric] /= len(test_questions)
        print(f"{metric}: {metrics[metric]}")
    print("===================================")
```

```output

Evaluating with deep_memory = False
===================================
context_recall_score = 0.3763423145
===================================

Evaluating with deep_memory = True
===================================
context_recall_score = 0.5634545323
===================================
```

### 3.3 Deep Memory 추론

#### TODO: 이미지 추가

deep_memory를 사용한 경우

```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = True
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
print(qa.run(query))
```

```output
The base htype of the 'video_seq' tensor is 'video'.
```

deep_memory를 사용하지 않은 경우

```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = False
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
qa.run(query)
```

```output
The text does not provide information on the base htype of the 'video_seq' tensor.
```

### 3.4 Deep Memory 비용 절감

Deep Memory는 기존 워크플로를 변경하지 않고도 검색 정확도를 높일 수 있습니다. 또한 LLM에 전달되는 top_k를 줄임으로써 토큰 사용량을 낮추어 추론 비용을 크게 절감할 수 있습니다.
