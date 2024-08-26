---
translated: true
---

# Amazon Textract

>[Amazon Textract](https://docs.aws.amazon.com/managedservices/latest/userguide/textract.html) एक मशीन लर्निंग (ML) सेवा है जो स्कैन किए गए दस्तावेजों से स्वचालित रूप से पाठ, हस्ताक्षर और डेटा निकालती है।

>यह सरल ऑप्टिकल करैक्टर रिकग्निशन (OCR) से आगे जाकर फॉर्म और तालिकाओं से डेटा की पहचान, समझ और निकालने में मदद करता है। आज, कई कंपनियां मैनुअल रूप से PDF, छवियों, तालिकाओं और फॉर्म जैसे स्कैन किए गए दस्तावेजों से डेटा निकालती हैं, या सरल OCR सॉफ़्टवेयर का उपयोग करती हैं जिसे मैनुअल रूप से कॉन्फ़िगर करना होता है (जिसे अक्सर फॉर्म में बदलाव होने पर अपडेट करना होता है)। इन मैनुअल और महंगी प्रक्रियाओं को पार करने के लिए, `Textract` ML का उपयोग करके किसी भी प्रकार के दस्तावेज़ को पढ़ता और प्रोसेस करता है, और पाठ, हस्ताक्षर, तालिकाएं और अन्य डेटा को सटीक रूप से मैनुअल प्रयास के बिना निकालता है।

यह नमूना `Amazon Textract` का LangChain के साथ एक DocumentLoader के रूप में उपयोग करने का प्रदर्शन है।

`Textract` `PDF`, `TIFF`, `PNG` और `JPEG` प्रारूप का समर्थन करता है।

`Textract` इन [दस्तावेज़ आकार, भाषाओं और वर्णों](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html) का समर्थन करता है।

```python
%pip install --upgrade --quiet  boto3 langchain-openai tiktoken python-dotenv
```

```python
%pip install --upgrade --quiet  "amazon-textract-caller>=0.2.0"
```

## नमूना 1

पहला उदाहरण एक स्थानीय फ़ाइल का उपयोग करता है, जिसे आंतरिक रूप से Amazon Textract sync API [DetectDocumentText](https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html) को भेजा जाएगा।

स्थानीय फ़ाइलों या HTTP:// जैसे URL अंतिम बिंदु Textract के लिए एक पृष्ठ वाले दस्तावेज़ तक सीमित हैं।
बहु-पृष्ठ वाले दस्तावेज़ को S3 पर रहना चाहिए। यह नमूना फ़ाइल एक jpeg है।

```python
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader("example_data/alejandro_rosalez_sample-small.jpeg")
documents = loader.load()
```

फ़ाइल से आउटपुट

```python
documents
```

```output
[Document(page_content='Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No ', metadata={'source': 'example_data/alejandro_rosalez_sample-small.jpeg', 'page': 1})]
```

## नमूना 2

अगला नमूना एक HTTPS अंतिम बिंदु से फ़ाइल लोड करता है।
यह एक पृष्ठ होना चाहिए, क्योंकि Amazon Textract को सभी बहु-पृष्ठ वाले दस्तावेज़ों को S3 पर संग्रहित होना चाहिए।

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

## नमूना 3

बहु-पृष्ठ वाले दस्तावेज़ को प्रोसेस करने के लिए दस्तावेज़ को S3 पर होना चाहिए। नमूना दस्तावेज़ us-east-2 में एक बकेट में रहता है और Textract को सफल होने के लिए उसी क्षेत्र में कॉल किया जाना चाहिए, इसलिए हम क्लाइंट पर region_name सेट करते हैं और लोडर में उसे पास करते हैं ताकि Textract us-east-2 से कॉल किया जाए। आप अपने नोटबुक को us-east-2 में चलाकर या AWS_DEFAULT_REGION को us-east-2 पर सेट करके या अन्य वातावरण में चलाते समय, नीचे की कोशिका में दिए गए जैसे एक boto3 Textract क्लाइंट को उस क्षेत्र नाम के साथ पास कर सकते हैं।

```python
import boto3

textract_client = boto3.client("textract", region_name="us-east-2")

file_path = "s3://amazon-textract-public-content/langchain/layout-parser-paper.pdf"
loader = AmazonTextractPDFLoader(file_path, client=textract_client)
documents = loader.load()
```

अब पृष्ठों की संख्या प्राप्त करके प्रतिक्रिया की पुष्टि करते हैं (पूरी प्रतिक्रिया को प्रिंट करना काफी लंबा होगा...). हमें 16 पृष्ठ की उम्मीद है।

```python
len(documents)
```

```output
16
```

## नमूना 4

आप AmazonTextractPDFLoader में एक अतिरिक्त पैरामीटर `linearization_config` पास करने का विकल्प रखते हैं, जो Textract चलने के बाद पार्सर द्वारा पाठ आउटपुट को किस प्रकार से रेखीकृत किया जाएगा, को निर्धारित करेगा।

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

## LangChain श्रृंखला में AmazonTextractPDFLoader का उपयोग करना (उदा. OpenAI)

AmazonTextractPDFLoader को अन्य लोडर्स के समान ही श्रृंखला में उपयोग किया जा सकता है।
Textract के पास खुद एक [क्वेरी सुविधा](https://docs.aws.amazon.com/textract/latest/dg/API_Query.html) है, जो इस नमूने में QA श्रृंखला के समान कार्यक्षमता प्रदान करती है, जिसे भी देखने योग्य है।

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
