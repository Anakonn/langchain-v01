---
translated: true
---

# GPT4All

[GPT4All](https://gpt4all.io/index.html) एक मुफ़्त उपयोग, स्थानीय रूप से चलने वाला, गोपनीयता-जागरूक चैटबॉट है। इसके लिए कोई GPU या इंटरनेट की आवश्यकता नहीं है। यह लोकप्रिय मॉडल और अपने मॉडल जैसे GPT4All Falcon, Wizard आदि को शामिल करता है।

यह नोटबुक [GPT4All embeddings](https://docs.gpt4all.io/gpt4all_python_embedding.html#gpt4all.gpt4all.Embed4All) का LangChain के साथ उपयोग करने का तरीका समझाता है।

## GPT4All के Python बाइंडिंग्स को इंस्टॉल करें

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

नोट: अपडेट किए गए पैकेज का उपयोग करने के लिए आप कर्नल को पुनः प्रारंभ करना आवश्यक हो सकता है।

```python
from langchain_community.embeddings import GPT4AllEmbeddings
```

```python
gpt4all_embd = GPT4AllEmbeddings()
```

```output
100%|████████████████████████| 45.5M/45.5M [00:02<00:00, 18.5MiB/s]

Model downloaded at:  /Users/rlm/.cache/gpt4all/ggml-all-MiniLM-L6-v2-f16.bin

objc[45711]: Class GGMLMetalClass is implemented in both /Users/rlm/anaconda3/envs/lcn2/lib/python3.9/site-packages/gpt4all/llmodel_DO_NOT_MODIFY/build/libreplit-mainline-metal.dylib (0x29fe18208) and /Users/rlm/anaconda3/envs/lcn2/lib/python3.9/site-packages/gpt4all/llmodel_DO_NOT_MODIFY/build/libllamamodel-mainline-metal.dylib (0x2a0244208). One of the two will be used. Which one is undefined.
```

```python
text = "This is a test document."
```

## पाठ्य डेटा को एम्बेड करें

```python
query_result = gpt4all_embd.embed_query(text)
```

embed_documents के साथ आप कई टुकड़ों का पाठ एम्बेड कर सकते हैं। आप इन एम्बेडिंग को [Nomic's Atlas](https://docs.nomic.ai/index.html) के साथ भी मैप कर सकते हैं ताकि आप अपने डेटा का दृश्यात्मक प्रतिनिधित्व देख सकें।

```python
doc_result = gpt4all_embd.embed_documents([text])
```
