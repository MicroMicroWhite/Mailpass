import { useEffect, useState } from 'react'
import { Check, LoaderCircle, Trash2 } from 'lucide-react'
import type { Notify } from '../lib'
import { Dialog } from './ui'

interface CleanupDialogProps {
  domains: string[]
  api: (path: string, options?: RequestInit) => Promise<any>
  onClose: () => void
  onCleaned: (deleted: number) => void
  notify: Notify
}

const DAY_OPTIONS = [3, 7, 14, 30, 90, 180, 365]

export default function CleanupDialog({ domains, api, onClose, onCleaned, notify }: CleanupDialogProps) {
  const [days, setDays] = useState(7)
  const [selectedDomains, setSelectedDomains] = useState<string[]>(domains)
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => { setSelectedDomains((current) => current.filter((domain) => domains.includes(domain)).length ? current.filter((domain) => domains.includes(domain)) : domains) }, [domains])
  useEffect(() => {
    if (!selectedDomains.length) { setCount(0); return }
    const controller = new AbortController()
    setLoading(true)
    api('/messages/cleanup/preview', { method: 'POST', body: JSON.stringify({ older_than_days: days, domains: selectedDomains }), signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setCount(result.count) })
      .catch(() => { if (!controller.signal.aborted) setCount(null) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [api, days, selectedDomains])

  function toggleDomain(domain: string) {
    setSelectedDomains((current) => current.includes(domain) ? current.filter((item) => item !== domain) : [...current, domain])
  }

  async function submit() {
    if (!selectedDomains.length || count === 0 || busy) return
    setBusy(true)
    try {
      const result = await api('/messages/cleanup', { method: 'POST', body: JSON.stringify({ older_than_days: days, domains: selectedDomains }) })
      onCleaned(result.deleted)
      notify(result.deleted ? `已清理 ${result.deleted} 封旧邮件` : '没有符合条件的旧邮件')
      onClose()
    } catch (error) { notify(error instanceof Error ? error.message : '清理失败，请稍后重试', true) }
    finally { setBusy(false) }
  }

  return <Dialog title="清理旧邮件" onClose={() => { if (!busy) onClose() }}>
    <p className="dialog-description">选择保留时间和收件域名，符合条件的邮件将被永久删除。</p>
    <label className="field-label" htmlFor="cleanup-days">删除</label>
    <select id="cleanup-days" className="select-input" value={days} onChange={(event) => setDays(Number(event.target.value))}>{DAY_OPTIONS.map((value) => <option key={value} value={value}>早于 {value} 天的邮件</option>)}</select>
    <div className="cleanup-domain-heading"><span className="field-label">收件域名</span><button type="button" className="text-button" onClick={() => setSelectedDomains(selectedDomains.length === domains.length ? [] : domains)}>{selectedDomains.length === domains.length ? '取消全选' : '全选'}</button></div>
    <div className="cleanup-domains" role="group" aria-label="选择要清理的收件域名">{domains.map((domain) => <label className="cleanup-domain-option" key={domain}><input type="checkbox" checked={selectedDomains.includes(domain)} onChange={() => toggleDomain(domain)} /><span className="cleanup-checkbox" aria-hidden="true"><Check size={12} /></span><span>{domain}</span></label>)}</div>
    <div className="cleanup-summary"><Trash2 size={16} /><span>{loading ? '正在统计符合条件的邮件…' : count === null ? '暂时无法统计，请稍后重试' : count ? `将删除 ${count} 封邮件` : '没有符合条件的邮件'}</span></div>
    <div className="dialog-actions"><button className="button button-secondary" onClick={onClose} disabled={busy}>取消</button><button className="button button-danger" onClick={submit} disabled={busy || loading || !selectedDomains.length || count === null || count === 0}>{busy ? <LoaderCircle size={16} className="spin" /> : <Trash2 size={16} />}确认清理</button></div>
  </Dialog>
}
