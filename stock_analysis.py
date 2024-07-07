import yfinance as yf
import requests
import pandas as pd

def get_stock_data(ticker):
    stock = yf.Ticker(ticker)
    hist = stock.history(period="5y")
    return hist

def get_earnings_data(ticker, api_key):
    url = f"https://financialmodelingprep.com/api/v3/earnings-surprises/{ticker}?apikey={api_key}"
    response = requests.get(url)
    print("API Response Content:", response.content)
    data = response.json()
    if isinstance(data, list) and all(isinstance(item, dict) for item in data):
        if not data:
            raise ValueError("The API response is empty.")
        return pd.DataFrame(data)
    else:
        raise ValueError("Unexpected response format. Please check the API response.")

def classify_earnings(earnings_data):
    results = []
    for index, row in earnings_data.iterrows():
        if row['actualEarningResult'] > row['estimatedEarning']:
            results.append("Beat")
        elif row['actualEarningResult'] < row['estimatedEarning']:
            results.append("Missed")
        else:
            results.append("Met")
    earnings_data['Result'] = results
    return earnings_data

def get_stock_prices_on_dates(stock_data, earnings_data):
    earnings_data['date'] = pd.to_datetime(earnings_data['date']).dt.tz_localize(None)
    stock_data.index = pd.to_datetime(stock_data.index).tz_localize(None)
    merged_data = pd.merge_asof(earnings_data.sort_values('date'), stock_data, left_on='date', right_index=True, direction='nearest')
    return merged_data

def get_stock_splits(ticker):
    stock = yf.Ticker(ticker)
    splits = stock.splits
    return splits

def calculate_target_price(earnings_with_prices, splits):
    # Calculate the cumulative product of the split ratios
    if not splits.empty:
        splits = splits.sort_index()
        split_factor = splits.prod()
    else:
        split_factor = 1  # No splits occurred
    
    # Calculate the average price and adjust by the split factor
    target_price = earnings_with_prices['Close'].mean() * split_factor
    return target_price

def format_earnings_data(earnings_with_prices, current_price, target_price):
    formatted_lines = []
    current_year = None
    current_quarter = None
    formatted_lines.append(f"Current Price: {current_price:.6f}")
    formatted_lines.append(f"Target Price: {target_price:.6f}")
    for index, row in earnings_with_prices.iterrows():
        date = pd.to_datetime(row['date'])
        year = date.year
        quarter = f"Q{date.quarter}"
        month_day = date.strftime("%m-%d")
        if year != current_year:
            current_year = year
            formatted_lines.append(f"Year: {year}")
        if quarter != current_quarter:
            current_quarter = quarter
            formatted_lines.append(f"\t{quarter}")
        formatted_line = f"\t\t{month_day}                {row['actualEarningResult']:+.2f}          {row['estimatedEarning']:+.5f}    {row['Result']}   {row['Close']:.6f}"
        formatted_lines.append(formatted_line)
    return "\n".join(formatted_lines)

def main():
    ticker = "RIOT"  # Example ticker
    api_key = "fuVGxxqcNJrnZiYL2dkZ7mmNrRZ2Aelh"  # Your actual API key

    stock_data = get_stock_data(ticker)
    try:
        earnings_data = get_earnings_data(ticker, api_key)
        classified_earnings = classify_earnings(earnings_data)
        classified_earnings.sort_values(by='date', ascending=False, inplace=True)
        earnings_with_prices = get_stock_prices_on_dates(stock_data, classified_earnings)
        earnings_with_prices.sort_values(by='date', ascending=False, inplace=True)
        
        splits = get_stock_splits(ticker)
        target_price = calculate_target_price(earnings_with_prices, splits)
        current_price = stock_data.iloc[-1]['Close']

        formatted_data = format_earnings_data(earnings_with_prices, current_price, target_price)
        print(formatted_data)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
