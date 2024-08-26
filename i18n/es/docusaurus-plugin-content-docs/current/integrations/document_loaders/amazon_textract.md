---
translated: true
---

# Amazon Textract

>[Amazon Textract](https://docs.aws.amazon.com/managedservices/latest/userguide/textract.html) es un servicio de aprendizaje automático (ML) que extrae automáticamente texto, escritura a mano y datos de documentos escaneados.

>Va más allá de la simple reconocimiento óptico de caracteres (OCR) para identificar, comprender y extraer datos de formularios y tablas. Hoy en día, muchas empresas extraen manualmente datos de documentos escaneados como PDF, imágenes, tablas y formularios, o a través de un software simple de OCR que requiere configuración manual (que a menudo debe actualizarse cuando el formulario cambia). Para superar estos procesos manuales y costosos, `Textract` usa ML para leer y procesar cualquier tipo de documento, extrayendo con precisión texto, escritura a mano, tablas y otros datos sin esfuerzo manual.

Esta muestra demuestra el uso de `Amazon Textract` en combinación con LangChain como un DocumentLoader.

`Textract` admite formatos `PDF`, `TIFF`, `PNG` y `JPEG`.

`Textract` admite estos [tamaños de documento, idiomas y caracteres](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html).

```python
%pip install --upgrade --quiet  boto3 langchain-openai tiktoken python-dotenv
```

```python
%pip install --upgrade --quiet  "amazon-textract-caller>=0.2.0"
```

## Muestra 1

El primer ejemplo usa un archivo local, que internamente se enviará a la API sincrónica de Amazon Textract [DetectDocumentText](https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html).

Los archivos locales o los puntos finales de URL como HTTP:// se limitan a documentos de una sola página para Textract.
Los documentos de varias páginas deben residir en S3. Este archivo de muestra es un jpeg.

```python
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader("example_data/alejandro_rosalez_sample-small.jpeg")
documents = loader.load()
```

Salida del archivo

```python
documents
```

```output
[Document(page_content='Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No ', metadata={'source': 'example_data/alejandro_rosalez_sample-small.jpeg', 'page': 1})]
```

## Muestra 2

La siguiente muestra carga un archivo desde un extremo HTTPS.
Tiene que ser de una sola página, ya que Amazon Textract requiere que todos los documentos de varias páginas se almacenen en S3.

```python
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader(
    "https://amazon-textract-public-content.s3.us-east-2.amazonaws.com/langchain/alejandro_rosalez_sample_1.jpg"
)
documents = loader.load()
```

```python
documents
```

```output
[Document(page_content='Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No ', metadata={'source': 'example_data/alejandro_rosalez_sample-small.jpeg', 'page': 1})]
```

## Muestra 3

Procesar un documento de varias páginas requiere que el documento esté en S3. El documento de muestra reside en un bucket en us-east-2 y Textract necesita llamarse en esa misma región para tener éxito, por lo que establecemos el region_name en el cliente y lo pasamos al cargador para asegurarnos de que Textract se llame desde us-east-2. También podrías tener tu cuaderno en ejecución en us-east-2, estableciendo AWS_DEFAULT_REGION en us-east-2 o, cuando se ejecute en un entorno diferente, pasar un cliente Textract de boto3 con ese nombre de región como en la celda a continuación.

```python
import boto3

textract_client = boto3.client("textract", region_name="us-east-2")

file_path = "s3://amazon-textract-public-content/langchain/layout-parser-paper.pdf"
loader = AmazonTextractPDFLoader(file_path, client=textract_client)
documents = loader.load()
```

Ahora obteniendo el número de páginas para validar la respuesta (imprimir toda la respuesta sería bastante largo...). Esperamos 16 páginas.

```python
len(documents)
```

```output
16
```

## Muestra 4

Tiene la opción de pasar un parámetro adicional llamado `linearization_config` al AmazonTextractPDFLoader, que determinará cómo se linealizará la salida de texto por el analizador después de que se ejecute Textract.

```python
from langchain_community.document_loaders import AmazonTextractPDFLoader
from textractor.data.text_linearization_config import TextLinearizationConfig

loader = AmazonTextractPDFLoader(
    "s3://amazon-textract-public-content/langchain/layout-parser-paper.pdf",
    linearization_config=TextLinearizationConfig(
        hide_header_layout=True,
        hide_footer_layout=True,
        hide_figure_layout=True,
    ),
)
documents = loader.load()
```

## Uso del AmazonTextractPDFLoader en una cadena LangChain (p. ej. OpenAI)

El AmazonTextractPDFLoader se puede usar en una cadena de la misma manera que se usan los otros cargadores.
Textract mismo tiene una [función de consulta](https://docs.aws.amazon.com/textract/latest/dg/API_Query.html), que ofrece una funcionalidad similar a la cadena de QA en esta muestra, que vale la pena revisar también.

```python
# You can store your OPENAI_API_KEY in a .env file as well
# import os
# from dotenv import load_dotenv

# load_dotenv()
```

```python
# Or set the OpenAI key in the environment directly
import os

os.environ["OPENAI_API_KEY"] = "your-OpenAI-API-key"
```

```python
from langchain.chains.question_answering import load_qa_chain
from langchain_openai import OpenAI

chain = load_qa_chain(llm=OpenAI(), chain_type="map_reduce")
query = ["Who are the autors?"]

chain.run(input_documents=documents, question=query)
```

```output
' The authors are Zejiang Shen, Ruochen Zhang, Melissa Dell, Benjamin Charles Germain Lee, Jacob Carlson, Weining Li, Gardner, M., Grus, J., Neumann, M., Tafjord, O., Dasigi, P., Liu, N., Peters, M., Schmitz, M., Zettlemoyer, L., Lukasz Garncarek, Powalski, R., Stanislawek, T., Topolski, B., Halama, P., Gralinski, F., Graves, A., Fernández, S., Gomez, F., Schmidhuber, J., Harley, A.W., Ufkes, A., Derpanis, K.G., He, K., Gkioxari, G., Dollár, P., Girshick, R., He, K., Zhang, X., Ren, S., Sun, J., Kay, A., Lamiroy, B., Lopresti, D., Mears, J., Jakeway, E., Ferriter, M., Adams, C., Yarasavage, N., Thomas, D., Zwaard, K., Li, M., Cui, L., Huang,'
```
