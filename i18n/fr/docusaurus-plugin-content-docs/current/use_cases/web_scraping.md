---
sidebar_class_name: hidden
title: Web scraping
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/web_scraping.ipynb)

## Cas d'utilisation

[Recherche web](https://blog.langchain.dev/automating-web-research/) est l'une des applications phares des LLM :

* Les utilisateurs l'ont [mise en évidence](https://twitter.com/GregKamradt/status/1679913813297225729?s=20) comme l'un de ses principaux outils d'IA souhaités.
* Les dépôts OSS comme [gpt-researcher](https://github.com/assafelovic/gpt-researcher) gagnent en popularité.

![Description de l'image](../../../../../static/img/web_scraping.png)

## Aperçu

La collecte de contenu à partir du web comporte plusieurs composants :

* `Recherche` : Requête vers une URL (par exemple, en utilisant `GoogleSearchAPIWrapper`).
* `Chargement` : URL vers HTML (par exemple, en utilisant `AsyncHtmlLoader`, `AsyncChromiumLoader`, etc.).
* `Transformation` : HTML vers texte formaté (par exemple, en utilisant `HTML2Text` ou `Beautiful Soup`).

## Démarrage rapide

```python
pip install -q langchain-openai langchain playwright beautifulsoup4
playwright install

# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

Extraction de contenu HTML à l'aide d'une instance sans interface graphique de Chromium.

* La nature asynchrone du processus d'extraction est gérée à l'aide de la bibliothèque asyncio de Python.
* L'interaction réelle avec les pages web est gérée par Playwright.

```python
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

# Load HTML
loader = AsyncChromiumLoader(["https://www.wsj.com"])
html = loader.load()
```

Extraire le contenu textuel des balises telles que `<p>, <li>, <div> et <a>` à partir du contenu HTML :

* `<p>` : La balise de paragraphe. Elle définit un paragraphe en HTML et est utilisée pour regrouper des phrases et/ou des expressions connexes.
* `<li>` : La balise d'élément de liste. Elle est utilisée dans les listes ordonnées (`<ol>`) et non ordonnées (`<ul>`) pour définir les éléments individuels de la liste.
* `<div>` : La balise de division. C'est un élément de niveau bloc utilisé pour regrouper d'autres éléments en ligne ou de niveau bloc.
* `<a>` : La balise d'ancrage. Elle est utilisée pour définir des hyperliens.
* `<span>` : un conteneur en ligne utilisé pour marquer une partie d'un texte ou d'un document.

Pour de nombreux sites d'actualités (par exemple, WSJ, CNN), les titres et les résumés se trouvent tous dans les balises `<span>`.

```python
# Transform
bs_transformer = BeautifulSoupTransformer()
docs_transformed = bs_transformer.transform_documents(html, tags_to_extract=["span"])
```

```python
# Result
docs_transformed[0].page_content[0:500]
```

```output
'English EditionEnglish中文 (Chinese)日本語 (Japanese) More Other Products from WSJBuy Side from WSJWSJ ShopWSJ Wine Other Products from WSJ Search Quotes and Companies Search Quotes and Companies 0.15% 0.03% 0.12% -0.42% 4.102% -0.69% -0.25% -0.15% -1.82% 0.24% 0.19% -1.10% About Evan His Family Reflects His Reporting How You Can Help Write a Message Life in Detention Latest News Get Email Updates Four Americans Released From Iranian Prison The Americans will remain under house arrest until they are '
```

Ces `Documents` sont maintenant prêts pour une utilisation en aval dans diverses applications LLM, comme discuté ci-dessous.

## Chargeur

### AsyncHtmlLoader

Le [AsyncHtmlLoader](/docs/integrations/document_loaders/async_html) utilise la bibliothèque `aiohttp` pour effectuer des requêtes HTTP asynchrones, convenant à l'extraction plus simple et légère.

### AsyncChromiumLoader

Le [AsyncChromiumLoader](/docs/integrations/document_loaders/async_chromium) utilise Playwright pour lancer une instance de Chromium, qui peut gérer le rendu JavaScript et les interactions web plus complexes.

Chromium est l'un des navigateurs pris en charge par Playwright, une bibliothèque utilisée pour contrôler l'automatisation des navigateurs.

Le mode sans interface graphique signifie que le navigateur fonctionne sans interface utilisateur graphique, ce qui est couramment utilisé pour l'extraction web.

```python
from langchain_community.document_loaders import AsyncHtmlLoader

urls = ["https://www.espn.com", "https://lilianweng.github.io/posts/2023-06-23-agent/"]
loader = AsyncHtmlLoader(urls)
docs = loader.load()
```

## Transformateur

### HTML2Text

[HTML2Text](/docs/integrations/document_transformers/html2text) fournit une conversion simple du contenu HTML en texte brut (avec une mise en forme de type markdown) sans manipulation spécifique des balises.

Il convient le mieux aux scénarios où l'objectif est d'extraire un texte lisible par l'homme sans avoir besoin de manipuler des éléments HTML spécifiques.

### Beautiful Soup

Beautiful Soup offre un contrôle plus fin du contenu HTML, permettant l'extraction, la suppression et le nettoyage spécifiques des balises.

Il convient aux cas où vous voulez extraire des informations spécifiques et nettoyer le contenu HTML selon vos besoins.

```python
from langchain_community.document_loaders import AsyncHtmlLoader

urls = ["https://www.espn.com", "https://lilianweng.github.io/posts/2023-06-23-agent/"]
loader = AsyncHtmlLoader(urls)
docs = loader.load()
```

```output
Fetching pages: 100%|#############################################################################################################| 2/2 [00:00<00:00,  7.01it/s]
```

```python
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
docs_transformed[0].page_content[0:500]
```

```output
"Skip to main content  Skip to navigation\n\n<\n\n>\n\nMenu\n\n## ESPN\n\n  * Search\n\n  *   * scores\n\n  * NFL\n  * MLB\n  * NBA\n  * NHL\n  * Soccer\n  * NCAAF\n  * …\n\n    * Women's World Cup\n    * LLWS\n    * NCAAM\n    * NCAAW\n    * Sports Betting\n    * Boxing\n    * CFL\n    * NCAA\n    * Cricket\n    * F1\n    * Golf\n    * Horse\n    * MMA\n    * NASCAR\n    * NBA G League\n    * Olympic Sports\n    * PLL\n    * Racing\n    * RN BB\n    * RN FB\n    * Rugby\n    * Tennis\n    * WNBA\n    * WWE\n    * X Games\n    * XFL\n\n  * More"
```

## Extraction avec extraction

### LLM avec appel de fonction

L'extraction web est difficile pour de nombreuses raisons.

L'une d'elles est la nature changeante des mises en page et du contenu des sites web modernes, ce qui nécessite de modifier les scripts d'extraction pour s'adapter aux changements.

En utilisant la fonction (par exemple, OpenAI) avec une chaîne d'extraction, nous évitons d'avoir à modifier constamment votre code lorsque les sites web changent.

Nous utilisons `gpt-3.5-turbo-0613` pour garantir l'accès à la fonctionnalité des fonctions OpenAI (bien que cela puisse être accessible à tous au moment de la rédaction).

Nous gardons également la `température` à `0` pour réduire le caractère aléatoire du LLM.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")
```

### Définir un schéma

Ensuite, vous définissez un schéma pour spécifier le type de données que vous voulez extraire.

Ici, les noms de clés sont importants car ils indiquent au LLM le type d'informations qu'ils veulent.

Soyez donc aussi détaillé que possible.

Dans cet exemple, nous voulons extraire uniquement le nom et le résumé de l'article de presse du site Web du Wall Street Journal.

```python
from langchain.chains import create_extraction_chain

schema = {
    "properties": {
        "news_article_title": {"type": "string"},
        "news_article_summary": {"type": "string"},
    },
    "required": ["news_article_title", "news_article_summary"],
}


def extract(content: str, schema: dict):
    return create_extraction_chain(schema=schema, llm=llm).run(content)
```

### Exécuter le gratteur web avec BeautifulSoup

Comme indiqué ci-dessus, nous utiliserons `BeautifulSoupTransformer`.

```python
import pprint

from langchain_text_splitters import RecursiveCharacterTextSplitter


def scrape_with_playwright(urls, schema):
    loader = AsyncChromiumLoader(urls)
    docs = loader.load()
    bs_transformer = BeautifulSoupTransformer()
    docs_transformed = bs_transformer.transform_documents(
        docs, tags_to_extract=["span"]
    )
    print("Extracting content with LLM")

    # Grab the first 1000 tokens of the site
    splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=1000, chunk_overlap=0
    )
    splits = splitter.split_documents(docs_transformed)

    # Process the first split
    extracted_content = extract(schema=schema, content=splits[0].page_content)
    pprint.pprint(extracted_content)
    return extracted_content


urls = ["https://www.wsj.com"]
extracted_content = scrape_with_playwright(urls, schema=schema)
```

```output
Extracting content with LLM
[{'news_article_summary': 'The Americans will remain under house arrest until '
                          'they are allowed to return to the U.S. in coming '
                          'weeks, following a monthslong diplomatic push by '
                          'the Biden administration.',
  'news_article_title': 'Four Americans Released From Iranian Prison'},
 {'news_article_summary': 'Price pressures continued cooling last month, with '
                          'the CPI rising a mild 0.2% from June, likely '
                          'deterring the Federal Reserve from raising interest '
                          'rates at its September meeting.',
  'news_article_title': 'Cooler July Inflation Opens Door to Fed Pause on '
                        'Rates'},
 {'news_article_summary': 'The company has decided to eliminate 27 of its 30 '
                          'clothing labels, such as Lark & Ro and Goodthreads, '
                          'as it works to fend off antitrust scrutiny and cut '
                          'costs.',
  'news_article_title': 'Amazon Cuts Dozens of House Brands'},
 {'news_article_summary': 'President Biden’s order comes on top of a slowing '
                          'Chinese economy, Covid lockdowns and rising '
                          'tensions between the two powers.',
  'news_article_title': 'U.S. Investment Ban on China Poised to Deepen Divide'},
 {'news_article_summary': 'The proposed trial date in the '
                          'election-interference case comes on the same day as '
                          'the former president’s not guilty plea on '
                          'additional Mar-a-Lago charges.',
  'news_article_title': 'Trump Should Be Tried in January, Prosecutors Tell '
                        'Judge'},
 {'news_article_summary': 'The CEO who started in June says the platform has '
                          '“an entirely different road map” for the future.',
  'news_article_title': 'Yaccarino Says X Is Watching Threads but Has Its Own '
                        'Vision'},
 {'news_article_summary': 'Students foot the bill for flagship state '
                          'universities that pour money into new buildings and '
                          'programs with little pushback.',
  'news_article_title': 'Colleges Spend Like There’s No Tomorrow. ‘These '
                        'Places Are Just Devouring Money.’'},
 {'news_article_summary': 'Wildfires fanned by hurricane winds have torn '
                          'through parts of the Hawaiian island, devastating '
                          'the popular tourist town of Lahaina.',
  'news_article_title': 'Maui Wildfires Leave at Least 36 Dead'},
 {'news_article_summary': 'After its large armored push stalled, Kyiv has '
                          'fallen back on the kind of tactics that brought it '
                          'success earlier in the war.',
  'news_article_title': 'Ukraine Uses Small-Unit Tactics to Retake Captured '
                        'Territory'},
 {'news_article_summary': 'President Guillermo Lasso says the Aug. 20 election '
                          'will proceed, as the Andean country grapples with '
                          'rising drug gang violence.',
  'news_article_title': 'Ecuador Declares State of Emergency After '
                        'Presidential Hopeful Killed'},
 {'news_article_summary': 'This year’s hurricane season, which typically runs '
                          'from June to the end of November, has been '
                          'difficult to predict, climate scientists said.',
  'news_article_title': 'Atlantic Hurricane Season Prediction Increased to '
                        '‘Above Normal,’ NOAA Says'},
 {'news_article_summary': 'The NFL is raising the price of its NFL+ streaming '
                          'packages as it adds the NFL Network and RedZone.',
  'news_article_title': 'NFL to Raise Price of NFL+ Streaming Packages as It '
                        'Adds NFL Network, RedZone'},
 {'news_article_summary': 'Russia is planning a moon mission as part of the '
                          'new space race.',
  'news_article_title': 'Russia’s Moon Mission and the New Space Race'},
 {'news_article_summary': 'Tapestry’s $8.5 billion acquisition of Capri would '
                          'create a conglomerate with more than $12 billion in '
                          'annual sales, but it would still lack the '
                          'high-wattage labels and diversity that have fueled '
                          'LVMH’s success.',
  'news_article_title': "Why the Coach and Kors Marriage Doesn't Scare LVMH"},
 {'news_article_summary': 'The Supreme Court has blocked Purdue Pharma’s $6 '
                          'billion Sackler opioid settlement.',
  'news_article_title': 'Supreme Court Blocks Purdue Pharma’s $6 Billion '
                        'Sackler Opioid Settlement'},
 {'news_article_summary': 'The Social Security COLA is expected to rise in '
                          '2024, but not by a lot.',
  'news_article_title': 'Social Security COLA Expected to Rise in 2024, but '
                        'Not by a Lot'}]
```

Nous pouvons comparer les titres extraits à la page :

![Description de l'image](../../../../../static/img/wsj_page.png)

En examinant la [trace LangSmith](https://smith.langchain.com/public/c3070198-5b13-419b-87bf-3821cdf34fa6/r), nous pouvons voir ce qui se passe sous le capot :

* Il suit ce qui est expliqué dans l'[extraction](docs/use_cases/extraction).
* Nous appelons la fonction `information_extraction` sur le texte d'entrée.
* Il tentera de remplir le schéma fourni à partir du contenu de l'URL.

## Recherche automatisée

En rapport avec le grattage, nous pouvons vouloir répondre à des questions spécifiques en utilisant le contenu recherché.

Nous pouvons automatiser le processus de [recherche web](https://blog.langchain.dev/automating-web-research/) en utilisant un récupérateur, comme le `WebResearchRetriever`.

![Description de l'image](../../../../../static/img/web_research.png)

Copiez les exigences [d'ici](https://github.com/langchain-ai/web-explorer/blob/main/requirements.txt) :

`pip install -r requirements.txt`

Définissez `GOOGLE_CSE_ID` et `GOOGLE_API_KEY`.

```python
from langchain.retrievers.web_research import WebResearchRetriever
from langchain_chroma import Chroma
from langchain_community.utilities import GoogleSearchAPIWrapper
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
# Vectorstore
vectorstore = Chroma(
    embedding_function=OpenAIEmbeddings(), persist_directory="./chroma_db_oai"
)

# LLM
llm = ChatOpenAI(temperature=0)

# Search
search = GoogleSearchAPIWrapper()
```

Initialisez le récupérateur avec les outils ci-dessus pour :

* Utiliser un LLM pour générer plusieurs requêtes de recherche pertinentes (un appel LLM)
* Exécuter une recherche pour chaque requête
* Choisir les K meilleurs liens par requête (plusieurs appels de recherche en parallèle)
* Charger les informations de tous les liens choisis (gratter les pages en parallèle)
* Indexer ces documents dans un vectorstore
* Trouver les documents les plus pertinents pour chaque requête de recherche d'origine originale

```python
# Initialize
web_research_retriever = WebResearchRetriever.from_llm(
    vectorstore=vectorstore, llm=llm, search=search
)
```

```python
# Run
import logging

logging.basicConfig()
logging.getLogger("langchain.retrievers.web_research").setLevel(logging.INFO)
from langchain.chains import RetrievalQAWithSourcesChain

user_input = "How do LLM Powered Autonomous Agents work?"
qa_chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm, retriever=web_research_retriever
)
result = qa_chain({"question": user_input})
result
```

```output
INFO:langchain.retrievers.web_research:Generating questions for Google Search ...
INFO:langchain.retrievers.web_research:Questions for Google Search (raw): {'question': 'How do LLM Powered Autonomous Agents work?', 'text': LineList(lines=['1. What is the functioning principle of LLM Powered Autonomous Agents?\n', '2. How do LLM Powered Autonomous Agents operate?\n'])}
INFO:langchain.retrievers.web_research:Questions for Google Search: ['1. What is the functioning principle of LLM Powered Autonomous Agents?\n', '2. How do LLM Powered Autonomous Agents operate?\n']
INFO:langchain.retrievers.web_research:Searching for relevant urls ...
INFO:langchain.retrievers.web_research:Searching for relevant urls ...
INFO:langchain.retrievers.web_research:Search results: [{'title': 'LLM Powered Autonomous Agents | Hacker News', 'link': 'https://news.ycombinator.com/item?id=36488871', 'snippet': 'Jun 26, 2023 ... Exactly. A temperature of 0 means you always pick the highest probability token (i.e. the "max" function), while a temperature of 1 means you\xa0...'}]
INFO:langchain.retrievers.web_research:Searching for relevant urls ...
INFO:langchain.retrievers.web_research:Search results: [{'title': "LLM Powered Autonomous Agents | Lil'Log", 'link': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'snippet': 'Jun 23, 2023 ... Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1." , "What are the subgoals for achieving XYZ?" , (2) by\xa0...'}]
INFO:langchain.retrievers.web_research:New URLs to load: []
INFO:langchain.retrievers.web_research:Grabbing most relevant splits from urls...
```

```output
{'question': 'How do LLM Powered Autonomous Agents work?',
 'answer': "LLM-powered autonomous agents work by using LLM as the agent's brain, complemented by several key components such as planning, memory, and tool use. In terms of planning, the agent breaks down large tasks into smaller subgoals and can reflect and refine its actions based on past experiences. Memory is divided into short-term memory, which is used for in-context learning, and long-term memory, which allows the agent to retain and recall information over extended periods. Tool use involves the agent calling external APIs for additional information. These agents have been used in various applications, including scientific discovery and generative agents simulation.",
 'sources': ''}
```

### Aller plus loin

* Voici une [application](https://github.com/langchain-ai/web-explorer/tree/main) qui enveloppe ce récupérateur avec une interface utilisateur légère.

## Répondre aux questions sur un site Web

Pour répondre aux questions sur un site Web spécifique, vous pouvez utiliser l'acteur [Website Content Crawler](https://apify.com/apify/website-content-crawler) d'Apify, qui peut explorer en profondeur des sites Web tels que la documentation, les bases de connaissances, les centres d'aide ou les blogs, et extraire le contenu textuel des pages Web.

Dans l'exemple ci-dessous, nous allons explorer en profondeur la documentation Python des modèles Chat LLM de LangChain et répondre à une question à ce sujet.

Installez d'abord les exigences
`pip install apify-client langchain-openai langchain`

Ensuite, définissez `OPENAI_API_KEY` et `APIFY_API_TOKEN` dans vos variables d'environnement.

Le code complet suit :

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.docstore.document import Document
from langchain_community.utilities import ApifyWrapper

apify = ApifyWrapper()
# Call the Actor to obtain text from the crawled webpages
loader = apify.call_actor(
    actor_id="apify/website-content-crawler",
    run_input={"startUrls": [{"url": "/docs/integrations/chat/"}]},
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)

# Create a vector store based on the crawled data
index = VectorstoreIndexCreator().from_loaders([loader])

# Query the vector store
query = "Are any OpenAI chat models integrated in LangChain?"
result = index.query(query)
print(result)
```

```output
 Yes, LangChain offers integration with OpenAI chat models. You can use the ChatOpenAI class to interact with OpenAI models.
```
