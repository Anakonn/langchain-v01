---
translated: true
---

# Docugami

Ce cahier couvre comment charger des documents à partir de `Docugami`. Il fournit les avantages de l'utilisation de ce système par rapport aux chargeurs de données alternatifs.

## Prérequis

1. Installer les packages Python nécessaires.
2. Récupérer un jeton d'accès pour votre espace de travail et vous assurer qu'il est défini en tant que variable d'environnement `DOCUGAMI_API_KEY`.
3. Récupérer les identifiants de docset et de document pour vos documents traités, comme décrit ici : https://help.docugami.com/home/docugami-api

```python
# You need the dgml-utils package to use the DocugamiLoader (run pip install directly without "poetry run" if you are not using poetry)
!poetry run pip install docugami-langchain dgml-utils==0.3.0 --upgrade --quiet
```

## Démarrage rapide

1. Créer un [espace de travail Docugami](http://www.docugami.com) (essais gratuits disponibles)
2. Ajouter vos documents (PDF, DOCX ou DOC) et permettre à Docugami de les ingérer et de les regrouper en ensembles de documents similaires, par exemple des accords de confidentialité, des contrats de location et des contrats de service. Il n'y a pas de jeu fixe de types de documents pris en charge par le système, les groupes créés dépendent de vos documents particuliers, et vous pouvez [modifier les affectations de docset](https://help.docugami.com/home/working-with-the-doc-sets-view) plus tard.
3. Créer un jeton d'accès via le Playground du développeur pour votre espace de travail. [Instructions détaillées](https://help.docugami.com/home/docugami-api)
4. Explorer l'[API Docugami](https://api-docs.docugami.com) pour obtenir une liste des identifiants de docset traités, ou simplement les identifiants de document pour un docset particulier.
6. Utiliser le DocugamiLoader comme détaillé ci-dessous, pour obtenir des fragments sémantiques riches pour vos documents.
7. Facultativement, créer et publier un ou plusieurs [rapports ou résumés](https://help.docugami.com/home/reports). Cela aide Docugami à améliorer le XML sémantique avec de meilleures balises en fonction de vos préférences, qui sont ensuite ajoutées à la sortie du DocugamiLoader en tant que métadonnées. Utiliser des techniques comme [self-querying retriever](/docs/modules/data_connection/retrievers/self_query/) pour effectuer une recherche de documents avec une grande précision.

## Avantages par rapport aux autres techniques de découpage

Un découpage approprié de vos documents est essentiel pour la récupération à partir de documents. De nombreuses techniques de découpage existent, y compris des techniques simples qui s'appuient sur les espaces blancs et le fractionnement récursif des fragments en fonction de la longueur des caractères. Docugami propose une approche différente :

1. **Découpage intelligent :** Docugami décompose chaque document en un arbre XML sémantique hiérarchique de fragments de tailles variables, allant de simples mots ou valeurs numériques à des sections entières. Ces fragments suivent les contours sémantiques du document, offrant une représentation plus significative que le découpage arbitraire ou basé sur les espaces blancs.
2. **Annotations sémantiques :** Les fragments sont annotés avec des balises sémantiques cohérentes dans l'ensemble du jeu de documents, facilitant des requêtes hiérarchiques cohérentes sur plusieurs documents, même s'ils sont rédigés et formatés différemment. Par exemple, dans un ensemble de contrats de location, vous pouvez facilement identifier les principales dispositions comme le propriétaire, le locataire ou la date de renouvellement, ainsi que des informations plus complexes comme le libellé de toute disposition de sous-location ou si une juridiction spécifique a une section d'exception dans une clause de résiliation.
3. **Représentation structurée :** De plus, l'arbre XML indique les contours structurels de chaque document, en utilisant des attributs désignant les titres, les paragraphes, les listes, les tableaux et d'autres éléments courants, et ce de manière cohérente dans tous les formats de document pris en charge, comme les PDF numérisés ou les fichiers DOCX. Il gère correctement les caractéristiques des documents longs comme les en-têtes/pieds de page ou les flux sur plusieurs colonnes pour une extraction de texte propre.
4. **Métadonnées supplémentaires :** Les fragments sont également annotés avec des métadonnées supplémentaires, si un utilisateur a utilisé Docugami. Ces métadonnées supplémentaires peuvent être utilisées pour une recherche de documents très précise sans restrictions de fenêtre de contexte. Voir le détail du code ci-dessous.

```python
import os

from docugami_langchain.document_loaders import DocugamiLoader
```

## Charger des documents

Si la variable d'environnement DOCUGAMI_API_KEY est définie, il n'est pas nécessaire de la passer explicitement au chargeur, sinon vous pouvez la passer en tant que paramètre `access_token`.

```python
DOCUGAMI_API_KEY = os.environ.get("DOCUGAMI_API_KEY")
```

```python
docset_id = "26xpy3aes7xp"
document_ids = ["d7jqdzcj50sj", "cgd1eacfkchw"]

# To load all docs in the given docset ID, just don't provide document_ids
loader = DocugamiLoader(docset_id=docset_id, document_ids=document_ids)
chunks = loader.load()
len(chunks)
```

```output
120
```

Les `metadata` de chaque `Document` (en fait, un fragment d'un véritable PDF, DOC ou DOCX) contiennent des informations supplémentaires utiles :

1. **id et source :** ID et nom du fichier (PDF, DOC ou DOCX) dont le fragment est issu dans Docugami.
2. **xpath :** XPath à l'intérieur de la représentation XML du document, pour le fragment. Utile pour les citations de source directement au fragment réel dans le XML du document.
3. **structure :** Attributs structurels du fragment, par exemple h1, h2, div, table, td, etc. Utile pour filtrer certains types de fragments si nécessaire par l'appelant.
4. **tag :** Balise sémantique pour le fragment, en utilisant diverses techniques génératives et extractives. Plus de détails ici : https://github.com/docugami/DFM-benchmarks

Vous pouvez contrôler le comportement de découpage en définissant les propriétés suivantes sur l'instance `DocugamiLoader` :

1. Vous pouvez définir la taille minimale et maximale des fragments, que le système essaie de respecter avec un minimum de troncature. Vous pouvez définir `loader.min_text_length` et `loader.max_text_length` pour contrôler ces paramètres.
2. Par défaut, seul le texte des fragments est renvoyé. Cependant, le graphe de connaissances XML de Docugami contient des informations riches supplémentaires, notamment des balises sémantiques pour les entités à l'intérieur du fragment. Définissez `loader.include_xml_tags = True` si vous voulez les métadonnées XML supplémentaires sur les fragments renvoyés.
3. De plus, vous pouvez définir `loader.parent_hierarchy_levels` si vous voulez que Docugami renvoie les fragments parents dans les fragments qu'il renvoie. Les fragments enfants pointent vers les fragments parents via la valeur de `loader.parent_id_key`. Cela est utile, par exemple, avec le [MultiVector Retriever](/docs/modules/data_connection/retrievers/multi_vector) pour la récupération [small-to-big](https://www.youtube.com/watch?v=ihSiRrOUwmg). Voir l'exemple détaillé plus loin dans ce cahier.

```python
loader.min_text_length = 64
loader.include_xml_tags = True
chunks = loader.load()

for chunk in chunks[:5]:
    print(chunk)
```

```output
page_content='MASTER SERVICES AGREEMENT\n <ThisServicesAgreement> This Services Agreement (the “Agreement”) sets forth terms under which <Company>MagicSoft, Inc. </Company>a <Org><USState>Washington </USState>Corporation </Org>(“Company”) located at <CompanyAddress><CompanyStreetAddress><Company>600 </Company><Company>4th Ave</Company></CompanyStreetAddress>, <Company>Seattle</Company>, <Client>WA </Client><ProvideServices>98104 </ProvideServices></CompanyAddress>shall provide services to <Client>Daltech, Inc.</Client>, a <Company><USState>Washington </USState>Corporation </Company>(the “Client”) located at <ClientAddress><ClientStreetAddress><Client>701 </Client><Client>1st St</Client></ClientStreetAddress>, <Client>Kirkland</Client>, <State>WA </State><Client>98033</Client></ClientAddress>. This Agreement is effective as of <EffectiveDate>February 15, 2021 </EffectiveDate>(“Effective Date”). </ThisServicesAgreement>' metadata={'xpath': '/dg:chunk/docset:MASTERSERVICESAGREEMENT-section/dg:chunk', 'id': 'c28554d0af5114e2b102e6fc4dcbbde5', 'name': 'Master Services Agreement - Daltech.docx', 'source': 'Master Services Agreement - Daltech.docx', 'structure': 'h1 p', 'tag': 'chunk ThisServicesAgreement', 'Liability': '', 'Workers Compensation Insurance': '$1,000,000', 'Limit': '$1,000,000', 'Commercial General Liability Insurance': '$2,000,000', 'Technology Professional Liability Errors Omissions Policy': '$5,000,000', 'Excess Liability Umbrella Coverage': '$9,000,000', 'Client': 'Daltech, Inc.', 'Services Agreement Date': 'INITIAL STATEMENT  OF WORK (SOW)  The purpose of this SOW is to describe the Software and Services that Company will initially provide to  Daltech, Inc.  the “Client”) under the terms and conditions of the  Services Agreement  entered into between the parties on  June 15, 2021', 'Completion of the Services by Company Date': 'February 15, 2022', 'Charge': 'one hundred percent (100%)', 'Company': 'MagicSoft, Inc.', 'Effective Date': 'February 15, 2021', 'Start Date': '03/15/2021', 'Scheduled Onsite Visits Are Cancelled': 'ten (10) working days', 'Limit on Liability': '', 'Liability Cap': '', 'Business Automobile Liability': 'Business Automobile Liability  covering all vehicles that Company owns, hires or leases with a limit of no less than  $1,000,000  (combined single limit for bodily injury and property damage) for each accident.', 'Contractual Liability Coverage': 'Commercial General Liability insurance including  Contractual Liability Coverage , with coverage for products liability, completed operations, property damage and bodily injury, including  death , with an aggregate limit of no less than  $2,000,000 . This policy shall name Client as an additional insured with respect to the provision of services provided under this Agreement. This policy shall include a waiver of subrogation against Client.', 'Technology Professional Liability Errors Omissions': 'Technology Professional Liability Errors & Omissions policy (which includes Cyber Risk coverage and Computer Security and Privacy Liability coverage) with a limit of no less than  $5,000,000  per occurrence and in the aggregate.'}
page_content='A. STANDARD SOFTWARE AND SERVICES AGREEMENT\n 1. Deliverables.\n Company shall provide Client with software, technical support, product management, development, and <_testRef>testing </_testRef>services (“Services”) to the Client as described on one or more Statements of Work signed by Company and Client that reference this Agreement (“SOW” or “Statement of Work”). Company shall perform Services in a prompt manner and have the final product or service (“Deliverable”) ready for Client no later than the due date specified in the applicable SOW (“Completion Date”). This due date is subject to change in accordance with the Change Order process defined in the applicable SOW. Client shall assist Company by promptly providing all information requests known or available and relevant to the Services in a timely manner.' metadata={'xpath': '/dg:chunk/docset:MASTERSERVICESAGREEMENT-section/docset:MASTERSERVICESAGREEMENT/dg:chunk[1]/docset:Standard/dg:chunk[1]/dg:chunk[1]', 'id': 'de60160d328df10fa2637637c803d2d4', 'name': 'Master Services Agreement - Daltech.docx', 'source': 'Master Services Agreement - Daltech.docx', 'structure': 'lim h1 lim h1 div', 'tag': 'chunk', 'Liability': '', 'Workers Compensation Insurance': '$1,000,000', 'Limit': '$1,000,000', 'Commercial General Liability Insurance': '$2,000,000', 'Technology Professional Liability Errors Omissions Policy': '$5,000,000', 'Excess Liability Umbrella Coverage': '$9,000,000', 'Client': 'Daltech, Inc.', 'Services Agreement Date': 'INITIAL STATEMENT  OF WORK (SOW)  The purpose of this SOW is to describe the Software and Services that Company will initially provide to  Daltech, Inc.  the “Client”) under the terms and conditions of the  Services Agreement  entered into between the parties on  June 15, 2021', 'Completion of the Services by Company Date': 'February 15, 2022', 'Charge': 'one hundred percent (100%)', 'Company': 'MagicSoft, Inc.', 'Effective Date': 'February 15, 2021', 'Start Date': '03/15/2021', 'Scheduled Onsite Visits Are Cancelled': 'ten (10) working days', 'Limit on Liability': '', 'Liability Cap': '', 'Business Automobile Liability': 'Business Automobile Liability  covering all vehicles that Company owns, hires or leases with a limit of no less than  $1,000,000  (combined single limit for bodily injury and property damage) for each accident.', 'Contractual Liability Coverage': 'Commercial General Liability insurance including  Contractual Liability Coverage , with coverage for products liability, completed operations, property damage and bodily injury, including  death , with an aggregate limit of no less than  $2,000,000 . This policy shall name Client as an additional insured with respect to the provision of services provided under this Agreement. This policy shall include a waiver of subrogation against Client.', 'Technology Professional Liability Errors Omissions': 'Technology Professional Liability Errors & Omissions policy (which includes Cyber Risk coverage and Computer Security and Privacy Liability coverage) with a limit of no less than  $5,000,000  per occurrence and in the aggregate.'}
page_content='2. Onsite Services.\n 2.1 Onsite visits will be charged on a <Frequency>daily </Frequency>basis (minimum <OnsiteVisits>8 hours</OnsiteVisits>).' metadata={'xpath': '/dg:chunk/docset:MASTERSERVICESAGREEMENT-section/docset:MASTERSERVICESAGREEMENT/dg:chunk[1]/docset:Standard/dg:chunk[3]/dg:chunk[1]', 'id': 'db18315b437ac2de6b555d2d8ef8f893', 'name': 'Master Services Agreement - Daltech.docx', 'source': 'Master Services Agreement - Daltech.docx', 'structure': 'lim h1 lim p', 'tag': 'chunk', 'Liability': '', 'Workers Compensation Insurance': '$1,000,000', 'Limit': '$1,000,000', 'Commercial General Liability Insurance': '$2,000,000', 'Technology Professional Liability Errors Omissions Policy': '$5,000,000', 'Excess Liability Umbrella Coverage': '$9,000,000', 'Client': 'Daltech, Inc.', 'Services Agreement Date': 'INITIAL STATEMENT  OF WORK (SOW)  The purpose of this SOW is to describe the Software and Services that Company will initially provide to  Daltech, Inc.  the “Client”) under the terms and conditions of the  Services Agreement  entered into between the parties on  June 15, 2021', 'Completion of the Services by Company Date': 'February 15, 2022', 'Charge': 'one hundred percent (100%)', 'Company': 'MagicSoft, Inc.', 'Effective Date': 'February 15, 2021', 'Start Date': '03/15/2021', 'Scheduled Onsite Visits Are Cancelled': 'ten (10) working days', 'Limit on Liability': '', 'Liability Cap': '', 'Business Automobile Liability': 'Business Automobile Liability  covering all vehicles that Company owns, hires or leases with a limit of no less than  $1,000,000  (combined single limit for bodily injury and property damage) for each accident.', 'Contractual Liability Coverage': 'Commercial General Liability insurance including  Contractual Liability Coverage , with coverage for products liability, completed operations, property damage and bodily injury, including  death , with an aggregate limit of no less than  $2,000,000 . This policy shall name Client as an additional insured with respect to the provision of services provided under this Agreement. This policy shall include a waiver of subrogation against Client.', 'Technology Professional Liability Errors Omissions': 'Technology Professional Liability Errors & Omissions policy (which includes Cyber Risk coverage and Computer Security and Privacy Liability coverage) with a limit of no less than  $5,000,000  per occurrence and in the aggregate.'}
page_content='2.2 <Expenses>Time and expenses will be charged based on actuals unless otherwise described in an Order Form or accompanying SOW. </Expenses>' metadata={'xpath': '/dg:chunk/docset:MASTERSERVICESAGREEMENT-section/docset:MASTERSERVICESAGREEMENT/dg:chunk[1]/docset:Standard/dg:chunk[3]/dg:chunk[2]/docset:ADailyBasis/dg:chunk[2]/dg:chunk', 'id': '506220fa472d5c48c8ee3db78c1122c1', 'name': 'Master Services Agreement - Daltech.docx', 'source': 'Master Services Agreement - Daltech.docx', 'structure': 'lim p', 'tag': 'chunk Expenses', 'Liability': '', 'Workers Compensation Insurance': '$1,000,000', 'Limit': '$1,000,000', 'Commercial General Liability Insurance': '$2,000,000', 'Technology Professional Liability Errors Omissions Policy': '$5,000,000', 'Excess Liability Umbrella Coverage': '$9,000,000', 'Client': 'Daltech, Inc.', 'Services Agreement Date': 'INITIAL STATEMENT  OF WORK (SOW)  The purpose of this SOW is to describe the Software and Services that Company will initially provide to  Daltech, Inc.  the “Client”) under the terms and conditions of the  Services Agreement  entered into between the parties on  June 15, 2021', 'Completion of the Services by Company Date': 'February 15, 2022', 'Charge': 'one hundred percent (100%)', 'Company': 'MagicSoft, Inc.', 'Effective Date': 'February 15, 2021', 'Start Date': '03/15/2021', 'Scheduled Onsite Visits Are Cancelled': 'ten (10) working days', 'Limit on Liability': '', 'Liability Cap': '', 'Business Automobile Liability': 'Business Automobile Liability  covering all vehicles that Company owns, hires or leases with a limit of no less than  $1,000,000  (combined single limit for bodily injury and property damage) for each accident.', 'Contractual Liability Coverage': 'Commercial General Liability insurance including  Contractual Liability Coverage , with coverage for products liability, completed operations, property damage and bodily injury, including  death , with an aggregate limit of no less than  $2,000,000 . This policy shall name Client as an additional insured with respect to the provision of services provided under this Agreement. This policy shall include a waiver of subrogation against Client.', 'Technology Professional Liability Errors Omissions': 'Technology Professional Liability Errors & Omissions policy (which includes Cyber Risk coverage and Computer Security and Privacy Liability coverage) with a limit of no less than  $5,000,000  per occurrence and in the aggregate.'}
page_content='2.3 <RegularWorkingHours>All work will be executed during regular working hours <RegularWorkingHours>Monday</RegularWorkingHours>-<Weekday>Friday </Weekday><RegularWorkingHours><RegularWorkingHours>0800</RegularWorkingHours>-<Number>1900</Number></RegularWorkingHours>. For work outside of these hours on weekdays, Company will charge <Charge>one hundred percent (100%) </Charge>of the regular hourly rate and <Charge>two hundred percent (200%) </Charge>for Saturdays, Sundays and public holidays applicable to Company. </RegularWorkingHours>' metadata={'xpath': '/dg:chunk/docset:MASTERSERVICESAGREEMENT-section/docset:MASTERSERVICESAGREEMENT/dg:chunk[1]/docset:Standard/dg:chunk[3]/dg:chunk[2]/docset:ADailyBasis/dg:chunk[3]/dg:chunk', 'id': 'dac7a3ded61b5c4f3e59771243ea46c1', 'name': 'Master Services Agreement - Daltech.docx', 'source': 'Master Services Agreement - Daltech.docx', 'structure': 'lim p', 'tag': 'chunk RegularWorkingHours', 'Liability': '', 'Workers Compensation Insurance': '$1,000,000', 'Limit': '$1,000,000', 'Commercial General Liability Insurance': '$2,000,000', 'Technology Professional Liability Errors Omissions Policy': '$5,000,000', 'Excess Liability Umbrella Coverage': '$9,000,000', 'Client': 'Daltech, Inc.', 'Services Agreement Date': 'INITIAL STATEMENT  OF WORK (SOW)  The purpose of this SOW is to describe the Software and Services that Company will initially provide to  Daltech, Inc.  the “Client”) under the terms and conditions of the  Services Agreement  entered into between the parties on  June 15, 2021', 'Completion of the Services by Company Date': 'February 15, 2022', 'Charge': 'one hundred percent (100%)', 'Company': 'MagicSoft, Inc.', 'Effective Date': 'February 15, 2021', 'Start Date': '03/15/2021', 'Scheduled Onsite Visits Are Cancelled': 'ten (10) working days', 'Limit on Liability': '', 'Liability Cap': '', 'Business Automobile Liability': 'Business Automobile Liability  covering all vehicles that Company owns, hires or leases with a limit of no less than  $1,000,000  (combined single limit for bodily injury and property damage) for each accident.', 'Contractual Liability Coverage': 'Commercial General Liability insurance including  Contractual Liability Coverage , with coverage for products liability, completed operations, property damage and bodily injury, including  death , with an aggregate limit of no less than  $2,000,000 . This policy shall name Client as an additional insured with respect to the provision of services provided under this Agreement. This policy shall include a waiver of subrogation against Client.', 'Technology Professional Liability Errors Omissions': 'Technology Professional Liability Errors & Omissions policy (which includes Cyber Risk coverage and Computer Security and Privacy Liability coverage) with a limit of no less than  $5,000,000  per occurrence and in the aggregate.'}
```

## Utilisation de base : Chargeur Docugami pour l'assurance qualité des documents

Vous pouvez utiliser le chargeur Docugami comme un chargeur standard pour l'assurance qualité des documents sur plusieurs documents, avec des morceaux beaucoup plus pertinents qui suivent les contours naturels du document. Il existe de nombreux excellents tutoriels sur la façon de procéder, par exemple [celui-ci](https://www.youtube.com/watch?v=3yPBVii7Ct0). Nous pouvons simplement utiliser le même code, mais utiliser le `DocugamiLoader` pour un meilleur découpage en morceaux, au lieu de charger directement des fichiers texte ou PDF avec des techniques de fractionnement de base.

```python
!poetry run pip install --upgrade langchain-openai tiktoken chromadb hnswlib
```

```python
# For this example, we already have a processed docset for a set of lease documents
loader = DocugamiLoader(docset_id="zo954yqy53wp")
chunks = loader.load()

# strip semantic metadata intentionally, to test how things work without semantic metadata
for chunk in chunks:
    stripped_metadata = chunk.metadata.copy()
    for key in chunk.metadata:
        if key not in ["name", "xpath", "id", "structure"]:
            # remove semantic metadata
            del stripped_metadata[key]
    chunk.metadata = stripped_metadata

print(len(chunks))
```

```output
4674
```

Les documents renvoyés par le chargeur sont déjà divisés, nous n'avons donc pas besoin d'utiliser un fractionneur de texte. Facultativement, nous pouvons utiliser les métadonnées de chaque document, par exemple la structure ou les attributs de balise, pour effectuer tout post-traitement souhaité.

Nous utiliserons simplement la sortie du `DocugamiLoader` telle quelle pour mettre en place une chaîne de questions-réponses de récupération de la manière habituelle.

```python
from langchain.chains import RetrievalQA
from langchain_community.vectorstores.chroma import Chroma
from langchain_openai import OpenAI, OpenAIEmbeddings

embedding = OpenAIEmbeddings()
vectordb = Chroma.from_documents(documents=chunks, embedding=embedding)
retriever = vectordb.as_retriever()
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(), chain_type="stuff", retriever=retriever, return_source_documents=True
)
```

```python
# Try out the retriever with an example query
qa_chain("What can tenants do with signage on their properties?")
```

```output
{'query': 'What can tenants do with signage on their properties?',
 'result': ' Tenants can place or attach signage (digital or otherwise) to their property after receiving written permission from the landlord, which permission shall not be unreasonably withheld. The signage must conform to all applicable laws, ordinances, etc. governing the same, and tenants must remove all such signs by the termination of the lease.',
 'source_documents': [Document(page_content='6.01 Signage. Tenant may place or attach to the Premises signs (digital or otherwise) or other such identification as needed after receiving written permission from the Landlord, which permission shall not be unreasonably withheld. Any damage caused to the Premises by the Tenant’s erecting or removing such signs shall be repaired promptly by the Tenant at the Tenant’s expense. Any signs or other form of identification allowed must conform to all applicable laws, ordinances, etc. governing the same. Tenant also agrees to have any window or glass identification completely removed and cleaned at its expense promptly upon vacating the Premises. ARTICLE VII UTILITIES', metadata={'id': '1c290eea05915ba0f24c4a1ffc05d6f3', 'name': 'Sample Commercial Leases/TruTone Lane 6.pdf', 'structure': 'lim h1', 'xpath': '/dg:chunk/dg:chunk/dg:chunk[2]/dg:chunk[1]/docset:TheApprovedUse/dg:chunk[12]/dg:chunk[1]'}),
  Document(page_content='6.01 Signage. Tenant may place or attach to the Premises signs (digital or otherwise) or other such identification as needed after receiving written permission from the Landlord, which permission shall not be unreasonably withheld. Any damage caused to the Premises by the Tenant’s erecting or removing such signs shall be repaired promptly by the Tenant at the Tenant’s expense. Any signs or other form of identification allowed must conform to all applicable laws, ordinances, etc. governing the same. Tenant also agrees to have any window or glass identification completely removed and cleaned at its expense promptly upon vacating the Premises. ARTICLE VII UTILITIES', metadata={'id': '1c290eea05915ba0f24c4a1ffc05d6f3', 'name': 'Sample Commercial Leases/TruTone Lane 2.pdf', 'structure': 'lim h1', 'xpath': '/dg:chunk/dg:chunk/dg:chunk[2]/dg:chunk[1]/docset:TheApprovedUse/dg:chunk[12]/dg:chunk[1]'}),
  Document(page_content='Tenant may place or attach to the Premises signs (digital or otherwise) or other such identification as needed after receiving written permission from the Landlord, which permission shall not be unreasonably withheld. Any damage caused to the Premises by the Tenant’s erecting or removing such signs shall be repaired promptly by the Tenant at the Tenant’s expense. Any signs or other form of identification allowed must conform to all applicable laws, ordinances, etc. governing the same. Tenant also agrees to have any window or glass identification completely removed and cleaned at its expense promptly upon vacating the Premises.', metadata={'id': '58d268162ecc36d8633b7bc364afcb8c', 'name': 'Sample Commercial Leases/TruTone Lane 2.docx', 'structure': 'div', 'xpath': '/docset:OFFICELEASEAGREEMENT-section/docset:OFFICELEASEAGREEMENT/dg:chunk/docset:ARTICLEVISIGNAGE-section/docset:ARTICLEVISIGNAGE/docset:_601Signage'}),
  Document(page_content='8. SIGNS:\n Tenant shall not install signs upon the Premises without Landlord’s prior written approval, which approval shall not be unreasonably withheld or delayed, and any such signage shall be subject to any applicable governmental laws, ordinances, regulations, and other requirements. Tenant shall remove all such signs by the terminations of this Lease. Such installations and removals shall be made in such a manner as to avoid injury or defacement of the Building and other improvements, and Tenant shall repair any injury or defacement, including without limitation discoloration caused by such installations and/or removal.', metadata={'id': '6b7d88f0c979c65d5db088fc177fa81f', 'name': 'Lease Agreements/Bioplex, Inc.pdf', 'structure': 'lim h1 div', 'xpath': '/dg:chunk/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk/docset:TheObligation/dg:chunk[8]/dg:chunk'})]}
```

## Utilisation du graphe de connaissances Docugami pour une assurance qualité des documents très précise

Un problème avec les grands documents est que la réponse correcte à votre question peut dépendre de morceaux qui sont très éloignés dans le document. Les techniques de découpage en morceaux classiques, même avec un chevauchement, auront du mal à fournir au LLM suffisamment de contexte pour répondre à ces questions. Avec les futurs LLM à très grand contexte, il sera peut-être possible d'inclure beaucoup de jetons, voire des documents entiers, dans le contexte, mais cela atteindra des limites à un certain point avec des documents très longs ou un grand nombre de documents.

Par exemple, si nous posons une question plus complexe qui nécessite que le LLM s'appuie sur des morceaux de différentes parties du document, même le puissant LLM d'OpenAI est incapable de répondre correctement.

```python
chain_response = qa_chain("What is rentable area for the property owned by DHA Group?")
chain_response["result"]  # correct answer should be 13,500 sq ft
```

```output
" I don't know."
```

```python
chain_response["source_documents"]
```

```output
[Document(page_content='1.6 Rentable Area of the Premises.', metadata={'id': '5b39a1ae84d51682328dca1467be211f', 'name': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'structure': 'lim h1', 'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk/dg:chunk/docset:BasicLeaseInformation/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS-section/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS/docset:CatalystGroup/dg:chunk[6]/dg:chunk'}),
 Document(page_content='1.6 Rentable Area of the Premises.', metadata={'id': '5b39a1ae84d51682328dca1467be211f', 'name': 'Sample Commercial Leases/Shorebucks LLC_AZ.pdf', 'structure': 'lim h1', 'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk/dg:chunk/docset:BasicLeaseInformation/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS-section/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS/docset:MenloGroup/dg:chunk[6]/dg:chunk'}),
 Document(page_content='1.6 Rentable Area of the Premises.', metadata={'id': '5b39a1ae84d51682328dca1467be211f', 'name': 'Sample Commercial Leases/Shorebucks LLC_FL.pdf', 'structure': 'lim h1', 'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/docset:Florida-section/docset:Florida/docset:Shorebucks/dg:chunk[5]/dg:chunk'}),
 Document(page_content='1.6 Rentable Area of the Premises.', metadata={'id': '5b39a1ae84d51682328dca1467be211f', 'name': 'Sample Commercial Leases/Shorebucks LLC_TX.pdf', 'structure': 'lim h1', 'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk/dg:chunk/docset:BasicLeaseInformation/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS-section/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS/docset:LandmarkLlc/dg:chunk[6]/dg:chunk'})]
```

À première vue, la réponse peut sembler raisonnable, mais elle est incorrecte. Si vous examinez attentivement les morceaux sources de cette réponse, vous verrez que le découpage du document n'a pas réussi à placer le nom du propriétaire et la surface louable dans le même contexte, et a produit des morceaux non pertinents, donc la réponse est incorrecte (devrait être **13 500 pi²**)

Docugami peut aider ici. Les morceaux sont annotés avec des métadonnées supplémentaires créées à l'aide de différentes techniques si un utilisateur a [utilisé Docugami](https://help.docugami.com/home/reports). Des approches plus techniques seront ajoutées plus tard.

Demandons spécifiquement à Docugami de renvoyer des balises XML sur sa sortie, ainsi que des métadonnées supplémentaires :

```python
loader = DocugamiLoader(docset_id="zo954yqy53wp")
loader.include_xml_tags = (
    True  # for additional semantics from the Docugami knowledge graph
)
chunks = loader.load()
print(chunks[0].metadata)
```

```output
{'xpath': '/docset:OFFICELEASE-section/dg:chunk', 'id': '47297e277e556f3ce8b570047304560b', 'name': 'Sample Commercial Leases/Shorebucks LLC_AZ.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_AZ.pdf', 'structure': 'h1 h1 p', 'tag': 'chunk Lease', 'Lease Date': 'March  29th , 2019', 'Landlord': 'Menlo Group', 'Tenant': 'Shorebucks LLC', 'Premises Address': '1564  E Broadway Rd ,  Tempe ,  Arizona  85282', 'Term of Lease': '96  full calendar months', 'Square Feet': '16,159'}
```

Nous pouvons utiliser un [récupérateur auto-interrogateur](/docs/modules/data_connection/retrievers/self_query/) pour améliorer la précision de notre requête, en utilisant ces métadonnées supplémentaires :

```python
!poetry run pip install --upgrade lark --quiet
```

```python
from langchain.chains.query_constructor.schema import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.vectorstores.chroma import Chroma

EXCLUDE_KEYS = ["id", "xpath", "structure"]
metadata_field_info = [
    AttributeInfo(
        name=key,
        description=f"The {key} for this chunk",
        type="string",
    )
    for key in chunks[0].metadata
    if key.lower() not in EXCLUDE_KEYS
]

document_content_description = "Contents of this chunk"
llm = OpenAI(temperature=0)

vectordb = Chroma.from_documents(documents=chunks, embedding=embedding)
retriever = SelfQueryRetriever.from_llm(
    llm, vectordb, document_content_description, metadata_field_info, verbose=True
)
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True,
    verbose=True,
)
```

Exécutons à nouveau la même question. Elle renvoie le résultat correct car tous les morceaux ont des paires clé/valeur de métadonnées les portant des informations clés sur le document, même si ces informations sont physiquement très éloignées du morceau source utilisé pour générer la réponse.

```python
qa_chain(
    "What is rentable area for the property owned by DHA Group?"
)  # correct answer should be 13,500 sq ft
```

```output


[1m> Entering new RetrievalQA chain...[0m

[1m> Finished chain.[0m
```

```output
{'query': 'What is rentable area for the property owned by DHA Group?',
 'result': ' The rentable area of the property owned by DHA Group is 13,500 square feet.',
 'source_documents': [Document(page_content='1.6 Rentable Area of the Premises.', metadata={'Landlord': 'DHA Group', 'Lease Date': 'March  29th , 2019', 'Premises Address': '111  Bauer Dr ,  Oakland ,  New Jersey ,  07436', 'Square Feet': '13,500', 'Tenant': 'Shorebucks LLC', 'Term of Lease': '84  full calendar  months', 'id': '5b39a1ae84d51682328dca1467be211f', 'name': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'structure': 'lim h1', 'tag': 'chunk', 'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk/dg:chunk/docset:BasicLeaseInformation/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS-section/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS/docset:DhaGroup/dg:chunk[6]/dg:chunk'}),
  Document(page_content='<RentableAreaofthePremises><SquareFeet>13,500 </SquareFeet>square feet. This square footage figure includes an add-on factor for Common Areas in the Building and has been agreed upon by the parties as final and correct and is not subject to challenge or dispute by either party. </RentableAreaofthePremises>', metadata={'Landlord': 'DHA Group', 'Lease Date': 'March  29th , 2019', 'Premises Address': '111  Bauer Dr ,  Oakland ,  New Jersey ,  07436', 'Square Feet': '13,500', 'Tenant': 'Shorebucks LLC', 'Term of Lease': '84  full calendar  months', 'id': '4c06903d087f5a83e486ee42cd702d31', 'name': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'structure': 'div', 'tag': 'RentableAreaofthePremises', 'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk/dg:chunk/docset:BasicLeaseInformation/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS-section/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS/docset:DhaGroup/dg:chunk[6]/docset:RentableAreaofthePremises-section/docset:RentableAreaofthePremises'}),
  Document(page_content='<TheTermAnnualMarketRent>shall mean (i) for the initial Lease Year (“Year 1”) <Money>$2,239,748.00 </Money>per year (i.e., the product of the Rentable Area of the Premises multiplied by <Money>$82.00</Money>) (the “Year 1 Market Rent Hurdle”); (ii) for the Lease Year thereafter, <Percent>one hundred three percent (103%) </Percent>of the Year 1 Market Rent Hurdle, and (iii) for each Lease Year thereafter until the termination or expiration of this Lease, the Annual Market Rent Threshold shall be <AnnualMarketRentThreshold>one hundred three percent (103%) </AnnualMarketRentThreshold>of the Annual Market Rent Threshold for the immediately prior Lease Year. </TheTermAnnualMarketRent>', metadata={'Landlord': 'DHA Group', 'Lease Date': 'March  29th , 2019', 'Premises Address': '111  Bauer Dr ,  Oakland ,  New Jersey ,  07436', 'Square Feet': '13,500', 'Tenant': 'Shorebucks LLC', 'Term of Lease': '84  full calendar  months', 'id': '6b90beeadace5d4d12b25706fb48e631', 'name': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'structure': 'div', 'tag': 'TheTermAnnualMarketRent', 'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/docset:GrossRentCredit-section/docset:GrossRentCredit/dg:chunk/dg:chunk/dg:chunk/dg:chunk[2]/docset:PercentageRent/dg:chunk[2]/dg:chunk[2]/docset:TenantSRevenue/dg:chunk[2]/docset:TenantSRevenue/dg:chunk[3]/docset:TheTermAnnualMarketRent-section/docset:TheTermAnnualMarketRent'}),
  Document(page_content='1.11 Percentage Rent.\n (a) <GrossRevenue><Percent>55% </Percent>of Gross Revenue to Landlord until Landlord receives Percentage Rent in an amount equal to the Annual Market Rent Hurdle (as escalated); and </GrossRevenue>', metadata={'Landlord': 'DHA Group', 'Lease Date': 'March  29th , 2019', 'Premises Address': '111  Bauer Dr ,  Oakland ,  New Jersey ,  07436', 'Square Feet': '13,500', 'Tenant': 'Shorebucks LLC', 'Term of Lease': '84  full calendar  months', 'id': 'c8bb9cbedf65a578d9db3f25f519dd3d', 'name': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'structure': 'lim h1 lim p', 'tag': 'chunk GrossRevenue', 'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/docset:GrossRentCredit-section/docset:GrossRentCredit/dg:chunk/dg:chunk/dg:chunk/docset:PercentageRent/dg:chunk[1]/dg:chunk[1]'})]}
```

Cette fois, la réponse est correcte, car le récupérateur auto-interrogateur a créé un filtre sur l'attribut propriétaire des métadonnées, filtrant correctement le document qui concerne spécifiquement le propriétaire DHA Group. Les morceaux sources résultants sont tous pertinents pour ce propriétaire, ce qui améliore la précision de la réponse, même si le propriétaire n'est pas directement mentionné dans le morceau spécifique qui contient la réponse correcte.

# Sujet avancé : Récupération de petit à grand avec la hiérarchie du graphe de connaissances des documents

Les documents sont intrinsèquement semi-structurés et le DocugamiLoader est capable de naviguer dans les contours sémantiques et structurels du document pour fournir des références de morceaux parents sur les morceaux qu'il renvoie. Cela est utile par exemple avec le [MultiVector Retriever](/docs/modules/data_connection/retrievers/multi_vector) pour la récupération [de petit à grand](https://www.youtube.com/watch?v=ihSiRrOUwmg).

Pour obtenir des références de morceaux parents, vous pouvez définir `loader.parent_hierarchy_levels` sur une valeur non nulle.

```python
from typing import Dict, List

from docugami_langchain.document_loaders import DocugamiLoader
from langchain_core.documents import Document

loader = DocugamiLoader(docset_id="zo954yqy53wp")
loader.include_xml_tags = (
    True  # for additional semantics from the Docugami knowledge graph
)
loader.parent_hierarchy_levels = 3  # for expanded context
loader.max_text_length = (
    1024 * 8
)  # 8K chars are roughly 2K tokens (ref: https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
loader.include_project_metadata_in_doc_metadata = (
    False  # Not filtering on vector metadata, so remove to lighten the vectors
)
chunks: List[Document] = loader.load()

# build separate maps of parent and child chunks
parents_by_id: Dict[str, Document] = {}
children_by_id: Dict[str, Document] = {}
for chunk in chunks:
    chunk_id = chunk.metadata.get("id")
    parent_chunk_id = chunk.metadata.get(loader.parent_id_key)
    if not parent_chunk_id:
        # parent chunk
        parents_by_id[chunk_id] = chunk
    else:
        # child chunk
        children_by_id[chunk_id] = chunk
```

```python
# Explore some of the parent chunk relationships
for id, chunk in list(children_by_id.items())[:5]:
    parent_chunk_id = chunk.metadata.get(loader.parent_id_key)
    if parent_chunk_id:
        # child chunks have the parent chunk id set
        print(f"PARENT CHUNK {parent_chunk_id}: {parents_by_id[parent_chunk_id]}")
        print(f"CHUNK {id}: {chunk}")
```

```output
PARENT CHUNK 7df09fbfc65bb8377054808aac2d16fd: page_content='OFFICE LEASE\n THIS OFFICE LEASE\n <Lease>(the "Lease") is made and entered into as of <LeaseDate>March 29th, 2019</LeaseDate>, by and between Landlord and Tenant. "Date of this Lease" shall mean the date on which the last one of the Landlord and Tenant has signed this Lease. </Lease>\nW I T N E S S E T H\n <TheTerms> Subject to and on the terms and conditions of this Lease, Landlord leases to Tenant and Tenant hires from Landlord the Premises. </TheTerms>\n1. BASIC LEASE INFORMATION AND DEFINED TERMS.\nThe key business terms of this Lease and the defined terms used in this Lease are as follows:' metadata={'xpath': '/docset:OFFICELEASE-section/dg:chunk', 'id': '7df09fbfc65bb8377054808aac2d16fd', 'name': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'structure': 'h1 h1 p h1 p lim h1 p', 'tag': 'chunk Lease chunk TheTerms'}
CHUNK 47297e277e556f3ce8b570047304560b: page_content='OFFICE LEASE\n THIS OFFICE LEASE\n <Lease>(the "Lease") is made and entered into as of <LeaseDate>March 29th, 2019</LeaseDate>, by and between Landlord and Tenant. "Date of this Lease" shall mean the date on which the last one of the Landlord and Tenant has signed this Lease. </Lease>' metadata={'xpath': '/docset:OFFICELEASE-section/dg:chunk', 'id': '47297e277e556f3ce8b570047304560b', 'name': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_NJ.pdf', 'structure': 'h1 h1 p', 'tag': 'chunk Lease', 'doc_id': '7df09fbfc65bb8377054808aac2d16fd'}
PARENT CHUNK bb84925da3bed22c30ea1bdc173ff54f: page_content='OFFICE LEASE\n THIS OFFICE LEASE\n <Lease>(the "Lease") is made and entered into as of <LeaseDate>January 8th, 2018</LeaseDate>, by and between Landlord and Tenant. "Date of this Lease" shall mean the date on which the last one of the Landlord and Tenant has signed this Lease. </Lease>\nW I T N E S S E T H\n <TheTerms> Subject to and on the terms and conditions of this Lease, Landlord leases to Tenant and Tenant hires from Landlord the Premises. </TheTerms>\n1. BASIC LEASE INFORMATION AND DEFINED TERMS.\nThe key business terms of this Lease and the defined terms used in this Lease are as follows:\n1.1 Landlord.\n <Landlord>Catalyst Group LLC </Landlord>' metadata={'xpath': '/docset:OFFICELEASE-section/dg:chunk', 'id': 'bb84925da3bed22c30ea1bdc173ff54f', 'name': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'structure': 'h1 h1 p h1 p lim h1 p lim h1 div', 'tag': 'chunk Lease chunk TheTerms chunk Landlord'}
CHUNK 2f1746cbd546d1d61a9250c50de7a7fa: page_content='W I T N E S S E T H\n <TheTerms> Subject to and on the terms and conditions of this Lease, Landlord leases to Tenant and Tenant hires from Landlord the Premises. </TheTerms>' metadata={'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/dg:chunk', 'id': '2f1746cbd546d1d61a9250c50de7a7fa', 'name': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'structure': 'h1 p', 'tag': 'chunk TheTerms', 'doc_id': 'bb84925da3bed22c30ea1bdc173ff54f'}
PARENT CHUNK 0b0d765b6e504a6ba54fa76b203e62ec: page_content='OFFICE LEASE\n THIS OFFICE LEASE\n <Lease>(the "Lease") is made and entered into as of <LeaseDate>January 8th, 2018</LeaseDate>, by and between Landlord and Tenant. "Date of this Lease" shall mean the date on which the last one of the Landlord and Tenant has signed this Lease. </Lease>\nW I T N E S S E T H\n <TheTerms> Subject to and on the terms and conditions of this Lease, Landlord leases to Tenant and Tenant hires from Landlord the Premises. </TheTerms>\n1. BASIC LEASE INFORMATION AND DEFINED TERMS.\nThe key business terms of this Lease and the defined terms used in this Lease are as follows:\n1.1 Landlord.\n <Landlord>Catalyst Group LLC </Landlord>\n1.2 Tenant.\n <Tenant>Shorebucks LLC </Tenant>' metadata={'xpath': '/docset:OFFICELEASE-section/dg:chunk', 'id': '0b0d765b6e504a6ba54fa76b203e62ec', 'name': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'structure': 'h1 h1 p h1 p lim h1 p lim h1 div lim h1 div', 'tag': 'chunk Lease chunk TheTerms chunk Landlord chunk Tenant'}
CHUNK b362dfe776ec5a7a66451a8c7c220b59: page_content='1. BASIC LEASE INFORMATION AND DEFINED TERMS.' metadata={'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk/dg:chunk/docset:BasicLeaseInformation/dg:chunk', 'id': 'b362dfe776ec5a7a66451a8c7c220b59', 'name': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'structure': 'lim h1', 'tag': 'chunk', 'doc_id': '0b0d765b6e504a6ba54fa76b203e62ec'}
PARENT CHUNK c942010baaf76aa4d4657769492f6edb: page_content='OFFICE LEASE\n THIS OFFICE LEASE\n <Lease>(the "Lease") is made and entered into as of <LeaseDate>January 8th, 2018</LeaseDate>, by and between Landlord and Tenant. "Date of this Lease" shall mean the date on which the last one of the Landlord and Tenant has signed this Lease. </Lease>\nW I T N E S S E T H\n <TheTerms> Subject to and on the terms and conditions of this Lease, Landlord leases to Tenant and Tenant hires from Landlord the Premises. </TheTerms>\n1. BASIC LEASE INFORMATION AND DEFINED TERMS.\nThe key business terms of this Lease and the defined terms used in this Lease are as follows:\n1.1 Landlord.\n <Landlord>Catalyst Group LLC </Landlord>\n1.2 Tenant.\n <Tenant>Shorebucks LLC </Tenant>\n1.3 Building.\n <Building>The building containing the Premises located at <PremisesAddress><PremisesStreetAddress><MainStreet>600 </MainStreet><StreetName>Main Street</StreetName></PremisesStreetAddress>, <City>Bellevue</City>, <State>WA</State>, <Premises>98004</Premises></PremisesAddress>. The Building is located within the Project. </Building>' metadata={'xpath': '/docset:OFFICELEASE-section/dg:chunk', 'id': 'c942010baaf76aa4d4657769492f6edb', 'name': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'structure': 'h1 h1 p h1 p lim h1 p lim h1 div lim h1 div lim h1 div', 'tag': 'chunk Lease chunk TheTerms chunk Landlord chunk Tenant chunk Building'}
CHUNK a95971d693b7aa0f6640df1fbd18c2ba: page_content='The key business terms of this Lease and the defined terms used in this Lease are as follows:' metadata={'xpath': '/docset:OFFICELEASE-section/docset:OFFICELEASE-section/docset:OFFICELEASE/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk/dg:chunk/docset:BasicLeaseInformation/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS-section/docset:BASICLEASEINFORMATIONANDDEFINEDTERMS/dg:chunk', 'id': 'a95971d693b7aa0f6640df1fbd18c2ba', 'name': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'source': 'Sample Commercial Leases/Shorebucks LLC_WA.pdf', 'structure': 'p', 'tag': 'chunk', 'doc_id': 'c942010baaf76aa4d4657769492f6edb'}
PARENT CHUNK f34b649cde7fc4ae156849a56d690495: page_content='W I T N E S S E T H\n <TheTerms> Subject to and on the terms and conditions of this Lease, Landlord leases to Tenant and Tenant hires from Landlord the Premises. </TheTerms>\n1. BASIC LEASE INFORMATION AND DEFINED TERMS.\n<BASICLEASEINFORMATIONANDDEFINEDTERMS>The key business terms of this Lease and the defined terms used in this Lease are as follows: </BASICLEASEINFORMATIONANDDEFINEDTERMS>\n1.1 Landlord.\n <Landlord><Landlord>Menlo Group</Landlord>, a <USState>Delaware </USState>limited liability company authorized to transact business in <USState>Arizona</USState>. </Landlord>\n1.2 Tenant.\n <Tenant>Shorebucks LLC </Tenant>\n1.3 Building.\n <Building>The building containing the Premises located at <PremisesAddress><PremisesStreetAddress><Premises>1564 </Premises><Premises>E Broadway Rd</Premises></PremisesStreetAddress>, <City>Tempe</City>, <USState>Arizona </USState><Premises>85282</Premises></PremisesAddress>. The Building is located within the Project. </Building>\n1.4 Project.\n <Project>The parcel of land and the buildings and improvements located on such land known as Shorebucks Office <ShorebucksOfficeAddress><ShorebucksOfficeStreetAddress><ShorebucksOffice>6 </ShorebucksOffice><ShorebucksOffice6>located at <Number>1564 </Number>E Broadway Rd</ShorebucksOffice6></ShorebucksOfficeStreetAddress>, <City>Tempe</City>, <USState>Arizona </USState><Number>85282</Number></ShorebucksOfficeAddress>. The Project is legally described in EXHIBIT "A" to this Lease. </Project>' metadata={'xpath': '/dg:chunk/docset:WITNESSETH-section/dg:chunk', 'id': 'f34b649cde7fc4ae156849a56d690495', 'name': 'Sample Commercial Leases/Shorebucks LLC_AZ.docx', 'source': 'Sample Commercial Leases/Shorebucks LLC_AZ.docx', 'structure': 'h1 p lim h1 div lim h1 div lim h1 div lim h1 div lim h1 div', 'tag': 'chunk TheTerms BASICLEASEINFORMATIONANDDEFINEDTERMS chunk Landlord chunk Tenant chunk Building chunk Project'}
CHUNK 21b4d9517f7ccdc0e3a028ce5043a2a0: page_content='1.1 Landlord.\n <Landlord><Landlord>Menlo Group</Landlord>, a <USState>Delaware </USState>limited liability company authorized to transact business in <USState>Arizona</USState>. </Landlord>' metadata={'xpath': '/dg:chunk/docset:WITNESSETH-section/docset:WITNESSETH/dg:chunk[1]/dg:chunk[1]/dg:chunk/dg:chunk[2]/dg:chunk', 'id': '21b4d9517f7ccdc0e3a028ce5043a2a0', 'name': 'Sample Commercial Leases/Shorebucks LLC_AZ.docx', 'source': 'Sample Commercial Leases/Shorebucks LLC_AZ.docx', 'structure': 'lim h1 div', 'tag': 'chunk Landlord', 'doc_id': 'f34b649cde7fc4ae156849a56d690495'}
```

```python
from langchain.retrievers.multi_vector import MultiVectorRetriever, SearchType
from langchain.storage import InMemoryStore
from langchain_community.vectorstores.chroma import Chroma
from langchain_openai import OpenAIEmbeddings

# The vectorstore to use to index the child chunks
vectorstore = Chroma(collection_name="big2small", embedding_function=OpenAIEmbeddings())

# The storage layer for the parent documents
store = InMemoryStore()

# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    docstore=store,
    search_type=SearchType.mmr,  # use max marginal relevance search
    search_kwargs={"k": 2},
)

# Add child chunks to vector store
retriever.vectorstore.add_documents(list(children_by_id.values()))

# Add parent chunks to docstore
retriever.docstore.mset(parents_by_id.items())
```

```python
# Query vector store directly, should return chunks
found_chunks = vectorstore.similarity_search(
    "what signs does Birch Street allow on their property?", k=2
)

for chunk in found_chunks:
    print(chunk.page_content)
    print(chunk.metadata[loader.parent_id_key])
```

```output
24. SIGNS.
 <SIGNS>No signage shall be placed by Tenant on any portion of the Project. However, Tenant shall be permitted to place a sign bearing its name in a location approved by Landlord near the entrance to the Premises (at Tenant's cost) and will be furnished a single listing of its name in the Building's directory (at Landlord's cost), all in accordance with the criteria adopted <Frequency>from time to time </Frequency>by Landlord for the Project. Any changes or additional listings in the directory shall be furnished (subject to availability of space) for the then Building Standard charge. </SIGNS>
43090337ed2409e0da24ee07e2adbe94
<TheExterior> Tenant agrees that all signs, awnings, protective gates, security devices and other installations visible from the exterior of the Premises shall be subject to Landlord's prior written approval, shall be subject to the prior approval of the <Org>Landmarks </Org><Landmarks>Preservation Commission </Landmarks>of the City of <USState>New <Org>York</Org></USState>, if required, and shall not interfere with or block either of the adjacent stores, provided, however, that Landlord shall not unreasonably withhold consent for signs that Tenant desires to install. Tenant agrees that any permitted signs, awnings, protective gates, security devices, and other installations shall be installed at Tenant’s sole cost and expense professionally prepared and dignified and subject to Landlord's prior written approval, which shall not be unreasonably withheld, delayed or conditioned, and subject to such reasonable rules and restrictions as Landlord <Frequency>from time to time </Frequency>may impose. Tenant shall submit to Landlord drawings of the proposed signs and other installations, showing the size, color, illumination and general appearance thereof, together with a statement of the manner in which the same are to be affixed to the Premises. Tenant shall not commence the installation of the proposed signs and other installations unless and until Landlord shall have approved the same in writing. . Tenant shall not install any neon sign. The aforesaid signs shall be used solely for the purpose of identifying Tenant's business. No changes shall be made in the signs and other installations without first obtaining Landlord's prior written consent thereto, which consent shall not be unreasonably withheld, delayed or conditioned. Tenant shall, at its own cost and expense, obtain and exhibit to Landlord such permits or certificates of approval as Tenant may be required to obtain from any and all City, State and other authorities having jurisdiction covering the erection, installation, maintenance or use of said signs or other installations, and Tenant shall maintain the said signs and other installations together with any appurtenances thereto in good order and condition and to the satisfaction of the Landlord and in accordance with any and all orders, regulations, requirements and rules of any public authorities having jurisdiction thereover. Landlord consents to Tenant’s Initial Signage described in annexed Exhibit D. </TheExterior>
54ddfc3e47f41af7e747b2bc439ea96b
```

```python
# Query retriever, should return parents (using MMR since that was set as search_type above)
retrieved_parent_docs = retriever.invoke(
    "what signs does Birch Street allow on their property?"
)
for chunk in retrieved_parent_docs:
    print(chunk.page_content)
    print(chunk.metadata["id"])
```

```output
21. SERVICES AND UTILITIES.
 <SERVICESANDUTILITIES>Landlord shall have no obligation to provide any utilities or services to the Premises other than passenger elevator service to the Premises. Tenant shall be solely responsible for and shall promptly pay all charges for water, electricity, or any other utility used or consumed in the Premises, including all costs associated with separately metering for the Premises. Tenant shall be responsible for repairs and maintenance to exit lighting, emergency lighting, and fire extinguishers for the Premises. Tenant is responsible for interior janitorial, pest control, and waste removal services. Landlord may at any time change the electrical utility provider for the Building. Tenant’s use of electrical, HVAC, or other services furnished by Landlord shall not exceed, either in voltage, rated capacity, use, or overall load, that which Landlord deems to be standard for the Building. In no event shall Landlord be liable for damages resulting from the failure to furnish any service, and any interruption or failure shall in no manner entitle Tenant to any remedies including abatement of Rent. If at any time during the Lease Term the Project has any type of card access system for the Parking Areas or the Building, Tenant shall purchase access cards for all occupants of the Premises from Landlord at a Building Standard charge and shall comply with Building Standard terms relating to access to the Parking Areas and the Building. </SERVICESANDUTILITIES>
22. SECURITY DEPOSIT.
 <SECURITYDEPOSIT>The Security Deposit shall be held by Landlord as security for Tenant's full and faithful performance of this Lease including the payment of Rent. Tenant grants Landlord a security interest in the Security Deposit. The Security Deposit may be commingled with other funds of Landlord and Landlord shall have no liability for payment of any interest on the Security Deposit. Landlord may apply the Security Deposit to the extent required to cure any default by Tenant. If Landlord so applies the Security Deposit, Tenant shall deliver to Landlord the amount necessary to replenish the Security Deposit to its original sum within <Deliver>five days </Deliver>after notice from Landlord. The Security Deposit shall not be deemed an advance payment of Rent or a measure of damages for any default by Tenant, nor shall it be a defense to any action that Landlord may bring against Tenant. </SECURITYDEPOSIT>
23. GOVERNMENTAL REGULATIONS.
 <GOVERNMENTALREGULATIONS>Tenant, at Tenant's sole cost and expense, shall promptly comply (and shall cause all subtenants and licensees to comply) with all laws, codes, and ordinances of governmental authorities, including the Americans with Disabilities Act of <AmericanswithDisabilitiesActDate>1990 </AmericanswithDisabilitiesActDate>as amended (the "ADA"), and all recorded covenants and restrictions affecting the Project, pertaining to Tenant, its conduct of business, and its use and occupancy of the Premises, including the performance of any work to the Common Areas required because of Tenant's specific use (as opposed to general office use) of the Premises or Alterations to the Premises made by Tenant. </GOVERNMENTALREGULATIONS>
24. SIGNS.
 <SIGNS>No signage shall be placed by Tenant on any portion of the Project. However, Tenant shall be permitted to place a sign bearing its name in a location approved by Landlord near the entrance to the Premises (at Tenant's cost) and will be furnished a single listing of its name in the Building's directory (at Landlord's cost), all in accordance with the criteria adopted <Frequency>from time to time </Frequency>by Landlord for the Project. Any changes or additional listings in the directory shall be furnished (subject to availability of space) for the then Building Standard charge. </SIGNS>
25. BROKER.
 <BROKER>Landlord and Tenant each represent and warrant that they have neither consulted nor negotiated with any broker or finder regarding the Premises, except the Landlord's Broker and Tenant's Broker. Tenant shall indemnify, defend, and hold Landlord harmless from and against any claims for commissions from any real estate broker other than Landlord's Broker and Tenant's Broker with whom Tenant has dealt in connection with this Lease. Landlord shall indemnify, defend, and hold Tenant harmless from and against payment of any leasing commission due Landlord's Broker and Tenant's Broker in connection with this Lease and any claims for commissions from any real estate broker other than Landlord's Broker and Tenant's Broker with whom Landlord has dealt in connection with this Lease. The terms of this article shall survive the expiration or earlier termination of this Lease. </BROKER>
26. END OF TERM.
 <ENDOFTERM>Tenant shall surrender the Premises to Landlord at the expiration or sooner termination of this Lease or Tenant's right of possession in good order and condition, broom-clean, except for reasonable wear and tear. All Alterations made by Landlord or Tenant to the Premises shall become Landlord's property on the expiration or sooner termination of the Lease Term. On the expiration or sooner termination of the Lease Term, Tenant, at its expense, shall remove from the Premises all of Tenant's personal property, all computer and telecommunications wiring, and all Alterations that Landlord designates by notice to Tenant. Tenant shall also repair any damage to the Premises caused by the removal. Any items of Tenant's property that shall remain in the Premises after the expiration or sooner termination of the Lease Term, may, at the option of Landlord and without notice, be deemed to have been abandoned, and in that case, those items may be retained by Landlord as its property to be disposed of by Landlord, without accountability or notice to Tenant or any other party, in the manner Landlord shall determine, at Tenant's expense. </ENDOFTERM>
27. ATTORNEYS' FEES.
 <ATTORNEYSFEES>Except as otherwise provided in this Lease, the prevailing party in any litigation or other dispute resolution proceeding, including arbitration, arising out of or in any manner based on or relating to this Lease, including tort actions and actions for injunctive, declaratory, and provisional relief, shall be entitled to recover from the losing party actual attorneys' fees and costs, including fees for litigating the entitlement to or amount of fees or costs owed under this provision, and fees in connection with bankruptcy, appellate, or collection proceedings. No person or entity other than Landlord or Tenant has any right to recover fees under this paragraph. In addition, if Landlord becomes a party to any suit or proceeding affecting the Premises or involving this Lease or Tenant's interest under this Lease, other than a suit between Landlord and Tenant, or if Landlord engages counsel to collect any of the amounts owed under this Lease, or to enforce performance of any of the agreements, conditions, covenants, provisions, or stipulations of this Lease, without commencing litigation, then the costs, expenses, and reasonable attorneys' fees and disbursements incurred by Landlord shall be paid to Landlord by Tenant. </ATTORNEYSFEES>
43090337ed2409e0da24ee07e2adbe94
<TenantsSoleCost> Tenant, at Tenant's sole cost and expense, shall be responsible for the removal and disposal of all of garbage, waste, and refuse from the Premises on a <Frequency>daily </Frequency>basis. Tenant shall cause all garbage, waste and refuse to be stored within the Premises until <Stored>thirty (30) minutes </Stored>before closing, except that Tenant shall be permitted, to the extent permitted by law, to place garbage outside the Premises after the time specified in the immediately preceding sentence for pick up prior to <PickUp>6:00 A.M. </PickUp>next following. Garbage shall be placed at the edge of the sidewalk in front of the Premises at the location furthest from he main entrance to the Building or such other location in front of the Building as may be specified by Landlord. </TenantsSoleCost>
<ItsSoleCost> Tenant, at its sole cost and expense, agrees to use all reasonable diligence in accordance with the best prevailing methods for the prevention and extermination of vermin, rats, and mice, mold, fungus, allergens, <Bacterium>bacteria </Bacterium>and all other similar conditions in the Premises. Tenant, at Tenant's expense, shall cause the Premises to be exterminated <Exterminated>from time to time </Exterminated>to the reasonable satisfaction of Landlord and shall employ licensed exterminating companies. Landlord shall not be responsible for any cleaning, waste removal, janitorial, or similar services for the Premises, and Tenant sha ll not be entitled to seek any abatement, setoff or credit from the Landlord in the event any conditions described in this Article are found to exist in the Premises. </ItsSoleCost>
42B. Sidewalk Use and Maintenance
<TheSidewalk> Tenant shall, at its sole cost and expense, keep the sidewalk in front of the Premises 18 inches into the street from the curb clean free of garbage, waste, refuse, excess water, snow, and ice and Tenant shall pay, as additional rent, any fine, cost, or expense caused by Tenant's failure to do so. In the event Tenant operates a sidewalk café, Tenant shall, at its sole cost and expense, maintain, repair, and replace as necessary, the sidewalk in front of the Premises and the metal trapdoor leading to the basement of the Premises, if any. Tenant shall post warning signs and cones on all sides of any side door when in use and attach a safety bar across any such door at all times when open. </TheSidewalk>
<Display> In no event shall Tenant use, or permit to be used, the space adjacent to or any other space outside of the Premises, for display, sale or any other similar undertaking; except [1] in the event of a legal and licensed “street fair” type program or [<Number>2</Number>] if the local zoning, Community Board [if applicable] and other municipal laws, rules and regulations, allow for sidewalk café use and, if such I s the case, said operation shall be in strict accordance with all of the aforesaid requirements and conditions. . In no event shall Tenant use, or permit to be used, any advertising medium and/or loud speaker and/or sound amplifier and/or radio or television broadcast which may be heard outside of the Premises or which does not comply with the reasonable rules and regulations of Landlord which then will be in effect. </Display>
42C. Store Front Maintenance
 <TheBulkheadAndSecurityGate> Tenant agrees to wash the storefront, including the bulkhead and security gate, from the top to the ground, monthly or more often as Landlord reasonably requests and make all repairs and replacements as and when deemed necessary by Landlord, to all windows and plate and ot her glass in or about the Premises and the security gate, if any. In case of any default by Tenant in maintaining the storefront as herein provided, Landlord may do so at its own expense and bill the cost thereof to Tenant as additional rent. </TheBulkheadAndSecurityGate>
42D. Music, Noise, and Vibration
4474c92ae7ccec9184ed2fef9f072734
```
