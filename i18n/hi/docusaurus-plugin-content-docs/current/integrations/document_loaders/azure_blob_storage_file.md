---
translated: true
---

# Azure Blob Storage File

>[Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction) पूरी तरह से प्रबंधित फ़ाइल शेयर प्रदान करता है जो क्लाउड में उपलब्ध हैं और उद्योग मानक सर्वर संदेश ब्लॉक (`SMB`) प्रोटोकॉल, नेटवर्क फ़ाइल सिस्टम (`NFS`) प्रोटोकॉल और `Azure Files REST API` के माध्यम से पहुंच योग्य हैं।

यह Azure Files से दस्तावेज़ ऑब्जेक्ट कैसे लोड करें, इसके बारे में बताता है।

```python
%pip install --upgrade --quiet  azure-storage-blob
```

```python
from langchain_community.document_loaders import AzureBlobStorageFileLoader
```

```python
loader = AzureBlobStorageFileLoader(
    conn_str="<connection string>",
    container="<container name>",
    blob_name="<blob name>",
)
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpxvave6wl/fake.docx'}, lookup_index=0)]
```
