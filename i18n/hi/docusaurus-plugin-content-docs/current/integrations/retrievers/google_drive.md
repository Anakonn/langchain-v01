---
translated: true
---

यह नोटबुक `Google Drive` से दस्तावेज़ों को कैसे प्राप्त करना है, इस बारे में कवर करता है।

## पूर्वापेक्षाएं

1. एक Google Cloud परियोजना बनाएं या मौजूदा परियोजना का उपयोग करें
1. [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com) को सक्षम करें
1. [डेस्कटॉप ऐप के लिए प्राधिकरण प्रमाणपत्र](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Google Docs को प्राप्त करें

डिफ़ॉल्ट रूप से, `GoogleDriveRetriever` `~/.credentials/credentials.json` फ़ाइल में `credentials.json` फ़ाइल की उम्मीद करता है, लेकिन यह `GOOGLE_ACCOUNT_FILE` पर्यावरण चर का उपयोग करके कॉन्फ़िगर किया जा सकता है।
`token.json` का स्थान इसी निर्देशिका का उपयोग करता है (या `token_path` पैरामीटर का उपयोग करें)। ध्यान दें कि `token.json` पहली बार जब आप रिट्रीवर का उपयोग करते हैं तो स्वचालित रूप से बनाया जाएगा।

`GoogleDriveRetriever` कुछ अनुरोधों के साथ फ़ाइलों का एक चयन प्राप्त कर सकता है।

डिफ़ॉल्ट रूप से, यदि आप `folder_id` का उपयोग करते हैं, तो इस फ़ोल्डर के अंदर की सभी फ़ाइलें `Document` में प्राप्त की जा सकती हैं।

आप अपने फ़ोल्डर और दस्तावेज़ आईडी को URL से प्राप्त कर सकते हैं:

* फ़ोल्डर: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> फ़ोल्डर आईडी `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"` है
* दस्तावेज़: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> दस्तावेज़ आईडी `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"` है

विशेष मान `root` आपके व्यक्तिगत होम के लिए है।

```python
from langchain_googledrive.retrievers import GoogleDriveRetriever

folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'

retriever = GoogleDriveRetriever(
    num_results=2,
)
```

डिफ़ॉल्ट रूप से, इन MIME प्रकारों के सभी फ़ाइलों को `Document` में रूपांतरित किया जा सकता है।

- `text/text`
- `text/plain`
- `text/html`
- `text/csv`
- `text/markdown`
- `image/png`
- `image/jpeg`
- `application/epub+zip`
- `application/pdf`
- `application/rtf`
- `application/vnd.google-apps.document` (GDoc)
- `application/vnd.google-apps.presentation` (GSlide)
- `application/vnd.google-apps.spreadsheet` (GSheet)
- `application/vnd.google.colaboratory` (Notebook colab)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)

इसे अपडेट या अनुकूलित करना संभव है। `GoogleDriveRetriever` के प्रलेखन देखें।

लेकिन, संबंधित पैकेज स्थापित किए जाने चाहिए।

```python
%pip install --upgrade --quiet  unstructured
```

```python
retriever.invoke("machine learning")
```

आप फ़ाइलों का चयन करने के मानदंडों को अनुकूलित कर सकते हैं। कुछ पूर्व-परिभाषित फ़िल्टर प्रस्तावित किए गए हैं:

| टेम्प्लेट                                 | विवरण                                                           |
| --------------------------------------   | --------------------------------------------------------------------- |
| `gdrive-all-in-folder`                   | `folder_id` से सभी संगत फ़ाइलें वापस करें                        |
| `gdrive-query`                           | सभी ड्राइवों में `query` खोजें                                  |
| `gdrive-by-name`                         | `query` के साथ फ़ाइल का नाम खोजें                               |
| `gdrive-query-in-folder`                 | `folder_id` (और `_recursive=true` में उप-फ़ोल्डर) में `query` खोजें |
| `gdrive-mime-type`                       | विशिष्ट `mime_type` खोजें                                      |
| `gdrive-mime-type-in-folder`             | `folder_id` में विशिष्ट `mime_type` खोजें                       |
| `gdrive-query-with-mime-type`            | विशिष्ट `mime_type` के साथ `query` खोजें                       |
| `gdrive-query-with-mime-type-and-folder` | विशिष्ट `mime_type` और `folder_id` में `query` खोजें          |

```python
retriever = GoogleDriveRetriever(
    template="gdrive-query",  # Search everywhere
    num_results=2,  # But take only 2 documents
)
for doc in retriever.invoke("machine learning"):
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

अन्यथा, आप एक विशिष्ट `PromptTemplate` के साथ प्रॉम्प्ट को अनुकूलित कर सकते हैं।

```python
from langchain_core.prompts import PromptTemplate

retriever = GoogleDriveRetriever(
    template=PromptTemplate(
        input_variables=["query"],
        # See https://developers.google.com/drive/api/guides/search-files
        template="(fullText contains '{query}') "
        "and mimeType='application/vnd.google-apps.document' "
        "and modifiedTime > '2000-01-01T00:00:00' "
        "and trashed=false",
    ),
    num_results=2,
    # See https://developers.google.com/drive/api/v3/reference/files/list
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
for doc in retriever.invoke("machine learning"):
    print(f"{doc.metadata['name']}:")
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

## Google Drive 'description' मेटाडेटा का उपयोग करें

प्रत्येक Google Drive में मेटाडेटा में एक `description` फ़ील्ड होता है (एक फ़ाइल के *विवरण* देखें)।
चयनित फ़ाइलों का विवरण वापस करने के लिए `snippets` मोड का उपयोग करें।

```python
retriever = GoogleDriveRetriever(
    template="gdrive-mime-type-in-folder",
    folder_id=folder_id,
    mime_type="application/vnd.google-apps.document",  # Only Google Docs
    num_results=2,
    mode="snippets",
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
retriever.invoke("machine learning")
```
