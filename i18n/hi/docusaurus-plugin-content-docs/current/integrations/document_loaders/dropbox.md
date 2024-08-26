---
translated: true
---

# Dropbox

[Dropbox](https://en.wikipedia.org/wiki/Dropbox) एक फ़ाइल होस्टिंग सेवा है जो परंपरागत फ़ाइलों, क्लाउड सामग्री और वेब शॉर्टकट को एक ही जगह लाती है।

यह नोटबुक *Dropbox* से दस्तावेज़ लोड करने के बारे में कवर करता है। सामान्य फ़ाइलों के अलावा, यह *Dropbox Paper* फ़ाइलों का भी समर्थन करता है।

## पूर्वापेक्षाएं

1. एक Dropbox ऐप बनाएं।
2. ऐप को इन स्कोप अनुमतियों दें: `files.metadata.read` और `files.content.read`।
3. एक्सेस टोकन जनरेट करें: https://www.dropbox.com/developers/apps/create।
4. `pip install dropbox` (PDF फ़ाइलटाइप के लिए `pip install "unstructured[pdf]"` की आवश्यकता है)।

## निर्देश

`DropboxLoader`` को एक Dropbox ऐप बनाने और एक्सेस टोकन जनरेट करने की आवश्यकता है। यह https://www.dropbox.com/developers/apps/create से किया जा सकता है। आपको Dropbox Python SDK भी स्थापित करना होगा (pip install dropbox)।

DropboxLoader Dropbox फ़ाइल पथों की एक सूची या एक Dropbox फ़ोल्डर पथ से डेटा लोड कर सकता है। दोनों पथ एक्सेस टोकन से जुड़े Dropbox खाते के रूट निर्देशिका के सापेक्ष होने चाहिए।

```python
pip install dropbox
```

```output
Requirement already satisfied: dropbox in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (11.36.2)
Requirement already satisfied: requests>=2.16.2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (2.31.0)
Requirement already satisfied: six>=1.12.0 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (1.16.0)
Requirement already satisfied: stone>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (3.3.1)
Requirement already satisfied: charset-normalizer<4,>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.2.0)
Requirement already satisfied: idna<4,>=2.5 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.4)
Requirement already satisfied: urllib3<3,>=1.21.1 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2.0.4)
Requirement already satisfied: certifi>=2017.4.17 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2023.7.22)
Requirement already satisfied: ply>=3.4 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from stone>=2->dropbox) (3.11)
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_community.document_loaders import DropboxLoader
```

```python
# Generate access token: https://www.dropbox.com/developers/apps/create.
dropbox_access_token = "<DROPBOX_ACCESS_TOKEN>"
# Dropbox root folder
dropbox_folder_path = ""
```

```python
loader = DropboxLoader(
    dropbox_access_token=dropbox_access_token,
    dropbox_folder_path=dropbox_folder_path,
    recursive=False,
)
```

```python
documents = loader.load()
```

```output
File /JHSfLKn0.jpeg could not be decoded as text. Skipping.
File /A REPORT ON WILES’ CAMBRIDGE LECTURES.pdf could not be decoded as text. Skipping.
```

```python
for document in documents:
    print(document)
```
