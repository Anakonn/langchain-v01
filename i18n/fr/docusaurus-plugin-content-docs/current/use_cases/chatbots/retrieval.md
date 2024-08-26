---
sidebar_position: 2
translated: true
---

# Récupération

La récupération est une technique courante que les chatbots utilisent pour enrichir leurs réponses avec des données en dehors des données d'entraînement du modèle de chat. Cette section couvrira comment mettre en œuvre la récupération dans le contexte des chatbots, mais il est important de noter que la récupération est un sujet très subtil et approfondi - nous vous encourageons à explorer [d'autres parties de la documentation](/docs/use_cases/question_answering/) qui entrent dans plus de détails !

## Configuration

Vous devrez installer quelques packages et définir votre clé d'API OpenAI en tant que variable d'environnement nommée `OPENAI_API_KEY` :

```python
%pip install --upgrade --quiet langchain langchain-openai langchain-chroma beautifulsoup4

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

Configurons également un modèle de chat que nous utiliserons pour les exemples ci-dessous.

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0.2)
```

## Création d'un récupérateur

Nous utiliserons [la documentation LangSmith](https://docs.smith.langchain.com/overview) comme matériel source et stockerons le contenu dans une banque de vecteurs pour une récupération ultérieure. Notez que cet exemple passera sous silence certains des détails spécifiques concernant l'analyse et le stockage d'une source de données - vous pouvez voir une documentation plus approfondie sur la création de systèmes de récupération [ici](/docs/use_cases/question_answering/).

Utilisons un chargeur de documents pour extraire le texte de la documentation :

```python
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://docs.smith.langchain.com/overview")
data = loader.load()
```

Ensuite, nous le divisons en plus petits morceaux que la fenêtre de contexte du LLM peut gérer et le stockons dans une base de données vectorielle :

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

Puis nous incorporons et stockons ces morceaux dans une base de données vectorielle :

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
```

Et enfin, créons un récupérateur à partir de notre banque de vecteurs initialisée :

```python
# k is the number of chunks to retrieve
retriever = vectorstore.as_retriever(k=4)

docs = retriever.invoke("Can LangSmith help test my LLM applications?")

docs
```

```output
[Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content="does that affect the output?\u200bSo you notice a bad output, and you go into LangSmith to see what's going on. You find the faulty LLM call and are now looking at the exact input. You want to try changing a word or a phrase to see what happens -- what do you do?We constantly ran into this issue. Initially, we copied the prompt to a playground of sorts. But this got annoying, so we built a playground of our own! When examining an LLM call, you can click the Open in Playground button to access this", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

Nous pouvons voir que l'invocation du récupérateur ci-dessus donne des parties de la documentation LangSmith contenant des informations sur les tests que notre chatbot peut utiliser comme contexte pour répondre aux questions. Et maintenant, nous avons un récupérateur qui peut renvoyer des données connexes de la documentation LangSmith !

## Chaînes de documents

Maintenant que nous avons un récupérateur qui peut renvoyer des documents LangChain, créons une chaîne qui peut les utiliser comme contexte pour répondre aux questions. Nous utiliserons une fonction d'assistance `create_stuff_documents_chain` pour "remplir" tous les documents d'entrée dans l'invite. Elle gérera également la mise en forme des documents sous forme de chaînes.

En plus d'un modèle de chat, la fonction attend également une invite qui a une variable `context`, ainsi qu'un espace réservé pour les messages de l'historique du chat nommé `messages`. Nous créerons une invite appropriée et la transmettrons comme indiqué ci-dessous :

```python
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

SYSTEM_TEMPLATE = """
Answer the user's questions based on the below context.
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
"""

question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            SYSTEM_TEMPLATE,
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

document_chain = create_stuff_documents_chain(chat, question_answering_prompt)
```

Nous pouvons invoquer cette `document_chain` seule pour répondre aux questions. Utilisons les documents que nous avons récupérés ci-dessus et la même question, `comment LangSmith peut-il aider avec les tests ?` :

```python
from langchain_core.messages import HumanMessage

document_chain.invoke(
    {
        "context": docs,
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?")
        ],
    }
)
```

```output
'Yes, LangSmith can help test and evaluate your LLM applications. It simplifies the initial setup, and you can use it to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'
```

Bien ! Pour comparaison, nous pouvons l'essayer sans documents de contexte et comparer le résultat :

```python
document_chain.invoke(
    {
        "context": [],
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?")
        ],
    }
)
```

```output
"I don't know about LangSmith's specific capabilities for testing LLM applications. It's best to reach out to LangSmith directly to inquire about their services and how they can assist with testing your LLM applications."
```

Nous pouvons voir que le LLM ne renvoie aucun résultat.

## Chaînes de récupération

Combinons cette chaîne de documents avec le récupérateur. Voici une façon dont cela peut se présenter :

```python
from typing import Dict

from langchain_core.runnables import RunnablePassthrough


def parse_retriever_input(params: Dict):
    return params["messages"][-1].content


retrieval_chain = RunnablePassthrough.assign(
    context=parse_retriever_input | retriever,
).assign(
    answer=document_chain,
)
```

Étant donné une liste de messages d'entrée, nous extrayons le contenu du dernier message de la liste et le transmettons au récupérateur pour récupérer quelques documents. Ensuite, nous transmettons ces documents comme contexte à notre chaîne de documents pour générer une réponse finale.

L'invocation de cette chaîne combine les deux étapes décrites ci-dessus :

```python
retrieval_chain.invoke(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?")
        ],
    }
)
```

```output
{'messages': [HumanMessage(content='Can LangSmith help test my LLM applications?')],
 'context': [Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content="does that affect the output?\u200bSo you notice a bad output, and you go into LangSmith to see what's going on. You find the faulty LLM call and are now looking at the exact input. You want to try changing a word or a phrase to see what happens -- what do you do?We constantly ran into this issue. Initially, we copied the prompt to a playground of sorts. But this got annoying, so we built a playground of our own! When examining an LLM call, you can click the Open in Playground button to access this", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Yes, LangSmith can help test and evaluate your LLM applications. It simplifies the initial setup, and you can use it to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'}
```

Bien !

## Transformation de la requête

Notre chaîne de récupération est capable de répondre à des questions sur LangSmith, mais il y a un problème - les chatbots interagissent avec les utilisateurs de manière conversationnelle et doivent donc gérer les questions de suivi.

La chaîne sous sa forme actuelle aura du mal avec cela. Considérez une question de suivi à notre question originale comme `Dites-m'en plus !`. Si nous invoquons notre récupérateur avec cette requête directement, nous obtenons des documents sans rapport avec les tests d'application LLM :

```python
retriever.invoke("Tell me more!")
```

```output
[Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='playground. Here, you can modify the prompt and re-run it to observe the resulting changes to the output - as many times as needed!Currently, this feature supports only OpenAI and Anthropic models and works for LLM and Chat Model calls. We plan to extend its functionality to more LLM types, chains, agents, and retrievers in the future.What is the exact sequence of events?\u200bIn complicated chains and agents, it can often be hard to understand what is going on under the hood. What calls are being', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='however, there is still no complete substitute for human review to get the utmost quality and reliability from your application.', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

C'est parce que le récupérateur n'a pas de concept intrinsèque d'état et ne tirera que les documents les plus similaires à la requête donnée. Pour résoudre ce problème, nous pouvons transformer la requête en une requête autonome sans aucune référence externe à un LLM.

Voici un exemple :

```python
from langchain_core.messages import AIMessage, HumanMessage

query_transform_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="messages"),
        (
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
        ),
    ]
)

query_transformation_chain = query_transform_prompt | chat

query_transformation_chain.invoke(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?"),
            AIMessage(
                content="Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
            ),
            HumanMessage(content="Tell me more!"),
        ],
    }
)
```

```output
AIMessage(content='"LangSmith LLM application testing and evaluation"')
```

Génial ! Cette requête transformée permettrait de récupérer des documents de contexte liés aux tests d'application LLM.

Ajoutons cela à notre chaîne de récupération. Nous pouvons envelopper notre récupérateur comme suit :

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableBranch

query_transforming_retriever_chain = RunnableBranch(
    (
        lambda x: len(x.get("messages", [])) == 1,
        # If only one message, then we just pass that message's content to retriever
        (lambda x: x["messages"][-1].content) | retriever,
    ),
    # If messages, then we pass inputs to LLM chain to transform the query, then pass to retriever
    query_transform_prompt | chat | StrOutputParser() | retriever,
).with_config(run_name="chat_retriever_chain")
```

Ensuite, nous pouvons utiliser cette chaîne de transformation de requête pour rendre notre chaîne de récupération mieux à même de gérer ces questions de suivi :

```python
SYSTEM_TEMPLATE = """
Answer the user's questions based on the below context.
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
"""

question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            SYSTEM_TEMPLATE,
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

conversational_retrieval_chain = RunnablePassthrough.assign(
    context=query_transforming_retriever_chain,
).assign(
    answer=document_chain,
)
```

Génial ! Invoquons cette nouvelle chaîne avec les mêmes entrées que précédemment :

```python
conversational_retrieval_chain.invoke(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?"),
        ]
    }
)
```

```output
{'messages': [HumanMessage(content='Can LangSmith help test my LLM applications?')],
 'context': [Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content="does that affect the output?\u200bSo you notice a bad output, and you go into LangSmith to see what's going on. You find the faulty LLM call and are now looking at the exact input. You want to try changing a word or a phrase to see what happens -- what do you do?We constantly ran into this issue. Initially, we copied the prompt to a playground of sorts. But this got annoying, so we built a playground of our own! When examining an LLM call, you can click the Open in Playground button to access this", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Yes, LangSmith can help test and evaluate LLM (Language Model) applications. It simplifies the initial setup, and you can use it to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'}
```

```python
conversational_retrieval_chain.invoke(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?"),
            AIMessage(
                content="Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
            ),
            HumanMessage(content="Tell me more!"),
        ],
    }
)
```

```output
{'messages': [HumanMessage(content='Can LangSmith help test my LLM applications?'),
  AIMessage(content='Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'),
  HumanMessage(content='Tell me more!')],
 'context': [Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='LangSmith makes it easy to manually review and annotate runs through annotation queues.These queues allow you to select any runs based on criteria like model type or automatic evaluation scores, and queue them up for human review. As a reviewer, you can then quickly step through the runs, viewing the input, output, and any existing tags before adding your own feedback.We often use this for a couple of reasons:To assess subjective qualities that automatic evaluators struggle with, like', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'LangSmith simplifies the initial setup for building reliable LLM applications, but it acknowledges that there is still work needed to bring the performance of prompts, chains, and agents up to the level where they are reliable enough to be used in production. It also provides the capability to manually review and annotate runs through annotation queues, allowing you to select runs based on criteria like model type or automatic evaluation scores for human review. This feature is particularly useful for assessing subjective qualities that automatic evaluators struggle with.'}
```

Vous pouvez consulter [cette trace LangSmith](https://smith.langchain.com/public/bb329a3b-e92a-4063-ad78-43f720fbb5a2/r) pour voir l'étape interne de transformation de la requête par vous-même.

## Diffusion en continu

Comme cette chaîne est construite avec LCEL, vous pouvez utiliser des méthodes familières comme `.stream()` avec elle :

```python
stream = conversational_retrieval_chain.stream(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?"),
            AIMessage(
                content="Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
            ),
            HumanMessage(content="Tell me more!"),
        ],
    }
)

for chunk in stream:
    print(chunk)
```

```output
{'messages': [HumanMessage(content='Can LangSmith help test my LLM applications?'), AIMessage(content='Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'), HumanMessage(content='Tell me more!')]}
{'context': [Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}), Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}), Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}), Document(page_content='LangSmith makes it easy to manually review and annotate runs through annotation queues.These queues allow you to select any runs based on criteria like model type or automatic evaluation scores, and queue them up for human review. As a reviewer, you can then quickly step through the runs, viewing the input, output, and any existing tags before adding your own feedback.We often use this for a couple of reasons:To assess subjective qualities that automatic evaluators struggle with, like', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]}
{'answer': ''}
{'answer': 'Lang'}
{'answer': 'Smith'}
{'answer': ' simpl'}
{'answer': 'ifies'}
{'answer': ' the'}
{'answer': ' initial'}
{'answer': ' setup'}
{'answer': ' for'}
{'answer': ' building'}
{'answer': ' reliable'}
{'answer': ' L'}
{'answer': 'LM'}
{'answer': ' applications'}
{'answer': '.'}
{'answer': ' It'}
{'answer': ' provides'}
{'answer': ' features'}
{'answer': ' for'}
{'answer': ' manually'}
{'answer': ' reviewing'}
{'answer': ' and'}
{'answer': ' annot'}
{'answer': 'ating'}
{'answer': ' runs'}
{'answer': ' through'}
{'answer': ' annotation'}
{'answer': ' queues'}
{'answer': ','}
{'answer': ' allowing'}
{'answer': ' you'}
{'answer': ' to'}
{'answer': ' select'}
{'answer': ' runs'}
{'answer': ' based'}
{'answer': ' on'}
{'answer': ' criteria'}
{'answer': ' like'}
{'answer': ' model'}
{'answer': ' type'}
{'answer': ' or'}
{'answer': ' automatic'}
{'answer': ' evaluation'}
{'answer': ' scores'}
{'answer': ','}
{'answer': ' and'}
{'answer': ' queue'}
{'answer': ' them'}
{'answer': ' up'}
{'answer': ' for'}
{'answer': ' human'}
{'answer': ' review'}
{'answer': '.'}
{'answer': ' As'}
{'answer': ' a'}
{'answer': ' reviewer'}
{'answer': ','}
{'answer': ' you'}
{'answer': ' can'}
{'answer': ' quickly'}
{'answer': ' step'}
{'answer': ' through'}
{'answer': ' the'}
{'answer': ' runs'}
{'answer': ','}
{'answer': ' view'}
{'answer': ' the'}
{'answer': ' input'}
{'answer': ','}
{'answer': ' output'}
{'answer': ','}
{'answer': ' and'}
{'answer': ' any'}
{'answer': ' existing'}
{'answer': ' tags'}
{'answer': ' before'}
{'answer': ' adding'}
{'answer': ' your'}
{'answer': ' own'}
{'answer': ' feedback'}
{'answer': '.'}
{'answer': ' This'}
{'answer': ' can'}
{'answer': ' be'}
{'answer': ' particularly'}
{'answer': ' useful'}
{'answer': ' for'}
{'answer': ' assessing'}
{'answer': ' subjective'}
{'answer': ' qualities'}
{'answer': ' that'}
{'answer': ' automatic'}
{'answer': ' evalu'}
{'answer': 'ators'}
{'answer': ' struggle'}
{'answer': ' with'}
{'answer': '.'}
{'answer': ''}
```

## Lectures complémentaires

Ce guide ne fait qu'effleurer la surface des techniques de récupération. Pour en savoir plus sur les différentes façons d'ingérer, de préparer et de récupérer les données les plus pertinentes, consultez [cette section](/docs/modules/data_connection/) de la documentation.
