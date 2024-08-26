---
translated: true
---

# Amazon Textract

>[Amazon Textract](https://docs.aws.amazon.com/managedservices/latest/userguide/textract.html) est un service d'apprentissage automatique (ML) qui extrait automatiquement le texte, l'écriture manuscrite et les données des documents numérisés.

>Il va au-delà de la simple reconnaissance optique des caractères (OCR) pour identifier, comprendre et extraire les données des formulaires et des tableaux. Aujourd'hui, de nombreuses entreprises extraient manuellement les données des documents numérisés tels que les PDF, les images, les tableaux et les formulaires, ou à l'aide d'un simple logiciel OCR qui nécessite une configuration manuelle (qui doit souvent être mise à jour lorsque le formulaire change). Pour surmonter ces processus manuels et coûteux, `Textract` utilise l'apprentissage automatique pour lire et traiter tout type de document, extrayant avec précision le texte, l'écriture manuscrite, les tableaux et d'autres données sans effort manuel.

Cet exemple démontre l'utilisation d'`Amazon Textract` en combinaison avec LangChain en tant que DocumentLoader.

`Textract` prend en charge les formats `PDF`, `TIFF`, `PNG` et `JPEG`.

`Textract` prend en charge ces [tailles de documents, langues et caractères](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html).

```python
%pip install --upgrade --quiet  boto3 langchain-openai tiktoken python-dotenv
```

```python
%pip install --upgrade --quiet  "amazon-textract-caller>=0.2.0"
```

## Exemple 1

Le premier exemple utilise un fichier local, qui sera envoyé en interne à l'API synchrone Amazon Textract [DetectDocumentText](https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html).

Les fichiers locaux ou les points de terminaison URL comme HTTP:// sont limités aux documents d'une seule page pour Textract.
Les documents multi-pages doivent résider sur S3. Cet exemple de fichier est un jpeg.

```python
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader("example_data/alejandro_rosalez_sample-small.jpeg")
documents = loader.load()
```

Sortie du fichier

```python
documents
```

```output
[Document(page_content='Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No ', metadata={'source': 'example_data/alejandro_rosalez_sample-small.jpeg', 'page': 1})]
```

## Exemple 2

L'exemple suivant charge un fichier à partir d'un point de terminaison HTTPS.
Il doit être d'une seule page, car Amazon Textract exige que tous les documents multi-pages soient stockés sur S3.

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

## Exemple 3

Le traitement d'un document multi-pages nécessite que le document soit sur S3. Le document d'exemple se trouve dans un compartiment dans us-east-2 et Textract doit être appelé dans cette même région pour réussir, nous définissons donc le region_name sur le client et le transmettons au loader pour s'assurer que Textract est appelé à partir de us-east-2. Vous pourriez également avoir votre notebook en cours d'exécution dans us-east-2, en définissant AWS_DEFAULT_REGION sur us-east-2 ou, lorsque vous exécutez dans un environnement différent, en transmettant un client Textract boto3 avec ce nom de région comme dans la cellule ci-dessous.

```python
import boto3

textract_client = boto3.client("textract", region_name="us-east-2")

file_path = "s3://amazon-textract-public-content/langchain/layout-parser-paper.pdf"
loader = AmazonTextractPDFLoader(file_path, client=textract_client)
documents = loader.load()
```

Maintenant, obtenir le nombre de pages pour valider la réponse (l'impression de la réponse complète serait assez longue...). Nous nous attendons à 16 pages.

```python
len(documents)
```

```output
16
```

## Exemple 4

Vous avez la possibilité de transmettre un paramètre supplémentaire appelé `linearization_config` à l'AmazonTextractPDFLoader, qui déterminera la façon dont la sortie de texte sera linéarisée par l'analyseur après l'exécution de Textract.

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

## Utilisation de l'AmazonTextractPDFLoader dans une chaîne LangChain (par exemple OpenAI)

L'AmazonTextractPDFLoader peut être utilisé dans une chaîne de la même manière que les autres chargeurs.
Textract lui-même dispose d'une [fonctionnalité de requête](https://docs.aws.amazon.com/textract/latest/dg/API_Query.html), qui offre une fonctionnalité similaire à la chaîne QA dans cet exemple, qui vaut la peine d'être examinée également.

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
