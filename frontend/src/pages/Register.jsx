import { useState } from "react"
import axios from "axios"

export default function Register({ onSwitch }) {
  const [form, setForm] = useState({ email: "", username: "", password: "" })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await axios.post("http://localhost:8000/auth/register", form)
      setSuccess(true)
    } catch {
      setError("Kayıt başarısız, email zaten kullanılıyor olabilir")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Harcama Takip</h1>
        <p className="text-gray-500 text-sm mb-6">Yeni hesap oluştur</p>
        {success
          ? <div className="text-green-600 text-center">
              Kayıt başarılı!{" "}
              <span onClick={onSwitch} className="text-indigo-600 cursor-pointer underline">
                Giriş yap
              </span>
            </div>
          : <>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  placeholder="Kullanıcı adı"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Kayıt Ol
                </button>
              </form>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Zaten hesabın var mı?{" "}
                <span onClick={onSwitch} className="text-indigo-600 cursor-pointer hover:underline">
                  Giriş Yap
                </span>
              </p>
            </>
        }
      </div>
    </div>
  )
}