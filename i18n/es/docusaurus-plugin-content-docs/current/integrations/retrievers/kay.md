---
translated: true
---

# Kay.ai

>[Kai Data API](https://www.kay.ai/) construido para RAG 🕵️ Estamos recopilando los conjuntos de datos más grandes del mundo como incrustaciones de alta calidad para que tus agentes de IA puedan recuperar el contexto sobre la marcha. Últimos modelos, recuperación rápida y cero infraestructura.

Este cuaderno le muestra cómo recuperar los conjuntos de datos compatibles con [Kay](https://kay.ai/). Actualmente puede buscar `SEC Filings` y `Press Releases de empresas estadounidenses`. Visite [kay.ai](https://kay.ai) para conocer los últimos lanzamientos de datos. Si tiene alguna pregunta, únase a nuestro [discord](https://discord.gg/hAnE4e5T6M) o [tuitee a nosotros](https://twitter.com/vishalrohra_)

## Instalación

Primero, instale el paquete [`kay`](https://pypi.org/project/kay/).

```python
!pip install kay
```

También necesitará una clave API: puede obtener una de forma gratuita en [https://kay.ai](https://kay.ai/). Una vez que tenga una clave API, debe establecerla como una variable de entorno `KAY_API_KEY`.

`KayAiRetriever` tiene un método de fábrica estático `.create()` que toma los siguientes argumentos:

* `dataset_id: string` requerido -- Un ID de conjunto de datos de Kay. Este es un conjunto de datos sobre una entidad en particular, como empresas, personas o lugares. Por ejemplo, intente `"company"`
* `data_type: List[string]` opcional -- Esta es una categoría dentro de un conjunto de datos en función de su origen o formato, como 'SEC Filings', 'Press Releases' o 'Reports' dentro del conjunto de datos "company". Por ejemplo, intente ["10-K", "10-Q", "PressRelease"] en el conjunto de datos "company". Si se deja vacío, Kay recuperará el contexto más relevante en todos los tipos.
* `num_contexts: int` opcional, predeterminado a 6 -- El número de fragmentos de documentos a recuperar en cada llamada a `get_relevant_documents()`

## Ejemplos

### Uso básico del recuperador

```python
# Setup API key
from getpass import getpass

KAY_API_KEY = getpass()
```

```output
 ········
```

```python
import os

from langchain_community.retrievers import KayAiRetriever

os.environ["KAY_API_KEY"] = KAY_API_KEY
retriever = KayAiRetriever.create(
    dataset_id="company", data_types=["10-K", "10-Q", "PressRelease"], num_contexts=3
)
docs = retriever.invoke(
    "What were the biggest strategy changes and partnerships made by Roku in 2023??"
)
```

```python
docs
```

```output
[Document(page_content='Company Name: ROKU INC\nCompany Industry: CABLE & OTHER PAY TELEVISION SERVICES\nArticle Title: Roku Is One of Fast Company\'s Most Innovative Companies for 2023\nText: The company launched several new devices, including the Roku Voice Remote Pro; upgraded its most premium player, the Roku Ultra; and expanded its products with a new line of smart home devices such as video doorbells, lights, and plugs integrated into the Roku ecosystem. Recently, the company announced it will launch Roku-branded TVs this spring to offer more choice and innovation to both consumers and Roku TV partners. Throughout 2022, Roku also updated its operating system (OS), the only OS purpose-built for TV, with more personalization features and enhancements across search, audio, and content discovery, launching The Buzz, Sports, and What to Watch, which provides tailored movie and TV recommendations on the Home Screen Menu. The company also released a new feature for streamers, Photo Streams, that allows customers to display and share photo albums through Roku streaming devices. Additionally, Roku unveiled Shoppable Ads, a new ad innovation that makes shopping on TV streaming as easy as it is on social media. Viewers simply press "OK" with their Roku remote on a shoppable ad and proceed to check out with their shipping and payment details pre-populated from Roku Pay, its proprietary payments platform. Walmart was the exclusive retailer for the launch, a first-of-its-kind partnership.', metadata={'chunk_type': 'text', 'chunk_years_mentioned': [2022, 2023], 'company_name': 'ROKU INC', 'company_sic_code_description': 'CABLE & OTHER PAY TELEVISION SERVICES', 'data_source': 'PressRelease', 'data_source_link': 'https://newsroom.roku.com/press-releases', 'data_source_publish_date': '2023-03-02T09:30:00-04:00', 'data_source_uid': '963d4a81-f58e-3093-af68-987fb1758c15', 'title': "ROKU INC |  Roku Is One of Fast Company's Most Innovative Companies for 2023"}),
 Document(page_content='Company Name: ROKU INC\nCompany Industry: CABLE & OTHER PAY TELEVISION SERVICES\nArticle Title: Roku Is One of Fast Company\'s Most Innovative Companies for 2023\nText: Finally, Roku grew its content offering with thousands of apps and watching options for users, including content on The Roku Channel, a top five app by reach and engagement on the Roku platform in the U.S. in 2022. In November, Roku released its first feature film, "WEIRD: The Weird Al\' Yankovic Story," a biopic starring Daniel Radcliffe. Throughout the year, The Roku Channel added FAST channels from NBCUniversal and the National Hockey League, as well as an exclusive AMC channel featuring its signature drama "Mad Men." This year, the company announced a deal with Warner Bros. Discovery, launching new channels that will include "Westworld" and "The Bachelor," in addition to 2,000 hours of on-demand content. Read more about Roku\'s journey here . Fast Company\'s Most Innovative Companies issue (March/April 2023) is available online here , as well as in-app via iTunes and on newsstands beginning March 14. About Roku, Inc.\nRoku pioneered streaming to the TV. We connect users to the streaming content they love, enable content publishers to build and monetize large audiences, and provide advertisers with unique capabilities to engage consumers. Roku streaming players and TV-related audio devices are available in the U.S. and in select countries through direct retail sales and licensing arrangements with service operators. Roku TV models are available in the U.S. and select countries through licensing arrangements with TV OEM brands.', metadata={'chunk_type': 'text', 'chunk_years_mentioned': [2022, 2023], 'company_name': 'ROKU INC', 'company_sic_code_description': 'CABLE & OTHER PAY TELEVISION SERVICES', 'data_source': 'PressRelease', 'data_source_link': 'https://newsroom.roku.com/press-releases', 'data_source_publish_date': '2023-03-02T09:30:00-04:00', 'data_source_uid': '963d4a81-f58e-3093-af68-987fb1758c15', 'title': "ROKU INC |  Roku Is One of Fast Company's Most Innovative Companies for 2023"}),
 Document(page_content='Company Name: ROKU INC\nCompany Industry: CABLE & OTHER PAY TELEVISION SERVICES\nArticle Title: Roku\'s New NFL Zone Gives Fans Easy Access to NFL Games Right On Time for 2023 Season\nText: In partnership with the NFL, the new NFL Zone offers viewers an easy way to find where to watch NFL live games Today, Roku (NASDAQ: ROKU ) and the National Football League (NFL) announced the recently launched NFL Zone within the Roku Sports experience to kick off the 2023 NFL season. This strategic partnership between Roku and the NFL marks the first official league-branded zone within Roku\'s Sports experience. Available now, the NFL Zone offers football fans a centralized location to find live and upcoming games, so they can spend less time figuring out where to watch the game and more time rooting for their favorite teams. Users can also tune in for weekly game previews, League highlights, and additional NFL content, all within the zone. This press release features multimedia. View the full release here: In partnership with the NFL, Roku\'s new NFL Zone offers viewers an easy way to find where to watch NFL live games (Photo: Business Wire) "Last year we introduced the Sports experience for our highly engaged sports audience, making it simpler for Roku users to watch sports programming," said Gidon Katz, President, Consumer Experience, at Roku. "As we start the biggest sports season of the year, providing easy access to NFL games and content to our millions of users is a top priority for us. We look forward to fans immersing themselves within the NFL Zone and making it their destination to find NFL games.', metadata={'chunk_type': 'text', 'chunk_years_mentioned': [2023], 'company_name': 'ROKU INC', 'company_sic_code_description': 'CABLE & OTHER PAY TELEVISION SERVICES', 'data_source': 'PressRelease', 'data_source_link': 'https://newsroom.roku.com/press-releases', 'data_source_publish_date': '2023-09-12T09:00:00-04:00', 'data_source_uid': '963d4a81-f58e-3093-af68-987fb1758c15', 'title': "ROKU INC |  Roku's New NFL Zone Gives Fans Easy Access to NFL Games Right On Time for 2023 Season"})]
```

### Uso en una cadena

```python
OPENAI_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
from langchain.chains import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo")
qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever)
```

```python
questions = [
    "What were the biggest strategy changes and partnerships made by Roku in 2023?"
    # "Where is Wex making the most money in 2023?",
]
chat_history = []

for question in questions:
    result = qa({"question": question, "chat_history": chat_history})
    chat_history.append((question, result["answer"]))
    print(f"-> **Question**: {question} \n")
    print(f"**Answer**: {result['answer']} \n")
```

```output
-> **Question**: What were the biggest strategy changes and partnerships made by Roku in 2023?

**Answer**: In 2023, Roku made a strategic partnership with FreeWheel to bring Roku's leading ad tech to FreeWheel customers. This partnership aimed to drive greater interoperability and automation in the advertising-based video on demand (AVOD) space. Key highlights of this collaboration include streamlined integration of Roku's demand application programming interface (dAPI) with FreeWheel's TV platform, allowing for better inventory quality control and improved publisher yield and revenue. Additionally, publishers can now use Roku platform signals to enable advertisers to target audiences and measure campaign performance without relying on cookies. This partnership also involves the use of data clean room technology to enable the activation of additional data sets for better measurement and monetization for publishers and agencies. These partnerships and strategies aim to support Roku's growth in the AVOD market.
```
