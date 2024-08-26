---
translated: true
---

# Google Cloud Document AI

Document AI es una plataforma de comprensión de documentos de Google Cloud para transformar datos no estructurados de documentos en datos estructurados, lo que facilita su comprensión, análisis y consumo.

Más información:

- [Descripción general de Document AI](https://cloud.google.com/document-ai/docs/overview)
- [Videos y laboratorios de Document AI](https://cloud.google.com/document-ai/docs/videos)
- [¡Pruébalo!](https://cloud.google.com/document-ai/docs/drag-and-drop)

El módulo contiene un analizador de `PDF` basado en DocAI de Google Cloud.

Necesitas instalar dos bibliotecas para usar este analizador:

```python
%pip install --upgrade --quiet  langchain-google-community[docai]
```

Primero, debes configurar un bucket de Google Cloud Storage (GCS) y crear tu propio procesador de Reconocimiento Óptico de Caracteres (OCR) como se describe aquí: https://cloud.google.com/document-ai/docs/create-processor

El `GCS_OUTPUT_PATH` debe ser una ruta a una carpeta en GCS (que comience con `gs://`) y un `PROCESSOR_NAME` debe tener el aspecto de `projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID` o `projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID/processorVersions/PROCESSOR_VERSION_ID`. Puedes obtenerlo de forma programática o copiarlo de la sección "Punto final de predicción" de la pestaña "Detalles del procesador" en la Consola de Google Cloud.

```python
GCS_OUTPUT_PATH = "gs://BUCKET_NAME/FOLDER_PATH"
PROCESSOR_NAME = "projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID"
```

```python
from langchain_core.document_loaders.blob_loaders import Blob
from langchain_google_community import DocAIParser
```

Ahora, crea un `DocAIParser`.

```python
parser = DocAIParser(
    location="us", processor_name=PROCESSOR_NAME, gcs_output_path=GCS_OUTPUT_PATH
)
```

Para este ejemplo, puedes usar un informe de ganancias de Alphabet que se ha cargado en un bucket público de GCS.

[2022Q1_alphabet_earnings_release.pdf](https://storage.googleapis.com/cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/2022Q1_alphabet_earnings_release.pdf)

Pasa el documento al método `lazy_parse()` para

```python
blob = Blob(
    path="gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/2022Q1_alphabet_earnings_release.pdf"
)
```

Obtendremos un documento por página, 11 en total:

```python
docs = list(parser.lazy_parse(blob))
print(len(docs))
```

```output
11
```

Puedes ejecutar el análisis de un blob de extremo a extremo uno por uno. Si tienes muchos documentos, puede ser mejor agruparlos y, incluso, separar el análisis del manejo de los resultados del análisis.

```python
operations = parser.docai_parse([blob])
print([op.operation.name for op in operations])
```

```output
['projects/543079149601/locations/us/operations/16447136779727347991']
```

Puedes comprobar si las operaciones han finalizado:

```python
parser.is_running(operations)
```

```output
True
```

Y cuando hayan terminado, puedes analizar los resultados:

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

Y ahora finalmente podemos generar Documentos a partir de los resultados analizados:

```python
docs = list(parser.parse_from_results(results))
```

```python
print(len(docs))
```

```output
11
```
