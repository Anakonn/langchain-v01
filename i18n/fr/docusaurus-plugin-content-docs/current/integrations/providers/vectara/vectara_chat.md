---
translated: true
---

# Discuter sur des documents avec Vectara

# Configuration

Vous aurez besoin d'un compte Vectara pour utiliser Vectara avec LangChain. Pour commencer, suivez ces étapes :
1. [Inscrivez-vous](https://www.vectara.com/integrations/langchain) à un compte Vectara si vous n'en avez pas déjà un. Une fois votre inscription terminée, vous aurez un identifiant client Vectara. Vous pouvez trouver votre identifiant client en cliquant sur votre nom, en haut à droite de la fenêtre de la console Vectara.
2. Dans votre compte, vous pouvez créer un ou plusieurs corpus. Chaque corpus représente une zone qui stocke les données textuelles lors de l'ingestion à partir de documents d'entrée. Pour créer un corpus, utilisez le bouton **"Créer un corpus"**. Vous fournissez ensuite un nom à votre corpus ainsi qu'une description. Vous pouvez éventuellement définir des attributs de filtrage et appliquer quelques options avancées. Si vous cliquez sur votre corpus créé, vous pouvez voir son nom et son identifiant de corpus en haut.
3. Vous aurez ensuite besoin de créer des clés API pour accéder au corpus. Cliquez sur l'onglet **"Autorisation"** dans la vue du corpus, puis sur le bouton **"Créer une clé API"**. Donnez un nom à votre clé et choisissez si vous voulez une clé avec accès en lecture seule ou en lecture/écriture. Cliquez sur "Créer" et vous avez maintenant une clé API active. Gardez cette clé confidentielle.

Pour utiliser LangChain avec Vectara, vous aurez besoin de ces trois valeurs : identifiant client, identifiant de corpus et clé API.
Vous pouvez les fournir à LangChain de deux manières :

1. Incluez dans votre environnement ces trois variables : `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` et `VECTARA_API_KEY`.

> Par exemple, vous pouvez définir ces variables à l'aide de os.environ et getpass comme suit :

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Ajoutez-les au constructeur du magasin vectoriel Vectara :

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

```python
import os

from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import Vectara
from langchain_openai import OpenAI
```

Chargez les documents. Vous pouvez remplacer cela par un chargeur pour le type de données que vous souhaitez

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
```

Puisque nous utilisons Vectara, il n'est pas nécessaire de découper les documents, car cela est fait automatiquement dans le backend de la plateforme Vectara. Nous utilisons simplement `from_document()` pour télécharger le texte chargé à partir du fichier et l'ingérer directement dans Vectara :

```python
vectara = Vectara.from_documents(documents, embedding=None)
```

Nous pouvons maintenant créer un objet de mémoire, nécessaire pour suivre les entrées/sorties et tenir une conversation.

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
```

Nous initialisons maintenant la `ConversationalRetrievalChain` :

```python
openai_api_key = os.environ["OPENAI_API_KEY"]
llm = OpenAI(openai_api_key=openai_api_key, temperature=0)
retriever = vectara.as_retriever()
d = retriever.invoke("What did the president say about Ketanji Brown Jackson", k=2)
print(d)
```

```output
[Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '29486', 'len': '97'}), Document(page_content='Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '1083', 'len': '117'}), Document(page_content='All told, we created 369,000 new manufacturing jobs in America just last year. Powered by people I’ve met like JoJo Burgess, from generations of union steelworkers from Pittsburgh, who’s here with us tonight. As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.” It’s time. \n\nBut with all the bright spots in our economy, record job growth and higher wages, too many families are struggling to keep up with the bills. Inflation is robbing them of the gains they might otherwise feel.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '14257', 'len': '77'}), Document(page_content='This is personal to me and Jill, to Kamala, and to so many of you. Cancer is the #2 cause of death in America–second only to heart disease. Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. Our goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases. More support for patients and families.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '36196', 'len': '122'}), Document(page_content='Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '664', 'len': '68'}), Document(page_content='I understand. \n\nI remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. That’s why one of the first things I did as President was fight to pass the American Rescue Plan. Because people were hurting. We needed to act, and we did.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '8042', 'len': '97'}), Document(page_content='He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '2100', 'len': '42'}), Document(page_content='He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people. From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. Groups of citizens blocking tanks with their bodies.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '788', 'len': '28'}), Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '2053', 'len': '46'}), Document(page_content='A unity agenda for the nation. We can do this. \n\nMy fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy. In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things. We have fought for freedom, expanded liberty, defeated totalitarianism and terror. And built the strongest, freest, and most prosperous nation the world has ever known.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '36968', 'len': '131'})]
```

```python
bot = ConversationalRetrievalChain.from_llm(
    llm, retriever, memory=memory, verbose=False
)
```

Et nous pouvons avoir une conversation à plusieurs tours avec notre nouveau bot :

```python
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```

```python
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query})
```

```python
result["answer"]
```

```output
' Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.'
```

## Transmettre l'historique de la conversation

Dans l'exemple ci-dessus, nous avons utilisé un objet Memory pour suivre l'historique de la conversation. Nous pouvons également le transmettre explicitement. Pour ce faire, nous devons initialiser une chaîne sans aucun objet de mémoire.

```python
bot = ConversationalRetrievalChain.from_llm(
    OpenAI(temperature=0), vectara.as_retriever()
)
```

Voici un exemple de poser une question sans historique de conversation

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```

Voici un exemple de poser une question avec un certain historique de conversation

```python
chat_history = [(query, result["answer"])]
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
' Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.'
```

## Renvoyer les documents sources

Vous pouvez également facilement renvoyer les documents sources à partir de la ConversationalRetrievalChain. Cela est utile lorsque vous voulez inspecter quels documents ont été renvoyés.

```python
bot = ConversationalRetrievalChain.from_llm(
    llm, vectara.as_retriever(), return_source_documents=True
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["source_documents"][0]
```

```output
Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '29486', 'len': '97'})
```

## ConversationalRetrievalChain avec `map_reduce`

LangChain prend en charge différents types de moyens de combiner les chaînes de documents avec la chaîne ConversationalRetrievalChain.

```python
from langchain.chains import LLMChain
from langchain.chains.conversational_retrieval.prompts import CONDENSE_QUESTION_PROMPT
from langchain.chains.question_answering import load_qa_chain
```

```python
question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_chain(llm, chain_type="map_reduce")

chain = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    question_generator=question_generator,
    combine_docs_chain=doc_chain,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = chain({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson, who is one of the nation's top legal minds and a former top litigator in private practice."
```

## ConversationalRetrievalChain avec la réponse aux questions avec sources

Vous pouvez également utiliser cette chaîne avec la chaîne de réponse aux questions avec sources.

```python
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
```

```python
question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_with_sources_chain(llm, chain_type="map_reduce")

chain = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    question_generator=question_generator,
    combine_docs_chain=doc_chain,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = chain({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice.\nSOURCES: langchain"
```

## ConversationalRetrievalChain avec diffusion en continu vers `stdout`

La sortie de la chaîne sera diffusée en continu vers `stdout` token par token dans cet exemple.

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains.conversational_retrieval.prompts import (
    CONDENSE_QUESTION_PROMPT,
    QA_PROMPT,
)
from langchain.chains.llm import LLMChain
from langchain.chains.question_answering import load_qa_chain

# Construct a ConversationalRetrievalChain with a streaming llm for combine docs
# and a separate, non-streaming llm for question generation
llm = OpenAI(temperature=0, openai_api_key=openai_api_key)
streaming_llm = OpenAI(
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
    temperature=0,
    openai_api_key=openai_api_key,
)

question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_chain(streaming_llm, chain_type="stuff", prompt=QA_PROMPT)

bot = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    combine_docs_chain=doc_chain,
    question_generator=question_generator,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```output
 The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence.
```

```python
chat_history = [(query, result["answer"])]
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```output
 Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.
```

## Fonction get_chat_history

Vous pouvez également spécifier une fonction `get_chat_history`, qui peut être utilisée pour formater la chaîne chat_history.

```python
def get_chat_history(inputs) -> str:
    res = []
    for human, ai in inputs:
        res.append(f"Human:{human}\nAI:{ai}")
    return "\n".join(res)


bot = ConversationalRetrievalChain.from_llm(
    llm, vectara.as_retriever(), get_chat_history=get_chat_history
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```
