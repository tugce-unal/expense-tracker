import { useState, useEffect } from "react"
import axios from "axios"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const CATEGORIES = ["Yemek", "Ulaşım", "Fatura", "Eğlence", "Sağlık", "Diğer"]
const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"]

export default function Dashboard({ token, onLogout }) {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({ total: 0, by_category: {} })
  const [form, setForm] = useState({ title: "", amount: "", category: "Yemek", date: "" })
  const [error, setError] = useState("")

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetchExpenses()
    fetchSummary()
  }, [])

  async function fetchExpenses() {
    const res = await axios.get("http://localhost:8000/expenses/", { headers })
    setExpenses(res.data)
  }

  async function fetchSummary() {
    const res = await axios.get("http://localhost:8000/expenses/summary", { headers })
    setSummary(res.data)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title || !form.amount) return
    try {
      await axios.post("http://localhost:8000/expenses/", {
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date ? form.date : null
      }, { headers })
      setForm({ title: "", amount: "", category: "Yemek", date: "" })
      setError("")
      fetchExpenses()
      fetchSummary()
    } catch {
      setError("Harcama eklenemedi")
    }
  }

  async function handleDelete(id) {
    await axios.delete(`http://localhost:8000/expenses/${id}`, { headers })
    fetchExpenses()
    fetchSummary()
  }

  async function handleExport() {
    const res = await axios.get("http://localhost:8000/expenses/export/csv", {
      headers, responseType: "blob"
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement("a")
    a.href = url
    a.download = "harcamalar.csv"
    a.click()
  }

  const chartData = Object.entries(summary.by_category).map(([name, value]) => ({ name, value }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Harcama Takip</h1>
          <div className="flex gap-3">
            <button onClick={handleExport} className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
              CSV İndir
            </button>
            <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-500 transition">
              Çıkış
            </button>
          </div>
        </div>

        {/* Özet kartları */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Toplam Harcama</p>
            <p className="text-3xl font-bold text-indigo-600">₺{summary.total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Toplam İşlem</p>
            <p className="text-3xl font-bold text-gray-800">{expenses.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Harcama ekle formu */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Harcama Ekle</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                placeholder="Başlık"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Miktar (₺)"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Ekle
              </button>
            </form>
          </div>

          {/* Pasta grafik */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Kategoriye Göre</h2>
            {chartData.length > 0
              ? <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `₺${v.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              : <p className="text-gray-400 text-sm text-center mt-16">Henüz harcama yok</p>
            }
          </div>
        </div>

        {/* Harcama listesi */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Harcama Geçmişi</h2>
          </div>
          {expenses.length === 0
            ? <p className="text-gray-400 text-sm text-center py-8">Henüz harcama eklenmedi</p>
            : expenses.map(e => (
                <div key={e.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition">
                  <div>
                    <p className="text-gray-800 font-medium">{e.title}</p>
                    <p className="text-gray-400 text-xs">{e.category} · {e.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-indigo-600 font-semibold">₺{e.amount.toFixed(2)}</p>
                    <button onClick={() => handleDelete(e.id)} className="text-red-400 text-xs hover:underline">
                      Sil
                    </button>
                  </div>
                </div>
              ))
          }
        </div>

      </div>
    </div>
  )
}