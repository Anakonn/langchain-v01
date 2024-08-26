---
translated: true
---

<a href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/chat/maritalk.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

# 마리톡 (Maritalk)

## 소개

MariTalk는 브라질 회사 [Maritaca AI](https://www.maritaca.ai)에서 개발한 어시스턴트입니다. MariTalk는 포르투갈어를 잘 이해하도록 특별히 훈련된 언어 모델을 기반으로 합니다.

이 노트북은 LangChain을 사용하여 MariTalk를 사용하는 두 가지 예제를 시연합니다:

1. MariTalk를 사용하여 작업을 수행하는 간단한 예제.
2. LLM + RAG: 두 번째 예제는 MariTalk의 토큰 한도를 초과하는 긴 문서에서 답을 찾는 질문에 답하는 방법을 보여줍니다. 이를 위해 간단한 검색기(BM25)를 사용하여 먼저 문서에서 가장 관련성 있는 섹션을 검색한 다음 MariTalk에 입력하여 답을 얻습니다.

## 설치

먼저, 다음 명령어를 사용하여 LangChain 라이브러리(및 모든 종속성)를 설치합니다:

```python
!pip install langchain langchain-core langchain-community httpx
```

## API 키

chat.maritaca.ai ("Chaves da API" 섹션)에서 API 키를 얻어야 합니다.

### 예제 1 - 애완동물 이름 제안

언어 모델인 ChatMaritalk를 정의하고 API 키로 구성합니다.

```python
from langchain_community.chat_models import ChatMaritalk
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate

llm = ChatMaritalk(
    model="sabia-2-medium",  # 사용 가능한 모델: sabia-2-small 및 sabia-2-medium
    api_key="",  # 여기에 API 키를 입력하세요
    temperature=0.7,
    max_tokens=100,
)

output_parser = StrOutputParser()

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "당신은 애완동물 이름을 제안하는 전문 어시스턴트입니다. 동물이 주어지면 4개의 이름을 제안해야 합니다.",
        ),
        ("human", "저는 {animal}를 키우고 있습니다."),
    ]
)

chain = chat_prompt | llm | output_parser

response = chain.invoke({"animal": "dog"})
print(response)  # "1. Max\n2. Bella\n3. Charlie\n4. Rocky"와 같은 답변을 출력할 것입니다.
```

### 스트림 생성

긴 텍스트 생성 작업(예: 긴 기사 작성 또는 대규모 문서 번역)에는 전체 텍스트를 기다리지 않고 텍스트가 생성되는 대로 응답을 부분적으로 받는 것이 유리할 수 있습니다. 이렇게 하면 응용 프로그램이 더 응답성이 높고 효율적이 됩니다. 특히 생성된 텍스트가 긴 경우 더욱 그렇습니다. 이러한 요구를 충족시키기 위해 동기식과 비동기식 두 가지 접근 방식을 제공합니다.

#### 동기식:

```python
from langchain_core.messages import HumanMessage

messages = [HumanMessage(content="내 개에게 이름 3개를 제안해줘")]

for chunk in llm.stream(messages):
    print(chunk.content, end="", flush=True)
```

#### 비동기식:

```python
from langchain_core.messages import HumanMessage

async def async_invoke_chain(animal: str):
    messages = [HumanMessage(content=f"내 {animal}에게 이름 3개를 제안해줘")]
    async for chunk in llm._astream(messages):
        print(chunk.message.content, end="", flush=True)

await async_invoke_chain("dog")
```

### 예제 2 - RAG + LLM: UNICAMP 2024 입학 시험 질문 응답 시스템

이 예제를 위해 몇 가지 추가 라이브러리를 설치해야 합니다:

```python
!pip install unstructured rank_bm25 pdf2image pdfminer-six pikepdf pypdf unstructured_inference fastapi kaleido uvicorn "pillow<10.1.0" pillow_heif -q
```

#### 데이터베이스 로드

첫 번째 단계는 공지의 정보를 포함하는 데이터베이스를 만드는 것입니다. 이를 위해 COMVEST 웹사이트에서 공지를 다운로드하고 추출된 텍스트를 500자 윈도우로 분할합니다.

```python
from langchain.document_loaders import OnlinePDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# COMVEST 2024 공지 로드

loader = OnlinePDFLoader(
    "https://www.comvest.unicamp.br/wp-content/uploads/2023/10/31-2023-Dispoe-sobre-o-Vestibular-Unicamp-2024_com-retificacao.pdf"
)
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=100, separators=["\n", " ", ""]
)
texts = text_splitter.split_documents(data)
```

#### 검색기 생성

이제 데이터베이스가 있으므로 검색기가 필요합니다. 이 예제에서는 간단한 BM25를 검색 시스템으로 사용하지만, 임베딩을 통한 검색과 같은 다른 검색기로 대체할 수 있습니다.

```python
from langchain.retrievers import BM25Retriever

retriever = BM25Retriever.from_documents(texts)
```

#### 검색 시스템 + LLM 결합

이제 검색기가 있으므로 작업을 지정하는 프롬프트를 구현하고 체인을 호출하기만 하면 됩니다.

```python
from langchain.chains.question_answering import load_qa_chain

prompt = """다음 문서를 기반으로, 아래 질문에 답하십시오.

{context}

질문: {query}
"""

qa_prompt = ChatPromptTemplate.from_messages([("human", prompt)])

chain = load_qa_chain(llm, chain_type="stuff", verbose=True, prompt=qa_prompt)

query = "시험 시간은 얼마입니까?"

docs = retriever.invoke(query)

chain.invoke(
    {"input_documents": docs, "query": query}
)  # "시험 시간은 5시간입니다."와 같은 답변을 출력할 것입니다.
```