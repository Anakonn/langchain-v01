---
translated: true
---

# mhtml

MHTMLは、メールだけでなくWebページのアーカイブにも使用されます。MHTMLは時にMHTと呼ばれ、MIME HTMLの略で、Webページ全体がアーカイブされた単一のファイルです。WebページをこのMHTML形式で保存すると、このファイル拡張子にはHTML、画像、オーディオファイル、Flash アニメーションなどが含まれます。

```python
from langchain_community.document_loaders import MHTMLLoader
```

```python
# Create a new loader object for the MHTML file
loader = MHTMLLoader(
    file_path="../../../../../../tests/integration_tests/examples/example.mht"
)

# Load the document from the file
documents = loader.load()

# Print the documents to see the results
for doc in documents:
    print(doc)
```

```output
page_content='LangChain\nLANG CHAIN 🦜️🔗Official Home Page\xa0\n\n\n\n\n\n\n\nIntegrations\n\n\n\nFeatures\n\n\n\n\nBlog\n\n\n\nConceptual Guide\n\n\n\n\nPython Repo\n\n\nJavaScript Repo\n\n\n\nPython Documentation \n\n\nJavaScript Documentation\n\n\n\n\nPython ChatLangChain \n\n\nJavaScript ChatLangChain\n\n\n\n\nDiscord \n\n\nTwitter\n\n\n\n\nIf you have any comments about our WEB page, you can \nwrite us at the address shown above.  However, due to \nthe limited number of personnel in our corporate office, we are unable to \nprovide a direct response.\n\nCopyright © 2023-2023 LangChain Inc.\n\n\n' metadata={'source': '../../../../../../tests/integration_tests/examples/example.mht', 'title': 'LangChain'}
```
