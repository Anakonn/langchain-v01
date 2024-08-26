---
translated: true
---

# मनोवैज्ञानिक

यह नोटबुक `Psychic` से दस्तावेज़ कैसे लोड करें इसके बारे में कवर करता है। [यहां](/docs/integrations/providers/psychic) अधिक जानकारी के लिए देखें।

## पूर्वापेक्षाएं

1. [इस दस्तावेज़](/docs/integrations/providers/psychic) में दिए गए त्वरित शुरुआत अनुभाग का पालन करें
2. [Psychic डैशबोर्ड](https://dashboard.psychic.dev/) में लॉग इन करें और अपनी गुप्त कुंजी प्राप्त करें
3. अपने वेब ऐप में फ्रंटएंड रिएक्ट लाइब्रेरी को स्थापित करें और एक उपयोगकर्ता को कनेक्शन प्रमाणित करने दें। कनेक्शन आपके द्वारा निर्दिष्ट कनेक्शन आईडी का उपयोग करके बनाया जाएगा।

## दस्तावेज़ लोड करना

कनेक्शन से दस्तावेज़ लोड करने के लिए `PsychicLoader` क्लास का उपयोग करें। प्रत्येक कनेक्शन में एक कनेक्टर आईडी (संबंधित SaaS ऐप के अनुसार) और एक कनेक्शन आईडी (जिसे आप फ्रंटएंड लाइब्रेरी में पास किया था) होता है।

```python
# Uncomment this to install psychicapi if you don't already have it installed
!poetry run pip -q install psychicapi langchain-chroma
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.1.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from langchain_community.document_loaders import PsychicLoader
from psychicapi import ConnectorId

# Create a document loader for google drive. We can also load from other connectors by setting the connector_id to the appropriate value e.g. ConnectorId.notion.value
# This loader uses our test credentials
google_drive_loader = PsychicLoader(
    api_key="7ddb61c1-8b6a-4d31-a58e-30d1c9ea480e",
    connector_id=ConnectorId.gdrive.value,
    connection_id="google-test",
)

documents = google_drive_loader.load()
```

## दस्तावेज़ों को embeddings में रूपांतरित करना

अब हम इन दस्तावेज़ों को embeddings में रूपांतरित कर सकते हैं और उन्हें Chroma जैसे वेक्टर डेटाबेस में संग्रहीत कर सकते हैं।

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_chroma import Chroma
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
docsearch = Chroma.from_documents(texts, embeddings)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
chain({"question": "what is psychic?"}, return_only_outputs=True)
```
