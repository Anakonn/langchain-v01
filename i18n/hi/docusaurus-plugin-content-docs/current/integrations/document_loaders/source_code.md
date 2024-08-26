---
translated: true
---

# स्रोत कोड

यह नोटबुक स्रोत कोड फ़ाइलों को लोड करने के लिए एक विशेष दृष्टिकोण को कवर करता है जिसमें भाषा पार्सिंग का उपयोग किया जाता है: कोड में प्रत्येक शीर्ष-स्तरीय फ़ंक्शन और क्लास को अलग-अलग दस्तावेज़ों में लोड किया जाता है। शीर्ष-स्तरीय कोड में से किसी भी अन्य कोड को अलग दस्तावेज़ में लोड किया जाएगा।

यह दृष्टिकोण क्यूए मॉडलों की सटीकता को बढ़ा सकता है।

कोड पार्सिंग के लिए समर्थित भाषाएं हैं:

- C (*)
- C++ (*)
- C# (*)
- COBOL
- Go (*)
- Java (*)
- JavaScript (पैकेज `esprima` की आवश्यकता है)
- Kotlin (*)
- Lua (*)
- Perl (*)
- Python
- Ruby (*)
- Rust (*)
- Scala (*)
- TypeScript (*)

(*) के साथ चिह्नित वस्तुएं `tree_sitter` और `tree_sitter_languages` पैकेजों की आवश्यकता होती हैं।
`tree_sitter` का उपयोग करके अतिरिक्त भाषाओं का समर्थन जोड़ना सरल है,
हालांकि इसके लिए वर्तमान में LangChain को संशोधित करना आवश्यक है।

पार्सिंग के लिए उपयोग की जाने वाली भाषा और पार्सिंग के आधार पर विभाजन के लिए आवश्यक न्यूनतम पंक्तियों की संख्या कॉन्फ़िगर की जा सकती है।

यदि कोई भाषा स्पष्ट रूप से निर्दिष्ट नहीं है, तो `LanguageParser` फ़ाइलनाम एक्सटेंशन, यदि मौजूद हों, से एक भाषा का अनुमान लगाएगा।

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

छोटी फ़ाइलों के लिए पार्सर को अक्षम किया जा सकता है।

पैरामीटर `parser_threshold` वह न्यूनतम पंक्तियों की संख्या है जिसके पास स्रोत कोड फ़ाइल होनी चाहिए ताकि पार्सर का उपयोग करके विभाजन किया जा सके।

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

## विभाजन

उन फ़ंक्शनों, क्लासों या स्क्रिप्ट के लिए अतिरिक्त विभाजन की आवश्यकता हो सकती है जो बहुत बड़े हैं।

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

## Tree-sitter टेम्प्लेट का उपयोग करके भाषाएं जोड़ना

Tree-Sitter टेम्प्लेट का उपयोग करके भाषा समर्थन का विस्तार करने के लिए कुछ महत्वपूर्ण कदम हैं:

1. **नई भाषा फ़ाइल बनाना**:
    - शुरू करने के लिए, निर्दिष्ट निर्देशिका (langchain/libs/community/langchain_community/document_loaders/parsers/language) में एक नई फ़ाइल बनाएं।
    - मौजूदा भाषा फ़ाइलों जैसे **`cpp.py`** की संरचना और पार्सिंग लॉजिक पर आधारित हो।
    - आपको langchain निर्देशिका (langchain/libs/langchain/langchain/document_loaders/parsers/language) में एक फ़ाइल भी बनानी होगी।
2. **भाषा विशिष्ट पार्सिंग**:
    - **`cpp.py`** फ़ाइल में उपयोग की गई संरचना का अनुकरण करें, और इसे उस भाषा के अनुकूल बनाएं जिसे आप शामिल कर रहे हैं।
    - प्राथमिक परिवर्तन चंक क्वेरी एरे को उस भाषा की वाक्य-संरचना और संरचना के अनुकूल समायोजित करना है जिसका आप पार्सिंग कर रहे हैं।
3. **भाषा पार्सर का परीक्षण**:
    - विस्तृत सत्यापन के लिए, नई भाषा के लिए एक परीक्षण फ़ाइल उत्पन्न करें। निर्दिष्ट निर्देशिका (langchain/libs/community/tests/unit_tests/document_loaders/parsers/language) में **`test_language.py`** बनाएं।
    - **`test_cpp.py`** के उदाहरण का पालन करें ताकि नई भाषा में पार्स किए गए तत्वों के लिए मूलभूत परीक्षण स्थापित किए जा सकें।
4. **पार्सर और पाठ विभाजक में एकीकरण**:
    - **`language_parser.py`** फ़ाइल में अपनी नई भाषा को शामिल करें। LANGUAGE_EXTENSIONS और LANGUAGE_SEGMENTERS को अपडेट करना सुनिश्चित करें, साथ ही LanguageParser के docstring को भी अपडेट करें ताकि नई भाषा को पहचाना और संभाला जा सके।
    - यह भी सुनिश्चित करें कि आपकी भाषा **`text_splitter.py`** में क्लास Language में शामिल है ताकि उचित पार्सिंग हो सके।

इन चरणों का पालन करके और व्यापक परीक्षण और एकीकरण सुनिश्चित करके, आप Tree-Sitter टेम्प्लेट का उपयोग करके भाषा समर्थन का विस्तार करने में सफल होंगे।

शुभकामनाएं!
