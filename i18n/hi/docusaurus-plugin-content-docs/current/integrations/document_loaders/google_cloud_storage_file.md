---
translated: true
---

# Google Cloud Storage फ़ाइल

>[Google Cloud Storage](https://en.wikipedia.org/wiki/Google_Cloud_Storage) एक अव्यवस्थित डेटा को संग्रहित करने के लिए प्रबंधित सेवा है।

यह कवर करता है कि कैसे `Google Cloud Storage (GCS) फ़ाइल ऑब्जेक्ट (ब्लॉब)` से दस्तावेज़ ऑब्जेक्ट लोड किए जाएं।

```python
%pip install --upgrade --quiet  langchain-google-community[gcs]
```

```python
from langchain_google_community import GCSFileLoader
```

```python
loader = GCSFileLoader(project_name="aist", bucket="testing-hwc", blob="fake.docx")
```

```python
loader.load()
```

```output
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmp3srlf8n8/fake.docx'}, lookup_index=0)]
```

यदि आप वैकल्पिक लोडर का उपयोग करना चाहते हैं, तो आप एक कस्टम फ़ंक्शन प्रदान कर सकते हैं, उदाहरण के लिए:

```python
from langchain_community.document_loaders import PyPDFLoader


def load_pdf(file_path):
    return PyPDFLoader(file_path)


loader = GCSFileLoader(
    project_name="aist", bucket="testing-hwc", blob="fake.pdf", loader_func=load_pdf
)
```
