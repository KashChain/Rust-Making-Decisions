import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  AtSign,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Fingerprint,
  ExternalLink,
  FileCheck2,
  Film,
  Flag,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Layers3,
  Menu,
  MessageCircleQuestion,
  Network,
  Printer,
  RefreshCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  WalletCards,
  X,
} from 'lucide-react'

const checklistItems = [
  {
    title: 'Set up a Stacks wallet',
    detail: 'Choose a supported wallet and securely back up your recovery phrase.',
  },
  {
    title: 'Understand what BNS is',
    detail: 'Learn how BNSv2 names map to Stacks principals and structured records.',
  },
  {
    title: 'Choose a recognizable name',
    detail: 'Pick a durable name that is easy to read, say, and remember.',
  },
  {
    title: 'Check the name and namespace',
    detail: 'Check availability in .btc or another active namespace, including its pricing and renewal rules.',
  },
  {
    title: 'Register or manage your name',
    detail: 'Use a BNSv2-compatible interface and verify the transaction, namespace, fees, and resulting owner.',
  },
  {
    title: 'Set a primary name',
    detail: 'If you own multiple names, designate the one supported wallets and apps should display.',
  },
  {
    title: 'Review profile records',
    detail: 'Check supported zonefile records such as your bio, website, PFP, social links, and addresses.',
  },
  {
    title: 'Complete safety checks',
    detail: 'Verify the fully qualified name, owner, renewal status, links, and every wallet prompt.',
  },
]

const BNS_DOCS_URL = 'https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system'
const BNS_ARCHITECTURE_URL = 'https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system/architecture'
const BNS_CONCEPTS_URL = 'https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system/core-concepts'
const BNS_OPERATIONS_URL = 'https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system/operations'
const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT?.trim() || '/api/responses'
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim()

const communityPosts = [
  {
    id: '2078166411781025920',
    url: 'https://x.com/minimailist/status/2078166411781025920',
    signal: 'Marketplace question',
    context: 'A user asking how to sell a BNS name.',
  },
  {
    id: '2057152043077243027',
    url: 'https://x.com/one_bns/status/2057152043077243027',
    signal: 'Transaction support',
    context: 'A public response to users whose BNS name transactions failed.',
  },
  {
    id: '2073368800422969703',
    url: 'https://x.com/one_bns/status/2073368800422969703',
    signal: 'Identity expression',
    context: 'An example of profile imagery being used to distinguish BNS identities.',
  },
  {
    id: '2064248273985040646',
    url: 'https://x.com/Fitzp13Caroline/status/2064248273985040646',
    signal: 'Marketplace activity',
    context: 'A holder promoting a listed BNS name through a marketplace.',
  },
]

const redditPosts = [
  {
    url: 'https://www.reddit.com/r/stacks/comments/1rozcrr/big_conversation_shifting_to_btc_defi/',
    embedUrl: 'https://embed.reddit.com/r/stacks/comments/1rozcrr/big_conversation_shifting_to_btc_defi/',
    title: 'BNS expiration and renewal discussion on r/stacks',
    signal: 'Renewal clarity',
    context: 'March 2026 discussion includes a direct request for clearer expiration and renewal guidance.',
  },
  {
    url: 'https://www.reddit.com/r/stacks/comments/1h431rq/bns_register_a_name_not_working/',
    embedUrl: 'https://embed.reddit.com/r/stacks/comments/1h431rq/bns_register_a_name_not_working/',
    title: 'BNS registration help request on r/stacks',
    signal: 'Registration support',
    context: 'December 2024 report of repeated registration failures from an Xverse mobile user.',
  },
  {
    url: 'https://www.reddit.com/r/stacks/comments/1gbp8e3/claim_your_digital_identity_with_locker_locker/',
    embedUrl: 'https://embed.reddit.com/r/stacks/comments/1gbp8e3/claim_your_digital_identity_with_locker_locker/',
    title: 'BNS identity discussion on r/stacks',
    signal: 'Identity basics',
    context: 'October 2024 conversation asking whether a BNS identity works like an ID connected to a domain.',
  },
  {
    url: 'https://www.reddit.com/r/stacks/comments/1av0t88/bns_name_on_a_hardware_device/',
    embedUrl: 'https://embed.reddit.com/r/stacks/comments/1av0t88/bns_name_on_a_hardware_device/',
    title: 'BNS hardware wallet help request on r/stacks',
    signal: 'Transfer and custody',
    context: 'February 2024 request for help moving a BNS name from a hardware-backed address.',
  },
]

let xWidgetsPromise

function loadXWidgets() {
  if (window.twttr?.widgets) return Promise.resolve(window.twttr)
  if (xWidgetsPromise) return xWidgetsPromise

  xWidgetsPromise = new Promise((resolve, reject) => {
    const source = 'https://platform.twitter.com/widgets.js'
    const existingScript = document.querySelector(`script[src="${source}"]`)
    const script = existingScript || document.createElement('script')
    const timeout = window.setTimeout(() => reject(new Error('X embeds timed out')), 10000)

    function finish() {
      window.clearTimeout(timeout)
      if (window.twttr?.widgets) resolve(window.twttr)
      else reject(new Error('X widgets are unavailable'))
    }

    script.addEventListener('load', finish, { once: true })
    script.addEventListener('error', () => {
      window.clearTimeout(timeout)
      reject(new Error('X widgets could not be loaded'))
    }, { once: true })

    if (!existingScript) {
      script.src = source
      script.async = true
      script.charset = 'utf-8'
      document.head.appendChild(script)
    }
  }).catch((error) => {
    xWidgetsPromise = undefined
    throw error
  })

  return xWidgetsPromise
}

function trackEvent(eventName, properties = {}) {
  const payload = { eventName, properties, path: window.location.pathname, timestamp: new Date().toISOString() }

  window.dispatchEvent(new CustomEvent('bns-kit:event', { detail: payload }))
  window.plausible?.(eventName, { props: properties })
  window.umami?.track(eventName, properties)

  if (ANALYTICS_ENDPOINT) {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  }
}

async function submitFormResponse(form, responseType) {
  const fields = Object.fromEntries(new FormData(form).entries())
  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      responseType,
      submittedAt: new Date().toISOString(),
      ...fields,
    }),
  })

  if (!response.ok) throw new Error('Response could not be submitted')
  return 'live'
}

const guides = [
  {
    title: 'What is BNS?',
    eyebrow: 'Start here',
    time: '3 min',
    icon: Globe2,
    tone: 'orange',
    summary: 'A plain-language introduction to names, ownership, records, and primary-name display in BNSv2.',
    intro:
      'BNS is the live decentralized naming system on Stacks, secured by Bitcoin. A fully qualified name such as alice.btc can map to a Stacks principal and structured records.',
    points: [
      'A BNSv2 name is a SIP-009 NFT owned by a Stacks principal.',
      'Applications can resolve a name to its principal and zonefile records.',
      'One address can own multiple names and designate one primary name for display.',
    ],
    sections: [
      {
        title: 'The plain-language version',
        text: 'BNS lets people use a readable name in a namespace, such as alice.btc, instead of leading with a long address. The name can map to a Stacks principal, addresses, and structured records.',
      },
      {
        title: 'What makes a BNS name useful',
        text: 'A name is unique within its namespace, represented as an NFT, and associated with a zonefile. Ownership is enforced by BNSv2 smart-contract logic.',
      },
      {
        title: 'What a name does not prove',
        text: 'A readable name does not automatically prove reputation, endorsement, or safety. Verify important identities through trusted channels and always review wallet prompts before signing.',
      },
    ],
    tip: 'Verify the complete name and namespace, current owner, renewal status, and primary-name setting before relying on a record.',
    resourceLabel: 'Read the official BNS overview',
    resourceUrl: BNS_DOCS_URL,
  },
  {
    title: 'How to choose a good name',
    eyebrow: 'Identity',
    time: '4 min',
    icon: Sparkles,
    tone: 'cyan',
    summary: 'Choose the name and namespace together, then check clarity, rules, pricing, and renewal requirements.',
    intro:
      'A BNS identity is a fully qualified name: a label plus its namespace. The same label in .btc and another namespace represents two different names with potentially different rules.',
    points: [
      'Keep it easy to spell after hearing it once.',
      'Review whether the namespace is managed or unmanaged, including pricing and renewal requirements.',
      'Avoid lookalikes and names that imply an affiliation you cannot verify.',
    ],
    tip: 'Say the name aloud and ask someone else to type it. If they miss, simplify it.',
    resourceLabel: 'Review BNS concepts',
    resourceUrl: BNS_CONCEPTS_URL,
  },
  {
    title: 'Register or manage a BNSv2 name',
    eyebrow: 'Walkthrough',
    time: '6 min',
    icon: WalletCards,
    tone: 'green',
    summary: 'The current registration flow, ownership checks, record updates, renewals, and primary-name setting.',
    intro:
      'A BNSv2 registration transaction assigns the name to a Stacks principal after confirmation. Pricing, registration rules, and renewals depend on the namespace.',
    points: [
      'Check availability for the exact name and namespace before starting.',
      'Review the connected account, STX fee or manager-defined price, and every contract call.',
      'After confirmation, verify the owner, renewal status, zonefile records, and primary-name setting.',
    ],
    tip: 'Never share a seed phrase or private key with a site, helper, or clinic host.',
    resourceLabel: 'Review official BNSv2 operations',
    resourceUrl: BNS_OPERATIONS_URL,
  },
  {
    title: 'How people use BNS',
    eyebrow: 'Use cases',
    time: '4 min',
    icon: Users,
    tone: 'violet',
    summary: 'How primary names and zonefile records support wallets, profiles, payments, and applications.',
    intro:
      'BNSv2 names can resolve to a Stacks principal and structured zonefile data. Supported wallets and apps may also display the primary name selected by an address.',
    points: [
      'Zonefiles can include a bio, website, PFP, social links, and multi-chain addresses.',
      'Supported wallets and apps can display the one primary name designated by an address.',
      'Names are SIP-009 NFTs that can integrate with contracts and marketplaces.',
    ],
    tip: 'Consistency matters more than volume. Use one clear identity everywhere it is supported.',
    resourceLabel: 'Review BNSv2 zonefiles',
    resourceUrl: BNS_ARCHITECTURE_URL,
  },
  {
    title: 'Safety & impersonation checks',
    eyebrow: 'Protect yourself',
    time: '5 min',
    icon: ShieldCheck,
    tone: 'rose',
    summary: 'Verify the complete name, namespace, owner, records, renewal status, and wallet prompts.',
    intro:
      'A readable name can improve recognition, but it is not automatic proof of trust. Verify context before sending assets, signing, or following profile links.',
    points: [
      'Compare the complete name and namespace, especially lookalike letters and numbers.',
      'Check the current owner, zonefile records, primary-name status, and renewal status.',
      'Read wallet prompts and reject anything you do not understand.',
    ],
    tip: 'A familiar name is a clue, not a substitute for verification.',
    resourceLabel: 'Review BNSv2 operations',
    resourceUrl: BNS_OPERATIONS_URL,
  },
]

const identities = [
  {
    name: 'creator.btc',
    category: 'Creator',
    initials: 'CR',
    use: 'Illustrates a readable .btc name for a creator principal and its profile records.',
  },
  {
    name: 'stacksartist.btc',
    category: 'Creator',
    initials: 'SA',
    use: 'Shows how an artist could pair a primary name with website, PFP, and social records.',
  },
  {
    name: 'claritydev.btc',
    category: 'Builder',
    initials: 'CD',
    use: 'Shows a readable primary name that supported apps could display for a builder.',
  },
  {
    name: 'collector.btc',
    category: 'Collector',
    initials: 'CO',
    use: 'Illustrates a collector using one primary name across supported wallets and apps.',
  },
  {
    name: 'africaonstacks.btc',
    category: 'Community',
    initials: 'AS',
    use: 'Shows a community-facing name with website and social records in its zonefile.',
  },
  {
    name: 'builderdao.btc',
    category: 'Builder',
    initials: 'BD',
    use: 'Illustrates a group-facing label whose ownership still belongs to a Stacks principal.',
  },
  {
    name: 'bitcoinedu.btc',
    category: 'Educator',
    initials: 'BE',
    use: 'Shows an educator linking profile information and address records to one name.',
  },
  {
    name: 'nftcurator.btc',
    category: 'Collector',
    initials: 'NC',
    use: 'Illustrates a collector name that applications and smart contracts can integrate.',
  },
  {
    name: 'communitylead.btc',
    category: 'Community',
    initials: 'CL',
    use: 'Provides a readable reference name; organizer identity still requires independent verification.',
  },
  {
    name: 'openprofile.btc',
    category: 'Educator',
    initials: 'OP',
    use: 'Demonstrates the profile and address data that a BNSv2 zonefile can represent.',
  },
]

const categories = ['All', 'Creator', 'Builder', 'Collector', 'Educator', 'Community']

const categoryStyles = {
  Creator: 'bg-[#fff0e6] text-[#a34213] border-[#f2c5a7]',
  Builder: 'bg-[#e7f6f4] text-[#176d66] border-[#acd8d3]',
  Collector: 'bg-[#f0ecfb] text-[#66509b] border-[#d2c7ef]',
  Educator: 'bg-[#edf3dc] text-[#506b1f] border-[#cadba2]',
  Community: 'bg-[#fbecef] text-[#9a4353] border-[#efc2ca]',
}

const identitySignals = {
  Creator: 'Published work',
  Builder: 'Open source',
  Collector: 'Curation history',
  Educator: 'Learning record',
  Community: 'Public presence',
}

const grantOutputs = [
  { label: 'Public BNS Starter Hub', icon: Globe2 },
  { label: '5 short walkthrough videos', icon: Film },
  { label: '30–50 example identities', icon: Layers3 },
  { label: '2 live BNS clinics', icon: Video },
  { label: 'Public impact report', icon: FileCheck2 },
]

const projectStats = [
  ['10', 'example IDs'],
  ['05', 'field guides'],
  ['02', 'live clinics'],
]

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function SectionLabel({ number, children, dark = false }) {
  return (
    <div className={`section-label ${dark ? 'text-white/60' : 'text-[#6e7069]'}`}>
      <span>{number}</span>
      <span>{children}</span>
    </div>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navItems = [
    ['Checklist', 'checklist'],
    ['Guide', 'guide'],
    ['Signals', 'signals'],
    ['Gallery', 'gallery'],
    ['Clinic', 'clinic'],
    ['Feedback', 'feedback'],
  ]

  function navigate(id) {
    setMenuOpen(false)
    scrollToSection(id)
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#171814] bg-[#fbfaf5]/96 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <button
          className="group flex items-center gap-3.5 text-left"
          onClick={() => scrollToSection('top')}
          aria-label="Back to top"
        >
          <span className="brand-mark grid h-10 w-10 place-items-center bg-[#ff5b22] text-white transition-transform group-hover:-rotate-3">
            <AtSign size={23} strokeWidth={2.4} />
          </span>
          <span className="leading-tight text-[#171814]">
            <span className="block text-[13px] font-black uppercase">BNS / Identity Kit</span>
            <span className="mt-1 block font-mono text-[9px] font-bold uppercase text-[#777971]">Stacks public good / 01</span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navItems.map(([label, id]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className="font-mono text-[10px] font-bold uppercase text-[#666861] transition-colors hover:text-[#ff5b22]"
            >
              / {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 border-r border-[#d2d2ca] pr-4 xl:flex">
            <span className="h-2 w-2 bg-[#ff5b22] shadow-[0_0_0_3px_#ffe1d4]" />
            <span className="font-mono text-[9px] font-bold uppercase text-[#666861]">Interactive / preview</span>
          </div>
          <button className="btn-primary header-cta" onClick={() => navigate('checklist')}>
            Start / 01 <ArrowRight size={16} />
          </button>
          <button
            className="icon-button mobile-menu-trigger"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            title={menuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t-2 border-[#171814] bg-[#fbfaf5] px-5 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-2">
            {navItems.map(([label, id]) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className="border border-[#171814] bg-white px-4 py-3 text-left font-mono text-[10px] font-bold uppercase text-[#373934]"
              >
                / {label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

function normalizeHandle(handle) {
  return handle.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24) || 'yourname'
}

function getIdentityGlyphValues(seed) {
  const source = seed || 'bns'
  return Array.from({ length: 16 }, (_, index) => {
    const charCode = source.charCodeAt(index % source.length)
    return (charCode + index * 7) % 3
  })
}

function createIdentityCardDataUrl(handle, identityType) {
  const normalizedHandle = normalizeHandle(handle)
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const context = canvas.getContext('2d')
  const ink = '#171814'
  const orange = '#ff5b22'
  const mint = '#bfe5d7'
  const paper = '#fbfaf5'

  context.fillStyle = paper
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = ink
  context.fillRect(0, 0, canvas.width, 72)
  context.fillStyle = orange
  context.fillRect(0, 72, 18, canvas.height - 72)

  context.fillStyle = paper
  context.font = '700 20px "IBM Plex Mono", monospace'
  context.fillText('BNS / CHECKLIST COMPLETE', 58, 45)
  context.fillStyle = mint
  context.fillText('8 / 8 CHECKS COMPLETE', 870, 45)

  const glyphX = 64
  const glyphY = 156
  const glyphSize = 250
  context.fillStyle = orange
  context.fillRect(glyphX + 12, glyphY + 12, glyphSize, glyphSize)
  context.fillStyle = paper
  context.fillRect(glyphX, glyphY, glyphSize, glyphSize)
  context.strokeStyle = ink
  context.lineWidth = 6
  context.strokeRect(glyphX, glyphY, glyphSize, glyphSize)

  const values = getIdentityGlyphValues(normalizedHandle)
  const cellGap = 10
  const cellSize = 47
  values.forEach((value, index) => {
    const x = glyphX + 20 + (index % 4) * (cellSize + cellGap)
    const y = glyphY + 20 + Math.floor(index / 4) * (cellSize + cellGap)
    context.fillStyle = value === 1 ? ink : value === 2 ? mint : paper
    context.fillRect(x, y, cellSize, cellSize)
    context.strokeStyle = ink
    context.lineWidth = 3
    context.strokeRect(x, y, cellSize, cellSize)
  })

  context.fillStyle = ink
  context.font = '700 18px "IBM Plex Mono", monospace'
  context.fillText(`USE CASE / ${identityType.toUpperCase()} / EXAMPLE .BTC NAME`, 368, 200)
  let nameSize = 68
  context.font = `700 ${nameSize}px "Space Grotesk", sans-serif`
  while (context.measureText(`${normalizedHandle}.btc`).width > 760 && nameSize > 36) {
    nameSize -= 2
    context.font = `700 ${nameSize}px "Space Grotesk", sans-serif`
  }
  context.fillText(`${normalizedHandle}.btc`, 368, 290)

  context.fillStyle = orange
  context.fillRect(368, 330, 720, 8)
  context.fillStyle = ink
  context.font = '700 24px "IBM Plex Mono", monospace'
  context.fillText('VERIFY OWNER / RECORDS / RENEWAL STATUS ON-CHAIN', 368, 390)
  context.font = '500 18px "IBM Plex Mono", monospace'
  context.fillStyle = '#686a63'
  context.fillText('BNS Identity Starter Kit / Public preview', 64, 550)
  context.fillText('stacks community public good', 760, 550)

  return canvas.toDataURL('image/png')
}

function IdentityGlyph({ seed, inverted = false }) {
  const source = seed || 'bns'
  const values = getIdentityGlyphValues(source)

  return (
    <div className={`identity-glyph ${inverted ? 'identity-glyph-inverted' : ''}`} aria-hidden="true">
      {values.map((value, index) => (
        <span key={index} data-value={value} />
      ))}
    </div>
  )
}

function Hero({ completedCount, handle, setHandle, identityType, setIdentityType }) {
  const progress = Math.round((completedCount / checklistItems.length) * 100)
  const normalizedHandle = normalizeHandle(handle)

  return (
    <section id="top" className="hero-surface border-b-2 border-[#171814]">
      <div className="border-b border-[#c4d2cb] bg-[#e7f4ee]">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 overflow-hidden px-5 py-2.5 sm:px-8">
          <span className="shrink-0 font-mono text-[9px] font-bold uppercase text-[#254f43]">Public preview / BNS Starter Kit</span>
          <span className="hidden truncate font-mono text-[9px] font-bold uppercase text-[#62736d] sm:block">Human-readable / owner-controlled / on-chain</span>
          <span className="flex shrink-0 items-center gap-2 font-mono text-[9px] font-bold uppercase text-[#254f43]"><Network size={12} /> BNSv2 / primer</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-11 sm:px-8 sm:py-14 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:gap-16 lg:py-16">
        <div>
          <div className="mb-6 flex items-center gap-3 font-mono text-[10px] font-bold uppercase text-[#585b54]">
            <span className="grid h-6 w-6 place-items-center bg-[#171814] text-[9px] text-white">01</span>
            BNS identity onboarding
          </div>
          <h1 className="max-w-[700px] text-[42px] font-black leading-[0.98] text-[#171814] sm:text-[58px] lg:text-[66px]">
            Use a readable BNS name <span className="text-[#ff5b22]">instead of a long wallet address.</span>
          </h1>
          <p className="mt-6 max-w-[590px] text-[16px] leading-7 text-[#5c5f57] sm:text-[17px]">
            A beginner-friendly BNSv2 onboarding kit for understanding names, ownership, records, and primary-name display.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn-primary btn-large" onClick={() => { trackEvent('checklist_cta_clicked', { location: 'hero' }); scrollToSection('checklist') }}>
              Start checklist / 8 steps <ArrowRight size={17} />
            </button>
            <button className="btn-secondary btn-large" onClick={() => { trackEvent('clinic_cta_clicked', { location: 'hero' }); scrollToSection('clinic') }}>
              <CalendarDays size={17} /> Join live clinic
            </button>
          </div>

          <div className="mt-9 hidden grid-cols-3 border-y-2 border-[#171814] sm:grid">
            {projectStats.map(([value, label], index) => (
              <div key={label} className={`py-4 ${index > 0 ? 'border-l border-[#bfc1b9] pl-4 sm:pl-6' : ''}`}>
                <div className="font-mono text-lg font-bold text-[#171814]">{value}</div>
                <div className="mt-1 font-mono text-[9px] font-bold uppercase text-[#777a72]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="resolver-shell overflow-hidden border-2 border-[#171814] bg-[#f3f2eb] shadow-[10px_10px_0_#171814]">
          <div className="flex items-center justify-between bg-[#171814] px-4 py-3 text-white sm:px-5">
            <div className="flex items-center gap-2.5">
              <ScanLine size={16} className="text-[#ff7645]" />
              <span className="font-mono text-[9px] font-bold uppercase">BNSv2 resolution / preview</span>
            </div>
            <span className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase text-white/55">
              <span className="h-1.5 w-1.5 bg-[#58c58c]" /> interactive preview
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
              <label className="resolver-field">
                <span>Try a name in .btc</span>
                <span className="resolver-input-wrap">
                  <AtSign size={17} />
                  <input
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                    aria-label="Try a name in .btc"
                    spellCheck="false"
                  />
                  <strong>.btc</strong>
                </span>
              </label>
              <label className="resolver-field">
                <span>Use case</span>
                <select value={identityType} onChange={(event) => setIdentityType(event.target.value)} aria-label="Use case">
                  {categories.slice(1).map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
            </div>

            <div className="identity-output mt-4 bg-[#ff5b22] p-4 text-[#171814] sm:p-5">
              <div className="flex items-center justify-between gap-4 border-b border-[#171814]/25 pb-3">
                <span className="font-mono text-[9px] font-black uppercase">Example BNSv2 record</span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase"><Fingerprint size={13} /> Not a live record</span>
              </div>

              <div className="grid grid-cols-[72px_1fr] gap-4 py-5 sm:grid-cols-[82px_1fr] sm:gap-5">
                <IdentityGlyph seed={normalizedHandle} />
                <div className="min-w-0 self-center">
                  <p className="break-all text-[20px] font-black leading-tight sm:text-[31px]">{normalizedHandle}.btc</p>
                  <p className="mt-2 font-mono text-[9px] font-bold uppercase text-[#57220f]">Use case / {identityType} / example record</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[#171814]/25 pt-3 font-mono text-[9px] font-bold uppercase">
                <span className="shrink-0">{normalizedHandle}.btc</span>
                <ArrowRight size={13} className="shrink-0" />
                <span className="min-w-0 truncate opacity-65">SP3FBR2AGK6V2...H7Q</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button onClick={() => scrollToSection('checklist')} className="setup-status group text-left">
                <span className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[9px] font-bold uppercase text-[#6d7068]">Setup state / {completedCount} of 8</span>
                  <span className="font-mono text-[9px] font-bold text-[#171814]">{progress}%</span>
                </span>
                <span className="mt-2 block h-1.5 bg-[#d9d9d1]">
                  <span className="block h-full bg-[#171814] transition-all duration-500" style={{ width: `${progress}%` }} />
                </span>
              </button>
              <button onClick={() => { trackEvent('guide_opened', { guide: 'What is BNS?', location: 'resolver' }); scrollToSection('guide') }} className="resolver-guide-link">
                <BookOpen size={16} /> BNS / 3 min <ArrowRight size={14} />
              </button>
            </div>
            <p className="mt-3 font-mono text-[8px] font-bold uppercase text-[#8a8c84]">Interactive mockup / Not an availability, ownership, or resolution check</p>
          </div>
        </div>

        <div className="grid grid-cols-3 border-y-2 border-[#171814] sm:hidden">
          {projectStats.map(([value, label], index) => (
            <div key={label} className={`py-4 ${index > 0 ? 'border-l border-[#bfc1b9] pl-4' : ''}`}>
              <div className="font-mono text-lg font-bold text-[#171814]">{value}</div>
              <div className="mt-1 font-mono text-[9px] font-bold uppercase text-[#777a72]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Checklist({ checked, setChecked, identityHandle, identityType }) {
  const completedCount = checked.filter(Boolean).length
  const progress = Math.round((completedCount / checklistItems.length) * 100)
  const identityCardUrl = useMemo(
    () => completedCount === checklistItems.length ? createIdentityCardDataUrl(identityHandle, identityType) : '',
    [completedCount, identityHandle, identityType],
  )

  function toggleItem(index) {
    const completingStep = !checked[index]
    if (completingStep && completedCount === 0) trackEvent('checklist_started')
    if (completingStep && completedCount === checklistItems.length - 1) trackEvent('checklist_completed')
    trackEvent('checklist_step_toggled', { step: index + 1, completed: completingStep })
    setChecked((current) => current.map((value, itemIndex) => (itemIndex === index ? !value : value)))
  }

  return (
    <section id="checklist" className="scroll-mt-20 border-b-2 border-[#171814] bg-[#f1f1e9]">
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="print-only">
          <p>BNS / IDENTITY STARTER KIT</p>
          <h1>Eight steps to understanding and setting up a BNS identity</h1>
          <p>Official reference: {BNS_DOCS_URL}</p>
        </div>
        <SectionLabel number="01">Identity checklist</SectionLabel>
        <div className="checklist-layout mt-6 grid gap-10 lg:grid-cols-[0.34fr_0.66fr] lg:gap-16">
          <div className="checklist-summary lg:sticky lg:top-28 lg:self-start">
            <h2 className="section-title">Build your identity, one clear step at a time.</h2>
            <p className="section-copy mt-5">
              Work through the essentials in order. Your progress stays on this device so you can return when you are ready.
            </p>

            <div className="mt-8 border-y-2 border-[#171814] py-5" aria-label={`${progress}% checklist complete`} role="img">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase text-[#6f7269]">Onboarding state</p>
                  <p className="mt-2 text-5xl font-black leading-none text-[#171814]">
                    {String(completedCount).padStart(2, '0')}<span className="text-xl text-[#9a9c94]"> / 08</span>
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-[#ff5b22]">{progress}%</span>
              </div>
              <div className="mt-4 h-2 bg-[#d7d8cf]">
                <div className="h-full bg-[#ff5b22] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="font-mono text-[9px] font-bold uppercase text-[#73766e]">
                  {completedCount === 8 ? 'Identity checklist complete' : 'Local progress / saved'}
                </p>
                {completedCount > 0 && (
                  <button
                    onClick={() => setChecked(Array(checklistItems.length).fill(false))}
                    className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase text-[#a34213] hover:text-[#ff5b22]"
                    title="Reset checklist progress"
                  >
                    <RefreshCcw size={12} /> Reset
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 print:hidden">
              <button
                className="btn-secondary"
                onClick={() => {
                  trackEvent('checklist_printed', { completedSteps: completedCount })
                  window.print()
                }}
              >
                <Printer size={15} /> Print / save checklist
              </button>
              {completedCount === checklistItems.length && (
                <a
                  className="btn-primary"
                  href={identityCardUrl}
                  download={`${normalizeHandle(identityHandle)}-bns-checklist-complete.png`}
                  onClick={() => {
                    trackEvent('completion_card_downloaded', { identityType })
                  }}
                >
                  <Download size={15} /> Download completion card
                </a>
              )}
            </div>
            {completedCount === checklistItems.length && (
              <div className="readiness-card-preview mt-5 print:hidden">
                <div className="flex items-center justify-between gap-3 border-b border-white/20 px-4 py-3 font-mono text-[8px] font-bold uppercase">
                  <span>BNS / Checklist complete</span>
                  <span className="text-[#bfe5d7]">8 / 8 steps</span>
                </div>
                <div className="grid grid-cols-[64px_1fr] gap-4 p-4">
                  <IdentityGlyph seed={normalizeHandle(identityHandle)} inverted />
                  <div className="min-w-0 self-center">
                    <p className="break-all text-lg font-black leading-tight text-white">{normalizeHandle(identityHandle)}.btc</p>
                    <p className="mt-1 font-mono text-[8px] font-bold uppercase text-white/55">Use case / {identityType} / verify on-chain</p>
                  </div>
                </div>
              </div>
            )}
            {completedCount < checklistItems.length && (
              <p className="mt-3 font-mono text-[8px] font-bold uppercase text-[#85877f] print:hidden">
                Share card unlocks at 8 / 8
              </p>
            )}
          </div>

          <div className="checklist-grid grid gap-3 sm:grid-cols-2">
            {checklistItems.map((item, index) => {
              const complete = checked[index]
              return (
                <label
                  key={item.title}
                  className={`checklist-step group relative min-h-[164px] cursor-pointer border-2 p-5 transition-all duration-200 ${
                    complete
                      ? 'border-[#171814] bg-[#ffdfd0] shadow-[inset_5px_0_0_#ff5b22]'
                      : 'border-[#c7c8bf] bg-[#fbfaf5] hover:border-[#171814] hover:bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={complete}
                    onChange={() => toggleItem(index)}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-[10px] font-bold text-[#7c7f76]">STEP / {String(index + 1).padStart(2, '0')}</span>
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center border-2 transition-colors ${
                        complete
                          ? 'border-[#171814] bg-[#171814] text-white'
                          : 'border-[#aeb0a7] bg-white text-transparent group-hover:border-[#ff5b22]'
                      }`}
                    >
                      <Check size={16} strokeWidth={3} />
                    </span>
                  </div>
                  <h3 className={`mt-4 text-[15px] font-bold ${complete ? 'text-[#9d431b]' : 'text-[#252724]'}`}>{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-[#73756e]">{item.detail}</p>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function GuideModal({ guide, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!guide) return null
  const Icon = guide.icon

  return (
    <div
      className="fixed inset-0 z-50 grid items-start justify-items-center overflow-y-auto bg-[#171916]/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <div className="my-8 w-full max-w-[610px] overflow-hidden border-2 border-[#171814] bg-white shadow-[9px_9px_0_#171814]">
        <div className="flex items-start justify-between border-b border-[#e3e3dc] bg-[#f7f6f1] p-5 sm:p-7">
          <div className="flex items-center gap-4">
            <span className={`guide-icon guide-icon-${guide.tone}`}>
              <Icon size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-[#85877f]">{guide.eyebrow} · {guide.time}</p>
              <h2 id="guide-modal-title" className="mt-1 text-xl font-bold text-[#20221f]">{guide.title}</h2>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close guide" title="Close guide">
            <X size={19} />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          <p className="text-[15px] leading-7 text-[#555850]">{guide.intro}</p>
          {guide.sections && (
            <div className="mt-6 border-y-2 border-[#171814]">
              {guide.sections.map((section, index) => (
                <section key={section.title} className={`grid gap-2 py-4 sm:grid-cols-[38px_1fr] ${index > 0 ? 'border-t border-[#c9cac2]' : ''}`}>
                  <span className="font-mono text-[10px] font-bold text-[#ff5b22]">0{index + 1}</span>
                  <div>
                    <h3 className="text-sm font-black text-[#20221f]">{section.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-[#656861]">{section.text}</p>
                  </div>
                </section>
              ))}
            </div>
          )}
          <div className="mt-6 space-y-3">
            {guide.points.map((point, index) => (
              <div key={point} className="flex gap-3 border border-[#c9cac2] bg-[#fafaf7] p-4">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#183d3a] text-xs font-bold text-white">{index + 1}</span>
                <p className="text-sm leading-6 text-[#4f524b]">{point}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-l-[3px] border-[#ef5b25] bg-[#fff5ef] px-4 py-3.5">
            <p className="text-xs font-bold uppercase text-[#a34213]">Good practice</p>
            <p className="mt-1 text-sm leading-6 text-[#70432f]">{guide.tip}</p>
          </div>
          <a
            className="docs-source-link mt-5"
            href={guide.resourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('docs_clicked', { guide: guide.title, destination: guide.resourceUrl })}
          >
            {guide.resourceLabel} <ExternalLink size={15} />
          </a>
          <button className="btn-primary mt-7 w-full justify-center" onClick={onClose}>
            <Check size={16} /> Got it
          </button>
        </div>
      </div>
    </div>
  )
}

function Guides() {
  const [activeGuide, setActiveGuide] = useState(null)

  return (
    <section id="guide" className="scroll-mt-20 border-b-2 border-[#171814] bg-[#fbfaf5]">
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel number="02">Beginner guides</SectionLabel>
            <h2 className="section-title mt-6 max-w-[610px]">The BNS concepts worth knowing first.</h2>
          </div>
          <div className="max-w-[420px] md:text-right">
            <p className="section-copy">
              Short, practical previews for making your identity clear, useful, and safer to use.
            </p>
            <a
              className="docs-source-link mt-4 md:ml-auto"
              href={BNS_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('docs_clicked', { guide: 'guide-index', destination: BNS_DOCS_URL })}
            >
              Official Stacks BNS documentation <ExternalLink size={14} />
            </a>
            <p className="mt-3 font-mono text-[8px] font-bold uppercase text-[#85877f]">Wording reviewed against BNSv2 docs / July 2026</p>
          </div>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          {guides.map((guide, index) => {
            const Icon = guide.icon
            return (
              <article
                key={guide.title}
                className={`guide-card group flex min-h-[308px] flex-col border-2 border-[#171814] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_#171814] ${
                  index === 0 ? 'guide-card-featured lg:col-span-4' : 'lg:col-span-2'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`guide-icon guide-icon-${guide.tone}`}>
                      <Icon size={21} />
                    </span>
                    <span className="guide-card-index">0{index + 1}</span>
                  </div>
                  <span className="guide-time inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase text-[#777a72]">
                    <Clock3 size={13} /> {index === 0 ? 'Complete' : 'Preview'} / {guide.time}
                  </span>
                </div>
                <p className="guide-eyebrow mt-8 font-mono text-[9px] font-bold uppercase text-[#777a72]">Field guide / {guide.eyebrow}</p>
                <h3 className="guide-title mt-2 text-[21px] font-black leading-6 text-[#222421]">{guide.title}</h3>
                <p className="guide-summary mt-3 flex-1 text-sm leading-6 text-[#6b6e66]">{guide.summary}</p>
                <button
                  className="text-button mt-6"
                  onClick={() => {
                    trackEvent('guide_opened', { guide: guide.title, status: index === 0 ? 'complete' : 'preview' })
                    setActiveGuide(guide)
                  }}
                >
                  <BookOpen size={16} /> {index === 0 ? 'Read complete guide' : 'Preview guide'} <ArrowRight size={15} />
                </button>
              </article>
            )
          })}
        </div>
      </div>
      {activeGuide && <GuideModal guide={activeGuide} onClose={() => setActiveGuide(null)} />}
    </section>
  )
}

function XPostEmbed({ post }) {
  const embedHostRef = useRef(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const embedHost = embedHostRef.current
    let active = true

    setStatus('loading')
    loadXWidgets()
      .then((twttr) => {
        if (!active || !embedHost) return null
        embedHost.replaceChildren()
        return twttr.widgets.createTweet(post.id, embedHost, {
          align: 'center',
          conversation: 'none',
          dnt: true,
          theme: 'light',
        })
      })
      .then((embed) => {
        if (active) setStatus(embed ? 'loaded' : 'unavailable')
      })
      .catch(() => {
        if (active) setStatus('unavailable')
      })

    return () => {
      active = false
      embedHost?.replaceChildren()
    }
  }, [post.id])

  return (
    <article className="social-post-card x-post-card">
      <div className="social-post-header flex items-start justify-between gap-4 border-b-2 border-[#171814] bg-[#fbfaf5] px-4 py-3">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase text-[#ff5b22]">{post.signal}</p>
          <p className="mt-1 text-xs leading-5 text-[#666960]">{post.context}</p>
        </div>
        <AtSign size={18} className="mt-0.5 shrink-0 text-[#171814]" aria-hidden="true" />
      </div>

      <div className="x-embed-stage">
        <div ref={embedHostRef} className="x-embed-host" />
        {status === 'loading' && (
          <div className="x-embed-loading" role="status">
            <span className="x-embed-loading-mark"><AtSign size={20} /></span>
            <span>Loading post from X</span>
          </div>
        )}
        {status === 'unavailable' && (
          <div className="x-embed-unavailable" role="status">
            <p className="text-sm font-bold text-[#252724]">This X post could not be embedded.</p>
            <p className="mt-1 text-xs leading-5 text-[#74776f]">Your browser may be blocking third-party content.</p>
          </div>
        )}
      </div>

      <a
        className="social-post-footer flex items-center justify-between gap-3 border-t border-[#c8cac1] bg-white px-4 py-3 font-mono text-[9px] font-bold uppercase text-[#5e6159] transition-colors hover:text-[#ff5b22]"
        href={post.url}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent('community_post_opened', { signal: post.signal, postId: post.id })}
      >
        Open original on X <ExternalLink size={14} />
      </a>
    </article>
  )
}

function RedditPostEmbed({ post }) {
  const [status, setStatus] = useState('loading')

  return (
    <article className="social-post-card reddit-post-card">
      <div className="social-post-header flex items-start justify-between gap-4 border-b-2 border-[#171814] bg-[#fbfaf5] px-4 py-3">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase text-[#c94019]">{post.signal}</p>
          <p className="mt-1 text-xs leading-5 text-[#666960]">{post.context}</p>
        </div>
        <MessageCircleQuestion size={18} className="mt-0.5 shrink-0 text-[#c94019]" aria-hidden="true" />
      </div>

      <div className="reddit-embed-stage">
        {status === 'loading' && (
          <div className="reddit-embed-loading" role="status">
            <span className="reddit-embed-loading-mark"><MessageCircleQuestion size={20} /></span>
            <span>Loading post from Reddit</span>
          </div>
        )}
        <iframe
          className="reddit-embed-frame"
          src={post.embedUrl}
          title={post.title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setStatus('loaded')}
        />
      </div>

      <a
        className="social-post-footer flex items-center justify-between gap-3 border-t border-[#c8cac1] bg-white px-4 py-3 font-mono text-[9px] font-bold uppercase text-[#5e6159] transition-colors hover:text-[#c94019]"
        href={post.url}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent('community_post_opened', { network: 'reddit', signal: post.signal })}
      >
        Open discussion on Reddit <ExternalLink size={14} />
      </a>
    </article>
  )
}

function CommunitySignals() {
  return (
    <section id="signals" className="scroll-mt-20 border-b-2 border-[#171814] bg-[#f1f1e9]">
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <SectionLabel number="03">Community signals</SectionLabel>
            <h2 className="section-title mt-6 max-w-[650px]">Real questions and activity around BNS.</h2>
          </div>
          <div className="max-w-[470px] lg:text-right">
            <p className="section-copy">
              Public conversations surface the practical gaps: transactions, marketplace discovery, and making an identity recognizable.
            </p>
            <p className="mt-3 font-mono text-[8px] font-bold uppercase leading-5 text-[#85877f]">
              Posts rendered by X / inclusion is not an endorsement
            </p>
          </div>
        </div>

        <div className="x-post-grid mt-10 grid gap-5 lg:grid-cols-2">
          {communityPosts.map((post) => <XPostEmbed key={post.id} post={post} />)}
        </div>

        <div className="mt-16 border-t-2 border-[#171814] pt-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase text-[#c94019]">Reddit / r/stacks / 2024-2026</p>
              <h3 className="mt-3 text-2xl font-black text-[#171814] sm:text-3xl">Recent questions from longer discussions.</h3>
            </div>
            <p className="max-w-[460px] text-sm leading-6 text-[#6b6e66] md:text-right">
              These threads add context around renewals, failed registrations, identity concepts, and custody.
            </p>
          </div>

          <div className="reddit-post-grid mt-8 grid gap-5 lg:grid-cols-2">
            {redditPosts.map((post) => <RedditPostEmbed key={post.url} post={post} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All')
  const filteredIdentities = useMemo(
    () => identities.filter((identity) => activeCategory === 'All' || identity.category === activeCategory),
    [activeCategory],
  )

  return (
    <section id="gallery" className="scroll-mt-20 border-b-2 border-[#171814] bg-[#e7f4ee]">
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <SectionLabel number="04">Identity gallery</SectionLabel>
            <h2 className="section-title mt-6 max-w-[610px]">See what a BNS identity can represent.</h2>
            <p className="section-copy mt-4 max-w-[610px]">
              Fictional examples based on practical roles across the Stacks ecosystem.
            </p>
          </div>

          <div className="grid w-full max-w-[640px] grid-cols-3 gap-1 border-2 border-[#171814] bg-[#fbfaf5] p-1 sm:grid-cols-6" aria-label="Filter identity examples">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => { trackEvent('gallery_filter_changed', { category }); setActiveCategory(category) }}
                aria-pressed={activeCategory === category}
                className={`px-2 py-2 text-center font-mono text-[9px] font-bold uppercase transition-all ${
                  activeCategory === category
                    ? 'bg-[#171814] text-white'
                    : 'text-[#6a6c65] hover:bg-white hover:text-[#2d2f2b]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIdentities.map((identity) => (
            <article key={identity.name} className="identity-passport group min-h-[280px] border-2 border-[#171814] bg-[#fbfaf5] p-5 transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#171814] sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#bfc5bc] pb-5">
                <IdentityGlyph seed={identity.name} />
                <span className={`border px-2.5 py-1 font-mono text-[9px] font-bold uppercase ${categoryStyles[identity.category]}`}>
                  {identity.category}
                </span>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <h3 className="text-[20px] font-black text-[#171814]">{identity.name}</h3>
                <span className="border border-[#f0b69e] bg-[#fff0e6] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-[#a34213]">Example</span>
              </div>
              <p className="mt-2 text-[13px] leading-5 text-[#6e7069]">{identity.use}</p>
              <div className="mt-5 grid grid-cols-2 border-t border-[#bfc5bc] pt-3 font-mono text-[8px] font-bold uppercase text-[#777a72]">
                <span>Signal<strong className="mt-1 block text-[9px] text-[#171814]">{identitySignals[identity.category]}</strong></span>
                <span className="border-l border-[#bfc5bc] pl-4">Namespace<strong className="mt-1 block text-[9px] text-[#171814]">BNS / .BTC</strong></span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#85877f]">
          <MessageCircleQuestion size={15} className="mt-0.5 shrink-0" />
          These are illustrative placeholders, not claims of ownership or endorsements.
        </div>
      </div>
    </section>
  )
}

function Clinic() {
  const [status, setStatus] = useState('idle')
  const [submissionMode, setSubmissionMode] = useState('preview')
  const [formStartedAt] = useState(() => Date.now())

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const mode = await submitFormResponse(event.currentTarget, 'clinic-interest')
      trackEvent('clinic_interest_submitted', { mode })
      setSubmissionMode(mode)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="clinic" className="scroll-mt-20 border-b-2 border-[#171814] bg-[#171814] text-white">
      <div className="h-3 bg-[#ff5b22]" />
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-24">
        <div>
          <SectionLabel number="05" dark>Live clinic</SectionLabel>
          <h2 className="mt-6 max-w-[540px] text-4xl font-black leading-[1.05] sm:text-5xl">Join the first BNS Identity Clinic.</h2>
          <p className="mt-5 max-w-[520px] text-[16px] leading-7 text-white/68">
            Bring your questions. We will shape each session around the real points of confusion new BNS users face.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            <div className="border-2 border-[#ff5b22] bg-[#ff5b22] p-5 text-[#171814]">
              <div className="flex items-center justify-between">
                <GraduationCap size={22} />
                <span className="border border-[#171814]/30 px-2.5 py-1 font-mono text-[9px] font-bold uppercase">Session 01</span>
              </div>
              <h3 className="mt-5 text-base font-bold">Beginner clinic</h3>
              <p className="mt-2 text-sm leading-6 text-[#56200d]">Names, wallets, registration basics, and first safety checks.</p>
            </div>
            <div className="border-2 border-[#bfe5d7] bg-[#bfe5d7] p-5 text-[#171814]">
              <div className="flex items-center justify-between">
                <Sparkles size={22} />
                <span className="border border-[#171814]/30 px-2.5 py-1 font-mono text-[9px] font-bold uppercase">Session 02</span>
              </div>
              <h3 className="mt-5 text-base font-bold">Creator / collector clinic</h3>
              <p className="mt-2 text-sm leading-6 text-[#2a5145]">Identity continuity, public presence, and trusted recognition.</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-white/12 pt-6 text-sm text-white/60">
            <CalendarDays size={18} className="text-[#ff9c70]" /> Dates announced after the interest survey
          </div>
        </div>

        <div className="self-start border-2 border-white bg-[#fbfaf5] p-5 text-[#20221f] shadow-[10px_10px_0_#ff5b22] sm:p-7">
          {status === 'success' ? (
            <div className="grid min-h-[500px] place-items-center text-center">
              <div className="max-w-[390px]">
                <span className="mx-auto grid h-14 w-14 place-items-center bg-[#bfe5d7] text-[#171814]">
                  <CheckCircle2 size={29} />
                </span>
                <h3 className="mt-6 text-2xl font-bold">You are on the waitlist.</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#656861]">Thanks — your feedback helps shape the Starter Kit.</p>
                <p className="mt-3 font-mono text-[9px] font-bold uppercase text-[#85877f]">
                  {submissionMode === 'live' ? 'Response recorded / project dataset' : 'Preview mode / endpoint not connected'}
                </p>
                <button className="btn-secondary mt-7" onClick={() => setStatus('idle')}>
                  <RefreshCcw size={15} /> Add another response
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="formStartedAt" value={formStartedAt} />
              <label className="form-honeypot" aria-hidden="true">
                Website
                <input name="website" tabIndex="-1" autoComplete="off" />
              </label>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[#8a8c84]">Interest form</p>
                  <h3 className="mt-1 text-xl font-bold">Reserve your place</h3>
                </div>
                <span className="grid h-10 w-10 place-items-center bg-[#ff5b22] text-white">
                  <CalendarDays size={20} />
                </span>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="field-label">
                  Name
                  <input className="field-input" name="name" autoComplete="name" required placeholder="Your name" />
                </label>
                <label className="field-label">
                  X handle
                  <input className="field-input" name="xHandle" required placeholder="@handle" />
                </label>
              </div>
              <label className="field-label mt-5">
                Email <span className="font-medium text-[#999b94]">(optional)</span>
                <input className="field-input" type="email" name="email" autoComplete="email" placeholder="you@example.com" />
              </label>
              <label className="field-label mt-5">
                What confuses you most about BNS?
                <textarea
                  className="field-input min-h-[118px] resize-y py-3"
                  name="question"
                  required
                  placeholder="Tell us where you get stuck..."
                />
              </label>
              {status === 'error' && (
                <p className="mt-5 border-l-2 border-[#c4402a] bg-[#fdecea] px-3 py-2 text-xs font-semibold text-[#8d3021]" role="alert">
                  The response could not be sent. Please try again.
                </p>
              )}
              <button type="submit" className="btn-primary mt-6 w-full justify-center py-3.5" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending response...' : 'Join clinic waitlist'} <ArrowRight size={17} />
              </button>
              <p className="mt-3 text-center font-mono text-[8px] font-bold uppercase leading-5 text-[#8a8c84]">
                Stored privately for clinic coordination and project validation
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function ChoiceGroup({ legend, name, options, required = true }) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="choice-pill">
            <input className="peer sr-only" type="radio" name={name} value={option} required={required} />
            <span className="block border-2 border-[#c9cac1] bg-white px-3.5 py-2.5 font-mono text-[10px] font-bold uppercase text-[#686a63] transition-all peer-checked:border-[#171814] peer-checked:bg-[#171814] peer-checked:text-white hover:border-[#ff5b22]">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Feedback() {
  const [status, setStatus] = useState('idle')
  const [submissionMode, setSubmissionMode] = useState('preview')
  const [formStartedAt] = useState(() => Date.now())

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const mode = await submitFormResponse(event.currentTarget, 'bns-validation')
      trackEvent('feedback_submitted', { mode })
      setSubmissionMode(mode)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="feedback" className="scroll-mt-20 border-b-2 border-[#171814] bg-[#fbfaf5]">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.42fr_0.58fr] lg:gap-20 lg:py-24">
        <div>
          <SectionLabel number="06">Community signal</SectionLabel>
          <h2 className="section-title mt-6">Help us build the useful version.</h2>
          <p className="section-copy mt-5">
            Four quick answers will help prioritize the first guides and shape the two clinic sessions.
          </p>

          <div className="mt-8 space-y-4 border-t border-[#d7d7cf] pt-6">
            {[
              ['01', 'Prioritize real beginner questions'],
              ['02', 'Validate demand before launch'],
              ['03', 'Publish what the community learns'],
            ].map(([number, label]) => (
              <div key={number} className="flex items-center gap-4 text-sm font-semibold text-[#50524d]">
                <span className="font-mono text-[10px] font-bold text-[#ff5b22]">{number}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-[#171814] bg-[#f1f1e9] p-5 shadow-[8px_8px_0_#171814] sm:p-7">
          {status === 'success' ? (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div className="max-w-[390px]">
                <span className="mx-auto grid h-14 w-14 place-items-center bg-[#ff5b22] text-white">
                  <HeartHandshake size={28} />
                </span>
                <h3 className="mt-6 text-2xl font-bold text-[#222421]">Signal received.</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#686a63]">Thanks — your feedback helps shape the Starter Kit.</p>
                <p className="mt-3 font-mono text-[9px] font-bold uppercase text-[#85877f]">
                  {submissionMode === 'live' ? 'Response recorded / project dataset' : 'Preview mode / endpoint not connected'}
                </p>
                <button className="btn-secondary mt-7" onClick={() => setStatus('idle')}>
                  <RefreshCcw size={15} /> Submit another response
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <input type="hidden" name="formStartedAt" value={formStartedAt} />
              <label className="form-honeypot" aria-hidden="true">
                Website
                <input name="website" tabIndex="-1" autoComplete="off" />
              </label>
              <ChoiceGroup legend="Do you own a BNS name?" name="ownsBns" options={['Yes', 'No', 'Not sure']} />
              <label className="field-label">
                What is your biggest BNS question?
                <textarea
                  className="field-input min-h-[104px] resize-y py-3"
                  name="biggestQuestion"
                  required
                  placeholder="What would you like explained clearly?"
                />
              </label>
              <ChoiceGroup legend="Would you use a public BNS checklist?" name="useChecklist" options={['Yes', 'Maybe', 'No']} />
              <ChoiceGroup legend="Would you attend a live clinic?" name="attendClinic" options={['Yes', 'Maybe', 'No']} />
              {status === 'error' && (
                <p className="border-l-2 border-[#c4402a] bg-[#fdecea] px-3 py-2 text-xs font-semibold text-[#8d3021]" role="alert">
                  The response could not be sent. Please try again.
                </p>
              )}
              <button type="submit" className="btn-primary w-full justify-center py-3.5" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending response...' : 'Share feedback'} <MessageCircleQuestion size={17} />
              </button>
              <p className="text-center font-mono text-[8px] font-bold uppercase leading-5 text-[#8a8c84]">
                Stored privately for project validation and clinic planning
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function GrantPreview() {
  return (
    <section id="roadmap" className="border-b-2 border-[#171814] bg-[#f1f1e9]">
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-24">
        <SectionLabel number="07">Shipping plan</SectionLabel>
        <div className="mt-6 grid gap-12 lg:grid-cols-[0.45fr_0.55fr] lg:gap-20">
          <div>
            <h2 className="section-title">What we're shipping.</h2>
            <p className="section-copy mt-5">
              A focused public good combining self-serve identity onboarding, live community support, and measurable learning.
            </p>

            <div className="mt-8 grid gap-px overflow-hidden border-2 border-[#171814] bg-[#171814] sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {grantOutputs.map(({ label, icon: Icon }) => (
                <div key={label} className="flex min-h-[74px] items-center gap-3 bg-[#fafaf7] px-4 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center bg-[#ff5b22] text-white">
                    <Icon size={18} />
                  </span>
                  <span className="text-[13px] font-bold leading-5 text-[#444640]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] font-bold uppercase text-[#7d7f78]">Public release plan / 02 releases</p>
            <div className="mt-4 border-y-2 border-[#171814]">
              <div className="grid gap-4 border-b-2 border-[#171814] py-6 sm:grid-cols-[92px_1fr_auto] sm:items-center">
                <span className="text-4xl font-black text-[#ff5b22]">R1</span>
                <div>
                  <h3 className="text-lg font-bold text-[#232522]">Starter Kit Release</h3>
                  <p className="mt-1 text-sm leading-6 text-[#6e7069]">Publish the hub, five guide previews, first examples, and the initial clinic.</p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 border border-[#6e852f] bg-[#edf3dc] px-3 py-1.5 font-mono text-[9px] font-bold uppercase text-[#506b1f]">
                  <Flag size={12} /> Delivery
                </span>
              </div>
              <div className="grid gap-4 py-6 sm:grid-cols-[92px_1fr_auto] sm:items-center">
                <span className="text-4xl font-black text-[#ff5b22]">R2</span>
                <div>
                  <h3 className="text-lg font-bold text-[#232522]">Adoption and Impact Release</h3>
                  <p className="mt-1 text-sm leading-6 text-[#6e7069]">Run both clinics, expand the gallery, and publish usage, feedback, and lessons.</p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 border border-[#4b8a82] bg-[#e7f6f4] px-3 py-1.5 font-mono text-[9px] font-bold uppercase text-[#176d66]">
                  <FileCheck2 size={12} /> Impact
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-4 bg-[#171814] px-5 py-5 text-white sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold">Designed for public proof</p>
                <p className="mt-1 text-xs leading-5 text-white/58">Every deliverable will have a public link, metric, or recap.</p>
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-bold text-[#ff9c70] transition-colors hover:text-white" onClick={() => scrollToSection('top')}>
                Review the toolkit <ExternalLink size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#fbfaf5]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center bg-[#ff5b22] text-white">
            <AtSign size={18} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase text-[#565851]">BNS / Identity Starter Kit</p>
        </div>
        <p className="max-w-[520px] text-xs leading-5 text-[#85877f] md:text-right">
          Built in public for the Stacks community. Prepared for DeGrants Cohort 4.
        </p>
      </div>
    </footer>
  )
}

function App() {
  const [identityHandle, setIdentityHandle] = useState('yourname')
  const [identityType, setIdentityType] = useState('Creator')
  const [checked, setChecked] = useState(() => {
    try {
      const stored = window.localStorage.getItem('bns-checklist')
      const parsed = stored ? JSON.parse(stored) : null
      return Array.isArray(parsed) && parsed.length === checklistItems.length
        ? parsed
        : Array(checklistItems.length).fill(false)
    } catch {
      return Array(checklistItems.length).fill(false)
    }
  })

  useEffect(() => {
    window.localStorage.setItem('bns-checklist', JSON.stringify(checked))
  }, [checked])

  return (
    <div className="min-h-screen bg-[#f7f6f1]">
      <Header />
      <main>
        <Hero
          completedCount={checked.filter(Boolean).length}
          handle={identityHandle}
          setHandle={setIdentityHandle}
          identityType={identityType}
          setIdentityType={setIdentityType}
        />
        <Checklist
          checked={checked}
          setChecked={setChecked}
          identityHandle={identityHandle}
          identityType={identityType}
        />
        <Guides />
        <CommunitySignals />
        <Gallery />
        <Clinic />
        <Feedback />
        <GrantPreview />
      </main>
      <Footer />
    </div>
  )
}

export default App
