import Header from '../componets/Header';
import Footer from '../componets/Footer';
import { useState, useEffect } from 'react';
import Task from '../componets/task';

// 定義任務數據類型
interface TaskData {
  id: number;
  Content: string;
  Worker_Id: number;
  Work_in_progress: boolean;
  To_review: boolean;
  Done: boolean;
  Created_At: string;
  Updated_At: string;
}

// 主要內容區域的核心邏輯
const MainContent = () => {

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<TaskData[] | null>(null);

    const fetchHomePageData = async () => {
        try {
            setLoading(true);
            // 指定完整的後端API URL
            const response = await fetch('http://localhost:3001/api/home-page');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Fetched data:', result); // 調試日誌
            setData(result);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // 數據獲取邏輯
        fetchHomePageData();  
    }, []);

    return (
      <main className="main-content">
        <section className="hero-section">
          {/* 主要展示區域 */}
          {loading && <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading tasks...</p>}
          {data && data.length > 0 && data.map((task: TaskData) => (
            <Task key={task.id} task={task} />
          ))}
          {data && data.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No tasks found</p>
              <p style={{ color: '#666' }}>請確保後端API服務器正在運行</p>
            </div>
          )}
        </section>
        <section className="features-section">
          {/* 功能介紹區域 */}
        </section>
      </main>
    );
  };

function HomePage() {
    return (
      <div className="homepage">
        <Header />
        <MainContent />
        <Footer />
      </div>
    );
  }