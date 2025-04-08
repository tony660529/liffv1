'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { liff } from '@line/liff';
import { cityDistrictMap } from '../utils/districtMap';
import { gender_type } from '../types/customer';

interface RegisterForm {
  name: string;
  nickname?: string;
  gender: gender_type;
  phone: string;
  email: string;
  birthday: string;
  city: string;
  district: string;
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    nickname: '',
    gender: 'male',
    phone: '',
    email: '',
    birthday: '',
    city: '',
    district: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [districts, setDistricts] = useState<string[]>([]);

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
      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
        setError('系統初始化失敗，請重新整理頁面');
      }
    };
    initializeLiff();
  }, []);

  const handleCityChange = (city: string) => {
    if (city === '') {
      setFormData({ ...formData, city: '', district: '' });
      setDistricts([]);
    } else {
      setFormData({ ...formData, city, district: '' });
      setDistricts(cityDistrictMap[city as keyof typeof cityDistrictMap] || []);
    }
  };

  const validateForm = (): boolean => {
    try {
      if (!formData.name || formData.name.length > 5) {
        throw new Error('姓名為必填且長度不能超過5個字');
      }
      if (formData.nickname && formData.nickname.length > 15) {
        throw new Error('暱稱長度不能超過15個字');
      }
      if (!/^09[0-9]{8}$/.test(formData.phone)) {
        throw new Error('手機號碼格式錯誤');
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        throw new Error('電子郵件格式錯誤');
      }
      if (!formData.birthday) {
        throw new Error('請選擇生日');
      }
      if (!formData.city || !formData.district) {
        throw new Error('請選擇完整的地址');
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('表單驗證失敗');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const profile = await liff.getProfile();
      const accessToken = await liff.getAccessToken();
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...formData,
          line_id: profile.userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '註冊失敗');
      }

      router.push('/verify-email');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('註冊過程中發生錯誤');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          註冊會員
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 姓名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={5}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 暱稱 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                暱稱
              </label>
              <div className="mt-1">
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  maxLength={15}
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                性別
              </label>
              <div className="mt-1 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as gender_type })}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">男</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as gender_type })}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">女</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as gender_type })}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">其他</span>
                </label>
              </div>
            </div>

            {/* 手機號碼 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                手機號碼
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  pattern="^09[0-9]{8}$"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 電子郵件 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 生日 */}
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                生日
              </label>
              <div className="mt-1">
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  required
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 縣市 */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                縣市
              </label>
              <div className="mt-1">
                <select
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">請選擇縣市</option>
                  {Object.keys(cityDistrictMap).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 鄉鎮市區 */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                鄉鎮市區
              </label>
              <div className="mt-1">
                <select
                  id="district"
                  name="district"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">請選擇鄉鎮市區</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 提交按鈕 */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? '註冊中...' : '註冊'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 