---
translated: true
---

# Azure AI डेटा

>[Azure AI स्टूडियो](https://ai.azure.com/) क्लाउड स्टोरेज में डेटा संपत्तियों को अपलोड करने और निम्नलिखित स्रोतों से मौजूदा डेटा संपत्तियों को पंजीकृत करने की क्षमता प्रदान करता है:
>
>- `Microsoft OneLake`
>- `Azure Blob Storage`
>- `Azure Data Lake gen 2`

इस दृष्टिकोण का लाभ `AzureBlobStorageContainerLoader` और `AzureBlobStorageFileLoader` के ऊपर यह है कि प्रमाणीकरण क्लाउड स्टोरेज के लिए सुचारू रूप से संभाला जाता है। आप या तो *पहचान-आधारित* डेटा एक्सेस नियंत्रण का उपयोग कर सकते हैं या *क्रेडेंशियल-आधारित* (जैसे SAS टोकन, खाता कुंजी)। क्रेडेंशियल-आधारित डेटा एक्सेस के मामले में, आपको अपने कोड में गोपनीय जानकारी निर्दिष्ट करने या कुंजी वॉल्ट सेट अप करने की आवश्यकता नहीं है - प्रणाली इसे आपके लिए संभालती है।

यह नोटबुक AI स्टूडियो में एक डेटा संपत्ति से दस्तावेज़ वस्तुओं को कैसे लोड करें, इसे कवर करता है।

```python
%pip install --upgrade --quiet  azureml-fsspec, azure-ai-generative
```

```python
from azure.ai.resources.client import AIClient
from azure.identity import DefaultAzureCredential
from langchain_community.document_loaders import AzureAIDataLoader
```

```python
# Create a connection to your project
client = AIClient(
    credential=DefaultAzureCredential(),
    subscription_id="<subscription_id>",
    resource_group_name="<resource_group_name>",
    project_name="<project_name>",
)
```

```python
# get the latest version of your data asset
data_asset = client.data.get(name="<data_asset_name>", label="latest")
```

```python
# load the data asset
loader = AzureAIDataLoader(url=data_asset.path)
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpaa9xl6ch/fake.docx'}, lookup_index=0)]
```

## एक ग्लोब पैटर्न निर्दिष्ट करना

आप अधिक विस्तृत नियंत्रण के लिए एक ग्लोब पैटर्न भी निर्दिष्ट कर सकते हैं कि कौन से फ़ाइलें लोड की जाएं। नीचे दिए गए उदाहरण में, केवल `pdf` एक्सटेंशन वाली फ़ाइलें लोड की जाएंगी।

```python
loader = AzureAIDataLoader(url=data_asset.path, glob="*.pdf")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```
