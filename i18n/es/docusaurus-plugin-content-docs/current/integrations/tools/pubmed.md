---
translated: true
---

# PubMed

>[PubMed®](https://pubmed.ncbi.nlm.nih.gov/) comprende más de 35 millones de citas de literatura biomédica de `MEDLINE`, revistas de ciencias de la vida y libros en línea. Las citas pueden incluir enlaces a contenido de texto completo de PubMed Central y sitios web de editoriales.

Este cuaderno analiza cómo usar `PubMed` como herramienta.

```python
%pip install xmltodict
```

```python
from langchain_community.tools.pubmed.tool import PubmedQueryRun
```

```python
tool = PubmedQueryRun()
```

```python
tool.invoke("What causes lung cancer?")
```

```output
'Published: 2024-02-10\nTitle: circEPB41L2 blocks the progression and metastasis in non-small cell lung cancer by promoting TRIP12-triggered PTBP1 ubiquitylation.\nCopyright Information: © 2024. The Author(s).\nSummary::\nThe metastasis of non-small cell lung cancer (NSCLC) is the leading death cause of NSCLC patients, which requires new biomarkers for precise diagnosis and treatment. Circular RNAs (circRNAs), the novel noncoding RNA, participate in the progression of various cancers as microRNA or protein sponges. We revealed the mechanism by which circEPB41L2 (hsa_circ_0077837) blocks the aerobic glycolysis, progression and metastasis of NSCLC through modulating protein metabolism of PTBP1 by the E3 ubiquitin ligase TRIP12. With ribosomal RNA-depleted RNA seq, 57 upregulated and 327 downregulated circRNAs were identified in LUAD tissues. circEPB41L2 was selected due to its dramatically reduced levels in NSCLC tissues and NSCLC cells. Interestingly, circEPB41L2 blocked glucose uptake, lactate production, NSCLC cell proliferation, migration and invasion in vitro and in vivo. Mechanistically, acting as a scaffold, circEPB41L2 bound to the RRM1 domain of the PTBP1 and the E3 ubiquitin ligase TRIP12 to promote TRIP12-mediated PTBP1 polyubiquitylation and degradation, which could be reversed by the HECT domain mutation of TRIP12 and circEPB41L2 depletion. As a result, circEPB41L2-induced PTBP1 inhibition led to PTBP1-induced PKM2 and Vimentin activation but PKM1 and E-cadherin inactivation. These findings highlight the circEPB41L2-dependent mechanism that modulates the "Warburg Effect" and EMT to inhibit NSCLC development and metastasis, offering an inhibitory target for NSCLC treatment.\n\nPublished: 2024-01-17\nTitle: The safety of seasonal influenza vaccination among adults prescribed immune checkpoint inhibitors: A self-controlled case series study using administrative data.\nCopyright Information: Copyright © 2024 The Author(s). Published by Elsevier Ltd.. All rights reserv'
```
