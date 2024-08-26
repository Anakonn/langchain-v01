---
translated: true
---

# llamafile

[llamafile](https://github.com/Mozilla-Ocho/llamafile) एम्बेडिंग्स क्लास को लोड करें।

## सेटअप

पहले, 3 सेटअप चरण हैं:

1. एक llamafile डाउनलोड करें। इस नोटबुक में, हम `TinyLlama-1.1B-Chat-v1.0.Q5_K_M` का उपयोग करते हैं, लेकिन [HuggingFace](https://huggingface.co/models?other=llamafile) पर कई अन्य उपलब्ध हैं।
2. llamafile को कार्यान्वित करें।
3. सर्वर मोड में llamafile शुरू करें।

आप यह सब करने के लिए निम्नलिखित बैश स्क्रिप्ट चला सकते हैं:

```bash
%%bash
# llamafile setup

# Step 1: Download a llamafile. The download may take several minutes.
wget -nv -nc https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Step 2: Make the llamafile executable. Note: if you're on Windows, just append '.exe' to the filename.
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Step 3: Start llamafile server in background. All the server logs will be written to 'tinyllama.log'.
# Alternatively, you can just open a separate terminal outside this notebook and run:
#   ./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser --embedding
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser --embedding > tinyllama.log 2>&1 &
pid=$!
echo "${pid}" > .llamafile_pid  # write the process pid to a file so we can terminate the server later
```

## LlamafileEmbeddings का उपयोग करके पाठ्य का एम्बेडिंग

अब, हम `LlamafileEmbeddings` क्लास का उपयोग कर सकते हैं ताकि हम अपने TinyLlama मॉडल को http://localhost:8080 पर सर्व कर सकें।

```python
from langchain_community.embeddings import LlamafileEmbeddings
```

```python
embedder = LlamafileEmbeddings()
```

```python
text = "This is a test document."
```

एम्बेडिंग जनरेट करने के लिए, आप या तो किसी व्यक्तिगत पाठ्य का प्रश्न पूछ सकते हैं, या आप पाठ्य की एक सूची का प्रश्न पूछ सकते हैं।

```python
query_result = embedder.embed_query(text)
query_result[:5]
```

```python
doc_result = embedder.embed_documents([text])
doc_result[0][:5]
```

```bash
%%bash
# cleanup: kill the llamafile server process
kill $(cat .llamafile_pid)
rm .llamafile_pid
```
