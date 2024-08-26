---
translated: true
---

# SageMakerEndpoint

[Amazon SageMaker](https://aws.amazon.com/sagemaker/) एक ऐसा सिस्टम है जो किसी भी उपयोग मामले के लिए पूरी तरह से प्रबंधित बुनियादी ढांचा, उपकरण और कार्यप्रवाह के साथ मशीन लर्निंग (ML) मॉडल का निर्माण, प्रशिक्षण और तैनाती कर सकता है।

यह नोटबुक `SageMaker endpoint` पर होस्ट किए गए एक LLM का उपयोग करने के बारे में बताता है।

```python
!pip3 install langchain boto3
```

## सेटअप

आपको `SagemakerEndpoint` कॉल के लिए निम्नलिखित आवश्यक पैरामीटर सेट करने होंगे:
- `endpoint_name`: तैनात किए गए Sagemaker मॉडल का नाम।
    यह AWS क्षेत्र के भीतर अद्वितीय होना चाहिए।
- `credentials_profile_name`: ~/.aws/credentials या ~/.aws/config फ़ाइलों में प्रोफ़ाइल का नाम, जिसमें या तो एक्सेस कुंजी या भूमिका जानकारी निर्दिष्ट की गई है।
    यदि निर्दिष्ट नहीं किया गया है, तो डिफ़ॉल्ट क्रेडेंशियल प्रोफ़ाइल या, यदि EC2 इंस्टांस पर हों, तो IMDS से क्रेडेंशियल का उपयोग किया जाएगा।
    देखें: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html

## उदाहरण

```python
from langchain_community.docstore.document import Document
```

```python
example_doc_1 = """
Peter and Elizabeth took a taxi to attend the night party in the city. While in the party, Elizabeth collapsed and was rushed to the hospital.
Since she was diagnosed with a brain injury, the doctor told Peter to stay besides her until she gets well.
Therefore, Peter stayed with her at the hospital for 3 days without leaving.
"""

docs = [
    Document(
        page_content=example_doc_1,
    )
]
```

## बाहरी boto3 सत्र के साथ प्रारंभ करने का उदाहरण

### क्रॉस अकाउंट सценारियो के लिए

```python
import json
from typing import Dict

import boto3
from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate

query = """How long was Elizabeth hospitalized?
"""

prompt_template = """Use the following pieces of context to answer the question at the end.

{context}

Question: {question}
Answer:"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)

roleARN = "arn:aws:iam::123456789:role/cross-account-role"
sts_client = boto3.client("sts")
response = sts_client.assume_role(
    RoleArn=roleARN, RoleSessionName="CrossAccountSession"
)

client = boto3.client(
    "sagemaker-runtime",
    region_name="us-west-2",
    aws_access_key_id=response["Credentials"]["AccessKeyId"],
    aws_secret_access_key=response["Credentials"]["SecretAccessKey"],
    aws_session_token=response["Credentials"]["SessionToken"],
)


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: Dict) -> bytes:
        input_str = json.dumps({"inputs": prompt, "parameters": model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json[0]["generated_text"]


content_handler = ContentHandler()

chain = load_qa_chain(
    llm=SagemakerEndpoint(
        endpoint_name="endpoint-name",
        client=client,
        model_kwargs={"temperature": 1e-10},
        content_handler=content_handler,
    ),
    prompt=PROMPT,
)

chain({"input_documents": docs, "question": query}, return_only_outputs=True)
```

```python
import json
from typing import Dict

from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate

query = """How long was Elizabeth hospitalized?
"""

prompt_template = """Use the following pieces of context to answer the question at the end.

{context}

Question: {question}
Answer:"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: Dict) -> bytes:
        input_str = json.dumps({"inputs": prompt, "parameters": model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json[0]["generated_text"]


content_handler = ContentHandler()

chain = load_qa_chain(
    llm=SagemakerEndpoint(
        endpoint_name="endpoint-name",
        credentials_profile_name="credentials-profile-name",
        region_name="us-west-2",
        model_kwargs={"temperature": 1e-10},
        content_handler=content_handler,
    ),
    prompt=PROMPT,
)

chain({"input_documents": docs, "question": query}, return_only_outputs=True)
```
