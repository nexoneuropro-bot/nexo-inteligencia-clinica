/** Lista explícita de páginas institucionais elegíveis para indexação.
 * Profissionais e integração médica aguardam conferência de registros/RQE.
 * A editoria só entra no índice fora do modo de prévia, com artigos aprovados.
 * Noindex NÃO é controle de acesso para sistemas com dados pessoais.
 */
export const SEO_INSTITUTIONAL_SLUGS = Object.freeze([
  'para-voce',
  'psicoterapia',
  'avaliacao-neuropsicologica',
  'para-sua-empresa',
  'recrutamento-e-selecao',
  'treinamento-e-desenvolvimento',
  'avaliacao-psicologica-organizacional',
  'riscos-psicossociais-nr1',
  'nossa-abordagem',
  'psicologia-em-pauta',
  'contato',
  'politica-de-privacidade',
]);

export function eligibleInstitutionalSlug(slug,{editorialPreview=false}={}){
  return SEO_INSTITUTIONAL_SLUGS.includes(slug) &&
    (slug!=='psicologia-em-pauta'||!editorialPreview);
}

export const SEO_REQUIRES_HUMAN_APPROVAL = Object.freeze([
  'profissionais',
  'integracao-psiquiatrica',
]);

export function eligibleInstitutionalPaths(pages,{editorialPreview=false}={}){
  return ['/',...pages.filter(page=>eligibleInstitutionalSlug(page.slug,{editorialPreview}))
    .map(page=>`/${page.slug}/`)];
}
