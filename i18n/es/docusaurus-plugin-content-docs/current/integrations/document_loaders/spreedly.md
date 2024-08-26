---
translated: true
---

# Spreedly

>[Spreedly](https://docs.spreedly.com/) es un servicio que le permite almacenar de forma segura las tarjetas de crédito y usarlas para realizar transacciones con cualquier número de pasarelas de pago y APIs de terceros. Lo hace proporcionando simultáneamente un servicio de tokenización/bóveda de tarjetas y un servicio de integración de pasarela y receptor. Los métodos de pago tokenizados por Spreedly se almacenan en `Spreedly`, lo que le permite almacenar de forma independiente una tarjeta y luego pasarla a diferentes puntos finales según los requisitos de su negocio.

Este cuaderno abarca cómo cargar datos desde la [API REST de Spreedly](https://docs.spreedly.com/reference/api/v1/) en un formato que se pueda ingerir en LangChain, junto con un ejemplo de uso para la vectorización.

Nota: este cuaderno asume que se han instalado los siguientes paquetes: `openai`, `chromadb` y `tiktoken`.

```python
import os

from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import SpreedlyLoader
```

La API de Spreedly requiere un token de acceso, que se puede encontrar dentro de la consola de administración de Spreedly.

Este cargador de documentos actualmente no admite la paginación ni el acceso a objetos más complejos que requieren parámetros adicionales. También requiere una opción `resource` que define qué objetos desea cargar.

Los siguientes recursos están disponibles:
- `gateways_options`: [Documentación](https://docs.spreedly.com/reference/api/v1/#list-supported-gateways)
- `gateways`: [Documentación](https://docs.spreedly.com/reference/api/v1/#list-created-gateways)
- `receivers_options`: [Documentación](https://docs.spreedly.com/reference/api/v1/#list-supported-receivers)
- `receivers`: [Documentación](https://docs.spreedly.com/reference/api/v1/#list-created-receivers)
- `payment_methods`: [Documentación](https://docs.spreedly.com/reference/api/v1/#list)
- `certificates`: [Documentación](https://docs.spreedly.com/reference/api/v1/#list-certificates)
- `transactions`: [Documentación](https://docs.spreedly.com/reference/api/v1/#list49)
- `environments`: [Documentación](https://docs.spreedly.com/reference/api/v1/#list-environments)

```python
spreedly_loader = SpreedlyLoader(
    os.environ["SPREEDLY_ACCESS_TOKEN"], "gateways_options"
)
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([spreedly_loader])
spreedly_doc_retriever = index.vectorstore.as_retriever()
```

```output
Using embedded DuckDB without persistence: data will be transient
```

```python
# Test the retriever
spreedly_doc_retriever.invoke("CRC")
```

```output
[Document(page_content='installment_grace_period_duration\nreference_data_code\ninvoice_number\ntax_management_indicator\noriginal_amount\ninvoice_amount\nvat_tax_rate\nmobile_remote_payment_type\ngratuity_amount\nmdd_field_1\nmdd_field_2\nmdd_field_3\nmdd_field_4\nmdd_field_5\nmdd_field_6\nmdd_field_7\nmdd_field_8\nmdd_field_9\nmdd_field_10\nmdd_field_11\nmdd_field_12\nmdd_field_13\nmdd_field_14\nmdd_field_15\nmdd_field_16\nmdd_field_17\nmdd_field_18\nmdd_field_19\nmdd_field_20\nsupported_countries: US\nAE\nBR\nCA\nCN\nDK\nFI\nFR\nDE\nIN\nJP\nMX\nNO\nSE\nGB\nSG\nLB\nPK\nsupported_cardtypes: visa\nmaster\namerican_express\ndiscover\ndiners_club\njcb\ndankort\nmaestro\nelo\nregions: asia_pacific\neurope\nlatin_america\nnorth_america\nhomepage: http://www.cybersource.com\ndisplay_api_url: https://ics2wsa.ic3.com/commerce/1.x/transactionProcessor\ncompany_name: CyberSource', metadata={'source': 'https://core.spreedly.com/v1/gateways_options.json'}),
 Document(page_content='BG\nBH\nBI\nBJ\nBM\nBN\nBO\nBR\nBS\nBT\nBW\nBY\nBZ\nCA\nCC\nCF\nCH\nCK\nCL\nCM\nCN\nCO\nCR\nCV\nCX\nCY\nCZ\nDE\nDJ\nDK\nDO\nDZ\nEC\nEE\nEG\nEH\nES\nET\nFI\nFJ\nFK\nFM\nFO\nFR\nGA\nGB\nGD\nGE\nGF\nGG\nGH\nGI\nGL\nGM\nGN\nGP\nGQ\nGR\nGT\nGU\nGW\nGY\nHK\nHM\nHN\nHR\nHT\nHU\nID\nIE\nIL\nIM\nIN\nIO\nIS\nIT\nJE\nJM\nJO\nJP\nKE\nKG\nKH\nKI\nKM\nKN\nKR\nKW\nKY\nKZ\nLA\nLC\nLI\nLK\nLS\nLT\nLU\nLV\nMA\nMC\nMD\nME\nMG\nMH\nMK\nML\nMN\nMO\nMP\nMQ\nMR\nMS\nMT\nMU\nMV\nMW\nMX\nMY\nMZ\nNA\nNC\nNE\nNF\nNG\nNI\nNL\nNO\nNP\nNR\nNU\nNZ\nOM\nPA\nPE\nPF\nPH\nPK\nPL\nPN\nPR\nPT\nPW\nPY\nQA\nRE\nRO\nRS\nRU\nRW\nSA\nSB\nSC\nSE\nSG\nSI\nSK\nSL\nSM\nSN\nST\nSV\nSZ\nTC\nTD\nTF\nTG\nTH\nTJ\nTK\nTM\nTO\nTR\nTT\nTV\nTW\nTZ\nUA\nUG\nUS\nUY\nUZ\nVA\nVC\nVE\nVI\nVN\nVU\nWF\nWS\nYE\nYT\nZA\nZM\nsupported_cardtypes: visa\nmaster\namerican_express\ndiscover\njcb\nmaestro\nelo\nnaranja\ncabal\nunionpay\nregions: asia_pacific\neurope\nmiddle_east\nnorth_america\nhomepage: http://worldpay.com\ndisplay_api_url: https://secure.worldpay.com/jsp/merchant/xml/paymentService.jsp\ncompany_name: WorldPay', metadata={'source': 'https://core.spreedly.com/v1/gateways_options.json'}),
 Document(page_content='gateway_specific_fields: receipt_email\nradar_session_id\nskip_radar_rules\napplication_fee\nstripe_account\nmetadata\nidempotency_key\nreason\nrefund_application_fee\nrefund_fee_amount\nreverse_transfer\naccount_id\ncustomer_id\nvalidate\nmake_default\ncancellation_reason\ncapture_method\nconfirm\nconfirmation_method\ncustomer\ndescription\nmoto\noff_session\non_behalf_of\npayment_method_types\nreturn_email\nreturn_url\nsave_payment_method\nsetup_future_usage\nstatement_descriptor\nstatement_descriptor_suffix\ntransfer_amount\ntransfer_destination\ntransfer_group\napplication_fee_amount\nrequest_three_d_secure\nerror_on_requires_action\nnetwork_transaction_id\nclaim_without_transaction_id\nfulfillment_date\nevent_type\nmodal_challenge\nidempotent_request\nmerchant_reference\ncustomer_reference\nshipping_address_zip\nshipping_from_zip\nshipping_amount\nline_items\nsupported_countries: AE\nAT\nAU\nBE\nBG\nBR\nCA\nCH\nCY\nCZ\nDE\nDK\nEE\nES\nFI\nFR\nGB\nGR\nHK\nHU\nIE\nIN\nIT\nJP\nLT\nLU\nLV\nMT\nMX\nMY\nNL\nNO\nNZ\nPL\nPT\nRO\nSE\nSG\nSI\nSK\nUS\nsupported_cardtypes: visa', metadata={'source': 'https://core.spreedly.com/v1/gateways_options.json'}),
 Document(page_content='mdd_field_57\nmdd_field_58\nmdd_field_59\nmdd_field_60\nmdd_field_61\nmdd_field_62\nmdd_field_63\nmdd_field_64\nmdd_field_65\nmdd_field_66\nmdd_field_67\nmdd_field_68\nmdd_field_69\nmdd_field_70\nmdd_field_71\nmdd_field_72\nmdd_field_73\nmdd_field_74\nmdd_field_75\nmdd_field_76\nmdd_field_77\nmdd_field_78\nmdd_field_79\nmdd_field_80\nmdd_field_81\nmdd_field_82\nmdd_field_83\nmdd_field_84\nmdd_field_85\nmdd_field_86\nmdd_field_87\nmdd_field_88\nmdd_field_89\nmdd_field_90\nmdd_field_91\nmdd_field_92\nmdd_field_93\nmdd_field_94\nmdd_field_95\nmdd_field_96\nmdd_field_97\nmdd_field_98\nmdd_field_99\nmdd_field_100\nsupported_countries: US\nAE\nBR\nCA\nCN\nDK\nFI\nFR\nDE\nIN\nJP\nMX\nNO\nSE\nGB\nSG\nLB\nPK\nsupported_cardtypes: visa\nmaster\namerican_express\ndiscover\ndiners_club\njcb\nmaestro\nelo\nunion_pay\ncartes_bancaires\nmada\nregions: asia_pacific\neurope\nlatin_america\nnorth_america\nhomepage: http://www.cybersource.com\ndisplay_api_url: https://api.cybersource.com\ncompany_name: CyberSource REST', metadata={'source': 'https://core.spreedly.com/v1/gateways_options.json'})]
```
