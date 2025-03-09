// 認証関連の関数を集めたユーティリティ

// APIのベースURL
const API_URL = 'http://localhost:8000';

// ユーザー登録（サインアップ）
export async function signUp(name: string, email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '登録に失敗しました');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'サインアップ中にエラーが発生しました');
  }
}

// ログイン処理
export async function login(email: string, password: string) {
  try {
    // FormDataを使用（FastAPIのOAuth2PasswordRequestFormと互換性を持たせる）
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPIはusernameというパラメータ名を期待
    formData.append('password', password);

    const response = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'ログインに失敗しました');
    }

    const data = await response.json();

    // トークンをローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'ログイン中にエラーが発生しました');
  }
}

// ログアウト処理
export async function logout() {
  try {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('認証情報がありません');
    }

    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'ログアウトに失敗しました');
    }

    // ローカルストレージからトークンを削除
    localStorage.removeItem('token');

    return true;
  } catch (error: any) {
    throw new Error(error.message || 'ログアウト中にエラーが発生しました');
  }
}

// 認証状態チェック
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

// 現在のユーザー情報取得
export async function getCurrentUser() {
  try {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // 認証エラーの場合はトークンを削除
      if (response.status === 401) {
        localStorage.removeItem('token');
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}
