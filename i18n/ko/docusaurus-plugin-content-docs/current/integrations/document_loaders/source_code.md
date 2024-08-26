---
translated: true
---

# 소스 코드

이 노트북은 언어 파싱을 사용하는 특별한 방법으로 소스 코드 파일을 로드하는 방법을 다룹니다: 코드의 각 최상위 함수와 클래스가 별도의 문서로 로드됩니다. 이미 로드된 함수와 클래스 외부의 나머지 최상위 코드는 별도의 문서로 로드됩니다.

이러한 접근 방식은 QA 모델의 정확도를 높일 수 있습니다.

지원되는 코드 파싱 언어는 다음과 같습니다:

- C (*)
- C++ (*)
- C# (*)
- COBOL
- Go (*)
- Java (*)
- JavaScript (패키지 `esprima` 필요)
- Kotlin (*)
- Lua (*)
- Perl (*)
- Python
- Ruby (*)
- Rust (*)
- Scala (*)
- TypeScript (*)

(*) 표시된 항목은 `tree_sitter`와 `tree_sitter_languages` 패키지가 필요합니다.
`tree_sitter`를 사용하여 추가 언어를 지원하는 것은 간단하지만, 현재 LangChain을 수정해야 합니다.

파싱에 사용할 언어와 분할을 활성화하는 데 필요한 최소 행 수를 구성할 수 있습니다.

언어가 명시적으로 지정되지 않은 경우 `LanguageParser`는 파일 확장자(있는 경우)에서 언어를 추론합니다.

```python
%pip install -qU esprima esprima tree_sitter tree_sitter_languages
```

```python
import warnings

warnings.filterwarnings("ignore")
from pprint import pprint

from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import Language
```

```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".py", ".js"],
    parser=LanguageParser(),
)
docs = loader.load()
```

```python
len(docs)
```

```output
6
```

```python
for document in docs:
    pprint(document.metadata)
```

```output
{'content_type': 'functions_classes',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'functions_classes',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'simplified_code',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'functions_classes',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
{'content_type': 'functions_classes',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
{'content_type': 'simplified_code',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
```

```python
print("\n\n--8<--\n\n".join([document.page_content for document in docs]))
```

```output
class MyClass:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"Hello, {self.name}!")

--8<--

def main():
    name = input("Enter your name: ")
    obj = MyClass(name)
    obj.greet()

--8<--

# Code for: class MyClass:


# Code for: def main():


if __name__ == "__main__":
    main()

--8<--

class MyClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hello, ${this.name}!`);
  }
}

--8<--

function main() {
  const name = prompt("Enter your name:");
  const obj = new MyClass(name);
  obj.greet();
}

--8<--

// Code for: class MyClass {

// Code for: function main() {

main();
```

파일 크기가 작은 경우 파서를 비활성화할 수 있습니다.

`parser_threshold` 매개변수는 파서를 사용하여 분할하기 위해 소스 코드 파일이 가져야 하는 최소 행 수를 나타냅니다.

```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".py"],
    parser=LanguageParser(language=Language.PYTHON, parser_threshold=1000),
)
docs = loader.load()
```

```python
len(docs)
```

```output
1
```

```python
print(docs[0].page_content)
```

```output
class MyClass:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"Hello, {self.name}!")


def main():
    name = input("Enter your name: ")
    obj = MyClass(name)
    obj.greet()


if __name__ == "__main__":
    main()
```

## 분할

추가 분할이 필요할 수 있는 함수, 클래스 또는 스크립트가 있습니다.

```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".js"],
    parser=LanguageParser(language=Language.JS),
)
docs = loader.load()
```

```python
from langchain_text_splitters import (
    Language,
    RecursiveCharacterTextSplitter,
)
```

```python
js_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.JS, chunk_size=60, chunk_overlap=0
)
```

```python
result = js_splitter.split_documents(docs)
```

```python
len(result)
```

```output
7
```

```python
print("\n\n--8<--\n\n".join([document.page_content for document in result]))
```

```output
class MyClass {
  constructor(name) {
    this.name = name;

--8<--

}

--8<--

greet() {
    console.log(`Hello, ${this.name}!`);
  }
}

--8<--

function main() {
  const name = prompt("Enter your name:");

--8<--

const obj = new MyClass(name);
  obj.greet();
}

--8<--

// Code for: class MyClass {

// Code for: function main() {

--8<--

main();
```

## 언어 추가 - Tree-sitter 템플릿 사용

Tree-Sitter 템플릿을 사용하여 언어 지원을 확장하려면 몇 가지 필수 단계가 있습니다:

1. **새 언어 파일 만들기**:
    - 지정된 디렉토리에 새 파일을 만듭니다(langchain/libs/community/langchain_community/document_loaders/parsers/language).
    - 기존 언어 파일(예: **`cpp.py`**)의 구조와 구문 분석 논리를 기반으로 이 파일을 모델링합니다.
    - langchain 디렉토리에 파일을 만들어야 합니다(langchain/libs/langchain/langchain/document_loaders/parsers/language).
2. **언어별 구문 분석**:
    - **`cpp.py`** 파일에 사용된 구조를 모방하고, 구문 분석할 언어에 맞게 조정합니다.
    - 주요 변경 사항은 청크 쿼리 배열을 해당 언어의 구문과 구조에 맞게 조정하는 것입니다.
3. **언어 파서 테스트**:
    - 철저한 검증을 위해 새 언어에 대한 테스트 파일을 생성합니다. 지정된 디렉토리에 **`test_language.py`**를 만듭니다(langchain/libs/community/tests/unit_tests/document_loaders/parsers/language).
    - **`test_cpp.py`**의 예를 따라 새 언어의 구문 분석된 요소에 대한 기본 테스트를 수행합니다.
4. **파서 및 텍스트 분할기에 통합**:
    - **`language_parser.py`** 파일에 새 언어를 통합합니다. LANGUAGE_EXTENSIONS와 LANGUAGE_SEGMENTERS를 업데이트하고 LanguageParser의 docstring에서 추가된 언어를 인식하고 처리하도록 합니다.
    - **`text_splitter.py`**의 Language 클래스에 언어가 포함되어 있는지 확인합니다.

이러한 단계를 따르고 포괄적인 테스트와 통합을 보장하면 Tree-Sitter 템플릿을 사용하여 언어 지원을 성공적으로 확장할 수 있습니다.

행운을 빕니다!
