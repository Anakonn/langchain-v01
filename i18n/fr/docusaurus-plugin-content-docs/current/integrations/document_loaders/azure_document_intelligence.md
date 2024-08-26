---
translated: true
---

# Intelligence documentaire Azure AI

>[Intelligence documentaire Azure AI](https://aka.ms/doc-intelligence) (anciennement connu sous le nom de `Azure Form Recognizer`) est un service basé sur l'apprentissage automatique qui extrait les textes (y compris l'écriture manuscrite), les tableaux, les structures de documents (par exemple, les titres, les en-têtes de section, etc.) et les paires clé-valeur à partir de fichiers PDF, d'images, de fichiers Office et HTML numériques ou numérisés.

>L'intelligence documentaire prend en charge les formats `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` et `HTML`.

Cette implémentation actuelle d'un chargeur utilisant `l'intelligence documentaire` peut incorporer le contenu page par page et le transformer en documents LangChain. Le format de sortie par défaut est le markdown, qui peut être facilement enchaîné avec `MarkdownHeaderTextSplitter` pour le découpage sémantique des documents. Vous pouvez également utiliser `mode="single"` ou `mode="page"` pour renvoyer des textes purs dans une seule page ou un document divisé par page.

## Prérequis

Une ressource Azure AI Document Intelligence dans l'une des 3 régions d'aperçu : **East US**, **West US2**, **West Europe** - suivez [ce document](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) pour en créer une si vous n'en avez pas. Vous transmettrez `<endpoint>` et `<key>` en tant que paramètres au chargeur.

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

## Exemple 1

Le premier exemple utilise un fichier local qui sera envoyé à Azure AI Document Intelligence.

Avec le client d'analyse de documents initialisé, nous pouvons procéder à la création d'une instance de DocumentIntelligenceLoader :

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

La sortie par défaut contient un document LangChain avec un contenu au format markdown :

```python
documents
```

## Exemple 2

Le fichier d'entrée peut également être un chemin d'URL public. Par exemple, https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/rest-api/layout.png.

```python
url_path = "<url>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, url_path=url_path, api_model="prebuilt-layout"
)

documents = loader.load()
```

```python
documents
```

## Exemple 3

Vous pouvez également spécifier `mode="page"` pour charger le document par pages.

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    mode="page",
)

documents = loader.load()
```

La sortie sera chaque page stockée en tant que document distinct dans la liste :

```python
for document in documents:
    print(f"Page Content: {document.page_content}")
    print(f"Metadata: {document.metadata}")
```

## Exemple 4

Vous pouvez également spécifier `analysis_feature=["ocrHighResolution"]` pour activer les capacités supplémentaires. Pour plus d'informations, consultez : https://aka.ms/azsdk/python/documentintelligence/analysisfeature.

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
analysis_features = ["ocrHighResolution"]
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    analysis_features=analysis_features,
)

documents = loader.load()
```

La sortie contient le document LangChain reconnu avec la capacité d'ajout haute résolution :

```python
documents
```
