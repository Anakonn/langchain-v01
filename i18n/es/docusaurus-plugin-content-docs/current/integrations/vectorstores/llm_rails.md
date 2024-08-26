---
translated: true
---

# LLMRails

>[LLMRails](https://www.llmrails.com/) es una plataforma de API para construir aplicaciones GenAI. Proporciona una API fácil de usar para la indexación y consulta de documentos que es administrada por LLMRails y está optimizada para el rendimiento y la precisión.
Consulta la [documentación de la API de LLMRails](https://docs.llmrails.com/) para obtener más información sobre cómo usar la API.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la integración de `LLMRails` con langchain.
Tenga en cuenta que a diferencia de muchas otras integraciones en esta categoría, LLMRails proporciona un servicio administrado de extremo a extremo para la generación con recuperación aumentada, que incluye:
1. Una forma de extraer texto de archivos de documentos y dividirlos en oraciones.
2. Su propio modelo de incrustaciones y almacén de vectores: cada segmento de texto se codifica en un vector de incrustaciones y se almacena en el almacén de vectores interno de LLMRails.
3. Un servicio de consulta que codifica automáticamente la consulta en incrustaciones y recupera los segmentos de texto más relevantes (incluido el soporte para [Búsqueda híbrida](https://docs.llmrails.com/datastores/search))).

Todos estos se admiten en esta integración de LangChain.

# Configuración

Necesitará una cuenta de LLMRails para usar LLMRails con LangChain. Para comenzar, siga estos pasos:
1. [Regístrate](https://console.llmrails.com/signup) para obtener una cuenta de LLMRails si aún no tienes una.
2. A continuación, deberás crear claves API para acceder a la API. Haz clic en la pestaña **"Claves API"** en la vista del corpus y luego en el botón **"Crear clave API"**. Dale un nombre a tu clave. Haz clic en "Crear clave" y ahora tienes una clave API activa. Mantén esta clave confidencial.

Para usar LangChain con LLMRails, necesitarás tener este valor: api_key.
Puedes proporcionarlos a LangChain de dos formas:

1. Incluye en tu entorno estas dos variables: `LLM_RAILS_API_KEY`, `LLM_RAILS_DATASTORE_ID`.

> Por ejemplo, puedes establecer estas variables usando os.environ y getpass de la siguiente manera:

```python
import os
import getpass

os.environ["LLM_RAILS_API_KEY"] = getpass.getpass("LLMRails API Key:")
os.environ["LLM_RAILS_DATASTORE_ID"] = getpass.getpass("LLMRails Datastore Id:")
```

1. Proporciónelos como argumentos al crear el objeto de almacén de vectores LLMRails:

```python
vectorstore = LLMRails(
    api_key=llm_rails_api_key,
    datastore_id=datastore_id
)
```

## Agregar texto

Para agregar texto a tu almacén de datos, primero debes ir a la página [Almacenes de datos](https://console.llmrails.com/datastores) y crear uno. Haz clic en el botón Crear almacén de datos y elige un nombre y un modelo de incrustaciones para tu almacén de datos. Luego obtén el ID de tu almacén de datos de la configuración del nuevo almacén de datos.

```python
%pip install tika
```

```output
Collecting tika
  Downloading tika-2.6.0.tar.gz (27 kB)
  Preparing metadata (setup.py) ... [?25ldone
[?25hRequirement already satisfied: setuptools in /Users/omaraly/anaconda3/lib/python3.11/site-packages (from tika) (68.2.2)
Requirement already satisfied: requests in /Users/omaraly/anaconda3/lib/python3.11/site-packages (from tika) (2.31.0)
Requirement already satisfied: charset-normalizer<4,>=2 in /Users/omaraly/anaconda3/lib/python3.11/site-packages (from requests->tika) (2.1.1)
Requirement already satisfied: idna<4,>=2.5 in /Users/omaraly/anaconda3/lib/python3.11/site-packages (from requests->tika) (3.4)
Requirement already satisfied: urllib3<3,>=1.21.1 in /Users/omaraly/anaconda3/lib/python3.11/site-packages (from requests->tika) (1.26.16)
Requirement already satisfied: certifi>=2017.4.17 in /Users/omaraly/anaconda3/lib/python3.11/site-packages (from requests->tika) (2022.12.7)
Building wheels for collected packages: tika
  Building wheel for tika (setup.py) ... [?25ldone
[?25h  Created wheel for tika: filename=tika-2.6.0-py3-none-any.whl size=32621 sha256=b3f03c9dbd7f347d712c49027704d48f1a368f31560be9b4ee131f79a52e176f
  Stored in directory: /Users/omaraly/Library/Caches/pip/wheels/27/ba/2f/37420d1191bdae5e855d69b8e913673045bfd395cbd78ad697
Successfully built tika
Installing collected packages: tika
Successfully installed tika-2.6.0

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.3.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

```python
import os

from langchain_community.vectorstores import LLMRails

os.environ["LLM_RAILS_DATASTORE_ID"] = "Your datastore id "
os.environ["LLM_RAILS_API_KEY"] = "Your API Key"

llm_rails = LLMRails.from_texts(["Your text here"])
```

## Búsqueda de similitud

El escenario más sencillo para usar LLMRails es realizar una búsqueda de similitud.

```python
query = "What do you plan to do about national security?"
found_docs = llm_rails.similarity_search(query, k=5)
```

```python
print(found_docs[0].page_content)
```

```output
6  N A T I O N A L S E C U R I T Y S T R A T E G Y Page 7 

This National Security Strategy lays out our plan to achieve a better future of a free, open, secure, and prosperous world.

Our strategy is rooted in our national interests: to protect the security of the American people; to expand economic prosperity and opportunity; and to realize and defend the democratic values at the heart of the American way of life.

We can do none of this alone and we do not have to.

Most nations around the world define their interests in ways that are compatible with ours.

We will build the strongest and broadest possible coalition of nations that seek to cooperate with each other, while competing with those powers that offer a darker vision and thwarting their efforts to threaten our interests.

Our Enduring Role The need for a strong and purposeful American role in the world has never been greater.

The world is becoming more divided and unstable.

Global increases in inflation since the COVID-19 pandemic began have made life more difficult for many.

The basic laws and principles governing relations among nations, including the United Nations Charter and the protection it affords all states from being invaded by their neighbors or having their borders redrawn by force, are under attack.

The risk of conflict between major powers is increasing.

Democracies and autocracies are engaged in a contest to show which system of governance can best deliver for their people and the world.

Competition to develop and deploy foundational technologies that will transform our security and economy is intensifying.

Global cooperation on shared interests has frayed, even as the need for that cooperation takes on existential importance.

The scale of these changes grows with each passing year, as do the risks of inaction.

Although the international environment has become more contested, the United States remains the world’s leading power.
```

## Búsqueda de similitud con puntuación

A veces, es posible que queramos realizar la búsqueda y también obtener una puntuación de relevancia para saber qué tan bueno es un resultado en particular.

```python
query = "What is your approach to national defense"
found_docs = llm_rails.similarity_search_with_score(
    query,
    k=5,
)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
But we will do so as the last resort and only when the objectives and mission are clear and achievable, consistent with our values and laws, alongside non-military tools, and the mission is undertaken with the informed consent of the American people.

Our approach to national defense is described in detail in the 2022 National Defense Strategy.

Our starting premise is that a powerful U.S. military helps advance and safeguard vital U.S. national interests by backstopping diplomacy, confronting aggression, deterring conflict, projecting strength, and protecting the American people and their economic interests.

Amid intensifying competition, the military’s role is to maintain and gain warfighting advantages while limiting those of our competitors.

The military will act urgently to sustain and strengthen deterrence, with the PRC as its pacing challenge.

We will make disciplined choices regarding our national defense and focus our attention on the military’s primary responsibilities: to defend the homeland, and deter attacks and aggression against the United States, our allies and partners, while being prepared to fight and win the Nation’s wars should diplomacy and deterrence fail.

To do so, we will combine our strengths to achieve maximum effect in deterring acts of aggression—an approach we refer to as integrated deterrence (see text box on page 22).

We will operate our military using a campaigning mindset—sequencing logically linked military activities to advance strategy-aligned priorities.

And, we will build a resilient force and defense ecosystem to ensure we can perform these functions for decades to come.

We ended America’s longest war in Afghanistan, and with it an era of major military operations to remake other societies, even as we have maintained the capacity to address terrorist threats to the American people as they emerge.

20  NATIONAL SECURITY STRATEGY Page 21 

A combat-credible military is the foundation of deterrence and America’s ability to prevail in conflict.

Score: 0.5040982687179959
```

## LLMRails como un Recuperador

LLMRails, al igual que todos los otros almacenes de vectores de LangChain, se usa con más frecuencia como un Recuperador de LangChain:

```python
retriever = llm_rails.as_retriever()
retriever
```

```output
LLMRailsRetriever(vectorstore=<langchain_community.vectorstores.llm_rails.LLMRails object at 0x1235b0e50>)
```

```python
query = "What is your approach to national defense"
retriever.invoke(query)
```

```output
[Document(page_content='But we will do so as the last resort and only when the objectives and mission are clear and achievable, consistent with our values and laws, alongside non-military tools, and the mission is undertaken with the informed consent of the American people.\n\nOur approach to national defense is described in detail in the 2022 National Defense Strategy.\n\nOur starting premise is that a powerful U.S. military helps advance and safeguard vital U.S. national interests by backstopping diplomacy, confronting aggression, deterring conflict, projecting strength, and protecting the American people and their economic interests.\n\nAmid intensifying competition, the military’s role is to maintain and gain warfighting advantages while limiting those of our competitors.\n\nThe military will act urgently to sustain and strengthen deterrence, with the PRC as its pacing challenge.\n\nWe will make disciplined choices regarding our national defense and focus our attention on the military’s primary responsibilities: to defend the homeland, and deter attacks and aggression against the United States, our allies and partners, while being prepared to fight and win the Nation’s wars should diplomacy and deterrence fail.\n\nTo do so, we will combine our strengths to achieve maximum effect in deterring acts of aggression—an approach we refer to as integrated deterrence (see text box on page 22).\n\nWe will operate our military using a campaigning mindset—sequencing logically linked military activities to advance strategy-aligned priorities.\n\nAnd, we will build a resilient force and defense ecosystem to ensure we can perform these functions for decades to come.\n\nWe ended America’s longest war in Afghanistan, and with it an era of major military operations to remake other societies, even as we have maintained the capacity to address terrorist threats to the American people as they emerge.\n\n20  NATIONAL SECURITY STRATEGY Page 21 \x90\x90\x90\x90\x90\x90\n\nA combat-credible military is the foundation of deterrence and America’s ability to prevail in conflict.', metadata={'type': 'file', 'url': 'https://cdn.llmrails.com/dst_466092be-e79a-49f3-b3e6-50e51ddae186/a63892afdee3469d863520351bd5af9f', 'name': 'Biden-Harris-Administrations-National-Security-Strategy-10.2022.pdf', 'filters': {}}),
 Document(page_content='Your text here', metadata={'type': 'text', 'url': 'https://cdn.llmrails.com/dst_466092be-e79a-49f3-b3e6-50e51ddae186/63c17ac6395e4be1967c63a16356818e', 'name': '71370a91-7f58-4cc7-b2e7-546325960330', 'filters': {}}),
 Document(page_content='Page 1 NATIONAL SECURITY STRATEGY OCTOBER 2022 Page 2 October 12, 2022 From the earliest days of my Presidency, I have argued that our world is at an inflection point.\n\nHow we respond to the tremendous challenges and the unprecedented opportunities we face today will determine the direction of our world and impact the security and prosperity of the American people for generations to come.\n\nThe 2022 National Security Strategy outlines how my Administration will seize this decisive decade to advance America’s vital interests, position the United States to outmaneuver our geopolitical competitors, tackle shared challenges, and set our world firmly on a path toward a brighter and more hopeful tomorrow.\n\nAround the world, the need for American leadership is as great as it has ever been.\n\nWe are in the midst of a strategic competition to shape the future of the international order.\n\nMeanwhile, shared challenges that impact people everywhere demand increased global cooperation and nations stepping up to their responsibilities at a moment when this has become more difficult.\n\nIn response, the United States will lead with our values, and we will work in lockstep with our allies and partners and with all those who share our interests.\n\nWe will not leave our future vulnerable to the whims of those who do not share our vision for a world that is free, open, prosperous, and secure.\n\nAs the world continues to navigate the lingering impacts of the pandemic and global economic uncertainty, there is no nation better positioned to lead with strength and purpose than the United States of America.\n\nFrom the moment I took the oath of office, my Administration has focused on investing in America’s core strategic advantages.\n\nOur economy has added 10 million jobs and unemployment rates have reached near record lows.\n\nManufacturing jobs have come racing back to the United States.\n\nWe’re rebuilding our economy from the bottom up and the middle out.', metadata={'type': 'file', 'url': 'https://cdn.llmrails.com/dst_466092be-e79a-49f3-b3e6-50e51ddae186/a63892afdee3469d863520351bd5af9f', 'name': 'Biden-Harris-Administrations-National-Security-Strategy-10.2022.pdf', 'filters': {}}),
 Document(page_content='Your text here', metadata={'type': 'text', 'url': 'https://cdn.llmrails.com/dst_466092be-e79a-49f3-b3e6-50e51ddae186/8c414a9306e04d47a300f0289ba6e9cf', 'name': 'dacc29f5-8c63-46e0-b5aa-cab2d3c99fb7', 'filters': {}}),
 Document(page_content='To ensure our nuclear deterrent remains responsive to the threats we face, we are modernizing the nuclear Triad, nuclear command, control, and communications, and our nuclear weapons infrastructure, as well as strengthening our extended deterrence commitments to our Allies.\n\nWe remain equally committed to reducing the risks of nuclear war.\n\nThis includes taking further steps to reduce the role of nuclear weapons in our strategy and pursuing realistic goals for mutual, verifiable arms control, which contribute to our deterrence strategy and strengthen the global non-proliferation regime.\n\nThe most important investments are those made in the extraordinary All-Volunteer Force of the Army, Marine Corps, Navy, Air Force, Space Force, Coast Guard—together with our Department of Defense civilian workforce.\n\nOur service members are the backbone of America’s national defense and we are committed to their wellbeing and their families while in service and beyond.\n\nWe will maintain our foundational principle of civilian control of the military, recognizing that healthy civil-military relations rooted in mutual respect are essential to military effectiveness.\n\nWe will strengthen the effectiveness of the force by promoting diversity and inclusion; intensifying our suicide prevention efforts; eliminating the scourges of sexual assault, harassment, and other forms of violence, abuse, and discrimination; and rooting out violent extremism.\n\nWe will also uphold our Nation’s sacred obligation to care for veterans and their families when our troops return home.\n\nNATIONAL SECURITY STRATEGY 21 Page 22 \x90\x90\x90\x90\x90\x90\n\nIntegrated Deterrence The United States has a vital interest in deterring aggression by the PRC, Russia, and other states.\n\nMore capable competitors and new strategies of threatening behavior below and above the traditional threshold of conflict mean we cannot afford to rely solely on conventional forces and nuclear deterrence.\n\nOur defense strategy must sustain and strengthen deterrence, with the PRC as our pacing challenge.', metadata={'type': 'file', 'url': 'https://cdn.llmrails.com/dst_466092be-e79a-49f3-b3e6-50e51ddae186/a63892afdee3469d863520351bd5af9f', 'name': 'Biden-Harris-Administrations-National-Security-Strategy-10.2022.pdf', 'filters': {}})]
```
