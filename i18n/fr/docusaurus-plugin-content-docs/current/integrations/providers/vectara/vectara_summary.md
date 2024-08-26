---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) est la plateforme GenAI de confiance qui fournit une API facile à utiliser pour l'indexation et l'interrogation de documents.

Vectara fournit un service géré de bout en bout pour la Retrieval Augmented Generation ou [RAG](https://vectara.com/grounded-generation/), qui comprend :

1. Un moyen d'extraire le texte des fichiers de documents et de les découper en phrases.

2. Le modèle d'embeddings [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) à la pointe de la technologie. Chaque fragment de texte est encodé dans un embedding vectoriel à l'aide de Boomerang, et stocké dans le magasin de connaissances (vecteur+texte) interne de Vectara.

3. Un service de requête qui encode automatiquement la requête en embedding et récupère les segments de texte les plus pertinents (y compris la prise en charge de la [recherche hybride](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) et de la [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/))).

4. Une option pour créer un [résumé génératif](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview), basé sur les documents récupérés, y compris les citations.

Consultez la [documentation de l'API Vectara](https://docs.vectara.com/docs/) pour plus d'informations sur la façon d'utiliser l'API.

Ce notebook montre comment utiliser les fonctionnalités liées à l'intégration de `Vectara` avec langchain.
Plus précisément, nous démontrerons comment utiliser l'enchaînement avec le [langage d'expression LangChain](/docs/expression_language/) et l'utilisation de la capacité de résumé intégrée de Vectara.

# Configuration

Vous aurez besoin d'un compte Vectara pour utiliser Vectara avec LangChain. Pour commencer, suivez les étapes suivantes :

1. [Inscrivez-vous](https://www.vectara.com/integrations/langchain) à un compte Vectara si vous n'en avez pas déjà un. Une fois votre inscription terminée, vous aurez un ID client Vectara. Vous pouvez trouver votre ID client en cliquant sur votre nom, en haut à droite de la fenêtre de la console Vectara.

2. Dans votre compte, vous pouvez créer un ou plusieurs corpus. Chaque corpus représente une zone qui stocke les données textuelles lors de l'ingestion à partir de documents d'entrée. Pour créer un corpus, utilisez le bouton **"Créer un corpus"**. Vous fournissez ensuite un nom à votre corpus ainsi qu'une description. Vous pouvez éventuellement définir des attributs de filtrage et appliquer quelques options avancées. Si vous cliquez sur votre corpus créé, vous pouvez voir son nom et son ID de corpus en haut.

3. Vous aurez ensuite besoin de créer des clés API pour accéder au corpus. Cliquez sur l'onglet **"Autorisation"** dans la vue du corpus, puis sur le bouton **"Créer une clé API"**. Donnez un nom à votre clé et choisissez si vous voulez une clé avec accès en lecture seule ou en lecture/écriture. Cliquez sur "Créer" et vous avez maintenant une clé API active. Gardez cette clé confidentielle.

Pour utiliser LangChain avec Vectara, vous aurez besoin de ces trois valeurs : ID client, ID de corpus et api_key.
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

2. Ajoutez-les au constructeur du magasin de vecteurs Vectara :

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

```python
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
```

Tout d'abord, nous chargeons le texte du discours sur l'état de l'Union dans Vectara. Notez que nous utilisons l'interface `from_files` qui ne nécessite aucun traitement local ou découpage - Vectara reçoit le contenu du fichier et effectue tout le pré-traitement, le découpage et l'embedding du fichier dans son magasin de connaissances.

```python
vectara = Vectara.from_files(["state_of_the_union.txt"])
```

Nous créons maintenant un récupérateur Vectara et spécifions que :
* Il ne doit renvoyer que les 3 meilleurs documents correspondants
* Pour le résumé, il doit utiliser les 5 meilleurs résultats et répondre en anglais

```python
summary_config = {"is_enabled": True, "max_results": 5, "response_lang": "eng"}
retriever = vectara.as_retriever(
    search_kwargs={"k": 3, "summary_config": summary_config}
)
```

Lors de l'utilisation du résumé avec Vectara, le récupérateur répond avec une liste d'objets `Document` :
1. Les `k` premiers documents sont ceux qui correspondent à la requête (comme nous en avons l'habitude avec un magasin de vecteurs standard)
2. Avec le résumé activé, un objet `Document` supplémentaire est ajouté, qui inclut le texte du résumé. Ce Document a le champ de métadonnées `summary` défini sur True.

Définissons deux fonctions utilitaires pour les séparer :

```python
def get_sources(documents):
    return documents[:-1]


def get_summary(documents):
    return documents[-1].page_content


query_str = "what did Biden say?"
```

Maintenant, nous pouvons essayer une réponse de résumé pour la requête :

```python
(retriever | get_summary).invoke(query_str)
```

```output
'The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.'
```

Et si nous voulions voir les sources récupérées de Vectara qui ont été utilisées dans ce résumé (les citations) :

```python
(retriever | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully.', metadata={'lang': 'eng', 'section': '1', 'offset': '2100', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```

Le "RAG en tant que service" de Vectara fait beaucoup du travail lourd dans la création de chaînes de questions-réponses ou de chatbots. L'intégration avec LangChain offre l'option d'utiliser des capacités supplémentaires telles que le pré-traitement des requêtes comme `SelfQueryRetriever` ou `MultiQueryRetriever`. Examinons un exemple d'utilisation du [MultiQueryRetriever](/docs/modules/data_connection/retrievers/MultiQueryRetriever).

Comme MQR utilise un LLM, nous devons le configurer - ici, nous choisissons `ChatOpenAI` :

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
mqr = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

(mqr | get_summary).invoke(query_str)
```

```output
"President Biden has made several notable quotes and comments. He expressed a commitment to investigate the potential impact of burn pits on soldiers' health, referencing his son's brain cancer [1]. He emphasized the importance of unity among Americans, urging us to see each other as fellow citizens rather than enemies [2]. Biden also highlighted the need for schools to use funds from the American Rescue Plan to hire teachers and address learning loss, while encouraging community involvement in supporting education [3]."
```

```python
(mqr | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='And, if Congress provides the funds we need, we’ll have new stockpiles of tests, masks, and pills ready if needed. I cannot promise a new variant won’t come. But I can promise you we’ll do everything within our power to be ready if it does. Third – we can end the shutdown of schools and businesses. We have the tools we need.', metadata={'lang': 'eng', 'section': '1', 'offset': '24753', 'len': '82', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.', metadata={'summary': True}),
 Document(page_content='Danielle says Heath was a fighter to the very end. He didn’t know how to stop fighting, and neither did she. Through her pain she found purpose to demand we do better. Tonight, Danielle—we are. The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits.', metadata={'lang': 'eng', 'section': '1', 'offset': '35502', 'len': '58', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='Let’s stop seeing each other as enemies, and start seeing each other for who we really are: Fellow Americans. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together. I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.', metadata={'lang': 'eng', 'section': '1', 'offset': '26312', 'len': '89', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The American Rescue Plan gave schools money to hire teachers and help students make up for lost learning. I urge every parent to make sure your school does just that. And we can all play a part—sign up to be a tutor or a mentor. Children were also struggling before the pandemic. Bullying, violence, trauma, and the harms of social media.', metadata={'lang': 'eng', 'section': '1', 'offset': '33227', 'len': '61', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```
