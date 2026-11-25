// Interações do site de entrega (sem dependências).
;(() => {
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]

  // Revelação ao rolar
  const io =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.dataset.reveal = 'in'
                io.unobserve(e.target)
              }
            }),
          { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
        )
      : null
  $$('.reveal').forEach((el) => (io ? io.observe(el) : (el.dataset.reveal = 'in')))

  // Menu do celular
  const menuBtn = $('#menu-btn')
  const menu = $('#mobile-menu')
  const setMenu = (open) => {
    menu.hidden = !open
    menuBtn.setAttribute('aria-expanded', String(open))
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
  }
  menuBtn?.addEventListener('click', () => setMenu(menu.hidden))
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)))

  // Link ativo no menu
  const navLinks = $$('[data-nav]')
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean)
  const markNav = () => {
    const y = window.scrollY + 140
    let current = null
    sections.forEach((s) => s.offsetTop <= y && (current = s.id))
    navLinks.forEach((a) => {
      const on = a.getAttribute('href') === '#' + current
      a.classList.toggle('text-white', on)
      a.classList.toggle('bg-white/5', on)
      a.classList.toggle('text-muted', !on)
    })
  }
  addEventListener('scroll', markNav, { passive: true })
  markNav()

  // Filtro de logos
  const tabOn = ['bg-white', 'text-ink']
  const tabOff = ['text-muted', 'hover:bg-white/5', 'hover:text-white']
  $$('[data-filter]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter
      $$('[data-filter]').forEach((b) => {
        const on = b === btn
        b.setAttribute('aria-selected', String(on))
        tabOn.forEach((c) => b.classList.toggle(c, on))
        tabOff.forEach((c) => b.classList.toggle(c, !on))
        const n = b.querySelector('span')
        n.classList.toggle('text-ink/60', on)
        n.classList.toggle('text-faint', !on)
      })
      $$('#logo-grid [data-group]').forEach((card) => (card.hidden = f !== '*' && card.dataset.group !== f))
    }),
  )

  // Filtro dos posts do Instagram
  $$('[data-post-filter]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const f = btn.dataset.postFilter
      $$('[data-post-filter]').forEach((b) => {
        const on = b === btn
        b.setAttribute('aria-selected', String(on))
        tabOn.forEach((c) => b.classList.toggle(c, on))
        tabOff.forEach((c) => b.classList.toggle(c, !on))
        const n = b.querySelector('span')
        n.classList.toggle('text-ink/60', on)
        n.classList.toggle('text-faint', !on)
      })
      $$('#post-grid [data-post-group]').forEach((card) => {
        card.hidden = f !== '*' && card.dataset.postGroup !== f
        if (!card.hidden) card.dataset.reveal = 'in'
      })
    }),
  )

  // Fundo das prévias (escuro / claro)
  const DARK = ['bg-[#0d0c0a]', 'bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_65%)]']
  const LIGHT = ['bg-[#F4F2EE]', 'bg-[radial-gradient(circle_at_50%_40%,#ffffff,transparent_70%)]']
  $$('[data-bg]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const light = btn.dataset.bg === 'light'
      $$('[data-bg]').forEach((b) => {
        const on = b === btn
        b.setAttribute('aria-checked', String(on))
        tabOn.forEach((c) => b.classList.toggle(c, on))
        b.classList.toggle('text-muted', !on)
        b.classList.toggle('hover:text-white', !on)
      })
      $$('.logo-bg').forEach((el) => {
        DARK.forEach((c) => el.classList.toggle(c, !light))
        LIGHT.forEach((c) => el.classList.toggle(c, light))
      })
    }),
  )

  // Ampliar imagens
  const box = $('#lightbox')
  const boxImg = $('#lightbox-img')
  const boxCap = $('#lightbox-cap')
  let opener = null
  const closeBox = () => {
    box.hidden = true
    document.body.style.overflow = ''
    opener?.focus()
  }
  $$('[data-lightbox]').forEach((btn) =>
    btn.addEventListener('click', () => {
      opener = btn
      boxImg.src = btn.dataset.lightbox
      boxImg.alt = btn.dataset.caption
      boxCap.textContent = btn.dataset.caption
      box.hidden = false
      document.body.style.overflow = 'hidden'
      $('#lightbox-close').focus()
    }),
  )
  $('#lightbox-close').addEventListener('click', closeBox)
  box.addEventListener('click', (e) => e.target === box && closeBox())
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !box.hidden) closeBox()
    if (e.key === 'Escape' && !menu.hidden) setMenu(false)
  })

  // Acordeões da central de downloads
  $$('[data-acc]').forEach((card) => {
    const btn = $('button[aria-expanded]', card)
    const panel = document.getElementById(btn.getAttribute('aria-controls'))
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true'
      btn.setAttribute('aria-expanded', String(open))
      panel.hidden = !open
      $('svg.lucide-chevron-down', btn).classList.toggle('rotate-180', open)
      card.classList.toggle('border-white/15', open)
    })
  })

  // Copiar códigos de cor
  const toast = $('#toast')
  let toastTimer
  const say = (msg) => {
    toast.textContent = msg
    toast.hidden = false
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.hidden = true), 1800)
  }
  $$('[data-copy]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy)
        say(`Copiado: ${btn.dataset.copy}`)
      } catch {
        say('Não foi possível copiar. Selecione o código e copie.')
      }
    }),
  )

  // Passos de "Como usar"
  const showStep = (i, focus) => {
    $$('[data-step]').forEach((b) => {
      const on = Number(b.dataset.step) === i
      on ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')
      b.classList.toggle('border-accent/40', on)
      b.classList.toggle('bg-accent/[0.06]', on)
      b.classList.toggle('border-transparent', !on)
      b.classList.toggle('hover:bg-white/[0.03]', !on)
      const dot = $('.step-dot', b)
      dot.classList.toggle('border-accent', on)
      dot.classList.toggle('text-accent', on)
      dot.classList.toggle('border-white/10', !on)
      dot.classList.toggle('text-faint', !on)
      const label = $('.step-label', b)
      label.classList.toggle('text-white', on)
      label.classList.toggle('text-muted', !on)
    })
    $$('[data-step-panel]').forEach((p) => (p.hidden = Number(p.dataset.stepPanel) !== i))
    if (focus && innerWidth < 1024) $('#step-panels').scrollIntoView({ block: 'start' })
  }
  $$('[data-step]').forEach((b) => b.addEventListener('click', () => showStep(Number(b.dataset.step), true)))
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => showStep(Number(b.dataset.go), true)))

  // Dispositivos no passo 3
  $$('[data-device]').forEach((btn) =>
    btn.addEventListener('click', () => {
      $$('[data-device]').forEach((b) => {
        const on = b === btn
        b.setAttribute('aria-selected', String(on))
        ;['bg-white', 'text-ink'].forEach((c) => b.classList.toggle(c, on))
        ;['border', 'border-white/10', 'text-muted', 'hover:text-white'].forEach((c) => b.classList.toggle(c, !on))
      })
      $$('[data-device-panel]').forEach((p) => (p.hidden = p.dataset.devicePanel !== btn.dataset.device))
    }),
  )
})()
