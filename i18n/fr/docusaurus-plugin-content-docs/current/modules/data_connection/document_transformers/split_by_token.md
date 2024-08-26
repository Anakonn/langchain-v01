---
translated: true
---

# Diviser par jetons

Les modèles de langage ont une limite de jetons. Vous ne devez pas dépasser cette limite. Lorsque vous divisez votre texte en morceaux, il est donc judicieux de compter le nombre de jetons. Il existe de nombreux tokenizers. Lorsque vous comptez les jetons dans votre texte, vous devez utiliser le même tokenizer que celui utilisé dans le modèle de langage.

## tiktoken

>[tiktoken](https://github.com/openai/tiktoken) est un tokenizer `BPE` rapide créé par `OpenAI`.

Nous pouvons l'utiliser pour estimer les jetons utilisés. Il sera probablement plus précis pour les modèles OpenAI.

1. Comment le texte est-il divisé : par caractère passé.
2. Comment la taille du morceau est-elle mesurée : par le tokenizer `tiktoken`.

```python
%pip install --upgrade --quiet langchain-text-splitters tiktoken
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
from langchain_text_splitters import CharacterTextSplitter
```

La méthode `.from_tiktoken_encoder()` prend soit `encoding` comme argument (par exemple `cl100k_base`), soit le `model_name` (par exemple `gpt-4`). Tous les arguments supplémentaires comme `chunk_size`, `chunk_overlap` et `separators` sont utilisés pour instancier `CharacterTextSplitter` :

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

Notez que si nous utilisons `CharacterTextSplitter.from_tiktoken_encoder`, le texte n'est divisé que par `CharacterTextSplitter` et le tokenizer `tiktoken` est utilisé pour fusionner les divisions. Cela signifie que la division peut être plus grande que la taille du morceau mesurée par le tokenizer `tiktoken`. Nous pouvons utiliser `RecursiveCharacterTextSplitter.from_tiktoken_encoder` pour nous assurer que les divisions ne sont pas plus grandes que la taille du morceau de jetons autorisée par le modèle de langage, où chaque division sera divisée de manière récursive si elle a une taille plus importante :

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    model_name="gpt-4",
    chunk_size=100,
    chunk_overlap=0,
)
```

Nous pouvons également charger un séparateur de jetons `tiktoken` directement, ce qui garantira que chaque division est plus petite que la taille du morceau.

```python
from langchain_text_splitters import TokenTextSplitter

text_splitter = TokenTextSplitter(chunk_size=10, chunk_overlap=0)

texts = text_splitter.split_text(state_of_the_union)
print(texts[0])
```

Certaines langues écrites (par exemple le chinois et le japonais) ont des caractères qui encodent 2 jetons ou plus. L'utilisation directe du `TokenTextSplitter` peut diviser les jetons d'un caractère entre deux morceaux, entraînant des caractères Unicode malformés. Utilisez `RecursiveCharacterTextSplitter.from_tiktoken_encoder` ou `CharacterTextSplitter.from_tiktoken_encoder` pour vous assurer que les morceaux contiennent des chaînes Unicode valides.

## spaCy

>[spaCy](https://spacy.io/) est une bibliothèque logicielle open-source pour le traitement avancé du langage naturel, écrite dans les langages de programmation Python et Cython.

Une autre alternative à `NLTK` est d'utiliser le [tokenizer spaCy](https://spacy.io/api/tokenizer).

1. Comment le texte est-il divisé : par le tokenizer `spaCy`.
2. Comment la taille du morceau est-elle mesurée : par le nombre de caractères.

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

Le `SentenceTransformersTokenTextSplitter` est un séparateur de texte spécialisé pour une utilisation avec les modèles de transformation de phrase. Le comportement par défaut consiste à diviser le texte en morceaux qui s'adaptent à la fenêtre de jetons du modèle de transformation de phrase que vous souhaitez utiliser.

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

>[The Natural Language Toolkit](https://en.wikipedia.org/wiki/Natural_Language_Toolkit), ou plus communément [NLTK](https://www.nltk.org/), est une suite de bibliothèques et de programmes pour le traitement symbolique et statistique du langage naturel (NLP) pour l'anglais, écrite en Python.

Plutôt que de simplement diviser sur "\n\n", nous pouvons utiliser `NLTK` pour diviser en fonction des [tokenizers NLTK](https://www.nltk.org/api/nltk.tokenize.html).

1. Comment le texte est-il divisé : par le tokenizer `NLTK`.
2. Comment la taille du morceau est-elle mesurée : par le nombre de caractères.

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

> [KoNLPy : Traitement du langage naturel coréen en Python](https://konlpy.org/en/latest/) est un package Python pour le traitement du langage naturel (NLP) de la langue coréenne.

La division des jetons implique la segmentation du texte en unités plus petites et plus gérables appelées jetons. Ces jetons sont souvent des mots, des phrases, des symboles ou d'autres éléments significatifs essentiels pour un traitement et une analyse ultérieurs. Dans des langues comme l'anglais, la division des jetons implique généralement de séparer les mots par des espaces et des signes de ponctuation. L'efficacité de la division des jetons dépend largement de la compréhension de la structure de la langue par le tokenizer, assurant ainsi la génération de jetons significatifs. Étant donné que les tokenizers conçus pour la langue anglaise ne sont pas équipés pour comprendre les structures sémantiques uniques d'autres langues, comme le coréen, ils ne peuvent pas être utilisés efficacement pour le traitement de la langue coréenne.

### Division des jetons pour le coréen avec l'analyseur Kkma de KoNLPy

Dans le cas du texte coréen, KoNLPY inclut un analyseur morphologique appelé `Kkma` (Korean Knowledge Morpheme Analyzer). `Kkma` fournit une analyse morphologique détaillée du texte coréen. Il décompose les phrases en mots et les mots en leurs morphèmes respectifs, identifiant les parties du discours pour chaque jeton. Il peut segmenter un bloc de texte en phrases individuelles, ce qui est particulièrement utile pour le traitement de longs textes.

### Considérations d'utilisation

Bien que `Kkma` soit réputé pour son analyse détaillée, il est important de noter que cette précision peut avoir un impact sur la vitesse de traitement. Ainsi, `Kkma` est mieux adapté aux applications où la profondeur analytique est prioritaire par rapport à un traitement rapide du texte.

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

## Hugging Face tokenizer

>[Hugging Face](https://huggingface.co/docs/tokenizers/index) a de nombreux tokenizers.

Nous utilisons le tokenizer Hugging Face, le [GPT2TokenizerFast](https://huggingface.co/Ransaka/gpt2-tokenizer-fast) pour compter la longueur du texte en tokens.

1. Comment le texte est-il divisé : par caractère passé.
2. Comment la taille du chunk est-elle mesurée : par le nombre de tokens calculé par le tokenizer `Hugging Face`.

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
