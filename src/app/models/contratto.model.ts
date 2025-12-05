export interface Contratto {
  id?: number;
  codice: string;
  tipologia: string;
  clienteId: number;
  clienteRagioneSociale?: string;
  fornitoreId?: number;
  fornitoreRagioneSociale?: string;
  dataInizio: string;
  dataFine?: string;
  oggetto: string;
  importoTotale?: number;
  valuta?: string;
  stato?: string;
  dataCreazione?: string;
  dataUltimaModifica?: string;
  creatoDaId?: number;
  creatoDaNome?: string;
  allegati?: Allegato[];
  scadenze?: Scadenza[];
}

export interface Allegato {
  id?: number;
  nomeFile: string;
  tipo: string;
  dimensione?: number;
  descrizione?: string;
  dataCaricamento?: string;
  caricatoDaId?: number;
  caricatoDaNome?: string;
  contrattoId?: number;
}

export interface Scadenza {
  id?: number;
  dataScadenza: string;
  importo: number;
  stato: string;
  note?: string;
  dataPagamento?: string;
  contrattoId?: number;
}

export interface Contravention {
  id?: number;
  targa: string;
  societaIntestataria: string;
  nominativoGuidatore?: string;
  mailGuidatore?: string;
  statoVerbale: string;
  dataVerbale: string;
  numeroVerbale: string;
  comuneVerbale?: string;
  dataNotifica: string;
  sedeNotifica?: string;
  giorniScadenza: number;
  importo?: number;
  importoIntegrato?: number;
  verbaleCorrelato?: string;
  dataSpedizioneFinanziario?: string;
  dataPagamentoVerbale?: string;
  giorniRicorso?: number;
  ricorso: boolean;
  dataInvioRicorso?: string;
  decurtazionePunti: boolean;
  dataInvioDecurtazione?: string;
  note?: string;
  pagata: string; // 'Dipend.' ou 'Az.da'
  trattamentoDifferenzaCedolino?: string;
  trattenutaCedolino?: string;
  dataCreazione?: string;
  dataUltimaModifica?: string;
  creatoDaId?: number;
  creatoDaNome?: string;
  allegati?: AllegatoContravention[];
}

export interface AllegatoContravention {
  id?: number;
  nomeFile: string;
  tipo: string;
  dimensione?: number;
  descrizione?: string;
  note?: string;
  numeroVerbale?: string;
  dataCaricamento?: string;
  caricatoDaId?: number;
  caricatoDaNome?: string;
  contraventionId?: number;
  file?: File;
}
