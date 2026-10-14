import { AtSign, ChevronDown, ChevronRight, Circle, Globe2, Inbox, LogOut, Mail, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { InboxData } from '../lib'
import { cn } from '../lib'
import { Brand, IconButton, ThemeButton } from './ui'

interface SidebarProps { data: InboxData; address: string; unreadOnly: boolean; onNavigate: (address?: string, unreadOnly?: boolean) => void; onLogout: () => void; dark: boolean; onToggleTheme: () => void; siteName: string }
const OLD_ADDRESS_DAYS = 3

export default function Sidebar({ data, address, unreadOnly, onNavigate, onLogout, dark, onToggleTheme, siteName }: SidebarProps) {
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({})
  const [showOld, setShowOld] = useState<Record<string, boolean>>({})
  const grouped = useMemo(() => {
    const cutoff = Date.now() - OLD_ADDRESS_DAYS * 24 * 60 * 60 * 1000
    const groups = new Map<string, { recent: InboxData['addresses']; old: InboxData['addresses'] }>()
    for (const item of data.addresses) {
      const domain = item.domain || item.address.split('@').pop() || '未知域名'
      const group = groups.get(domain) || { recent: [], old: [] }
      const timestamp = new Date(item.last_received_at).getTime()
      ;(Number.isFinite(timestamp) && timestamp >= cutoff ? group.recent : group.old).push(item)
      groups.set(domain, group)
    }
    return [...groups.entries()].sort(([, left], [, right]) => {
      const leftDate = left.recent[0]?.last_received_at || left.old[0]?.last_received_at || ''
      const rightDate = right.recent[0]?.last_received_at || right.old[0]?.last_received_at || ''
      return rightDate.localeCompare(leftDate)
    })
  }, [data.addresses])

  useEffect(() => {
    if (!address) return
    const domain = address.split('@').pop() || ''
    setExpandedDomains((current) => current[domain] === false ? { ...current, [domain]: true } : current)
    const item = data.addresses.find((entry) => entry.address === address)
    if (item && Date.now() - new Date(item.last_received_at).getTime() >= OLD_ADDRESS_DAYS * 24 * 60 * 60 * 1000) {
      setShowOld((current) => current[domain] === false ? { ...current, [domain]: true } : current)
    }
  }, [address, data.addresses])

  function renderAddress(item: InboxData['addresses'][number]) {
    return <button key={item.address} className={cn('address-item', address === item.address && 'active')} title={item.address} aria-current={address === item.address ? 'page' : undefined} onClick={() => onNavigate(item.address, false)}><AtSign size={16} /><span className="address-item-text"><strong>{item.address.split('@')[0]}</strong><span>@{item.domain || item.address.split('@')[1]}</span></span>{item.unread > 0 ? <span className="address-count">{item.unread}</span> : <ChevronRight size={13} className="address-chevron" />}</button>
  }

  return <div className="sidebar-content">
    <div className="sidebar-brand"><Brand name={siteName} /></div>
    <div className="workspace-label"><span className="workspace-avatar">白</span><div><strong>我的工作空间</strong><span>个人邮箱管理</span></div><ShieldCheck size={16} /></div>
    <div className="sidebar-section-label">工作空间</div>
    <nav className="sidebar-nav" aria-label="邮箱导航">
      <button className={cn('nav-item', !address && !unreadOnly && 'active')} aria-current={!address && !unreadOnly ? 'page' : undefined} onClick={() => onNavigate('', false)}><Inbox size={18} /><span>全部邮件</span><span className="nav-count">{data.allTotal}</span></button>
      <button className={cn('nav-item', unreadOnly && 'active')} aria-current={unreadOnly ? 'page' : undefined} onClick={() => onNavigate('', true)}><Mail size={18} /><span>未读邮件</span>{data.unread > 0 && <span className="nav-count">{data.unread}</span>}</button>
    </nav>
    <div className="sidebar-section-label address-label"><span>收件地址</span><span>{data.addresses.length}</span></div>
    <nav className="address-list" aria-label="按收件地址筛选">
      {grouped.length ? grouped.map(([domain, group]) => {
        const isExpanded = expandedDomains[domain] !== false
        const isOldExpanded = showOld[domain] === true
        return <section className="address-domain-group" key={domain}>
          <button className="address-domain-heading" aria-expanded={isExpanded} onClick={() => setExpandedDomains((current) => ({ ...current, [domain]: !isExpanded }))}><span><Globe2 size={13} /><strong>{domain}</strong></span><span className="address-domain-meta"><small>{group.recent.length + group.old.length}</small>{isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</span></button>
          {isExpanded && <div className="address-domain-items">{group.recent.map(renderAddress)}{group.old.length > 0 && <><button className="old-address-toggle" aria-expanded={isOldExpanded} onClick={() => setShowOld((current) => ({ ...current, [domain]: !isOldExpanded }))}><span>3 天前的地址</span><span>{group.old.length}<ChevronDown size={13} className={cn(isOldExpanded && 'rotate-180')} /></span></button>{isOldExpanded && group.old.map(renderAddress)}</>}</div>}
        </section>
      }) : <p className="sidebar-empty">收到来信后，地址会<br />自动整理在这里。</p>}
    </nav>
    <div className="sidebar-bottom">
      <div className="domain-panel"><div><Globe2 size={15} /><span>接收域名</span><span className={cn('status-dot', !data.config.smtp_enabled && 'status-muted')} /></div>{data.config.domains?.map((domain) => <span className="domain-name" key={domain}>{domain}</span>)}{!data.config.domains?.length && <span className="domain-name">等待连接…</span>}<p><Circle size={5} fill="currentColor" />任意地址，无需预先创建</p></div>
      <div className="sidebar-account"><span className="account-avatar">{siteName.slice(0, 1).toUpperCase()}</span><div><strong>{siteName}</strong><span>Personal inbox</span></div><ThemeButton dark={dark} onToggle={onToggleTheme} /><IconButton label="退出登录" onClick={onLogout}><LogOut size={16} /></IconButton></div>
    </div>
  </div>
}
