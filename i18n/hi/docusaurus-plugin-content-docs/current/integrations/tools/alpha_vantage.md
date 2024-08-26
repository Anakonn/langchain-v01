---
translated: true
---

# अल्फा वैंटेज

>[अल्फा वैंटेज](https://www.alphavantage.co) अल्फा वैंटेज एक सेट शक्तिशाली और डेवलपर-अनुकूल डेटा एपीआई और स्प्रेडशीट के माध्यम से वास्तविक समय और ऐतिहासिक वित्तीय बाजार डेटा प्रदान करता है।

`AlphaVantageAPIWrapper` का उपयोग करके मुद्रा विनिमय दरों को प्राप्त करें।

```python
import getpass
import os

os.environ["ALPHAVANTAGE_API_KEY"] = getpass.getpass()
```

```python
from langchain_community.utilities.alpha_vantage import AlphaVantageAPIWrapper
```

```python
alpha_vantage = AlphaVantageAPIWrapper()
alpha_vantage._get_exchange_rate("USD", "JPY")
```

```output
{'Realtime Currency Exchange Rate': {'1. From_Currency Code': 'USD',
  '2. From_Currency Name': 'United States Dollar',
  '3. To_Currency Code': 'JPY',
  '4. To_Currency Name': 'Japanese Yen',
  '5. Exchange Rate': '148.19900000',
  '6. Last Refreshed': '2023-11-30 21:43:02',
  '7. Time Zone': 'UTC',
  '8. Bid Price': '148.19590000',
  '9. Ask Price': '148.20420000'}}
```

`_get_time_series_daily` विधि 100 नवीनतम डेटा बिंदुओं को कवर करते हुए निर्दिष्ट वैश्विक इक्विटी के दिनांक, दैनिक खुला, दैनिक उच्च, दैनिक निम्न, दैनिक बंद और दैनिक वॉल्यूम को वापस देती है।

```python
alpha_vantage._get_time_series_daily("IBM")
```

`_get_time_series_weekly` विधि सप्ताह के अंतिम कारोबारी दिन, साप्ताहिक खुला, साप्ताहिक उच्च, साप्ताहिक निम्न, साप्ताहिक बंद और साप्ताहिक वॉल्यूम को वापस देती है, जो 20+ वर्षों के ऐतिहासिक डेटा को कवर करती है।

```python
alpha_vantage._get_time_series_weekly("IBM")
```

`_get_quote_endpoint` विधि समय श्रृंखला एपीआई का एक हल्का वैकल्पिक है और निर्दिष्ट प्रतीक के लिए नवीनतम मूल्य और वॉल्यूम जानकारी वापस देती है।

```python
alpha_vantage._get_quote_endpoint("IBM")
```

```output
{'Global Quote': {'01. symbol': 'IBM',
  '02. open': '156.9000',
  '03. high': '158.6000',
  '04. low': '156.8900',
  '05. price': '158.5400',
  '06. volume': '6640217',
  '07. latest trading day': '2023-11-30',
  '08. previous close': '156.4100',
  '09. change': '2.1300',
  '10. change percent': '1.3618%'}}
```

`search_symbol` विधि प्रविष्ट किए गए पाठ के आधार पर प्रतीकों और मैचिंग कंपनी जानकारी की एक सूची वापस देती है।

```python
alpha_vantage.search_symbols("IB")
```

`_get_market_news_sentiment` विधि किसी दिए गए संपत्ति के लिए लाइव और ऐतिहासिक बाजार समाचार भावना को वापस देती है।

```python
alpha_vantage._get_market_news_sentiment("IBM")
```

`_get_top_gainers_losers` विधि अमेरिकी बाजार में शीर्ष 20 लाभकारी, हानिकारक और सबसे सक्रिय स्टॉक को वापस देती है।

```python
alpha_vantage._get_top_gainers_losers()
```

रैपर का `run` विधि निम्नलिखित पैरामीटर लेता है: from_currency, to_currency।

यह दिए गए मुद्रा युग्म के लिए मुद्रा विनिमय दरों को प्राप्त करता है।

```python
alpha_vantage.run("USD", "JPY")
```

```output
{'1. From_Currency Code': 'USD',
 '2. From_Currency Name': 'United States Dollar',
 '3. To_Currency Code': 'JPY',
 '4. To_Currency Name': 'Japanese Yen',
 '5. Exchange Rate': '148.19900000',
 '6. Last Refreshed': '2023-11-30 21:43:02',
 '7. Time Zone': 'UTC',
 '8. Bid Price': '148.19590000',
 '9. Ask Price': '148.20420000'}
```
