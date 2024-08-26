---
translated: true
---

# Text Embeddings Inference

>[Hugging Face Text Embeddings Inference (TEI)](https://huggingface.co/docs/text-embeddings-inference/index) एक टूलकिट है जो ओपन-सोर्स टेक्स्ट एम्बेडिंग और सीक्वेंस क्लासिफिकेशन मॉडल को डिप्लॉय और सर्व करने के लिए है। `TEI` सबसे लोकप्रिय मॉडल्स जैसे `FlagEmbedding`, `Ember`, `GTE` और `E5` के लिए उच्च-प्रदर्शन निकालने में सक्षम है।

लैंगचेन में इसका उपयोग करने के लिए, पहले `huggingface-hub` इंस्टॉल करें।

```python
%pip install --upgrade huggingface-hub
```

फिर TEI का उपयोग करके एक एम्बेडिंग मॉडल एक्सपोज़ करें। उदाहरण के लिए, Docker का उपयोग करके, आप `BAAI/bge-large-en-v1.5` को निम्नानुसार सर्व कर सकते हैं:

```bash
model=BAAI/bge-large-en-v1.5
revision=refs/pr/5
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --gpus all -p 8080:80 -v $volume:/data --pull always ghcr.io/huggingface/text-embeddings-inference:0.6 --model-id $model --revision $revision
```

अंत में, क्लाइंट को इंस्टैंशिएट करें और अपने टेक्स्ट को एम्बेड करें।

```python
from langchain_community.embeddings import HuggingFaceHubEmbeddings
```

```python
embeddings = HuggingFaceHubEmbeddings(model="http://localhost:8080")
```

```python
text = "What is deep learning?"
```

```python
query_result = embeddings.embed_query(text)
query_result[:3]
```

```output
[0.018113142, 0.00302585, -0.049911194]
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
doc_result[0][:3]
```

```output
[0.018113142, 0.00302585, -0.049911194]
```
