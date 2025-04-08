import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name, phone, gender, birthday, city, district, line_id, nickname } = req.body;

    // 验证LINE ID
    if (!line_id) {
      return res.status(400).json({ message: 'LINE ID 是必須的' });
    }

    // 检查LINE ID是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .eq('line_id', line_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 是 "没有找到结果" 的错误代码
      throw checkError;
    }

    if (existingUser) {
      return res.status(400).json({ message: '此 LINE 帳號已經註冊' });
    }

    // 1. 創建用戶認證
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('用戶創建失敗');
    }

    // 2. 創建客戶資料
    const { error: profileError } = await supabase
      .from('customers')
      .insert([
        {
          id: authData.user.id,
          name,
          nickname,
          email,
          phone,
          gender,
          birthday,
          city,
          district,
          line_id,
          membership_level: 'basic',
          points: 0,
          total_spent: 0,
          last_purchase_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      // 如果客戶資料創建失敗，刪除已創建的用戶
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return res.status(200).json({
      message: '註冊成功',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        line_id,
      },
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : '註冊失敗',
    });
  }
} 