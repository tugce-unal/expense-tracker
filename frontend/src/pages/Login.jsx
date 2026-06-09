import { useState } from "react"
import axios from "axios"

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        email, username: "", password
      })
      localStorage.setItem("token", res.data.access_token)
      onLogin(res.data.access_token)
    } catch {
      setError("Hatalı email veya şifre")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Harcama Takip</h1>
        <p className="text-gray-500 text-sm mb-6">Hesabına giriş yap</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Giriş Yap
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Hesabın yok mu?{" "}
          <span onClick={onSwitch} className="text-indigo-600 cursor-pointer hover:underline">
            Kayıt Ol
          </span>
        </p>
      </div>
    </div>
  )
}