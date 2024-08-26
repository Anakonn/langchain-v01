---
translated: true
---

# Azure Blob Storage कंटेनर

>[Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction) माइक्रोसॉफ्ट का क्लाउड के लिए ऑब्जेक्ट स्टोरेज समाधान है। Blob Storage अव्यवस्थित डेटा की भारी मात्रा को संग्रहित करने के लिए अनुकूलित है। अव्यवस्थित डेटा वह डेटा है जो किसी विशिष्ट डेटा मॉडल या परिभाषा का पालन नहीं करता है, जैसे टेक्स्ट या बाइनरी डेटा।

`Azure Blob Storage` निम्नलिखित के लिए डिज़ाइन किया गया है:
- ब्राउज़र को सीधे छवियों या दस्तावेजों को सर्व करना।
- वितरित पहुंच के लिए फ़ाइलों को संग्रहित करना।
- वीडियो और ऑडियो स्ट्रीमिंग करना।
- लॉग फ़ाइलों में लिखना।
- बैकअप और पुनर्स्थापना, आपदा प्रतिकार और संग्रहण के लिए डेटा को संग्रहित करना।
- ऑन-प्रेमाइसेस या Azure-होस्टेड सेवा द्वारा विश्लेषण के लिए डेटा को संग्रहित करना।

यह नोटबुक `Azure Blob Storage` कंटेनर से दस्तावेज़ ऑब्जेक्ट कैसे लोड करें, इसके बारे में कवर करता है।

```python
%pip install --upgrade --quiet  azure-storage-blob
```

```python
from langchain_community.document_loaders import AzureBlobStorageContainerLoader
```

```python
loader = AzureBlobStorageContainerLoader(conn_str="<conn_str>", container="<container>")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpaa9xl6ch/fake.docx'}, lookup_index=0)]
```

## एक उपसर्ग निर्दिष्ट करना

आप अधिक सूक्ष्म नियंत्रण के लिए किन फ़ाइलों को लोड करना है, इसके लिए एक उपसर्ग भी निर्दिष्ट कर सकते हैं।

```python
loader = AzureBlobStorageContainerLoader(
    conn_str="<conn_str>", container="<container>", prefix="<prefix>"
)
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```
