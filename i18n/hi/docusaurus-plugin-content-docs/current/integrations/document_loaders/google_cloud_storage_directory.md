---
translated: true
---

# Google Cloud Storage डायरेक्टरी

>[Google Cloud Storage](https://en.wikipedia.org/wiki/Google_Cloud_Storage) एक अव्यवस्थित डेटा को संग्रहित करने के लिए प्रबंधित सेवा है।

यह कवर करता है कि कैसे `Google Cloud Storage (GCS) डायरेक्टरी (बकेट)` से दस्तावेज़ वस्तुओं को लोड किया जाए।

```python
%pip install --upgrade --quiet  langchain-google-community[gcs]
```

```python
from langchain_google_community import GCSDirectoryLoader
```

```python
loader = GCSDirectoryLoader(project_name="aist", bucket="testing-hwc")
```

```python
loader.load()
```

```output
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpz37njh7u/fake.docx'}, lookup_index=0)]
```

## एक उपसर्ग निर्दिष्ट करना

आप फ़ाइलों को लोड करने पर अधिक सूक्ष्म नियंत्रण के लिए एक उपसर्ग भी निर्दिष्ट कर सकते हैं - जिसमें किसी विशिष्ट फ़ोल्डर से सभी फ़ाइलों को लोड करना शामिल है।

```python
loader = GCSDirectoryLoader(project_name="aist", bucket="testing-hwc", prefix="fake")
```

```python
loader.load()
```

```output
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpylg6291i/fake.docx'}, lookup_index=0)]
```

## एक एकल फ़ाइल को लोड करने में विफलता पर जारी रखें

GCS बकेट में फ़ाइलें प्रसंस्करण के दौरान त्रुटियों का कारण बन सकती हैं। `continue_on_failure=True` तर्क को सक्षम करें ताकि मौन विफलता की अनुमति मिले। इसका मतलब है कि एक एकल फ़ाइल को प्रसंस्करित करने में विफलता कार्य को नहीं तोड़ेगी, बल्कि इसके बजाय एक चेतावनी लॉग करेगी।

```python
loader = GCSDirectoryLoader(
    project_name="aist", bucket="testing-hwc", continue_on_failure=True
)
```

```python
loader.load()
```
