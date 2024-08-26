---
translated: true
---

# Google Cloud Document AI

Document AI est une plateforme de compréhension de documents de Google Cloud pour transformer les données non structurées des documents en données structurées, ce qui facilite leur compréhension, leur analyse et leur utilisation.

En savoir plus :

- [Présentation de Document AI](https://cloud.google.com/document-ai/docs/overview)
- [Vidéos et laboratoires Document AI](https://cloud.google.com/document-ai/docs/videos)
- [Essayez-le !](https://cloud.google.com/document-ai/docs/drag-and-drop)

Le module contient un analyseur `PDF` basé sur DocAI de Google Cloud.

Vous devez installer deux bibliothèques pour utiliser cet analyseur :

```python
%pip install --upgrade --quiet  langchain-google-community[docai]
```

Tout d'abord, vous devez configurer un bucket Google Cloud Storage (GCS) et créer votre propre processeur de reconnaissance optique de caractères (OCR) comme décrit ici : https://cloud.google.com/document-ai/docs/create-processor

Le `GCS_OUTPUT_PATH` doit être un chemin vers un dossier sur GCS (commençant par `gs://`) et un `PROCESSOR_NAME` doit ressembler à `projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID` ou `projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID/processorVersions/PROCESSOR_VERSION_ID`. Vous pouvez l'obtenir de manière programmatique ou le copier depuis la section "Point de terminaison de prédiction" de l'onglet "Détails du processeur" dans la console Google Cloud.

```python
GCS_OUTPUT_PATH = "gs://BUCKET_NAME/FOLDER_PATH"
PROCESSOR_NAME = "projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID"
```

```python
from langchain_core.document_loaders.blob_loaders import Blob
from langchain_google_community import DocAIParser
```

Maintenant, créez un `DocAIParser`.

```python
parser = DocAIParser(
    location="us", processor_name=PROCESSOR_NAME, gcs_output_path=GCS_OUTPUT_PATH
)
```

Pour cet exemple, vous pouvez utiliser un rapport de résultats d'Alphabet qui a été téléchargé sur un bucket GCS public.

[2022Q1_alphabet_earnings_release.pdf](https://storage.googleapis.com/cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/2022Q1_alphabet_earnings_release.pdf)

Passez le document à la méthode `lazy_parse()` pour

```python
blob = Blob(
    path="gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/2022Q1_alphabet_earnings_release.pdf"
)
```

Nous obtiendrons un document par page, soit 11 au total :

```python
docs = list(parser.lazy_parse(blob))
print(len(docs))
```

```output
11
```

Vous pouvez exécuter le traitement de bout en bout d'un blob un par un. Si vous avez de nombreux documents, il peut être préférable de les regrouper et même de détacher l'analyse du traitement des résultats de l'analyse.

```python
operations = parser.docai_parse([blob])
print([op.operation.name for op in operations])
```

```output
['projects/543079149601/locations/us/operations/16447136779727347991']
```

Vous pouvez vérifier si les opérations sont terminées :

```python
parser.is_running(operations)
```

```output
True
```

Et lorsqu'elles sont terminées, vous pouvez analyser les résultats :

```python
parser.is_running(operations)
```

```output
False
```

```python
results = parser.get_results(operations)
print(results[0])
```

```output
DocAIParsingResults(source_path='gs://vertex-pgt/examples/goog-exhibit-99-1-q1-2023-19.pdf', parsed_path='gs://vertex-pgt/test/run1/16447136779727347991/0')
```

Et maintenant, nous pouvons enfin générer des documents à partir des résultats analysés :

```python
docs = list(parser.parse_from_results(results))
```

```python
print(len(docs))
```

```output
11
```
