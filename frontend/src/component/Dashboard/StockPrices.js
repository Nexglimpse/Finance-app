import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, message, Input } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Text } = Typography;

const StockPrices = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allStocks, setAllStocks] = useState([]); // To store all stocks, including searched ones

  // Finnhub API Key
  const API_KEY = 'd08eih1r01qh1ecbnbggd08eih1r01qh1ecbnbh0';

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' }
  ];

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const stockPromises = popularStocks.map(async (stock) => {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`
          );
          const data = await response.json();
          
          // Check if we got valid data
          if (!data || data.error) {
            console.error('Invalid data received for', stock.symbol, data);
            message.error(`Failed to fetch data for ${stock.symbol}`);
            return {
              ...stock,
              price: 'N/A',
              change: 'N/A',
              changePercent: 'N/A'
            };
          }

          return {
            ...stock,
            price: data.c.toFixed(2), // Current price
            change: (data.c - data.pc).toFixed(2), // Change from previous close
            changePercent: ((data.c - data.pc) / data.pc * 100).toFixed(2) // Percentage change
          };
        });

        const stockData = await Promise.all(stockPromises);
        setStocks(stockData);
        setAllStocks(stockData); // Initialize allStocks with popular stocks
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        message.error('Failed to fetch stock data');
        setLoading(false);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleStockClick = async (stock) => {
    setSelectedStock(stock);
    try {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 24 * 60 * 60; // Last 24 hours
      const resolution = '5'; // 5 minute intervals

      console.log('Fetching stock history with URL:', `https://finnhub.io/api/v1/stock/candle?symbol=${stock.symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`);
      console.log('Request parameters:', { symbol: stock.symbol, resolution, from, to });

      const response = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${stock.symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
      );
      const data = await response.json();

      console.log('API response:', data);
      
      if (!data || data.error || data.s === 'no_data') {
        message.error('Failed to fetch stock history');
        return;
      }

      // Format candle data
      const formattedData = data.t.map((timestamp, index) => ({
        time: new Date(timestamp * 1000).toLocaleTimeString(),
        price: parseFloat(data.c[index]).toFixed(2)
      })).slice(-20); // Get last 20 data points
      
      setStockData(formattedData);
    } catch (error) {
      console.error('Error fetching stock history:', error);
      message.error('Failed to fetch stock history');
    }
  };

  const handleSearch = async (value) => {
    if (!value) return;
  
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${value.toUpperCase()}&token=${API_KEY}`
      );
      const data = await response.json();
  
      if (!data || data.error || data.c === 0) {
        message.error('Stock not found or no data available.');
        return;
      }
  
      const newStock = {
        symbol: value.toUpperCase(),
        name: value.toUpperCase(),
        price: data.c.toFixed(2),
        change: (data.c - data.pc).toFixed(2),
        changePercent: ((data.c - data.pc) / data.pc * 100).toFixed(2)
      };
  
      // Avoid duplicates
      const exists = allStocks.some(s => s.symbol === newStock.symbol);
      if (!exists) {
        setAllStocks(prev => [newStock, ...prev]);
        setStocks(prev => [newStock, ...prev]); // Update displayed stocks
      } else {
        message.info('Stock already listed.');
      }
  
    } catch (error) {
      console.error('Error searching stock:', error);
      message.error('Error fetching stock data');
    }
  };
  

  return (
    <Card title="Real-Time Stock Prices" className="stock-prices-card">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="stock-prices-container">
          <Input.Search
            placeholder="Search for a stock"
            enterButton="Search"
            size="large"
            onSearch={handleSearch}
            style={{ marginBottom: '20px' }}
          />
          <List
            dataSource={stocks}
            renderItem={(stock) => (
              <List.Item
                className="stock-item"
                onClick={() => handleStockClick(stock)}
                style={{ cursor: 'pointer' }}
              >
                <List.Item.Meta
                  title={<Text strong>{stock.symbol}</Text>}
                  description={stock.name}
                />
                <div>
                  <Text strong>{stock.price === 'N/A' ? 'N/A' : `$${stock.price}`}</Text>
                  {stock.change !== 'N/A' && (
                    <Text
                      style={{
                        marginLeft: '8px',
                        color: parseFloat(stock.change) >= 0 ? '#52c41a' : '#f5222d'
                      }}
                    >
                      {stock.change > 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
                    </Text>
                  )}
                </div>
              </List.Item>
            )}
          />
          {selectedStock && stockData.length > 0 && (
            <div className="stock-chart">
            

              <ResponsiveContainer width="100%" height={200}>
                
                <LineChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1890ff"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default StockPrices;