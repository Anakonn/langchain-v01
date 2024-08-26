---
translated: true
---

Aquí está la traducción al español:

---
translated: false
---

# Dividir por tokens

Los modelos de lenguaje tienen un límite de tokens. No debes exceder el límite de tokens. Cuando divides tu texto en fragmentos, es una buena idea contar el número de tokens. Hay muchos tokenizadores. Cuando cuentas los tokens en tu texto, debes usar el mismo tokenizador que se usa en el modelo de lenguaje.

## tiktoken

>[tiktoken](https://github.com/openai/tiktoken) es un tokenizador `BPE` rápido creado por `OpenAI`.

Podemos usarlo para estimar los tokens utilizados. Probablemente será más preciso para los modelos de OpenAI.

1. Cómo se divide el texto: por el carácter pasado.
2. Cómo se mide el tamaño del fragmento: por el tokenizador `tiktoken`.

```python
%pip install --upgrade --quiet langchain-text-splitters tiktoken
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
from langchain_text_splitters import CharacterTextSplitter
```

El método `.from_tiktoken_encoder()` toma como argumento `encoding` (por ejemplo, `cl100k_base`) o `model_name` (por ejemplo, `gpt-4`). Todos los argumentos adicionales como `chunk_size`, `chunk_overlap` y `separators` se utilizan para instanciar `CharacterTextSplitter`:

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

Tenga en cuenta que si usamos `CharacterTextSplitter.from_tiktoken_encoder`, el texto solo se divide por `CharacterTextSplitter` y el tokenizador `tiktoken` se usa para fusionar las divisiones. Esto significa que la división puede ser mayor que el tamaño del fragmento medido por el tokenizador `tiktoken`. Podemos usar `RecursiveCharacterTextSplitter.from_tiktoken_encoder` para asegurarnos de que las divisiones no sean mayores que el tamaño del fragmento de tokens permitido por el modelo de lenguaje, donde cada división se dividirá recursivamente si tiene un tamaño mayor:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    model_name="gpt-4",
    chunk_size=100,
    chunk_overlap=0,
)
```

También podemos cargar un separador de tiktoken directamente, lo que asegurará que cada división sea más pequeña que el tamaño del fragmento.

```python
from langchain_text_splitters import TokenTextSplitter

text_splitter = TokenTextSplitter(chunk_size=10, chunk_overlap=0)

texts = text_splitter.split_text(state_of_the_union)
print(texts[0])
```

Algunos idiomas escritos (por ejemplo, chino y japonés) tienen caracteres que se codifican en 2 o más tokens. Usar el `TokenTextSplitter` directamente puede dividir los tokens de un carácter entre dos fragmentos, lo que provocaría caracteres Unicode malformados. Usa `RecursiveCharacterTextSplitter.from_tiktoken_encoder` o `CharacterTextSplitter.from_tiktoken_encoder` para asegurarte de que los fragmentos contengan cadenas Unicode válidas.

## spaCy

>[spaCy](https://spacy.io/) es una biblioteca de software de código abierto para el procesamiento avanzado del lenguaje natural, escrita en los lenguajes de programación Python y Cython.

Otra alternativa a `NLTK` es usar el [tokenizador spaCy](https://spacy.io/api/tokenizer).

1. Cómo se divide el texto: por el tokenizador `spaCy`.
2. Cómo se mide el tamaño del fragmento: por número de caracteres.

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

El `SentenceTransformersTokenTextSplitter` es un separador de texto especializado para su uso con los modelos de transformación de oraciones. El comportamiento predeterminado es dividir el texto en fragmentos que se ajusten a la ventana de tokens del modelo de transformación de oraciones que desees utilizar.

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

>[The Natural Language Toolkit](https://en.wikipedia.org/wiki/Natural_Language_Toolkit), o más comúnmente [NLTK](https://www.nltk.org/), es un conjunto de bibliotecas y programas para el procesamiento del lenguaje natural simbólico y estadístico (NLP) para el inglés, escrito en el lenguaje de programación Python.

En lugar de dividir solo por "\n\n", podemos usar `NLTK` para dividir en función de [tokenizadores NLTK](https://www.nltk.org/api/nltk.tokenize.html).

1. Cómo se divide el texto: por el tokenizador `NLTK`.
2. Cómo se mide el tamaño del fragmento: por número de caracteres.

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

> [KoNLPy: Procesamiento del Lenguaje Natural Coreano en Python](https://konlpy.org/en/latest/) es un paquete de Python para el procesamiento del lenguaje natural (NLP) del idioma coreano.

La división de tokens implica la segmentación del texto en unidades más pequeñas y manejables llamadas tokens. Estos tokens suelen ser palabras, frases, símbolos u otros elementos significativos cruciales para un procesamiento y análisis posteriores. En idiomas como el inglés, la división de tokens suele implicar separar las palabras por espacios y signos de puntuación. La eficacia de la división de tokens depende en gran medida de la comprensión del analizador sobre la estructura del idioma, asegurando la generación de tokens significativos. Dado que los tokenizadores diseñados para el idioma inglés no están equipados para entender las estructuras semánticas únicas de otros idiomas, como el coreano, no se pueden utilizar de manera efectiva para el procesamiento del idioma coreano.

### División de tokens para coreano con el analizador Kkma de KoNLPy

En el caso del texto coreano, KoNLPY incluye un analizador morfológico llamado `Kkma` (Korean Knowledge Morpheme Analyzer). `Kkma` proporciona un análisis morfológico detallado del texto coreano. Descompone las oraciones en palabras y las palabras en sus respectivos morfemas, identificando las partes del discurso de cada token. Puede segmentar un bloque de texto en oraciones individuales, lo cual es particularmente útil para procesar textos largos.

### Consideraciones de uso

Si bien `Kkma` es reconocido por su análisis detallado, es importante tener en cuenta que esta precisión puede afectar la velocidad de procesamiento. Por lo tanto, `Kkma` es más adecuado para aplicaciones donde se prioriza la profundidad analítica sobre el procesamiento rápido de texto.

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

## Tokenizador de Hugging Face

>[Hugging Face](https://huggingface.co/docs/tokenizers/index) tiene muchos tokenizadores.

Utilizamos el tokenizador de Hugging Face, el [GPT2TokenizerFast](https://huggingface.co/Ransaka/gpt2-tokenizer-fast) para contar la longitud del texto en tokens.

1. Cómo se divide el texto: por el carácter pasado.
2. Cómo se mide el tamaño del fragmento: por el número de tokens calculado por el tokenizador `Hugging Face`.

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
