---
sidebar_class_name: hidden
title: 코드 이해
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/code_understanding.ipynb)

## 사용 사례

소스 코드 분석은 다음과 같은 사용 사례를 위한 가장 인기 있는 LLM 응용 프로그램 중 하나입니다 (예: [GitHub Copilot](https://github.com/features/copilot), [Code Interpreter](https://chat.openai.com/auth/login?next=%2F%3Fmodel%3Dgpt-4-code-interpreter), [Codium](https://www.codium.ai/), 및 [Codeium](https://codeium.com/about)):

- 코드 베이스에 대한 Q&A를 통해 코드 작동 방식을 이해하기
- LLM을 사용하여 리팩토링 또는 개선 사항 제안
- LLM을 사용하여 코드 문서화

![이미지 설명](../../../../../static/img/code_understanding.png)

## 개요

코드에 대한 QA 파이프라인은 [문서 질문 응답을 위한 단계](/docs/use_cases/question_answering)를 따르지만 몇 가지 차이점이 있습니다:

특히, 몇 가지 작업을 수행하는 [분할 전략](/docs/integrations/document_loaders/source_code)을 사용할 수 있습니다:

- 각 최상위 함수 및 클래스가 별도의 문서로 로드되도록 유지합니다.
- 나머지는 별도의 문서에 넣습니다.
- 각 분할의 출처에 대한 메타데이터를 유지합니다.

## 빠른 시작

```python
%pip install --upgrade --quiet langchain-openai tiktoken langchain-chroma langchain GitPython

# 환경 변수 OPENAI_API_KEY 설정 또는 .env 파일에서 로드

# import dotenv

# dotenv.load_dotenv()

```

[이 노트북](https://github.com/cristobalcl/LearningLangChain/blob/master/notebooks/04%20-%20QA%20with%20code.md)의 구조를 따르고 [문맥 인식 코드 분할](/docs/integrations/document_loaders/source_code)을 사용합니다.

### 로딩

`langchain_community.document_loaders.TextLoader`를 사용하여 모든 파이썬 프로젝트 파일을 업로드합니다.

다음 스크립트는 LangChain 저장소의 파일을 반복하면서 모든 `.py` 파일(즉, **문서**)을 로드합니다:

```python
from git import Repo
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import Language
```

```python
# 클론

repo_path = "/Users/jacoblee/Desktop/test_repo"
repo = Repo.clone_from("https://github.com/langchain-ai/langchain", to_path=repo_path)
```

[`LanguageParser`](/docs/integrations/document_loaders/source_code)를 사용하여 파이썬 코드를 로드합니다. 이 작업은 다음을 수행합니다:

- 최상위 함수와 클래스를 함께 유지합니다(하나의 문서로).
- 나머지 코드를 별도의 문서에 넣습니다.
- 각 분할의 출처에 대한 메타데이터를 유지합니다.

```python
# 로드

loader = GenericLoader.from_filesystem(
    repo_path + "/libs/core/langchain_core",
    glob="**/*",
    suffixes=[".py"],
    exclude=["**/non-utf8-encoding.py"],
    parser=LanguageParser(language=Language.PYTHON, parser_threshold=500),
)
documents = loader.load()
len(documents)
```

```output
295
```

### 분할

임베딩 및 벡터 저장을 위해 `Document`를 청크로 분할합니다.

`RecursiveCharacterTextSplitter`를 사용하여 `language`를 지정할 수 있습니다.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON, chunk_size=2000, chunk_overlap=200
)
texts = python_splitter.split_documents(documents)
len(texts)
```

```output
898
```

### RetrievalQA

문서를 내용에 대해 의미론적으로 검색할 수 있는 방식으로 저장해야 합니다.

가장 일반적인 접근 방식은 각 문서의 내용을 임베드한 다음 임베딩 및 문서를 벡터 저장소에 저장하는 것입니다.

벡터 저장소 검색기를 설정할 때:

- 검색을 위해 [최대 한계 관련성](/docs/use_cases/question_answering)을 테스트합니다.
- 반환된 문서는 8개입니다.

#### 더 알아보기

- 40개 이상의 벡터 저장소 통합을 [여기](https://integrations.langchain.com/)에서 탐색하세요.
- 벡터 저장소에 대한 추가 문서는 [여기](/docs/modules/data_connection/vectorstores/)에서 확인하세요.
- 30개 이상의 텍스트 임베딩 통합을 [여기](https://integrations.langchain.com/)에서 탐색하세요.
- 임베딩 모델에 대한 추가 문서는 [여기](/docs/modules/data_connection/text_embedding/)에서 확인하세요.

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

db = Chroma.from_documents(texts, OpenAIEmbeddings(disallowed_special=()))
retriever = db.as_retriever(
    search_type="mmr",  # "similarity"도 테스트합니다.
    search_kwargs={"k": 8},
)
```

### 채팅

[채팅봇](/docs/use_cases/chatbots)과 마찬가지로 채팅을 테스트합니다.

#### 더 알아보기

- 55개 이상의 LLM 및 채팅 모델 통합을 [여기](https://integrations.langchain.com/)에서 탐색하세요.
- LLM 및 채팅 모델에 대한 추가 문서는 [여기](/docs/modules/model_io/)에서 확인하세요.
- 로컬 LLM 사용: [PrivateGPT](https://github.com/imartinez/privateGPT) 및 [GPT4All](https://github.com/nomic-ai/gpt4all)의 인기는 로컬에서 LLM을 실행하는 것의 중요성을 강조합니다.

```python
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4")

# 먼저 이 검색 쿼리를 생성하기 위해 LLM에 전달할 프롬프트가 필요합니다.

prompt = ChatPromptTemplate.from_messages(
    [
        ("placeholder", "{chat_history}"),
        ("user", "{input}"),
        (
            "user",
            "위의 대화를 바탕으로 대화와 관련된 정보를 검색하기 위해 검색 쿼리를 생성하세요.",
        ),
    ]
)

retriever_chain = create_history_aware_retriever(llm, retriever, prompt)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "다음 문맥을 바탕으로 사용자의 질문에 답하세요:\n\n{context}",
        ),
        ("placeholder", "{chat_history}"),
        ("user", "{input}"),
    ]
)
document_chain = create_stuff_documents_chain(llm, prompt)

qa = create_retrieval_chain(retriever_chain, document_chain)
```

```python
question = "RunnableBinding이 무엇인가요?"
result = qa.invoke({"input": question})
result["answer"]
```

```output
'RunnableBinding은 체인에서 Runnable과 필요한 인수가 포함되지 않거나 사용자 입력에 포함되지 않은 인수가 필요한 경우 인수를 바인딩하는 데 사용되는 LangChain 라이브러리의 클래스입니다. 이는 바인딩된 인수와 구성을 가진 새로운 Runnable을 반환하는 데 유용합니다. RunnableBinding 클래스의 bind 메서드는 이 작업을 수행하는 데 사용됩니다.'
```

```python
questions = [
    "Runnable 클래스에서 파생된 클래스는 무엇입니까?",
    "Runnable 클래스 계층 구조와 관련하여 코드에서 제안하는 한 가지 개선 사항은 무엇입니까?",
]

for question in questions:
    result = qa.invoke({"input": question})
    print(f"-> **질문**: {question} \n")
    print(f"**답변**: {result['answer']} \n")
```

```output
-> **질문**: Runnable 클래스에서 파생된 클래스는 무엇입니까?

**답변**: 문맥에서 언급된 Runnable 클래스에서 파생된 클래스는 RunnableLambda, RunnableLearnable, RunnableSerializable, RunnableWithFallbacks입니다.

-> **질문**: Runnable 클래스 계층 구조와 관련하여 코드에서 제안하는 한 가지 개선 사항은 무엇입니까?

**답변**: 잠재적인 개선 사항 중 하나는 다양한 유형의 Runnable 클래스에 대해 추상 기본 클래스(ABCs) 또는 인터페이스를 도입하는 것입니다. 현재 RunnableLambda, RunnableParallel 등과 같은 다양한 Runnable 유형이 각각 고유의 메서드와 속성을 가지고 있는 것 같습니다. 모든 이러한 클래스에 대한 공통 인터페이스 또는 ABC를 정의하면 일관성을 보장하고 코드베이스를 더 잘 조직할 수 있습니다. 또한, 인터페이스 또는 ABC에 정의된 메서드를 구현하기만 하면 되므로 미래에 새로운 유형의 Runnable 클래스를 추가하기가 더 쉬워질 것입니다.
```

그런 다음 [LangSmith 추적](https://smith.langchain.com/public/616f6620-f49f-46c7-8f4b-dae847705c5d/r)을 확인하여 내부에서 무슨 일이 일어나고 있는지 볼 수 있습니다:

- 특히, 검색 출력에서 코드가 잘 구조화되고 함께 유지됩니다.
- 검색된 코드 및 채팅 기록이 LLM에 전달되어 답변을 정제합니다.

![이미지 설명](../../../../../static/img/code_retrieval.png)

### 오픈 소스 LLM

로컬 OSS 모델을 쿼리하기 위해 LangChain의 [Ollama 통합](https://ollama.com/)을 사용합니다.

최신 사용 가능한 모델을 [여기](https://ollama.com/library)에서 확인하세요.

```python
%pip install --upgrade --quiet langchain-community
```

```python
from langchain_community.chat_models.ollama import ChatOllama

llm = ChatOllama(model="codellama")
```

모델의 지식을 테스트하기 위해 일반적인 코딩 질문을 실행해 보겠습니다:

```python
response_message = llm.invoke(
    "bash에서 지난 달에 수정된 현재 디렉토리의 모든 텍스트 파일을 나열하려면 어떻게 해야 하나요?"
)

print(response_message.content)
print(response_message.response_metadata)
```

```output

현재 디렉토리에서 지난달에 수정된 모든 텍스트 파일을 찾으려면 `find` 명령어와 `-mtime` 옵션을 사용할 수 있습니다. 다음은 예제 명령어입니다:
    ```bash
    find . -type f -name "*.txt" -mtime -30
    ```

이 명령어는 지난 30일 동안 수정된 현재 디렉토리(`.`)의 모든 텍스트 파일을 나열합니다. `-type f` 옵션은 디렉토리나 다른 유형의 파일이 아닌 일반 파일만 일치하도록 합니다. `-name "*.txt"` 옵션은 `.txt` 확장자를 가진 파일로 검색을 제한합니다. 마지막으로, `-mtime -30` 옵션은 지난 30일 동안 수정된 파일을 찾고자 함을 지정합니다.

`-mmin` 옵션을 사용하여 지난달에 수정된 현재 디렉토리의 모든 텍스트 파일을 찾는 `find` 명령어도 사용할 수 있습니다. 다음은 예제 명령어입니다:

    ```bash
    find . -type f -name "*.txt" -mmin -4320
    ```

이 명령어는 지난 30일 동안 수정된 현재 디렉토리(`.`)의 모든 텍스트 파일을 나열합니다. `-type f` 옵션은 디렉토리나 다른 유형의 파일이 아닌 일반 파일만 일치하도록 합니다. `-name "*.txt"` 옵션은 `.txt` 확장자를 가진 파일로 검색을 제한합니다. 마지막으로, `-mmin -4320` 옵션은 지난 4320분(한 달) 동안 수정된 파일을 찾고자 함을 지정합니다.

`ls` 명령어와 `-l` 옵션을 사용하고 `grep` 명령어로 텍스트 파일을 필터링할 수도 있습니다. 다음은 예제 명령어입니다:

    ```bash
    ls -l | grep "*.txt"
    ```

이 명령어는 지난 30일 동안 수정된 현재 디렉토리(`.`)의 모든 텍스트 파일을 나열합니다. `ls` 명령어의 `-l` 옵션은 수정 시간을 포함하여 파일을 긴 형식으로 나열하며, `grep` 명령어는 지정된 패턴과 일치하지 않는 파일을 필터링합니다.

이 명령어들은 대소문자를 구분하므로, 다른 확장자(e.g., `.TXT`)를 가진 파일은 일치하지 않습니다.
{'model': 'codellama', 'created_at': '2024-04-03T00:41:44.014203Z', 'message': {'role': 'assistant', 'content': ''}, 'done': True, 'total_duration': 27078466916, 'load_duration': 12947208, 'prompt_eval_count': 44, 'prompt_eval_duration': 11497468000, 'eval_count': 510, 'eval_duration': 15548191000}

```

이제 이전에 로드한 벡터 저장소로 설정해 보겠습니다.

더 낮은 전력의 로컬 모델을 위해 대화적 측면을 생략하여 관리하기 쉽게 합니다:

```python
# from langchain.chains.question_answering import load_qa_chain

# # 프롬프트

# 템플릿 = """다음 문맥 조각을 사용하여 끝에 있는 질문에 답하세요.

# 답을 모르면 그냥 모른다고 말하세요. 답을 지어내려고 하지 마세요.

# 최대한 세 문장으로 답변을 간결하게 유지하세요.

# {context}

# 질문: {question}

# 유용한 답변:"""

# QA_CHAIN_PROMPT = PromptTemplate(

# input_variables=["context", "question"],

# template=template,

# )

system_template = """
다음 문맥을 바탕으로 사용자의 질문에 답하세요.
답을 모르면 그냥 모른다고 말하세요. 답을 지어내려고 하지 마세요.
최대한 세 문장으로 답변을 간결하게 유지하세요:

{context}
"""

# 먼저 이 검색 쿼리를 생성하기 위해 LLM에 전달할 프롬프트가 필요합니다.

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_template),
        ("user", "{input}"),
    ]
)
document_chain = create_stuff_documents_chain(llm, prompt)

qa_chain = create_retrieval_chain(retriever, document_chain)
```

```python
# 가독성을 위해 answer 키 아래의 값만 반환합니다.

qa_chain.pick("answer").invoke({"input": "RunnableBinding이 무엇인가요?"})
```

```output
RunnableBinding은 LangChain 프레임워크의 고급 클래스입니다. 이는 프로그램과 LLM 또는 기타 데이터 소스 사이의 추상화 계층입니다. 주 목표는 프로그램이 LLM 또는 기타 데이터 소스로부터 쉽게 응답을 가져올 수 있도록 하는 것입니다.
```

그럴듯합니다! 이제 이전에 로드한 벡터 저장소로 설정해 보겠습니다.

대화적 측면을 생략하여 로컬 모델에서 더 관리하기 쉽게 합니다.

[LangSmith 추적](https://smith.langchain.com/public/d8bb2af8-99cd-406b-a870-f255f4a2423c/r)에서 검색된 문서가 컨텍스트로 사용된 것을 확인할 수 있습니다.