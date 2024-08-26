---
translated: true
---

# トークンで分割

言語モデルにはトークンの制限があります。トークンの制限を超えてはいけません。テキストをチャンクに分割する際には、トークン数を数えることが良い考えです。多くのトークナイザーがあります。テキストのトークン数を数える際には、言語モデルで使用されているものと同じトークナイザーを使用すべきです。

## tiktoken

>[tiktoken](https://github.com/openai/tiktoken) は `OpenAI` によって作成された高速な `BPE` トークナイザーです。

トークンの使用量を推定するために使用できます。OpenAI モデルに対してはより正確である可能性があります。

1. テキストの分割方法：渡された文字による。
2. チャンクサイズの測定方法：`tiktoken` トークナイザーによる。

```python
%pip install --upgrade --quiet langchain-text-splitters tiktoken
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
from langchain_text_splitters import CharacterTextSplitter
```

`.from_tiktoken_encoder()` メソッドは `encoding` (例：`cl100k_base`) または `model_name` (例：`gpt-4`) のいずれかを引数として取ります。`chunk_size`、`chunk_overlap`、および `separators` のようなすべての追加引数は `CharacterTextSplitter` をインスタンス化するために使用されます：

```python
text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    encoding="cl100k_base", chunk_size=100, chunk_overlap=0
)
texts = text_splitter.split_text(state_of_the_union)
```

```python
print(texts[0])
```

```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.

Last year COVID-19 kept us apart. This year we are finally together again.

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.

With a duty to one another to the American people to the Constitution.
```

`CharacterTextSplitter.from_tiktoken_encoder` を使用する場合、テキストは `CharacterTextSplitter` によってのみ分割され、`tiktoken` トークナイザーはスプリットをマージするために使用されます。これは、スプリットが `tiktoken` トークナイザーによって測定されたチャンクサイズよりも大きくなる可能性があることを意味します。言語モデルによって許可されるトークンのチャンクサイズよりも大きくないことを確認するために `RecursiveCharacterTextSplitter.from_tiktoken_encoder` を使用できます。各スプリットが大きい場合、それは再帰的に分割されます：

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    model_name="gpt-4",
    chunk_size=100,
    chunk_overlap=0,
)
```

tiktoken スプリッターを直接ロードすることもでき、各スプリットがチャンクサイズよりも小さいことを確認できます。

```python
from langchain_text_splitters import TokenTextSplitter

text_splitter = TokenTextSplitter(chunk_size=10, chunk_overlap=0)

texts = text_splitter.split_text(state_of_the_union)
print(texts[0])
```

一部の書き言葉（例：中国語や日本語）には、2つ以上のトークンにエンコードされる文字があります。`TokenTextSplitter` を直接使用すると、文字のトークンが2つのチャンク間で分割され、ユニコード文字が不正になる可能性があります。チャンクに有効なユニコード文字列が含まれるようにするには、`RecursiveCharacterTextSplitter.from_tiktoken_encoder` または `CharacterTextSplitter.from_tiktoken_encoder` を使用してください。

## spaCy

>[spaCy](https://spacy.io/) は、プログラミング言語 Python および Cython で書かれた高度な自然言語処理のためのオープンソースソフトウェアライブラリです。

`NLTK` の代替として [spaCy トークナイザー](https://spacy.io/api/tokenizer) を使用することもできます。

1. テキストの分割方法：`spaCy` トークナイザーによる。
2. チャンクサイズの測定方法：文字数による。

```python
%pip install --upgrade --quiet  spacy
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
```

```python
from langchain_text_splitters import SpacyTextSplitter

text_splitter = SpacyTextSplitter(chunk_size=1000)
```

```python
texts = text_splitter.split_text(state_of_the_union)
print(texts[0])
```

```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman.

Members of Congress and the Cabinet.

Justices of the Supreme Court.

My fellow Americans.



Last year COVID-19 kept us apart.

This year we are finally together again.



Tonight, we meet as Democrats Republicans and Independents.

But most importantly as Americans.



With a duty to one another to the American people to the Constitution.



And with an unwavering resolve that freedom will always triumph over tyranny.



Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways.

But he badly miscalculated.



He thought he could roll into Ukraine and the world would roll over.

Instead he met a wall of strength he never imagined.



He met the Ukrainian people.



From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.
```

## SentenceTransformers

`SentenceTransformersTokenTextSplitter` は、センテンス・トランスフォーマーモデルで使用するための特殊なテキストスプリッターです。デフォルトの動作は、使用したいセンテンス・トランスフォーマーモデルのトークンウィンドウに収まるチャンクにテキストを分割することです。

```python
from langchain_text_splitters import SentenceTransformersTokenTextSplitter
```

```python
splitter = SentenceTransformersTokenTextSplitter(chunk_overlap=0)
text = "Lorem "
```

```python
count_start_and_stop_tokens = 2
text_token_count = splitter.count_tokens(text=text) - count_start_and_stop_tokens
print(text_token_count)
```

```output
2
```

```python
token_multiplier = splitter.maximum_tokens_per_chunk // text_token_count + 1

# `text_to_split` does not fit in a single chunk
text_to_split = text * token_multiplier

print(f"tokens in text to split: {splitter.count_tokens(text=text_to_split)}")
```

```output
tokens in text to split: 514
```

```python
text_chunks = splitter.split_text(text=text_to_split)

print(text_chunks[1])
```

```output
lorem
```

## NLTK

>[The Natural Language Toolkit](https://en.wikipedia.org/wiki/Natural_Language_Toolkit)、または一般的に [NLTK](https://www.nltk.org/) は、Python プログラミング言語で書かれた英語の象徴的および統計的自然言語処理（NLP）のためのライブラリおよびプログラムのスイートです。

"\n\n" で分割するだけでなく、`NLTK` を使用して [NLTK トークナイザー](https://www.nltk.org/api/nltk.tokenize.html) に基づいて分割することができます。

1. テキストの分割方法：`NLTK` トークナイザーによる。
2. チャンクサイズの測定方法：文字数による。

```python
# pip install nltk
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
```

```python
from langchain_text_splitters import NLTKTextSplitter

text_splitter = NLTKTextSplitter(chunk_size=1000)
```

```python
texts = text_splitter.split_text(state_of_the_union)
print(texts[0])
```

```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman.

Members of Congress and the Cabinet.

Justices of the Supreme Court.

My fellow Americans.

Last year COVID-19 kept us apart.

This year we are finally together again.

Tonight, we meet as Democrats Republicans and Independents.

But most importantly as Americans.

With a duty to one another to the American people to the Constitution.

And with an unwavering resolve that freedom will always triumph over tyranny.

Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways.

But he badly miscalculated.

He thought he could roll into Ukraine and the world would roll over.

Instead he met a wall of strength he never imagined.

He met the Ukrainian people.

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.

Groups of citizens blocking tanks with their bodies.
```

## KoNLPY

> [KoNLPy: Korean NLP in Python](https://konlpy.org/en/latest/) は、韓国語の自然言語処理（NLP）のためのPythonパッケージです。

トークン分割には、テキストをトークンと呼ばれるより小さく扱いやすい単位に分割することが含まれます。これらのトークンは、多くの場合、単語、句、記号、またはさらなる処理および分析に重要な他の意味のある要素です。英語のような言語では、トークン分割は通常、単語をスペースや句読点で分けることを含みます。トークン分割の効果は、トークナイザーの言語構造の理解に大きく依存し、意味のあるトークンを生成することを保証します。英語のために設計されたトークナイザーは、韓国語のような他の言語の独自の意味構造を理解することができないため、韓国語の処理には効果的に使用できません。

### KoNLPyのKkmaアナライザーを使った韓国語のトークン分割

韓国語のテキストの場合、KoNLPYには `Kkma`（Korean Knowledge Morpheme Analyzer）と呼ばれる形態素解析器が含まれています。`Kkma` は韓国語のテキストの詳細な形態素解析を提供します。文を単語に、単語をそれぞれの形態素に分解し、各トークンの品詞を特定します。長いテキストを処理するのに特に有用な、個々の文にテキストのブロックを分割することができます。

### 使用上の注意

`Kkma` はその詳細な分析で知られていますが、この精度は処理速度に影響を与える可能性があることに注意が必要です。従って、`Kkma` は迅速なテキスト処理よりも分析の深さが優先されるアプリケーションに最適です。

```python
# pip install konlpy
```

```python
# This is a long Korean document that we want to split up into its component sentences.
with open("./your_korean_doc.txt") as f:
    korean_document = f.read()
```

```python
from langchain_text_splitters import KonlpyTextSplitter

text_splitter = KonlpyTextSplitter()
```

```python
texts = text_splitter.split_text(korean_document)
# The sentences are split with "\n\n" characters.
print(texts[0])
```

```output
춘향전 옛날에 남원에 이 도령이라는 벼슬아치 아들이 있었다.

그의 외모는 빛나는 달처럼 잘생겼고, 그의 학식과 기예는 남보다 뛰어났다.

한편, 이 마을에는 춘향이라는 절세 가인이 살고 있었다.

춘 향의 아름다움은 꽃과 같아 마을 사람들 로부터 많은 사랑을 받았다.

어느 봄날, 도령은 친구들과 놀러 나갔다가 춘 향을 만 나 첫 눈에 반하고 말았다.

두 사람은 서로 사랑하게 되었고, 이내 비밀스러운 사랑의 맹세를 나누었다.

하지만 좋은 날들은 오래가지 않았다.

도령의 아버지가 다른 곳으로 전근을 가게 되어 도령도 떠나 야만 했다.

이별의 아픔 속에서도, 두 사람은 재회를 기약하며 서로를 믿고 기다리기로 했다.

그러나 새로 부임한 관아의 사또가 춘 향의 아름다움에 욕심을 내 어 그녀에게 강요를 시작했다.

춘 향 은 도령에 대한 자신의 사랑을 지키기 위해, 사또의 요구를 단호히 거절했다.

이에 분노한 사또는 춘 향을 감옥에 가두고 혹독한 형벌을 내렸다.

이야기는 이 도령이 고위 관직에 오른 후, 춘 향을 구해 내는 것으로 끝난다.

두 사람은 오랜 시련 끝에 다시 만나게 되고, 그들의 사랑은 온 세상에 전해 지며 후세에까지 이어진다.

- 춘향전 (The Tale of Chunhyang)
```

## Hugging Face トークナイザー

>[Hugging Face](https://huggingface.co/docs/tokenizers/index) には多くのトークナイザーがあります。

Hugging Face トークナイザー、[GPT2TokenizerFast](https://huggingface.co/Ransaka/gpt2-tokenizer-fast) を使用して、トークンでテキストの長さを計算します。

1. テキストの分割方法：渡された文字による。
2. チャンクサイズの測定方法：`Hugging Face` トークナイザーによって計算されたトークン数による。

```python
from transformers import GPT2TokenizerFast

tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")
```

```python
# This is a long document we can split up.
with open("../../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
from langchain_text_splitters import CharacterTextSplitter
```

```python
text_splitter = CharacterTextSplitter.from_huggingface_tokenizer(
    tokenizer, chunk_size=100, chunk_overlap=0
)
texts = text_splitter.split_text(state_of_the_union)
```

```python
print(texts[0])
```

```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.

Last year COVID-19 kept us apart. This year we are finally together again.

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.

With a duty to one another to the American people to the Constitution.
```
