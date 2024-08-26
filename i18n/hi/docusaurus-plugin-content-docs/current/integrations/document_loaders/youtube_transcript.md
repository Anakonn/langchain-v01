---
translated: true
---

यूट्यूब ट्रांसक्रिप्ट्स

>[यूट्यूब](https://www.youtube.com/) एक ऑनलाइन वीडियो शेयरिंग और सोशल मीडिया प्लेटफॉर्म है जिसे Google द्वारा बनाया गया है।

यह नोटबुक `यूट्यूब ट्रांसक्रिप्ट्स` से दस्तावेज़ लोड करने के बारे में कवर करता है।

```python
from langchain_community.document_loaders import YoutubeLoader
```

```python
%pip install --upgrade --quiet  youtube-transcript-api
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=False
)
```

```python
loader.load()
```

### वीडियो जानकारी जोड़ें

```python
%pip install --upgrade --quiet  pytube
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=True
)
loader.load()
```

### भाषा प्राथमिकताएं जोड़ें

भाषा पैरामीटर: यह एक डिसेंडिंग प्राथमिकता में भाषा कोड की एक सूची है, डिफ़ॉल्ट में `en` है।

अनुवाद पैरामीटर: यह एक अनुवाद प्राथमिकता है, आप अपनी पसंदीदा भाषा में उपलब्ध ट्रांसक्रिप्ट का अनुवाद कर सकते हैं।

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg",
    add_video_info=True,
    language=["en", "id"],
    translation="en",
)
loader.load()
```

## Google Cloud से यूट्यूब लोडर

### पूर्वापेक्षाएं

1. एक Google Cloud परियोजना बनाएं या मौजूदा परियोजना का उपयोग करें
1. [यूट्यूब Api](https://console.cloud.google.com/apis/enableflow?apiid=youtube.googleapis.com&project=sixth-grammar-344520) को सक्षम करें
1. [डेस्कटॉप ऐप के लिए क्रेडेंशियल्स को अधिकृत करें](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib youtube-transcript-api`

### 🧑 अपने Google Docs डेटा को इंजेस्ट करने के लिए निर्देश

डिफ़ॉल्ट रूप से, `GoogleDriveLoader` `~/.credentials/credentials.json` फ़ाइल में `credentials.json` फ़ाइल की उम्मीद करता है, लेकिन यह `credentials_file` कीवर्ड आर्गुमेंट का उपयोग करके कॉन्फ़िगर किया जा सकता है। `token.json` के साथ भी ऐसा ही है। ध्यान दें कि `token.json` पहली बार जब आप लोडर का उपयोग करते हैं तो स्वचालित रूप से बना दिया जाएगा।

`GoogleApiYoutubeLoader` Google Docs दस्तावेज़ आईडी की एक सूची या एक फ़ोल्डर आईडी से लोड कर सकता है। आप अपने फ़ोल्डर और दस्तावेज़ आईडी को URL से प्राप्त कर सकते हैं:
ध्यान दें कि आपके सेटअप के आधार पर, `service_account_path` को सेट करना होगा। अधिक जानकारी के लिए [यहां](https://developers.google.com/drive/api/v3/quickstart/python) देखें।

```python
# Init the GoogleApiClient
from pathlib import Path

from langchain_community.document_loaders import GoogleApiClient, GoogleApiYoutubeLoader

google_api_client = GoogleApiClient(credentials_path=Path("your_path_creds.json"))


# Use a Channel
youtube_loader_channel = GoogleApiYoutubeLoader(
    google_api_client=google_api_client,
    channel_name="Reducible",
    captions_language="en",
)

# Use Youtube Ids

youtube_loader_ids = GoogleApiYoutubeLoader(
    google_api_client=google_api_client, video_ids=["TrdevFK_am4"], add_video_info=True
)

# returns a list of Documents
youtube_loader_channel.load()
```
