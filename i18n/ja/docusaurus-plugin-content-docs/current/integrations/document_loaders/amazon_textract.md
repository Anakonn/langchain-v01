---
translated: true
---

# Amazon Textract

>[Amazon Textract](https://docs.aws.amazon.com/managedservices/latest/userguide/textract.html)は、スキャンされた文書から自動的にテキスト、手書き、データを抽出するマシンラーニング(ML)サービスです。
>
>単純な光学文字認識(OCR)を超えて、フォームやテーブルからデータを識別、理解、抽出します。現在、多くの企業は、PDFや画像、テーブル、フォームなどのスキャンされた文書からデータを手動で抽出したり、手動設定が必要な単純なOCRソフトウェアを使用しています(フォームが変更されると、しばしば更新する必要があります)。これらの手動で煩雑なプロセスを克服するため、`Textract`はMLを使ってあらゆる種類の文書を読み取り処理し、手動作業なしにテキスト、手書き、テーブルなどのデータを正確に抽出します。

このサンプルでは、LangChainを使ってAmazon Textractを`DocumentLoader`として使用する方法を示します。

`Textract`は`PDF`、`TIFF`、`PNG`、`JPEG`形式をサポートしています。

`Textract`は[文書サイズ、言語、文字](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html)をサポートしています。

```python
%pip install --upgrade --quiet  boto3 langchain-openai tiktoken python-dotenv
```

```python
%pip install --upgrade --quiet  "amazon-textract-caller>=0.2.0"
```

## サンプル1

最初の例では、ローカルファイルを使用しており、内部的にはAmazon Textract sync API [DetectDocumentText](https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html)に送信されます。

ローカルファイルやHTTP://などのURLエンドポイントは、Textractでは1ページ文書に制限されています。
複数ページの文書はS3に保存する必要があります。このサンプルファイルはjpegです。

```python
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader("example_data/alejandro_rosalez_sample-small.jpeg")
documents = loader.load()
```

ファイルからの出力

```python
documents
```

```output
[Document(page_content='Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No ', metadata={'source': 'example_data/alejandro_rosalez_sample-small.jpeg', 'page': 1})]
```

## サンプル2

次のサンプルでは、HTTPSエンドポイントからファイルを読み込みます。
Amazon Textractでは、複数ページの文書はすべてS3に保存する必要があるため、1ページ文書である必要があります。

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

## サンプル3

複数ページの文書を処理するには、文書をS3に保存する必要があります。サンプル文書はus-east-2のバケットに保存されており、Textractはその同じリージョンで呼び出す必要があるため、クライアントのregion_nameを設定し、ローダーに渡してTextractがus-east-2から呼び出されるようにしています。ノートブックをus-east-2で実行したり、AWS_DEFAULT_REGIONを us-east-2に設定したり、別の環境で実行する場合は、そのリージョン名を持つboto3 Textractクライアントを渡すこともできます。

```python
import boto3

textract_client = boto3.client("textract", region_name="us-east-2")

file_path = "s3://amazon-textract-public-content/langchain/layout-parser-paper.pdf"
loader = AmazonTextractPDFLoader(file_path, client=textract_client)
documents = loader.load()
```

ページ数を取得して応答を検証します(完全な応答を出力すると非常に長くなります)。16ページが期待されます。

```python
len(documents)
```

```output
16
```

## サンプル4

AmazonTextractPDFLoaderに`linearization_config`という追加のパラメーターを渡すことで、Textractの実行後にパーサーによってテキスト出力がどのようにlinearizeされるかを決めることができます。

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

## LangChain chain(例えばOpenAI)でのAmazonTextractPDFLoaderの使用

AmazonTextractPDFLoaderは、他のローダーと同じ方法でチェーンで使用できます。
Textractには[クエリ機能](https://docs.aws.amazon.com/textract/latest/dg/API_Query.html)があり、このサンプルのQAチェーンと同様の機能を提供するので、それも確認する価値があります。

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
