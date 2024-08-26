---
sidebar_position: 10
title: कस्टम दस्तावेज़ लोडर
translated: true
---

# कस्टम दस्तावेज़ लोडर

## अवलोकन

एलएलएम पर आधारित अनुप्रयोगों में अक्सर डेटाबेस या फ़ाइलों, जैसे PDF, से डेटा निकालना और उसे एलएलएम द्वारा उपयोग किए जाने वाले प्रारूप में रूपांतरित करना शामिल होता है। LangChain में, यह आमतौर पर Document ऑब्जेक्ट बनाने से शुरू होता है, जो निकाले गए पाठ (`page_content`) के साथ-साथ मेटाडेटा - लेखक का नाम या प्रकाशन की तारीख जैसे दस्तावेज़ के बारे में विवरण वाला एक डिक्शनरी - को कैप्सूलबद्ध करता है।

`Document` ऑब्जेक्ट को अक्सर एलएलएम में फ़ीड किए जाने वाले प्रॉम्प्ट में प्रारूपित किया जाता है, जिससे एलएलएम `Document` में मौजूद जानकारी का उपयोग करके वांछित प्रतिक्रिया (जैसे दस्तावेज़ का सारांश) उत्पन्न कर सके।
`Documents` को या तो तुरंत उपयोग किया जा सकता है या भविष्य में पुनः प्राप्ति और उपयोग के लिए वेक्टर स्टोर में अनुक्रमित किया जा सकता है।

Document लोडिंग के लिए मुख्य अवधारणाएं हैं:

| घटक      | विवरण                    |
|----------------|--------------------------------|
| Document       | `text` और `metadata` को समाहित करता है |
| BaseLoader     | कच्चे डेटा को `Documents` में रूपांतरित करने के लिए उपयोग किया जाता है  |
| Blob           | फ़ाइल या मेमोरी में स्थित बाइनरी डेटा का प्रतिनिधित्व |
| BaseBlobParser | `Blob` को `Document` ऑब्जेक्ट उत्पन्न करने के लिए पार्स करने की लॉजिक |

यह गाइड कस्टम दस्तावेज़ लोडिंग और फ़ाइल पार्सिंग लॉजिक लिखने का प्रदर्शन करेगी; विशेष रूप से, हम देखेंगे कि कैसे:

1. `BaseLoader` से उप-वर्गीकरण करके एक मानक दस्तावेज़ लोडर बनाया जाता है।
2. `BaseBlobParser` का उपयोग करके एक पार्सर बनाया जाता है और इसका उपयोग `Blob` और `BlobLoaders` के साथ किया जाता है। यह मुख्य रूप से फ़ाइलों के साथ काम करते समय उपयोगी है।

## मानक दस्तावेज़ लोडर

एक दस्तावेज़ लोडर को `BaseLoader` से उप-वर्गीकरण करके लागू किया जा सकता है, जो दस्तावेज़ लोड करने के लिए एक मानक इंटरफ़ेस प्रदान करता है।

### इंटरफ़ेस

| Method Name | व्याख्या |
|-------------|-------------|
| lazy_load   | **आलस्य से** एक-एक दस्तावेज़ लोड करने के लिए उपयोग किया जाता है। उत्पादन कोड के लिए उपयोग करें। |
| alazy_load  | `lazy_load` का एसिंक्रोनस संस्करण |
| load        | सभी दस्तावेज़ों को **उत्साहपूर्वक** मेमोरी में लोड करने के लिए उपयोग किया जाता है। प्रोटोटाइपिंग या इंटरैक्टिव कार्य के लिए उपयोग करें। |
| aload       | सभी दस्तावेज़ों को **उत्साहपूर्वक** मेमोरी में लोड करने के लिए उपयोग किया जाता है। प्रोटोटाइपिंग या इंटरैक्टिव कार्य के लिए उपयोग करें। **LangChain में 2024-04 में जोड़ा गया।** |

* `load` विधि एक सुविधा विधि है जो केवल प्रोटोटाइपिंग कार्य के लिए है - यह केवल `self.lazy_load()` को कॉल करता है।
* `alazy_load` का एक डिफ़ॉल्ट क्रियान्वयन है जो `lazy_load` को प्रतिनिधित्व करेगा। यदि आप एसिंक्रोनस का उपयोग कर रहे हैं, तो हम डिफ़ॉल्ट क्रियान्वयन को ओवरराइड करने और एक नेटिव एसिंक्रोनस क्रियान्वयन प्रदान करने की सिफारिश करते हैं।

::: {.callout-important}
एक दस्तावेज़ लोडर को लागू करते समय, `lazy_load` या `alazy_load` विधियों के माध्यम से पैरामीटर प्रदान **मत करें**।

सभी कॉन्फ़िगरेशन को प्रारंभक (__init__) के माध्यम से पारित किया जाना अपेक्षित है। यह LangChain द्वारा लिया गया एक डिज़ाइन चयन था ताकि सुनिश्चित किया जा सके कि एक बार दस्तावेज़ लोडर इंस्टैंस बना लिया गया हो, तो उसके पास दस्तावेज़ लोड करने के लिए सभी आवश्यक जानकारी हो।
:::

### क्रियान्वयन

चलिए एक मानक दस्तावेज़ लोडर का उदाहरण बनाते हैं जो एक फ़ाइल लोड करता है और प्रत्येक पंक्ति से एक दस्तावेज़ बनाता है।

```python
from typing import AsyncIterator, Iterator

from langchain_core.document_loaders import BaseLoader
from langchain_core.documents import Document


class CustomDocumentLoader(BaseLoader):
    """An example document loader that reads a file line by line."""

    def __init__(self, file_path: str) -> None:
        """Initialize the loader with a file path.

        Args:
            file_path: The path to the file to load.
        """
        self.file_path = file_path

    def lazy_load(self) -> Iterator[Document]:  # <-- Does not take any arguments
        """A lazy loader that reads a file line by line.

        When you're implementing lazy load methods, you should use a generator
        to yield documents one by one.
        """
        with open(self.file_path, encoding="utf-8") as f:
            line_number = 0
            for line in f:
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": self.file_path},
                )
                line_number += 1

    # alazy_load is OPTIONAL.
    # If you leave out the implementation, a default implementation which delegates to lazy_load will be used!
    async def alazy_load(
        self,
    ) -> AsyncIterator[Document]:  # <-- Does not take any arguments
        """An async lazy loader that reads a file line by line."""
        # Requires aiofiles
        # Install with `pip install aiofiles`
        # https://github.com/Tinche/aiofiles
        import aiofiles

        async with aiofiles.open(self.file_path, encoding="utf-8") as f:
            line_number = 0
            async for line in f:
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": self.file_path},
                )
                line_number += 1
```

### परीक्षण 🧪

दस्तावेज़ लोडर को परीक्षण करने के लिए, हमें कुछ गुणवत्तापूर्ण सामग्री वाली एक फ़ाइल की आवश्यकता है।

```python
with open("./meow.txt", "w", encoding="utf-8") as f:
    quality_content = "meow meow🐱 \n meow meow🐱 \n meow😻😻"
    f.write(quality_content)

loader = CustomDocumentLoader("./meow.txt")
```

```python
## Test out the lazy load interface
for doc in loader.lazy_load():
    print()
    print(type(doc))
    print(doc)
```

```output

<class 'langchain_core.documents.base.Document'>
page_content='meow meow🐱 \n' metadata={'line_number': 0, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow meow🐱 \n' metadata={'line_number': 1, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow😻😻' metadata={'line_number': 2, 'source': './meow.txt'}
```

```python
## Test out the async implementation
async for doc in loader.alazy_load():
    print()
    print(type(doc))
    print(doc)
```

```output

<class 'langchain_core.documents.base.Document'>
page_content='meow meow🐱 \n' metadata={'line_number': 0, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow meow🐱 \n' metadata={'line_number': 1, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow😻😻' metadata={'line_number': 2, 'source': './meow.txt'}
```

::: {.callout-tip}

`load()` एक इंटरैक्टिव वातावरण जैसे जूपिटर नोटबुक में उपयोगी हो सकता है।

उत्पादन कोड के लिए इसका उपयोग करने से बचें क्योंकि उत्साहपूर्वक लोडिंग यह मान लेती है कि सभी सामग्री मेमोरी में समाहित हो सकती है, जो हमेशा मामला नहीं होता है, खासकर उद्यम डेटा के लिए।
:::

```python
loader.load()
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 0, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 2, 'source': './meow.txt'})]
```

## फ़ाइलों के साथ काम करना

कई दस्तावेज़ लोडर फ़ाइलों को पार्स करने से संबंधित होते हैं। ऐसे लोडर के बीच अंतर आमतौर पर फ़ाइल को कैसे पार्स किया जाता है, न कि फ़ाइल को कैसे लोड किया जाता है। उदाहरण के लिए, आप PDF या मार्कडाउन फ़ाइल के बाइनरी सामग्री को पढ़ने के लिए `open` का उपयोग कर सकते हैं, लेकिन उस बाइनरी डेटा को पाठ में रूपांतरित करने के लिए अलग-अलग पार्सिंग लॉजिक की आवश्यकता होती है।

इसलिए, पार्सिंग लॉजिक को लोडिंग लॉजिक से अलग करना उपयोगी हो सकता है, जिससे किसी दिए गए पार्सर का पुनः उपयोग करना आसान हो जाता है, भले ही डेटा कैसे लोड किया गया हो।

### BaseBlobParser

एक `BaseBlobParser` एक इंटरफ़ेस है जो एक `blob` को स्वीकार करता है और `Document` ऑब्जेक्ट की एक सूची उत्पन्न करता है। एक `blob` मेमोरी या फ़ाइल में स्थित डेटा का एक प्रतिनिधित्व है। LangChain पायथन में एक `Blob` प्राथमिक है जो [Blob WebAPI spec](https://developer.mozilla.org/en-US/docs/Web/API/Blob) से प्रेरित है।

```python
from langchain_core.document_loaders import BaseBlobParser, Blob


class MyParser(BaseBlobParser):
    """A simple parser that creates a document from each line."""

    def lazy_parse(self, blob: Blob) -> Iterator[Document]:
        """Parse a blob into a document line by line."""
        line_number = 0
        with blob.as_bytes_io() as f:
            for line in f:
                line_number += 1
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": blob.source},
                )
```

```python
blob = Blob.from_path("./meow.txt")
parser = MyParser()
```

```python
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 2, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 3, 'source': './meow.txt'})]
```

**blob** API का उपयोग करने से एक फ़ाइल से पढ़े बिना ही सामग्री को सीधे मेमोरी से लोड करना भी संभव हो जाता है!

```python
blob = Blob(data=b"some data from memory\nmeow")
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='some data from memory\n', metadata={'line_number': 1, 'source': None}),
 Document(page_content='meow', metadata={'line_number': 2, 'source': None})]
```

### Blob

चलिए Blob API पर एक त्वरित नज़र डालते हैं।

```python
blob = Blob.from_path("./meow.txt", metadata={"foo": "bar"})
```

```python
blob.encoding
```

```output
'utf-8'
```

```python
blob.as_bytes()
```

```output
b'meow meow\xf0\x9f\x90\xb1 \n meow meow\xf0\x9f\x90\xb1 \n meow\xf0\x9f\x98\xbb\xf0\x9f\x98\xbb'
```

```python
blob.as_string()
```

```output
'meow meow🐱 \n meow meow🐱 \n meow😻😻'
```

```python
blob.as_bytes_io()
```

```output
<contextlib._GeneratorContextManager at 0x743f34324450>
```

```python
blob.metadata
```

```output
{'foo': 'bar'}
```

```python
blob.source
```

```output
'./meow.txt'
```

### Blob लोडर्स

जबकि एक पार्सर बाइनरी डेटा को दस्तावेजों में पार्स करने के लिए आवश्यक लॉजिक को कैप्सूलबद्ध करता है, *blob लोडर्स* किसी दिए गए स्टोरेज स्थान से blob को लोड करने के लिए आवश्यक लॉजिक को कैप्सूलबद्ध करते हैं।

अभी के लिए, `LangChain` केवल `FileSystemBlobLoader` का समर्थन करता है।

आप `FileSystemBlobLoader` का उपयोग कर सकते हैं ताकि blob को लोड किया जा सके और फिर पार्सर का उपयोग करके उन्हें पार्स किया जा सके।

```python
from langchain_community.document_loaders.blob_loaders import FileSystemBlobLoader

blob_loader = FileSystemBlobLoader(path=".", glob="*.mdx", show_progress=True)
```

```python
parser = MyParser()
for blob in blob_loader.yield_blobs():
    for doc in parser.lazy_parse(blob):
        print(doc)
        break
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='# Markdown\n' metadata={'line_number': 1, 'source': 'markdown.mdx'}
page_content='# JSON\n' metadata={'line_number': 1, 'source': 'json.mdx'}
page_content='---\n' metadata={'line_number': 1, 'source': 'pdf.mdx'}
page_content='---\n' metadata={'line_number': 1, 'source': 'index.mdx'}
page_content='# File Directory\n' metadata={'line_number': 1, 'source': 'file_directory.mdx'}
page_content='# CSV\n' metadata={'line_number': 1, 'source': 'csv.mdx'}
page_content='# HTML\n' metadata={'line_number': 1, 'source': 'html.mdx'}
```

### सामान्य लोडर

LangChain में एक `GenericLoader` अमूर्त है जो `BlobLoader` और `BaseBlobParser` को संयोजित करता है।

`GenericLoader` का उद्देश्य मानकीकृत वर्गमेथड प्रदान करना है जो मौजूदा `BlobLoader` कार्यान्वयनों का उपयोग करना आसान बनाते हैं। अभी के लिए, केवल `FileSystemBlobLoader` का समर्थन किया जाता है।

```python
from langchain_community.document_loaders.generic import GenericLoader

loader = GenericLoader.from_filesystem(
    path=".", glob="*.mdx", show_progress=True, parser=MyParser()
)

for idx, doc in enumerate(loader.lazy_load()):
    if idx < 5:
        print(doc)

print("... output truncated for demo purposes")
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 2, 'source': 'office_file.mdx'}
page_content='>[The Microsoft Office](https://www.office.com/) suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.\n' metadata={'line_number': 3, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 4, 'source': 'office_file.mdx'}
page_content='This covers how to load commonly used file formats including `DOCX`, `XLSX` and `PPTX` documents into a document format that we can use downstream.\n' metadata={'line_number': 5, 'source': 'office_file.mdx'}
... output truncated for demo purposes
```

#### कस्टम सामान्य लोडर

यदि आप वर्ग बनाने में वास्तव में पसंद करते हैं, तो आप उप-वर्ग बना सकते हैं और लॉजिक को एक साथ कैप्सूलबद्ध करने के लिए एक वर्ग बना सकते हैं।

आप मौजूदा लोडर का उपयोग करके सामग्री लोड करने के लिए इस वर्ग से उप-वर्ग बना सकते हैं।

```python
from typing import Any


class MyCustomLoader(GenericLoader):
    @staticmethod
    def get_parser(**kwargs: Any) -> BaseBlobParser:
        """Override this method to associate a default parser with the class."""
        return MyParser()
```

```python
loader = MyCustomLoader.from_filesystem(path=".", glob="*.mdx", show_progress=True)

for idx, doc in enumerate(loader.lazy_load()):
    if idx < 5:
        print(doc)

print("... output truncated for demo purposes")
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 2, 'source': 'office_file.mdx'}
page_content='>[The Microsoft Office](https://www.office.com/) suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.\n' metadata={'line_number': 3, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 4, 'source': 'office_file.mdx'}
page_content='This covers how to load commonly used file formats including `DOCX`, `XLSX` and `PPTX` documents into a document format that we can use downstream.\n' metadata={'line_number': 5, 'source': 'office_file.mdx'}
... output truncated for demo purposes
```
