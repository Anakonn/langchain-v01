---
translated: true
---

# BREEBS (오픈 지식)

>[BREEBS](https://www.breebs.com/)는 오픈 협업 지식 플랫폼입니다.
누구나 Google Drive 폴더에 저장된 PDF 파일을 기반으로 Breeb, 지식 캡슐을 만들 수 있습니다.
Breeb은 LLM/챗봇이 전문성을 높이고 환각을 줄이며 출처에 접근할 수 있도록 도와줍니다.
이면에서 Breebs는 여러 Retrieval Augmented Generation (RAG) 모델을 구현하여 각 반복 단계에서 유용한 맥락을 원활하게 제공합니다.

## 사용 가능한 Breebs 목록

전체 Breebs 목록, 키(breeb_key) 및 설명을 보려면 다음 링크를 참조하세요:
https://breebs.promptbreeders.com/web/listbreebs.
커뮤니티에서 이미 수십 개의 Breebs를 만들었으며 이는 자유롭게 사용할 수 있습니다. 유기 화학에서 신화학까지 다양한 전문 분야와 유혹 및 분산 금융에 대한 팁을 다룹니다.

## 새로운 Breeb 만들기

새로운 Breeb을 생성하려면 공개적으로 공유된 Google Drive 폴더에 PDF 파일을 컴파일하고 [BREEBS 웹사이트](https://www.breebs.com/)의 "Breeb 만들기" 버튼을 클릭하여 생성 프로세스를 시작하면 됩니다. 현재 최대 120개 파일, 총 1500만 자 문자 제한까지 포함할 수 있습니다.

## Retriever 예시

```python
from langchain_community.retrievers import BreebsRetriever
```

```python
breeb_key = "Parivoyage"
retriever = BreebsRetriever(breeb_key)
documents = retriever.invoke(
    "What are some unique, lesser-known spots to explore in Paris?"
)
print(documents)
```

```output
[Document(page_content="de poupées• Ladurée - Madeleine• Ladurée - rue Bonaparte• Flamant• Bonnichon Saint Germain• Dinh Van• Léonor Greyl• Berthillon• Christian Louboutin• Patrick Cox• Baby Dior• FNAC Musique - Bastille• FNAC - Saint Lazare• La guinguette pirate• Park Hyatt• Restaurant de Sers• Hilton Arc de Triomphe• Café Barge• Le Celadon• Le Drouant• La Perouse• Cigale Recamier• Ledoyen• Tanjia• Les Muses• Bistrot du Dôme• Avenue Foch• Fontaine Saint-Michel• Funiculaire de Montmartre• Promotrain - Place Blanche• Grand Palais• Hotel de Rohan• Hotel de Sully• Hotel des Ventes Drouot• Institut de France• Place des Invalides• Jardin d'acclimatation• Jardin des plantes Zoo• Jouffroy (passage)• Quartier de La Défense• La Villette (quartier)• Lac Inferieur du Bois de Boulogne• Les Catacombes de Paris• Place du Louvre• Rue Mazarine• Rue Monsieur le Prince11/12/2023 07:51Guide en pdf Paris à imprimer gratuitement.", metadata={'source': 'https://breebs.promptbreeders.com/breeb?breeb_key=Parivoyage&doc=44d78553-a&page=11', 'score': 1}), Document(page_content="cafés et des restaurants situésdans les rues adjacentes. Il y a également une cafétéria dans le musée, qui propose des collations, desboissons et des repas légers.À voir et visiter autour :Le Muséum d'histoire naturelle de Paris est situé àproximité de plusieurs autres attractions populaires, notamment le Jardin des Plantes, la Grande Mosquéede Paris, la Sorbonne et la Bibliothèque nationale de France.Comment y aller en bus, métro, train :LeMuséum d'histoire naturelle de Paris est facilement accessible en transports en commun. Les stations demétro les plus proches sont la station Censier-Daubenton sur la ligne 7 et la station Jussieu sur les lignes 7et 10. Le musée est également accessible en bus, avec plusieurs lignes desservant la zone, telles que leslignes 24, 57, 61, 63, 67, 89 et 91. En train, la gare la plus proche est la Gare d'Austerlitz, qui est desserviepar plusieurs lignes, notamment les lignes RER C et les trains intercités. Il est également possible de serendre au musée en utilisant les services de taxis ou de VTC.Plus d'informations :+33140795601,6 euros,Ouverture : 10h - 17h, Week end: 10h - 18h ; Fermeture: Mardi(haut de", metadata={'source': 'https://breebs.promptbreeders.com/breeb?breeb_key=Parivoyage&doc=44d78553-a&page=403', 'score': 1}), Document(page_content="Le célèbre Drugstore des Champs Elysées abrite de nombreuses boutiques dans un décor design. V ouspourrez y découvrir un espace beauté, des expositions éphémères, une pharmacie et des espaces réservésaux plaisirs des sens. A noter la façade d'architecture extérieure en verrePlus d'informations :+33144437900, https://www.publicisdrugstore.com/, Visite libre,(haut de page)• Place du Marché Sainte-CatherinePlace du Marché Sainte-Catherine, Paris, 75008, FR11/12/2023 07:51Guide en pdf Paris à imprimer gratuitement.\nPage 200 sur 545https://www.cityzeum.com/imprimer-pdf/parisUne place hors de l'agitation de la capitale, où vous découvrirez des petits restaurants au charme certaindans un cadre fort agréable. Terrasses au rendez-vous l'été! Un bar à magie pour couronner le toutPlus d'informations :15-30 euros,(haut de page)• Rue de Lappe, ParisRue de Lappe, Paris, FR", metadata={'source': 'https://breebs.promptbreeders.com/breeb?breeb_key=Parivoyage&doc=44d78553-a&page=198', 'score': 1}), Document(page_content="des visiteurs pour la nature etles attractions du parc. Les visiteurs peuvent prévoir de passer entre 1 à 2 heures pour visiter le parcL'accès au parc Montsouris est gratuit pour tous les visiteurs. Aucune réservation n'est nécessaire pourvisiter le parc. Cependant, pour les visites guidées, il est conseillé de réserver à l'avance pour garantir uneplace. Les tarifs pour les visites guidées peuvent varier en fonction de l'organisme proposant la visite.Ensomme, le parc Montsouris est un endroit magniﬁque pour se détendre et proﬁter de la nature en pleincœur de Paris. Avec ses attractions pittoresques, son paysage verdoyant et ses visites guidées, c'est unendroit idéal pour une sortie en famille ou entre amis.Plus d'informations :https://www.parisinfo.com/musee-monument-paris/71218/Parc-Montsouris,Gratuit,Ouverture : 8h/9h - 17h30/21h30(haut de page)• Parc des Buttes Chaumont", metadata={'source': 'https://breebs.promptbreeders.com/breeb?breeb_key=Parivoyage&doc=44d78553-a&page=291', 'score': 1})]
```
