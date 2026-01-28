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
  numVerbale: string; // Clé primaire
  dataVerbale?: string;
  dataNotifica?: string;
  ggScadenza?: number;
  targa?: string;
  guidatore?: string;
  emailGuidatore?: string;
  societaIntestataria?: string;
  sedeNotifica?: string;
  comuneVerbale?: string;
  importo?: number;
  importoIntegrato?: number;
  dataSpediziFinanz?: string;
  dataPagamentoVerb?: string;
  pagatoAziendaDipendente?: boolean;
  ricorso?: boolean;
  decurtaPunti?: boolean;
  mmyyyyTrattenutaCedolino?: string;
  mmyyyyTrattenutaDiffMultaCedolino?: string;
  idStatoPratica?: number;
  ggRicorso?: number;
  numVerbaleCorrelato?: string;
  dataInvioRicorso?: string;
  dataInvioDecurtazione?: string;
  note?: string;
  exSocietaIntestataria?: string;
  files?: FileContrevention[];
}

export interface FileContrevention {
  id?: number; // idCorrelato
  numVerbale: string;
  elemento?: string;
  tipo?: string;
  data?: string;
  testo1?: string;
  testo2?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  file?: File; // Pour l'upload depuis le frontend
}

// Ancienne interface pour compatibilité (à supprimer progressivement)
export interface AllegatoContravention {
  id?: number; // idCorrelato
  numVerbale: string;
  elemento?: string;
  tipo?: string;
  data?: string;
  testo1?: string;
  testo2?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  file?: File;
}
