---
translated: true
---

# गूगल ड्राइव

>[गूगल ड्राइव](https://en.wikipedia.org/wiki/Google_Drive) एक फ़ाइल संग्रहण और समन्वयन सेवा है जिसे गूगल द्वारा विकसित किया गया है।

यह नोटबुक `गूगल ड्राइव` से दस्तावेज़ लोड करने के बारे में कवर करता है। वर्तमान में, केवल `गूगल डॉक्स` का समर्थन किया जाता है।

## पूर्वापेक्षाएं

1. एक गूगल क्लाउड प्रोजेक्ट बनाएं या मौजूदा प्रोजेक्ट का उपयोग करें
1. [गूगल ड्राइव API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com) को सक्षम करें
1. [डेस्कटॉप ऐप के लिए क्रेडेंशियल अधिकृत करें](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## 🧑 अपने गूगल डॉक्स डेटा को इंजेस्ट करने के लिए निर्देश

`GOOGLE_APPLICATION_CREDENTIALS` पर्यावरण चर को खाली स्ट्रिंग (`""`) पर सेट करें।

डिफ़ॉल्ट रूप से, `GoogleDriveLoader` `~/.credentials/credentials.json` पर स्थित `credentials.json` फ़ाइल की उम्मीद करता है, लेकिन यह `credentials_path` कीवर्ड आर्गुमेंट का उपयोग करके कॉन्फ़िगर किया जा सकता है। `token.json` के साथ भी ऐसा ही है - डिफ़ॉल्ट पथ: `~/.credentials/token.json`, कंस्ट्रक्टर पैरामीटर: `token_path`।

जब आप पहली बार GoogleDriveLoader का उपयोग करते हैं, तो आपको अपने ब्राउज़र में उपयोगकर्ता प्रमाणीकरण के लिए सहमति स्क्रीन दिखाई देगी। प्रमाणीकरण के बाद, `token.json` स्वचालित रूप से प्रदान की गई या डिफ़ॉल्ट पथ पर बना दिया जाएगा। साथ ही, यदि उस पथ पर पहले से ही `token.json` है, तो आपको प्रमाणीकरण के लिए प्रोम्प्ट नहीं किया जाएगा।

`GoogleDriveLoader` गूगल डॉक्स दस्तावेज़ आईडी की एक सूची या फ़ोल्डर आईडी से लोड कर सकता है। आप अपने फ़ोल्डर और दस्तावेज़ आईडी को URL से प्राप्त कर सकते हैं:

* फ़ोल्डर: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> फ़ोल्डर आईडी `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"` है
* दस्तावेज़: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> दस्तावेज़ आईडी `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"` है

```python
%pip install --upgrade --quiet langchain-google-community[drive]
```

```python
from langchain_google_community import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    token_path="/path/where/you/want/token/to/be/created/google_token.json",
    # Optional: configure whether to recursively fetch files from subfolders. Defaults to False.
    recursive=False,
)
```

```python
docs = loader.load()
```

जब आप `folder_id` पास करते हैं, तो डिफ़ॉल्ट रूप से दस्तावेज़, शीट और पीडीएफ़ प्रकार की सभी फ़ाइलें लोड की जाती हैं। आप `file_types` आर्गुमेंट पास करके इस व्यवहार को संशोधित कर सकते हैं।

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    file_types=["document", "sheet"],
    recursive=False,
)
```

## वैकल्पिक फ़ाइल लोडर पास करना

गूगल डॉक्स और गूगल शीट के अलावा अन्य फ़ाइलों को प्रोसेस करते समय, `GoogleDriveLoader` में एक वैकल्पिक फ़ाइल लोडर पास करना उपयोगी हो सकता है। यदि आप एक फ़ाइल लोडर पास करते हैं, तो वह फ़ाइल लोडर गूगल डॉक्स या गूगल शीट MIME प्रकार नहीं होने वाली दस्तावेज़ों पर उपयोग किया जाएगा। यहां गूगल ड्राइव से एक एक्सेल दस्तावेज़ लोड करने का एक उदाहरण है।

```python
from langchain_community.document_loaders import UnstructuredFileIOLoader
from langchain_google_community import GoogleDriveLoader
```

```python
file_id = "1x9WBtFPWMEAdjcJzPScRsjpjQvpSo_kz"
loader = GoogleDriveLoader(
    file_ids=[file_id],
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

आप निम्नलिखित पैटर्न का उपयोग करके गूगल डॉक्स/शीट के साथ मिश्रित फ़ाइलों के साथ एक फ़ोल्डर को भी प्रोसेस कर सकते हैं:

```python
folder_id = "1asMOHY1BqBS84JcRbOag5LOJac74gpmD"
loader = GoogleDriveLoader(
    folder_id=folder_id,
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

## विस्तारित उपयोग

गूगल ड्राइव की जटिलता को प्रबंधित करने के लिए एक बाहरी (अनधिकृत) घटक `langchain-googledrive` का उपयोग किया जा सकता है।
यह `langchain_community.document_loaders.GoogleDriveLoader` के साथ संगत है और इसके स्थान पर उपयोग किया जा सकता है।

कंटेनरों के साथ संगत होने के लिए, प्रमाणीकरण एक पर्यावरण चर `GOOGLE_ACCOUNT_FILE` का उपयोग करता है जो क्रेडेंशियल फ़ाइल (उपयोगकर्ता या सेवा के लिए) है।

```python
%pip install --upgrade --quiet  langchain-googledrive
```

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

```python
# Use the advanced version.
from langchain_googledrive.document_loaders import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    num_results=2,  # Maximum number of file to load
)
```

डिफ़ॉल्ट रूप से, इन MIME प्रकार की सभी फ़ाइलें `Document` में परिवर्तित की जा सकती हैं।
- text/text
- text/plain
- text/html
- text/csv
- text/markdown
- image/png
- image/jpeg
- application/epub+zip
- application/pdf
- application/rtf
- application/vnd.google-apps.document (GDoc)
- application/vnd.google-apps.presentation (GSlide)
- application/vnd.google-apps.spreadsheet (GSheet)
- application/vnd.google.colaboratory (Notebook colab)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)

इसे अपडेट या कस्टमाइज़ करना संभव है। `GDriveLoader` के दस्तावेज़ देखें।

लेकिन, संबंधित पैकेज इंस्टॉल किए जाने चाहिए।

```python
%pip install --upgrade --quiet  unstructured
```

```python
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### प्राधिकरण पहचानों को लोड करना

गूगल ड्राइव लोडर द्वारा इंजेस्ट की गई प्रत्येक फ़ाइल के लिए प्राधिकृत पहचानों को मेटाडेटा के साथ लोड किया जा सकता है।

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_auth=True,
    # Optional: configure whether to load authorized identities for each Document.
)

doc = loader.load()
```

आप `load_auth=True` पास कर सकते हैं, ताकि मेटाडेटा में गूगल ड्राइव दस्तावेज़ पहुंच पहचानों को जोड़ा जा सके।

```python
doc[0].metadata
```

### विस्तारित मेटाडेटा लोड करना

निम्नलिखित अतिरिक्त फ़ील्ड भी प्रत्येक दस्तावेज़ के मेटाडेटा में प्राप्त किए जा सकते हैं:
 - full_path - गूगल ड्राइव में फ़ाइल/फ़ाइलों का पूरा पथ।
 - owner - फ़ाइल/फ़ाइलों का मालिक।
 - size - फ़ाइल/फ़ाइलों का आकार।

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_extended_matadata=True,
    # Optional: configure whether to load extended metadata for each Document.
)

doc = loader.load()
```

आप `load_extended_matadata=True` पास कर सकते हैं, ताकि गूगल ड्राइव दस्तावेज़ का विस्तारित विवरण मेटाडेटा में जोड़ा जा सके।

```python
doc[0].metadata
```

### कस्टमाइज़ खोज पैटर्न

Google [`list()`](https://developers.google.com/drive/api/v3/reference/files/list) API के साथ संगत सभी पैरामीटर सेट किए जा सकते हैं।

Google अनुरोध के नए पैटर्न को निर्दिष्ट करने के लिए, आप `PromptTemplate()` का उपयोग कर सकते हैं।
प्रॉम्प्ट के लिए चर `kwargs` में कंस्ट्रक्टर में सेट किए जा सकते हैं।
कुछ पूर्व-प्रारूपित अनुरोध प्रस्तावित किए गए हैं (का उपयोग करें `{query}`, `{folder_id}` और/या `{mime_type}`):

आप फ़ाइलों को चुनने के मानदंड को कस्टमाइज़ कर सकते हैं। कुछ पूर्व-परिभाषित फ़िल्टर प्रस्तावित किए गए हैं:

| टेम्प्लेट                               | विवरण                                                           |
| -------------------------------------- | --------------------------------------------------------------------- |
| gdrive-all-in-folder                   | `folder_id` से सभी संगत फ़ाइलें रिटर्न करें                        |
| gdrive-query                           | सभी ड्राइव में `query` खोजें                                          |
| gdrive-by-name                         | नाम `query` के साथ फ़ाइल खोजें                                        |
| gdrive-query-in-folder                 | `folder_id` में `query` खोजें (और उप-फ़ोल्डर अगर `recursive=true`)  |
| gdrive-mime-type                       | विशिष्ट `mime_type` खोजें                                         |
| gdrive-mime-type-in-folder             | `folder_id` में विशिष्ट `mime_type` खोजें                          |
| gdrive-query-with-mime-type            | विशिष्ट `mime_type` के साथ `query` खोजें                            |
| gdrive-query-with-mime-type-and-folder | विशिष्ट `mime_type` और `folder_id` में `query` खोजें         |

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template="gdrive-query",  # Default template to use
    query="machine learning",
    num_results=2,  # Maximum number of file to load
    supportsAllDrives=False,  # GDrive `list()` parameter
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

आप अपना पैटर्न कस्टमाइज़ कर सकते हैं।

```python
from langchain_core.prompts.prompt import PromptTemplate

loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template=PromptTemplate(
        input_variables=["query", "query_name"],
        template="fullText contains '{query}' and name contains '{query_name}' and trashed=false",
    ),  # Default template to use
    query="machine learning",
    query_name="ML",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

रूपांतरण Markdown प्रारूप में प्रबंधित कर सकता है:
- बुलेट
- लिंक
- तालिका
- शीर्षक

`return_link` गुण को `True` पर सेट करें लिंक निर्यात करने के लिए।

#### GSlide और GSheet के लिए मोड

मोड पैरामीटर विभिन्न मूल्य स्वीकार करता है:

- "document": प्रत्येक दस्तावेज़ का शरीर रिटर्न करें
- "snippets": प्रत्येक फ़ाइल का विवरण (Google Drive फ़ाइलों के मेटाडेटा में सेट) रिटर्न करें।

`gslide_mode` पैरामीटर विभिन्न मूल्य स्वीकार करता है:

- "single" : &lt;PAGE BREAK&gt; के साथ एक दस्तावेज़
- "slide" : प्रत्येक स्लाइड के लिए एक दस्तावेज़
- "elements" : प्रत्येक तत्व के लिए एक दस्तावेज़।

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.presentation",  # Only GSlide files
    gslide_mode="slide",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

`gsheet_mode` पैरामीटर विभिन्न मूल्य स्वीकार करता है:
- `"single"`: प्रति पंक्ति के लिए एक दस्तावेज़ उत्पन्न करें
- `"elements"` : &lt;PAGE BREAK&gt; टैग के साथ Markdown array के साथ एक दस्तावेज़।

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.spreadsheet",  # Only GSheet files
    gsheet_mode="elements",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### उन्नत उपयोग

सभी Google फ़ाइल में मेटाडेटा में 'विवरण' होता है। इस फ़ील्ड का उपयोग दस्तावेज़ या अन्य अनुक्रमित टैग का सारांश याद करने के लिए किया जा सकता है (देखें `lazy_update_description_with_summary()` विधि)।

यदि आप `mode="snippet"` का उपयोग करते हैं, तो केवल विवरण ही शरीर के लिए उपयोग किया जाएगा। अन्यथा, `metadata['summary']` में फ़ील्ड होगा।

कभी-कभी, विशिष्ट फ़िल्टर का उपयोग फ़ाइलनाम से कुछ जानकारी निकालने के लिए किया जा सकता है, ताकि विशिष्ट मानदंडों के साथ कुछ फ़ाइलों का चयन किया जा सके। आप एक फ़िल्टर का उपयोग कर सकते हैं।

कभी-कभी, कई दस्तावेज़ रिटर्न किए जाते हैं। एक ही समय में सभी दस्तावेज़ों को मेमोरी में रखना आवश्यक नहीं है। आप एक दस्तावेज़ को एक बार प्राप्त करने के लिए आलस्य संस्करणों का उपयोग कर सकते हैं। एक जटिल क्वेरी का उपयोग एक पुनरावृत्ति खोज के बजाय बेहतर है। प्रत्येक फ़ोल्डर के लिए, `recursive=True` सक्रिय करने पर एक क्वेरी लागू की जानी चाहिए।

```python
import os

loader = GoogleDriveLoader(
    gdrive_api_file=os.environ["GOOGLE_ACCOUNT_FILE"],
    num_results=2,
    template="gdrive-query",
    filter=lambda search, file: "#test" not in file.get("description", ""),
    query="machine learning",
    supportsAllDrives=False,
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```
