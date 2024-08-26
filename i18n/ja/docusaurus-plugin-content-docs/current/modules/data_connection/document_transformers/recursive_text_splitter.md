---
translated: true
---

# 文字による再帰的な分割

このテキスト分割器は一般的なテキストに推奨されるものです。文字のリストによってパラメータ化されています。それらの順番で分割しようとし、チャンクが十分に小さくなるまで続けます。デフォルトのリストは `["\n\n", "\n", " ", ""]` です。これにより、段落(そして文章、そして単語)が可能な限り一緒に保たれるようになります。それらは一般的に意味的に最も強く関連しているピースだと考えられるためです。

1. テキストがどのように分割されるか: 文字のリストによって。
2. チャンクのサイズがどのように測定されるか: 文字数によって。

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

## 単語の境界がない言語からのテキストの分割

いくつかの文字システムには[単語の境界](https://en.wikipedia.org/wiki/Category:Writing_systems_without_word_boundaries)がありません。例えば中国語、日本語、タイ語などです。デフォルトの区切り文字リスト `["\n\n", "\n", " ", ""]` を使うと、単語がチャンク間で分割されてしまう可能性があります。単語を一緒に保つには、区切り文字のリストを以下のように上書きできます:

* ASCII の句点 "`.`"、[全角](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block))の句点 "`．`"(中国語テキストで使用)、[漢字の句点](https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation) "`。`"(日本語と中国語で使用)を追加する
* タイ語、ミャンマー語、クメール語、日本語で使用される[ゼロ幅スペース](https://en.wikipedia.org/wiki/Zero-width_space)を追加する
* ASCII のカンマ "`,`"、全角のカンマ "`，`"、Unicode の漢字のカンマ "`、`"を追加する

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
