---
canonical: https://python.langchain.com/v0.1/docs/integrations/text_embedding/oracleai
translated: false
---

# Oracle AI Vector Search: Generate Embeddings

Oracle AI Vector Search is designed for Artificial Intelligence (AI) workloads that allows you to query data based on semantics, rather than keywords. One of the biggest benefit of Oracle AI Vector Search is that semantic search on unstructured data can be combined with relational search on business data in one single system. This is not only powerful but also significantly more effective because you don't need to add a specialized vector database, eliminating the pain of data fragmentation between multiple systems.

The guide demonstrates how to use Embedding Capabilities within Oracle AI Vector Search to generate embeddings for your documents using OracleEmbeddings.

### Prerequisites

Please install Oracle Python Client driver to use Langchain with Oracle AI Vector Search.

```python
# pip install oracledb
```

### Connect to Oracle Database

The following sample code will show how to connect to Oracle Database.

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

For embedding, we have a few provider options that the users can choose from such as database, 3rd party providers like ocigenai, huggingface, openai, etc. If the users choose to use 3rd party provider, they need to create a credential with corresponding authentication information. On the other hand, if the users choose to use 'database' as provider, they need to load an onnx model to Oracle Database for embeddings.

### Load ONNX Model

To generate embeddings, Oracle provides a few provider options for users to choose from. The users can choose 'database' provider or some 3rd party providers like OCIGENAI, HuggingFace, etc.

***Note*** If the users choose database option, they need to load an ONNX model to Oracle Database. The users do not need to load an ONNX model to Oracle Database if they choose to use 3rd party provider to generate embeddings.

One of the core benefits of using an ONNX model is that the users do not need to transfer their data to 3rd party to generate embeddings. And also, since it does not involve any network or REST API calls, it may provide better performance.

Here is the sample code to load an ONNX model to Oracle Database:

```python
from langchain_community.embeddings.oracleai import OracleEmbeddings

# please update with your related information
# make sure that you have onnx file in the system
onnx_dir = "DEMO_DIR"
onnx_file = "tinybert.onnx"
model_name = "demo_model"

try:
    OracleEmbeddings.load_onnx_model(conn, onnx_dir, onnx_file, model_name)
    print("ONNX model loaded.")
except Exception as e:
    print("ONNX model loading failed!")
    sys.exit(1)
```

### Create Credential

On the other hand, if the users choose to use 3rd party provider to generate embeddings, they need to create credential to access 3rd party provider's end points.

***Note:*** The users do not need to create any credential if they choose to use 'database' provider to generate embeddings. Should the users choose to 3rd party provider, they need to create credential for the 3rd party provider they want to use.

Here is a sample example:

```python
try:
    cursor = conn.cursor()
    cursor.execute(
        """
       declare
           jo json_object_t;
       begin
           -- HuggingFace
           dbms_vector_chain.drop_credential(credential_name  => 'HF_CRED');
           jo := json_object_t();
           jo.put('access_token', '<access_token>');
           dbms_vector_chain.create_credential(
               credential_name   =>  'HF_CRED',
               params            => json(jo.to_string));

           -- OCIGENAI
           dbms_vector_chain.drop_credential(credential_name  => 'OCI_CRED');
           jo := json_object_t();
           jo.put('user_ocid','<user_ocid>');
           jo.put('tenancy_ocid','<tenancy_ocid>');
           jo.put('compartment_ocid','<compartment_ocid>');
           jo.put('private_key','<private_key>');
           jo.put('fingerprint','<fingerprint>');
           dbms_vector_chain.create_credential(
               credential_name   => 'OCI_CRED',
               params            => json(jo.to_string));
       end;
       """
    )
    cursor.close()
    print("Credentials created.")
except Exception as ex:
    cursor.close()
    raise
```

### Generate Embeddings

Oracle AI Vector Search provides a number of ways to generate embeddings. The users can load an ONNX embedding model to Oracle Database and use it to generate embeddings or use some 3rd party API's end points to generate embeddings. Please refer to the Oracle AI Vector Search Guide book for complete information about these parameters.

***Note:*** The users may need to set proxy if they want to use some 3rd party embedding generation providers other than 'database' provider (aka using ONNX model).

```python
# proxy to be used when we instantiate summary and embedder object
proxy = "<proxy>"
```

The following sample code will show how to generate embeddings:

```python
from langchain_community.embeddings.oracleai import OracleEmbeddings
from langchain_core.documents import Document

"""
# using ocigenai
embedder_params = {
    "provider": "ocigenai",
    "credential_name": "OCI_CRED",
    "url": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/embedText",
    "model": "cohere.embed-english-light-v3.0",
}

# using huggingface
embedder_params = {
    "provider": "huggingface",
    "credential_name": "HF_CRED",
    "url": "https://api-inference.huggingface.co/pipeline/feature-extraction/",
    "model": "sentence-transformers/all-MiniLM-L6-v2",
    "wait_for_model": "true"
}
"""

# using ONNX model loaded to Oracle Database
embedder_params = {"provider": "database", "model": "demo_model"}

# Remove proxy if not required
embedder = OracleEmbeddings(conn=conn, params=embedder_params, proxy=proxy)
embed = embedder.embed_query("Hello World!")

""" verify """
print(f"Embedding generated by OracleEmbeddings: {embed}")
```

### End to End Demo

Please refer to our complete demo guide [Oracle AI Vector Search End-to-End Demo Guide](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) to build an end to end RAG pipeline with the help of Oracle AI Vector Search.