---
translated: true
---

# Microsoft Word

>[Microsoft Word](https://www.microsoft.com/en-us/microsoft-365/word) est un traitement de texte développé par Microsoft.

Cela couvre comment charger des documents `Word` dans un format de document que nous pouvons utiliser en aval.

## Utilisation de Docx2txt

Chargez .docx à l'aide de `Docx2txt` dans un document.

```python
%pip install --upgrade --quiet  docx2txt
```

```python
from langchain_community.document_loaders import Docx2txtLoader
```

```python
loader = Docx2txtLoader("example_data/fake.docx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.docx'})]
```

## Utilisation d'Unstructured

```python
from langchain_community.document_loaders import UnstructuredWordDocumentLoader
```

```python
loader = UnstructuredWordDocumentLoader("example_data/fake.docx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 'fake.docx'}, lookup_index=0)]
```

### Conserver les éléments

En interne, Unstructured crée différents "éléments" pour différents blocs de texte. Par défaut, nous les combinons, mais vous pouvez facilement conserver cette séparation en spécifiant `mode="elements"`.

```python
loader = UnstructuredWordDocumentLoader("example_data/fake.docx", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 'fake.docx', 'filename': 'fake.docx', 'category': 'Title'}, lookup_index=0)
```

## Utilisation d'Azure AI Document Intelligence

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (anciennement connu sous le nom de `Azure Form Recognizer`) est un service basé sur l'apprentissage automatique qui extrait les textes (y compris l'écriture manuscrite), les tableaux, les structures de documents (par exemple, les titres, les en-têtes de section, etc.) et les paires clé-valeur à partir de PDF, d'images, de fichiers Office et HTML numériques ou numérisés.

Document Intelligence prend en charge `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` et `HTML`.

Cette implémentation actuelle d'un chargeur utilisant `Document Intelligence` peut incorporer le contenu page par page et le transformer en documents LangChain. Le format de sortie par défaut est le markdown, qui peut être facilement enchaîné avec `MarkdownHeaderTextSplitter` pour le découpage sémantique des documents. Vous pouvez également utiliser `mode="single"` ou `mode="page"` pour renvoyer des textes purs sur une seule page ou un document divisé par page.

## Prérequis

Une ressource Azure AI Document Intelligence dans l'une des 3 régions de prévisualisation : **East US**, **West US2**, **West Europe** - suivez [ce document](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) pour en créer une si vous n'en avez pas. Vous transmettrez `<endpoint>` et `<key>` en tant que paramètres au chargeur.

%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence

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
