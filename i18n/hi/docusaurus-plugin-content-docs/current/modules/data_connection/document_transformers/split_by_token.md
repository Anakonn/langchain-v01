---
translated: true
---

# टोकन द्वारा विभाजित करना

भाषा मॉडल में एक टोकन सीमा होती है। आपको टोकन सीमा को पार नहीं करना चाहिए। जब आप अपने पाठ को टुकड़ों में विभाजित करते हैं, तो टोकन की संख्या गिनना एक अच्छा विचार है। कई टोकनाइज़र हैं। जब आप अपने पाठ में टोकन गिनते हैं, तो आपको उसी टोकनाइज़र का उपयोग करना चाहिए जो भाषा मॉडल में उपयोग किया जाता है।

## tiktoken

>[tiktoken](https://github.com/openai/tiktoken) एक तेज़ `BPE` टोकनाइज़र है जिसे `OpenAI` द्वारा बनाया गया है।

हम इसका उपयोग करके टोकन का अनुमान लगा सकते हैं। यह OpenAI मॉडलों के लिए अधिक सटीक होगा।

1. पाठ कैसे विभाजित होता है: इनपुट में पारित किए गए वर्णों द्वारा।
2. चंक आकार कैसे मापा जाता है: `tiktoken` टोकनाइज़र द्वारा।

```python
%pip install --upgrade --quiet langchain-text-splitters tiktoken
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
from langchain_text_splitters import CharacterTextSplitter
```

`.from_tiktoken_encoder()` विधि `encoding` (उदा. `cl100k_base`) या `model_name` (उदा. `gpt-4`) को तर्क के रूप में लेती है। `chunk_size`, `chunk_overlap` और `separators` जैसे अतिरिक्त तर्क `CharacterTextSplitter` को इंस्टैंशिएट करने के लिए उपयोग किए जाते हैं:

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

ध्यान दें कि यदि हम `CharacterTextSplitter.from_tiktoken_encoder` का उपयोग करते हैं, तो पाठ केवल `CharacterTextSplitter` द्वारा विभाजित किया जाता है और `tiktoken` टोकनाइज़र का उपयोग विभाजन को मर्ज करने के लिए किया जाता है। इसका मतलब है कि विभाजन चंक आकार से बड़ा हो सकता है जो `tiktoken` टोकनाइज़र द्वारा मापा जाता है। हम `RecursiveCharacterTextSplitter.from_tiktoken_encoder` का उपयोग कर सकते हैं ताकि यह सुनिश्चित हो कि विभाजन भाषा मॉडल द्वारा अनुमत टोकन चंक आकार से बड़ा नहीं है, जहां प्रत्येक विभाजन को यदि इसका आकार बड़ा है तो इसे पुनर्सक्रिय रूप से विभाजित किया जाएगा:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    model_name="gpt-4",
    chunk_size=100,
    chunk_overlap=0,
)
```

हम सीधे एक tiktoken विभाजक भी लोड कर सकते हैं, जो यह सुनिश्चित करेगा कि प्रत्येक विभाजन चंक आकार से छोटा है।

```python
from langchain_text_splitters import TokenTextSplitter

text_splitter = TokenTextSplitter(chunk_size=10, chunk_overlap=0)

texts = text_splitter.split_text(state_of_the_union)
print(texts[0])
```

कुछ लिखित भाषाओं (जैसे चीनी और जापानी) में ऐसे वर्ण हैं जो 2 या अधिक टोकन को एनकोड करते हैं। `TokenTextSplitter` का सीधा उपयोग करने से टोकन दो चंकों के बीच विभाजित हो सकते हैं, जिससे अवैध यूनिकोड वर्ण बन सकते हैं। `RecursiveCharacterTextSplitter.from_tiktoken_encoder` या `CharacterTextSplitter.from_tiktoken_encoder` का उपयोग करें ताकि यह सुनिश्चित हो कि चंक वैध यूनिकोड स्ट्रिंग्स को समाहित करते हैं।

## spaCy

>[spaCy](https://spacy.io/) एक ओपन-सोर्स सॉफ्टवेयर लाइब्रेरी है जो उन्नत प्राकृतिक भाषा प्रसंस्करण के लिए है, जिसे पायथन और सिथन प्रोग्रामिंग भाषाओं में लिखा गया है।

`NLTK` का एक वैकल्पिक है [spaCy टोकनाइज़र](https://spacy.io/api/tokenizer)।

1. पाठ कैसे विभाजित होता है: `spaCy` टोकनाइज़र द्वारा।
2. चंक आकार कैसे मापा जाता है: वर्णों की संख्या द्वारा।

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

`SentenceTransformersTokenTextSplitter` एक विशेषज्ञ पाठ विभाजक है जिसका उपयोग वाक्य-रूपांतरण मॉडल के साथ किया जाता है। डिफ़ॉल्ट व्यवहार पाठ को ऐसे चंकों में विभाजित करना है जो वाक्य-रूपांतरण मॉडल के टोकन विंडो में फिट हों।

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

>[प्राकृतिक भाषा टूलकिट](https://en.wikipedia.org/wiki/Natural_Language_Toolkit), या अधिक आम तौर पर [NLTK](/html-tag/5], पायथन प्रोग्रामिंग भाषा में लिखी गई प्रतीकात्मक और सांख्यिकीय प्राकृतिक भाषा प्रसंस्करण (एनएलपी) के लिए लाइब्रेरियों और कार्यक्रमों का एक सेट है।

केवल "\n\n" पर विभाजन करने के बजाय, हम [NLTK टोकनाइज़रों](https://www.nltk.org/api/nltk.tokenize.html) का उपयोग करके विभाजन कर सकते हैं।

1. पाठ कैसे विभाजित होता है: `NLTK` टोकनाइज़र द्वारा।
2. चंक आकार कैसे मापा जाता है: वर्णों की संख्या द्वारा।

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

> [KoNLPy: पायथन में कोरियाई एनएलपी](https://konlpy.org/en/latest/) एक पायथन पैकेज है जो कोरियाई भाषा के प्राकृतिक भाषा प्रसंस्करण (एनएलपी) के लिए है।

टोकन विभाजन में पाठ को छोटे, अधिक प्रबंधनीय इकाइयों या टोकन में विभाजित करना शामिल है। ये टोकन अक्सर शब्द, वाक्यांश, प्रतीक या अन्य अर्थपूर्ण तत्व होते हैं जो आगे की प्रसंस्करण और विश्लेषण के लिए महत्वपूर्ण होते हैं। अंग्रेजी जैसी भाषाओं में, टोकन विभाजन आमतौर पर स्पेस और विराम चिह्नों द्वारा शब्दों को अलग करने से शामिल होता है। टोकनाइज़र की भाषा संरचना को समझने की प्रभावशीलता टोकन का उत्पादन सुनिश्चित करती है। चूंकि अंग्रेजी भाषा के लिए डिज़ाइन किए गए टोकनाइज़र अन्य भाषाओं, जैसे कि कोरियाई, की अनूठी सेमेंटिक संरचनाओं को समझने में सक्षम नहीं हैं, इसलिए वे कोरियाई भाषा प्रसंस्करण के लिए प्रभावी ढंग से उपयोग नहीं किए जा सकते।

### KoNLPy के Kkma Analyzer के साथ कोरियाई के लिए टोकन विभाजन

कोरियाई पाठ के मामले में, KoNLPY में एक आकारशास्त्रीय विश्लेषक `Kkma` (कोरियाई ज्ञान मॉर्फ़ीम विश्लेषक) शामिल है। `Kkma` कोरियाई पाठ का विस्तृत आकारशास्त्रीय विश्लेषण प्रदान करता है। यह वाक्यों को शब्दों और शब्दों को उनके संबंधित मॉर्फ़ीम में विभाजित करता है, प्रत्येक टोकन के लिए भाषण के भागों की पहचान करता है। यह लंबे पाठों को व्यक्तिगत वाक्यों में विभाजित करने में विशेष रूप से उपयोगी है।

### उपयोग पर विचार

जबकि `Kkma` अपने विस्तृत विश्लेषण के लिए प्रसिद्ध है, यह महत्वपूर्ण है कि इस सटीकता का प्रसंस्करण गति पर प्रभाव पड़ सकता है। इसलिए, `Kkma` उन अनुप्रयोगों के लिए सबसे उपयुक्त है जहां विश्लेषणात्मक गहराई को तेज़ पाठ प्रसंस्करण से अधिक प्राथमिकता दी जाती है।

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

## Hugging Face टोकनाइज़र

>[Hugging Face](https://huggingface.co/docs/tokenizers/index) के पास कई टोकनाइज़र हैं।

हम Hugging Face टोकनाइज़र, [GPT2TokenizerFast](https://huggingface.co/Ransaka/gpt2-tokenizer-fast) का उपयोग करते हैं, जिससे हम टेक्स्ट की लंबाई टोकन में गिन सकते हैं।

1. टेक्स्ट कैसे विभाजित होता है: पास किए गए वर्ण द्वारा।
2. चंक का आकार कैसे मापा जाता है: `Hugging Face` टोकनाइज़र द्वारा गणना किए गए टोकन की संख्या द्वारा।

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
