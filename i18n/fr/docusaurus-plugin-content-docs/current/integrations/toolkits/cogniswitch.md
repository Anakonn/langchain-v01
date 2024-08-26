---
translated: true
---

## Outils CogniSwitch

**Utilisez CogniSwitch pour construire des applications prêtes pour la production qui peuvent consommer, organiser et récupérer les connaissances sans faille. En utilisant le framework de votre choix, dans ce cas Langchain, CogniSwitch aide à alléger le stress de la prise de décision lorsqu'il s'agit de choisir les bons formats de stockage et de récupération. Il élimine également les problèmes de fiabilité et les hallucinations lorsqu'il s'agit des réponses générées. Commencez à interagir avec vos connaissances en seulement deux étapes simples.**

Visitez [https://www.cogniswitch.ai/developer pour vous inscrire](https://www.cogniswitch.ai/developer?utm_source=langchain&utm_medium=langchainbuild&utm_id=dev).

**Inscription :**

- Inscrivez-vous avec votre e-mail et vérifiez votre inscription
- Vous recevrez un e-mail avec un jeton de plateforme et un jeton OAuth pour utiliser les services.

**Étape 1 : Instancier la boîte à outils et obtenir les outils :**

- Instancier la boîte à outils cogniswitch avec le jeton cogniswitch, la clé API OpenAI et le jeton OAuth, puis obtenir les outils.

**Étape 2 : Instancier l'agent avec les outils et le LLM :**
- Instancier l'agent avec la liste des outils CogniSwitch et le LLM, dans l'exécuteur d'agent.

**Étape 3 : Outil CogniSwitch Store :**

***Outil de fichier source de connaissances CogniSwitch***
- Utilisez l'agent pour télécharger un fichier en donnant le chemin du fichier. (Les formats actuellement pris en charge sont .pdf, .docx, .doc, .txt, .html)
- Le contenu du fichier sera traité par CogniSwitch et stocké dans votre banque de connaissances.

***Outil d'URL source de connaissances CogniSwitch***
- Utilisez l'agent pour télécharger une URL.
- Le contenu de l'URL sera traité par CogniSwitch et stocké dans votre banque de connaissances.

**Étape 4 : Outil CogniSwitch Status :**
- Utilisez l'agent pour connaître le statut du document téléchargé avec un nom de document.
- Vous pouvez également vérifier l'état du traitement des documents dans la console CogniSwitch.

**Étape 5 : Outil CogniSwitch Answer :**
- Utilisez l'agent pour poser votre question.
- Vous obtiendrez la réponse de vos connaissances en retour.

### Importer les bibliothèques nécessaires

```python
import warnings

warnings.filterwarnings("ignore")

import os

from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain_community.agent_toolkits import CogniswitchToolkit
from langchain_openai import ChatOpenAI
```

### Jeton de plateforme CogniSwitch, jeton OAuth et clé API OpenAI

```python
cs_token = "Your CogniSwitch token"
OAI_token = "Your OpenAI API token"
oauth_token = "Your CogniSwitch authentication token"

os.environ["OPENAI_API_KEY"] = OAI_token
```

### Instancier la boîte à outils CogniSwitch avec les identifiants

```python
cogniswitch_toolkit = CogniswitchToolkit(
    cs_token=cs_token, OAI_token=OAI_token, apiKey=oauth_token
)
```

### Obtenir la liste des outils CogniSwitch

```python
tool_lst = cogniswitch_toolkit.get_tools()
```

### Instancier le LLM

```python
llm = ChatOpenAI(
    temperature=0,
    openai_api_key=OAI_token,
    max_tokens=1500,
    model_name="gpt-3.5-turbo-0613",
)
```

### Créer un exécuteur d'agent

```python
agent_executor = create_conversational_retrieval_agent(llm, tool_lst, verbose=False)
```

### Invoquer l'agent pour télécharger une URL

```python
response = agent_executor.invoke("upload this url https://cogniswitch.ai/developer")

print(response["output"])
```

```output
The URL https://cogniswitch.ai/developer has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```

### Invoquer l'agent pour télécharger un fichier

```python
response = agent_executor.invoke("upload this file example_file.txt")

print(response["output"])
```

```output
The file example_file.txt has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```

### Invoquer l'agent pour obtenir le statut d'un document

```python
response = agent_executor.invoke("Tell me the status of this document example_file.txt")

print(response["output"])
```

```output
The status of the document example_file.txt is as follows:

- Created On: 2024-01-22T19:07:42.000+00:00
- Modified On: 2024-01-22T19:07:42.000+00:00
- Document Entry ID: 153
- Status: 0 (Processing)
- Original File Name: example_file.txt
- Saved File Name: 1705950460069example_file29393011.txt

The document is currently being processed.
```

### Invoquer l'agent avec une requête et obtenir la réponse

```python
response = agent_executor.invoke("How can cogniswitch help develop GenAI applications?")

print(response["output"])
```

```output
CogniSwitch can help develop GenAI applications in several ways:

1. Knowledge Extraction: CogniSwitch can extract knowledge from various sources such as documents, websites, and databases. It can analyze and store data from these sources, making it easier to access and utilize the information for GenAI applications.

2. Natural Language Processing: CogniSwitch has advanced natural language processing capabilities. It can understand and interpret human language, allowing GenAI applications to interact with users in a more conversational and intuitive manner.

3. Sentiment Analysis: CogniSwitch can analyze the sentiment of text data, such as customer reviews or social media posts. This can be useful in developing GenAI applications that can understand and respond to the emotions and opinions of users.

4. Knowledge Base Integration: CogniSwitch can integrate with existing knowledge bases or create new ones. This allows GenAI applications to access a vast amount of information and provide accurate and relevant responses to user queries.

5. Document Analysis: CogniSwitch can analyze documents and extract key information such as entities, relationships, and concepts. This can be valuable in developing GenAI applications that can understand and process large amounts of textual data.

Overall, CogniSwitch provides a range of AI-powered capabilities that can enhance the development of GenAI applications by enabling knowledge extraction, natural language processing, sentiment analysis, knowledge base integration, and document analysis.
```
