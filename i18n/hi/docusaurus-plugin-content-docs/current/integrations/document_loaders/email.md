---
translated: true
---

यह नोटबुक ईमेल (`.eml`) या `Microsoft Outlook` (`.msg`) फ़ाइलों को कैसे लोड करें, दिखाता है।

## Unstructured का उपयोग करना

```python
%pip install --upgrade --quiet  unstructured
```

```python
from langchain_community.document_loaders import UnstructuredEmailLoader
```

```python
loader = UnstructuredEmailLoader("example_data/fake-email.eml")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='This is a test email to use for unit tests.\n\nImportant points:\n\nRoses are red\n\nViolets are blue', metadata={'source': 'example_data/fake-email.eml'})]
```

### तत्वों को बरकरार रखना

अंदर से, Unstructured विभिन्न "तत्वों" को पाठ के अलग-अलग टुकड़ों के लिए बनाता है। डिफ़ॉल्ट रूप से हम उन्हें एक साथ जोड़ देते हैं, लेकिन आप `mode="elements"` निर्दिष्ट करके इस अलगाव को आसानी से बरकरार रख सकते हैं।

```python
loader = UnstructuredEmailLoader("example_data/fake-email.eml", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to use for unit tests.', metadata={'source': 'example_data/fake-email.eml', 'filename': 'fake-email.eml', 'file_directory': 'example_data', 'date': '2022-12-16T17:04:16-05:00', 'filetype': 'message/rfc822', 'sent_from': ['Matthew Robinson <mrobinson@unstructured.io>'], 'sent_to': ['Matthew Robinson <mrobinson@unstructured.io>'], 'subject': 'Test Email', 'category': 'NarrativeText'})
```

### अनुलग्नकों को प्रोसेस करना

आप `UnstructuredEmailLoader` के साथ अनुलग्नकों को प्रोसेस कर सकते हैं, जिसमें `process_attachments=True` को निर्माता में सेट करें। डिफ़ॉल्ट रूप से, अनुलग्नक `unstructured` से `partition` फ़ंक्शन का उपयोग करके विभाजित किए जाएंगे। आप `attachment_partitioner` kwarg में एक अलग पार्टिशनिंग फ़ंक्शन पास करके उसका उपयोग कर सकते हैं।

```python
loader = UnstructuredEmailLoader(
    "example_data/fake-email.eml",
    mode="elements",
    process_attachments=True,
)
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to use for unit tests.', metadata={'source': 'example_data/fake-email.eml', 'filename': 'fake-email.eml', 'file_directory': 'example_data', 'date': '2022-12-16T17:04:16-05:00', 'filetype': 'message/rfc822', 'sent_from': ['Matthew Robinson <mrobinson@unstructured.io>'], 'sent_to': ['Matthew Robinson <mrobinson@unstructured.io>'], 'subject': 'Test Email', 'category': 'NarrativeText'})
```

## OutlookMessageLoader का उपयोग करना

```python
%pip install --upgrade --quiet  extract_msg
```

```python
from langchain_community.document_loaders import OutlookMessageLoader
```

```python
loader = OutlookMessageLoader("example_data/fake-email.msg")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to experiment with the MS Outlook MSG Extractor\r\n\r\n\r\n-- \r\n\r\n\r\nKind regards\r\n\r\n\r\n\r\n\r\nBrian Zhou\r\n\r\n', metadata={'subject': 'Test for TIF files', 'sender': 'Brian Zhou <brizhou@gmail.com>', 'date': 'Mon, 18 Nov 2013 16:26:24 +0800'})
```
