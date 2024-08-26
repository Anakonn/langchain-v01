---
translated: true
---

# Microsoft PowerPoint

>[Microsoft PowerPoint](https://en.wikipedia.org/wiki/Microsoft_PowerPoint) est un programme de présentation de Microsoft.

Cela couvre comment charger des documents `Microsoft PowerPoint` dans un format de document que nous pouvons utiliser en aval.

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

### Conserver les éléments

En interne, `Unstructured` crée différents "éléments" pour différents blocs de texte. Par défaut, nous les combinons, mais vous pouvez facilement conserver cette séparation en spécifiant `mode="elements"`.

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

## Utilisation d'Azure AI Document Intelligence

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (anciennement connu sous le nom de `Azure Form Recognizer`) est un service basé sur l'apprentissage automatique qui extrait des textes (y compris l'écriture manuscrite), des tableaux, des structures de documents (par exemple, des titres, des en-têtes de section, etc.) et des paires clé-valeur à partir de fichiers PDF, d'images, de fichiers Office et HTML numériques ou numérisés.

>Document Intelligence prend en charge `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` et `HTML`.

Cette implémentation actuelle d'un chargeur utilisant `Document Intelligence` peut incorporer le contenu page par page et le transformer en documents LangChain. Le format de sortie par défaut est le markdown, qui peut être facilement enchaîné avec `MarkdownHeaderTextSplitter` pour le découpage sémantique des documents. Vous pouvez également utiliser `mode="single"` ou `mode="page"` pour renvoyer des textes purs dans une seule page ou un document divisé par page.

## Prérequis

Une ressource Azure AI Document Intelligence dans l'une des 3 régions de prévisualisation : **East US**, **West US2**, **West Europe** - suivez [ce document](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) pour en créer une si vous n'en avez pas. Vous transmettrez `<endpoint>` et `<key>` en tant que paramètres au chargeur.

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
