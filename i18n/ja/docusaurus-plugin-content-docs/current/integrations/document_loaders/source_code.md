---
translated: true
---

# ソースコード

このノートブックでは、言語解析を使った特別なアプローチでソースコードファイルを読み込む方法を説明します。コード内の各トップレベルの関数とクラスが個別のドキュメントにロードされます。既にロードされた関数とクラス以外のトップレベルのコードは、別のドキュメントにロードされます。

このアプローチにより、ソースコードに対するQAモデルの精度が向上する可能性があります。

サポートされるコード解析言語は以下の通りです:

- C (*)
- C++ (*)
- C# (*)
- COBOL
- Go (*)
- Java (*)
- JavaScript (パッケージ `esprima` が必要)
- Kotlin (*)
- Lua (*)
- Perl (*)
- Python
- Ruby (*)
- Rust (*)
- Scala (*)
- TypeScript (*)

(*) で示された項目には `tree_sitter` と `tree_sitter_languages` パッケージが必要です。
`tree_sitter` を使えば、他の言語のサポートを簡単に追加できますが、現在のところLangChainの変更が必要です。

解析言語と、分割を有効にするための最小行数を設定できます。

言語が明示的に指定されていない場合、`LanguageParser` はファイル名の拡張子から言語を推測します。

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

小さなファイルの場合はパーサーを無効にできます。

`parser_threshold` パラメーターは、ソースコードファイルがパーサーを使って分割されるための最小行数を指定します。

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

## 分割

関数、クラス、スクリプトが大きすぎる場合は、さらに分割が必要になる可能性があります。

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

## Tree-Sitter テンプレートを使った言語の追加

Tree-Sitter テンプレートを使って言語サポートを拡張するには、以下の重要なステップが必要です:

1. **新しい言語ファイルの作成**:
    - 指定されたディレクトリ(langchain/libs/community/langchain_community/document_loaders/parsers/language)に新しいファイルを作成します。
    - 既存の言語ファイル(例: **`cpp.py`**)の構造とパース ロジックに基づいてこのファイルをモデル化します。
    - langchain ディレクトリ(langchain/libs/langchain/langchain/document_loaders/parsers/language)にも同様のファイルを作成する必要があります。
2. **言語固有の解析**:
    - **`cpp.py`** ファイルで使用されている構造を模倣し、取り入れる言語に合わせて調整します。
    - 主な変更点は、chunk query 配列を、取り入れる言語の構文と構造に合わせて調整することです。
3. **言語パーサーのテスト**:
    - 徹底的な検証のため、新しい言語用のテストファイルを生成します。指定されたディレクトリ(langchain/libs/community/tests/unit_tests/document_loaders/parsers/language)に **`test_language.py`** を作成します。
    - **`test_cpp.py`** の例に従って、新しい言語のパースされた要素に対する基本的なテストを確立します。
4. **パーサーとテキスト分割機能への統合**:
    - **`language_parser.py`** ファイルに新しい言語を組み込みます。LANGUAGE_EXTENSIONS と LANGUAGE_SEGMENTERS を更新し、LanguageParser のドキュメントを更新して、追加された言語を認識し処理できるようにします。
    - **`text_splitter.py`** のクラス Language にも、言語が含まれていることを確認してください。

これらのステップに従い、徹底的なテストと統合を行うことで、Tree-Sitter テンプレートを使って言語サポートを拡張できます。

頑張ってください!
