---
translated: true
---

# 문자별로 재귀적으로 분할하기

이 텍스트 분할기는 일반적인 텍스트에 권장되는 것입니다. 문자 목록으로 매개변수화됩니다. 청크가 충분히 작아질 때까지 순서대로 분할하려고 합니다. 기본 목록은 `["\n\n", "\n", " ", ""]`입니다. 이는 문단(그리고 문장, 단어)이 가능한 한 함께 유지되도록 하는 효과가 있습니다. 일반적으로 그것들이 의미적으로 가장 강하게 관련된 텍스트 조각으로 보입니다.

1. 텍스트가 어떻게 분할되는가: 문자 목록에 의해.
2. 청크 크기가 어떻게 측정되는가: 문자 수에 의해.

```python
%pip install -qU langchain-text-splitters
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
```

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
text_splitter = RecursiveCharacterTextSplitter(
    # Set a really small chunk size, just to show.
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    is_separator_regex=False,
)
```

```python
texts = text_splitter.create_documents([state_of_the_union])
print(texts[0])
print(texts[1])
```

```output
page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and'
page_content='of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.'
```

```python
text_splitter.split_text(state_of_the_union)[:2]
```

```output
['Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and',
 'of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.']
```

## 단어 경계가 없는 언어의 텍스트 분할

일부 문자 체계에는 [단어 경계](https://en.wikipedia.org/wiki/Category:Writing_systems_without_word_boundaries)가 없습니다. 예를 들어 중국어, 일본어, 태국어 등입니다. `["\n\n", "\n", " ", ""]`의 기본 구분자 목록으로 텍스트를 분할하면 단어가 청크 사이에 분할될 수 있습니다. 단어를 함께 유지하려면 추가 구두점을 포함하도록 구분자 목록을 재정의할 수 있습니다:

* ASCII 마침표 "`.`", [전각](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)) 마침표 "`．`"(중국어 텍스트에 사용), [표의문자 마침표](https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation) "`。`"(일본어와 중국어에 사용) 추가
* 태국어, 미얀마어, 크메르어, 일본어에서 사용되는 [zero-width space] 추가
* ASCII 쉼표 "`,`", 전각 쉼표 "`，`", 표의문자 쉼표 "`、`" 추가

```python
text_splitter = RecursiveCharacterTextSplitter(
    separators=[
        "\n\n",
        "\n",
        " ",
        ".",
        ",",
        "\u200b",  # Zero-width space
        "\uff0c",  # Fullwidth comma
        "\u3001",  # Ideographic comma
        "\uff0e",  # Fullwidth full stop
        "\u3002",  # Ideographic full stop
        "",
    ],
    # Existing args
)
```
