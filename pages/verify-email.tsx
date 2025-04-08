import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { liff } from '@line/liff';

export default function VerifyEmail() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_LIFF_ID) {
          throw new Error('缺少必要的環境變數：NEXT_PUBLIC_LIFF_ID');
        }
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        if (!liff.isLoggedIn()) {
          liff.login();
        }
        setInitialized(true);
      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
        setError('系統初始化失敗，請重新整理頁面');
      }
    };
    initializeLiff();
  }, []);

  const handleCloseWindow = () => {
    if (liff.isInClient()) {
      liff.closeWindow();
    } else {
      // 如果不在LINE內瀏覽，則返回到主頁
      router.push('/');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                重新整理
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex justify-center">
              <div className="loader">載入中...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          註冊成功
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            <p className="text-center font-medium">我們已將驗證郵件發送到您的電子郵箱</p>
            <p className="text-center mt-2">請檢查您的郵箱並點擊驗證鏈接以完成註冊</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              驗證後，您將可以使用所有會員功能，包括查看交易歷史、獲取點數獎勵等。
            </p>
            
            <button
              onClick={handleCloseWindow}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              返回到LINE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 