---
translated: true
---

# Cloudflare Workers AI

>[Cloudflare, Inc. (Wikipedia)](https://en.wikipedia.org/wiki/Cloudflare) एक अमेरिकी कंपनी है जो कंटेंट डिलीवरी नेटवर्क सेवाएं, क्लाउड साइबर सुरक्षा, DDoS शमन और ICANN-प्रमाणित डोमेन पंजीकरण सेवाएं प्रदान करती है।

>[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) आपको `Cloudflare` नेटवर्क पर से अपने कोड के माध्यम से REST API के माध्यम से मशीन लर्निंग मॉडल चलाने की अनुमति देता है।

>[Cloudflare AI document](https://developers.cloudflare.com/workers-ai/models/text-embeddings/) उपलब्ध सभी पाठ एम्बेडिंग मॉडल सूचीबद्ध किए गए हैं।

## सेटअप करना

Cloudflare खाता ID और API टोकन दोनों की आवश्यकता होती है। [इस दस्तावेज़](https://developers.cloudflare.com/workers-ai/get-started/rest-api/) से उन्हें कैसे प्राप्त करें, यह पता लगाएं।

```python
import getpass

my_account_id = getpass.getpass("Enter your Cloudflare account ID:\n\n")
my_api_token = getpass.getpass("Enter your Cloudflare API token:\n\n")
```

## उदाहरण

```python
from langchain_community.embeddings.cloudflare_workersai import (
    CloudflareWorkersAIEmbeddings,
)
```

```python
embeddings = CloudflareWorkersAIEmbeddings(
    account_id=my_account_id,
    api_token=my_api_token,
    model_name="@cf/baai/bge-small-en-v1.5",
)
# single string embeddings
query_result = embeddings.embed_query("test")
len(query_result), query_result[:3]
```

```output
(384, [-0.033627357333898544, 0.03982774540781975, 0.03559349477291107])
```

```python
# string embeddings in batches
batch_query_result = embeddings.embed_documents(["test1", "test2", "test3"])
len(batch_query_result), len(batch_query_result[0])
```

```output
(3, 384)
```
