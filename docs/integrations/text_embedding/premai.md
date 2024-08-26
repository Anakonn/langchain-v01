---
canonical: https://python.langchain.com/v0.1/docs/integrations/text_embedding/premai
translated: false
---

# PremAI

>[PremAI](https://app.premai.io) is an unified platform that let's you build powerful production-ready GenAI powered applications with least effort, so that you can focus more on user experience and overall growth. In this section we are going to dicuss how we can get access to different embedding model using `PremAIEmbeddings`

## Installation and Setup

We start by installing langchain and premai-sdk. You can type the following command to install:

```bash
pip install premai langchain
```

Before proceeding further, please make sure that you have made an account on Prem and already started a project. If not, then here's how you can start for free:

1. Sign in to [PremAI](https://app.premai.io/accounts/login/), if you are coming for the first time and create your API key [here](https://app.premai.io/api_keys/).

2. Go to [app.premai.io](https://app.premai.io) and this will take you to the project's dashboard.

3. Create a project and this will generate a project-id (written as ID). This ID will help you to interact with your deployed application.

Congratulations on creating your first deployed application on Prem 🎉 Now we can use langchain to interact with our application.

```python
# Let's start by doing some imports and define our embedding object

from langchain_community.embeddings import PremAIEmbeddings
```

Once we imported our required modules, let's setup our client. For now let's assume that our `project_id` is 8. But make sure you use your project-id, otherwise it will throw error.

```python
import getpass
import os

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
model = "text-embedding-3-large"
embedder = PremAIEmbeddings(project_id=8, model=model)
```

We have defined our embedding model. We support a lot of embedding models. Here is a table that shows the number of embedding models we support.

| Provider    | Slug                                     | Context Tokens |
|-------------|------------------------------------------|----------------|
| cohere      | embed-english-v3.0                       | N/A            |
| openai      | text-embedding-3-small                   | 8191           |
| openai      | text-embedding-3-large                   | 8191           |
| openai      | text-embedding-ada-002                   | 8191           |
| replicate   | replicate/all-mpnet-base-v2              | N/A            |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A            |
| mistralai   | mistral-embed                            | 4096           |

To change the model, you simply need to copy the `slug` and access your embedding model. Now let's start using our embedding model with a single query followed by multiple queries (which is also called as a document)

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

```output
[-0.02129288576543331, 0.0008162345038726926, -0.004556538071483374, 0.02918623760342598, -0.02547479420900345]
```

Finally let's embed a document

```python
documents = ["This is document1", "This is document2", "This is document3"]

doc_result = embedder.embed_documents(documents)

# Similar to previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```

```output
[-0.0030691148713231087, -0.045334383845329285, -0.0161729846149683, 0.04348714277148247, -0.0036920777056366205]
```