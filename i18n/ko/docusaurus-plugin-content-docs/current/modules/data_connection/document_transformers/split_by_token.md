---
translated: true
---

# 토큰으로 분할하기

언어 모델에는 토큰 제한이 있습니다. 토큰 제한을 초과해서는 안 됩니다. 텍스트를 청크로 분할할 때 토큰 수를 세는 것이 좋습니다. 많은 토크나이저가 있습니다. 텍스트의 토큰을 세는 경우 언어 모델에서 사용되는 것과 동일한 토크나이저를 사용해야 합니다.

## tiktoken

>[tiktoken](https://github.com/openai/tiktoken)은 `OpenAI`가 만든 빠른 `BPE` 토크나이저입니다.

우리는 이를 사용하여 사용된 토큰을 추정할 수 있습니다. OpenAI 모델에 더 정확할 것 같습니다.

1. 텍스트 분할 방식: 전달된 문자별
2. 청크 크기 측정 방식: `tiktoken` 토크나이저 사용

```python
%pip install --upgrade --quiet langchain-text-splitters tiktoken
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
from langchain_text_splitters import CharacterTextSplitter
```

`.from_tiktoken_encoder()` 메서드는 `encoding`(예: `cl100k_base`) 또는 `model_name`(예: `gpt-4`)을 인수로 사용합니다. `chunk_size`, `chunk_overlap`, `separators`와 같은 추가 인수는 `CharacterTextSplitter`를 인스턴스화하는 데 사용됩니다:

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

`CharacterTextSplitter.from_tiktoken_encoder`를 사용하면 텍스트가 `CharacterTextSplitter`에 의해서만 분할되고 `tiktoken` 토크나이저가 병합 분할에 사용됩니다. 이는 분할이 `tiktoken` 토크나이저로 측정된 청크 크기보다 클 수 있음을 의미합니다. 각 분할이 재귀적으로 분할되어 언어 모델에서 허용되는 청크 크기보다 크지 않도록 하려면 `RecursiveCharacterTextSplitter.from_tiktoken_encoder`를 사용할 수 있습니다:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    model_name="gpt-4",
    chunk_size=100,
    chunk_overlap=0,
)
```

또한 `tiktoken` 분할기를 직접 로드할 수 있으며, 이렇게 하면 각 분할이 청크 크기보다 작습니다.

```python
from langchain_text_splitters import TokenTextSplitter

text_splitter = TokenTextSplitter(chunk_size=10, chunk_overlap=0)

texts = text_splitter.split_text(state_of_the_union)
print(texts[0])
```

일부 언어(예: 중국어와 일본어)에서는 문자가 2개 이상의 토큰으로 인코딩됩니다. `TokenTextSplitter`를 직접 사용하면 문자에 대한 토큰이 두 청크 사이에 분할되어 잘못된 유니코드 문자가 생성될 수 있습니다. `RecursiveCharacterTextSplitter.from_tiktoken_encoder` 또는 `CharacterTextSplitter.from_tiktoken_encoder`를 사용하여 청크에 유효한 유니코드 문자열이 포함되도록 하세요.

## spaCy

>[spaCy](https://spacy.io/)는 Python과 Cython으로 작성된 고급 자연어 처리를 위한 오픈 소스 소프트웨어 라이브러리입니다.

`NLTK`의 대안으로 [spaCy 토크나이저](https://spacy.io/api/tokenizer)를 사용할 수 있습니다.

1. 텍스트 분할 방식: `spaCy` 토크나이저 사용
2. 청크 크기 측정 방식: 문자 수 사용

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

`SentenceTransformersTokenTextSplitter`는 문장 변환기 모델과 함께 사용하기 위한 전문화된 텍스트 분할기입니다. 기본 동작은 사용하려는 문장 변환기 모델의 토큰 창에 맞는 청크로 텍스트를 분할하는 것입니다.

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

>[The Natural Language Toolkit](https://en.wikipedia.org/wiki/Natural_Language_Toolkit), 또는 더 일반적으로 [NLTK](https://www.nltk.org/)는 Python 프로그래밍 언어로 작성된 영어를 위한 상징적이고 통계적인 자연어 처리(NLP) 라이브러리와 프로그램의 모음입니다.

단순히 "\n\n"으로 분할하는 것이 아니라 [NLTK 토크나이저](https://www.nltk.org/api/nltk.tokenize.html)를 사용하여 분할할 수 있습니다.

1. 텍스트 분할 방식: `NLTK` 토크나이저 사용
2. 청크 크기 측정 방식: 문자 수 사용

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

> [KoNLPy: Korean NLP in Python](https://konlpy.org/en/latest/)은 한국어 자연어 처리(NLP)를 위한 Python 패키지입니다.

토큰 분할은 텍스트를 더 작고 관리하기 쉬운 단위인 토큰으로 분할하는 것을 의미합니다. 이러한 토큰은 종종 단어, 구, 기호 또는 기타 의미 있는 요소이며, 추가 처리 및 분석에 중요합니다. 영어와 같은 언어에서 토큰 분할은 일반적으로 공백과 구두점으로 단어를 분리하는 것을 포함합니다. 토크나이저의 언어 구조에 대한 이해 정도에 따라 토큰 분할의 효과가 크게 달라집니다. 영어 언어용으로 설계된 토크나이저는 한국어와 같은 다른 언어의 고유한 의미 구조를 이해할 수 없기 때문에 한국어 언어 처리에 효과적으로 사용할 수 없습니다.

### KoNLPy의 Kkma 분석기를 사용한 한국어 토큰 분할

한국어 텍스트의 경우 KoNLPY에는 `Kkma`(Korean Knowledge Morpheme Analyzer)라는 형태소 분석기가 포함되어 있습니다. `Kkma`는 한국어 텍스트에 대한 자세한 형태소 분석을 제공합니다. 문장을 단어로, 단어를 해당 형태소로 분해하여 각 토큰의 품사를 식별합니다. 긴 텍스트를 개별 문장으로 분할하는 데에도 특히 유용합니다.

### 사용 고려 사항

`Kkma`는 상세한 분석으로 알려져 있지만, 이러한 정밀성으로 인해 처리 속도에 영향을 미칠 수 있다는 점에 유의해야 합니다. 따라서 `Kkma`는 분석 깊이가 빠른 텍스트 처리보다 우선시되는 애플리케이션에 가장 적합합니다.

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

## Hugging Face 토크나이저

>[Hugging Face](https://huggingface.co/docs/tokenizers/index)에는 많은 토크나이저가 있습니다.

우리는 Hugging Face 토크나이저, [GPT2TokenizerFast](https://huggingface.co/Ransaka/gpt2-tokenizer-fast)를 사용하여 텍스트 길이를 토큰 수로 계산합니다.

1. 텍스트 분할 방식: 입력된 문자 단위로 분할합니다.
2. 청크 크기 측정 방식: `Hugging Face` 토크나이저로 계산된 토큰 수로 측정합니다.

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
