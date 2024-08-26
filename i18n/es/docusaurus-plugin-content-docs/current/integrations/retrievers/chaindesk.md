---
translated: true
---

# Chaindesk

>[Plataforma Chaindesk](https://docs.chaindesk.ai/introduction) trae datos de cualquier lugar (Fuentes de datos: Texto, PDF, Word, PowerPpoint, Excel, Notion, Airtable, Google Sheets, etc..) a Almacenes de datos (contenedor de múltiples Fuentes de datos).
Luego, sus Almacenes de datos se pueden conectar a ChatGPT a través de Plugins o cualquier otro Modelo de Lenguaje Grande (LLM) a través de la `API de Chaindesk`.

Este cuaderno muestra cómo usar el [buscador de Chaindesk](https://www.chaindesk.ai/).

Primero, deberá registrarse en Chaindesk, crear un almacén de datos, agregar algunos datos y obtener la URL del punto final de la API de su almacén de datos. Necesita la [Clave API](https://docs.chaindesk.ai/api-reference/authentication).

## Consulta

Ahora que nuestro índice está configurado, podemos configurar un buscador y comenzar a consultarlo.

```python
from langchain_community.retrievers import ChaindeskRetriever
```

```python
retriever = ChaindeskRetriever(
    datastore_url="https://clg1xg2h80000l708dymr0fxc.chaindesk.ai/query",
    # api_key="CHAINDESK_API_KEY", # optional if datastore is public
    # top_k=10 # optional
)
```

```python
retriever.invoke("What is Daftpage?")
```

```output
[Document(page_content='✨ Made with DaftpageOpen main menuPricingTemplatesLoginSearchHelpGetting StartedFeaturesAffiliate ProgramGetting StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!DaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord', metadata={'source': 'https:/daftpage.com/help/getting-started', 'score': 0.8697265}),
 Document(page_content="✨ Made with DaftpageOpen main menuPricingTemplatesLoginSearchHelpGetting StartedFeaturesAffiliate ProgramHelp CenterWelcome to Daftpage’s help center—the one-stop shop for learning everything about building websites with Daftpage.Daftpage is the simplest way to create websites for all purposes in seconds. Without knowing how to code, and for free!Get StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!Start here✨ Create your first site🧱 Add blocks🚀 PublishGuides🔖 Add a custom domainFeatures🔥 Drops🎨 Drawings👻 Ghost mode💀 Skeleton modeCant find the answer you're looking for?mail us at support@daftpage.comJoin the awesome Daftpage community on: 👾 DiscordDaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord", metadata={'source': 'https:/daftpage.com/help', 'score': 0.86570895}),
 Document(page_content=" is the simplest way to create websites for all purposes in seconds. Without knowing how to code, and for free!Get StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!Start here✨ Create your first site🧱 Add blocks🚀 PublishGuides🔖 Add a custom domainFeatures🔥 Drops🎨 Drawings👻 Ghost mode💀 Skeleton modeCant find the answer you're looking for?mail us at support@daftpage.comJoin the awesome Daftpage community on: 👾 DiscordDaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord", metadata={'source': 'https:/daftpage.com/help', 'score': 0.8645384})]
```
