---
canonical: https://python.langchain.com/v0.1/docs/integrations/document_loaders/microsoft_powerpoint
translated: false
---

# Microsoft PowerPoint

>[Microsoft PowerPoint](https://en.wikipedia.org/wiki/Microsoft_PowerPoint) is a presentation program by Microsoft.

This covers how to load `Microsoft PowerPoint` documents into a document format that we can use downstream.

```python
from langchain_community.document_loaders import UnstructuredPowerPointLoader
```

```python
loader = UnstructuredPowerPointLoader("example_data/fake-power-point.pptx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Adding a Bullet Slide\n\nFind the bullet slide layout\n\nUse _TextFrame.text for first bullet\n\nUse _TextFrame.add_paragraph() for subsequent bullets\n\nHere is a lot of text!\n\nHere is some text in a text box!', metadata={'source': 'example_data/fake-power-point.pptx'})]
```

### Retain Elements

Under the hood, `Unstructured` creates different "elements" for different chunks of text. By default we combine those together, but you can easily keep that separation by specifying `mode="elements"`.

```python
loader = UnstructuredPowerPointLoader(
    "example_data/fake-power-point.pptx", mode="elements"
)
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='Adding a Bullet Slide', lookup_str='', metadata={'source': 'example_data/fake-power-point.pptx'}, lookup_index=0)
```

## Using Azure AI Document Intelligence

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (formerly known as `Azure Form Recognizer`) is machine-learning
>based service that extracts texts (including handwriting), tables, document structures (e.g., titles, section headings, etc.) and key-value-pairs from
>digital or scanned PDFs, images, Office and HTML files.
>
>Document Intelligence supports `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` and `HTML`.

This current implementation of a loader using `Document Intelligence` can incorporate content page-wise and turn it into LangChain documents. The default output format is markdown, which can be easily chained with `MarkdownHeaderTextSplitter` for semantic document chunking. You can also use `mode="single"` or `mode="page"` to return pure texts in a single page or document split by page.

## Prerequisite

An Azure AI Document Intelligence resource in one of the 3 preview regions: **East US**, **West US2**, **West Europe** - follow [this document](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) to create one if you don't have. You will be passing `<endpoint>` and `<key>` as parameters to the loader.

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, file_path=file_path, api_model="prebuilt-layout"
)

documents = loader.load()
```