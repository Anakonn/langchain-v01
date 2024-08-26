---
translated: true
---

# Amazon Textract

> [Amazon Textract](https://docs.aws.amazon.com/managedservices/latest/userguide/textract.html) is a machine learning (ML) service that automatically extracts text, handwriting, and data from scanned documents. It goes beyond simple optical character recognition (OCR) to identify, understand, and extract data from forms and tables. `Textract` uses ML to read and process any type of document, accurately extracting text, handwriting, tables, and other data with no manual effort.

This sample demonstrates the use of `Amazon Textract` in combination with LangChain as a DocumentLoader.

`Textract` supports `PDF`, `TIFF`, `PNG`, and `JPEG` formats.

`Textract` supports these [document sizes, languages, and characters](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html).

## 설치

먼저 `boto3`, `langchain-openai`, `tiktoken`, `python-dotenv` 패키지를 설치합니다.

```python
%pip install --upgrade --quiet  boto3 langchain-openai tiktoken python-dotenv
```

다음으로 `amazon-textract-caller` 패키지를 설치합니다.

```python
%pip install --upgrade --quiet  "amazon-textract-caller>=0.2.0"
```

## Sample 1

첫 번째 예제에서는 로컬 파일을 사용합니다. 내부적으로는 Amazon Textract의 동기 API [DetectDocumentText](https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html)를 호출합니다. 로컬 파일이나 HTTP와 같은 URL 엔드포인트는 Textract에서 단일 페이지 문서로 제한됩니다. 다중 페이지 문서는 S3에 저장되어야 합니다. 이 샘플 파일은 jpeg 형식입니다.

```python
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader("example_data/alejandro_rosalez_sample-small.jpeg")
documents = loader.load()
```

파일의 출력 결과입니다.

```python
documents
```

```output
[Document(page_content='Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No ', metadata={'source': 'example_data/alejandro_rosalez_sample-small.jpeg', 'page': 1})]
```

## Sample 2

다음 샘플에서는 HTTPS 엔드포인트에서 파일을 로드합니다. 단일 페이지여야 하며, Amazon Textract는 모든 다중 페이지 문서를 S3에 저장해야 합니다.

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

## Sample 3

다중 페이지 문서를 처리하려면 문서를 S3에 저장해야 합니다. 샘플 문서는 us-east-2 버킷에 있으며 Textract는 동일한 리전에서 호출되어야 성공합니다. 따라서 클라이언트에서 `region_name`을 설정하고 로더에 전달하여 Textract가 us-east-2에서 호출되도록 합니다. 노트북이 us-east-2에서 실행되고 있는 경우 `AWS_DEFAULT_REGION`을 us-east-2로 설정하거나, 다른 환경에서 실행 중인 경우 아래 셀과 같이 boto3 Textract 클라이언트를 해당 리전 이름과 함께 전달합니다.

```python
import boto3

textract_client = boto3.client("textract", region_name="us-east-2")

file_path = "s3://amazon-textract-public-content/langchain/layout-parser-paper.pdf"
loader = AmazonTextractPDFLoader(file_path, client=textract_client)
documents = loader.load()
```

응답을 검증하기 위해 페이지 수를 확인합니다 (전체 응답을 출력하면 길어질 수 있습니다). 16페이지가 예상됩니다.

```python
len(documents)
```

```output
16
```

## Sample 4

AmazonTextractPDFLoader에 추가 매개변수인 `linearization_config`를 전달하여 Textract 실행 후 텍스트 출력이 파서에 의해 선형화되는 방식을 결정할 수 있습니다.

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

## LangChain 체인에서 AmazonTextractPDFLoader 사용 (예: OpenAI)

AmazonTextractPDFLoader는 다른 로더가 사용되는 방식과 동일하게 체인에서 사용할 수 있습니다. Textract 자체에도 [Query 기능](https://docs.aws.amazon.com/textract/latest/dg/API_Query.html)이 있으며, 이 기능은 이 샘플의 QA 체인과 유사한 기능을 제공합니다. 이 기능도 확인해보세요.

```python
# OpenAI API 키를 .env 파일에 저장할 수도 있습니다

# import os

# from dotenv import load_dotenv

# load_dotenv()

```

```python
# 또는 OpenAI 키를 환경 변수에 직접 설정할 수도 있습니다

import os

os.environ["OPENAI_API_KEY"] = "your-OpenAI-API-key"
```

```python
from langchain.chains.question_answering import load_qa_chain
from langchain_openai import OpenAI

chain = load_qa_chain(llm=OpenAI(), chain_type="map_reduce")
query = ["Who are the authors?"]

chain.run(input_documents=documents, question=query)
```

```output
' The authors are Zejiang Shen, Ruochen Zhang, Melissa Dell, Benjamin Charles Germain Lee, Jacob Carlson, Weining Li, Gardner, M., Grus, J., Neumann, M., Tafjord, O., Dasigi, P., Liu, N., Peters, M., Schmitz, M., Zettlemoyer, L., Lukasz Garncarek, Powalski, R., Stanislawek, T., Topolski, B., Halama, P., Gralinski, F., Graves, A., Fernández, S., Gomez, F., Schmidhuber, J., Harley, A.W., Ufkes, A., Derpanis, K.G., He, K., Gkioxari, G., Dollár, P., Girshick, R., He, K., Zhang, X., Ren, S., Sun, J., Kay, A., Lamiroy, B., Lopresti, D., Mears, J., Jakeway, E., Ferriter, M., Adams, C., Yarasavage, N., Thomas, D., Zwaard, K., Li, M., Cui, L., Huang,'
```

