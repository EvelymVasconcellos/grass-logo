// Versão Cloudflare: o pacote completo passa de 25 MB (limite por arquivo do Cloudflare Pages),
// então ele é montado no navegador, com a mesma estrutura de pastas, a partir dos arquivos avulsos.
;(() => {
  const TREE = [["01 Logo Principal", "GRASS_Logo_Principal.png"], ["02 Simbolo", "GRASS_Simbolo.png"], ["03 Cartao de Visita", "GRASS_Cartao_Frente_Verso.pdf"], ["03 Cartao de Visita", "GRASS_Cartao_Frente_Verso_Sangria_3mm.pdf"], ["04 Mockups", "GRASS_Mockup_Bone.jpg"], ["04 Mockups", "GRASS_Mockup_Camiseta.jpg"], ["04 Mockups", "GRASS_Mockup_Camiseta_Modelo.jpg"], ["04 Mockups", "GRASS_Mockup_Cartao_na_Mao.jpg"], ["04 Mockups", "GRASS_Mockup_Cartoes.jpg"], ["04 Mockups", "GRASS_Mockup_Envelope.jpg"], ["04 Mockups", "GRASS_Mockup_Folder.jpg"], ["04 Mockups", "GRASS_Mockup_Mochila_Saco.jpg"], ["04 Mockups", "GRASS_Mockup_Moletom.jpg"], ["04 Mockups", "GRASS_Mockup_Papel_Timbrado_e_Pasta.jpg"], ["04 Mockups", "GRASS_Mockup_Proposta_e_Apolice.jpg"], ["04 Mockups", "GRASS_Mockup_Recepcao.jpg"], ["04 Mockups", "GRASS_Mockup_Sacola_e_Cracha.jpg"], ["04 Mockups", "GRASS_Mockup_Site.jpg"], ["04 Mockups", "GRASS_Mockup_Totem.jpg"], ["04 Mockups", "GRASS_Painel_de_Aplicacoes_1.png"], ["04 Mockups", "GRASS_Painel_de_Aplicacoes_2.png"], ["05 Instagram", "GRASS_Instagram_Foto_de_Perfil.png"], ["05 Instagram", "GRASS_Post_01_Protecao_Completa.png"], ["05 Instagram", "GRASS_Post_02_Nossas_Solucoes.png"], ["05 Instagram", "GRASS_Post_03_Solicite_sua_Cotacao.png"], ["05 Instagram", "GRASS_Post_04_Seguro_Residencial.png"], ["05 Instagram", "GRASS_Post_05_Seguro_de_Vida_1.png"], ["05 Instagram", "GRASS_Post_06_Seguro_de_Vida_2.png"], ["05 Instagram", "GRASS_Post_07_Seguro_de_Vida_3.png"], ["05 Instagram", "GRASS_Post_08_Seguro_Residencial_1.png"], ["05 Instagram", "GRASS_Post_09_Seguro_Residencial_2.png"], ["05 Instagram", "GRASS_Post_10_Seguro_Residencial_3.png"], ["05 Instagram", "GRASS_Post_11_Seguro_Auto_1.png"], ["05 Instagram", "GRASS_Post_12_Seguro_Auto_2.png"], ["05 Instagram", "GRASS_Post_13_Seguro_Auto_3.png"], ["05 Instagram", "GRASS_Post_14_Seguro_Auto_Casal.png"], ["05 Instagram", "GRASS_Post_15_Protecao_Completa_Auto_Casa_Vida.png"], ["05 Instagram", "GRASS_Post_16_Mais_que_Seguros.png"], ["05 Instagram", "GRASS_Post_17_Protecao_para_o_Dia_a_Dia.png"], ["05 Instagram", "GRASS_Post_18_Nossos_Principais_Seguros.png"], ["05 Instagram", "GRASS_Post_19_Atendimento_Humano.png"], ["05 Instagram", "GRASS_Post_20_Seguro_Auto.png"], ["05 Instagram", "GRASS_Post_21_Seguro_Residencial.png"], ["05 Instagram", "GRASS_Post_22_Por_que_Ter_um_Seguro.png"], ["05 Instagram", "GRASS_Post_23_Seguro_Empresarial.png"], ["05 Instagram", "GRASS_Post_24_Fale_Conosco.png"], ["05 Instagram", "GRASS_Story_01_Site_de_Cara_Nova.png"], ["06 Documentacao", "Inventario.txt"], ["06 Documentacao", "LEIA-ME.txt"]]
  const toast = document.getElementById('toast')
  const say = (m, ms = 2600) => {
    toast.textContent = m
    toast.hidden = false
    clearTimeout(say.t)
    say.t = setTimeout(() => (toast.hidden = true), ms)
  }
  let busy = false
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('a[download]')
    if (!a || !a.getAttribute('href').endsWith('.zip')) return
    e.preventDefault()
    if (busy) return say('O pacote ainda está sendo preparado…')
    busy = true
    say('Preparando o pacote completo (cerca de 54 MB)…', 60000)
    try {
      const zip = new JSZip()
      const root = zip.folder('GRASS_Brand_Delivery')
      await Promise.all(
        TREE.map(async ([dir, file]) => {
          const r = await fetch('/clients/grass/files/' + encodeURIComponent(file))
          if (!r.ok) throw new Error(r.status)
          root.folder(dir).file(file, await r.blob())
        }),
      )
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const link = Object.assign(document.createElement('a'), { href: url, download: 'GRASS_Brand_Delivery.zip' })
      document.body.append(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60000)
      say('Download iniciado: GRASS_Brand_Delivery.zip')
    } catch {
      say('Não foi possível preparar o pacote. Tente de novo.')
    } finally {
      busy = false
    }
  })
})()
