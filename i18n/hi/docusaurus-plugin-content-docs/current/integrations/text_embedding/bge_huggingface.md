---
translated: true
---

# Hugging Face पर BGE

>[Hugging Face पर BGE मॉडल](https://huggingface.co/BAAI/bge-large-en) [सर्वश्रेष्ठ ओपन-सोर्स एम्बेडिंग मॉडल](https://huggingface.co/spaces/mteb/leaderboard) हैं।
>BGE मॉडल [बीजिंग आर्टिफिशियल इंटेलिजेंस अकादमी (BAAI)](https://en.wikipedia.org/wiki/Beijing_Academy_of_Artificial_Intelligence) द्वारा बनाया गया है। `BAAI` एक निजी गैर-लाभकारी संगठन है जो AI अनुसंधान और विकास में लगा हुआ है।

यह नोटबुक `Hugging Face` के माध्यम से `BGE एम्बेडिंग्स` का उपयोग करने का प्रदर्शन करता है।

```python
%pip install --upgrade --quiet  sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

model_name = "BAAI/bge-small-en"
model_kwargs = {"device": "cpu"}
encode_kwargs = {"normalize_embeddings": True}
hf = HuggingFaceBgeEmbeddings(
    model_name=model_name, model_kwargs=model_kwargs, encode_kwargs=encode_kwargs
)
```

```python
embedding = hf.embed_query("hi this is harrison")
len(embedding)
```

```output
384
```
