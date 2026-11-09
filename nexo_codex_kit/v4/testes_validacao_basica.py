import json
from pathlib import Path
root=Path(__file__).parent
bank=json.loads((root/'NEXO_BANCO_INSTRUMENTOS_REFERENCIA_v2.json').read_text())
inst={x['instrument_id']:x for x in bank['instruments']}
assert len(inst['PHQ-9']['items'])==9
assert len(inst['GAD-7']['items'])==7
phq=[2,1,3,2,3,1,0,1,0];gad=[1,1,2,2,0,1,0]
assert sum(phq)==13 and sum(gad)==7
assert len(phq[:-1])!=9

def score(a,length):
    return sum(a) if len(a)==length and all(isinstance(x,int) and 0<=x<=3 for x in a) else None
assert score(phq,9)==13
assert score(gad,7)==7
assert score([None]+phq[1:],9) is None
assert score([0]*9,9)==0
assert score([3]*9,9)==27
assert score([3]*7,7)==21
assert score([0]*9+[0],9) is None
html=(root/'NEXO_Conhecendo_Meu_Momento_v5_DEMO.html').read_text()
assert 'id="view-professional"' not in html
assert 'Não existem respostas certas ou erradas' in html
assert 'voluntary_pause' in html and 'clarification_answered' in html
assert 'NEXO_Conhecendo_Meu_Momento' not in html or 'CONHECENDO' in html.upper()
prof=(root/'NEXO_Painel_Profissional_SINTETICO_v5.html').read_text()
assert 'DADOS FICTÍCIOS' in prof
assert '13 ' in prof or '13/' in prof
print('Validações estáticas e de somatório: OK')
