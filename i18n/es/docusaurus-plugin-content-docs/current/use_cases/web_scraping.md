---
sidebar_class_name: hidden
title: Raspado web
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/web_scraping.ipynb)

## Caso de uso

[Investigación web](https://blog.langchain.dev/automating-web-research/) es una de las aplicaciones clave de LLM:

* Los usuarios lo han [destacado](https://twitter.com/GregKamradt/status/1679913813297225729?s=20) como una de sus principales herramientas de IA deseadas.
* Los repositorios de código abierto como [gpt-researcher](https://github.com/assafelovic/gpt-researcher) están ganando popularidad.

![Descripción de la imagen](../../../../../static/img/web_scraping.png)

## Resumen

La recopilación de contenido de la web tiene varios componentes:

* `Búsqueda`: Consulta a la URL (p. ej., usando `GoogleSearchAPIWrapper`).
* `Carga`: URL a HTML (p. ej., usando `AsyncHtmlLoader`, `AsyncChromiumLoader`, etc.).
* `Transformación`: HTML a texto con formato (p. ej., usando `HTML2Text` o `Beautiful Soup`).

## Inicio rápido

```python
pip install -q langchain-openai langchain playwright beautifulsoup4
playwright install

# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

Raspado de contenido HTML usando una instancia sin cabeza de Chromium.

* La naturaleza asincrónica del proceso de raspado se maneja usando la biblioteca asyncio de Python.
* La interacción real con las páginas web se maneja mediante Playwright.

```python
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

# Load HTML
loader = AsyncChromiumLoader(["https://www.wsj.com"])
html = loader.load()
```

Raspar etiquetas de contenido de texto como `<p>, <li>, <div> y <a>` del contenido HTML:

* `<p>`: La etiqueta de párrafo. Define un párrafo en HTML y se usa para agrupar oraciones y/o frases relacionadas.

* `<li>`: La etiqueta de elemento de lista. Se usa dentro de listas ordenadas (`<ol>`) y desordenadas (`<ul>`) para definir elementos individuales dentro de la lista.

* `<div>`: La etiqueta de división. Es un elemento de nivel de bloque utilizado para agrupar otros elementos en línea o de nivel de bloque.

* `<a>`: La etiqueta de anclaje. Se usa para definir hipervínculos.

* `<span>`: Un contenedor en línea utilizado para marcar una parte de un texto o una parte de un documento.

Para muchos sitios web de noticias (p. ej., WSJ, CNN), los titulares y resúmenes están en etiquetas `<span>`.

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

Estos `Documentos` ahora se están preparando para su uso posterior en varias aplicaciones de LLM, como se discute a continuación.

## Cargador

### AsyncHtmlLoader

El [AsyncHtmlLoader](/docs/integrations/document_loaders/async_html) usa la biblioteca `aiohttp` para hacer solicitudes HTTP asincrónicas, adecuadas para un raspado más simple y ligero.

### AsyncChromiumLoader

El [AsyncChromiumLoader](/docs/integrations/document_loaders/async_chromium) usa Playwright para iniciar una instancia de Chromium, que puede manejar el renderizado de JavaScript y las interacciones web más complejas.

Chromium es uno de los navegadores compatibles con Playwright, una biblioteca utilizada para controlar la automatización del navegador.

El modo sin cabeza significa que el navegador se está ejecutando sin una interfaz gráfica de usuario, lo que se usa comúnmente para el raspado web.

```python
from langchain_community.document_loaders import AsyncHtmlLoader

urls = ["https://www.espn.com", "https://lilianweng.github.io/posts/2023-06-23-agent/"]
loader = AsyncHtmlLoader(urls)
docs = loader.load()
```

## Transformador

### HTML2Text

[HTML2Text](/docs/integrations/document_transformers/html2text) proporciona una conversión sencilla de contenido HTML a texto sin formato (con formato similar a Markdown) sin ninguna manipulación específica de etiquetas.

Es más adecuado para escenarios donde el objetivo es extraer texto legible por humanos sin necesidad de manipular elementos HTML específicos.

### Beautiful Soup

Beautiful Soup ofrece un control más detallado sobre el contenido HTML, lo que permite la extracción, eliminación y limpieza de etiquetas específicas.

Es adecuado para los casos en los que desea extraer información específica y limpiar el contenido HTML según sus necesidades.

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

## Raspado con extracción

### LLM con llamada a función

El raspado web es un desafío por varias razones.

Una de ellas es la naturaleza cambiante de los diseños y contenidos de los sitios web modernos, lo que requiere modificar los scripts de raspado para adaptarse a los cambios.

Usando Function (p. ej., OpenAI) con una cadena de extracción, evitamos tener que cambiar constantemente su código cuando cambian los sitios web.

Estamos usando `gpt-3.5-turbo-0613` para garantizar el acceso a la función de Funciones de OpenAI (aunque esto podría estar disponible para todos en el momento de la redacción).

También mantenemos `temperature` en `0` para mantener la aleatoriedad del LLM baja.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")
```

### Definir un esquema

A continuación, define un esquema para especificar qué tipo de datos quieres extraer.

Aquí, los nombres clave son importantes, ya que le indican al LLM qué tipo de información quieren.

Así que sé lo más detallado posible.

En este ejemplo, queremos raspar solo el nombre y el resumen del artículo de noticias del sitio web del Wall Street Journal.

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

### Ejecutar el raspador web con BeautifulSoup

Como se muestra arriba, usaremos `BeautifulSoupTransformer`.

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

Podemos comparar los titulares raspados con la página:

![Descripción de la imagen](../../../../../static/img/wsj_page.png)

Mirando el [rastro de LangSmith](https://smith.langchain.com/public/c3070198-5b13-419b-87bf-3821cdf34fa6/r), podemos ver lo que está sucediendo debajo del capó:

* Está siguiendo lo que se explica en la [extracción](docs/use_cases/extraction).
* Llamamos a la función `information_extraction` en el texto de entrada.
* Intentará llenar el esquema proporcionado a partir del contenido de la URL.

## Automatización de la investigación

Relacionado con el raspado, es posible que queramos responder a preguntas específicas utilizando el contenido buscado.

Podemos automatizar el proceso de [investigación web](https://blog.langchain.dev/automating-web-research/) utilizando un recuperador, como el `WebResearchRetriever`.

![Descripción de la imagen](../../../../../static/img/web_research.png)

Copiar los requisitos [de aquí](https://github.com/langchain-ai/web-explorer/blob/main/requirements.txt):

`pip install -r requirements.txt`

Establecer `GOOGLE_CSE_ID` y `GOOGLE_API_KEY`.

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

Inicializar el recuperador con las herramientas anteriores para:

* Utilizar un LLM para generar múltiples consultas de búsqueda relevantes (una llamada LLM)
* Ejecutar una búsqueda para cada consulta
* Elegir los enlaces superiores K por consulta (múltiples llamadas de búsqueda en paralelo)
* Cargar la información de todos los enlaces elegidos (raspar páginas en paralelo)
* Indexar esos documentos en un almacén vectorial
* Encontrar los documentos más relevantes para cada consulta de búsqueda original generada

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

### Profundizando

* Aquí hay una [aplicación](https://github.com/langchain-ai/web-explorer/tree/main) que envuelve este recuperador con una interfaz de usuario ligera.

## Respuesta a preguntas sobre un sitio web

Para responder preguntas sobre un sitio web específico, puede utilizar el Actor [Website Content Crawler](https://apify.com/apify/website-content-crawler) de Apify, que puede rastrear profundamente sitios web como documentación, bases de conocimiento, centros de ayuda o blogs,
y extraer el contenido de texto de las páginas web.

En el ejemplo a continuación, profundizaremos en la documentación de Python de los modelos de Chat LLM de LangChain y responderemos a una pregunta sobre ella.

Primero, instala los requisitos
`pip install apify-client langchain-openai langchain`

Luego, establece `OPENAI_API_KEY` y `APIFY_API_TOKEN` en tus variables de entorno.

El código completo es el siguiente:

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
