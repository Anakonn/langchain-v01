---
translated: true
---

# Alpha Vantage

>[Alpha Vantage](https://www.alphavantage.co) Alpha Vantageは、強力で開発者に優しいデータAPIとスプレッドシートを通じて、リアルタイムおよび過去の金融市場データを提供しています。

`AlphaVantageAPIWrapper`を使用して、通貨為替レートを取得します。

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

`_get_time_series_daily`メソッドは、指定のグローバル株式の直近100件のデータについて、日付、始値、高値、安値、終値、出来高を返します。

```python
alpha_vantage._get_time_series_daily("IBM")
```

`_get_time_series_weekly`メソッドは、指定のグローバル株式の20年以上の過去データについて、週末の取引日、週間始値、週間高値、週間安値、週間終値、週間出来高を返します。

```python
alpha_vantage._get_time_series_weekly("IBM")
```

`_get_quote_endpoint`メソッドは、時系列APIの軽量な代替手段であり、指定のシンボルの最新の価格と出来高情報を返します。

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

`search_symbol`メソッドは、入力されたテキストに基づいて、シンボルと一致する企業情報のリストを返します。

```python
alpha_vantage.search_symbols("IB")
```

`_get_market_news_sentiment`メソッドは、指定の資産の最新および過去のマーケットニュースセンチメントを返します。

```python
alpha_vantage._get_market_news_sentiment("IBM")
```

`_get_top_gainers_losers`メソッドは、米国市場における上位20銘柄の値上がり、値下がり、および出来高上位銘柄を返します。

```python
alpha_vantage._get_top_gainers_losers()
```

ラッパーの`run`メソッドは、以下のパラメータを受け取ります: from_currency, to_currency。

指定の通貨ペアの為替レートを取得します。

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
