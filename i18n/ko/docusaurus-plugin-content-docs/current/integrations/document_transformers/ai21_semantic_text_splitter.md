---
translated: true
---

# AI21 시맨틱 텍스트 분할기

이 예제에서는 LangChain에서 AI21SemanticTextSplitter를 사용하는 방법을 살펴봅니다.

## 설치

```python
pip install langchain-ai21
```

## 환경 설정

AI21 API 키를 얻고 AI21_API_KEY 환경 변수를 설정해야 합니다:

```python
import os
from getpass import getpass

os.environ["AI21_API_KEY"] = getpass()
```

## 사용 예시

### 시맨틱 의미에 따른 텍스트 분할

이 예제에서는 AI21SemanticTextSplitter를 사용하여 텍스트를 시맨틱 의미에 따라 청크로 분할하는 방법을 보여줍니다.

```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter()
chunks = semantic_text_splitter.split_text(TEXT)

print(f"The text has been split into {len(chunks)} chunks.")
for chunk in chunks:
    print(chunk)
    print("====")
```

### 시맨틱 의미에 따른 텍스트 분할 및 병합

이 예제에서는 AI21SemanticTextSplitter를 사용하여 텍스트를 시맨틱 의미에 따라 청크로 분할한 다음, `chunk_size`에 따라 청크를 병합하는 방법을 보여줍니다.

```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter_chunks = AI21SemanticTextSplitter(chunk_size=1000)
chunks = semantic_text_splitter_chunks.split_text(TEXT)

print(f"The text has been split into {len(chunks)} chunks.")
for chunk in chunks:
    print(chunk)
    print("====")
```

### 문서로 텍스트 분할

이 예제에서는 AI21SemanticTextSplitter를 사용하여 텍스트를 시맨틱 의미에 따라 문서로 분할하는 방법을 보여줍니다. 메타데이터에는 각 문서의 유형이 포함됩니다.

```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter()
documents = semantic_text_splitter.split_text_to_documents(TEXT)

print(f"The text has been split into {len(documents)} Documents.")
for doc in documents:
    print(f"type: {doc.metadata['source_type']}")
    print(f"text: {doc.page_content}")
    print("====")
```

### 메타데이터가 포함된 문서 생성

이 예제에서는 AI21SemanticTextSplitter를 사용하여 텍스트에서 문서를 생성하고, 각 문서에 사용자 정의 메타데이터를 추가하는 방법을 보여줍니다.

```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter()
texts = [TEXT]
documents = semantic_text_splitter.create_documents(
    texts=texts, metadatas=[{"pikachu": "pika pika"}]
)

print(f"The text has been split into {len(documents)} Documents.")
for doc in documents:
    print(f"metadata: {doc.metadata}")
    print(f"text: {doc.page_content}")
    print("====")
```

### 시작 인덱스를 포함한 문서로 텍스트 분할

이 예제에서는 AI21SemanticTextSplitter를 사용하여 텍스트를 시맨틱 의미에 따라 문서로 분할하는 방법을 보여줍니다. 메타데이터에는 각 문서의 시작 인덱스가 포함됩니다.
**참고** 시작 인덱스는 각 청크의 실제 시작 인덱스가 아니라 청크의 순서를 나타냅니다.

```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter(add_start_index=True)
documents = semantic_text_splitter.create_documents(texts=[TEXT])
print(f"The text has been split into {len(documents)} Documents.")
for doc in documents:
    print(f"start_index: {doc.metadata['start_index']}")
    print(f"text: {doc.page_content}")
    print("====")
```

### 문서 분할

이 예제에서는 AI21SemanticTextSplitter를 사용하여 문서 목록을 시맨틱 의미에 따라 청크로 분할하는 방법을 보여줍니다.

```python
from langchain_ai21 import AI21SemanticTextSplitter
from langchain_core.documents import Document

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter()
document = Document(page_content=TEXT, metadata={"hello": "goodbye"})
documents = semantic_text_splitter.split_documents([document])
print(f"The document list has been split into {len(documents)} Documents.")
for doc in documents:
    print(f"text: {doc.page_content}")
    print(f"metadata: {doc.metadata}")
    print("====")
```
