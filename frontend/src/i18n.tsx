import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Language = 'zh' | 'en'
const messages = {
  zh: { 'login.welcome': '欢迎回来。', 'login.description': '让每一封来信，都有自己的位置。', 'login.description2': '输入访问密钥，进入你的邮件工作空间。', 'login.accessKey': '访问密钥', 'login.placeholder': '输入你的访问密钥', 'login.remember': '记住密码', 'login.rememberHint': '仅保存在当前浏览器', 'login.enter': '进入工作空间', 'login.private': '私密访问 · 无需注册邮箱', 'login.product': '来信有序，', 'login.product2': '一切从简。', 'login.productDesc': '所有地址，一个收件箱。', 'login.productDesc2': '从第一封来信开始，让信息回归清晰。', 'login.required': '请输入访问密钥', 'login.invalid': '密钥不正确，请重新输入', 'login.unavailable': '服务暂时不可用，请稍后重试', 'login.network': '无法连接服务器，请检查网络后重试', 'language.switch': 'English', 'language.label': '切换语言', 'nav.all': '全部邮件', 'nav.unread': '未读邮件', 'workspace.newAddress': '新建收件地址', 'workspace.cleanup': '清理邮件', 'workspace.search': '搜索邮件…' },
  en: { 'login.welcome': 'Welcome back.', 'login.description': 'Give every message a place of its own.', 'login.description2': 'Enter your access key to open your mail workspace.', 'login.accessKey': 'Access key', 'login.placeholder': 'Enter your access key', 'login.remember': 'Remember key', 'login.rememberHint': 'Stored only in this browser', 'login.enter': 'Enter workspace', 'login.private': 'Private access · No email registration', 'login.product': 'Mail in order,', 'login.product2': 'everything simple.', 'login.productDesc': 'Every address, one inbox.', 'login.productDesc2': 'Bring clarity back to every message from the very first one.', 'login.required': 'Enter your access key', 'login.invalid': 'The key is incorrect. Please try again', 'login.unavailable': 'Service unavailable. Please try again later', 'login.network': 'Unable to connect. Check your network and try again', 'language.switch': '中文', 'language.label': 'Change language', 'nav.all': 'All mail', 'nav.unread': 'Unread', 'workspace.newAddress': 'New address', 'workspace.cleanup': 'Clean up mail', 'workspace.search': 'Search mail…' },
} as const
type Key = keyof typeof messages.zh
type I18nValue = { language: Language; setLanguage: (language: Language) => void; toggleLanguage: () => void; t: (key: Key) => string }
const I18nContext = createContext<I18nValue | null>(null)
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => { const saved = window.localStorage.getItem('mailpass-language'); return saved === 'en' || saved === 'zh' ? saved : (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en') })
  useEffect(() => { window.localStorage.setItem('mailpass-language', language); document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en' }, [language])
  const value = useMemo(() => ({ language, setLanguage, toggleLanguage: () => setLanguage((current) => current === 'zh' ? 'en' : 'zh'), t: (key: Key) => messages[language][key] }), [language])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
export function useI18n() { const value = useContext(I18nContext); if (!value) throw new Error('useI18n must be used within I18nProvider'); return value }
