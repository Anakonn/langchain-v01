---
translated: true
---

# आधुनिक खजाना

>[आधुनिक खजाना](https://www.moderntreasury.com/) जटिल भुगतान संचालन को सरल बनाता है। यह उत्पादों और प्रक्रियाओं को चलाने के लिए एक एकीकृत मंच है जो धन को स्थानांतरित करता है।
>- बैंकों और भुगतान प्रणालियों से जुड़ें
>- लेनदेन और शेष राशि को रियल-टाइम में ट्रैक करें
>- पैमाने के लिए भुगतान संचालन को स्वचालित करें

यह नोटबुक कवर करता है कि `Modern Treasury REST API` से डेटा को कैसे लोड किया जाए ताकि इसे LangChain में इंजेस्ट किया जा सके, साथ ही वेक्टरीकरण के लिए उदाहरण उपयोग।

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import ModernTreasuryLoader
```

Modern Treasury API को एक संगठन ID और API कुंजी की आवश्यकता होती है, जिसे डेवलपर सेटिंग्स में Modern Treasury डैशबोर्ड में पाया जा सकता है।

यह दस्तावेज लोडर को भी एक `संसाधन` विकल्प की आवश्यकता होती है जो परिभाषित करता है कि आप कौन सा डेटा लोड करना चाहते हैं।

निम्नलिखित संसाधन उपलब्ध हैं:

`payment_orders` [दस्तावेज़](https://docs.moderntreasury.com/reference/payment-order-object)

`expected_payments` [दस्तावेज़](https://docs.moderntreasury.com/reference/expected-payment-object)

`returns` [दस्तावेज़](https://docs.moderntreasury.com/reference/return-object)

`incoming_payment_details` [दस्तावेज़](https://docs.moderntreasury.com/reference/incoming-payment-detail-object)

`counterparties` [दस्तावेज़](https://docs.moderntreasury.com/reference/counterparty-object)

`internal_accounts` [दस्तावेज़](https://docs.moderntreasury.com/reference/internal-account-object)

`external_accounts` [दस्तावेज़](https://docs.moderntreasury.com/reference/external-account-object)

`transactions` [दस्तावेज़](https://docs.moderntreasury.com/reference/transaction-object)

`ledgers` [दस्तावेज़](https://docs.moderntreasury.com/reference/ledger-object)

`ledger_accounts` [दस्तावेज़](https://docs.moderntreasury.com/reference/ledger-account-object)

`ledger_transactions` [दस्तावेज़](https://docs.moderntreasury.com/reference/ledger-transaction-object)

`events` [दस्तावेज़](https://docs.moderntreasury.com/reference/events)

`invoices` [दस्तावेज़](https://docs.moderntreasury.com/reference/invoices)

```python
modern_treasury_loader = ModernTreasuryLoader("payment_orders")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([modern_treasury_loader])
modern_treasury_doc_retriever = index.vectorstore.as_retriever()
```
