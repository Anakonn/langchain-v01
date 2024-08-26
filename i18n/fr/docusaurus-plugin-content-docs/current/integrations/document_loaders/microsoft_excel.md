---
translated: true
---

# Microsoft Excel

Le `UnstructuredExcelLoader` est utilisé pour charger les fichiers `Microsoft Excel`. Le chargeur fonctionne avec les fichiers `.xlsx` et `.xls`. Le contenu de la page sera le texte brut du fichier Excel. Si vous utilisez le chargeur en mode `"elements"`, une représentation HTML du fichier Excel sera disponible dans les métadonnées du document sous la clé `text_as_html`.

```python
from langchain_community.document_loaders import UnstructuredExcelLoader
```

```python
loader = UnstructuredExcelLoader("example_data/stanley-cups.xlsx", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='\n  \n    \n      Team\n      Location\n      Stanley Cups\n    \n    \n      Blues\n      STL\n      1\n    \n    \n      Flyers\n      PHI\n      2\n    \n    \n      Maple Leafs\n      TOR\n      13\n    \n  \n', metadata={'source': 'example_data/stanley-cups.xlsx', 'filename': 'stanley-cups.xlsx', 'file_directory': 'example_data', 'filetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'page_number': 1, 'page_name': 'Stanley Cups', 'text_as_html': '<table border="1" class="dataframe">\n  <tbody>\n    <tr>\n      <td>Team</td>\n      <td>Location</td>\n      <td>Stanley Cups</td>\n    </tr>\n    <tr>\n      <td>Blues</td>\n      <td>STL</td>\n      <td>1</td>\n    </tr>\n    <tr>\n      <td>Flyers</td>\n      <td>PHI</td>\n      <td>2</td>\n    </tr>\n    <tr>\n      <td>Maple Leafs</td>\n      <td>TOR</td>\n      <td>13</td>\n    </tr>\n  </tbody>\n</table>', 'category': 'Table'})
```

## Utilisation d'Azure AI Document Intelligence

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (anciennement connu sous le nom de `Azure Form Recognizer`) est un service basé sur l'apprentissage automatique qui extrait les textes (y compris l'écriture manuscrite), les tableaux, les structures de documents (par exemple, les titres, les en-têtes de section, etc.) et les paires clé-valeur à partir de fichiers PDF, d'images, de fichiers Office et HTML numériques ou numérisés.
>
>Document Intelligence prend en charge les formats `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` et `HTML`.

Cette implémentation actuelle d'un chargeur utilisant `Document Intelligence` peut incorporer le contenu page par page et le transformer en documents LangChain. Le format de sortie par défaut est le markdown, qui peut facilement être enchaîné avec `MarkdownHeaderTextSplitter` pour le découpage sémantique des documents. Vous pouvez également utiliser `mode="single"` ou `mode="page"` pour renvoyer des textes purs dans une seule page ou un document divisé par page.

### Prérequis

Une ressource Azure AI Document Intelligence dans l'une des 3 régions d'aperçu : **East US**, **West US2**, **West Europe** - suivez [ce document](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) pour en créer une si vous n'en avez pas. Vous transmettrez `<endpoint>` et `<key>` en tant que paramètres au chargeur.

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
